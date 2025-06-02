import { PLAYER_COLORS, type PlayerColor } from "@data/constants";
import type { Player } from "@lib/interfaces/player";
import { useGame } from "@stores/useGame";
import classNames from "classnames";
import { useState } from "react";
import { FaCrown, FaRegCheckCircle } from "react-icons/fa";
import { IoIosColorPalette } from "react-icons/io";


interface PlayerListItemProps {
    p: Player
    canEdit?: boolean;
    isLobby?: boolean;
}

const PlayerListItem = ({ p, canEdit = false, isLobby = false }: PlayerListItemProps) => {
    const { player, players, state, setGameMaster, updatePlayer } = useGame();
    const { gameMaster, readiness, currentPlayer } = state;
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [playerColor, setPlayerColor] = useState(p.color);

    console.log("Player List Item", p);

    const handleColorChange = (color: PlayerColor) => {
        setPlayerColor(color);
        updatePlayer({ ...p, color });
        setShowColorPicker(false);
    }

    return (
        <>
            <li
                key={p.id}
                className={classNames(
                    "space-y-2 p-1 rounded-lg",
                    !isLobby && currentPlayer?.id === p.id ? "bg-purple-700" : "bg-purple-900",
                )}
                >
                <div className="flex items-center gap-2 w-full">
                {
                    p.id === player?.id ? (
                        <button
                            className="w-9 h-9 group rounded-sm cursor-pointer flex items-center justify-center"
                            style={{ backgroundColor: p.color.hex }}
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            >
                            <IoIosColorPalette className="hidden group-hover:block text-white text-2xl" />
                        </button>
                    ) : (
                        <div
                            className="w-9 h-9 rounded-sm"
                            style={{ backgroundColor: p.color.hex }}
                            />
                    )
                }
                <span className="text-white">{p.name}</span>
            
                {isLobby && readiness[p.id] && <FaRegCheckCircle className="text-green-400" />}
            
                {
                    // Show crown if game master
                    p.id === gameMaster?.id ? (
                        <span className="ml-auto p-2 flex items-center justify-center bg-purple-950 rounded-sm">
                            <FaCrown className="text-yellow-400 text-xl" />
                        </span>
                    ) : player?.id === gameMaster?.id && canEdit ? (
                        <button
                        className="ml-auto p-2 flex cursor-pointer items-center justify-center bg-purple-500 rounded-sm hover:bg-slate-800 hover:text-white"
                        onClick={() => {
                            setGameMaster(p);
                        }}
                        >
                        <FaCrown className="text-xl" />
                    </button>
                    ) : null
                }
                </div>
                {
                    p.id === player?.id && showColorPicker && (
                        <div className="w-full flex justify-center p-2">
                            <div className="grid grid-cols-4 gap-2 w-full">
                                {
                                    PLAYER_COLORS.map((c) => {
                                        const isTaken = players.some((p) => p.color.name === c.name);
                                        
                                        return (
                                            <button
                                                key={c.name}
                                                className="min-w-9 w-full h-9 rounded-sm flex items-center justify-center disabled:opacity-50 cursor-pointer disabled:cursor-auto"
                                                disabled={isTaken}
                                                style={{ backgroundColor: c.hex }}
                                                onClick={() => handleColorChange(c)}
                                            >
                                                {isTaken && (
                                                    <FaRegCheckCircle className="text-white text-lg" />
                                                )}
                                            </button>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    )
                }
            </li>
        </>
    )

}

export default PlayerListItem