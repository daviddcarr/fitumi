import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

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
            name,
            currentTurnIndex: 0,
            strokes: [],
            currentClue: null,
            currentGameMasterIndex: 0,
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
    <div className="p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Faux Artists Online</h1>
      <input
        className="border p-2 mr-2"
        placeholder="Room Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={createRoom}
      >
        Create Room
      </button>
    </div>
  );
}
