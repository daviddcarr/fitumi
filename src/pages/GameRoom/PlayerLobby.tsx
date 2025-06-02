import ButtonCopyUrl from "@components/ButtonCopyUrl";
import CanvasBackground from "@components/CanvasBackground";
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
  FaInfoCircle,
  FaRegImages,
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
    setShowInfo,
    setShowGallery,
  } = useGame();
  const { gameMaster, readiness, currentSubject, previousArt } = state;

  const [subject, setSubject] = useState<string>(currentSubject || "");

  useEffect(() => {
    setSubject(currentSubject || "");
  }, [currentSubject]);

  useEffect(() => {
    if (!gameMaster) {
      const allReady = players.every((p) => readiness[p.id]);
      if (allReady) {
        startGame();
      }
    }
  }, [gameMaster, readiness]);

  console.log("Player Lobby", player, players, state);
  if (!player) return null;
  console.log("Rendering Lobby");

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <CanvasBackground />

      <div className="z-10 w-full h-full sm:flex justify-center items-center p-2 overflow-scroll">
        <div className="p-4 bg-blurred z-10 max-w-sm mx-auto space-y-4 w-full">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl tracking-wider font-semibold font-heading text-purple-800 leading-none ">
              {state.name}
            </h1>
            <div className="flex items-center gap-2">
              <ButtonCopyUrl />
              <button
                onClick={() => setShowInfo(true)}
                className="p-1 text-purple-950 hover:text-purple-600"
              >
                <FaInfoCircle className="text-2xl" />
              </button>
            </div>
          </div>

          <PlayerList canEdit={!!gameMaster} isLobby />

          {/* Ready Button */}
          <div className="flex flex-col sm:flex-row gap-2 items-stretch w-full">
            <button
              className={`p-2 h-full cursor-pointer rounded flex justify-center items-center gap-2 text-white hover:bg-gray-700 ${
                readiness[player?.id] ? "bg-green-600" : "bg-gray-400"
              } ${
                gameMaster?.id !== player?.id ? "w-full" : "w-full sm:w-max"
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
                <FaCrown /> Crown Me
              </button>
            )}

            {previousArt.length > 0 && (
              <button
                className="w-full sm:w-max bg-purple-800 flex items-center gap-2 justify-center text-white py-2 px-4 rounded cursor-pointer hover:bg-purple-700"
                onClick={() => setShowGallery(true)}
              >
                <FaRegImages /> <span className="sm:hidden">Gallery</span>
              </button>
            )}
          </div>

          {/* Subject Entry for Game Master */}
          {gameMaster?.id === player?.id && (
            <>
              <div className="">
                <h2 className="text-2xl font-heading text-purple-800">
                  Subject
                </h2>
                <p className="text-slate-800">
                  As the Game Master you can submit a word (noun) for your
                  artists to draw.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="border rounded border-purple-300 flex items-center grow">
                  <input
                    type="text"
                    placeholder="Subject"
                    className={`${
                      subject === currentSubject
                        ? "text-green-600"
                        : "text-purple-900"
                    } grow p-2 placeholder:text-gray-400 focus:outline-purple-900 capitalize`}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                  <button
                    className=" text-purple-800 hover:text-purple-400 cursor-pointer py-2 px-4"
                    onClick={() =>
                      submitSubject(
                        BASIC_SUBJECTS[
                          Math.floor(Math.random() * BASIC_SUBJECTS.length)
                        ]
                      )
                    }
                  >
                    <FaDiceD20 />
                  </button>
                </div>
                <button
                  className={`${
                    subject === currentSubject
                      ? "bg-green-600 hover:bg-green-900"
                      : "bg-purple-600 hover:bg-purple-800"
                  } text-white py-2 px-4 flex items-center justify-center rounded cursor-pointer disabled:opacity-50 disabled:cursor-auto`}
                  onClick={() => submitSubject(subject)}
                  disabled={!subject.trim()}
                >
                  {subject === currentSubject ? <FaEdit /> : <FaRegEdit />}
                  <span className="ml-2 sm:hidden">Submit</span>
                </button>
              </div>

              <button
                disabled={
                  players.filter((p) => p.id !== gameMaster?.id).length < 3 ||
                  !players.every((p) => readiness[p.id]) ||
                  (gameMaster && !currentSubject)
                }
                className="w-full bg-purple-800 hover:bg-purple-900 text-white py-2 rounded cursor-pointer disabled:cursor-auto disabled:opacity-50"
                onClick={() => startGame()}
              >
                Start Game
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
