import { fireEvent, render, screen } from "@testing-library/react";
import { HistoryDrawer } from "../HistoryDrawer";
import type { HistoryItem } from "../HistoryDrawer";

const items: HistoryItem[] = [
  { id: "p1", name: "Waifu Biru", image: "", rarity: 3 },
  { id: "p2", name: "Waifu Emas", image: "", rarity: 5 },
];

test("menampilkan seluruh item riwayat pull", () => {
  render(<HistoryDrawer items={items} onClose={() => undefined} />);

  expect(screen.getByText("Waifu Biru")).toBeInTheDocument();
  expect(screen.getByText("Waifu Emas")).toBeInTheDocument();
  expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
});

test("menampilkan empty state ketika riwayat kosong", () => {
  render(<HistoryDrawer items={[]} onClose={() => undefined} />);

  expect(screen.getByText(/belum ada pull/i)).toBeInTheDocument();
});

test("tombol tutup memanggil onClose", () => {
  const onClose = jest.fn();
  render(<HistoryDrawer items={items} onClose={onClose} />);

  fireEvent.click(screen.getByRole("button", { name: /tutup riwayat/i }));
  expect(onClose).toHaveBeenCalledTimes(1);
});

test("klik area backdrop memanggil onClose, klik di dalam drawer tidak", () => {
  const onClose = jest.fn();
  const { container } = render(<HistoryDrawer items={items} onClose={onClose} />);

  const backdrop = container.firstElementChild as HTMLElement;
  fireEvent.click(backdrop);
  expect(onClose).toHaveBeenCalledTimes(1);

  const inner = screen.getByRole("dialog").querySelector("aside") as HTMLElement;
  fireEvent.click(inner);
  expect(onClose).toHaveBeenCalledTimes(1);
});
