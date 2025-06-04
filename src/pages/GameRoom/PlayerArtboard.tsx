import CanvasBoard from "@components/CanvasBoard";
import PlayerList from "@components/PlayerList";
import { useGame } from "@stores/useGame";
import classNames from "classnames";
import { FaInfoCircle, FaRegImages } from "react-icons/fa";

export const SubjectCard = ({ subject }: { subject: string | null }) => {
  return (
    <div
      className={classNames(
        "p-4 h-max font-heading capitalize border-2 min-w-24 border-white rounded-3xl text-white text-center",
        subject ? "text-2xl" : "text-4xl"
      )}
    >
      <div className="flex flex-col items-center justify-center">
        <span className="text-sm uppercase tracking-widest opacity-50">
          Subject
        </span>
        {subject ? (
          <span>{subject}</span>
        ) : (
          <div>
            <span className="animate-pulse">?</span>{" "}
            <span
              className="text-5xl !font-heading animate-pulse"
              style={{ animationDelay: "0.4s" }}
            >
              ?
            </span>{" "}
            <span className="animate-pulse" style={{ animationDelay: "0.8s" }}>
              ?
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const PlayerArtboard = () => {
  const { player, players, state, setShowInfo, setShowGallery } = useGame();
  const { currentSubject, fakeArtist, previousArt } = state;

  if (!player) return null;

  return (
    <div
      className={classNames(
        "w-full min-h-screen h-full grid",
        player.leftHanded
          ? "lg:grid-cols-[1fr_auto]"
          : "lg:grid-cols-[auto_1fr]"
      )}
    >
      <div className="lg:order-1 min-h-[75vh] lg:max-h-screen max-w-screen">
        {player && state && players.length > 0 && <CanvasBoard />}
      </div>

      <div
        className={classNames(
          "p-2 px-4 min-w-[200px] bg-purple-950 space-y-4",
          player.leftHanded ? "lg:order-2" : "lg:order-none"
        )}
      >
        <h3 className="text-3xl text-center mb-2 mt-1 tracking-wide font-semibold text-white font-heading ">
          {state.name}
        </h3>

        <div className="@container/player-info">
          <div className="flex flex-col @md/player-info:grid @md/player-info:grid-cols-[auto_1fr] gap-2">
            <SubjectCard
              subject={fakeArtist?.id !== player.id ? currentSubject : null}
            />

            <PlayerList canEdit={false} isLobby={false} />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            className="p-2 text-white hover:text-purple-200"
            onClick={() => setShowInfo(true)}
          >
            <FaInfoCircle className="text-2xl" />
          </button>
          {previousArt.length > 0 && (
            <button
              className="p-2 text-white hover:text-purple-200"
              onClick={() => setShowGallery(true)}
            >
              <FaRegImages className="text-2xl" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerArtboard;
