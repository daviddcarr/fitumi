import { getColor } from "@data/constants";
import type { PreviousArt } from "@lib/interfaces/room-state";
import { useGame } from "@stores/useGame";
import classNames from "classnames";
import { useRef, useEffect, useState } from "react";
import { FaFileDownload, FaTimes } from "react-icons/fa";

interface CanvasPreviousArtworkProps {
  art: PreviousArt;
}

const BASE_SIZE = 200;

const DOWNLOAD_SIZES: { size: number; name: string; abbr: string }[] = [
  {
    size: BASE_SIZE,
    name: "thumbnail",
    abbr: "XS",
  },
  {
    size: BASE_SIZE * 3,
    name: "small",
    abbr: "SM",
  },
  {
    size: BASE_SIZE * 4,
    name: "medium",
    abbr: "MD",
  },
  {
    size: BASE_SIZE * 8,
    name: "large",
    abbr: "LG",
  },
];

const CanvasPreviousArtwork = ({ art }: CanvasPreviousArtworkProps) => {
  const { subject, strokes } = art;
  const { state } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = BASE_SIZE;
    canvas.height = BASE_SIZE;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach((stroke) => {
      const color = getColor(stroke.color);
      ctx.strokeStyle = color.hex;
      ctx.lineWidth = 1;
      ctx.beginPath();

      stroke.points.forEach((point, index) => {
        const x = point.x * BASE_SIZE;
        const y = point.y * BASE_SIZE;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    });
  }, [strokes]);

  const downloadAtSize = (size: number, filename: string) => {
    const offscreen = document.createElement("canvas");
    offscreen.width = size;
    offscreen.height = size;

    const offscreenCtx = offscreen.getContext("2d");
    if (!offscreenCtx) return;

    offscreenCtx.fillStyle = "white";
    offscreenCtx.fillRect(0, 0, size, size);

    strokes.forEach((stroke) => {
      const color = getColor(stroke.color);
      offscreenCtx.strokeStyle = color.hex;
      offscreenCtx.lineWidth = (size / BASE_SIZE) * 1;
      offscreenCtx.beginPath();

      stroke.points.forEach((point, index) => {
        const x = point.x * size;
        const y = point.y * size;

        if (index === 0) {
          offscreenCtx.moveTo(x, y);
        } else {
          offscreenCtx.lineTo(x, y);
        }
      });
      offscreenCtx.stroke();
    });

    offscreen.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }, "image/png");

    setShowDownloadOptions(false);
  };

  return (
    <div className="relative block group rounded-2xl overflow-hidden cursor-pointer">
      <canvas
        ref={canvasRef}
        width={BASE_SIZE}
        height={BASE_SIZE}
        className="w-full bg-white"
        onClick={() => setShowDownloadOptions(true)}
      ></canvas>

      <div className="absolute inset-0 flex flex-col gap-2 items-center justify-center opacity-0 pointer-events-none group-hover:opacity-100 backdrop-blur-[2px]">
        <FaFileDownload className="text-4xl" />
        <span className="capitalize">{subject}</span>
      </div>

      <div
        className={classNames(
          "absolute inset-0 flex flex-col items-center justify-center",
          "space-y-2 bg-purple-900/30 backdrop-blur-xl p-2",
          showDownloadOptions ? "flex" : "hidden"
        )}
      >
        <div className="grid grid-cols-2 gap-2 w-full">
          {DOWNLOAD_SIZES.map((size) => (
            <button
              key={size.name}
              className="bg-white hover:bg-purple-800 hover:text-white flex gap-1 items-center justify-center rounded-full p-2 cursor-pointer"
              onClick={() =>
                downloadAtSize(
                  size.size,
                  `fitumi-${state.name}-${subject}-${size.abbr}.png`
                )
              }
            >
              <FaFileDownload />
              {size.abbr}
            </button>
          ))}
          <button
            className=" col-span-2 bg-white hover:bg-purple-800 hover:text-white flex gap-1 items-center justify-center rounded-full p-2 cursor-pointer"
            onClick={() => setShowDownloadOptions(false)}
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CanvasPreviousArtwork;
