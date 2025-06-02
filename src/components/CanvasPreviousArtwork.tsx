import type { Stroke } from "@lib/interfaces/room-state";
import classNames from "classnames";
import { useRef, useEffect, useState } from "react";
import { FaFileDownload, FaTimes } from "react-icons/fa";

interface CanvasPreviousArtworkProps {
  strokes: Stroke[];
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

const CanvasPreviousArtwork = ({ strokes }: CanvasPreviousArtworkProps) => {
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
      ctx.strokeStyle = stroke.color.hex;
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
      offscreenCtx.strokeStyle = stroke.color.hex;
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
                downloadAtSize(size.size, `fitumi-${size.abbr}.png`)
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
            <FaTimes />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CanvasPreviousArtwork;
