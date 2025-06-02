import React, { useRef, useEffect, useState } from "react";
import type { Point } from "../lib/interfaces/room-state";
import { useGame } from "../stores/useGame";

interface CanvasBoardProps {
  readOnly?: boolean;
}

export default function CanvasBoard({ readOnly = false }: CanvasBoardProps) {
  const { state, player, players, addStroke } = useGame();
  const { currentPlayer, strokes = [] } = state;

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [canvasSize, setCanvasSize] = useState<number>(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect();
      setCanvasSize(Math.min(width, height));
    });
    resizeObserver.observe(container);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;

    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Saved Strokes
    strokes.forEach((stroke) => {
      context.strokeStyle = stroke.color.hex;
      context.lineWidth = 2;
      context.beginPath();

      stroke.points.forEach((point, index) => {
        const x = point.x * canvasSize;
        const y = point.y * canvasSize;

        if (index === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      });
      context.stroke();
    });

    // Draw Current Strokes
    if (currentStroke.length > 0) {
      context.strokeStyle = currentPlayer?.color.hex || "black";
      context.lineWidth = 2;
      context.beginPath();

      currentStroke.forEach((point, index) => {
        const x = point.x * canvasSize;
        const y = point.y * canvasSize;

        if (index === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      });
      context.stroke();
    }
  }, [strokes, currentStroke, players, currentPlayer, canvasSize]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!currentPlayer || !player) return;
    if (currentPlayer.id !== player.id) return;
    if (canvasSize === 0) return;

    setIsDrawing(true);

    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const rawX = e.nativeEvent.clientX - rect.left;
    const rawY = e.nativeEvent.clientY - rect.top;

    const relX = rawX / canvasSize;
    const relY = rawY / canvasSize;

    setCurrentStroke([
      {
        x: relX,
        y: relY,
      },
    ]);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!currentPlayer || !player) return;
    if (currentPlayer.id !== player.id || !isDrawing) return;
    if (canvasSize === 0) return;

    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const rawX = e.nativeEvent.clientX - rect.left;
    const rawY = e.nativeEvent.clientY - rect.top;

    const relX = rawX / canvasSize;
    const relY = rawY / canvasSize;

    setCurrentStroke((prevStroke) => [
      ...prevStroke,
      {
        x: relX,
        y: relY,
      },
    ]);
  };

  const handleMouseUp = async () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    await addStroke(currentStroke);
    setCurrentStroke([]);
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full p-2 flex items-center justify-center bg-slate-200"
    >
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        onMouseDown={readOnly ? undefined : handleMouseDown}
        onMouseMove={readOnly ? undefined : handleMouseMove}
        onMouseUp={readOnly ? undefined : handleMouseUp}
        className={
          currentPlayer?.id === player?.id || readOnly
            ? "bg-white"
            : "bg-transparent"
        }
      />
    </div>
  );
}
