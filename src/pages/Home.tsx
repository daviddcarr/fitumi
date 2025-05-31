import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { DEFAULT_ROOM_STATE } from "../lib/interfaces/room-state";

export default function Home() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const createRoom = async () => {
    const roomCode = Math.random()
      .toString(36)
      .substring(2, 7)
      .toLocaleUpperCase();
    const { data, error } = await supabase
      .from("rooms")
      .insert([
        {
          code: roomCode,
          state: {
            ...DEFAULT_ROOM_STATE,
            name,
          },
        },
      ])
      .select()
      .single();

    if (data) {
      navigate(`/${roomCode}`);
    } else if (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-4 h-full w-full flex justify-center items-center bg-slate-700">
      <div className="flex flex-col items-center space-y-2 p-4 bg-slate-800 rounded">
        <h1 className="text-3xl font-bold mb-4 text-white">
          Faux Artists Online
        </h1>
        <input
          className="border p-2 w-full rounded border-white text-white placeholder:text-gray-400"
          placeholder="Room Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          onClick={createRoom}
        >
          Create Room
        </button>
      </div>
    </div>
  );
}
