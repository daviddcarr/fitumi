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
      <ul className="space-y-2">
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
    </>
  );
};

export default PlayerList;
