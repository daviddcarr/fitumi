import { PLAYER_COLORS, type PlayerColor } from "@data/constants";
import type { Player } from "@lib/interfaces/player";
import { useGame } from "@stores/useGame";
import classNames from "classnames";
import { useState } from "react";
import { FaCrown, FaRegCheckCircle } from "react-icons/fa";


interface PlayerListItemProps {
    p: Player
    canEdit?: boolean;
    isLobby?: boolean;
}

const PlayerListItem = ({ p, canEdit = false, isLobby = false }: PlayerListItemProps) => {
    const { player, state, setGameMaster, updatePlayer } = useGame();
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
                    "space-y-2 p-1 rounded-3xl",
                    !isLobby && currentPlayer?.id === p.id ? "bg-slate-500" : "bg-slate-700",
                )}
                >
                <div className="flex items-center gap-2 w-full">
                {
                    p.id === player?.id ? (
                        <button
                            className="w-9 h-9 rounded-full cursor-pointer"
                            style={{ backgroundColor: p.color.hex }}
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            />
                    ) : (
                        <div
                            className="w-9 h-9 rounded-full"
                            style={{ backgroundColor: p.color.hex }}
                            />
                    )
                }
                <span className="text-white">{p.name}</span>
            
                {isLobby && readiness[p.id] && <FaRegCheckCircle className="text-green-400" />}
            
                {
                    // Show crown if game master
                    p.id === gameMaster?.id ? (
                        <span className="ml-auto p-2 flex items-center justify-center bg-slate-500 rounded-full">
                        <FaCrown className="text-yellow-400 text-xl" />
                    </span>
                    ) : player?.id === gameMaster?.id && canEdit ? (
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
                {
                    p.id === player?.id && showColorPicker && (
                        <div className="w-full flex justify-center">
                            <div className="grid grid-cols-4 gap-2 w-max">
                                {
                                    PLAYER_COLORS.map((c) => (
                                        <div
                                            key={c.name}
                                            className="w-9 h-9 rounded-full cursor-pointer"
                                            style={{ backgroundColor: c.hex }}
                                            onClick={() => handleColorChange(c)}
                                        />
                                    ))
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