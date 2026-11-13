import { useEffect } from "react";

/** Mengunci scroll body selama overlay/drawer terbuka. */
export const useLockBodyScroll = (isLocked = true): void => {
  useEffect(() => {
    if (!isLocked) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = original;
    };
  }, [isLocked]);
};
