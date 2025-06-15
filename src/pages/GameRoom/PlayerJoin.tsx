import CanvasBackground from "@components/CanvasBackground";
import { useGame } from "@stores/useGame";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoHandLeft, IoHandRight } from "react-icons/io5";
import classNames from "classnames";
import { getAvailableColors } from "@data/constants";
import type { Player } from "@lib/interfaces/player";

export default function PlayerJoin() {
  const { roomCode } = useParams();

  const { roomId, state, join, players } = useGame();
  const [name, setName] = useState<string>("");
  const [leftHanded, setLeftHanded] = useState<boolean>(false);
  const [rejoinPlayer, setRejoinPlayer] = useState<Player | null>(null);
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!roomId || !name.trim()) return;

    // Check for existing player with name
    const normalized = name.trim().toLowerCase();
    const existing = players.find((p) => p.name.toLowerCase() === normalized);
    if (existing) {
      setRejoinPlayer(existing);
      return;
    }
    const allColorsUsed = getAvailableColors(players).length === 0;
    const asObserver = state.status !== "lobby" || allColorsUsed;
    join(name, leftHanded, asObserver).then((newPlayer) => {
      navigate(`/${roomCode}/${newPlayer?.slug ?? ""}`);
    });
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{ height: "100dvh" }}
    >
      <CanvasBackground />

      <div className="w-full h-full flex justify-center items-center">
        <div className="w-full space-y-2">
          <img src="/logo-purple.png" className="w-32 mx-auto" alt="Logo" />

          <div className="p-4 max-w-sm mx-auto bg-blurred space-y-2 text-center">
            <h1 className="text-3xl font-bold font-heading uppercase tracking-widest mb-4 text-purple-800">
              Join {state.name}
            </h1>
            {rejoinPlayer ? (
              <>
                <p className="text-purple-900">
                  A player with that name already exists, would you like to join
                  as them?
                </p>
                <div className="flex gap-2">
                  <button
                    className="purple-button w-full"
                    onClick={() => navigate(`/${roomCode}/${rejoinPlayer.slug}`)}
                  >
                    Yes
                  </button>
                  <button
                    className="purple-button w-full"
                    onClick={() => {
                      setRejoinPlayer(null);
                      setName("");
                    }}
                  >
                    No
                  </button>
                </div>
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Your name"
                  className="text-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <button
                  className="purple-button w-full"
                  onClick={handleJoin}
                  disabled={!name.trim()}
                >
                  Join
                </button>

                <button
                  className="grid grid-cols-2 w-full cursor-pointer border-2 border-purple-300 rounded-full overflow-hidden"
                  onClick={() => setLeftHanded(!leftHanded)}
                >
                  <div
                    className={classNames(
                      "px-4 py-1 flex items-center justify-center rounded-full text-purple-300",
                      leftHanded && "bg-purple-300 text-white"
                    )}
                  >
                    <IoHandLeft className="text-xl" />
                  </div>
                  <div
                    className={classNames(
                      "px-4 py-1 flex items-center justify-center rounded-full text-purple-300",
                      !leftHanded && "bg-purple-300 text-white"
                    )}
                  >
                    <IoHandRight className="text-xl" />
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
