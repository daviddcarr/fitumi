import ButtonCopyUrl from "@components/ButtonCopyUrl";
import PlayerList from "@components/PlayerList";
import { useGame } from "@stores/useGame";
import { useState } from "react";
import {
  FaCheckCircle,
  FaRegCheckCircle,
  FaRobot,
  FaCrown,
} from "react-icons/fa";

export default function PlayerLobby() {
  const {
    player,
    players,
    state,
    submitClue,
    setReady,
    startGame,
    setGameMaster,
  } = useGame();
  const { gameMaster, readiness, currentClue } = state;

  const [clue, setClue] = useState<string>(state.currentClue || "");

  console.log("Player Lobby", player, players, state);
  if (!player) return null;
  console.log("Rendering Lobby");

  return (
    <div className="p-4 max-w-sm mx-auto space-y-4 w-full">
      <h1 className="text-3xl tracking-wider font-semibold text-white">
        {state.name}
      </h1>
      <div className="flex justify-between items-center text-white">
        <h6>Lobby</h6>
        <ButtonCopyUrl />
      </div>

      <PlayerList canEdit={!!gameMaster} />

      {/* Ready Button */}
      <div className="flex gap-2 items-stretch">
        <button
          className={`p-2 h-full rounded flex items-center gap-2 w-max text-white ${
            readiness[player?.id] ? "bg-green-600" : "bg-gray-400"
          }`}
          onClick={() => setReady(!readiness[player?.id])}
        >
          {readiness[player?.id] ? (
            <>
              <FaCheckCircle /> Ready
            </>
          ) : (
            <>
              <FaRegCheckCircle /> Unready
            </>
          )}
        </button>

        {gameMaster && gameMaster.id === player?.id && (
          <button
            className="w-full grow bg-gray-400 flex items-center gap-2 justify-center text-white py-2 rounded disabled:opacity-50"
            onClick={() => setGameMaster(null)}
          >
            <FaRobot /> AI Game Master
          </button>
        )}

        {!gameMaster && (
          <button
            className="w-full grow bg-gray-400 flex items-center gap-2 justify-center text-white py-2 rounded disabled:opacity-50"
            onClick={() => setGameMaster(player)}
          >
            <FaCrown /> Make me Game Master
          </button>
        )}
      </div>

      {/* Clue Entry for Game Master */}
      {gameMaster?.id === player?.id && (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Clue"
              className="grow p-2 border rounded border-white placeholder:text-gray-400 text-white"
              value={clue}
              onChange={(e) => setClue(e.target.value)}
            />
            <button
              className=" bg-blue-600 text-white p-2 rounded disabled:opacity-50"
              onClick={() => submitClue(clue)}
              disabled={!clue.trim()}
            >
              Submit Clue
            </button>
          </div>

          <button
            disabled={
              players.filter((p) => p.id !== gameMaster?.id).length < 3 ||
              !players.every((p) => readiness[p.id]) ||
              (gameMaster && !currentClue)
            }
            className="w-full bg-green-600 text-white py-2 rounded disabled:opacity-50"
            onClick={() => startGame()}
          >
            Start Game
          </button>
        </>
      )}
    </div>
  );
}
