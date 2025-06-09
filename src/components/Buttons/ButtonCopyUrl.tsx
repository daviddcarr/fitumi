import classNames from "classnames";
import { useEffect, useState } from "react";
import { FaCopy } from "react-icons/fa";
import { useParams } from "react-router-dom";

interface ButtonCopyUrlProps {
  isLight?: boolean;
  hideLabel?: boolean;
  className?: string;
}

const ButtonCopyUrl = ({
  isLight = false,
  hideLabel = false,
  className,
}: ButtonCopyUrlProps) => {
  const { roomCode } = useParams();
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  if (!roomCode) return null;

  return (
    <button
      className={classNames(
        className,
        "text-xl font-semibold flex gap-2 items-center cursor-pointer relative p-1",
        isCopied
          ? "text-green-500"
          : isLight
          ? "text-white hover:text-purple-200"
          : "text-purple-900 hover:text-purple-700"
      )}
      onClick={() =>
        navigator.clipboard
          .writeText(window.location.origin + "/" + roomCode)
          .then(() => setIsCopied(true))
      }
    >
      <FaCopy />
      {hideLabel ? null : <span className="hidden sm:inline">{roomCode}</span>}
      <div
        className={classNames(
          "absolute top-[95%] left-1/2 transform -translate-x-1/2",
          "text-xs font-normal",
          "transition-opacity duration-300 ease-in-out",
          "pointer-events-none",
          isLight ? "text-white" : "text-purple-900",
          isCopied ? "opacity-100" : "opacity-0"
        )}
      >
        Copied!
      </div>
    </button>
  );
};

export default ButtonCopyUrl;
