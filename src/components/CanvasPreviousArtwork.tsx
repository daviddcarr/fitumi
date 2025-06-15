import { getColor } from "@data/constants";
import type { PreviousArt } from "@lib/interfaces/room-state";
import { useGame } from "@stores/useGame";
import classNames from "classnames";
import { useRef, useEffect, useState } from "react";
import { FaFileDownload, FaTimes } from "react-icons/fa";

import logoWhite from "/logo-white.png";

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
    const borderW = Math.round(size * 0.02);
    const bottomH = Math.round(size * 0.1);
    const radius = borderW * 0.7;
    const artW = size - borderW * 2;
    const artH = size - bottomH - borderW;
    const padding = borderW * 1.5;

    const off = document.createElement("canvas");
    off.width = size;
    off.height = size;
    const ctx = off.getContext("2d");
    if (!ctx) return;

    // Purple BG
    ctx.fillStyle = "#6600cc";
    ctx.fillRect(0, 0, size, size);

    // DRAW TEXT
    // Fonts
    ctx.fillStyle = "white";
    ctx.textBaseline = "middle";
    ctx.font = `${bottomH * 0.45}px "WDXL Lubrifont TC"`;
    ctx.letterSpacing = `${bottomH * 0.025}px`;

    // Logo
    ctx.textAlign = "left";
    ctx.fillText("FITUMI", padding, size - bottomH / 2);

    // Subject
    ctx.textAlign = "center";
    ctx.fillText(`"${subject}"`, size / 2, size - bottomH / 2);

    // Room Name
    ctx.textAlign = "right";
    ctx.fillText(
      state.name ?? "",
      size - padding,
      size - bottomH / 2
    )

    // DRAW ART
    // Canvas
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(
        borderW,
        borderW,
        artW,
        artH,
        radius,
      )
      ctx.fillStyle = "white";
      ctx.fill();
    }

    // Strokes
    strokes.forEach((stroke) => {
      const r = artH / size;
      const sidePadding = (size - artH) / 2;

      const color = getColor(stroke.color);
       ctx.strokeStyle = color.hex;
       ctx.lineWidth = (size / BASE_SIZE) * 1;
       ctx.beginPath();

      stroke.points.forEach((point, index) => {
        // Scale Strokes to fit insize inner canvas
        const x = ((point.x * size) * r) + sidePadding;
        const y = ((point.y * size) * r) + borderW;

        if (index === 0) {
           ctx.moveTo(x, y);
        } else {
           ctx.lineTo(x, y);
        }
      });
       ctx.stroke();
    });

    // DOWNLOAD
    off.toBlob((blob) => {
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
  }

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
