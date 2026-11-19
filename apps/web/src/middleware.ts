import { NextResponse, type NextRequest } from 'next/server';

/**
 * Étape 6.4. Français sans préfixe : /consultations est servi par la route /fr/consultations (réécriture interne).
 * /en/… et /yo/… sont servis directement. /fr/… redirige vers l'adresse sans préfixe (adresse canonique).
 */
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const seg = pathname.split('/')[1];

  if (seg === 'fr') {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(3) || '/';
    return NextResponse.redirect(url, 308);
  }
  if (seg === 'en' || seg === 'yo') return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/fr${pathname === '/' ? '' : pathname}`;
  url.search = search;
  return NextResponse.rewrite(url);
}

export const config = {
  // Hors vitrine : espace client, admin, catalogue interne, fichiers techniques et statiques.
  matcher: ['/((?!_next|api|admin|espace|design|icon|apple-icon|manifest\\.webmanifest|robots\\.txt|sitemap\\.xml|favicon\\.ico|.*\\.[a-zA-Z0-9]+$).*)'],
};
