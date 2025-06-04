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
      <div className="w-full @container/player-list p-2 border-2 border-purple-300 bg-purple-300/20 rounded-4xl">
        <ul className="flex flex-col gap-2 @sm/player-list:flex-row @sm/player-list:flex-wrap">
          {players.length > 0 &&
            players.map((p) => {
              return (
                <PlayerListItem
                  p={p}
                  canEdit={canEdit}
                  isLobby={isLobby}
                  key={p.id}
                />
              );
            })}

          {players.length === 0 && (
            <p className="text-center text-sm max-w-64 mx-auto text-purple-900">
              Don't see your player? Refreshing the page might help!
            </p>
          )}
        </ul>
      </div>
    </>
  );
};

export default PlayerList;
