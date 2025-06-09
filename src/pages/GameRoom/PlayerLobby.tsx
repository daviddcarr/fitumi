import ButtonCopyUrl from "@components/ButtonCopyUrl";
import CanvasBackground from "@components/CanvasBackground";
import PlayerList from "@components/PlayerList";
import { getRandomSubject } from "@data/subject-sets";
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
  FaImages,
} from "react-icons/fa";
import { MdOutlineTimer } from "react-icons/md";
import { FaArrowRotateRight } from "react-icons/fa6";
import { IoMdArrowDropupCircle } from "react-icons/io";
import { useNavigate } from "react-router-dom";

export default function PlayerLobby() {
  const {
    player,
    players,
    state,
    roomCode,
    leave,
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
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [subject, setSubject] = useState<string>(currentSubject || "");
  const [showSubjectEditor, setShowSubjectEditor] = useState<boolean>(false);
  const [showAdvancedEditor, setShowAdvancedEditor] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    setSubject(currentSubject || "");
  }, [currentSubject]);

  useEffect(() => {
    if (players.length === 0 || !player) return;
    if (players[0].id === player?.id) {
      setIsFirstPlayer(true);
    } else {
      setIsFirstPlayer(false);
    }

    if (!gameMaster) return;
    if (gameMaster?.id === player?.id) {
      setIsGameMaster(true);
    } else {
      setIsGameMaster(false);
    }
  }, [players, player, gameMaster]);

  useEffect(() => {
    if (players.length === 0) return;
    const activePlayers = players.filter(
      (p) => p.id !== gameMaster?.id && !p.isObserver
    );
    const readyPlayers = players.filter(
      (p) => readiness[p.id] && !p.isObserver
    );
    if (activePlayers.length < 3) {
      setSuggestion(`Invite ${3 - activePlayers.length} More Players`);
    } else if (readyPlayers.length < players.length) {
      setSuggestion(`${readyPlayers.length}/${players.length} Ready`);
    } else if (gameMaster && !currentSubject) {
      setSuggestion("Set a Subject");
    } else {
      setSuggestion(null);
    }

    if (!gameMaster) {
      const allReady = players
        .filter((p) => !p.isObserver)
        .every((p) => readiness[p.id]);
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
          <div className="flex gap-2 items-center justify-between">
            <h1 className="text-2xl sm:text-3xl tracking-wider font-semibold font-heading text-purple-800 leading-none ">
              {state.name}
            </h1>
            <div className="flex items-center gap-2">
              <ButtonCopyUrl />
              <button
                onClick={() => setShowInfo(true)}
                className="p-1 text-purple-900 hover:text-purple-600 cursor-pointer"
              >
                <FaInfoCircle className="text-2xl" />
              </button>

              {previousArt.length > -1 && (
                <button
                  className="p-1 text-purple-900 hover:text-purple-600 cursor-pointer"
                  onClick={() => setShowGallery(true)}
                >
                  <FaImages className="text-2xl" />
                </button>
              )}
            </div>
          </div>

          {/* Player List */}
          <PlayerList canEdit={!!gameMaster} isLobby />

          {/* Subject Entry for Game Master */}
          {isGameMaster && (
            <>
              {showSubjectEditor ? (
                <div className="flex flex-col gap-2 border-2 border-purple-300 bg-purple-300/20 rounded-4xl p-2">
                  <div className="px-2">
                    <button
                      className="flex w-full items-center justify-between cursor-pointer"
                      onClick={() => setShowSubjectEditor(false)}
                    >
                      <h2 className="text-2xl font-heading text-purple-800">
                        Subject
                      </h2>

                      <span className="p-1 rounded-full hover:text-purple-600 text-purple-900">
                        <IoMdArrowDropupCircle className="text-2xl " />
                      </span>
                    </button>
                    <p className="text-purple-900">
                      As the Game Master you can submit a word (noun) for your
                      artists to draw.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="border rounded-full border-purple-300 flex items-center grow">
                      <input
                        type="text"
                        placeholder="Subject"
                        className={`${
                          subject === currentSubject
                            ? "text-green-600"
                            : "text-purple-900"
                        } grow p-2 px-4 placeholder:text-gray-400 focus:outline-purple-900 capitalize`}
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      />
                    </div>
                    <button
                      className={`${
                        subject === currentSubject
                          ? "bg-green-600 hover:bg-green-900"
                          : "bg-purple-600 hover:bg-purple-800"
                      } text-white py-2 px-4 sm:p-0 flex items-center sm:w-[42px] sm:text-md justify-center rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-auto`}
                      onClick={() => {
                        submitSubject(subject);
                        setShowSubjectEditor(false);
                      }}
                      disabled={!subject.trim()}
                    >
                      {subject === currentSubject ? (
                        <FaEdit className="relative top-[-1px] left-[1px]" />
                      ) : (
                        <FaRegEdit className="relative top-[-1px] left-[1px]" />
                      )}
                      <span className="ml-2 sm:hidden">Submit</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button className="flex items-center gap-2 p-2 w-full border-2 border-purple-300 bg-purple-300/20 rounded-4xl">
                  <button
                    className="pl-2 text-slate-800 flex gap-2 items-center text-left grow capitalize cursor-pointer"
                    onClick={() => setShowSubjectEditor(true)}
                  >
                    <span className="text-2xl font-heading text-purple-800">
                      Subject:
                    </span>
                    <span className="relative top-[1px] font-body font-medium -tracking-normal text-xl text-purple-900 ">
                      {currentSubject ?? "???"}
                    </span>
                  </button>
                  <button
                    className=" text-purple-800 hover:text-purple-400 cursor-pointer py-2 px-4"
                    onClick={() => {
                      submitSubject(getRandomSubject(previousArt));
                    }}
                  >
                    <FaDiceD20 />
                  </button>
                </button>
              )}
            </>
          )}

          {/* Advanced Settings (Stroke count and Voting Time) */}
          {(isGameMaster || isFirstPlayer) && (
            <>
              <button
                className="flex w-full p-1 px-2 gap-4 cursor-pointer items-center text-purple-900 justify-between border-2 border-purple-300 bg-purple-300/20 rounded-4xl"
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
              {showAdvancedEditor && (
                <>
                  {/* Stroke Count */}
                  <div className="flex border-2 border-purple-300 rounded-full text-purple-900">
                    <div className="p-2 pl-3 grow flex items-center gap-2">
                      <FaArrowRotateRight />{" "}
                      <span className="text-sm sm:text-base">Strokes:</span>
                    </div>
                    {[1, 2, 3, 4].map((c, i) => (
                      <button
                        key={c}
                        disabled={strokesPerPlayer === c}
                        className={classNames(
                          "py-2 px-4 border-l-[1px] border-purple-300",
                          i === 3 && "rounded-r-full",
                          c === strokesPerPlayer
                            ? "bg-purple-300"
                            : "bg-purple-300/20 cursor-pointer hover:bg-purple-100"
                        )}
                        onClick={() => setStrokeCount(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>

                  {/* Voting Time */}
                  <div className="flex border-2 border-purple-300 rounded-full text-purple-900">
                    <div className="p-2 pl-3 grow flex items-center gap-2">
                      <MdOutlineTimer />{" "}
                      <span className="text-sm sm:text-base">Voting:</span>
                    </div>
                    {[5, 10, 15].map((c, i) => (
                      <button
                        key={c}
                        disabled={state.votingTime === c}
                        className={classNames(
                          "py-2 px-4 border-l-[1px] border-purple-300",
                          i === 2 && "rounded-r-full",
                          c === state.votingTime
                            ? "bg-purple-300"
                            : "bg-purple-300/20 cursor-pointer hover:bg-purple-100"
                        )}
                        onClick={() => setVotingTime(c)}
                      >
                        {c}s
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* Ready Button */}
          <div className="flex flex-col sm:flex-row gap-2 items-stretch w-full">
            <button
              className={classNames(
                "p-2 px-3 h-full cursor-pointer rounded-full flex justify-center items-center gap-2 text-white hover:bg-green-500",
                readiness[player?.id] ? "bg-green-600" : "bg-purple-700",
                gameMaster?.id !== player?.id ? "w-full" : "w-full sm:w-max"
              )}
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
                className="w-full grow bg-gray-700 flex items-center gap-2 justify-center text-white py-2 rounded-full disabled:opacity-50 disabled:cursor-auto cursor-pointer hover:bg-purple-900"
                onClick={() => setGameMaster(null)}
              >
                <FaRobot /> No Game Master
              </button>
            )}

            {!gameMaster && (
              <button
                className="w-full grow bg-gray-700 flex items-center gap-2 justify-center text-white py-2 rounded-full disabled:opacity-50 disabled:cursor-auto cursor-pointer hover:bg-purple-900"
                onClick={() => setGameMaster(player)}
              >
                <FaCrown /> Promote Me
              </button>
            )}
          </div>

          {/* Start Game Button */}
          {isGameMaster && (
            <>
              <button
                disabled={
                  players.filter(
                    (p) => p.id !== gameMaster?.id && !p.isObserver
                  ).length < 3 ||
                  !players
                    .filter((p) => !p.isObserver)
                    .every((p) => readiness[p.id]) ||
                  (gameMaster && !currentSubject)
                }
                className="w-full bg-purple-700 hover:bg-purple-900 text-white py-2 rounded-full cursor-pointer disabled:cursor-auto disabled:opacity-50"
                onClick={() => startGame()}
              >
                Start Game
              </button>
            </>
          )}

          <button
            className="w-full bg-red-700 hover:bg-red-900 text-white p-2 rounded-full cursor-pointer"
            onClick={() => {
              leave().then(() => navigate(`/${roomCode}`));
            }}
          >
            Leave
          </button>

          {/* Suggestion */}
          {suggestion && (
            <div className="text-center">
              <p className="text-sm text-purple-700">{suggestion}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
