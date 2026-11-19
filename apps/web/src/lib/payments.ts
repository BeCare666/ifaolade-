'use client';

import { apiSend } from './api';

export type Purpose = 'CONSULTATION' | 'EBO' | 'BOOKING' | 'EVENT';
export type Provider = 'STRIPE' | 'FEEXPAY';

interface CheckoutResult {
  paymentId: string;
  provider: Provider;
  url?: string | null;
  dev?: boolean;
  amountXof?: number;
  description?: string;
}

declare global {
  interface Window {
    FeexPayButton?: { init: (containerId: string, options: Record<string, unknown>) => void };
  }
}

const FEEX_TOKEN = process.env.NEXT_PUBLIC_FEEXPAY_PUBLIC_KEY;
const FEEX_SHOP = process.env.NEXT_PUBLIC_FEEXPAY_SHOP_ID;
const FEEX_SDK = 'https://api-v2.feexpay.me/feexpay-javascript-sdk/index.js';

function loadFeexPay(): Promise<void> {
  if (window.FeexPayButton) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = FEEX_SDK;
    s.async = true;
    s.onload = () => (window.FeexPayButton ? resolve() : reject(new Error('Le module FeexPay ne s’est pas chargé.')));
    s.onerror = () => reject(new Error('Le module FeexPay est injoignable.'));
    document.body.appendChild(s);
  });
}

/**
 * Lance un paiement (plan §14.4). Stripe : redirection vers Checkout.
 * FeexPay : widget officiel (SDK v2, même méthode qu'edoto), puis vérification par le serveur.
 * Hors production et sans clés : paiement simulé (page de résultat avec bouton de test).
 * Le paiement n'est JAMAIS validé par le navigateur : seul le serveur le confirme.
 */
export async function startPayment(purpose: Purpose, refId: string, provider: Provider, token: string | null): Promise<void> {
  const r = await apiSend<CheckoutResult>('/payments/checkout', { purpose, refId, provider }, 'POST', token);
  if (r.url) {
    window.location.href = r.url;
    return;
  }
  if (r.provider !== 'FEEXPAY' || !r.amountXof) throw new Error('Réponse de paiement inattendue.');
  if (!FEEX_TOKEN || !FEEX_SHOP) throw new Error('Le paiement Mobile Money est momentanément indisponible. Choisis la carte bancaire.');

  await loadFeexPay();
  const container = document.createElement('div');
  container.id = 'feexpay-render';
  container.className = 'feexpay-overlay';
  document.body.appendChild(container);

  window.FeexPayButton!.init('feexpay-render', {
    token: FEEX_TOKEN,
    id: FEEX_SHOP,
    amount: r.amountXof,
    custom_id: r.paymentId,
    description: r.description,
    mode: 'LIVE',
    currency: 'XOF',
    callback: async (response: { status?: string; transaction_id?: string; reference?: string }) => {
      container.remove();
      const reference = response?.transaction_id || response?.reference;
      if (reference) {
        await apiSend(`/payments/${r.paymentId}/feexpay`, { reference }, 'POST', token).catch(() => undefined);
      }
      window.location.href = `/paiement/resultat?pid=${r.paymentId}`;
    },
  });
}
