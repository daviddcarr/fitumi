import classNames from "classnames";
import { FaSyncAlt } from "react-icons/fa";

interface ButtonRefreshProps {
  isLight?: boolean;
  className?: string;
}

const ButtonRefresh = ({ isLight = false, className }: ButtonRefreshProps) => {
  return (
    <button
      className={classNames(
        "p-1 cursor-pointer",
        className,
        isLight
          ? "text-white hover:text-purple-200"
          : "text-purple-900 hover:text-purple-600"
      )}
      onClick={() => window.location.reload()}
      aria-label="Refresh"
    >
      <FaSyncAlt className="text-2xl" />
    </button>
  );
};

export default ButtonRefresh;
