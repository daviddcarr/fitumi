import { useGame } from "@stores/useGame";
import classNames from "classnames";
import { FaRegImage } from "react-icons/fa";

interface ButtonGalleryProps {
  isLight?: boolean;
  className?: string;
}

const ButtonGallery = ({ isLight = false, className }: ButtonGalleryProps) => {
  const { setShowGallery, state } = useGame();
  const { previousArt } = state;

  if (previousArt.length === 0) return null;
  return (
    <button
      className={classNames(
        "p-1 cursor-pointer",
        className,
        isLight
          ? "text-white hover:text-purple-200"
          : "text-purple-900 hover:text-purple-600"
      )}
      onClick={() => setShowGallery(true)}
    >
      <FaRegImage className="text-2xl" />
    </button>
  );
};

export default ButtonGallery;
