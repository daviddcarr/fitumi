import type { PlayerColor } from "@data/constants";
import type { Player } from "./player";

export type Point = { x: number; y: number };
export type Stroke = { playerId: string; points: Point[]; color: PlayerColor };

export type RoomStatus = "lobby" | "in-progress" | "voting" | "results";

export default interface RoomState {
  name?: string;
  status: RoomStatus;
  readiness: Record<string, boolean>;
  strokes: Stroke[];
  currentSubject: string | null;
  gameMaster?: Player;
  currentPlayer?: Player;
  fakeArtist?: Player;

  votes: Record< string, string>;
  votingDeadline: number | null;
  scores: Record<string, number>;

  results?: {
    voteCounts: Record<string, number>;
    ranked: string[];
    fakeWins: boolean;
    winners: string[];
  };
}

export const DEFAULT_ROOM_STATE: RoomState = {
  name: "",
  status: "lobby",
  readiness: {},
  strokes: [],
  currentSubject: null,

  votes: {},
  votingDeadline: null,
  scores: {},

  results: undefined,
};
