import type { PlayerColor } from "@data/constants";

export interface Player {
  id: string;
  name: string;
  color: string;
  slug: string;
  room_id: string;
  created_at: string;
  leftHanded?: boolean;
}
