import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { fetchUserState } from "../features/gacha/api/gachaApi";
import {
  claimFreeGems as claimFreeGemsRequest,
  fetchCollection,
  resetData as resetDataRequest,
} from "../features/inventory/api/inventoryApi";
import { getErrorMessage } from "../utils/error";
import { nextLocalMidnight, normalizeIsoTime, sanitizeUserState } from "../utils/userState";
import type { UserState } from "../types/user";
import type { InventoryItem } from "../features/inventory/types";

/**
 * State global pemain.
 *
 * Alasan berada di `src/context/` (bukan di dalam `features/`):
 * wallet di `AppLayout`, halaman Gacha, dan halaman Koleksi harus membaca
 * state yang sama. Bila ditaruh di salah satu fitur, fitur lain akan
 * mengimpor lintas-fitur (coupling fitur→fitur) yang justru melanggar
 * batas modul. Context ini sengaja menjadi jembatan tipis: ia hanya
 * memakai `api/` publik gacha & inventory, tidak menyentuh komponen dalam
 * (memakai `index.ts` akan menarik komponen React dan membuat import cycle
 * lewat `useInventory`).
 */
export interface PlayerStateContextValue {
  userState: UserState | null;
  isUserStateLoading: boolean;
  userStateError: string | null;
  refetchUserState: () => Promise<void>;
  applyUserState: (patch: Partial<UserState>) => void;

  collection: InventoryItem[];
  isCollectionLoading: boolean;
  collectionError: string | null;
  refetchCollection: () => Promise<void>;

  isClaimingFreeGems: boolean;
  freeGemsError: string | null;
  claimFreeGems: () => Promise<boolean>;
  /** ISO string klaim Free Gems berikutnya, diambil dari API bila tersedia. */
  nextFreeGemsAt: string | null;

  isResetting: boolean;
  resetError: string | null;
  resetData: () => Promise<boolean>;
}

const PlayerStateContext = createContext<PlayerStateContextValue | null>(null);

