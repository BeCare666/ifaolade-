import { Injectable, NotFoundException } from '@nestjs/common';
import { portraitTextCatalog } from '@ona/core';
import { PrismaService } from '../common/prisma.service';

/** Textes du portrait (étape 4.4) : catalogue du moteur + versions du prêtre. Cache de 60 s. */
@Injectable()
export class PortraitTextsService {
  private cache: { at: number; map: Record<string, string> } | null = null;
  private keys = new Set(portraitTextCatalog().map((t) => t.key));

  constructor(private prisma: PrismaService) {}

  /** Seuls les textes VALIDÉS par le prêtre remplacent les textes par défaut. */
  async validated(): Promise<Record<string, string>> {
    if (this.cache && Date.now() - this.cache.at < 60_000) return this.cache.map;
    const rows = await this.prisma.portraitText.findMany({ where: { validated: true } });
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    this.cache = { at: Date.now(), map };
    return map;
  }

  async list() {
    const rows = await this.prisma.portraitText.findMany();
    const byKey = new Map(rows.map((r) => [r.key, r]));
    return portraitTextCatalog().map((t) => {
      const r = byKey.get(t.key);
      return { ...t, value: r?.value ?? null, validated: r?.validated ?? false, updatedAt: r?.updatedAt ?? null };
    });
  }

  async update(key: string, value: string, validated: boolean) {
    if (!this.keys.has(key)) throw new NotFoundException('Texte inconnu');
    this.cache = null;
    return this.prisma.portraitText.upsert({
      where: { key }, create: { key, value, validated }, update: { value, validated },
    });
  }

  async reset(key: string) {
    this.cache = null;
    await this.prisma.portraitText.deleteMany({ where: { key } });
    return { ok: true };
  }
}
