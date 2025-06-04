import ButtonCopyUrl from "@components/ButtonCopyUrl";
import CanvasBackground from "@components/CanvasBackground";
import PlayerList from "@components/PlayerList";
import { BASIC_SUBJECTS } from "@data/subject-sets";
import { useGame } from "@stores/useGame";
import classNames from "classnames";
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
import { MdOutlineTimer } from "react-icons/md";
import { FaArrowRotateRight } from "react-icons/fa6";
import { IoMdArrowDropupCircle } from "react-icons/io";

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
    setStrokeCount,
    setVotingTime,
  } = useGame();
  const {
    gameMaster,
    readiness,
    currentSubject,
    previousArt,
    strokesPerPlayer,
  } = state;

  const [isFirstPlayer, setIsFirstPlayer] = useState<boolean>(false);
  const [isGameMaster, setIsGameMaster] = useState<boolean>(false);
  const [suggestion, setSuggestion] = useState<string|null>(null);
  const [subject, setSubject] = useState<string>(currentSubject || "");
  const [showSubjectEditor, setShowSubjectEditor] = useState<boolean>(false);
  const [showAdvancedEditor, setShowAdvancedEditor] = useState<boolean>(false);

  useEffect(() => {
    setSubject(currentSubject || "");
  }, [currentSubject]);

  useEffect(() => {
    if (players[0].id === player?.id) {
      setIsFirstPlayer(true);
    } else {
      setIsFirstPlayer(false);
    }

    if (gameMaster?.id === player?.id) {
      setIsGameMaster(true);
    } else {
      setIsGameMaster(false);
    }
  }, [players, player, gameMaster]);

  useEffect(() => {
    const activePlayers = players.filter((p) => p.id !== gameMaster?.id);
    const readyPlayers = players.filter((p) => readiness[p.id]);
    if (activePlayers.length < 3) {
      setSuggestion(`Invite ${3 - activePlayers.length} More Players`);
    } else if (readyPlayers.length < players.length) {
      setSuggestion(`${readyPlayers.length}/${players.length} Ready`);
    } else if (gameMaster &&!currentSubject) {
      setSuggestion("Set a Subject");
    } else {
      setSuggestion(null);
    }

    if (!gameMaster) {
      const allReady = players.every((p) => readiness[p.id]);
      if (allReady) {
        startGame();
      }
    }
  }, [gameMaster, readiness, players, startGame, currentSubject]);

  if (!player) return null;

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <CanvasBackground />

      <div className="z-10 w-full h-full sm:flex justify-center items-center p-2 overflow-scroll">
        <div className="p-4 bg-blurred z-10 max-w-sm max-h-[80vh] overflow-scroll mx-auto space-y-4 w-full">
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


          {/* Player List */}
          <PlayerList canEdit={!!gameMaster} isLobby />

          {/* Suggestion */}
          {
            suggestion && (
              <div className="text-center">
                <p className="text-sm text-purple-500">{ suggestion }</p>
              </div>
            )
          }

          {/* Ready Button */}
          <div className="flex flex-col sm:flex-row gap-2 items-stretch w-full">
            <button
              className={`p-2 h-full cursor-pointer rounded-lg flex justify-center items-center gap-2 text-white hover:bg-gray-700 ${
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
                className="w-full grow bg-gray-700 flex items-center gap-2 justify-center text-white py-2 rounded-lg disabled:opacity-50 disabled:cursor-auto cursor-pointer hover:bg-purple-700"
                onClick={() => setGameMaster(null)}
              >
                <FaRobot /> No Game Master
              </button>
            )}

            {!gameMaster && (
              <button
                className="w-full grow bg-gray-700 flex items-center gap-2 justify-center text-white py-2 rounded-lg disabled:opacity-50 disabled:cursor-auto cursor-pointer hover:bg-purple-700"
                onClick={() => setGameMaster(player)}
              >
                <FaCrown /> Crown Me
              </button>
            )}

            {previousArt.length > 0 && (
              <button
                className="w-full sm:w-max bg-purple-800 flex items-center gap-2 justify-center text-white py-2 px-4 rounded-lg cursor-pointer hover:bg-purple-700"
                onClick={() => setShowGallery(true)}
              >
                <FaRegImages /> <span className="sm:hidden">Gallery</span>
              </button>
            )}
          </div>

          {/* Subject Entry for Game Master */}
          {isGameMaster && (
            <>
              {
                showSubjectEditor ? (
                  <div className="flex flex-col gap-2">

                    <div>
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-heading text-purple-800">
                          Subject
                        </h2>

                        <button
                            onClick={() => setShowSubjectEditor(false)}
                            className="cursor-pointer p-1 rounded-full hover:text-purple-600 text-purpele-950"
                          >
                            <IoMdArrowDropupCircle className="text-2xl" />
                          </button>
                      </div>
                      <p className="text-slate-800">
                        As the Game Master you can submit a word (noun) for your
                        artists to draw.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="border rounded-lg border-purple-300 flex items-center grow">
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

                      </div>
                      <button
                        className={`${
                          subject === currentSubject
                            ? "bg-green-600 hover:bg-green-900"
                            : "bg-purple-600 hover:bg-purple-800"
                        } text-white py-2 px-4 flex items-center justify-center rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-auto`}
                        onClick={() => {
                          submitSubject(subject)
                          setShowSubjectEditor(false)
                        }}
                        disabled={!subject.trim()}
                      >
                        {subject === currentSubject ? <FaEdit /> : <FaRegEdit />}
                        <span className="ml-2 sm:hidden">Submit</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    className="flex items-center gap-2 p-2 w-full border-2 border-purple-300 bg-purple-300/20 rounded-4xl"
                    >
                    <button 
                      className="pl-2 text-slate-800 flex gap-2 items-center text-left grow capitalize cursor-pointer"
                      onClick={() => setShowSubjectEditor(true)}
                      >
                      <span className="text-2xl font-heading text-purple-800">
                        Subject:
                      </span>
                      {currentSubject ?? "???"}
                    </button>
                    <button
                          className=" text-purple-800 hover:text-purple-400 cursor-pointer py-2 px-4"
                          onClick={() => {    
                              submitSubject(
                                BASIC_SUBJECTS[
                                  Math.floor(Math.random() * BASIC_SUBJECTS.length)
                                ]
                              )
                          }}
                        >
                          <FaDiceD20 />
                        </button>
                </button>
                )
              }




              <button
                disabled={
                  players.filter((p) => p.id !== gameMaster?.id).length < 3 ||
                  !players.every((p) => readiness[p.id]) ||
                  (gameMaster && !currentSubject)
                }
                className="w-full bg-purple-800 hover:bg-purple-900 text-white py-2 rounded-lg cursor-pointer disabled:cursor-auto disabled:opacity-50"
                onClick={() => startGame()}
              >
                Start Game
              </button>
            </>
          )}

          {
            (isGameMaster || isFirstPlayer) && (
              <>
                <button 
                  className="flex w-full border-[1px] p-1 px-2 gap-4 cursor-pointer items-center justify-between border-purple-300 rounded-full"
                  onClick={() => setShowAdvancedEditor(!showAdvancedEditor)}
                  >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <FaArrowRotateRight /> {strokesPerPlayer}
                    </div>
                    <div className="flex items-center gap-2">
                      <MdOutlineTimer /> {state.votingTime}s
                    </div>
                  </div>

                  <FaEdit />
                </button>
                {
                  showAdvancedEditor && (
                    <>
                      {/* Stroke Count */}
                      <div className="flex border-[1px] border-purple-300 rounded-lg">
                        <span className="p-2 grow">Stroke Count:</span>
                        {[1, 2, 3, 4].map((c) => (
                          <button
                            key={c}
                            disabled={strokesPerPlayer === c}
                            className={classNames(
                              "py-2 px-4 border-l-[1px] border-purple-300",
                              c === strokesPerPlayer
                                ? "bg-purple-300"
                                : "bg-transparent cursor-pointer hover:bg-purple-100"
                            )}
                            onClick={() => setStrokeCount(c)}
                          >
                            {c}
                          </button>
                        ))}
                      </div>

                      {/* Voting Time */}
                      <div className="flex border-[1px] border-purple-300 rounded-lg">

                        <span className="p-2 grow">Voting Time:</span>
                        {[5, 10, 15].map((c) => (
                          <button
                            key={c}
                            disabled={state.votingTime === c}
                            className={classNames(
                              "py-2 px-4 border-l-[1px] border-purple-300",
                              c === state.votingTime
                                ? "bg-purple-300"
                                : "bg-transparent cursor-pointer hover:bg-purple-100"
                            )}
                            onClick={() => setVotingTime(c)}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </>
                  )
                }


              </>
            ) 
          }


        </div>
      </div>
    </div>
  );
}
