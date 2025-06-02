import type { Stroke } from "@lib/interfaces/room-state";
import { useRef, useEffect } from "react";

interface CanvasPreviousArtworkProps {
  strokes: Stroke[];
}

const CanvasPreviousArtwork = ({ strokes }: CanvasPreviousArtworkProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach((stroke) => {
      ctx.strokeStyle = stroke.color.hex;
      ctx.lineWidth = 1;
      ctx.beginPath();

      stroke.points.forEach((point, index) => {
        const x = point.x * 200;
        const y = point.y * 200;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    });
  }, [strokes]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      className="w-full h-full bg-white rounded-2xl"
    ></canvas>
  );
};

export default CanvasPreviousArtwork;
