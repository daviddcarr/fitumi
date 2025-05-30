import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import CanvasBoard from "../components/CanvasBoard";
import { useGame } from "../stores/useGame";

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
  const {
    roomId,
    player,
    players,
    state,
    initRoom,
    join,
    loadPlayer,
    subscribe,
    unsubscribe,
    submitClue,
    addStroke
  } = useGame()
  const navigate = useNavigate();
  const { currentPlayer, gameMaster } = state

  const [name, setName] = useState<string>("");
  const [joined, setJoined] = useState<boolean>(false);
  const [clueSelected, setClueSelected] = useState<boolean>(false);

  // Room State
  useEffect(() => {
    if (!roomCode) return
    initRoom(roomCode).then(subscribe)
    return () => unsubscribe()
  }, [roomCode])

  useEffect(() => {
    if (!roomId || !playerSlug) return;
    loadPlayer(roomId, playerSlug).then(() => {
      setJoined(true);
    })
  }, [roomId, playerSlug])


  const handleJoin = async () => {
    if (!roomId || !name.trim()) return;
     join(name).then((newPlayer) => {
      setJoined(true);
      navigate(`/${roomCode}/${newPlayer?.slug ?? ""}`);
    });
  };

  if (!roomId) {
    return <div className="p-4">Loading room...</div>;
  }

  if (!joined) {
    return (
      <div className="p-4 max-w-sm mx-auto">
        {state.name ? (
          <h1 className="text-2xl font-bold mb-4">{state.name}</h1>
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

  if (!clueSelected && gameMaster === player) {
    return (
      <div className="p-4 max-w-sm mx-auto">
        <input
          type="text"
          placeholder="Clue"
          className="w-full mb-3 p-2 border rounded"
          value={state?.currentClue ?? ""}
          onChange={(e) =>
            submitClue(e.target.value)
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
      <h3 className="text-xl font-semibold">Room Name: {state.name}</h3>
      <h4 className="text-lg font-semibold">Current Player: {player?.name}</h4>
      <h4 className="text-lg font-semibold">
        Current Turn: {currentPlayer?.name}
      </h4>
      <h4>
        Game Master: {gameMaster?.name}
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

      {player && state && players.length > 0 && (
        <CanvasBoard />
      )}
    </div>
  );
}
