import { useEffect, useState, useRef } from "react";
import { useGame } from "@stores/useGame";
import CanvasBoard from "@components/CanvasBoard";
import type { Player } from "@lib/interfaces/player";

export default function PlayerVoting() {
  const { player, players, state, submitVote, finalizeVoting } = useGame();

  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<number>(0);

  let nonGM: Player[];
  let isGM: boolean;
  if (state.gameMaster && player) {
    nonGM = players.filter((p) => p.id !== state.gameMaster!.id);
    isGM = player.id === state.gameMaster!.id;
  } else {
    nonGM = players.slice();
    isGM = false;
  }

  const votesSoFar = Object.keys(state.votes ?? {}).length;
  const votesNeeded = nonGM.length;

  useEffect(() => {
    if (!state.votingDeadline) return;

    const msLeft = state.votingDeadline - Date.now();
    if (msLeft <= 0) {
      finalizeVoting();
      return;
    }

    setSecondsLeft(Math.ceil(msLeft / 1000));

    timerRef.current = window.setInterval(() => {
      const now = Date.now();
      const left = state.votingDeadline! - now;
      if (left <= 0) {
        clearInterval(timerRef.current);
        finalizeVoting();
      } else {
        setSecondsLeft(Math.ceil(left / 1000));
      }
    }, 250);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.votingDeadline, finalizeVoting]);

  useEffect(() => {
    if (votesSoFar >= votesNeeded) {
      if (timerRef.current) clearInterval(timerRef.current);
      finalizeVoting();
    }
  }, [votesSoFar, votesNeeded, finalizeVoting]);

  if (!player || !state) return null;

  const hasVoted = state.votes && !!state.votes[player.id];

  return (
    <div className="min-h-full w-full bg-purple-950 overflow-scroll">
      <div className="px-2 py-4 flex flex-col items-center justify-center">
        <h2 className="text-3xl sm:text-5xl font-heading font-semibold text-white">
          Who's Faking It?
        </h2>
        {!isGM && !hasVoted && (
          <div className="flex flex-col sm:flex-row justify-center items-center md:grid-cols-3 gap-4 w-full py-4">
            {nonGM
              .filter((p) => p.id !== player.id)
              .map((p) => (
                <button
                  className=" text-white p-2 rounded disabled:opacity-50 w-full sm:w-auto"
                  key={p.id}
                  style={{
                    backgroundColor: p.color.hex,
                  }}
                  onClick={() => submitVote(p.id)}
                >
                  {p.name}
                </button>
              ))}
          </div>
        )}

        {isGM && (
          <h3 className="text-white mb-4">Waiting for players to vote...</h3>
        )}
      </div>

      <div className="border p-2 bg-gray-200 mb-4 w-full h-[60vh] relative">
        <CanvasBoard readOnly />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-5xl font-semibold font-heading text-purple-800/50">
            {secondsLeft}
          </div>
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-gray-500">
          {votesSoFar} / {votesNeeded} votes cast
        </div>
      </div>
    </div>
  );
}
