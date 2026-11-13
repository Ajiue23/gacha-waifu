import { useState } from "react";
import { Button } from "../../../components/Button";
import { HistoryDrawer } from "../../../components/HistoryDrawer";
import { GACHA_CONFIG } from "../../../config/gacha";
import { formatNumber } from "../../../utils/format";
import { GachaBanner } from "./GachaBanner";
import { PityCounter } from "./PityCounter";
import { PullButtons } from "./PullButtons";
import { PullResultOverlay } from "./PullResultOverlay";
import { useGacha } from "../hooks/useGacha";

export const GachaView = () => {
  const {
    banner,
    isBannerLoading,
    bannerError,
    retryBanner,
    userState,
    isUserStateLoading,
    userStateError,
    retryUserState,
    isPulling,
    pullError,
    activePullCount,
    results,
    isResultOpen,
    history,
    totalPulls,
    pull,
    closeResult,
    clearPullError,
  } = useGacha();

  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const hasStateError = Boolean(userStateError);

  const gemsLabel = isUserStateLoading ? "..." : hasStateError ? "—" : formatNumber(userState?.gems ?? 0);

  /* Live region: perubahan saldo & pity setelah pull diumumkan ke screen reader. */
  const stateAnnouncement = isUserStateLoading
    ? "Memuat saldo Gems."
    : hasStateError
      ? "Gagal memuat saldo Gems."
      : `Saldo ${formatNumber(userState?.gems ?? 0)} Gems. Pity ${formatNumber(
          userState?.pity ?? 0
        )} dari ${formatNumber(userState?.pityLimit ?? GACHA_CONFIG.pityLimit)}.`;

  return (
    <div className="space-y-5">
      <p role="status" aria-live="polite" className="sr-only">
        {stateAnnouncement}
      </p>

      <GachaBanner banner={banner} isLoading={isBannerLoading} error={bannerError} onRetry={retryBanner} />

      <div className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
        <PityCounter
          pity={userState?.pity ?? 0}
          limit={userState?.pityLimit ?? GACHA_CONFIG.pityLimit}
          isLoading={isUserStateLoading}
          hasError={hasStateError}
        />

        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-4" aria-label="Panel pull">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-sm text-slate-300">Gems kamu</span>
            <span className="text-lg font-bold text-amber-300">
              <span aria-hidden="true">💎</span> {gemsLabel}
            </span>
          </div>

          <PullButtons
            gems={userState?.gems ?? 0}
            isPulling={isPulling}
            activeCount={activePullCount}
            isStateLoading={isUserStateLoading}
            hasStateError={hasStateError}
            onPull={pull}
          />

          {userStateError && (
            <div
              className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200"
              role="alert"
            >
              <span>{userStateError}</span>
              <Button variant="ghost" size="sm" onClick={retryUserState}>
                Coba lagi
              </Button>
            </div>
          )}

          {pullError && (
            <div
              className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200"
              role="alert"
            >
              <span>{pullError}</span>
              <Button variant="ghost" size="sm" onClick={clearPullError}>
                Tutup
              </Button>
            </div>
          )}
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-slate-300">
        <div className="space-y-0.5">
          <p>
            Total pull sesi ini: <strong className="text-white">{formatNumber(totalPulls)}</strong>
          </p>
          <p className="text-xs text-slate-400">
            Hasil tersimpan:{" "}
            <strong className="text-slate-200">
              {formatNumber(history.length)} / {formatNumber(GACHA_CONFIG.maxHistory)}
            </strong>
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsHistoryOpen(true)}
          disabled={history.length === 0}
        >
          Lihat riwayat
        </Button>
      </div>

      {isResultOpen && results.length > 0 && (
        <PullResultOverlay
          results={results}
          pullCount={activePullCount ?? (results.length > 1 ? 10 : 1)}
          onClose={closeResult}
        />
      )}

      {isHistoryOpen && (
        <HistoryDrawer
          items={history.map((item) => ({
            id: item.pullId,
            name: item.name,
            image: item.image,
            rarity: item.rarity,
          }))}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}
    </div>
  );
};
