import CanvasBackground from "@components/CanvasBackground";
import { useGame } from "@stores/useGame";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function PlayerJoin() {
  const { roomCode } = useParams();

  const { roomId, state, join } = useGame();
  const [name, setName] = useState<string>("");
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!roomId || !name.trim()) return;
    join(name).then((newPlayer) => {
      navigate(`/${roomCode}/${newPlayer?.slug ?? ""}`);
    });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <CanvasBackground />
    
      <div className="w-full h-full flex justify-center items-center">
        <div className="p-4 max-w-sm mx-auto bg-purple-900/60 backdrop-blur-sm rounded-2xl space-y-2 text-center">
          <h1 className="text-3xl font-bold font-heading uppercase tracking-widest mb-4 text-white">Join {state.name}</h1>
          <input
            type="text"
            placeholder="Your name"
            className="border p-2 w-full rounded border-white focus:outline-purple-900 text-white text-center placeholder:text-purple-800"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
              className="bg-purple-800 hover:bg-purple-900 disabled:bg-purple-700 disabled:text-purple-400 disabled:cursor-auto cursor-pointer text-white px-4 py-2 rounded w-full"
              onClick={handleJoin}
            disabled={!name.trim()}
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
