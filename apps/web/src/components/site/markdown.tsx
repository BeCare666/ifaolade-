import Link from 'next/link';
import { Fragment } from 'react';

/**
 * Rendu Markdown minimal et SÛR (aucun HTML injecté) : titres ##/###, paragraphes, listes - et 1.,
 * citations >, **gras**, *italique*, [liens](url). Suffisant pour les enseignements et les Odu.
 */
function inline(text: string, keyBase: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    const k = `${keyBase}-${i++}`;
    if (t.startsWith('**')) out.push(<strong key={k} className="font-medium text-text">{t.slice(2, -2)}</strong>);
    else if (t.startsWith('[')) {
      const [, label, url] = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(t)!;
      const safe = /^(https?:\/\/|\/)/.test(url) ? url : '#';
      out.push(safe.startsWith('/')
        ? <Link key={k} href={safe} className="text-primary underline underline-offset-4">{label}</Link>
        : <a key={k} href={safe} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">{label}</a>);
    } else out.push(<em key={k}>{t.slice(1, -1)}</em>);
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source }: { source: string }) {
  const blocks = source.replace(/\r\n/g, '\n').split(/\n{2,}/);
  return (
    <div className="space-y-6 text-[16px] leading-[1.85] text-text-muted">
      {blocks.map((b, bi) => {
        const block = b.trim();
        if (!block) return null;
        if (block.startsWith('### ')) return <h3 key={bi} className="pt-2 text-[20px] tracking-[-0.01em] text-text">{inline(block.slice(4), `h${bi}`)}</h3>;
        if (block.startsWith('## ')) return <h2 key={bi} className="pt-4 text-[26px] tracking-[-0.02em] text-text">{inline(block.slice(3), `h${bi}`)}</h2>;
        const lines = block.split('\n');
        if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
          return <ul key={bi} className="list-disc space-y-2 pl-5 marker:text-text-faint">{lines.map((l, li) => <li key={li}>{inline(l.replace(/^\s*[-*]\s+/, ''), `u${bi}${li}`)}</li>)}</ul>;
        }
        if (lines.every((l) => /^\s*\d+\.\s+/.test(l))) {
          return <ol key={bi} className="list-decimal space-y-2 pl-5 marker:text-text-faint">{lines.map((l, li) => <li key={li}>{inline(l.replace(/^\s*\d+\.\s+/, ''), `o${bi}${li}`)}</li>)}</ol>;
        }
        if (lines.every((l) => l.startsWith('>'))) {
          return <blockquote key={bi} className="border-l-2 border-accent pl-5 text-[18px] leading-[1.7] text-text">{inline(lines.map((l) => l.replace(/^>\s?/, '')).join(' '), `q${bi}`)}</blockquote>;
        }
        return <p key={bi}>{lines.map((l, li) => <Fragment key={li}>{li > 0 && <br />}{inline(l, `p${bi}${li}`)}</Fragment>)}</p>;
      })}
    </div>
  );
}