export const PlayerStateProvider = ({ children }: { children: ReactNode }) => {
  const [userState, setUserState] = useState<UserState | null>(null);
  const [isUserStateLoading, setIsUserStateLoading] = useState<boolean>(true);
  const [userStateError, setUserStateError] = useState<string | null>(null);

  const [collection, setCollection] = useState<InventoryItem[]>([]);
  const [isCollectionLoading, setIsCollectionLoading] = useState<boolean>(true);
  const [collectionError, setCollectionError] = useState<string | null>(null);

  const [isClaimingFreeGems, setIsClaimingFreeGems] = useState<boolean>(false);
  const [freeGemsError, setFreeGemsError] = useState<string | null>(null);
  /** Waktu klaim berikutnya dari API (lebih otoritatif dari jam browser). */
  const [nextFreeGemsAtFromApi, setNextFreeGemsAtFromApi] = useState<string | null>(null);

  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(true);
  const pendingPatchRef = useRef<Partial<UserState>>({});

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const applyUserState = useCallback((patch: Partial<UserState>) => {
    if (Object.keys(patch).length === 0) return;

    setUserState((previous) => {
      if (!previous) {
        // State awal belum termuat: simpan patch agar digabung saat fetch selesai.
        pendingPatchRef.current = { ...pendingPatchRef.current, ...patch };
        return previous;
      }
      return sanitizeUserState({ ...previous, ...patch });
    });
  }, []);

  const refetchUserState = useCallback(async () => {
    setIsUserStateLoading(true);
    setUserStateError(null);

    try {
      const next = await fetchUserState();
      if (!isMountedRef.current) return;

      const patch = pendingPatchRef.current;
      pendingPatchRef.current = {};
      const merged = sanitizeUserState({ ...next, ...patch });
      setUserState(merged);

      // Hari baru → Free Gems kembali tersedia, jadwal klaim berikutnya direset.
      if (merged.freeGemsAvailable) {
        setNextFreeGemsAtFromApi(null);
      }
    } catch (error) {
      if (isMountedRef.current) setUserStateError(getErrorMessage(error, "Gagal memuat data dompet."));
    } finally {
      if (isMountedRef.current) setIsUserStateLoading(false);
    }
  }, []);

  const refetchCollection = useCallback(async () => {
    setIsCollectionLoading(true);
    setCollectionError(null);

    try {
      const items = await fetchCollection();
      if (isMountedRef.current) setCollection(items);
    } catch (error) {
      if (isMountedRef.current) setCollectionError(getErrorMessage(error, "Gagal memuat koleksi."));
    } finally {
      if (isMountedRef.current) setIsCollectionLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetchUserState();
    void refetchCollection();
  }, [refetchUserState, refetchCollection]);

  const claimFreeGems = useCallback(async (): Promise<boolean> => {
    if (isClaimingFreeGems) return false;

    setIsClaimingFreeGems(true);
    setFreeGemsError(null);

    try {
      const result = await claimFreeGemsRequest();
      if (!isMountedRef.current) return false;

      setUserState((previous) => {
        if (!previous) return previous;
        const gems = result.gems !== null ? result.gems : previous.gems;
        return sanitizeUserState({ ...previous, gems, freeGemsAvailable: result.freeGemsAvailable });
      });

      // Prioritaskan waktu dari API; fallback ke tengah malam lokal via memo
      // ketika backend tidak mengirimkannya.
      const normalized = normalizeIsoTime(result.nextAvailableAt);
      if (result.freeGemsAvailable) {
        setNextFreeGemsAtFromApi(null);
      } else {
        setNextFreeGemsAtFromApi(normalized);
      }

      return true;
    } catch (error) {
      if (isMountedRef.current) setFreeGemsError(getErrorMessage(error, "Gagal mengklaim Free Gems."));
      return false;
    } finally {
      if (isMountedRef.current) setIsClaimingFreeGems(false);
    }
  }, [isClaimingFreeGems]);

  const resetData = useCallback(async (): Promise<boolean> => {
    if (isResetting) return false;

    setIsResetting(true);
    setResetError(null);

    try {
      await resetDataRequest();
      if (!isMountedRef.current) return false;

      // State kembali ke awal: gems, pity, koleksi, dan jadwal Free Gems.
      setNextFreeGemsAtFromApi(null);
      await Promise.all([refetchUserState(), refetchCollection()]);
      return true;
    } catch (error) {
      if (isMountedRef.current) setResetError(getErrorMessage(error, "Gagal mereset data."));
      return false;
    } finally {
      if (isMountedRef.current) setIsResetting(false);
    }
  }, [isResetting, refetchUserState, refetchCollection]);

  const nextFreeGemsAt = useMemo(() => {
    if (!userState || userState.freeGemsAvailable) return null;
    return nextFreeGemsAtFromApi ?? nextLocalMidnight();
  }, [userState, nextFreeGemsAtFromApi]);

  /**
   * Auto-refetch tepat saat jadwal klaim berikutnya tiba, sehingga tombol
   * Free Gems otomatis aktif kembali tanpa user harus reload manual (AC4).
   *
   * `nextLocalMidnight()` deterministik per hari (ms=0), jadi nilai string
   * stabil dan efek ini tidak berjalan berulang tiap render.
   */
  useEffect(() => {
    if (!nextFreeGemsAt) return;

    const targetMs = Date.parse(nextFreeGemsAt);
    if (Number.isNaN(targetMs)) return;

    const delay = targetMs - Date.now();

    if (delay <= 0) {
      // Jadwal sudah lewat (mis. tab dibuka setelah tengah malam).
      void refetchUserState();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void refetchUserState();
    }, Math.min(delay + 500, 24 * 60 * 60 * 1000));

    return () => window.clearTimeout(timeoutId);
  }, [nextFreeGemsAt, refetchUserState]);

  const value = useMemo<PlayerStateContextValue>(
    () => ({
      userState,
      isUserStateLoading,
      userStateError,
      refetchUserState,
      applyUserState,
      collection,
      isCollectionLoading,
      collectionError,
      refetchCollection,
      isClaimingFreeGems,
      freeGemsError,
      claimFreeGems,
      nextFreeGemsAt,
      isResetting,
      resetError,
      resetData,
    }),
    [
      userState,
      isUserStateLoading,
      userStateError,
      refetchUserState,
      applyUserState,
      collection,
      isCollectionLoading,
      collectionError,
      refetchCollection,
      isClaimingFreeGems,
      freeGemsError,
      claimFreeGems,
      nextFreeGemsAt,
      isResetting,
      resetError,
      resetData,
    ],
  );

  return <PlayerStateContext.Provider value={value}>{children}</PlayerStateContext.Provider>;
};

/** Membaca context secara opsional (null bila tidak berada di dalam provider). */
export const useOptionalPlayerState = (): PlayerStateContextValue | null =>
  useContext(PlayerStateContext);

/** Membaca context dan melempar error bila dipakai di luar provider. */
export const usePlayerState = (): PlayerStateContextValue => {
  const context = useContext(PlayerStateContext);
  if (!context) {
    throw new Error("usePlayerState harus dipakai di dalam PlayerStateProvider.");
  }
  return context;
};
