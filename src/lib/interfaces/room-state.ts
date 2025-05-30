import type { Player } from "./player";

export type Point = { x: number; y: number };
export type Stroke = { playerId: string; points: Point[]; color: string };

export default interface RoomState {
  name?: string;
  currentTurnIndex: number;
  currentGameMasterIndex: number;
  strokes: Stroke[];
  currentClue: string | null;
  gameMaster?: Player;
  currentPlayer?: Player;
}

export const DEFAULT_ROOM_STATE: RoomState = {
  name: "",
  currentTurnIndex: 0,
  currentGameMasterIndex: 0,
  strokes: [],
  currentClue: null,
};
