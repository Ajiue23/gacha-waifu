import type { ReactNode } from "react";

export interface AppLayoutProps {
  children: ReactNode;
}

const PARTICLES = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  top: (index * 37) % 100,
  left: (index * 61) % 100,
  size: 3 + (index % 4) * 2,
  duration: 12 + (index % 6) * 2,
  delay: (index % 5) * 1.2,
}));

export const AppLayout = ({ children }: AppLayoutProps) => (
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

    <header className="relative z-10 px-4 pb-6 pt-10 text-center">
      <h1 className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-3xl font-extrabold text-transparent sm:text-5xl">
        Gacha Waifu
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-purple-200/80 sm:text-base">
        Uji keberuntunganmu dan dapatkan waifu 3★ hingga 5★!
      </p>
    </header>

    <main className="relative z-10 flex-1 px-4 pb-12">{children}</main>

    <footer className="relative z-10 pb-6 text-center text-xs text-purple-300/60">
      © {new Date().getFullYear()} Gacha Waifu Simulator
    </footer>
  </div>
);
