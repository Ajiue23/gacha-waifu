import { fireEvent, render, screen } from "@testing-library/react";
import { GachaBanner } from "../GachaBanner";
import type { Banner } from "../../types";

const banner: Banner = {
  id: "banner-uji",
  title: "Banner Uji",
  subtitle: "Subjudul banner.",
  featured: { id: "f1", name: "Waifu Unggulan", image: "", rarity: 5, description: "d" },
  rateUp: [{ id: "r1", name: "Waifu Rate Up", image: "", rarity: 4, description: "d" }],
};

test("menampilkan karakter unggulan dan rate up", () => {
  render(<GachaBanner banner={banner} />);

  expect(screen.getByText("Banner Uji")).toBeInTheDocument();
  expect(screen.getByText("Waifu Unggulan")).toBeInTheDocument();
  expect(screen.getByText("Waifu Rate Up")).toBeInTheDocument();
});

test("menampilkan error banner beserta tombol muat ulang", () => {
  const onRetry = jest.fn();
  render(<GachaBanner banner={banner} error="Gagal memuat banner." onRetry={onRetry} />);

  expect(screen.getByText(/gagal memuat banner/i)).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /muat ulang/i }));
  expect(onRetry).toHaveBeenCalledTimes(1);
});
