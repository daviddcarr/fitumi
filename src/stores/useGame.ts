import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";
import type { Player } from "../lib/interfaces/player";
import type RoomState from "../lib/interfaces/room-state";
import {
  DEFAULT_ROOM_STATE,
  type Point,
  type RoomStatus,
} from "../lib/interfaces/room-state";
import { BASIC_SUBJECTS } from "@data/subject-sets";
import { STROKES_PER_PLAYER } from "@data/constants";

interface GameState {
    roomId: string;
    roomCode: string;
    players: Player[];
    state: RoomState;
    player?: Player;
}

interface GameActions {
    addStroke: (points: Point[]) => Promise<void>;
    createRoom: () => Promise<string | null>;
    finalizeVoting: () => Promise<void>;
    initRoom: (code: string) => Promise<void>;
    join: (name: string) => Promise<Player | null>;
    loadPlayer: (roomId: string, playerSlug: string) => Promise<void>;
    nextRound: () => Promise<void>;
    setGameMaster: (player: Player | null) => Promise<void>;
    setReady: (ready: boolean) => Promise<void>;
    startGame: () => Promise<void>;
    submitSubject: (subject: string) => Promise<void>;
    submitVote: (voteId: string) => Promise<void>;
    subscribe: () => void;
    unsubscribe: () => void;
}

export const useGame = create<GameState & GameActions>((set, get) => ({
    roomId: "",
    roomCode: "",
    players: [] as Player[],
    player: undefined,
    state: DEFAULT_ROOM_STATE,


    createRoom: async () => {
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
            return roomCode
        } else if (error) {
        console.error(error);
        return null
        }
        return null
    },

    initRoom: async (code: string) => {
        console.log("Init Room: ", code);
        const { data: room, error: roomError } = await supabase
        .from("rooms")
        .select("*")
        .eq("code", code)
        .single();
        if (roomError || !room) return;
        set({ roomCode: code, roomId: room.id, state: room.state });

        const { data: existingPlayers, error: playerError } = await supabase
        .from("players")
        .select("*")
        .eq("room_id", room.id)
        .order("created_at", { ascending: true });
        if (playerError || !existingPlayers) return;
        set({ players: existingPlayers });
    },

    /**
     * Join a room with the given name
     * @param name the name for the player
     * @returns the newly created player
     */
    join: async (name: string) => {
        // Make sure we have a room to join
        const roomId = get().roomId;
        if (!roomId) return;

        // Set up Player Data
        const color =
        "#" +
        Math.floor(Math.random() * 0xffffff)
            .toString(16)
            .padStart(6, "0");
        const base = name.toLowerCase().replace(/\s+/g, "-");
        const suffix = Math.random().toString(36).substring(2, 5);
        const slug = `${base}-${suffix}`;

        // Create Player
        const { data, error } = await supabase
        .from("players")
        .insert([{ room_id: roomId, name, color, slug }])
        .select()
        .single();
        if (error || !data) return null;
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

    addStroke: async (points: Point[]) => {
        const { roomId, player, players, state } = get();
        if (!roomId || !player || !players || !state) return;

        // Build Stroke Data
        const color = players.find((p) => p.id === player.id)!.color;
        const newStroke = { playerId: player.id, points, color };

        // Get Next Active Player in Turn Order
        const nonGM = players.filter((p) => p.id !== state.gameMaster!.id);
        const idx = nonGM.findIndex((p) => p.id === player.id);
        const nextPlayer = nonGM[(idx + 1) % nonGM.length];

        let newState = {
        ...state,
        strokes: [...(state.strokes ?? []), newStroke],
        currentPlayer: nextPlayer,
        };

        const totalNeeded = nonGM.length * STROKES_PER_PLAYER;

        console.log("Total Needed: ", totalNeeded);
        console.log("Current Strokes: ", (newState.strokes?.length ?? 0));
        if ((newState.strokes?.length ?? 0) >= totalNeeded) {
            newState = {
                ...newState,
                status: "voting",
                votes: {},
                votingDeadline: Date.now() + 30000
            }
        }

        set({ state: newState });
        await supabase.from("rooms").update({ state: newState }).eq("id", roomId);
    },

    setReady: async (ready: boolean) => {
        const { player, state, roomId, players } = get();
        console.log("Try set ready", ready, player, state, players);
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
        const active = players.filter((p) => p.id !== state.gameMaster!.id);
        if (active.length < 3) return;

        // Make sure all players are ready
        const allReady = active.every((p) => state.readiness[p.id]);
        if (!allReady) return;

        // Pick a fake artist
        const fakeArtist = active[Math.floor(Math.random() * active.length)];

        // Set Subject or Grab Random Subject if no game master
        const subject = state.gameMaster
        ? state.currentSubject
        : BASIC_SUBJECTS[Math.floor(Math.random() * BASIC_SUBJECTS.length)];

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
        await supabase
            .from("rooms")
            .update({ state: newState })
            .eq("id", roomId);
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
            readiness: {}
        }

        set({ state: newState });
        await supabase.from("rooms").update({ state: newState }).eq("id", roomId);
    },

    finalizeVoting: async () => {
        const { state, players, roomId } = get()
        if (!state || state.status !== "voting") return;

        const voteCounts: Record<string, number> = {};
        Object.values(state.votes || {}).forEach((votedForId) => {
            voteCounts[votedForId] = (voteCounts[votedForId] || 0) + 1;
        })

        const sortedTuples = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);
        const ranked = sortedTuples.map(([id]) => id)

        const topCount = sortedTuples[0]?.[1] || 0;
        const topPlayers = sortedTuples
            .filter(([_, count]) => count === topCount)
            .map(([id]) => id)

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
                .filter((p) => p.id !== fakeId && p.id !== state.gameMaster?.id)
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
                winners
            },
            scores: newScores,
        };
        
        set({ state: newState });
        await supabase
            .from("rooms")
            .update({ state: newState })
            .eq("id", roomId);
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
      .subscribe();
  },

  unsubscribe: () => {
    supabase.removeAllChannels();
  },
}));
