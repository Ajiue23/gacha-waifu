import { render, screen } from "@testing-library/react";
import { InventoryGrid } from "../InventoryGrid";
import type { InventoryItem } from "../../types";

const items: InventoryItem[] = [
  { id: "w1", name: "Waifu Emas", image: "", rarity: 5, description: "d", count: 2 },
  { id: "w2", name: "Waifu Biru", image: "", rarity: 3, description: "d", count: 1 },
];

test("menampilkan jumlah duplikat tiap karakter yang dimiliki", () => {
  render(<InventoryGrid items={items} />);

  expect(screen.getByText("Waifu Emas")).toBeInTheDocument();
  expect(screen.getByText("x2")).toBeInTheDocument();
  expect(screen.getByText("x1")).toBeInTheDocument();
});

test("menampilkan empty state saat koleksi kosong", () => {
  render(<InventoryGrid items={[]} />);
  expect(screen.getByText(/koleksi masih kosong/i)).toBeInTheDocument();
});

test("menampilkan error state beserta tombol coba lagi", () => {
  render(<InventoryGrid items={[]} error="Gagal memuat koleksi." onRetry={() => undefined} />);
  expect(screen.getByRole("alert")).toHaveTextContent(/gagal memuat koleksi/i);
  expect(screen.getByRole("button", { name: /coba lagi/i })).toBeInTheDocument();
});

test("menampilkan loading state", () => {
  render(<InventoryGrid items={[]} isLoading />);
  expect(screen.getByLabelText(/memuat koleksi/i)).toBeInTheDocument();
});
