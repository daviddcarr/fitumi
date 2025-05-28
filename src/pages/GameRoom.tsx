import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import CanvasBoard from "../components/CanvasBoard";
import type RoomState from "../lib/interfaces/room-state";
import { DEFAULT_ROOM_STATE } from "../lib/interfaces/room-state";

export type Player = {
  id: string;
  name: string;
  color: string;
  slug: string;
  room_id: string;
  created_at: string;
  is_fake_artist?: boolean;
};

export default function GameRoom() {
  const { roomCode, playerSlug } = useParams();
  const navigate = useNavigate();

  const [roomId, setRoomId] = useState<string | null>("");
  const [roomName, setRoomName] = useState<string | null>("");
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [joined, setJoined] = useState<boolean>(false);
  const [clueSelected, setClueSelected] = useState<boolean>(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isGameMaster, setIsGameMaster] = useState<boolean>(false);
  const [state, setState] = useState<RoomState | null>(null);

  const playerName = useMemo(() => {
    if (!playerId) return "";
    return players.find((p) => p.id === playerId)?.name ?? "";
  }, [playerId, players]);

  const currentPlayer: Player | null = useMemo(() => {
    if (!state || !players) return null;
    return players[state.currentTurnIndex];
  }, [players, state]);

  useEffect(() => {
    if (!roomCode) return;
    supabase
      .from("rooms")
      .select("*")
      .eq("code", roomCode)
      .single()
      .then(({ data, error }) => {
        if (data?.id) {
          setRoomId(data.id);
          setState(data.state);
          if (data.state?.name) {
            setRoomName(data.state.name);
          }
        }
        if (error) {
          console.error(error);
          return;
        }
      });
  }, [roomCode]);

  useEffect(() => {
    if (!roomId || !playerSlug) return;
    supabase
      .from("players")
      .select("*")
      .eq("room_id", roomId)
      .eq("slug", playerSlug)
      .single()
      .then(({ data, error }) => {
        if (data) {
          setPlayerId(data.id);
          setName(data.name);
          setJoined(true);
        }
        if (error) console.error(error);
      });
  }, [roomId, playerSlug]);

  const handleJoin = async () => {
    if (!roomId || !name.trim()) return;

    const color =
      "#" +
      Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0");

    const base = name.trim().toLowerCase().replace(/\s+/g, "-");
    const suffix = Math.random().toString(36).substring(2, 5);
    const slug = `${base}-${suffix}`;

    const { data, error } = await supabase
      .from("players")
      .insert([{ room_id: roomId, name: name.trim(), color, slug }])
      .select()
      .single();

    if (data) {
      setPlayerId(data.id);
      setJoined(true);
      navigate(`/${roomCode}/${data.slug}`, { replace: true });
    } else if (error) {
      console.error("Join error:", error);
    }
  };

  useEffect(() => {
    if (!roomId) return;
    supabase
      .from("players")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (data) setPlayers(data || []);
        if (error) console.error(error);
      });

    const channel = supabase
      .channel(`players-room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "players",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setPlayers((current) => [...current, payload.new as Player]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          setState(payload.new.state as RoomState);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  useEffect(() => {
    if (!playerId || players.length === 0) return;
    const sorted = [...players].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    setIsGameMaster(sorted[0].id === playerId);
  }, [players, playerId]);

  if (!roomId) {
    return <div className="p-4">Loading room...</div>;
  }

  if (!joined) {
    return (
      <div className="p-4 max-w-sm mx-auto">
        {roomName ? (
          <h1 className="text-2xl font-bold mb-4">{roomName}</h1>
        ) : (
          <h1 className="text-2xl fond-bold mb-4">Join Room "{roomCode}"</h1>
        )}
        <input
          type="text"
          placeholder="Your name"
          className="w-full mb-3 p-2 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          onClick={handleJoin}
          disabled={!name.trim()}
        >
          Join
        </button>
      </div>
    );
  }

  if (!clueSelected && !state?.currentClue && isGameMaster) {
    return (
      <div className="p-4 max-w-sm mx-auto">
        <input
          type="text"
          placeholder="Clue"
          className="w-full mb-3 p-2 border rounded"
          value={state?.currentClue ?? ""}
          onChange={(e) =>
            setState({
              ...(state ?? DEFAULT_ROOM_STATE),
              currentClue: e.target.value,
            })
          }
        />
        {state?.currentClue && (
          <button
            className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
            onClick={() => setClueSelected(true)}
          >
            Submit Clue
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold">Room ID: /{roomCode}</h2>
      <h3 className="text-xl font-semibold">Room Name: {roomName}</h3>
      <h4 className="text-lg font-semibold">Current Player: {playerName}</h4>
      <h4 className="text-lg font-semibold">
        Current Turn: {currentPlayer?.name}
      </h4>
      <p className="mt-2 mb-4">Players in this room:</p>
      <ul className="space-y-2">
        {players.map((p) => (
          <li key={p.id} className="flex items-center space-x-2">
            <div className="flex items-center">
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: p.color }}
              />
              <span>{p.name}</span>
              {p.is_fake_artist && <span>(FA)</span>}
            </div>
          </li>
        ))}
      </ul>

      {playerId && state && players.length > 0 && (
        <CanvasBoard
          roomId={roomId}
          playerId={playerId}
          players={players}
          state={state}
          setState={setState}
        />
      )}
    </div>
  );
}
