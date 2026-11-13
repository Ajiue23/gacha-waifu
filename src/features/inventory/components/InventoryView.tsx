import { FreeGemsButton } from "./FreeGemsButton";
import { InventoryGrid } from "./InventoryGrid";
import { ResetDataButton } from "./ResetDataButton";
import { useInventory } from "../hooks/useInventory";

export const InventoryView = () => {
  const {
    items,
    isLoading,
    error,
    retry,
    freeGemsAvailable,
    isUserStateLoading,
    isClaimingFreeGems,
    freeGemsError,
    claimFreeGems,
    nextFreeGemsAt,
    isResetting,
    resetError,
    resetData,
  } = useInventory();

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-white sm:text-xl">Koleksi Waifu</h2>
          <p className="text-xs text-slate-300">
            Semua karakter yang sudah kamu miliki beserta jumlah duplikatnya.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FreeGemsButton
            available={freeGemsAvailable}
            isLoading={isUserStateLoading}
            isClaiming={isClaimingFreeGems}
            nextAvailableAt={nextFreeGemsAt}
            error={freeGemsError}
            onClaim={claimFreeGems}
          />
          <ResetDataButton onReset={resetData} isResetting={isResetting} error={resetError} />
        </div>
      </header>

      <InventoryGrid items={items} isLoading={isLoading} error={error} onRetry={retry} />
    </div>
  );
};
