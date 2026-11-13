import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "../../../components/Button";
import { useLockBodyScroll } from "../../../hooks/useLockBodyScroll";
import { useFocusTrap } from "../../../hooks/useFocusTrap";
import { GACHA_CONFIG } from "../../../config/gacha";
import { RARITY_THEME } from "../../../utils/rarity";
import { WaifuResultCard } from "./WaifuResultCard";
import type { PullCount, PullResult, Rarity } from "../types";

export interface PullResultOverlayProps {
  results: PullResult[];
  pullCount: PullCount;
  onClose: () => void;
}

const PlaceholderCard = () => (
  <div
    className="flex h-52 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/5"
    aria-hidden="true"
  >
    <span className="animate-pulse text-2xl text-purple-300">✦</span>
  </div>
);

const PullSummary = ({ results }: { results: PullResult[] }) => {
  const newCount = results.filter((item) => item.isNew).length;

  return (
    <div className="mx-auto mt-6 flex max-w-xl animate-fade-in flex-wrap items-center justify-center gap-2 text-[11px]">
      {GACHA_CONFIG.rarityOrder.map((rarity: Rarity) => {
        const total = results.filter((item) => item.rarity === rarity).length;
        const theme = RARITY_THEME[rarity];

        return (
          <span key={rarity} className={`rounded-full px-3 py-1 font-semibold ${theme.badge}`}>
            {theme.label} × {total}
          </span>
        );
      })}
      <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 font-semibold text-emerald-200">
        Baru × {newCount}
      </span>
    </div>
  );
};

export const PullResultOverlay = ({ results, pullCount, onClose }: PullResultOverlayProps) => {
  const total = results.length;
  const [revealed, setRevealed] = useState<number>(0);
  const timersRef = useRef<number[]>([]);
  const dialogRef = useFocusTrap<HTMLDivElement>(true);
  const titleId = useId();
  const statusId = useId();

  useLockBodyScroll(true);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const handleSkip = useCallback(() => {
    clearTimers();
    setRevealed(total);
  }, [clearTimers, total]);

  useEffect(() => {
    clearTimers();
    setRevealed(0);

    if (total === 0) return;

    timersRef.current = results.map((_, index) =>
      window.setTimeout(
        () => {
          setRevealed((previous) => Math.max(previous, index + 1));
        },
        (index + 1) * GACHA_CONFIG.revealIntervalMs
      )
    );

    return clearTimers;
  }, [clearTimers, results, total]);

  const isComplete = revealed >= total;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      event.preventDefault();
      if (isComplete) {
        onClose();
      } else {
        handleSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSkip, isComplete, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={dialogRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex animate-fade-in flex-col bg-slate-950/95 backdrop-blur-md focus:outline-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={statusId}
    >
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-purple-300/80">Hasil Pull</p>
          <h2 id={titleId} className="text-base font-bold text-white sm:text-lg">
            {pullCount}x Pull · {total} karakter
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Saat animasi belum selesai hanya ada satu aksi: Skip ke semua kartu. */}
          {!isComplete ? (
            <Button variant="secondary" size="sm" onClick={handleSkip}>
              Skip
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={onClose}>
              Selesai
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <p id={statusId} role="status" aria-live="polite" className="sr-only">
          {revealed} dari {total} kartu ditampilkan.
        </p>

        <div className={total > 1 ? "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" : "mx-auto max-w-xs"}>
          {results.map((result, index) =>
            index < revealed ? (
              <WaifuResultCard key={result.pullId} result={result} />
            ) : (
              <PlaceholderCard key={result.pullId} />
            )
          )}
        </div>

        {isComplete && <PullSummary results={results} />}
      </div>
    </div>,
    document.body
  );
};
