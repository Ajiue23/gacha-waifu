import type { ReactNode } from "react";
import type { Rarity } from "../types/rarity";
import { RARITY_THEME } from "../utils/rarity";

export interface WaifuCardProps {
  name: string;
  image: string;
  rarity: Rarity;
  description?: string;
  badge?: ReactNode;
  animateShine?: boolean;
  className?: string;
}

const FALLBACK_IMAGE = "/assets/waifus/waifu1.jpg";

export const WaifuCard = ({
  name,
  image,
  rarity,
  description,
  badge,
  animateShine = false,
  className = "",
}: WaifuCardProps) => {
  const theme = RARITY_THEME[rarity];

  return (
    <article
      data-rarity={rarity}
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-b ${theme.border} ${theme.surface} ${theme.glow} ${className}`}
    >
      <div className="relative h-40 overflow-hidden sm:h-44">
        <img
          src={image || FALLBACK_IMAGE}
          alt={`Ilustrasi ${name}`}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent"
          aria-hidden="true"
        />
        <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ${theme.badge}`}>
          {theme.label}
        </span>
        {badge}
      </div>

      <div className="relative space-y-1.5 p-3">
        <h3 className="truncate text-sm font-bold text-white sm:text-base">{name}</h3>

        {/* Bintang dibungkus `role="img"` + aria-label: role `paragraph`
            bersifat naming-prohibited sehingga label pada <p> akan diabaikan. */}
        <span role="img" aria-label={`Rarity ${theme.stars} bintang`} className={`text-xs ${theme.text}`}>
          {"★".repeat(theme.stars)}
        </span>

        {description && <p className="line-clamp-2 text-[11px] leading-relaxed text-slate-300">{description}</p>}
      </div>

      {animateShine && (
        <span
          className="pointer-events-none absolute inset-0 animate-shine bg-gradient-to-r from-transparent via-white/25 to-transparent"
          aria-hidden="true"
        />
      )}
    </article>
  );
};
