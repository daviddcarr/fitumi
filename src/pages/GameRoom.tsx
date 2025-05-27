import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import CanvasBoard from "../components/CanvasBoard";
import type RoomState from "../lib/interfaces/room-state";

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
  const [players, setPlayers] = useState<Player[]>([]);
  const [isGameMaster, setIsGameMaster] = useState<boolean>(false);
  const [state, setState] = useState<RoomState | null>(null);

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

    // supabase
    //     .from('players')
    //     .select('*')
    //     .eq('room_id', roomId)
    //     .then(({ data, error }) => {
    //         if (data) {
    //             setPlayers(data)
    //         }
    //         if (error) console.error(error)
    //     })
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

  const handleKick = (p: Player) => {
    console.log("Kicking player", p);
    supabase
      .from("players")
      .delete()
      .eq("id", p.id)
      .then(({ error }) => {
        if (!error) {
          console.log("Kicked player", p);
          setPlayers((current) => current.filter((pl) => pl.id !== p.id));
        }
      });
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
          console.log("Inserting player", payload.new);
          setPlayers((current) => [...current, payload.new as Player]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "players",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log("Deleting player", payload.old);
          setPlayers((current) =>
            current.filter((p) => p.id !== (payload.old as Player).id)
          );
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
          console.log("Updating room", payload.new);
          setState(payload.new.state as RoomState);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  useEffect(() => {
    console.log("Players Changed", players);
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

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold">Room: {roomCode}</h2>
      <p className="mt-2 mb-4">Players in this room:</p>
      <ul className="space-y-2">
        {players.map((p, i) => (
          <li key={p.id} className="flex items-center space-x-2">
            <div className="flex items-center">
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: p.color }}
              />
              <span>{p.name}</span>
              {p.is_fake_artist && <span>(FA)</span>}
            </div>
            {isGameMaster && i !== 0 && (
              <button
                className="text-red-600 hover:underline text-sm"
                onClick={() => handleKick(p)}
              >
                Kick
              </button>
            )}
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
