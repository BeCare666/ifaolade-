import type { Metadata } from 'next';
import { getDict, isLang } from '@/i18n';
import { PortraitClient } from './portrait-client';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDict(isLang(lang) ? lang : 'fr').portrait.metaTitle, robots: { index: false, follow: false } };
}

export default async function PortraitPage({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ bienvenue?: string }>;
}) {
  const [{ id }, { bienvenue }] = await Promise.all([params, searchParams]);
  return <PortraitClient id={id} welcome={bienvenue === '1'} />;
}
