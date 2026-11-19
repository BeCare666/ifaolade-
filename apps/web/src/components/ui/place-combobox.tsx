'use client';

import { Loader2, MapPin } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useI18n } from '@/i18n/client';
import { cn } from '@/lib/cn';
import { Input } from './field';

export interface Place {
  label: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface GeoResult {
  id: number; name: string; latitude: number; longitude: number; timezone: string;
  country?: string; admin1?: string;
}

/**
 * Lieu de naissance (plan §10.1). Recherche Open-Meteo Geocoding : gratuit, sans clé, renvoie lat/lon ET fuseau IANA.
 * Seul le nom tapé est envoyé (aucune donnée personnelle).
 */
export function PlaceCombobox({ value, onChange, id }: { value: Place | null; onChange: (p: Place | null) => void; id?: string }) {
  const { lang, d } = useI18n();
  const geoLang = lang === 'en' ? 'en' : 'fr'; // noms de lieux en anglais ou en français : le yoruba n'est pas garanti par Open-Meteo
  const listId = useId();
  const [q, setQ] = useState(value?.label ?? '');
  const [items, setItems] = useState<GeoResult[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (value && q === value.label) return;
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2) { setItems([]); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      setFailed(false);
      try {
        const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q.trim())}&count=7&language=${geoLang}&format=json`);
        const data = await r.json();
        setItems((data.results ?? []) as GeoResult[]);
        setActive(0);
        setOpen(true);
      } catch {
        setFailed(true);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [q, value]);

  const pick = (g: GeoResult) => {
    const label = [g.name, g.admin1 && g.admin1 !== g.name ? g.admin1 : null, g.country].filter(Boolean).join(', ');
    onChange({ label, latitude: g.latitude, longitude: g.longitude, timezone: g.timezone });
    setQ(label);
    setOpen(false);
  };

  return (
    <div className="relative">
      <MapPin size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint" />
      <Input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        className="pl-10 pr-10"
        placeholder={d.place.placeholder}
        value={q}
        onChange={(e) => { setQ(e.target.value); if (value) onChange(null); }}
        onFocus={() => items.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (!open || !items.length) return;
          if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, items.length - 1)); }
          if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
          if (e.key === 'Enter') { e.preventDefault(); pick(items[active]); }
          if (e.key === 'Escape') setOpen(false);
        }}
      />
      {loading && <Loader2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-text-faint" />}
      {open && (
        <ul id={listId} role="listbox" className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-[var(--radius-md)] border border-border bg-surface py-1 shadow-[var(--shadow-elevated)]">
          {items.length ? items.map((g, i) => (
            <li
              key={g.id} role="option" aria-selected={i === active}
              onMouseDown={(e) => { e.preventDefault(); pick(g); }}
              onMouseEnter={() => setActive(i)}
              className={cn('cursor-pointer px-4 py-2.5', i === active && 'bg-bg-subtle')}
            >
              <span className="block text-[14px] text-text">{g.name}</span>
              <span className="block text-[12px] text-text-faint">{[g.admin1, g.country].filter(Boolean).join(', ')}</span>
            </li>
          )) : <li className="px-4 py-3 text-[13px] text-text-muted">{d.place.noResult}</li>}
        </ul>
      )}
      {failed && <p className="mt-2 text-[12px] text-danger">{d.place.failed}</p>}
      {value && <p className="mt-2 text-[12px] tabular-nums text-text-faint">{value.latitude.toFixed(2)}°, {value.longitude.toFixed(2)}° · {d.place.tz.replace('{tz}', value.timezone)}</p>}
    </div>
  );
}
