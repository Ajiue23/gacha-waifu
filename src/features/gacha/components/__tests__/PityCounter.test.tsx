import { render, screen } from "@testing-library/react";
import { PityCounter } from "../PityCounter";

test("menampilkan sisa pull menuju garansi", () => {
  const { container } = render(<PityCounter pity={30} limit={90} />);

  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "30");
  expect(container).toHaveTextContent("Sisa 60 pull menuju garansi 5★");
});

test("menampilkan status garansi aktif saat pity mencapai limit", () => {
  const { container } = render(<PityCounter pity={90} limit={90} />);

  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "90");
  expect(container).toHaveTextContent(/garansi 5★ siap/i);
});

test("menampilkan state error, bukan 0/90 yang menyesatkan", () => {
  render(<PityCounter pity={0} limit={90} hasError />);

  expect(screen.getByRole("alert")).toHaveTextContent(/data pity gagal dimuat/i);
  expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
});

test("menampilkan skeleton saat loading", () => {
  render(<PityCounter pity={0} limit={90} isLoading />);

  expect(screen.getByLabelText(/memuat pity counter/i)).toBeInTheDocument();
});
