import { GACHA_CONFIG } from "../config/gacha";
import type { UserState } from "../types/user";

/**
 * Normalisasi state user dari API agar selalu aman dipakai UI:
 * gems/pity tidak negatif, pity tidak melebihi limit.
 *
 * Dipakai bersama oleh `PlayerStateContext` dan `useUserState` (fallback
 * standalone) sehingga aturan sanitasi hanya ada di satu tempat.
 */
export const sanitizeUserState = (value: UserState): UserState => {
  const pityLimit = value.pityLimit > 0 ? value.pityLimit : GACHA_CONFIG.pityLimit;

  return {
    gems: Math.max(0, Math.round(value.gems)),
    pity: Math.max(0, Math.min(Math.round(value.pity), pityLimit)),
    pityLimit,
    freeGemsAvailable: Boolean(value.freeGemsAvailable),
  };
};

/**
 * Fallback ketika backend tidak mengirim `nextAvailableAt`.
 * Asumsi: reset harian mengikuti tengah malam waktu lokal.
 */
export const nextLocalMidnight = (): string => {
  const next = new Date();
  next.setHours(24, 0, 0, 0);
  return next.toISOString();
};

/** Normalisasi nilai waktu dari API menjadi ISO string yang valid. */
export const normalizeIsoTime = (value: string | null): string | null => {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
};
