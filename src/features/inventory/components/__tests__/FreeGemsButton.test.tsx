import { fireEvent, render, screen } from "@testing-library/react";
import { FreeGemsButton } from "../FreeGemsButton";

test("aktif saat Free Gems tersedia dan memanggil onClaim", () => {
  const onClaim = jest.fn();
  render(<FreeGemsButton available onClaim={onClaim} />);

  const button = screen.getByRole("button", { name: /klaim free gems/i });
  expect(button).toBeEnabled();

  fireEvent.click(button);
  expect(onClaim).toHaveBeenCalledTimes(1);
});

test("nonaktif dan menampilkan indikator waktu setelah diklaim", () => {
  const nextAvailableAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  render(
    <FreeGemsButton
      available={false}
      nextAvailableAt={nextAvailableAt}
      onClaim={() => undefined}
    />,
  );

  expect(screen.getByRole("button", { name: /sudah diklaim/i })).toBeDisabled();
  expect(screen.getByText(/tersedia lagi dalam/i)).toBeInTheDocument();
});

test("menampilkan state memuat dan tidak misleading saat status belum diketahui", () => {
  render(<FreeGemsButton available={false} isLoading onClaim={() => undefined} />);

  const button = screen.getByRole("button", { name: /memuat status free gems/i });
  expect(button).toBeDisabled();
  expect(screen.queryByText(/sudah diklaim hari ini/i)).not.toBeInTheDocument();
});
