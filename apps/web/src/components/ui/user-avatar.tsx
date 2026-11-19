import { cn } from '@/lib/cn';

/**
 * Avatar rond (REFONTE §7) : la photo de la personne, sinon ses initiales en Cormorant.
 * Anneau kaolin + liseré indigo pour se détacher sur tous les fonds.
 */
export function UserAvatar({ name, src, size = 36, className }: { name: string; src?: string | null; size?: number; className?: string }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || '·';
  return (
    <span
      className={cn('relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-primary text-primary-foreground ring-2 ring-kaolin outline outline-1 outline-primary/25', className)}
      style={{ width: size, height: size }}
    >
      {src
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={src} alt="" className="h-full w-full object-cover" width={size} height={size} />
        : <span className="font-display font-semibold leading-none" style={{ fontSize: size * 0.42 }}>{initials}</span>}
    </span>
  );
}
