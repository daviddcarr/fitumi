import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'
import type { Player } from '../lib/interfaces/player'
import type RoomState from '../lib/interfaces/room-state'
import { DEFAULT_ROOM_STATE, type Point } from '../lib/interfaces/room-state'

interface GameState {
    roomId: string
    roomCode: string
    players: Player[]
    state: RoomState
    isGameMaster: boolean
    player?: Player
}

interface GameActions {
    initRoom:       (code: string) => Promise<void>
    join:           (name: string) => Promise<Player | null>
    loadRoom:       (roomCode: string) => Promise<void>
    loadPlayer:     (roomId: string, playerSlug: string) => Promise<void>
    submitClue:     (clue: string) => Promise<void>
    addStroke:      (points: Point[]) => Promise<void>
    subscribe:      () => void
    unsubscribe:    () => void
}


export const useGame = create<GameState & GameActions>((set, get) => ({
    roomId: "",
    roomCode: "",
    players: [] as Player[],
    player: undefined,
    state: DEFAULT_ROOM_STATE,

    get isGameMaster() {
        if (!this.player || this.players.length === 0 || !this.state.currentPlayer) return false
        return (this.state.currentPlayer as Player).id === (this.player as Player).id
    },

    initRoom: async (code: string) => {
        console.log("Init Room: ", code);
        const { data: room, error: roomError } = await supabase
            .from("rooms")
            .select('*')
            .eq("code", code)
            .single()
        if (roomError || !room) return
        set({ roomCode: code, roomId: room.id, state: room.state })

        const { data: existingPlayers, error: playerError } = await supabase
            .from("players")
            .select('*')
            .eq("room_id", room.id)
            .order("created_at", { ascending: true })
        if (playerError || !existingPlayers) return
        set({ players: existingPlayers })
    },
    
    /**
     * Join a room with the given name
     * @param name the name for the player
     * @returns the newly created player
     */
    join: async (name: string) => {
        const roomId = get().roomId
        if (!roomId) return
        
        const color = "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")
        const base = name.toLowerCase().replace(/\s+/g, "-")
        const suffix = Math.random().toString(36).substring(2, 5)
        const slug = `${base}-${suffix}`

        const { data, error } = await supabase
            .from("players")
            .insert([{ room_id: roomId, name, color, slug }])
            .select()
            .single()
        if (error || !data) return null
        set({ player: data })
        if (get().players.length === 0 && !get().state.gameMaster) {
            const newState = { ...get().state, gameMaster: data }
            await supabase
                .from("rooms")
                .update({ state: newState })
                .eq("id", roomId)
            set({ state: { ...get().state, gameMaster: data } })
        } else if (get().players.length === 1 && !get().state.currentPlayer) {
            const newState = { ...get().state, currentPlayer: data }
            await supabase
                .from("rooms")
                .update({ state: newState })
                .eq("id", roomId)
            set({ state: { ...get().state, currentPlayer: data } })
        }
        
        return data
    },

    loadRoom: async (roomCode: string) => {
        const { data, error } = await supabase
            .from("rooms")
            .select('*')
            .eq("code", roomCode)
            .single()
        if (error || !data) return
        set({ 
            roomId: data.id, 
            roomCode, 
            players: data.players, 
            state: data.state
        })
    },

    loadPlayer: async (roomId: string, playerSlug: string) => {
        const { data, error } = await supabase
            .from("players")
            .select('*')
            .eq("room_id", roomId)
            .eq("slug", playerSlug)
            .single()
        if (error || !data) return
        set({ player: data })
    },

    submitClue: async (clue: string) => {
        const roomId = get().roomId
        if (!roomId) return
        const newState = { ...get().state, currentClue: clue }
        await supabase
            .from("rooms")
            .update({ state: newState })
            .eq("id", roomId)
        set({ state: newState })
    },

    addStroke: async (points: Point[]) => {
        const { roomId, player, players, state } = get()
        if (!roomId || !player || !players || !state) return

        const getNextPlayer = (players: Player[], currentPlayer: Player, gameMaster: Player): Player => {
            const nextIndex = (players.indexOf(currentPlayer) + 1) % players.length
            return players[nextIndex] !== gameMaster ? players[nextIndex] : players[(nextIndex + 1) % players.length]
        }

        const color = players.find(p=>p.id===player.id)!.color
        const newStroke = { playerId: player.id, points, color }
        const nextTurn  = (state.currentTurnIndex + 1) % players.length
        const nextPlayer = getNextPlayer(players, player, state.gameMaster!)
        const newState = {
            ...state,
            strokes: [...(state.strokes ?? []), newStroke],
            currentTurnIndex: nextTurn,
            currentPlayer: nextPlayer,
        }
        set({ state: newState })
        await supabase
            .from("rooms")
            .update({ state: newState })
            .eq("id", roomId)
    },

    subscribe: () => {
        const roomId = get().roomId
        if (!roomId) return
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
                payload => set(state=>({ players:[...state.players, payload.new as Player] }))
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "rooms",
                    filter: `id=eq.${roomId}`,
                },
                payload => set((state) =>({ 
                    state: payload.new.state as RoomState,
                    players: state.players.filter(p=>p.id!== (payload.old as Player).id) 
                }))
      
            )
            .subscribe();
    },
    
    unsubscribe: () => {
        supabase.removeAllChannels()
    }
}))