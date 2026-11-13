import { ApiError } from "../services/apiClient";

const FALLBACK_MESSAGE = "Terjadi kesalahan. Silakan coba lagi.";

/**
 * Mengubah error apa pun menjadi pesan yang aman ditampilkan di UI.
 * Pesan mentah dari `Error` biasa tidak pernah diteruskan karena bisa
 * memuat detail internal (stack, path file, dsb).
 */
export const getErrorMessage = (error: unknown, fallback = FALLBACK_MESSAGE): string => {
  if (error instanceof ApiError) {
    if (error.status === 0) return "Tidak dapat terhubung ke server gacha.";
    if (error.status >= 500) return "Server gacha sedang bermasalah. Coba lagi beberapa saat.";
    return error.message || fallback;
  }

  return fallback;
};
