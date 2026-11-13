import { useCallback, useEffect, useState } from "react";

export type AppRoute = "gacha" | "inventory";

const parseHash = (): AppRoute => {
  if (typeof window === "undefined") return "gacha";

  const hash = window.location.hash.replace(/^#\/?/, "").toLowerCase();
  if (hash === "koleksi" || hash === "inventory") return "inventory";
  return "gacha";
};

export interface UseHashRouteResult {
  route: AppRoute;
  navigate: (route: AppRoute) => void;
}

/**
 * Routing ringan berbasis hash sehingga perpindahan halaman
 * tidak memicu reload penuh.
 */
export const useHashRoute = (): UseHashRouteResult => {
  const [route, setRoute] = useState<AppRoute>(parseHash);

  useEffect(() => {
    const handleHashChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigate = useCallback((next: AppRoute) => {
    const target = next === "inventory" ? "#/koleksi" : "#/gacha";
    if (window.location.hash !== target) {
      window.location.hash = target;
    } else {
      setRoute(next);
    }
  }, []);

  return { route, navigate };
};
