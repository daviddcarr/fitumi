import React, { useRef, useEffect, useState } from "react";
import type { Point } from "../lib/interfaces/room-state";
import { useGame } from "../stores/useGame";
import classNames from "classnames";
import { getColor } from "@data/constants";
import type { PlayerColor } from "@data/constants";
import CursorProgressRing from "./CursorProgressRing";

interface CanvasBoardProps {
  readOnly?: boolean;
}

const BORDER_PADDING = 20;
const PADDING_DOUBLED = BORDER_PADDING * 2;
const MIN_STROKE_RATIO = 0.1;

export default function CanvasBoard({ readOnly = false }: CanvasBoardProps) {
  const { state, player, players, addStroke, strokes } = useGame();
  const { currentPlayer } = state;

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [canvasSize, setCanvasSize] = useState<number>(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPlayerColor, setCurrentPlayerColor] = useState<PlayerColor>();
  const [showYourTurn, setShowYourTurn] = useState(false);

  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [strokeLengthPx, setStrokeLengthPx] = useState(0);
  const [minLengthPx, setMinLengthPx] = useState(0);

  // Cursor position for progress ring
  const [cursorX, setCursorX] = useState(0);
  const [cursorY, setCursorY] = useState(0);

  const toPoint = (e: PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / canvasSize,
      y: (e.clientY - rect.top) / canvasSize,
    };
  };

  const drawSegment = (p1: Point, p2: Point, color: string, width: number) => {
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(p1.x * canvasSize, p1.y * canvasSize);
    ctx.lineTo(p2.x * canvasSize, p2.y * canvasSize);
    ctx.stroke();
  };

  const redrawStrokes = () => {
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    strokes.forEach((s) => {
      for (let i = 1; i < s.points.length - 1; i++) {
        drawSegment(s.points[i - 1], s.points[i], s.color, 2);
      }
    });
  };

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
  }, []);

  useEffect(() => {
    if (currentPlayer) {
      setCurrentPlayerColor(getColor(currentPlayer.color));
    }
  }, [currentPlayer]);

  useEffect(() => {
    if (currentPlayer?.id === player?.id) {
      setShowYourTurn(true);
      const t = window.setTimeout(() => {
        setShowYourTurn(false);
      }, 3000);
      return () => {
        window.clearTimeout(t);
      };
    }
  }, [currentPlayer, player]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;

    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const diag = Math.hypot(canvasSize, canvasSize);
    setMinLengthPx(diag * MIN_STROKE_RATIO);

    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Saved Strokes
    strokes.forEach((stroke) => {
      const hex = getColor(stroke.color).hex;
      stroke.points.forEach((point, index) => {
        drawSegment(point, stroke.points[index - 1] || point, hex, 2);
      });
    });

    // Draw Current Strokes
    if (currentStroke.length > 0 && currentPlayer) {
      currentStroke.forEach((point, index) => {
        drawSegment(
          point,
          currentStroke[index - 1] || point,
          currentPlayerColor?.hex || "black",
          2
        );
      });
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
    // Always update cursor position when it's the player's turn and they're over the canvas
    if (currentPlayer?.id === player?.id) {
      setCursorX(e.clientX);
      setCursorY(e.clientY);
    }

    if (!currentPlayer || !player) return;
    if (currentPlayer.id !== player.id || !isDrawing) return;
    if (canvasSize === 0) return;

    e.preventDefault();

    const pNew = toPoint(e.nativeEvent);
    const pLast = currentStroke[currentStroke.length - 1];

    const dx = (pNew.x - pLast.x) * canvasSize;
    const dy = (pNew.y - pLast.y) * canvasSize;
    const dist = Math.hypot(dx, dy);

    setStrokeLengthPx((len) => len + dist);
    setCurrentStroke((prevStroke) => [...prevStroke, pNew]);
  };

  const handlePointerUp = async (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);

    if (currentStroke.length === 0) return;
    if (strokeLengthPx >= minLengthPx) {
      await addStroke(currentStroke);
    } else {
      redrawStrokes();
    }
    setCurrentStroke([]);
    setStrokeLengthPx(0);
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full p-2 flex items-center justify-center bg-slate-200 relative"
    >
      <div className="flex flex-col gap-2 items-center">
        <div
          style={{
            width: `${canvasSize + BORDER_PADDING / 2}px`,
            height: `${canvasSize + BORDER_PADDING / 2}px`,
          }}
          className={classNames(
            "rounded-[28px] relative overflow-hidden flex items-center justify-center",
            currentPlayer?.id === player?.id && !readOnly
              ? "after:z-0 after:block after:absolute after:animate-spin-background after:w-[150%] after:h-[150%] after:inset-[-25%] after:rounded-full after:bg-conic/increasing after:from-violet-700 after:via-lime-300 after:to-violet-700"
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
              "rounded-3xl relative z-[2]",
              currentPlayer?.id === player?.id || readOnly
                ? "bg-white"
                : "bg-transparent"
            )}
          />

          {currentPlayer?.id === player?.id && !readOnly && (
            <div
              className={classNames(
                "z-[1] block absolute pointer-events-none",
                isDrawing && "inset-0 w-full h-full"
              )}
              style={
                isDrawing
                  ? {
                      backgroundImage: `conic-gradient(${
                        currentPlayerColor?.hex
                      } ${
                        (strokeLengthPx / minLengthPx) * 100
                      }%, transparent 0 100%)`,
                    }
                  : {}
              }
            />
          )}
        </div>
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
            <div
              className={classNames(
                "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-max",
                "transition-opacity duration-300 ease-out",
                showYourTurn ? "opacity-100" : "opacity-0"
              )}
            >
              <h2 className="font-heading text-purple-800 text-5xl animate-bounce">
                Your Turn!
              </h2>
            </div>
          )}
        </div>
      </div>

      {/* Cursor Progress Ring */}
      <CursorProgressRing
        isDrawing={isDrawing}
        progress={minLengthPx > 0 ? strokeLengthPx / minLengthPx : 0}
        cursorX={cursorX}
        cursorY={cursorY}
        color={currentPlayerColor?.hex || "#000000"}
      />
    </div>
  );
}
