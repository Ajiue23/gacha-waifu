import { GachaButton } from "../../../components/GachaButton";
import { GACHA_CONFIG } from "../../../config/gacha";
import { formatNumber } from "../../../utils/format";
import type { PullCount } from "../types";

export interface PullButtonsProps {
  gems: number;
  isPulling: boolean;
  activeCount?: PullCount | null;
  /** State dompet masih dimuat — `gems` belum diketahui, bukan berarti 0. */
  isStateLoading?: boolean;
  /**
   * State user gagal dimuat. Dalam kondisi ini `gems` tidak diketahui (bukan 0),
   * jadi jangan tampilkan hint "Gems tidak cukup" yang menyesatkan.
   */
  hasStateError?: boolean;
  onPull: (count: PullCount) => void;
}

const STATE_ERROR_HINT = "Gagal memuat Gems, coba lagi";
const STATE_LOADING_HINT = "Memuat saldo Gems…";

export const PullButtons = ({
  gems,
  isPulling,
  activeCount = null,
  isStateLoading = false,
  hasStateError = false,
  onPull,
}: PullButtonsProps) => {
  const singleCost = GACHA_CONFIG.pullCost[1];
  const multiCost = GACHA_CONFIG.pullCost[10];

  const canSingle = gems >= singleCost;
  const canMulti = gems >= multiCost;

  /**
   * Urutan prioritas alasan tombol nonaktif:
   * 1. state gagal dimuat → arahkan retry
   * 2. state sedang dimuat → jelaskan kenapa tombol belum bisa dipakai
   * 3. saldo kurang
   */
  const describeDisabled = (canAfford: boolean): { hint?: string; tone: "error" | "info" } => {
    if (hasStateError) return { hint: STATE_ERROR_HINT, tone: "error" };
    if (isStateLoading) return { hint: STATE_LOADING_HINT, tone: "info" };
    if (!canAfford) return { hint: "Gems tidak cukup", tone: "error" };
    return { tone: "error" };
  };

  const single = describeDisabled(canSingle);
  const multi = describeDisabled(canMulti);

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" aria-busy={isPulling}>
      <GachaButton
        label="Pull 1x"
        subLabel={`${formatNumber(singleCost)} Gems`}
        onClick={() => onPull(1)}
        disabled={isStateLoading || hasStateError || isPulling || !canSingle}
        isAnimating={isPulling && activeCount === 1}
        hint={single.hint}
        hintTone={single.tone}
      />

      <GachaButton
        label="Pull 10x"
        subLabel={`${formatNumber(multiCost)} Gems`}
        variant="secondary"
        onClick={() => onPull(10)}
        disabled={isStateLoading || hasStateError || isPulling || !canMulti}
        isAnimating={isPulling && activeCount === 10}
        hint={multi.hint}
        hintTone={multi.tone}
      />
    </div>
  );
};
