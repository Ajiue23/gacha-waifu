import { useCallback, useEffect, useRef, useState } from "react";
import { fetchUserState } from "../api/gachaApi";
import { getErrorMessage } from "../../../utils/error";
import { sanitizeUserState as sanitize } from "../../../utils/userState";
import { useOptionalPlayerState } from "../../../context/PlayerStateContext";
import type { UserState } from "../types";

export interface UseUserStateResult {
  state: UserState | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  /** Sinkronisasi state dari respons API (misal setelah pull) tanpa reload halaman. */
  applyUserState: (patch: Partial<UserState>) => void;
}

/**
 * Fallback mandiri saat hook dipakai di luar `PlayerStateProvider`
 * (mis. unit test). Bila provider tersedia, state dibaca dari context global
 * agar wallet di layout, gacha, dan koleksi selalu sinkron.
 */
const useStandaloneUserState = (enabled: boolean): UseUserStateResult => {
  const [state, setState] = useState<UserState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(true);
  const pendingPatchRef = useRef<Partial<UserState>>({});

  const load = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const next = await fetchUserState();
      if (!isMountedRef.current) return;

      const patch = pendingPatchRef.current;
      pendingPatchRef.current = {};
      setState(sanitize({ ...next, ...patch }));
    } catch (fetchError) {
      if (isMountedRef.current) setError(getErrorMessage(fetchError, "Gagal memuat data user."));
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    isMountedRef.current = true;
    if (enabled) void load();

    return () => {
      isMountedRef.current = false;
    };
  }, [enabled, load]);

  const applyUserState = useCallback((patch: Partial<UserState>) => {
    if (Object.keys(patch).length === 0) return;

    setState((previous) => {
      if (!previous) {
        pendingPatchRef.current = { ...pendingPatchRef.current, ...patch };
        return previous;
      }
      return sanitize({ ...previous, ...patch });
    });
  }, []);

  return { state, isLoading, error, refetch: load, applyUserState };
};

export const useUserState = (): UseUserStateResult => {
  const context = useOptionalPlayerState();
  const fallback = useStandaloneUserState(context === null);

  if (context) {
    return {
      state: context.userState,
      isLoading: context.isUserStateLoading,
      error: context.userStateError,
      refetch: context.refetchUserState,
      applyUserState: context.applyUserState,
    };
  }

  return fallback;
};
