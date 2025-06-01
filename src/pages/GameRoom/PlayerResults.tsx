import React from "react";
import { useGame } from "@stores/useGame";

export default function PlayerResults() {
    const { players, state, nextRound } = useGame();
    if ( !state.results ) return null;

    const { voteCounts, ranked, fakeWins, winners } = state.results;
    const scoreboard = state.scores || {};

    const outcomeMsg = fakeWins
        ? "The Fake Artist and Game Master win this round!"
        : "The Artists win this round!";

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <h2 className="text-3xl font-bold mb-4 text-white">{outcomeMsg}</h2>

             {/* 1) Vote tally (sorted): */}
            <div className="mb-6 w-full max-w-md">
                <h3 className="text-2xl font-semibold mb-2">Vote Tally</h3>
                <ul className="divide-y divide-gray-200">
                {ranked.map((pid) => {
                    const p = players.find((x) => x.id === pid)!;
                    const count = voteCounts[pid] || 0;
                    return (
                    <li
                        key={pid}
                        className="flex justify-between py-2 px-4 bg-gray-50 rounded mb-1"
                    >
                        <span className="font-medium">{p.name}</span>
                        <span className="text-gray-600">{count} vote{count !== 1 ? "s" : ""}</span>
                    </li>
                    );
                })}
                </ul>
            </div>

            {/* 2) Cumulative Scoreboard: */}
            <div className="mb-6 w-full max-w-md">
                <h3 className="text-2xl font-semibold mb-2">Overall Scores</h3>
                <ul className="divide-y divide-gray-200">
                {players.map((p) => {
                    const sc = scoreboard[p.id] || 0;
                    return (
                    <li
                        key={p.id}
                        className="flex justify-between py-2 px-4 bg-white rounded mb-1"
                    >
                        <span>{p.name}</span>
                        <span className="font-semibold">{sc}</span>
                    </li>
                    );
                })}
                </ul>
            </div>

            {/* 3) “Play Again” button: */}
            <button
                className="mt-4 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                onClick={() => nextRound()}
            >
                Play Again
            </button>

        </div>
    )

}