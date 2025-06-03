import { useGame } from "@stores/useGame";
import PlayerListItem from "./Item";

interface PlayerListProps {
  canEdit?: boolean;
  isLobby?: boolean;
}

const PlayerList = ({ canEdit = false, isLobby = false }: PlayerListProps) => {
  const { player, players } = useGame();

  if (!player) return null;

  return (
    <>
      {/* Player List */}
      <div className="w-full @container/player-list p-2 bg-purple-200/10 rounded-4xl">
        <ul className="flex flex-col gap-2 @sm/player-list:flex-row @sm/player-list:flex-wrap">
          {players.map((p) => {
            return (
              <PlayerListItem
                p={p}
                canEdit={canEdit}
                isLobby={isLobby}
                key={p.id}
              />
            );
          })}
        </ul>
      </div>
    </>
  );
};

export default PlayerList;
