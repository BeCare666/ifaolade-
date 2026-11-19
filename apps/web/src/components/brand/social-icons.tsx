'use client';

import { Mail } from 'lucide-react';
import { siFacebook, siInstagram, siTiktok, siWhatsapp, siX, siYoutube, type SimpleIcon } from 'simple-icons';
import { cn } from '@/lib/cn';
import { useSiteData } from '@/lib/site-data';

/*
 * Réseaux sociaux (REFONTE §1.4) : formes officielles des marques (Simple Icons, licence CC0),
 * dans des pastilles rondes. Une icône n'apparaît que si son lien est renseigné dans l'admin.
 */
const NETWORKS: { key: string; icon: SimpleIcon; label: string }[] = [
  { key: 'social.facebook', icon: siFacebook, label: 'Facebook' },
  { key: 'social.instagram', icon: siInstagram, label: 'Instagram' },
  { key: 'social.youtube', icon: siYoutube, label: 'YouTube' },
  { key: 'social.tiktok', icon: siTiktok, label: 'TikTok' },
  { key: 'social.x', icon: siX, label: 'X' },
];

export const whatsappHref = (n?: string | number) => (typeof n === 'string' && n ? `https://wa.me/${n.replace(/\D/g, '')}` : null);

export function BrandIcon({ icon, size = 16 }: { icon: SimpleIcon; size?: number }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden><path d={icon.path} /></svg>;
}

export function SocialLinks({ tone = 'light', className, withContact = true }: { tone?: 'light' | 'dark'; className?: string; withContact?: boolean }) {
  const { settings } = useSiteData();
  const links = NETWORKS.filter((n) => typeof settings[n.key] === 'string' && settings[n.key]);
  const wa = withContact ? whatsappHref(settings['contact.whatsapp']) : null;
  const email = withContact && typeof settings['contact.email'] === 'string' && settings['contact.email'] ? `mailto:${settings['contact.email']}` : null;
  if (!links.length && !wa && !email) return null;
  const pill = cn(
    'grid h-10 w-10 place-items-center rounded-full border transition-colors duration-200',
    tone === 'dark' ? 'border-kaolin/20 text-kaolin/80 hover:border-kaolin hover:bg-kaolin hover:text-night' : 'border-border-strong text-text-muted hover:border-primary hover:bg-primary hover:text-primary-foreground',
  );
  return (
    <ul className={cn('flex flex-wrap gap-2', className)}>
      {links.map((n) => (
        <li key={n.key}><a href={String(settings[n.key])} target="_blank" rel="noopener noreferrer" aria-label={n.label} className={pill}><BrandIcon icon={n.icon} /></a></li>
      ))}
      {wa && <li><a href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className={pill}><BrandIcon icon={siWhatsapp} /></a></li>}
      {email && <li><a href={email} aria-label="Email" className={pill}><Mail size={16} strokeWidth={1.8} /></a></li>}
    </ul>
  );
}
