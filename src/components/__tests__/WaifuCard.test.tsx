import { render, screen } from "@testing-library/react";
import { WaifuCard } from "../WaifuCard";

test("menampilkan nama, rarity label, dan bintang sesuai rarity", () => {
  render(<WaifuCard name="Waifu Emas" image="" rarity={5} description="Deskripsi" />);

  expect(screen.getByText("Waifu Emas")).toBeInTheDocument();
  expect(screen.getByText("5★")).toBeInTheDocument();
  expect(screen.getByLabelText(/rarity 5 bintang/i)).toHaveTextContent("★★★★★");
});

test("menampilkan jumlah bintang 3★ sesuai rarity terendah", () => {
  render(<WaifuCard name="Waifu Biru" image="" rarity={3} />);

  expect(screen.getByLabelText(/rarity 3 bintang/i)).toHaveTextContent("★★★");
  expect(screen.queryByText(/rarity 5 bintang/i)).not.toBeInTheDocument();
});

test("merender badge slot bila diberikan", () => {
  render(
    <WaifuCard
      name="Waifu Baru"
      image=""
      rarity={4}
      badge={<span data-testid="badge-baru">Baru</span>}
    />,
  );

  expect(screen.getByTestId("badge-baru")).toBeInTheDocument();
});

test("memakai fallback gambar ketika attribute image kosong", () => {
  render(<WaifuCard name="Fallback" image="" rarity={3} />);

  const img = screen.getByAltText(/ilustrasi fallback/i) as HTMLImageElement;
  expect(img.getAttribute("src")).toBe("/assets/waifus/waifu1.jpg");
});
