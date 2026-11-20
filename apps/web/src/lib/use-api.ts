'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiSend } from './api';
import { useAuth } from './auth';

/** Lecture authentifiée côté navigateur, avec états chargement / erreur / rechargement. */
export function useApi<T>(path: string | null) {
  const { token, ready } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!path || !ready) return;
    setLoading(true);
    try {
      setData(await apiSend<T>(path, undefined, 'GET', token));
      setError(null);
      setStatus(200);
    } catch (e) {
      setError((e as Error).message);
      setStatus((e as { status?: number }).status ?? 0);
    } finally {
      setLoading(false);
    }
  }, [path, token, ready]);

  useEffect(() => { load(); }, [load]);
  return { data, error, status, loading, reload: load, setData };
}

/** Redirige vers la connexion si l'utilisateur n'est pas connecté (ou n'a pas le rôle demandé). */
export function useRequireAuth(next: string, staff = false) {
  const { user, ready } = useAuth();
  const allowed = !!user && (!staff || user.role === 'ADMIN' || user.role === 'PRIEST');
  useEffect(() => {
    // Le prêtre et l'administration se connectent par la console (/console), les clients par /connexion.
    if (ready && !user) window.location.replace(`${staff ? '/console' : '/connexion'}?suite=${encodeURIComponent(next)}`);
  }, [ready, user, next, staff]);
  return { ready: ready && !!user, allowed, user };
}
