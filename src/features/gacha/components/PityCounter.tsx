import { formatNumber } from "../../../utils/format";

export interface PityCounterProps {
  pity: number;
  limit: number;
  isLoading?: boolean;
  /** State user gagal dimuat — jangan tampilkan "0/90" yang menyesatkan. */
  hasError?: boolean;
}

export const PityCounter = ({ pity, limit, isLoading = false, hasError = false }: PityCounterProps) => {
  const safeLimit = Math.max(limit, 1);
  const current = Math.max(0, Math.min(pity, safeLimit));
  const remaining = Math.max(safeLimit - current, 0);
  const percent = Math.min(100, Math.round((current / safeLimit) * 100));

  if (isLoading) {
    return (
      <section
        aria-busy="true"
        aria-label="Memuat pity counter"
        className="rounded-3xl border border-white/10 bg-slate-900/60 p-4"
      >
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 rounded-full bg-white/10" />
          <div className="h-2 w-full rounded-full bg-white/10" />
          <div className="h-3 w-40 rounded-full bg-white/10" />
        </div>
      </section>
    );
  }

  if (hasError) {
    return (
      <section
        className="rounded-3xl border border-rose-500/40 bg-rose-500/10 p-4"
        aria-label="Pity counter tidak tersedia"
        role="alert"
      >
        <h3 className="text-sm font-semibold text-rose-100">Pity Garansi 5★</h3>
        <p className="mt-2 text-xs leading-relaxed text-rose-200">
          Data pity gagal dimuat. Muat ulang data user dari panel pull.
        </p>
      </section>
    );
  }

  return (
    <section
      className="rounded-3xl border border-white/10 bg-slate-900/60 p-4"
      aria-label="Pity counter garansi 5 bintang"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-200">Pity Garansi 5★</h3>
        <p className="text-sm font-bold text-amber-300">
          {formatNumber(current)}
          <span className="text-slate-400"> / {formatNumber(safeLimit)}</span>
        </p>
      </div>

      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeLimit}
        aria-valuenow={current}
        aria-label="Progres pity menuju garansi 5 bintang"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-300">
        {remaining === 0 ? (
          <span className="font-semibold text-amber-300">Garansi 5★ siap di pull berikutnya!</span>
        ) : (
          <>
            Sisa <strong className="text-white">{formatNumber(remaining)}</strong> pull menuju garansi 5★.
          </>
        )}
      </p>
    </section>
  );
};
