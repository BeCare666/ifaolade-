import { en } from './en';
import { fr, type Dict } from './fr';
import { yo } from './yo';
import type { Lang } from './config';

export * from './config';
export type { Dict } from './fr';

const DICTS: Record<Lang, Dict> = { fr, en, yo };
export const getDict = (lang: Lang): Dict => DICTS[lang] ?? fr;
