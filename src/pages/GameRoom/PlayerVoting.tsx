import React, { useEffect, useState, useRef } from "react";
import { useGame } from "@stores/useGame";
import CanvasBoard from "@components/CanvasBoard";
import type { Player } from "@lib/interfaces/player";

export default function PlayerVoting() {
    const {
        player,
        players,
        state,
        submitVote,
        finalizeVoting,
    } = useGame();

    const [secondsLeft, setSecondsLeft] = useState(0);
    const timerRef = useRef<number>(0);

    if (!player || !state) return null;

    let nonGM: Player[]
    let isGM: boolean
    if (state.gameMaster) {
        nonGM = players.filter((p) => p.id !== state.gameMaster!.id);
        isGM = player.id === state.gameMaster!.id;
    } else {
        nonGM = players.slice()
        isGM = false
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
        }, 250)

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        }
    }, [state.votingDeadline])

    useEffect(() => {
        if (votesSoFar >= votesNeeded) {
            if (timerRef.current) clearInterval(timerRef.current);
            finalizeVoting();
        }
    }, [votesSoFar, votesNeeded])

    const hasVoted = state.votes && !!state.votes[player.id];

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-3xl font-semibold mb-4 text-gray-800">
                Voting Time! Who's the Fake Artist?
            </h2>

            <div className="border border-gray-300 mb-4 w-[80vw] h-[60vh]">
                <CanvasBoard 
                    //readOnly 
                    />
            </div>

            <div className="mb-4 text-xl text-gray-700">
                {isGM
                    ? "You're the Game Master - Waiting for others to vote."
                    : hasVoted
                    ? "Waiting for other players to finish voting..."
                    : `Time Left: ${secondsLeft} seconds` }
            </div>

            { !isGM && !hasVoted && (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {
                        nonGM
                            .filter((p) => p.id !== player.id)
                            .map((p) => (
                                <button
                                    className="bg-blue-500 text-white py-2 rounded disabled:opacity-50"
                                    key={p.id}
                                    onClick={() => submitVote(p.id)}
                                >
                                    {p.name}
                                </button>
                            ))
                    }
                </div>
            )}

            <div className="mt-4 text-sm text-gray-500">
                {votesSoFar} / {votesNeeded} votes cast
            </div>

        </div>
    )
}