import { useId } from "react";

export interface GachaButtonProps {
  label: string;
  subLabel?: string;
  /** Alasan tombol tidak aktif; dibacakan lewat `aria-describedby`. */
  hint?: string;
  /** Nada hint: `error` untuk saldo kurang, `info` untuk state memuat. */
  hintTone?: "error" | "info";
  onClick: () => void;
  disabled?: boolean;
  isAnimating?: boolean;
  variant?: "primary" | "secondary";
  ariaLabel?: string;
  className?: string;
}

const VARIANT_GRADIENT: Record<"primary" | "secondary", string> = {
  primary: "from-pink-500 to-purple-600",
  secondary: "from-indigo-500 to-violet-600",
};

export const GachaButton = ({
  label,
  subLabel,
  hint,
  hintTone = "error",
  onClick,
  disabled = false,
  isAnimating = false,
  variant = "primary",
  ariaLabel,
  className = "",
}: GachaButtonProps) => {
  const isDisabled = disabled || isAnimating;
  const gradient = VARIANT_GRADIENT[variant];
  const baseId = useId();
  const hintId = `${baseId}-hint`;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        aria-label={ariaLabel ?? `${label}${subLabel ? `, ${subLabel}` : ""}`}
        aria-busy={isAnimating}
        aria-describedby={hint ? hintId : undefined}
        className={`group relative inline-flex w-full items-center justify-center rounded-2xl font-bold text-white transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 disabled:cursor-not-allowed disabled:opacity-60 ${
          isDisabled ? "" : "hover:-translate-y-0.5 active:translate-y-0"
        }`}
      >
        {!isDisabled && (
          <span
            className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${gradient} opacity-70 blur-md transition-opacity group-hover:opacity-100`}
            aria-hidden="true"
          />
        )}

        <span
          className={`relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${gradient} px-4 py-2.5`}
        >
          <span aria-hidden="true">{isAnimating ? "✨" : "🎴"}</span>
          <span className="flex flex-col items-start leading-tight">
            <span>{isAnimating ? "Summoning..." : label}</span>
            {subLabel && (
              /* Kontras: gradient pink→purple membuat white/80 marginal,
                 jadi dipakai putih penuh + drop-shadow tipis. */
              <span className="text-[11px] font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]">
                {subLabel}
              </span>
            )}
          </span>
        </span>
      </button>

      {/* Hint di luar tombol (bukan landmark) & terhubung via aria-describedby.
          `aria-live="polite"` agar perubahan alasan (mis. saldo termuat) diumumkan. */}
      {hint && (
        <span
          id={hintId}
          aria-live="polite"
          className={`text-center text-[11px] font-medium ${
            hintTone === "info" ? "text-slate-300" : "text-rose-300"
          }`}
        >
          {hint}
        </span>
      )}
    </div>
  );
};
