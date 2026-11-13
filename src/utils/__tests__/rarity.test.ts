import { RARITY_THEME, normalizeRarity } from "../rarity";

test("AC3: 3★ biru, 4★ ungu, 5★ emas", () => {
  expect(RARITY_THEME[3].text).toContain("sky");
  expect(RARITY_THEME[3].aura).toContain("sky");

  expect(RARITY_THEME[4].text).toContain("purple");
  expect(RARITY_THEME[4].aura).toContain("purple");

  expect(RARITY_THEME[5].text).toContain("amber");
  expect(RARITY_THEME[5].aura).toContain("amber");
});

test("setiap rarity memiliki seluruh key tema yang dipakai komponen", () => {
  ([3, 4, 5] as const).forEach((rarity) => {
    const theme = RARITY_THEME[rarity];
    expect(theme.stars).toBe(rarity);
    expect(theme.label).toBe(`${rarity}★`);

    (["text", "badge", "border", "surface", "glow", "aura"] as const).forEach((key) => {
      expect(typeof theme[key]).toBe("string");
      expect(theme[key].length).toBeGreaterThan(0);
    });
  });
});

test("normalizeRarity memetakan kode lama dan angka", () => {
  expect(normalizeRarity(3)).toBe(3);
  expect(normalizeRarity("4")).toBe(4);
  expect(normalizeRarity("R")).toBe(3);
  expect(normalizeRarity("SR")).toBe(4);
  expect(normalizeRarity("SSR")).toBe(5);
  expect(normalizeRarity(undefined)).toBe(3);
});
