import type { SyntheticEvent } from "react";
import { Button } from "../../../components/Button";
import { RARITY_THEME } from "../../../utils/rarity";
import type { Banner } from "../types";

export interface GachaBannerProps {
  banner: Banner;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const FALLBACK_IMAGE = "/assets/waifus/waifu1.jpg";

const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = FALLBACK_IMAGE;
};

export const GachaBanner = ({ banner, isLoading = false, error = null, onRetry }: GachaBannerProps) => {
  if (isLoading) {
    return (
      <section
        aria-busy="true"
        aria-label="Memuat banner"
        className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-7"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-28 rounded-full bg-white/10" />
          <div className="h-7 w-3/4 rounded-xl bg-white/10" />
          <div className="h-4 w-1/2 rounded-full bg-white/10" />
          <div className="h-40 w-full rounded-2xl bg-white/10" />
        </div>
      </section>
    );
  }

  const { featured } = banner;
  const theme = RARITY_THEME[featured.rarity];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-950/80 via-slate-950 to-slate-950 p-5 sm:p-7">
      <div
        className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-purple-600/30 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex-1 space-y-2">
          <span className="inline-flex items-center rounded-full border border-purple-400/40 bg-purple-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-200">
            Banner Aktif
          </span>
          <h2 className="text-xl font-bold text-white sm:text-2xl">{banner.title}</h2>
          <p className="max-w-md text-sm leading-relaxed text-slate-300">{banner.subtitle}</p>

          {banner.rateUp.length > 0 && (
            <ul className="flex flex-wrap gap-1.5 pt-1">
              {banner.rateUp.map((character) => (
                <li
                  key={character.id}
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${RARITY_THEME[character.rarity].badge}`}
                >
                  {character.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <figure
          className={`relative w-full overflow-hidden rounded-2xl border bg-slate-950 sm:w-64 ${theme.border} ${theme.glow}`}
        >
          <img
            src={featured.image || FALLBACK_IMAGE}
            alt={`Karakter unggulan ${featured.name}`}
            className="h-40 w-full object-cover sm:h-44"
            onError={handleImageError}
          />
          <figcaption className="absolute inset-x-0 bottom-0 space-y-0.5 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent p-3">
            <p className={`text-[11px] font-bold uppercase tracking-[0.16em] ${theme.text}`}>
              {theme.label} Unggulan
            </p>
            <p className="text-sm font-semibold text-white">{featured.name}</p>
          </figcaption>
        </figure>
      </div>

      {error && (
        <div
          className="relative mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100"
          role="status"
        >
          <span>{error} Menampilkan banner bawaan.</span>
          {onRetry && (
            <Button variant="secondary" size="sm" onClick={onRetry}>
              Muat ulang
            </Button>
          )}
        </div>
      )}
    </section>
  );
};
