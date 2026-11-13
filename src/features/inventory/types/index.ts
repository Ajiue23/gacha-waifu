import type { Rarity } from "../../../types/rarity";

export interface InventoryItem {
  id: string;
  name: string;
  image: string;
  description: string;
  rarity: Rarity;
  /** Total salinan karakter yang dimiliki (>= 1). */
  count: number;
}

export interface FreeGemsResult {
  /** Nilai Gems terbaru bila dikirim backend, null bila tidak ada. */
  gems: number | null;
  /** Apakah Free Gems masih boleh diklaim (false setelah klaim hari ini). */
  freeGemsAvailable: boolean;
  /** Waktu klaim berikutnya dalam ISO string, bila diketahui backend. */
  nextAvailableAt: string | null;
}

export interface ResetResult {
  gems: number | null;
  pity: number | null;
  pityLimit: number | null;
}
