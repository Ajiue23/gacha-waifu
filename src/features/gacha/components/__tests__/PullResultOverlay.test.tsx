import { act, fireEvent, render, screen } from "@testing-library/react";
import { PullResultOverlay } from "../PullResultOverlay";
import type { PullResult } from "../../types";

const results: PullResult[] = [
  { id: "c1", pullId: "p1-0", name: "Waifu Biru", image: "", rarity: 3, description: "a", isNew: false },
  { id: "c2", pullId: "p2-1", name: "Waifu Ungu", image: "", rarity: 4, description: "b", isNew: true },
  { id: "c3", pullId: "p3-2", name: "Waifu Emas", image: "", rarity: 5, description: "c", isNew: true },
];

const tenResults: PullResult[] = Array.from({ length: 10 }, (_, index) => ({
  id: `c${index}`,
  pullId: `batch-${index}`,
  name: `Waifu ${index + 1}`,
  image: "",
  rarity: index % 3 === 0 ? 5 : index % 3 === 1 ? 4 : 3,
  description: "d",
  isNew: index === 0,
}));

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
});

test("Skip langsung menampilkan seluruh hasil pull", () => {
  render(<PullResultOverlay results={results} pullCount={10} onClose={() => undefined} />);

  // Sebelum skip, kartu masih tersembunyi di balik placeholder.
  expect(screen.queryByText("Waifu Emas")).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /skip/i }));

  expect(screen.getByText("Waifu Biru")).toBeInTheDocument();
  expect(screen.getByText("Waifu Ungu")).toBeInTheDocument();
  expect(screen.getByText("Waifu Emas")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /selesai/i })).toBeInTheDocument();
});

test("AC5: hasil 10x pull dirender sebagai grid 10 kartu", () => {
  const { container } = render(
    <PullResultOverlay results={tenResults} pullCount={10} onClose={() => undefined} />
  );

  fireEvent.click(screen.getByRole("button", { name: /skip/i }));

  expect(screen.getAllByRole("article")).toHaveLength(10);

  const grid = container.querySelector(".grid");
  expect(grid).not.toBeNull();
  expect(grid?.children).toHaveLength(10);
});

test("tombol Selesai memanggil onClose setelah semua kartu tampil", () => {
  const onClose = jest.fn();
  render(<PullResultOverlay results={results} pullCount={3} onClose={onClose} />);

  fireEvent.click(screen.getByRole("button", { name: /skip/i }));
  fireEvent.click(screen.getByRole("button", { name: /selesai/i }));

  expect(onClose).toHaveBeenCalledTimes(1);
});
