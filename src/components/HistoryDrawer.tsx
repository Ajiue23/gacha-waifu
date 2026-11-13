import { useEffect, useId } from "react";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { RARITY_THEME } from "../utils/rarity";
import type { Rarity } from "../types/rarity";
import { Button } from "./Button";

export interface HistoryItem {
  id: string;
  name: string;
  image: string;
  rarity: Rarity;
}

export interface HistoryDrawerProps {
  items: HistoryItem[];
  onClose: () => void;
  title?: string;
}

const FALLBACK_IMAGE = "/assets/waifus/waifu1.jpg";

export const HistoryDrawer = ({ items, onClose, title = "Riwayat Pull" }: HistoryDrawerProps) => {
  const drawerRef = useFocusTrap<HTMLDivElement>(true);
  const titleId = useId();

  useLockBodyScroll(true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      ref={drawerRef}
      tabIndex={-1}
      className="fixed inset-0 z-40 flex animate-fade-in justify-end bg-black/70 focus:outline-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside className="flex h-full w-full max-w-sm animate-slide-in flex-col overflow-y-auto border-l border-white/10 bg-slate-950/95">
        <header className="sticky top-0 flex items-center justify-between gap-2 border-b border-white/10 bg-slate-950/95 px-4 py-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-purple-300/80">Sesi ini</p>
            <h2 id={titleId} className="text-base font-bold text-white">
              {title}
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Tutup riwayat">
            Tutup
          </Button>
        </header>

        <div className="flex-1 p-4">
          {items.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">Belum ada pull di sesi ini.</p>
          ) : (
            <ul className="space-y-2" aria-label="Daftar hasil pull tersimpan">
              {items.map((item) => {
                const theme = RARITY_THEME[item.rarity];
                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2.5"
                  >
                    <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={item.image || FALLBACK_IMAGE}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                      {/* Lihat catatan di WaifuCard: label bintang butuh role="img". */}
                      <span
                        role="img"
                        aria-label={`Rarity ${theme.stars} bintang`}
                        className={`text-[11px] ${theme.text}`}
                      >
                        {"★".repeat(theme.stars)}
                      </span>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${theme.badge}`}>
                      {theme.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
};
