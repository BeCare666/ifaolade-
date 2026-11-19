export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

export const eur = (cents: number, currency = 'EUR') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: cents % 100 === 0 ? 0 : 2 }).format(cents / 100);

export const fcfa = (cents: number, rate = 655.957) =>
  `${new Intl.NumberFormat('fr-FR').format(Math.round((cents / 100) * rate))} FCFA`;
