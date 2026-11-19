'use client';

import { Camera, CheckCircle2, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { apiSend } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Check { valid: boolean; alreadyIn: boolean; checkedInAt: string | null; seats: number; event: { title: string }; user: { firstName: string; lastName: string | null } }

interface Detector { detect: (src: HTMLVideoElement) => Promise<{ rawValue: string }[]> }
declare global { interface Window { BarcodeDetector?: new (o: { formats: string[] }) => Detector } }

/**
 * Contrôle à l'entrée sur mobile (plan §10.7). Caméra + BarcodeDetector (natif sur Chrome Android) ;
 * sinon, saisie du code. Puis « Enregistrer l'entrée » : un billet ne sert qu'une fois (vérifié par l'API).
 */
export function TicketScanner() {
  const { token } = useAuth();
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [code, setCode] = useState('');
  const [check, setCheck] = useState<Check | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [canScan, setCanScan] = useState(false);
  useEffect(() => setCanScan(!!window.BarcodeDetector && !!navigator.mediaDevices), []);

  const stop = () => { stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null; setScanning(false); };
  useEffect(() => stop, []);

  async function lookup(c: string) {
    setCheck(null); setError(null); setDone(false);
    try { setCheck(await apiSend<Check>(`/admin/registrations/${encodeURIComponent(c.trim())}/check`, undefined, 'GET', token)); }
    catch (e) { setError((e as Error).message); }
  }

  async function scan() {
    setError(null);
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setScanning(true);
      const v = video.current!;
      v.srcObject = stream.current;
      await v.play();
      const detector = new window.BarcodeDetector!({ formats: ['qr_code'] });
      const loop = async () => {
        if (!stream.current) return;
        const found = await detector.detect(v).catch(() => []);
        if (found[0]?.rawValue) { const c = found[0].rawValue; setCode(c); stop(); lookup(c); return; }
        requestAnimationFrame(loop);
      };
      loop();
    } catch {
      stop();
      setError("La caméra n'est pas accessible. Saisis le code du billet.");
    }
  }

  return (
    <div className="space-y-4">
      {/* Une seule balise vidéo, toujours montée : la caméra s'y attache avant l'affichage. */}
      <video ref={video} playsInline muted className={scanning ? 'aspect-square w-full rounded-[var(--radius-md)] bg-black object-cover' : 'hidden'} />
      {canScan && (scanning
        ? <Button variant="secondary" size="sm" shape="console" onClick={stop}>Arrêter la caméra</Button>
        : <Button shape="console" onClick={scan}><Camera size={16} /> Scanner le QR code</Button>)}
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (code.trim()) lookup(code); }}>
        <Field label="Code du billet" htmlFor="code"><Input id="code" value={code} onChange={(e) => setCode(e.target.value)} /></Field>
        <Button type="submit" variant="secondary" size="sm" shape="console" disabled={!code.trim()}>Vérifier</Button>
      </form>
      {error && <p className="text-[14px] text-danger">{error}</p>}
      {check && (
        <div className={`rounded-[var(--radius-md)] p-4 ${check.valid && !check.alreadyIn && !done ? 'bg-success-soft' : done ? 'bg-success-soft' : 'bg-danger-soft'}`}>
          <p className={`flex items-center gap-2 text-[16px] font-medium ${check.valid && !check.alreadyIn ? 'text-success' : done ? 'text-success' : 'text-danger'}`}>
            {(check.valid && !check.alreadyIn) || done ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            {done ? 'Entrée enregistrée' : !check.valid ? 'Billet non payé ou annulé' : check.alreadyIn ? 'Billet déjà utilisé' : 'Billet valide'}
          </p>
          <p className="mt-1 text-[14px] text-text">{check.user.firstName} {check.user.lastName} · {check.seats} place(s) · {check.event.title}</p>
          {check.alreadyIn && check.checkedInAt && <p className="mt-1 text-[13px] text-text-muted">Entré le {new Date(check.checkedInAt).toLocaleString('fr-FR', { timeZone: 'Africa/Porto-Novo' })}</p>}
          {check.valid && !check.alreadyIn && !done && (
            <Button className="mt-4" shape="console" loading={busy} onClick={async () => {
              setBusy(true);
              try { await apiSend(`/admin/registrations/${encodeURIComponent(code.trim())}/checkin`, {}, 'POST', token); setDone(true); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
            }}>Enregistrer l&apos;entrée</Button>
          )}
        </div>
      )}
    </div>
  );
}
