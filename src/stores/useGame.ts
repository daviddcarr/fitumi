import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'
import type { Player } from '../lib/interfaces/player'
import type RoomState from '../lib/interfaces/room-state'
import { DEFAULT_ROOM_STATE, type Point } from '../lib/interfaces/room-state'

interface GameState {
    roomId: string
    roomCode: string
    playerId: string
    players: Player[]
    state: RoomState
    currentPlayer?: Player
    isGameMaster: boolean
    player?: Player


    // roomName: string
    // name: string
    // clueSelected: boolean
}

interface GameActions {
    initRoom:       (code: string) => Promise<void>
    join:           (name: string) => Promise<void>
    submitClue:     (clue: string) => Promise<void>
    addStroke:      (points: Point[]) => Promise<void>
    subscribe:      () => void
    unsubscribe:    () => void

    // setRoomId: (roomId: string) => void
    // setRoomName: (roomName: string) => void
    // setPlayerId: (playerId: string) => void
    // setName: (name: string) => void
    // setIsGameMaster: (isGameMaster: boolean) => void
    // setPlayers: (players: Player[]) => void
    // setState: (state: RoomState) => void
    // setClueSelected: (clueSelected: boolean) => void
}


export const useGame = create<GameState & GameActions>((set, get) => ({
    roomId: "",
    roomCode: "",
    playerId: "",
    players: [] as Player[],
    state: DEFAULT_ROOM_STATE,

    get currentPlayer() {
        const idx = this.state.currentTurnIndex
        return this.players[idx] ?? null
    },

    get player() {
        return this.players.find(p=>p.id===this.playerId)
    },

    get isGameMaster() {
        if (!this.playerId || this.players.length === 0 || !this.currentPlayer) return false
        return this.currentPlayer.id === this.playerId
    },

    initRoom: async (code: string) => {
        const { data, error } = await supabase
            .from("rooms")
            .select('*')
            .eq("code", code)
            .single()
        if (error || !data) return
        set({ roomCode: code, roomId: data.id, state: data.state })
    },
    
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
        if (error || !data) return
        set({ playerId: data.id, player: data })
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
        const { roomId, playerId, players, state } = get()
        if (!roomId || !playerId || !players || !state) return
        const color = players.find(p=>p.id===playerId)!.color
        const newStroke = { playerId, points, color }
        const nextTurn  = (state.currentTurnIndex + 1) % players.length
        const newState = {
            ...state,
            strokes: [...(state.strokes ?? []), newStroke],
            currentTurnIndex: nextTurn,
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
                payload => set(state=>({ players: state.players.filter(p=>p.id!== (payload.old as Player).id) }))
      
            )
            .subscribe();
    },
    
    unsubscribe: () => {
        supabase.removeAllChannels()
    }
}))