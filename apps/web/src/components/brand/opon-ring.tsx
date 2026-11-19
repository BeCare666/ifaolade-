import { cn } from '@/lib/cn';

/** Couronne crantée d'ọpọ́n (16 encoches) autour d'un contenu rond : photo du prêtre, avatar, grand chiffre. */
export function OponRing({ children, className, tone = 'ink' }: { children: React.ReactNode; className?: string; tone?: 'ink' | 'kaolin' }) {
  const color = tone === 'kaolin' ? '#FAF8F4' : 'var(--color-primary)';
  return (
    <span className={cn('relative inline-grid place-items-center', className)}>
      <svg aria-hidden viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full">
        <circle cx="50" cy="50" r="48.5" fill="none" stroke={color} strokeWidth="1" opacity="0.7" />
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i * Math.PI * 2) / 16 - Math.PI / 2;
          const x = 50 + Math.cos(a) * 48.5;
          const y = 50 + Math.sin(a) * 48.5;
          return i === 0
            ? <circle key={i} cx={x} cy={y} r="2.2" fill="#9E3B26" />
            : <rect key={i} x={x - 1.3} y={y - 1.3} width="2.6" height="2.6" fill={color} transform={`rotate(${i * 22.5 + 45} ${x} ${y})`} />;
        })}
      </svg>
      <span className="relative h-[86%] w-[86%] overflow-hidden rounded-full">{children}</span>
    </span>
  );
}
