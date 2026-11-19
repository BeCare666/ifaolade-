'use client';

import { Download, Share, SquarePlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/client';
import { Container, SectionIntro } from './editorial';

interface PromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

/** Section 12 de l'accueil (plan §7.1, étape 8.4) : installer l'application, Android et iPhone. Comme sur edoto. */
export function InstallSection() {
  const { d } = useI18n();
  const t = d.install;
  const [prompt, setPrompt] = useState<PromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    setInstalled(window.matchMedia('(display-mode: standalone)').matches);
    const onPrompt = (e: Event) => { e.preventDefault(); setPrompt(e as PromptEvent); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  if (installed) return null;
  const icons = [Share, SquarePlus, null];
  return (
    <section className="border-t border-border">
      <Container className="grid items-center gap-10 py-20 lg:grid-cols-2 lg:gap-24">
        <SectionIntro overline={t.overline} title={t.title} text={t.text} />
        <div className="rounded-[var(--radius-photo)] border border-border bg-surface p-8">
          {prompt ? (
            <Button size="lg" onClick={async () => { await prompt.prompt(); setPrompt(null); }}><Download size={17} /> {t.button}</Button>
          ) : ios ? (
            <ol className="space-y-4 text-[15px] text-text">
              {t.ios.map((s, i) => {
                const I = icons[i];
                return <li key={s} className="flex items-center gap-3"><span className="text-[12px] font-medium tabular-nums text-accent">0{i + 1}</span>{I && <I size={17} className="text-text-muted" />}{s}</li>;
              })}
            </ol>
          ) : (
            <p className="text-[15px] leading-[1.8] text-text-muted">{t.other}</p>
          )}
        </div>
      </Container>
    </section>
  );
}
