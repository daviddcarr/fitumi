import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useGame } from "@stores/useGame";

import PlayerJoin from "./PlayerJoin";
import PlayerLobby from "./PlayerLobby";
import PlayerArtboard from "./PlayerArtboard";
import PlayerVoting from "./PlayerVoting";
import PlayerResults from "./PlayerResults";

import Modals from "./Modals";

// Main Game Room Wrapper, Contains UI Modals used on multiple layouts.
export default function GameRoom() {
  const { showInfo, showGallery } = useGame();

  return (
    <div className="w-full min-h-full relative">
      {/* Main Game Room UI, See Definition Below */}
      <GameRoomUI />

      {/* Modal UIs */}
      {(showInfo || showGallery) && <Modals />}
    </div>
  );
}

// Main Game Room UI, based on state
function GameRoomUI() {
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

  if (state.status === "in-progress" && player) {
    return <PlayerArtboard />;
  }

  if (state.status === "voting" && player) {
    return <PlayerVoting />;
  }

  if (state.status === "results" && player) {
    return <PlayerResults />;
  }
}
