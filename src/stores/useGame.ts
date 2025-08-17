import { create } from "zustand";
import { supabase } from "@lib/supabaseClient";
import type { Player } from "@lib/interfaces/player";
import type RoomState from "@lib/interfaces/room-state";
import {
  DEFAULT_ROOM_STATE,
  type Point,
  type PreviousArt,
  type RoomStatus,
  type Stroke,
} from "@lib/interfaces/room-state";
import { getRandomSubject } from "@data/subject-sets";
import {
  DEFAULT_STROKES_PER_PLAYER,
  type PlayerColor,
  DEFAULT_VOTING_TIME,
  getAvailableColors,
} from "@data/constants";

interface GameState {
  roomId: string;
  roomCode: string;
  players: Player[];
  state: RoomState;
  player?: Player;

  showInfo: boolean;
  showGallery: boolean;
}

interface GameActions {
  addStroke: (points: Point[]) => Promise<void>;
  createRoom: (name: string) => Promise<string | null>;
  finalizeVoting: () => Promise<void>;
  initRoom: (code: string) => Promise<void>;
  join: (
    name: string,
    leftHanded?: boolean,
    asObserver?: boolean
  ) => Promise<Player | null>;
  leave: () => Promise<void>;
  loadPlayer: (roomId: string, playerSlug: string) => Promise<void>;
  nextRound: () => Promise<void>;
  setGameMaster: (player: Player | null) => Promise<void>;
  setStrokeCount: (count: number) => Promise<void>;
  setVotingTime: (time: number) => Promise<void>;
  setReady: (ready: boolean) => Promise<void>;
  startGame: () => Promise<void>;
  submitSubject: (subject: string) => Promise<void>;
  submitVote: (voteId: string) => Promise<void>;
  subscribe: () => void;
  unsubscribe: () => void;
  updatePlayer: (player: Player) => Promise<void>;
  setShowInfo: (show: boolean) => void;
  setShowGallery: (show: boolean) => void;
}

