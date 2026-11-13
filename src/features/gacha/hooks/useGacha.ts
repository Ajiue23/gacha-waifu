import { useCallback, useEffect, useRef, useState } from "react";
import { FALLBACK_BANNER, fetchBanner, postPull } from "../api/gachaApi";
import { useUserState } from "./useUserState";
import { GACHA_CONFIG } from "../../../config/gacha";
import { getErrorMessage } from "../../../utils/error";
import type { Banner, PullCount, PullResult, UserState } from "../types";

export interface UseGachaResult {
  banner: Banner;
  isBannerLoading: boolean;
  bannerError: string | null;
  retryBanner: () => void;

  userState: UserState | null;
  isUserStateLoading: boolean;
  userStateError: string | null;
  retryUserState: () => void;

  isPulling: boolean;
  pullError: string | null;
  activePullCount: PullCount | null;
  /**
   * Hasil pull terakhir. Identitas array HANYA berubah saat pull baru selesai,
   * sehingga `useEffect` animasi di `PullResultOverlay` tidak ter-reset
   * pada re-render biasa (mis. saat Gems/pity berubah).
   */
  results: PullResult[];
  isResultOpen: boolean;
  /** Riwayat pull yang disimpan (dibatasi `GACHA_CONFIG.maxHistory`). */
  history: PullResult[];
  /** Total karakter yang benar-benar di-pull pada sesi ini (tidak dibatasi maxHistory). */
  totalPulls: number;

  pull: (count: PullCount) => Promise<void>;
  closeResult: () => void;
  clearPullError: () => void;
  canPull: (count: PullCount) => boolean;
}

export const useGacha = (): UseGachaResult => {
  const { state: userState, isLoading: isUserStateLoading, error: userStateError, refetch, applyUserState } =
    useUserState();

  const [banner, setBanner] = useState<Banner>(FALLBACK_BANNER);
  const [isBannerLoading, setIsBannerLoading] = useState<boolean>(true);
  const [bannerError, setBannerError] = useState<string | null>(null);

  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [pullError, setPullError] = useState<string | null>(null);
  const [activePullCount, setActivePullCount] = useState<PullCount | null>(null);
  const [results, setResults] = useState<PullResult[]>([]);
  const [isResultOpen, setIsResultOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<PullResult[]>([]);
  const [totalPulls, setTotalPulls] = useState<number>(0);

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
      if (!userState || isPulling) return false;
      return userState.gems >= GACHA_CONFIG.pullCost[count];
    },
    [isPulling, userState]
  );

  const pull = useCallback(
    async (count: PullCount) => {
      if (isPulling) return;

      setIsPulling(true);
      setPullError(null);
      setActivePullCount(count);
      setResults([]);
      setIsResultOpen(false);

      try {
        const response = await postPull(count);
        if (!isMountedRef.current) return;

        setResults(response.results);

        // AC6: state user (Gems + pity) di-merge dari respons API → UI langsung
        // memperbarui dompet & pity counter tanpa reload halaman.
        applyUserState(response.userState);

        if (response.results.length > 0) {
          setHistory((previous) => [...response.results, ...previous].slice(0, GACHA_CONFIG.maxHistory));
          setTotalPulls((previous) => previous + response.results.length);
          setIsResultOpen(true);
        } else {
          setPullError("Server tidak mengembalikan hasil pull.");
        }
      } catch (pullFailure) {
        if (isMountedRef.current) {
          setPullError(getErrorMessage(pullFailure, "Gagal melakukan pull."));
        }
      } finally {
        if (isMountedRef.current) setIsPulling(false);
      }
    },
    [applyUserState, isPulling]
  );

  const closeResult = useCallback(() => {
    setIsResultOpen(false);
    setResults([]);
  }, []);

  const clearPullError = useCallback(() => setPullError(null), []);

  return {
    banner,
    isBannerLoading,
    bannerError,
    retryBanner: loadBanner,

    userState,
    isUserStateLoading,
    userStateError,
    retryUserState: refetch,

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
    canPull,
  };
};
