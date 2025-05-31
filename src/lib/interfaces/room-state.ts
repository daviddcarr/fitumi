import type { Player } from "./player";

export type Point = { x: number; y: number };
export type Stroke = { playerId: string; points: Point[]; color: string };

export type RoomStatus = "lobby" | "in-progress";

export default interface RoomState {
  name?: string;
  status: RoomStatus;
  readiness: Record<string, boolean>;
  strokes: Stroke[];
  currentClue: string | null;
  gameMaster?: Player;
  currentPlayer?: Player;
  fakeArtist?: Player;
}

export const DEFAULT_ROOM_STATE: RoomState = {
  name: "",
  status: "lobby",
  readiness: {},
  strokes: [],
  currentClue: null,
};