export const useGame = create<GameState & GameActions>((set, get) => ({
  roomId: "",
  roomCode: "",
  players: [] as Player[],
  player: undefined,
  state: DEFAULT_ROOM_STATE,

  showInfo: false,
  showGallery: false,
  setShowInfo: (show) => set({ showInfo: show }),
  setShowGallery: (show) => set({ showGallery: show }),

  createRoom: async (name: string) => {
    const roomCode = Math.random()
      .toString(36)
      .substring(2, 7)
      .toLocaleUpperCase();
    const { data, error } = await supabase
      .from("rooms")
      .insert([
        {
          code: roomCode,
          state: {
            ...DEFAULT_ROOM_STATE,
            name,
          },
        },
      ])
      .select()
      .single();

    if (data && roomCode) {
      set({ roomCode: roomCode, roomId: data.id, state: data.state });
      return roomCode;
    } else if (error) {
      console.error(error);
      return null;
    }
    return null;
  },

  initRoom: async (code: string) => {
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("*")
      .eq("code", code)
      .single();
    if (roomError || !room) {
      console.error(roomError);
      return;
    }

    const { data: existingPlayers, error: playerError } = await supabase
      .from("players")
      .select("*")
      .eq("room_id", room.id)
      .order("created_at", { ascending: true });
    if (playerError || !existingPlayers) {
      console.error(playerError);
      return;
    }

    set({ players: existingPlayers });
    set({ roomCode: code, roomId: room.id, state: room.state });
  },

  /**
   * Join a room with the given name
   * @param name the name for the player
   * @returns the newly created player
   */
  join: async (name: string, leftHanded?: boolean, asObserver?: boolean) => {
    leftHanded = leftHanded || false;
    // Make sure we have a room to join
    const { roomId, players, state } = get();
    if (!roomId) return;

    // Set up Player Data
    let isObserver = asObserver || state.status !== "lobby";
    const availableColors: PlayerColor[] = getAvailableColors(players);
    let color: string = "";
    if (availableColors.length === 0) {
      isObserver = true;
    } else {
      color = availableColors[players.length % availableColors.length].name;
    }

    const base = name.toLowerCase().replace(/\s+/g, "-");
    const suffix = Math.random().toString(36).substring(2, 5);
    const slug = `${base}-${suffix}`;

    // Create Player
    const { data, error } = await supabase
      .from("players")
      .insert([{ room_id: roomId, name, color, slug, leftHanded, isObserver }])
      .select()
      .single();
    if (error || !data) {
      console.error(error);
      return;
    }
    set({ player: data });

    // Check if player is first or second, make them Game Master or Current Player
    if (get().players.length === 0 && !get().state.gameMaster) {
      const newState = { ...get().state, gameMaster: data };
      await supabase.from("rooms").update({ state: newState }).eq("id", roomId);
      set({ state: { ...get().state, gameMaster: data } });
    } else if (get().players.length === 1 && !get().state.currentPlayer) {
      const newState = { ...get().state, currentPlayer: data };
      await supabase.from("rooms").update({ state: newState }).eq("id", roomId);
      set({ state: { ...get().state, currentPlayer: data } });
    }

    return data;
  },

  leave: async () => {
    const { roomId, player } = get();
    const playerId = player?.id;
    if (!roomId || !player) return;
    const { error } = await supabase
      .from("players")
      .delete()
      .eq("id", playerId);
    if (error) return;
    const { state } = get();
    if (state.gameMaster?.id === playerId) {
      const newState = { ...state, gameMaster: undefined };
      await supabase.from("rooms").update({ state: newState }).eq("id", roomId);
      set({ state: { ...state, gameMaster: undefined } });
    }
    set((state) => ({
      players: state.players.filter((p) => p.id !== playerId),
    }));
    set({ player: undefined });
  },

  loadPlayer: async (roomId: string, playerSlug: string) => {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("room_id", roomId)
      .eq("slug", playerSlug)
      .single();
    if (error || !data) return;
    set({ player: data });
  },

  submitSubject: async (subject: string) => {
    const roomId = get().roomId;
    if (!roomId) return;
    const newState = { ...get().state, currentSubject: subject };
    await supabase.from("rooms").update({ state: newState }).eq("id", roomId);
    set({ state: newState });
  },

  setStrokeCount: async (count: number) => {
    const { state, roomId } = get();
    if (!roomId || !state) return;
    const newState: RoomState = { ...state, strokesPerPlayer: count };
    await supabase.from("rooms").update({ state: newState }).eq("id", roomId);
    set({ state: newState });
  },

  setVotingTime: async (time: number) => {
    const { state, roomId } = get();
    if (!roomId || !state) return;
    const newState: RoomState = { ...state, votingTime: time };
    // await supabase.from("rooms").update({ state: newState }).eq("id", roomId);
    // set({ state: newState });

    const { data, error } = await supabase
      .from("rooms")
      .update({ state: newState })
      .eq("id", roomId)
      .eq("state->>status", "lobby")
      .select()
      .single();

    if  (error || !data) {
      // another client already started the game: refresh local state
      const { data: room } = await supabase
        .from("rooms")
        .select("state")
        .eq("id", roomId)
        .single();
      
      if (room) set({ state: room.state as RoomState });
      return;
    }

    set({ state: data.state as RoomState });
  },

  addStroke: async (points: Point[]) => {
    const { roomId, player, players, state } = get();
    if (!roomId || !player || !players || !state || player.isObserver) return;

    // Build Stroke Data
    const color = player.color;
    const newStroke: Stroke = { playerId: player.id, points, color: color };

    // Get Next Active Player in Turn Order
    let activePlayers: Player[];
    if (state.gameMaster) {
      activePlayers = players.filter(
        (p) => p.id !== state.gameMaster!.id && !p.isObserver
      );
    } else {
      activePlayers = players.filter((p) => !p.isObserver);
    }
    const idx = activePlayers.findIndex((p) => p.id === player.id);
    const nextPlayer = activePlayers[(idx + 1) % activePlayers.length];

    let newState: RoomState = {
      ...state,
      strokes: [...(state.strokes ?? []), newStroke],
      currentPlayer: nextPlayer,
    };

    const { strokesPerPlayer } = state;
    const totalNeeded =
      activePlayers.length * (strokesPerPlayer ?? DEFAULT_STROKES_PER_PLAYER);

    if ((newState.strokes?.length ?? 0) >= totalNeeded) {
      const previousArt: PreviousArt[] = state.previousArt ?? [];
      previousArt.unshift({
        subject: state.currentSubject!,
        strokes: newState.strokes,
      });
      const votingTime = newState.votingTime ?? DEFAULT_VOTING_TIME;

      newState = {
        ...newState,
        status: "voting",
        votes: {},
        votingDeadline: Date.now() + votingTime * 1000,
        previousArt: previousArt,
      };
    }

    set({ state: newState });
    await supabase.from("rooms").update({ state: newState }).eq("id", roomId);
  },

  setReady: async (ready: boolean) => {
    const { player, state, roomId } = get();
    if (!player || !state) return;
    const newReadinesss = { ...state.readiness, [player.id]: ready };
    const newState = { ...state, readiness: newReadinesss };
    set({ state: newState });
    await supabase.from("rooms").update({ state: newState }).eq("id", roomId);
  },

  startGame: async () => {
    const { players, state, roomId } = get();
    if (state.status !== "lobby") return;

    // Make sure we have enough active players
    let active: Player[];
    if (state.gameMaster) {
      active = players.filter(
        (p) => p.id !== state.gameMaster!.id && !p.isObserver
      );
    } else {
      active = players.filter((p) => !p.isObserver);
    }
    if (active.length < 3) return;

    // Make sure all players are ready
    const allReady = active.every((p) => state.readiness[p.id]);
    if (!allReady) return;

    // Pick a fake artist
    const fakeArtist = active[Math.floor(Math.random() * active.length)];

    // Set Subject or Grab Random Subject if no game master
    const subject = state.gameMaster
      ? state.currentSubject
      : getRandomSubject(state.previousArt);

    // Pick first player
    const others = active.filter((p) => p.id !== fakeArtist.id);
    const firstPlayer = others[Math.floor(Math.random() * others.length)];

    const newState = {
      ...state,
      status: "in-progress" as RoomStatus,
      fakeArtist,
      currentSubject: subject,
      currentPlayer: firstPlayer,
    };
    set({ state: newState });
    await supabase.from("rooms").update({ state: newState }).eq("id", roomId);
  },

  setGameMaster: async (player: Player | null) => {
    const { roomId, state } = get();
    if (!roomId) return;
    const newState = { ...state, gameMaster: player ?? undefined };
    set({ state: newState });
    await supabase.from("rooms").update({ state: newState }).eq("id", roomId);
  },

  submitVote: async (voteId: string) => {
    const { state, player, roomId } = get();
    if (!player || !state || state.status !== "voting") return;

    const newVotes = { ...(state.votes || {}), [player.id]: voteId };

    const newState = {
      ...state,
      votes: newVotes,
    };

    set({ state: newState });
    await supabase.from("rooms").update({ state: newState }).eq("id", roomId);
  },

  nextRound: async () => {
    const { state, roomId } = get();
    if (!state) return;

    const newState: RoomState = {
      ...DEFAULT_ROOM_STATE,

      name: state.name,

      status: "lobby",

      gameMaster: state.gameMaster,

      currentPlayer: undefined,
      fakeArtist: undefined,
      currentSubject: null,
      strokes: [],
      votes: {},
      votingDeadline: null,
      results: undefined,
      scores: state.scores || {},
      readiness: {},
      previousArt: state.previousArt,
    };

    // set({ state: newState });
    // await supabase.from("rooms").update({ state: newState }).eq("id", roomId);

    const { data, error } = await supabase
      .from("rooms")
      .update({ state: newState })
      .eq("id", roomId)
      .eq("state->>status", "results")
      .select()
      .single();

    if (error || !data) {
      // another client already started the game: refresh local state
      const { data: room } = await supabase
        .from("rooms")
        .select("state")
        .eq("id", roomId)
        .single();
      if (room) set({ state: room.state as RoomState });
      return;
    }

    set({ state: data.state as RoomState });
  },



  finalizeVoting: async () => {
    const { state, players, roomId } = get();
    if (!state || state.status !== "voting") return;

    const voteCounts: Record<string, number> = {};
    Object.values(state.votes || {}).forEach((votedForId) => {
      voteCounts[votedForId] = (voteCounts[votedForId] || 0) + 1;
    });

    const sortedTuples = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);
    const ranked = sortedTuples.map(([id]) => id);

    const topCount = sortedTuples[0]?.[1] || 0;
    const topPlayers = sortedTuples
      .filter(([, count]) => count === topCount)
      .map(([id]) => id);

    const fakeId = state.fakeArtist?.id;
    if (!fakeId) return;

    let fakeWins: boolean;
    if (topPlayers.length > 1) {
      fakeWins = true;
    } else {
      fakeWins = !(topPlayers[0] === fakeId);
    }

    let winners: string[];
    if (fakeWins) {
      winners = [fakeId];
      if (state.gameMaster?.id) {
        winners.push(state.gameMaster.id);
      }
    } else {
      winners = players
        .filter(
          (p) =>
            p.id !== fakeId && p.id !== state.gameMaster?.id && !p.isObserver
        )
        .map((p) => p.id);
    }

    const newScores = { ...(state.scores || {}) };
    winners.forEach((id) => {
      newScores[id] = (newScores[id] || 0) + 1;
    });

    const newState: RoomState = {
      ...state,
      status: "results",
      results: {
        voteCounts,
        ranked,
        fakeWins,
        winners,
      },
      scores: newScores,
    };

    // set({ state: newState });
    // await supabase.from("rooms").update({ state: newState }).eq("id", roomId);
    const { data, error } = await supabase
      .from("rooms")
      .update({ state: newState })
      .eq("id", roomId)
      .eq("state->>status", "voting")
      .select()
      .single();

    if (error || !data) {
      // another client already started the game: refresh local state
      const { data: room } = await supabase
        .from("rooms")
        .select("state")
        .eq("id", roomId)
        .single();
      if (room) set({ state: room.state as RoomState });
      return;
    }

    set({ state: data.state as RoomState });
  },

  subscribe: () => {
    const roomId = get().roomId;
    if (!roomId) return;
    supabase
      .channel(`players-room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "players",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) =>
          set((state) => ({
            players: [...state.players, payload.new as Player],
          }))
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) =>
          set((state) => ({
            state: payload.new.state as RoomState,
            players: state.players.filter(
              (p) => p.id !== (payload.old as Player).id
            ),
          }))
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "players",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) =>
          set((state) => ({
            players: state.players.map((p) =>
              p.id === payload.new.id ? (payload.new as Player) : p
            ),
          }))
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "players",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) =>
          set((state) => ({
            players: state.players.filter(
              (p) => p.id !== (payload.old as Player).id
            ),
          }))
      )
      .subscribe();
  },

  unsubscribe: () => {
    supabase.removeAllChannels();
  },

  updatePlayer: async (player: Player) => {
    const { error } = await supabase
      .from("players")
      .update(player)
      .eq("id", player.id);
    if (error) return;
    set({ player });
  },
}));
