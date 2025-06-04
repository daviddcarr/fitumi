import classNames from "classnames";
import { useEffect, useState } from "react";
import { FaCopy } from "react-icons/fa";
import { useParams } from "react-router-dom";

const ButtonCopyUrl = () => {
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
        "text-xl font-semibold flex gap-2 items-center cursor-pointer relative",
        isCopied ? "text-green-500" : "text-purple-900 hover:text-purple-700"
      )}
      onClick={() =>
        navigator.clipboard
          .writeText(window.location.origin + "/" + roomCode)
          .then(() => setIsCopied(true))
      }
    >
      <FaCopy /> <span className="hidden sm:inline">{roomCode}</span>
      <div
        className={classNames(
          "absolute top-[90%] left-1/2 transform -translate-x-1/2",
          "text-xs font-normal text-purple-900",
          "transition-opacity duration-300 ease-in-out",
          "pointer-events-none",
          isCopied ? "opacity-100" : "opacity-0"
        )}
      >
        Copied!
      </div>
    </button>
  );
};

export default ButtonCopyUrl;
