import { DEFAULT_VOTING_TIME, STROKES_PER_PLAYER } from "@data/constants";
import type { Player } from "./player";

export type Point = { x: number; y: number };
export type Stroke = { playerId: string; points: Point[]; color: string };
export type PreviousArt = { subject: string; strokes: Stroke[] };

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
  strokesPerPlayer: number;
  votes: Record< string, string>;
  votingTime: number;
  votingDeadline: number | null;
  scores: Record<string, number>;
  previousArt: PreviousArt[];

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
  strokesPerPlayer: STROKES_PER_PLAYER,
  votes: {},
  votingTime: DEFAULT_VOTING_TIME,
  votingDeadline: null,
  scores: {},

  results: undefined,
  previousArt: []
};
