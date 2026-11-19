import { positionName, type Odu } from '@ona/core';
import { getDict, type Lang } from '@/i18n';
import { cn } from '@/lib/cn';

const COLORS: Record<string, string> = { fire: 'bg-fire', air: 'bg-air', water: 'bg-water', earth: 'bg-earth' };

/** Les 4 positions d'une jambe (Iná, Afẹ́fẹ́, Omi, Ilẹ̀) : 0, 1 ou 2 marques actives (plan §11.1). Libellés modifiables dans l'admin (REFONTE §8.5). */
export function OduElements({ elements, lang = 'fr', labels }: { elements: Odu['elements']; lang?: Lang; labels?: { manifest?: string; balance?: string; latent?: string } }) {
  const base = getDict(lang).odu;
  const d = { manifest: labels?.manifest || base.manifest, balance: labels?.balance || base.balance, latent: labels?.latent || base.latent };
  return (
    <div className="space-y-3">
      {elements.map((e) => (
        <div key={e.key} className="grid grid-cols-[110px_minmax(0,1fr)_auto] items-center gap-4">
          <div>
            <p className="text-[14px] text-text">{e.yoruba}</p>
            {lang !== 'yo' && <p className="text-[12px] text-text-faint">{positionName(e.key as 'fire', lang)}</p>}
          </div>
          <div className="flex gap-1.5">
            {[0, 1].map((i) => <span key={i} className={cn('h-1.5 flex-1 rounded-full', i < e.active ? COLORS[e.key] : 'bg-bg-subtle')} />)}
          </div>
          <span className="w-28 text-right text-[12px] text-text-muted">{e.active === 2 ? d.manifest : e.active === 1 ? d.balance : d.latent}</span>
        </div>
      ))}
    </div>
  );
}
