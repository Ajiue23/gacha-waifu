import type { Rarity } from "../types/rarity";

export type PullCount = 1 | 10;

export interface GachaConfig {
  /** Harga tiap jenis pull dalam Gems. */
  pullCost: Record<PullCount, number>;
  /** Jumlah pull menuju garansi 5★. */
  pityLimit: number;
  /** Batas riwayat pull yang disimpan di sesi ini. */
  maxHistory: number;
  /** Jeda antar reveal kartu di overlay (ms). */
  revealIntervalMs: number;
  /** Daftar rarity dari tertinggi ke terendah. */
  rarityOrder: Rarity[];
}

export const GACHA_CONFIG: GachaConfig = {
  pullCost: {
    1: 160,
    10: 1600,
  },
  pityLimit: 90,
  maxHistory: 20,
  revealIntervalMs: 420,
  rarityOrder: [5, 4, 3],
};
