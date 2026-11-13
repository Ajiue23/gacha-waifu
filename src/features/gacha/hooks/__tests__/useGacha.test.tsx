import { act, renderHook, waitFor } from "@testing-library/react";
import { useGacha } from "../useGacha";
import { fetchBanner, fetchUserState, postPull } from "../../api/gachaApi";
import type { Banner, PullResponse, UserState } from "../../types";

jest.mock("../../api/gachaApi", () => ({
  FALLBACK_BANNER: {
    id: "fallback-banner",
    title: "Banner Bawaan",
    subtitle: "Banner cadangan.",
    featured: { id: "fallback-featured", name: "Waifu Fallback", image: "", rarity: 5, description: "d" },
    rateUp: [],
  },
  fetchBanner: jest.fn(),
  fetchUserState: jest.fn(),
  postPull: jest.fn(),
}));

const banner: Banner = {
  id: "banner-uji",
  title: "Banner Uji",
  subtitle: "Subjudul",
  featured: { id: "featured", name: "Waifu Unggulan", image: "", rarity: 5, description: "d" },
  rateUp: [],
};

const userState: UserState = { gems: 3200, pity: 12, pityLimit: 90, freeGemsAvailable: false };

const pullResponse: PullResponse = {
  results: [
    { id: "c1", pullId: "p1", name: "Waifu Emas", image: "", rarity: 5, description: "d", isNew: true },
  ],
  userState: { gems: 1600, pity: 13 },
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(fetchBanner).mockResolvedValue(banner);
  jest.mocked(fetchUserState).mockResolvedValue(userState);
  jest.mocked(postPull).mockResolvedValue(pullResponse);
});

test("pull memperbarui gems, pity, dan hasil tanpa reload", async () => {
  const { result } = renderHook(() => useGacha());

  await waitFor(() => expect(result.current.userState).not.toBeNull());
  expect(result.current.userState?.gems).toBe(3200);

  await act(async () => {
    await result.current.pull(10);
  });

  expect(postPull).toHaveBeenCalledWith(10);
  expect(result.current.results).toHaveLength(1);
  expect(result.current.userState?.gems).toBe(1600);
  expect(result.current.userState?.pity).toBe(13);
  expect(result.current.isResultOpen).toBe(true);
  expect(result.current.history).toHaveLength(1);
});

test("canPull menolak pull bila gems tidak cukup", async () => {
  jest.mocked(fetchUserState).mockResolvedValue({ ...userState, gems: 100 });

  const { result } = renderHook(() => useGacha());

  await waitFor(() => expect(result.current.userState?.gems).toBe(100));
  expect(result.current.canPull(1)).toBe(false);
  expect(result.current.canPull(10)).toBe(false);
});

test("pull gagal tidak merusak state user dan menampilkan pesan aman", async () => {
  jest.mocked(postPull).mockRejectedValue(new Error("ECONNREFUSED 127.0.0.1:4000 stack trace"));

  const { result } = renderHook(() => useGacha());
  await waitFor(() => expect(result.current.userState).not.toBeNull());

  await act(async () => {
    await result.current.pull(1);
  });

  expect(result.current.results).toHaveLength(0);
  expect(result.current.isResultOpen).toBe(false);
  expect(result.current.pullError).toBe("Terjadi kesalahan. Silakan coba lagi.");
});
