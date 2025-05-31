import { useParams } from "react-router-dom";
import { useEffect } from "react";
import CanvasBoard from "@components/CanvasBoard";
import { useGame } from "@stores/useGame";


import PlayerJoin from "./PlayerJoin";
import PlayerLobby from "./PlayerLobby";
import PlayerArtboard from "./PlayerArtboard";

export type Player = {
  id: string;
  name: string;
  color: string;
  slug: string;
  room_id: string;
  created_at: string;
  is_fake_artist?: boolean;
};

export function GameRoomUI() {
  const { roomCode, playerSlug } = useParams();
  const {
    roomId,
    player,
    state,
    initRoom,
    loadPlayer,
    subscribe,
    unsubscribe,
  } = useGame();

  // Room State
  useEffect(() => {
    if (!roomCode) return;
    initRoom(roomCode).then(subscribe);
    return () => unsubscribe();
  }, [roomCode, initRoom, subscribe, unsubscribe]);

  useEffect(() => {
    if (!roomId || !playerSlug) return;
    loadPlayer(roomId, playerSlug);
  }, [roomId, playerSlug, loadPlayer]);

  if (!roomId) {
    return <div className="p-4">Loading room...</div>;
  }

  if (!player) {
    return <PlayerJoin />;
  }

  if (state.status === "lobby" && player) {
    return <PlayerLobby />;
  }

  return <PlayerArtboard />;
}

export default function GameRoom() {
  return (
    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
      <GameRoomUI />
    </div>
  );
}
