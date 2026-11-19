'use client';

import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

/** QR code du billet (plan §10.7), en SVG, encre sur kaolin. Contient uniquement le code du billet. */
export function TicketQr({ code, size = 180 }: { code: string; size?: number }) {
  const [svg, setSvg] = useState<string | null>(null);
  useEffect(() => {
    QRCode.toString(code, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#17150F', light: '#FFFFFF' } })
      .then(setSvg)
      .catch(() => setSvg(null));
  }, [code]);
  if (!svg) return <div style={{ width: size, height: size }} className="animate-pulse rounded-[var(--radius-md)] bg-bg-subtle" aria-hidden />;
  // SVG produit localement par la bibliothèque qrcode à partir du seul code : aucun contenu externe.
  return <div role="img" aria-label={`QR code du billet ${code}`} style={{ width: size, height: size }} className="overflow-hidden rounded-[var(--radius-md)] bg-white" dangerouslySetInnerHTML={{ __html: svg }} />;
}
