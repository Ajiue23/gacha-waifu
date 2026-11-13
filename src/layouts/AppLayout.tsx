import type { ReactNode } from "react";
import { PlayerWallet } from "../components/PlayerWallet";
import type { AppRoute } from "../hooks/useHashRoute";

export interface AppLayoutProps {
  children: ReactNode;
  /** Route aktif dari satu sumber kebenaran (`useHashRoute` di `App`). */
  route: AppRoute;
}

const PARTICLES = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  top: (index * 37) % 100,
  left: (index * 61) % 100,
  size: 3 + (index % 4) * 2,
  duration: 12 + (index % 6) * 2,
  delay: (index % 5) * 1.2,
}));

const NAV_ITEMS = [
  { key: "gacha", href: "#/gacha", label: "Gacha" },
  { key: "inventory", href: "#/koleksi", label: "Koleksi" },
] as const;

export const AppLayout = ({ children, route }: AppLayoutProps) => (
  <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-purple-950 via-slate-950 to-black text-white">
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {PARTICLES.map((particle) => (
        <span
          key={particle.id}
          className="absolute animate-gacha-float rounded-full bg-white/25"
          style={{
            top: `${particle.top}%`,
            left: `${particle.left}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>

    <header className="relative z-20 px-4 pb-4 pt-6">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-center sm:text-left">
          <h1 className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
            Gacha Waifu
          </h1>
          <p className="mx-auto mt-1 max-w-md text-xs text-purple-200/80 sm:mx-0 sm:text-sm">
            Uji keberuntunganmu dan kumpulkan waifu 3★ hingga 5★!
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 sm:justify-end">
          <PlayerWallet />
        </div>
      </div>

      <nav
        aria-label="Navigasi utama"
        className="mx-auto mt-4 flex w-full max-w-4xl items-center justify-center gap-2 sm:justify-start"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = route === item.key;
          return (
            <a
              key={item.key}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 ${
                isActive ? "bg-white/15 text-white" : "text-purple-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </a>
          );
        })}
      </nav>
    </header>

    <main className="relative z-10 flex-1 px-4 pb-12">{children}</main>

    <footer className="relative z-10 pb-6 text-center text-xs text-purple-300/60">
      © {new Date().getFullYear()} Gacha Waifu Simulator
    </footer>
  </div>
);
