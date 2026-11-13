import { WaifuCard } from "../../../components/WaifuCard";
import { RARITY_THEME } from "../../../utils/rarity";
import type { PullResult } from "../types";

export interface WaifuResultCardProps {
  result: PullResult;
}

export const WaifuResultCard = ({ result }: WaifuResultCardProps) => {
  const theme = RARITY_THEME[result.rarity];

  return (
    <div className="relative animate-pop-in">
      <span
        className={`pointer-events-none absolute -inset-3 animate-rarity-burst rounded-3xl blur-2xl ${theme.aura}`}
        aria-hidden="true"
      />
      <WaifuCard
        className="relative h-full"
        name={result.name}
        image={result.image}
        rarity={result.rarity}
        description={result.description}
        animateShine={result.rarity >= 4}
        badge={
          result.isNew ? (
            <span className="absolute left-2 top-2 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-950">
              Baru
            </span>
          ) : undefined
        }
      />
    </div>
  );
};
