import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { ToastProvider } from '@/components/ui/toast';
import { apiGet } from '@/lib/api';
import { AuthProvider } from '@/lib/auth';
import './globals.css';

// Diacritiques yoruba (plan §6.3, REFONTE §1.3) : latin-ext (ṣ, ń) + vietnamese (ọ, ẹ et accents combinés ̀ ́ ̣).
const inter = Inter({ subsets: ['latin', 'latin-ext', 'vietnamese'], variable: '--font-inter', display: 'swap' });
const display = Cormorant_Garamond({ subsets: ['latin', 'latin-ext', 'vietnamese'], weight: ['500', '600'], variable: '--font-cormorant', display: 'swap' });

const site = process.env.NEXT_PUBLIC_SITE_NAME || 'Ifaôladé';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ifaolade.com'),
  applicationName: 'Ifaôladé',
  openGraph: { siteName: 'Ifaôladé', locale: 'fr_FR', type: 'website' },
  title: { default: `${site} · La vérité d'Ifá, sans peur et sans mensonge`, template: `%s · ${site}` },
  description:
    "Consultations d'Ifá transparentes : prix affichés, Odu expliqué par écrit, ebo détaillé et prouvé, suivi J+7, J+30, J+90. Découvre qui tu es, gratuitement.",
};

const ALLOWED_FONTS = ['Inter', 'Manrope', 'DM Sans', 'Work Sans', 'IBM Plex Sans', 'Source Sans 3', 'Nunito Sans', 'Poppins'];

/** Police choisie dans Admin › Paramètres (comme edoto). Inter, intégrée au site, reste la police de secours. */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await apiGet<{ 'site.font'?: string }>('/settings/public', 300);
  const font = settings?.['site.font'];
  const custom = font && font !== 'Inter' && ALLOWED_FONTS.includes(font) ? font : null;
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${display.variable}`}
      style={custom ? ({ '--font-sans': `'${custom}', var(--font-inter), Arial, sans-serif` } as React.CSSProperties) : undefined}
    >
      {custom && (
        <head>
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(custom)}:wght@400;500;600&subset=latin-ext&display=swap`} />
        </head>
      )}
      <body className="min-h-screen">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
