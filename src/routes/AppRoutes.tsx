import { GachaView } from "../features/gacha";
import { InventoryView } from "../features/inventory";
import type { AppRoute } from "../hooks/useHashRoute";

export interface AppRoutesProps {
  /** Route aktif dari satu sumber kebenaran (`useHashRoute` di `App`). */
  route: AppRoute;
}

/**
 * Titik masuk routing aplikasi. Perpindahan halaman memakai hash sehingga
 * tidak memicu reload penuh (AC6).
 */
export const AppRoutes = ({ route }: AppRoutesProps) => (
  <div className="mx-auto w-full max-w-4xl">
    {route === "inventory" ? <InventoryView /> : <GachaView />}
  </div>
);
