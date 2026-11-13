import { usePlayerState } from "../../../context/PlayerStateContext";
import type { InventoryItem } from "../types";

export interface UseInventoryResult {
  items: InventoryItem[];
  isLoading: boolean;
  error: string | null;
  retry: () => Promise<void>;

  freeGemsAvailable: boolean;
  /** True selama state dompet masih dimuat pertama kali (indikator tombol). */
  isUserStateLoading: boolean;
  isClaimingFreeGems: boolean;
  freeGemsError: string | null;
  claimFreeGems: () => Promise<boolean>;
  nextFreeGemsAt: string | null;

  isResetting: boolean;
  resetError: string | null;
  resetData: () => Promise<boolean>;
}

export const useInventory = (): UseInventoryResult => {
  const context = usePlayerState();

  return {
    items: context.collection,
    isLoading: context.isCollectionLoading,
    error: context.collectionError,
    retry: context.refetchCollection,

    freeGemsAvailable: context.userState?.freeGemsAvailable ?? false,
    // Diteruskan apa adanya: dipakai `FreeGemsButton` untuk menampilkan state
    // "memuat" alih-alih salah menyimpulkan "sudah diklaim".
    isUserStateLoading: context.isUserStateLoading,
    isClaimingFreeGems: context.isClaimingFreeGems,
    freeGemsError: context.freeGemsError,
    claimFreeGems: context.claimFreeGems,
    nextFreeGemsAt: context.nextFreeGemsAt,

    isResetting: context.isResetting,
    resetError: context.resetError,
    resetData: context.resetData,
  };
};
