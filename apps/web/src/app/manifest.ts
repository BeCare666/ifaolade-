import type { MetadataRoute } from 'next';

/** Application installable (plan étape 8.4), comme sur edoto. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ifaôladé',
    short_name: 'Ifaôladé',
    description: "La vérité d'Ifá, sans peur et sans mensonge. Portrait, consultations, dossier spirituel.",
    start_url: '/espace',
    scope: '/',
    display: 'standalone',
    background_color: '#FAF8F4',
    theme_color: '#1F2A44',
    lang: 'fr',
    icons: [
      { src: '/icon', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
