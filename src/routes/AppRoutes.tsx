import { GachaView } from "../features/gacha";

/**
 * Titik masuk routing aplikasi.
 * Saat ini hanya ada satu layar (gacha); tambahkan route lain di sini.
 */
export const AppRoutes = () => (
  <div className="mx-auto w-full max-w-4xl">
    <GachaView />
  </div>
);
