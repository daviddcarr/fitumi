import { useGame } from "@stores/useGame";
import CanvasPreviousArtwork from "@components/CanvasPreviousArtwork";
import { getColor } from "@data/constants";
import classNames from "classnames";

export default function PlayerResults() {
  const { players, state, nextRound } = useGame();
  if (!state.results) return null;

  const { previousArt, fakeArtist } = state;
  const { voteCounts, ranked, fakeWins } = state.results;
  const scoreboard = state.scores || {};

  if (!fakeArtist) return null;

  const outcomeMsg = fakeWins ? "The Faker Made It!" : "Artists Win!";
  const fakeArtistColor = getColor(fakeArtist?.color);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-8 bg-purple-950">
      <h2 className="text-3xl sm:text-4xl tracking-wider font-bold mb-4 text-white font-heading">
        {outcomeMsg}
      </h2>

      {/* Fake Artist Identity */}
      {fakeArtist && (
        <div className="mb-6 w-full max-w-md text-center">
          <h3 className="text-2xl font-semibold font-heading  mb-2">
            <span
              className={classNames(
                "inline-block px-3 font-heading tracking-wide rounded-full",
                fakeArtistColor.bg,
                fakeArtistColor.text
              )}
            >
              {fakeArtist.name}
            </span>{" "}
            <span className="text-white">was Faking It</span>
          </h3>
        </div>
      )}

      {/* 1) Vote tally (sorted): */}
      <div className="mb-6 w-full max-w-md">
        <h3 className="text-2xl font-semibold font-heading text-white mb-2">
          Vote Tally
        </h3>
        <ul className="divide-y divide-gray-200">
          {ranked.map((pid) => {
            const p = players.find((x) => x.id === pid)!;
            const count = voteCounts[pid] || 0;
            return (
              <li
                key={pid}
                className="flex justify-between py-2 px-4 bg-purple-900 border-0 text-white rounded-full mb-1"
              >
                <span className="font-medium">{p?.name}</span>
                <span className="text-purple-400">
                  {count} vote{count !== 1 ? "s" : ""}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 2) Cumulative Scoreboard: */}
      <div className="mb-6 w-full max-w-md">
        <h3 className="text-2xl font-semibold font-heading text-white mb-2">
          Overall Scores
        </h3>
        <ul className="divide-y divide-gray-200">
          {players.map((p) => {
            const sc = scoreboard[p.id] || 0;
            return (
              <li
                key={p.id}
                className="flex justify-between py-2 px-4 bg-purple-900 border-0 text-white rounded-full mb-1"
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
        className="mt-4 px-6 py-3 bg-purple-600 text-white font-semibold rounded-full hover:bg-yellow-600 transition"
        onClick={() => nextRound()}
      >
        Play Again
      </button>

      <div className="flex justify-center flex-wrap gap-4 mt-8">
        {previousArt.map((art, i) => {
          return <CanvasPreviousArtwork key={i} art={art} />;
        })}
      </div>
    </div>
  );
}
