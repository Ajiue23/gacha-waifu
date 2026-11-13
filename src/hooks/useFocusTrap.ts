import { useEffect, useRef } from "react";
import type { RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Menjebak fokus keyboard di dalam container dialog:
 * memindahkan fokus awal ke elemen pertama, memutar Tab/Shift+Tab,
 * dan mengembalikan fokus ke elemen pemicu saat dialog ditutup.
 */
export const useFocusTrap = <T extends HTMLElement>(isActive = true): RefObject<T | null> => {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container || typeof document === "undefined") return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const getFocusable = (): HTMLElement[] =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

    const initialTarget = getFocusable()[0] ?? container;
    initialTarget.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const items = getFocusable();
      if (items.length === 0) {
        event.preventDefault();
        container.focus({ preventScroll: true });
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const isInside = active ? container.contains(active) : false;

      if (event.shiftKey && (!isInside || active === first)) {
        event.preventDefault();
        last.focus({ preventScroll: true });
        return;
      }

      if (!event.shiftKey && (!isInside || active === last)) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [isActive]);

  return containerRef;
};
