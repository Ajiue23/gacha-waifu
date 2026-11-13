import type { Rarity } from "../types/rarity";

export interface RarityTheme {
  /** Label singkat, misal "5★". */
  label: string;
  /** Jumlah bintang. */
  stars: number;
  /** Warna teks (bintang/label). */
  text: string;
  /** Badge rarity (border + background + teks). */
  badge: string;
  /** Border kartu/banner. */
  border: string;
  /** Gradient surface kartu. */
  surface: string;
  /** Glow shadow kartu. */
  glow: string;
  /** Aura blur di belakang kartu hasil pull (warna efek animasi). */
  aura: string;
}

/**
 * AC3 — tema warna sesuai rarity:
 * - 3★ → BIRU  (sky)
 * - 4★ → UNGU  (purple)
 * - 5★ → EMAS  (amber)
 *
 * Dipakai konsisten oleh `WaifuCard`, `WaifuResultCard` (aura animasi),
 * `HistoryDrawer`, `GachaBanner`, dan `PullSummary` pada overlay hasil.
 */
export const RARITY_THEME: Record<Rarity, RarityTheme> = {
  3: {
    label: "3★",
    stars: 3,
    text: "text-sky-300",
    badge: "border border-sky-400/40 bg-sky-500/15 text-sky-200",
    border: "border-sky-400/40",
    surface: "from-sky-900/70 via-slate-900/85 to-slate-950",
    glow: "shadow-[0_0_45px_-14px_rgba(56,189,248,0.9)]",
    aura: "bg-sky-400/35",
  },
  4: {
    label: "4★",
    stars: 4,
    text: "text-purple-300",
    badge: "border border-purple-400/40 bg-purple-500/15 text-purple-200",
    border: "border-purple-400/45",
    surface: "from-purple-900/70 via-slate-900/85 to-slate-950",
    glow: "shadow-[0_0_50px_-12px_rgba(168,85,247,0.95)]",
    aura: "bg-purple-500/35",
  },
  5: {
    label: "5★",
    stars: 5,
    text: "text-amber-300",
    badge: "border border-amber-400/50 bg-amber-500/15 text-amber-200",
    border: "border-amber-400/50",
    surface: "from-amber-900/65 via-slate-900/85 to-slate-950",
    glow: "shadow-[0_0_60px_-10px_rgba(251,191,36,0.95)]",
    aura: "bg-amber-400/35",
  },
};

/**
 * Normalisasi nilai rarity dari API (angka, string angka, atau kode lama R/SR/SSR).
 */
export const normalizeRarity = (value: unknown): Rarity => {
  const numeric = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (numeric === 3 || numeric === 4 || numeric === 5) {
    return numeric as Rarity;
  }

  const label = String(value ?? "")
    .trim()
    .toUpperCase();

  if (label === "SSR" || label === "UR" || label === "LEGENDARY") return 5;
  if (label === "SR" || label === "EPIC") return 4;
  return 3;
};

export const isFiveStar = (rarity: Rarity): boolean => rarity === 5;
