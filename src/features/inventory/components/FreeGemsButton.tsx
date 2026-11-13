import { useEffect, useMemo, useState } from "react";
import { Button } from "../../../components/Button";

export interface FreeGemsButtonProps {
  available: boolean;
  /** State dompet belum termuat — jangan tipu user dengan label "sudah diklaim". */
  isLoading?: boolean;
  isClaiming?: boolean;
  nextAvailableAt?: string | null;
  error?: string | null;
  onClaim: () => void;
}

const formatRemaining = (targetMs: number, nowMs: number): string => {
  const totalSeconds = Math.max(0, Math.floor((targetMs - nowMs) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
};

export const FreeGemsButton = ({
  available,
  isLoading = false,
  isClaiming = false,
  nextAvailableAt = null,
  error = null,
  onClaim,
}: FreeGemsButtonProps) => {
  const targetMs = useMemo(
    () => (nextAvailableAt ? Date.parse(nextAvailableAt) : Number.NaN),
    [nextAvailableAt],
  );
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (isLoading || available || Number.isNaN(targetMs)) return;

    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, [isLoading, available, targetMs]);

  const remaining =
    !isLoading && !available && !Number.isNaN(targetMs) ? formatRemaining(targetMs, now) : null;
  const disabled = isLoading || isClaiming || !available;

  const label = isLoading
    ? "Memuat..."
    : isClaiming
      ? "Mengklaim..."
      : available
        ? "Klaim Free Gems"
        : "Sudah diklaim hari ini";

  const ariaLabel = isLoading
    ? "Memuat status Free Gems"
    : available
      ? "Klaim Free Gems harian"
      : "Free Gems sudah diklaim hari ini";

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="secondary"
        size="sm"
        onClick={onClaim}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-busy={isLoading || isClaiming}
      >
        <span aria-hidden="true">🎁</span>
        {label}
      </Button>

      {remaining && (
        <span className="text-[11px] text-slate-400">
          Tersedia lagi dalam <span className="font-semibold text-amber-300">{remaining}</span>
        </span>
      )}

      {error && (
        <span role="alert" className="text-[11px] text-rose-300">
          {error}
        </span>
      )}
    </div>
  );
};
