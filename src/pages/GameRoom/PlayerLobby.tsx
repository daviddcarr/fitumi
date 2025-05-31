import ButtonCopyUrl from "@components/ButtonCopyUrl";
import PlayerList from "@components/PlayerList";
import { BASIC_SUBJECTS } from "@data/subject-sets";
import { useGame } from "@stores/useGame";
import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaRegCheckCircle,
  FaRobot,
  FaCrown,
  FaDiceD20,
  FaEdit,
  FaRegEdit,
} from "react-icons/fa";

export default function PlayerLobby() {
  const {
    player,
    players,
    state,
    submitSubject,
    setReady,
    startGame,
    setGameMaster,
  } = useGame();
  const { gameMaster, readiness, currentSubject } = state;

  const [subject, setSubject] = useState<string>(state.currentSubject || "");

  useEffect(() => {
    setSubject(state.currentSubject || "");
  }, [state.currentSubject]);

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

      <PlayerList canEdit={!!gameMaster} isLobby />

      {/* Ready Button */}
      <div className="flex gap-2 items-stretch w-full">
        <button
          className={`p-2 h-full cursor-pointer rounded flex justify-center items-center gap-2 text-white hover:bg-gray-700 ${
            readiness[player?.id] ? "bg-green-600" : "bg-gray-400"
          } ${
            gameMaster?.id !== player?.id ? "w-full" : "w-max"
          }`}
          onClick={() => setReady(!readiness[player?.id])}
        >
          {readiness[player?.id] ? (
            <>
              <FaCheckCircle /> Unready
            </>
          ) : (
            <>
              <FaRegCheckCircle /> Ready
            </>
          )}
        </button>

        {gameMaster && gameMaster.id === player?.id && (
          <button
            className="w-full grow bg-gray-700 flex items-center gap-2 justify-center text-white py-2 rounded disabled:opacity-50 disabled:cursor-auto cursor-pointer hover:bg-purple-700"
            onClick={() => setGameMaster(null)}
          >
            <FaRobot /> No Game Master
          </button>
        )}

        {!gameMaster && (
          <button
            className="w-full grow bg-gray-700 flex items-center gap-2 justify-center text-white py-2 rounded disabled:opacity-50 disabled:cursor-auto cursor-pointer hover:bg-purple-700"
            onClick={() => setGameMaster(player)}
          >
            <FaCrown /> Make me Game Master
          </button>
        )}
      </div>

      {/* Subject Entry for Game Master */}
      {gameMaster?.id === player?.id && (
        <>
          <div className="">
            <h2 className="text-2xl text-white">Subject</h2>
            <p className="text-white">As the Game Master you can submit a word (noun) for your artists to draw.</p>
          </div>
          <div className="flex gap-2">
            <div className="border rounded border-white flex items-center grow">
              <input
                type="text"
                placeholder="Subject"
                className={`${subject === currentSubject ? "text-green-200" : "text-white"} grow p-2 placeholder:text-gray-400 capitalize`}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <button
                className=" text-white hover:text-purple-400 cursor-pointer py-2 px-4"
                onClick={() => submitSubject(BASIC_SUBJECTS[Math.floor(Math.random() * BASIC_SUBJECTS.length)])}
                >
                <FaDiceD20 />
              </button>
            </div>
            <button
              className={`${subject === currentSubject ? "bg-green-600" : "bg-blue-600"} text-white py-2 px-4 rounded cursor-pointer disabled:opacity-50 disabled:cursor-auto`}
              onClick={() => submitSubject(subject)}
              disabled={!subject.trim()}
            >
              {subject === currentSubject ? <FaEdit /> : <FaRegEdit />}
            </button>
          </div>

          <button
            disabled={
              players.filter((p) => p.id !== gameMaster?.id).length < 3 ||
              !players.every((p) => readiness[p.id]) ||
              (gameMaster && !currentSubject)
            }
            className="w-full bg-green-600 text-white py-2 rounded cursor-pointer disabled:cursor-auto disabled:opacity-50"
            onClick={() => startGame()}
          >
            Start Game
          </button>
        </>
      )}
    </div>
  );
}
