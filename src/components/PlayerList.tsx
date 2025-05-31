import { useGame } from "@stores/useGame";
import classNames from "classnames";
import { FaCrown, FaRegCheckCircle } from "react-icons/fa";

interface PlayerListProps {
  canEdit?: boolean;
  isLobby?: boolean;
}

const PlayerList = ({ canEdit = false, isLobby = false }: PlayerListProps) => {
  const { player, players, state, setGameMaster } = useGame();
  const { gameMaster, readiness, currentPlayer } = state;

  if (!player) return null;

  return (
    <>
      {/* Player List */}
      <p className="mt-2 mb-4 text-white">Players:</p>
      <ul className="space-y-2">
        {players.map((p) => {
          return (
            <li
              key={p.id}
              className={classNames(
                "flex items-center space-x-2 gap-2 p-1 rounded-full",
                !isLobby && currentPlayer?.id === p.id ? "bg-slate-500" : "bg-slate-700",
              )}
            >
              <div className="flex items-center gap-2 w-full">
                <span
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                <span className="text-white">{p.name}</span>

                {isLobby && readiness[p.id] && <FaRegCheckCircle className="text-green-400" />}

                {
                  // Show crown if game master
                  p.id === gameMaster?.id ? (
                    <span className="ml-auto p-2 flex items-center justify-center bg-slate-500 rounded-full">
                      <FaCrown className="text-yellow-400 text-xl" />
                    </span>
                  ) : player.id === gameMaster?.id && canEdit ? (
                    <button
                      className="ml-auto p-2 flex cursor-pointer items-center justify-center bg-slate-500 rounded-full hover:bg-slate-800 hover:text-white"
                      onClick={() => {
                        setGameMaster(p);
                      }}
                    >
                      <FaCrown className="text-xl" />
                    </button>
                  ) : null
                }
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default PlayerList;
