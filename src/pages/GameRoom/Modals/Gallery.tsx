import CanvasPreviousArtwork from "@components/CanvasPreviousArtwork";
import { useGame } from "@stores/useGame";

const Gallery = () => {
  const { state } = useGame();
  const { previousArt } = state;

  return (
    <div className="max-h-[70vh] overflow-y-scroll">
      <div className="flex justify-center flex-wrap gap-4">
        {previousArt.map((art, i) => {
          return <CanvasPreviousArtwork key={i} art={art} />;
        })}
      </div>
    </div>
  );
};

export default Gallery;
