import { render, screen } from "@testing-library/react";
import { PullButtons } from "../PullButtons";

test("tombol 10x disabled dan 1x aktif saat gems hanya cukup untuk 1x", () => {
  render(<PullButtons gems={200} isPulling={false} onPull={() => undefined} />);

  expect(screen.getByRole("button", { name: /pull 1x/i })).toBeEnabled();
  expect(screen.getByRole("button", { name: /pull 10x/i })).toBeDisabled();
  expect(screen.getByText(/gems tidak cukup/i)).toBeInTheDocument();
});

test("kedua tombol aktif saat gems mencukupi", () => {
  render(<PullButtons gems={1600} isPulling={false} onPull={() => undefined} />);

  expect(screen.getByRole("button", { name: /pull 1x/i })).toBeEnabled();
  expect(screen.getByRole("button", { name: /pull 10x/i })).toBeEnabled();
});

test("saat state user gagal dimuat, hint menyesatkan 'Gems tidak cukup' tidak muncul", () => {
  render(<PullButtons gems={0} isPulling={false} hasStateError onPull={() => undefined} />);

  expect(screen.getByRole("button", { name: /pull 1x/i })).toBeDisabled();
  expect(screen.getByRole("button", { name: /pull 10x/i })).toBeDisabled();
  expect(screen.getAllByText(/gagal memuat gems, coba lagi/i)).toHaveLength(2);
  expect(screen.queryByText(/gems tidak cukup/i)).not.toBeInTheDocument();
});

test("saat saldo masih dimuat, tombol disabled disertai alasan 'Memuat saldo Gems'", () => {
  render(<PullButtons gems={0} isPulling={false} isStateLoading onPull={() => undefined} />);

  expect(screen.getByRole("button", { name: /pull 1x/i })).toBeDisabled();
  expect(screen.getByRole("button", { name: /pull 10x/i })).toBeDisabled();
  expect(screen.getAllByText(/memuat saldo gems/i)).toHaveLength(2);
  expect(screen.queryByText(/gems tidak cukup/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/gagal memuat gems/i)).not.toBeInTheDocument();
});

test("aria-describedby menghubungkan hint ke tombol", () => {
  render(<PullButtons gems={0} isPulling={false} onPull={() => undefined} />);

  const button = screen.getByRole("button", { name: /pull 1x/i });
  const describedBy = button.getAttribute("aria-describedby");

  expect(describedBy).toBeTruthy();
  expect(document.getElementById(describedBy as string)).toHaveTextContent(/gems tidak cukup/i);
});
