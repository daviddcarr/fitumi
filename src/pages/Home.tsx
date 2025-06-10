import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@stores/useGame";
import CanvasBackground from "@components/CanvasBackground";
import Modals from "./GameRoom/Modals";
import { FaInfoCircle } from "react-icons/fa";

export default function Home() {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const navigate = useNavigate();
  const { createRoom, showInfo, setShowInfo } = useGame();

  const initRoom = async () => {
    const newRoomCode = await createRoom(name);
    if (newRoomCode) {
      navigate(`/${newRoomCode}`);
    }
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{
        height: "100dvh",
      }}
    >
      {/* Animated Line Art Background */}
      <CanvasBackground />

      {/* Create or Join UI */}
      <div className="relative z-10 p-4 h-full w-full flex justify-center items-center">
        <div className="flex flex-col max-w-md items-center gap-8 p-6 bg-blurred">
          {/* Header */}
          <div className="space-x-0">
            <h1 className="text-5xl font-bold mb-0 text-purple-800 font-heading tracking-widest ">
              FITUMI
            </h1>
            <p className="text-sm text-slate-800 tracking-wide ">
              Fake It 'Til U Make It
            </p>
          </div>

          {/* Create or Join Grid */}
          <div className="grid md:grid-cols-[1fr_auto_1fr] gap-8  md:gap-4">
            {/* Create Room Form */}
            <div className="space-y-2">
              <input
                className="text-input"
                placeholder="Room Name"
                value={name}
                onChange={(e) => setName(e.target.value.substring(0, 10))}
              />
              <button
                className="purple-button w-full"
                onClick={initRoom}
                disabled={!name || name.length <= 4}
              >
                Create Room
              </button>
            </div>

            {/* "OR" Spacer */}
            <div className="flex items-center justify-center">
              <span className="text-purple-900 text-2xl !font-heading">OR</span>
            </div>

            {/* Join Room Form */}
            <div className="space-y-2">
              <input
                className="border p-2 w-full rounded border-purple-300 text-center text-input"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.substring(0, 5))}
                placeholder="Room Code"
              />
              <button
                className="purple-button w-full"
                disabled={!roomCode && roomCode.length !== 5}
                onClick={() => navigate("/" + roomCode)}
              >
                Join Room
              </button>
            </div>
          </div>

          {/* Info Button */}
          <button
            className="purple-button mx-auto flex items-center gap-2"
            onClick={() => setShowInfo(true)}
          >
            <FaInfoCircle className="text-2xl" /> Learn More
          </button>
        </div>
      </div>

      {/* Modal UIs */}
      {showInfo && <Modals />}
    </div>
  );
}
