import { Routes, Route } from "react-router-dom";
import Home from "@pages/Home";
import GameRoom from "@pages/GameRoom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/:roomCode/:playerSlug?" element={<GameRoom />} />
    </Routes>
  );
}

export default App;
