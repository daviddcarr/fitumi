import { useParams } from "react-router-dom";
import { useEffect } from "react";
import CanvasBoard from "@components/CanvasBoard";
import { useGame } from "@stores/useGame";
// import {
//   FaCrown,
//   FaCopy,
//   FaCheckCircle,
//   FaRegCheckCircle,
// } from "react-icons/fa";

import PlayerJoin from "./PlayerJoin";
import PlayerLobby from "./PlayerLobby";

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
    players,
    state,
    initRoom,
    loadPlayer,
    subscribe,
    unsubscribe,
    // submitClue,
    // setReady,
    // startGame,
    // setGameMaster,
  } = useGame();
  const {
    currentPlayer,
    gameMaster,
    fakeArtist,
    // readiness, currentClue
  } = state;

  //   const [clue, setClue] = useState<string>("");

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

  console.log("Rendering Game Room", player, players, state);
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold">Room ID: /{roomCode}</h2>
      <h3 className="text-xl font-semibold">Room Name: {state.name}</h3>
      <h4 className="text-lg font-semibold">Current Player: {player?.name}</h4>
      <h4 className="text-lg font-semibold">
        Current Turn: {currentPlayer?.name}
      </h4>
      <h4>Game Master: {gameMaster?.name}</h4>
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
              {player?.id === fakeArtist?.id && <span>(FA)</span>}
            </div>
          </li>
        ))}
      </ul>

      {player && state && players.length > 0 && <CanvasBoard />}
    </div>
  );
}

export default function GameRoom() {
  return (
    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
      <GameRoomUI />
    </div>
  );
}
