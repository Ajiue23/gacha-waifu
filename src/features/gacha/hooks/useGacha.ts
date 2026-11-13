import { useCallback, useEffect, useRef, useState } from "react";
import { FALLBACK_BANNER, fetchBanner, postPull } from "../api/gachaApi";
import { useUserState } from "./useUserState";
import { useOptionalPlayerState } from "../../../context/PlayerStateContext";
import { GACHA_CONFIG } from "../../../config/gacha";
import { getErrorMessage } from "../../../utils/error";
import type { Banner, PullCount, PullResult, UserState } from "../types";

export interface UseGachaResult {
  banner: Banner;
  isBannerLoading: boolean;
  bannerError: string | null;
  retryBanner: () => void;

  /** State dompet aktif (dari context global atau fallback standalone). */
  userState: UserState | null;
  isUserStateLoading: boolean;
  userStateError: string | null;
  retryUserState: () => void;

  isPulling: boolean;
  pullError: string | null;
  activePullCount: PullCount | null;
  results: PullResult[];
  isResultOpen: boolean;
  /** Riwayat pull yang disimpan (dibatasi `GACHA_CONFIG.maxHistory`). */
  history: PullResult[];
  /** Total karakter yang benar-benar di-pull pada sesi ini (tidak dibatasi maxHistory). */
  totalPulls: number;
  /** Akumulasi hasil pull sejak halaman dibuka (untuk indikator "koleksi +N"). */
  pulledCount: number;

  pull: (count: PullCount) => Promise<void>;
  closeResult: () => void;
  clearPullError: () => void;
  canPull: (count: PullCount) => boolean;
}

export const useGacha = (): UseGachaResult => {
  const {
    state: userState,
    isLoading: isUserStateLoading,
    error: userStateError,
    refetch: retryUserState,
    applyUserState,
  } = useUserState();

  /**
   * Bila berada di dalam `PlayerStateProvider`, sinkronkan koleksi global
   * setelah pull agar karakter baru langsung tampil di halaman Koleksi.
   * Ref disinkronkan lewat `useEffect` (bukan saat render) agar identitas
   * callback `pull` stabil dan tidak ada mutasi ref saat render.
   */
  const playerState = useOptionalPlayerState();
  const refetchCollectionRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    refetchCollectionRef.current = playerState?.refetchCollection ?? null;
  }, [playerState?.refetchCollection]);

  const [banner, setBanner] = useState<Banner>(FALLBACK_BANNER);
  const [isBannerLoading, setIsBannerLoading] = useState<boolean>(true);
  const [bannerError, setBannerError] = useState<string | null>(null);

  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [pullError, setPullError] = useState<string | null>(null);
  const [activePullCount, setActivePullCount] = useState<PullCount | null>(null);
  const [results, setResults] = useState<PullResult[]>([]);
  const [isResultOpen, setIsResultOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<PullResult[]>([]);
  const [pulledCount, setPulledCount] = useState<number>(0);

  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadBanner = useCallback(async () => {
    setIsBannerLoading(true);
    setBannerError(null);

    try {
      const next = await fetchBanner();
      if (isMountedRef.current) setBanner(next);
    } catch (fetchError) {
      if (!isMountedRef.current) return;
      setBanner(FALLBACK_BANNER);
      setBannerError(getErrorMessage(fetchError, "Gagal memuat banner."));
    } finally {
      if (isMountedRef.current) setIsBannerLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBanner();
  }, [loadBanner]);

  const canPull = useCallback(
    (count: PullCount): boolean => {
      if (isPulling) return false;
      const gems = userState?.gems ?? 0;
      return gems >= GACHA_CONFIG.pullCost[count];
    },
    [isPulling, userState],
  );

  const pull = useCallback(
    async (count: PullCount) => {
      if (!canPull(count)) return;

      setIsPulling(true);
      setPullError(null);
      setActivePullCount(count);

      try {
        const response = await postPull(count);
        if (!isMountedRef.current) return;

        setResults(response.results);
        setIsResultOpen(true);
        setHistory((previous) =>
          [...response.results, ...previous].slice(0, GACHA_CONFIG.maxHistory),
        );
        setPulledCount((previous) => previous + response.results.length);

        // Wallet (gems/pity) langsung sinkron di seluruh layout.
        applyUserState(response.userState);

        // Pull dapat menghasilkan karakter baru → muat ulang koleksi global
        // supaya halaman Koleksi tidak perlu refresh manual (AC1/AC3).
        const refetchCollection = refetchCollectionRef.current;
        if (refetchCollection) {
          void refetchCollection();
        }
      } catch (error) {
        if (isMountedRef.current) {
          setPullError(getErrorMessage(error, "Pull gagal. Coba lagi beberapa saat."));
        }
      } finally {
        if (isMountedRef.current) {
          setIsPulling(false);
          setActivePullCount(null);
        }
      }
    },
    [canPull, applyUserState],
  );

  const closeResult = useCallback(() => setIsResultOpen(false), []);
  const clearPullError = useCallback(() => setPullError(null), []);

  return {
    banner,
    isBannerLoading,
    bannerError,
    retryBanner: () => {
      void loadBanner();
    },

    userState,
    isUserStateLoading,
    userStateError,
    retryUserState: () => {
      void retryUserState();
    },

    isPulling,
    pullError,
    activePullCount,
    results,
    isResultOpen,
    history,
    totalPulls: pulledCount,
    pulledCount,

    pull,
    closeResult,
    clearPullError,
    canPull,
  };
};
