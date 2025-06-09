import { useGame } from "@stores/useGame";
import classNames from "classnames";
import { FaInfoCircle } from "react-icons/fa";

interface ButtonInfoProps {
  isLight?: boolean;
  className?: string;
}

const ButtonInfo = ({ isLight = false, className }: ButtonInfoProps) => {
  const { setShowInfo } = useGame();

  return (
    <button
      className={classNames(
        "p-1 cursor-pointer",
        className,
        isLight
          ? "text-white hover:text-purple-200"
          : "text-purple-900 hover:text-purple-600"
      )}
      onClick={() => setShowInfo(true)}
    >
      <FaInfoCircle className="text-2xl" />
    </button>
  );
};

export default ButtonInfo;
