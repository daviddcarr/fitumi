import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@stores/useGame";
import CanvasBackground from "@components/CanvasBackground";

export default function Home() {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const navigate = useNavigate();
  const { createRoom } = useGame();

  const initRoom = async () => {
    const newRoomCode = await createRoom(name);
    if (newRoomCode) {
      navigate(`/${newRoomCode}`);
    } 
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <CanvasBackground />


      <div className="relative z-10 p-4 h-full w-full flex justify-center items-center">
        <div className="flex flex-col max-w-md items-center space-y-2 p-6 bg-purple-blurred">
          <h1 className="text-5xl font-bold mb-0 text-white font-heading tracking-widest ">
            FITUMI
          </h1>
          <p className="text-sm text-white mb-8 tracking-wide ">Fake It 'Til U Make It</p>
  
          <div className="grid md:grid-cols-[1fr_auto_1fr] gap-8  md:gap-4">
            <div className="space-y-2">
              <input
                className="border p-2 w-full rounded border-white focus:outline-purple-900 text-white text-center placeholder:text-purple-800"
                placeholder="Room Name"
                value={name}
                onChange={(e) => setName(e.target.value.substring(0, 14))}
              />
              <button
                className="purple-button w-full"
                onClick={initRoom}
                disabled={!name && name.length <= 4}
              >
                Create Room
              </button>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-white text-2xl !font-heading">OR</span>
            </div>
            <div className="space-y-2">
              <input
                className="border p-2 w-full rounded border-white text-center text-input"
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
        </div>
      </div>
    </div>
    );

}
