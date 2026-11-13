import { PlayerStateProvider } from "./context/PlayerStateContext";
import { AppLayout } from "./layouts/AppLayout";
import { AppRoutes } from "./routes/AppRoutes";
import { useHashRoute } from "./hooks/useHashRoute";

/**
 * Satu-satunya pemasangan `useHashRoute` (single source of truth).
 * Route diturunkan ke `AppLayout` (status aktif nav) dan `AppRoutes` (halaman),
 * sehingga tidak ada dua listener `hashchange` yang menyimpan state terpisah.
 */
const App = () => {
  const { route } = useHashRoute();

  return (
    <PlayerStateProvider>
      <AppLayout route={route}>
        <AppRoutes route={route} />
      </AppLayout>
    </PlayerStateProvider>
  );
};

export default App;
