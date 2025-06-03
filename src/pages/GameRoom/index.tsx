import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useGame } from "@stores/useGame";

import PlayerJoin from "./PlayerJoin";
import PlayerLobby from "./PlayerLobby";
import PlayerArtboard from "./PlayerArtboard";
import PlayerVoting from "./PlayerVoting";
import PlayerResults from "./PlayerResults";

import { FaTimes } from "react-icons/fa";
import CanvasPreviousArtwork from "@components/CanvasPreviousArtwork";

// Main Game Room Wrapper, Contains UI Modals used on multiple layouts.
export default function GameRoom() {
  const { state, showInfo, showGallery, setShowInfo, setShowGallery } =
    useGame();
  const { previousArt } = state;

  return (
    <div className="w-full min-h-full relative">
      {/* Main Game Room UI, See Definition Below */}
      <GameRoomUI />

      {/* Modal UIs */}
      {(showInfo || showGallery) && (
        <div className="absolute inset-0 flex justify-center items-center z-30 backdrop-blur-sm p-2">
          {/* How To Play Instructional Modal */}
          {showInfo && (
            <div className="bg-purple-blurred p-4 max-w-xl">
              <div className="grid grid-rows-[auto_1fr] gap-4">
                <div className="flex justify-between items-center gap-4">
                  <h2 className="text-2xl font-bold font-heading text-white tracking-wider">
                    How to Play FITUMU
                  </h2>
                  <button
                    className="h-10 w-10 rounded-full bg-purple-950 hover:bg-purple-600 flex items-center justify-center"
                    onClick={() => setShowInfo(false)}
                  >
                    <FaTimes className="text-white" />
                  </button>
                </div>

                <div className="max-h-[70vh] overflow-y-scroll">
                  <div className="space-y-4">
                    <p className="text-sm text-white">
                      <span className="font-bold font-heading tracking-widest">
                        FITUMI
                      </span>{" "}
                      is a deception game where all players are collaborating on
                      a single piece of art, but one of you is unaware of the
                      subject.
                    </p>

                    <p className="text-sm text-white">
                      To start playing, create or join a waiting room{" "}
                      <a href="/" className="underline text-purple-300">
                        here
                      </a>
                      . Once in a room you can click the room code button to
                      copy and share with friends.
                    </p>

                    <p className="text-sm text-white">
                      Playing the game is simple, when it's your turn, you will
                      be able to contribute a single mark to the canvas. By
                      tapping/clicking and dragging on the white square you can
                      draw a mark. Once you unclick/tap, your turn ends!
                    </p>

                    <p className="text-sm text-white">
                      After each artist has contributed a set number of marks,
                      the game will end and voting will begin. Participating
                      players will have 30 seconds to decide who they believe is
                      faking it. If the imposter has the most votes, the artists
                      win! If not, or in the event of a tie, the faking artist
                      wins.
                    </p>

                    <p className="text-sm text-white">
                      To begin the game you need at least three participating
                      players. The Game Master role is optional and does not
                      count as a participating player. So you will need at least
                      four players if one is a Game Master.
                    </p>

                    <p className="text-sm text-white">
                      The Game Master does not contribute to the canvas, but
                      gets to decide on a subject at the beginning of the round.
                      If the faking artist isn't found out, the Game Master
                      shares a win.
                    </p>

                    <p className="text-sm text-white">
                      <strong>Tip:</strong> Avoid being too obvious in the first
                      round(s) with your marks. If the faking artist catches on,
                      quickly, they will have an easier time blending in.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Previous Art Modal */}
          {showGallery && previousArt.length > 0 && (
            <div className="bg-purple-blurred max-w-3xl p-4">
              <div className="grid grid-rows-[auto_1fr] gap-4">
                <div className="flex justify-between items-center gap-4">
                  <h2 className="text-2xl font-bold font-heading text-white tracking-wider">
                    Previous Art
                  </h2>
                  <button
                    className="h-10 w-10 rounded-full bg-purple-950 hover:bg-purple-600 flex items-center justify-center"
                    onClick={() => setShowGallery(false)}
                  >
                    <FaTimes className="text-white" />
                  </button>
                </div>

                <div className="max-h-[70vh] overflow-y-scroll">
                  <div className="flex justify-center flex-wrap gap-4">
                    {[...previousArt, ...previousArt].map((s, i) => {
                      return <CanvasPreviousArtwork key={i} strokes={s} />;
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
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
