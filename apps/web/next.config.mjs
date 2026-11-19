/**
 * En-têtes de sécurité (plan §15.1 et étape 8.3).
 * Pas de Content-Security-Policy stricte pour l'instant : le widget FeexPay charge son propre code ;
 * elle sera ajoutée après test du parcours de paiement réel.
 */
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Caméra : uniquement pour le contrôle des billets (admin), sur notre propre domaine.
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(), payment=(self)' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@ona/core'],
  poweredByHeader: false,
  images: { remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }] },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
export default nextConfig;
