import CanvasBackground from "@components/CanvasBackground";
import { useGame } from "@stores/useGame";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoHandLeft, IoHandRight } from "react-icons/io5";
import classNames from "classnames";

export default function PlayerJoin() {
  const { roomCode } = useParams();

  const { roomId, state, join } = useGame();
  const [name, setName] = useState<string>("");
  const [leftHanded, setLeftHanded] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!roomId || !name.trim()) return;
    join(name, leftHanded).then((newPlayer) => {
      navigate(`/${roomCode}/${newPlayer?.slug ?? ""}`);
    });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <CanvasBackground />

      <div className="w-full h-full flex justify-center items-center">
        <div className="p-4 max-w-sm mx-auto bg-blurred space-y-2 text-center">
          <h1 className="text-3xl font-bold font-heading uppercase tracking-widest mb-4 text-purple-800">
            Join {state.name}
          </h1>
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
            className="grid grid-cols-2 w-full border-2 border-purple-300 rounded-full overflow-hidden"
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
        </div>
      </div>
    </div>
  );
}
