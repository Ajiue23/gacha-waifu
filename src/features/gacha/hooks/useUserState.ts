import { useCallback, useEffect, useRef, useState } from "react";
import { fetchUserState } from "../api/gachaApi";
import { GACHA_CONFIG } from "../../../config/gacha";
import { getErrorMessage } from "../../../utils/error";
import type { UserState } from "../types";

export interface UseUserStateResult {
  state: UserState | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  /** Sinkronisasi state dari respons API (misal setelah pull) tanpa reload halaman. */
  applyUserState: (patch: Partial<UserState>) => void;
}

export const EMPTY_STATE: UserState = {
  gems: 0,
  pity: 0,
  pityLimit: GACHA_CONFIG.pityLimit,
  freeGemsAvailable: false,
};

const sanitize = (value: UserState): UserState => {
  const pityLimit = value.pityLimit > 0 ? value.pityLimit : GACHA_CONFIG.pityLimit;

  return {
    gems: Math.max(0, Math.round(value.gems)),
    pity: Math.max(0, Math.min(Math.round(value.pity), pityLimit)),
    pityLimit,
    freeGemsAvailable: Boolean(value.freeGemsAvailable),
  };
};

export const useUserState = (): UseUserStateResult => {
  const [state, setState] = useState<UserState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(true);
  /** Salinan state terbaru agar `applyUserState` tidak bergantung pada render. */
  const stateRef = useRef<UserState | null>(null);
  /**
   * Patch dari respons pull yang datang saat state awal belum tersedia.
   * Selalu dikosongkan setelah digabung pada fetch berikutnya, agar refetch
   * tidak menimpa data server dengan patch lama.
   */
  const pendingPatchRef = useRef<Partial<UserState>>({});

  /** Satu-satunya pintu penulisan state: ref dan React state selalu sinkron. */
  const commit = useCallback((next: UserState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const next = await fetchUserState();
      if (!isMountedRef.current) return;

      const localPatch = pendingPatchRef.current;
      pendingPatchRef.current = {};

      commit(sanitize({ ...next, ...localPatch }));
    } catch (fetchError) {
      if (isMountedRef.current) setError(getErrorMessage(fetchError, "Gagal memuat data user."));
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [commit]);

  useEffect(() => {
    isMountedRef.current = true;
    void load();

    return () => {
      isMountedRef.current = false;
    };
  }, [load]);

  /**
   * AC6 — dipakai `useGacha` setelah `postPull` agar Gems & pity langsung
   * ter-update di UI tanpa reload. Patch di-*merge* ke state terakhir.
   */
  const applyUserState = useCallback(
    (patch: Partial<UserState>) => {
      if (Object.keys(patch).length === 0) return;

      const current = stateRef.current;

      // State belum pernah termuat → antrekan patch sampai fetch pertama selesai.
      if (!current) {
        pendingPatchRef.current = { ...pendingPatchRef.current, ...patch };
      }

      commit(sanitize({ ...(current ?? EMPTY_STATE), ...patch }));
    },
    [commit]
  );

  return { state, isLoading, error, refetch: load, applyUserState };
};
