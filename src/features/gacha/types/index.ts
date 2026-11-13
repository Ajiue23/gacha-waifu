import type { Rarity } from "../../../types/rarity";
import type { UserState } from "../../../types/user";

export type { Rarity };
export type { UserState };
export type PullCount = 1 | 10;

export interface Character {
  id: string;
  name: string;
  image: string;
  rarity: Rarity;
  description: string;
}

export interface PullResult extends Character {
  /** ID unik per hasil pull (dipakai sebagai key). */
  pullId: string;
  isNew: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  featured: Character;
  rateUp: Character[];
}

export interface PullResponse {
  results: PullResult[];
  userState: Partial<UserState>;
}
