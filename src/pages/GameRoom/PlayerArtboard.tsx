import CanvasBoard from "@components/CanvasBoard";
import PlayerList from "@components/PlayerList";
import { useGame } from "@stores/useGame";
import classNames from "classnames";

const SubjectCard = ({ subject }: { subject: string | null }) => {
  return (
    <div
      className={classNames(
        "p-2 h-20 font-heading capitalize border-2 border-white rounded-lg text-white flex items-center justify-center",
        subject ? "text-2xl" : "text-4xl"
      )}
    >
      {subject ? (
        subject
      ) : (
        <>
          ? <span className="text-6xl !font-heading">?</span> ?
        </>
      )}
    </div>
  );
};

const PlayerArtboard = () => {
  const { player, players, state } = useGame();
  const { currentSubject, fakeArtist } = state;

  if (!player) return null;

  return (
    <div
      className={classNames(
        "w-full h-full grid",
        player.leftHanded
          ? "lg:grid-cols-[1fr_auto]"
          : "lg:grid-cols-[auto_1fr]"
      )}
    >
      <div className="lg:order-1 lg:max-h-screen max-w-screen">
        {player && state && players.length > 0 && <CanvasBoard />}
      </div>

      <div
        className={classNames(
          "p-2 min-w-[200px] bg-purple-950 space-y-4",
          player.leftHanded ? "lg:order-2" : "lg:order-none"
        )}
      >
        <h3 className="text-3xl tracking-wide font-semibold text-white font-heading ">
          {state.name}
        </h3>

        <SubjectCard
          subject={fakeArtist?.id !== player.id ? currentSubject : null}
        />

        <PlayerList canEdit={false} />
      </div>
    </div>
  );
};

export default PlayerArtboard;
