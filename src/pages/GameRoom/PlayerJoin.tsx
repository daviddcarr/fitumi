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
        <div className="p-4 max-w-sm mx-auto bg-purple-900 rounded-2xl">
          <h1 className="text-2xl font-bold mb-4 text-white">Join {state.name}</h1>
          <input
            type="text"
            placeholder="Your name"
            className="w-full mb-3 p-2 border rounded border-white placeholder:text-gray-400 text-white"
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
      </div>
    </div>
  );
}
