/**
 * State pemain yang dipakai lintas fitur (gacha, inventory, wallet di layout).
 * Diletakkan di `src/types/` sebagai tipe bersama agar `src/utils/` tidak
 * bergantung pada `src/features/`.
 */
export interface UserState {
  gems: number;
  pity: number;
  pityLimit: number;
  freeGemsAvailable: boolean;
}
