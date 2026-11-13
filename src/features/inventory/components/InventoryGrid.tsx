import { Button } from "../../../components/Button";
import { WaifuCard } from "../../../components/WaifuCard";
import type { InventoryItem } from "../types";

export interface InventoryGridProps {
  items: InventoryItem[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const GRID_CLASS = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4";

const InventorySkeleton = () => (
  <div className={GRID_CLASS} aria-hidden="true">
    {Array.from({ length: 8 }).map((_, index) => (
      <div
        key={index}
        className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60"
      >
        <div className="h-40 w-full bg-white/10" />
        <div className="space-y-2 p-3">
          <div className="h-4 w-3/4 rounded-full bg-white/10" />
          <div className="h-3 w-1/2 rounded-full bg-white/10" />
        </div>
      </div>
    ))}
  </div>
);

export const InventoryGrid = ({ items, isLoading = false, error = null, onRetry }: InventoryGridProps) => {
  if (isLoading) {
    return (
      <div aria-busy="true" aria-label="Memuat koleksi">
        <InventorySkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex flex-col items-center gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-center"
        role="alert"
      >
        <p className="text-sm text-rose-200">{error}</p>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Coba lagi
          </Button>
        )}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center">
        <span aria-hidden="true" className="text-3xl">
          🗂️
        </span>
        <h3 className="text-sm font-semibold text-white">Koleksi masih kosong</h3>
        <p className="max-w-xs text-xs text-slate-400">
          Lakukan pull di halaman Gacha untuk mulai mengumpulkan waifu.
        </p>
      </div>
    );
  }

  const uniqueCount = items.length;
  const totalCount = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <section aria-label="Galeri koleksi waifu" className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
          Karakter unik: <strong className="text-white">{uniqueCount}</strong>
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
          Total koleksi: <strong className="text-white">{totalCount}</strong>
        </span>
      </div>

      <ul className={GRID_CLASS}>
        {items.map((item) => (
          <li key={item.id}>
            <WaifuCard
              name={item.name}
              image={item.image}
              rarity={item.rarity}
              description={item.description}
              badge={
                <span className="absolute left-2 top-2 rounded-full bg-slate-950/80 px-2 py-0.5 text-[11px] font-bold text-white ring-1 ring-white/20">
                  x{item.count}
                </span>
              }
            />
          </li>
        ))}
      </ul>
    </section>
  );
};
