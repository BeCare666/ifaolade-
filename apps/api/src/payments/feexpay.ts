import { HttpException, HttpStatus, ServiceUnavailableException } from '@nestjs/common';

/**
 * Vérification serveur d'un paiement FeexPay — même méthode que E.doto (éprouvée en production).
 *   GET {FEEXPAY_API_BASE}/api/transactions/public/single/status/{reference}
 *   Authorization: Bearer <FEEXPAY_API_KEY>
 *   Réponse : { reference, amount, status: SUCCESSFUL | FAILED | PENDING, … }
 */
export const FEEXPAY_API_BASE = 'https://api-v2.feexpay.me';
const REFERENCE_RE = /^[A-Za-z0-9-]{8,64}$/;

export interface FeexPayTransaction { reference: string; amount: number; status: string }

export const paymentRefused = (message: string) =>
  new HttpException({ statusCode: 402, error: 'PAYMENT_NOT_CONFIRMED', message }, HttpStatus.PAYMENT_REQUIRED);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchFeexPayTransaction(reference: string): Promise<FeexPayTransaction> {
  const ref = String(reference ?? '').trim();
  if (!REFERENCE_RE.test(ref)) throw paymentRefused('Référence de paiement FeexPay invalide.');
  const key = process.env.FEEXPAY_API_KEY;
  if (!key) throw new ServiceUnavailableException('Vérification des paiements indisponible pour le moment.');
  const base = (process.env.FEEXPAY_API_BASE || FEEXPAY_API_BASE).replace(/\/+$/, '');

  let last: { reference?: string; amount?: number; status?: string } | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    let res: Response;
    try {
      res = await fetch(`${base}/api/transactions/public/single/status/${encodeURIComponent(ref)}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw new ServiceUnavailableException('FeexPay ne répond pas : le paiement sera vérifié plus tard. Ne repaie pas.');
    }
    if (res.status === 404) throw paymentRefused('Transaction introuvable chez FeexPay.');
    if (!res.ok) throw new ServiceUnavailableException('FeexPay ne répond pas : le paiement sera vérifié plus tard. Ne repaie pas.');
    last = await res.json().catch(() => null);
    if (String(last?.status || '').toUpperCase() !== 'PENDING') break;
    if (attempt < 2) await sleep(2000);
  }
  return {
    reference: String(last?.reference || ''),
    amount: Number(last?.amount),
    status: String(last?.status || '').toUpperCase(),
  };
}
