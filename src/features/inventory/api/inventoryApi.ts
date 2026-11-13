import { apiClient } from "../../../services/apiClient";
import { normalizeRarity } from "../../../utils/rarity";
import type { FreeGemsResult, InventoryItem, ResetResult } from "../types";

const ENDPOINTS = {
  collection: "/api/gacha/collection",
  freeGems: "/api/gacha/free-gems",
  reset: "/api/gacha/reset",
} as const;

const FALLBACK_IMAGE = "/assets/waifus/waifu1.jpg";

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

const toText = (value: unknown, fallback = ""): string =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

const toNumber = (value: unknown, fallback: number): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/** Membuka wrapper `{ data: ... }` bila ada. */
const unwrap = (payload: unknown): Record<string, unknown> => {
  const record = toRecord(payload);
  return record.data !== undefined ? toRecord(record.data) : record;
};

/** Menemukan array koleksi pada payload dengan beragam bentuk respons. */
const extractArray = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload;

  const record = toRecord(payload);
  const data = record.data !== undefined ? record.data : payload;

  if (Array.isArray(data)) return data;

  const container = toRecord(data);
  const candidates = [
    container.items,
    container.collection,
    container.characters,
    container.inventory,
    container.owned,
    container.list,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
};

const mapInventoryItem = (raw: unknown, index: number): InventoryItem => {
  const record = toRecord(raw);
  const character = toRecord(record.character ?? raw);
  const rawCount = record.count ?? record.quantity ?? record.duplicates ?? record.owned ?? 1;

  return {
    id: toText(character.id ?? character._id ?? record.id, `item-${index}`),
    name: toText(character.name ?? record.name, "Waifu Misterius"),
    image: toText(character.image ?? character.imageUrl ?? record.image, FALLBACK_IMAGE),
    description: toText(character.description ?? record.description, "Karakter misterius dari dunia lain."),
    rarity: normalizeRarity(character.rarity ?? record.rarity ?? character.stars),
    count: Math.max(1, Math.round(toNumber(rawCount, 1))),
  };
};

export const fetchCollection = async (): Promise<InventoryItem[]> => {
  const payload = await apiClient.get<unknown>(ENDPOINTS.collection);
  return extractArray(payload).map((item, index) => mapInventoryItem(item, index));
};

export const claimFreeGems = async (): Promise<FreeGemsResult> => {
  const payload = await apiClient.post<unknown>(ENDPOINTS.freeGems, {});
  const data = unwrap(payload);
  const source = toRecord(data.userState ?? data.state ?? data.user ?? data);

  const gems = toNullableNumber(source.gems ?? data.gems ?? data.reward);
  const freeGemsAvailable =
    source.freeGemsAvailable !== undefined
      ? Boolean(source.freeGemsAvailable)
      : data.freeGemsAvailable !== undefined
        ? Boolean(data.freeGemsAvailable)
        : false;
  const nextAvailableAt =
    toText(
      source.nextFreeGemsAt ?? source.nextFreeGems ?? source.nextAvailableAt ?? data.nextAvailableAt,
      "",
    ) || null;

  return { gems, freeGemsAvailable, nextAvailableAt };
};

export const resetData = async (): Promise<ResetResult> => {
  const payload = await apiClient.post<unknown>(ENDPOINTS.reset, {});
  const data = unwrap(payload);
  const source = toRecord(data.userState ?? data.state ?? data.user ?? data);

  return {
    gems: toNullableNumber(source.gems),
    pity: toNullableNumber(source.pity),
    pityLimit: toNullableNumber(source.pityLimit),
  };
};
