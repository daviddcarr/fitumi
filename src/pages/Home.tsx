import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@stores/useGame";
import CanvasBackground from "@components/CanvasBackground";
import Modals from "./GameRoom/Modals";
import { FaInfoCircle, FaRegCheckCircle, FaUserNinja } from "react-icons/fa";
import { FaPeopleGroup, FaPaintbrush, FaArrowRotateRight } from "react-icons/fa6";

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

  const INSTRUCTIONS: {
    title: string;
    note: string;
    icon: ReactNode;
    img?: string;
  }[] = [
    {
      title: "Grab Some Friends",
      note: "You'll need at least two friends to play.",
      icon: <FaPeopleGroup className="text-5xl" />,
    },
    {
      title: "Get Ready",
      note: "Create / Join a room and set up your play style.",
      icon: <FaRegCheckCircle className="text-5xl" />,
    },
    {
      title: "Make Art",
      note: "On your turn, add a mark to the canvas to draw the subject.",
      icon: <FaPaintbrush className="text-5xl" />,
    },
    {
      title: "Fake it",
      note: "Don't know the subject? Just pretend you do!",
      icon: (          
        <div className="flex items-end">
          <span className="animate-pulse font-heading">?</span>{" "}
          <span
            className="text-5xl !font-heading animate-pulse"
            style={{ animationDelay: "0.4s" }}
          >
            ?
          </span>{" "}
          <span className="animate-pulse font-heading" style={{ animationDelay: "0.8s" }}>
            ?
          </span>
        </div>
      )
    },
    {
      title: "Vote the Fake",
      note: "Someone was dishonest, vote to decide!",
      icon: <FaUserNinja />,
    },
    {
      title: "Play Again",
      note: "Start a new piece, maybe you'll have to fake it!",
      icon: <FaArrowRotateRight />,
    }
  ]

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

        <div className="block max-h-full overflow-y-scroll">
          <div className="flex flex-col md:flex-row items-stretch gap-4">

            {/* Create or Join */}
            <div className="flex flex-col items-center justify-center gap-8 p-6 bg-blurred w-full @container/login">
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
              <div className="grid gap-8 @md:grid-cols-[1fr_auto_1fr] md:gap-4">
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
                    disabled={!name || name.length <= 1}
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
                className="purple-button !pl-2 mx-auto flex items-center gap-2"
                onClick={() => setShowInfo(true)}
              >
                <FaInfoCircle className="text-2xl" /> Learn More
              </button>
            </div>
          
            <div className="grid grid-cols-2 gap-4 bg-blurred p-4">
              {INSTRUCTIONS.map((instruction, i) => (
                <div key={i} className="flex flex-col items-center bg-light-purple-blurred p-2">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-3xl text-purple-800">
                    {instruction.icon}
                  </div>
                  <h3 className="text-lg font-bold text-center text-purple-800 mt-2">{instruction.title}</h3>
                  <p className="text-sm text-center text-purple-900">{instruction.note}</p>
                </div>
              ))}
            </div>
          
          </div>
        </div>

      </div>

      {/* Modal UIs */}
      {showInfo && <Modals />}
    </div>
  );
}
