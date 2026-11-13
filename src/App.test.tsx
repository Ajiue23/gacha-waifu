import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("./features/gacha/api/gachaApi", () => {
  const featured = { id: "featured", name: "Waifu Unggulan", image: "", rarity: 5, description: "d" };
  const banner = { id: "banner", title: "Banner Uji", subtitle: "s", featured, rateUp: [] };

  return {
    FALLBACK_BANNER: banner,
    fetchBanner: jest.fn(() => Promise.resolve(banner)),
    fetchUserState: jest.fn(() =>
      Promise.resolve({ gems: 1600, pity: 0, pityLimit: 90, freeGemsAvailable: false })
    ),
    postPull: jest.fn(() => Promise.resolve({ results: [], userState: {} })),
    normalizeUserState: jest.fn(() => ({})),
  };
});

test("menampilkan judul halaman Gacha Waifu", async () => {
  render(<App />);

  expect(await screen.findByRole("heading", { level: 1, name: /gacha waifu/i })).toBeInTheDocument();
});
