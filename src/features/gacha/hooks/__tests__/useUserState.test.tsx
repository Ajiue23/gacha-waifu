import { act, renderHook, waitFor } from "@testing-library/react";
import { useUserState } from "../useUserState";
import { fetchUserState } from "../../api/gachaApi";
import type { UserState } from "../../types";

jest.mock("../../api/gachaApi", () => ({
  fetchUserState: jest.fn(),
}));

const initialState: UserState = {
  gems: 3200,
  pity: 42,
  pityLimit: 90,
  freeGemsAvailable: false,
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(fetchUserState).mockResolvedValue(initialState);
});

test("QQ3: applyUserState merge partial tanpa mereset field lain (pity aman)", async () => {
  const { result } = renderHook(() => useUserState());

  await waitFor(() => expect(result.current.state).not.toBeNull());
  expect(result.current.state?.pity).toBe(42);

  // Simulasi respons POST /pull yang hanya mengirim gems — pity TIDAK boleh reset.
  act(() => {
    result.current.applyUserState({ gems: 1440 });
  });

  expect(result.current.state?.gems).toBe(1440);
  expect(result.current.state?.pity).toBe(42);
  expect(result.current.state?.pityLimit).toBe(90);
  expect(result.current.state?.freeGemsAvailable).toBe(false);
});

test("QQ3: patch yang masuk sebelum fetch pertama tidak hilang setelah fetch selesai", async () => {
  let resolveFetch: (value: UserState) => void = () => undefined;
  jest.mocked(fetchUserState).mockImplementation(
    () =>
      new Promise<UserState>((resolve) => {
        resolveFetch = resolve;
      }),
  );

  const { result } = renderHook(() => useUserState());

  // Sebelum fetch selesai, terapkan patch dari respons pull.
  act(() => {
    result.current.applyUserState({ gems: 160 });
  });

  // Selesaikan fetch pertama.
  await act(async () => {
    resolveFetch({ ...initialState, gems: 3200 });
  });

  await waitFor(() => expect(result.current.state).not.toBeNull());
  // Patch lokal mengalahkan nilai server pada field yang sama, field lain dari server tetap ada.
  expect(result.current.state?.gems).toBe(160);
  expect(result.current.state?.pity).toBe(42);
});

test("menyimpan pesan error yang aman saat fetch gagal", async () => {
  jest.mocked(fetchUserState).mockRejectedValue(new Error("ECONNREFUSED 127.0.0.1:4000 stack trace"));

  const { result } = renderHook(() => useUserState());

  await waitFor(() => expect(result.current.error).not.toBeNull());
  expect(result.current.error).toBe("Terjadi kesalahan. Silakan coba lagi.");
});
