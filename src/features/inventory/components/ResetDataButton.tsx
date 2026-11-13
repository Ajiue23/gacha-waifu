import { useState } from "react";
import { Button } from "../../../components/Button";

export interface ResetDataButtonProps {
  onReset: () => Promise<boolean>;
  isResetting?: boolean;
  error?: string | null;
}

export const ResetDataButton = ({ onReset, isResetting = false, error = null }: ResetDataButtonProps) => {
  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  const handleConfirm = async () => {
    const isSuccess = await onReset();
    if (isSuccess) setIsConfirming(false);
  };

  if (!isConfirming) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsConfirming(true)}
        disabled={isResetting}
        aria-label="Reset data simulasi"
      >
        <span aria-hidden="true">♻️</span> Reset Data
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-1" role="group" aria-label="Konfirmasi reset data">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-rose-200">Yakin reset semua data?</span>
        <Button variant="primary" size="sm" onClick={handleConfirm} disabled={isResetting}>
          {isResetting ? "Mereset..." : "Ya, reset"}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setIsConfirming(false)} disabled={isResetting}>
          Batal
        </Button>
      </div>

      {error && (
        <span role="alert" className="text-[11px] text-rose-300">
          {error}
        </span>
      )}
    </div>
  );
};
