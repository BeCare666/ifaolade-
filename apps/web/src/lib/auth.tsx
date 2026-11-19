'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { apiSend, setRefresher } from './api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  country: string | null;
  city?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
  role: 'CLIENT' | 'PRIEST' | 'ADMIN';
  emailVerified: boolean;
}

interface Session { token: string; user: User }

interface AuthState {
  user: User | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<Session>;
  register: (dto: { email: string; password: string; firstName: string; lastName?: string; country?: string }) => Promise<Session>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Session (étape 2.2). Le jeton d'accès (15 min) reste en MÉMOIRE, jamais dans le stockage du navigateur.
 * Le renouvellement passe par un cookie httpOnly posé par l'API, illisible par le JavaScript de la page.
 */
const Ctx = createContext<AuthState | null>(null);
const LEGACY_KEY = 'ifaolade:token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const pending = useRef<Promise<string | null> | null>(null);

  /** Un seul renouvellement à la fois, même si plusieurs appels expirent ensemble. */
  const renew = useCallback((): Promise<string | null> => {
    if (!pending.current) {
      pending.current = apiSend<Session>('/auth/refresh', {}, 'POST')
        .then((s) => { setToken(s.token); setUser(s.user); return s.token; })
        .catch(() => { setToken(null); setUser(null); return null; })
        .finally(() => { pending.current = null; });
    }
    return pending.current;
  }, []);

  useEffect(() => {
    try { localStorage.removeItem(LEGACY_KEY); } catch { /* ancien stockage */ }
    setRefresher(renew);
    renew().finally(() => setReady(true));
    const t = setInterval(() => { if (pending.current === null) void renew(); }, 12 * 60_000);
    return () => { clearInterval(t); setRefresher(null); };
  }, [renew]);

  const value = useMemo<AuthState>(() => ({
    user, token, ready,
    async login(email, password) {
      const s = await apiSend<Session>('/auth/login', { email, password });
      setToken(s.token); setUser(s.user);
      return s;
    },
    async register(dto) {
      const s = await apiSend<Session>('/auth/register', { ...dto, acceptCgu: true });
      setToken(s.token); setUser(s.user);
      return s;
    },
    async logout() {
      await apiSend('/auth/logout', {}, 'POST').catch(() => undefined);
      setToken(null); setUser(null);
    },
    async refresh() {
      if (!token) return;
      try { setUser(await apiSend<User>('/me', undefined, 'GET', token)); } catch { /* la session se renouvellera */ }
    },
  }), [user, token, ready]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth hors AuthProvider');
  return v;
}

/** N'accepte que des chemins internes (pas de redirection ouverte). */
export const safeNext = (n?: string | null, fallback = '/espace') => (n && n.startsWith('/') && !n.startsWith('//') ? n : fallback);
