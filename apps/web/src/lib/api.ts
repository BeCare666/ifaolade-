export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

/**
 * Lecture côté serveur pour la vitrine. Ne lève jamais d'exception : renvoie null si l'API est injoignable,
 * pour que chaque page affiche un état vide propre au lieu de planter.
 */
export async function apiGet<T>(path: string, revalidate = 60): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/**
 * Étape 2.2 : quand un jeton d'accès (15 min) expire, la session le renouvelle une fois via le cookie httpOnly,
 * puis l'appel est rejoué. Le fournisseur de session enregistre ici sa fonction de renouvellement.
 */
let refresher: (() => Promise<string | null>) | null = null;
export const setRefresher = (fn: typeof refresher) => { refresher = fn; };

async function raw(path: string, body: unknown, method: string, token?: string | null) {
  try {
    return await fetch(`${API_URL}${path}`, {
      method,
      credentials: 'include', // nécessaire pour le cookie de renouvellement
      headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'Connexion impossible. Vérifie ta connexion internet et réessaie.');
  }
}

/** Appel côté navigateur. */
export async function apiSend<T>(path: string, body: unknown, method = 'POST', token?: string | null): Promise<T> {
  let res = await raw(path, body, method, token);
  if (res.status === 401 && token && refresher && !path.startsWith('/auth/')) {
    const fresh = await refresher();
    if (fresh) res = await raw(path, body, method, fresh);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray(data?.message) ? data.message[0] : data?.message;
    throw new ApiError(res.status, msg || 'Une erreur est survenue.');
  }
  return data as T;
}
