import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const BASE_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-purple-900/40 hover:from-pink-400 hover:to-purple-500",
  secondary: "border border-white/15 bg-white/10 text-white hover:bg-white/20",
  ghost: "bg-transparent text-purple-200 hover:bg-white/10 hover:text-white",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs sm:text-sm",
  md: "px-5 py-2.5 text-sm sm:text-base",
};

export const Button = ({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  children,
  ...rest
}: ButtonProps) => (
  <button
    type={type}
    className={`${BASE_CLASS} ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`}
    {...rest}
  >
    {children}
  </button>
);
