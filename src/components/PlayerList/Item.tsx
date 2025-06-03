import { getColor, PLAYER_COLORS, type PlayerColor } from "@data/constants";
import type { Player } from "@lib/interfaces/player";
import { useGame } from "@stores/useGame";
import classNames from "classnames";
import { useState } from "react";
import { FaCrown, FaRegCheckCircle } from "react-icons/fa";
import { FaPaintbrush } from "react-icons/fa6";
import { IoIosColorPalette } from "react-icons/io";

interface PlayerListItemProps {
  p: Player;
  canEdit?: boolean;
  isLobby?: boolean;
}

const PlayerListItem = ({
  p,
  canEdit = false,
  isLobby = false,
}: PlayerListItemProps) => {
  const { player, players, state, setGameMaster, updatePlayer } = useGame();
  const { gameMaster, readiness, currentPlayer } = state;
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleColorChange = (color: string) => {
    updatePlayer({ ...p, color });
    setShowColorPicker(false);
  };

  const playerColor: PlayerColor = getColor(p.color);

  return (
    <>
      <li
        key={p.id}
        className={classNames(
          "space-y-2 p-1 rounded-3xl border-2",
          playerColor?.border,
          !isLobby && currentPlayer?.id === p.id
            ? `${playerColor.bg} ${playerColor.text}`
            : "bg-purple-900 text-white"
        )}
      >
        <div className="flex items-center gap-2 w-full">
          {p.id === player?.id && isLobby ? (
            <button
              className="w-9 h-9 group rounded-full cursor-pointer flex items-center justify-center"
              style={{ backgroundColor: playerColor?.hex }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              <IoIosColorPalette className="hidden group-hover:block text-white text-2xl" />
            </button>
          ) : (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: playerColor.hex }}
            >
              {!isLobby && currentPlayer?.id === p.id && (
                <FaPaintbrush
                  className={classNames("text-2xl", playerColor?.text)}
                />
              )}
            </div>
          )}
          <span className=" font-heading text-xl tracking-widest mr-2">
            {p.name}
          </span>

          {isLobby && readiness[p.id] && (
            <FaRegCheckCircle className="text-green-400" />
          )}

          {
            // Show crown if game master
            p.id === gameMaster?.id ? (
              <span className="ml-auto p-2 flex items-center justify-center bg-purple-950 rounded-full">
                <FaCrown className="text-yellow-400 text-xl" />
              </span>
            ) : player?.id === gameMaster?.id && canEdit ? (
              <button
                className="ml-auto p-2 flex cursor-pointer items-center justify-center rounded-full opacity-50 hover:opacity-100 hover:bg-purple-950 hover:text-white"
                onClick={() => {
                  setGameMaster(p);
                }}
              >
                <FaCrown className="text-xl" />
              </button>
            ) : null
          }
        </div>
        {p.id === player?.id && showColorPicker && (
          <div className="w-full flex justify-center p-2">
            <div className="grid grid-cols-4 gap-2 w-full">
              {PLAYER_COLORS.map((c) => {
                const isTaken = players.some((p) => p.color === c.name);

                return (
                  <button
                    key={c.name}
                    className={classNames(
                      !isTaken && c.hoverBorder,
                      c.border,
                      "min-w-9 w-full border-4 h-9 rounded-3xl flex items-center justify-center disabled:opacity-50 cursor-pointer disabled:cursor-auto",
                      c.bg
                    )}
                    disabled={isTaken}
                    onClick={() => handleColorChange(c.name)}
                  >
                    {isTaken && (
                      <FaRegCheckCircle className="text-white text-lg" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </li>
    </>
  );
};

export default PlayerListItem;
