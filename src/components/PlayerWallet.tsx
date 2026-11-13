import { usePlayerState } from "../context/PlayerStateContext";
import { formatNumber } from "../utils/format";

export interface PlayerWalletProps {
  className?: string;
}

/**
 * Indikator Gems di header.
 * Memakai `role="status"` supaya perubahan nilai Gems dibacakan screen reader
 * (aria-live polite implicit) dan makna dompet tersampaikan.
 */
export const PlayerWallet = ({ className = "" }: PlayerWalletProps) => {
  const { userState, isUserStateLoading, userStateError } = usePlayerState();

  const gems = userState?.gems ?? 0;

  return (
    <div
      role="status"
      aria-label="Dompet Gems"
      aria-busy={isUserStateLoading}
      className={`inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1.5 ${className}`}
    >
      <span aria-hidden="true">💎</span>
      <span className="text-sm font-bold text-amber-200">
        {isUserStateLoading ? "…" : formatNumber(gems)}
      </span>
      <span className="sr-only">Gems</span>
      {userStateError && (
        <span role="alert" className="text-[10px] font-bold text-rose-300">
          !
        </span>
      )}
    </div>
  );
};
