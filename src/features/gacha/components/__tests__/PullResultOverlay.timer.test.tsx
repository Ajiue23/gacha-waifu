import { act, render } from "@testing-library/react";
import { PullResultOverlay } from "../PullResultOverlay";
import type { PullResult } from "../../types";

const results: PullResult[] = [
  { id: "c1", pullId: "p1-0", name: "Waifu Biru", image: "", rarity: 3, description: "a", isNew: false },
  { id: "c2", pullId: "p2-1", name: "Waifu Ungu", image: "", rarity: 4, description: "b", isNew: true },
];

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
});

test("QQ4: re-render dengan props identik tidak me-reset timer reveal", () => {
  const { rerender } = render(
    <PullResultOverlay results={results} pullCount={2} onClose={() => undefined} />,
  );

  // Maju 1 frame agar kartu pertama muncul.
  act(() => {
    jest.advanceTimersByTime(420);
  });

  // Re-render tanpa mengubah `results` (mis. karena user state berubah). Referensi
  // array yang stabil tidak boleh me-reset `useEffect` timer di dalam overlay.
  rerender(<PullResultOverlay results={results} pullCount={2} onClose={() => undefined} />);

  // Kartu kedua harus tetap terungkap pada jadwal semula.
  act(() => {
    jest.advanceTimersByTime(420);
  });

  // Total 2 kartu terlihat, sehingga tombol aksi berganti ke "Selesai".
  expect(document.body.textContent).toMatch(/Selesai/);
});
