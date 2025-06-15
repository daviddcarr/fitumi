import React, { useRef, useEffect, useState } from "react";
import type { Point } from "../lib/interfaces/room-state";
import { useGame } from "../stores/useGame";
import classNames from "classnames";
import { getColor } from "@data/constants";
import type { PlayerColor } from "@data/constants";

interface CanvasBoardProps {
  readOnly?: boolean;
}

const BORDER_PADDING = 20;
const PADDING_DOUBLED = BORDER_PADDING * 2;

export default function CanvasBoard({ readOnly = false }: CanvasBoardProps) {
  const { state, player, players, addStroke } = useGame();
  const { currentPlayer, strokes = [] } = state;

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [canvasSize, setCanvasSize] = useState<number>(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [currentPlayerColor, setCurrentPlayerColor] = useState<PlayerColor>();
  const [showYourTurn, setShowYourTurn] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect();
      setCanvasSize(Math.min(width, height) - PADDING_DOUBLED);
    });
    resizeObserver.observe(container);
    return () => {
      resizeObserver.disconnect();
    };
  }, [])

  useEffect(() => {
    if (currentPlayer) {
      setCurrentPlayerColor(getColor(currentPlayer.color));
    }
  }, [currentPlayer]);

  useEffect(() => {
    if (currentPlayer?.id === player?.id) {
      setShowYourTurn(true);
      const t = window.setTimeout(() => {
        setShowYourTurn(false);
      }, 3000);
      return () => {
        window.clearTimeout(t);
      }
    }
  }, [currentPlayer, player]);

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
      const hex = getColor(stroke.color).hex;
      context.strokeStyle = hex;
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
    if (currentStroke.length > 0 && currentPlayer) {
      context.strokeStyle = currentPlayerColor?.hex || "black";
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

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!currentPlayer || !player) return;
    if (currentPlayer.id !== player.id) return;
    if (canvasSize === 0) return;

    e.preventDefault();

    setIsDrawing(true);

    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    const relX = rawX / canvasSize;
    const relY = rawY / canvasSize;

    setCurrentStroke([
      {
        x: relX,
        y: relY,
      },
    ]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!currentPlayer || !player) return;
    if (currentPlayer.id !== player.id || !isDrawing) return;
    if (canvasSize === 0) return;

    e.preventDefault();

    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

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

  const handlePointerUp = async (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);

    if (currentStroke.length === 0) return;
    await addStroke(currentStroke);
    setCurrentStroke([]);
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full p-2 flex items-center justify-center bg-slate-200 relative"
    >
      <div
        style={{
          width: `${canvasSize + BORDER_PADDING / 2}px`,
          height: `${canvasSize + BORDER_PADDING / 2}px`,
        }}
        className={classNames(
          "rounded-[28px] relative overflow-hidden flex items-center justify-center",
          currentPlayer?.id === player?.id && !readOnly
            ? "after:animate-spin-background after:z-0 after:block after:absolute after:w-[150%] after:h-[150%] after:inset-[-25%] after:rounded-full after:bg-conic/increasing after:from-violet-700 after:via-lime-300 after:to-violet-700"
            : "border-2 border-gray-300"
        )}
      >
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          onPointerDown={readOnly ? undefined : handlePointerDown}
          onPointerMove={readOnly ? undefined : handlePointerMove}
          onPointerUp={readOnly ? undefined : handlePointerUp}
          onPointerLeave={readOnly ? undefined : handlePointerUp}
          style={{ touchAction: "none" }}
          className={classNames(
            "rounded-3xl relative z-[1]",
            currentPlayer?.id === player?.id || readOnly
              ? "bg-white"
              : "bg-transparent"
          )}
        />
      </div>

      <div className="w-full h-full pointer-events-none absolute inset-0">
        {currentPlayer?.id !== player?.id && !readOnly && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-max">
            <h2 className="font-heading text-purple-800 text-2xl">
              <span
                className={classNames(
                  "inline-block px-2 font-heading tracking-wide rounded",
                  currentPlayerColor?.text
                )}
                style={{
                  backgroundColor: currentPlayerColor?.hex,
                  color: currentPlayerColor?.text,
                }}
              >
                {currentPlayer?.name}
              </span>{" "}
              is drawing
            </h2>
          </div>
        )}

        <div className="absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-max">
          {currentPlayer?.id === player?.id && !readOnly && (
            <div className={classNames(
                "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-max",
                "transition-opacity duration-300 ease-out",
                showYourTurn ? "opacity-100" : "opacity-0"
              )}>
              <h2 className="font-heading text-purple-800 text-5xl animate-bounce">
                  Your Turn!
              </h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
