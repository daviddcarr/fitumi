import { useState } from "react";
import { FaCopy } from "react-icons/fa";
import { useParams } from "react-router-dom";

const ButtonCopyUrl = () => {
  const { roomCode } = useParams();
  const [isCopied, setIsCopied] = useState(false);

  if (!roomCode) return null;

  return (
    <button
      className={`text-xl font-semibold flex gap-2 items-center cursor-pointer ${
        isCopied ? "text-green-500" : ""
      }`}
      onClick={() =>
        navigator.clipboard
          .writeText(window.location.origin + "/" + roomCode)
          .then(() => setIsCopied(true))
      }
    >
      {roomCode} <FaCopy />
    </button>
  );
};

export default ButtonCopyUrl;
