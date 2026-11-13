import { apiClient } from "../../../services/apiClient";
import { GACHA_CONFIG } from "../../../config/gacha";
import { normalizeRarity } from "../../../utils/rarity";
import type { Banner, Character, PullCount, PullResponse, PullResult, UserState } from "../types";

const ENDPOINTS = {
  banner: "/api/gacha/banner",
  state: "/api/gacha/state",
  pull: "/api/gacha/pull",
} as const;

const FALLBACK_IMAGE = "/assets/waifus/waifu1.jpg";

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const toText = (value: unknown, fallback = ""): string =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

const toNumber = (value: unknown, fallback: number): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/** Membuka wrapper `{ data: ... }` bila ada. */
const unwrap = (payload: unknown): Record<string, unknown> => {
  const record = toRecord(payload);
  return record.data ? toRecord(record.data) : record;
};

/**
 * Sumber state user pada sebuah payload API. Bentuk yang didukung:
 * `{ userState }`, `{ state }`, `{ user }`, atau field langsung di root.
 *
 * Dipakai SAMA oleh `fetchUserState` dan `postPull` supaya state dari respons
 * pull tidak pernah hilang walau backend mengirim field di root.
 */
const resolveUserStateSource = (data: Record<string, unknown>): unknown =>
  data.userState ?? data.state ?? data.user ?? data;

const mapCharacter = (raw: unknown, fallbackId: string): Character => {
  const record = toRecord(raw);

  return {
    id: toText(record.id ?? record._id ?? record.slug, fallbackId),
    name: toText(record.name, "Waifu Misterius"),
    image: toText(record.image ?? record.imageUrl ?? record.thumbnail, FALLBACK_IMAGE),
    rarity: normalizeRarity(record.rarity ?? record.stars ?? record.rank),
    description: toText(record.description, "Karakter misterius dari dunia lain."),
  };
};

/**
 * `pullId` WAJIB unik per hasil karena dipakai sebagai `key` React di overlay
 * dan riwayat. Backend sering mengirim satu `pullId` per batch (bukan per
 * karakter) pada pull 10x, sehingga index selalu ditambahkan sebagai suffix.
 */
const buildUniquePullId = (record: Record<string, unknown>, characterId: string, index: number): string => {
  const rawPullId = toText(record.pullId ?? record.id, "");
  const batchId = toText(record.batchId ?? record.transactionId ?? record.pullBatchId, "");

  if (rawPullId) return `${rawPullId}-${index}`;
  if (batchId) return `${characterId}-${batchId}-${index}`;

  return `${characterId}-${index}`;
};

const mapPullResult = (raw: unknown, index: number): PullResult => {
  const record = toRecord(raw);
  const character = mapCharacter(record.character ?? record, `result-${index}`);

  return {
    ...character,
    pullId: buildUniquePullId(record, character.id, index),
    isNew: Boolean(record.isNew ?? record.new ?? false),
  };
};

export const FALLBACK_BANNER: Banner = {
  id: "standard-banner",
  title: "Banner Standar",
  subtitle: "Semua karakter 3★ sampai 5★ tersedia di banner ini. Semoga keberuntunganmu bagus!",
  featured: {
    id: "featured-5star",
    name: "Waifu 1",
    image: "/assets/waifus/waifu1.jpg",
    rarity: 5,
    description: "Karakter legendaris dengan kemampuan luar biasa.",
  },
  rateUp: [],
};

export const fetchBanner = async (): Promise<Banner> => {
  const payload = await apiClient.get<unknown>(ENDPOINTS.banner);
  const data = unwrap(payload);

  const featuredRaw = data.featured ?? data.featuredCharacter ?? data.character;
  const rateUpRaw = Array.isArray(data.rateUp) ? data.rateUp : [];

  return {
    id: toText(data.id, FALLBACK_BANNER.id),
    title: toText(data.title, FALLBACK_BANNER.title),
    subtitle: toText(data.subtitle ?? data.description, FALLBACK_BANNER.subtitle),
    featured: featuredRaw ? mapCharacter(featuredRaw, "featured-character") : FALLBACK_BANNER.featured,
    rateUp: rateUpRaw.map((item, index) => mapCharacter(item, `rate-up-${index}`)),
  };
};

/**
 * Normalisasi state user dari respons API.
 *
 * Kontrak `pity`: jumlah pull yang SUDAH terpakai semenjak 5★ terakhir
 * (0 = belum ada pull, `pityLimit` = garansi aktif). Bila backend ternyata
 * mengirim "sisa menuju garansi" (`pityRemaining`/`pullsUntilPity`), nilai
 * tersebut dikonversi otomatis agar UI tidak terbalik.
 */
export const normalizeUserState = (raw: unknown): Partial<UserState> => {
  const record = toRecord(raw);
  const state: Partial<UserState> = {};

  const pityLimitRaw = record.pityLimit ?? record.pityMax ?? record.hardPity;
  const pityLimit =
    pityLimitRaw !== undefined
      ? Math.max(1, toNumber(pityLimitRaw, GACHA_CONFIG.pityLimit))
      : GACHA_CONFIG.pityLimit;
  if (pityLimitRaw !== undefined) state.pityLimit = pityLimit;

  const pityUsedRaw = record.pity ?? record.pityCount ?? record.pityCounter;
  const pityRemainingRaw =
    record.pityRemaining ?? record.pullsUntilPity ?? record.remainingPity ?? record.pityLeft;

  if (pityUsedRaw !== undefined) {
    state.pity = Math.max(0, toNumber(pityUsedRaw, 0));
  } else if (pityRemainingRaw !== undefined) {
    state.pity = Math.max(0, pityLimit - toNumber(pityRemainingRaw, pityLimit));
  }

  const gems = record.gems ?? record.gemsBalance ?? record.totalGems;
  if (gems !== undefined) state.gems = Math.max(0, toNumber(gems, 0));

  if (record.freeGemsAvailable !== undefined) {
    state.freeGemsAvailable = Boolean(record.freeGemsAvailable);
  }

  return state;
};

export const fetchUserState = async (): Promise<UserState> => {
  const payload = await apiClient.get<unknown>(ENDPOINTS.state);
  const data = unwrap(payload);
  const normalized = normalizeUserState(resolveUserStateSource(data));

  return {
    gems: normalized.gems ?? 0,
    pity: normalized.pity ?? 0,
    pityLimit: normalized.pityLimit ?? GACHA_CONFIG.pityLimit,
    freeGemsAvailable: normalized.freeGemsAvailable ?? false,
  };
};

export const postPull = async (count: PullCount): Promise<PullResponse> => {
  const payload = await apiClient.post<unknown>(ENDPOINTS.pull, { count });
  const data = unwrap(payload);
  const resultsRaw = Array.isArray(data.results)
    ? data.results
    : Array.isArray(data.pulled)
      ? data.pulled
      : [];

  return {
    results: resultsRaw.map(mapPullResult),
    // Fallback identik dengan fetchUserState.
    userState: normalizeUserState(resolveUserStateSource(data)),
  };
};
