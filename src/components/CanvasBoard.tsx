import React, { useRef, useEffect, useState } from "react";
import type { Point } from "../lib/interfaces/room-state";
import { useGame } from "../stores/useGame";

export default function CanvasBoard() {
  const { state, player, players, addStroke } = useGame();
  const { currentPlayer, strokes = [] } = state;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);

  useEffect(() => {
    console.log("Attempting to Redraw");
    const canvas = canvasRef.current!;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Saved Strokes
    strokes.forEach((stroke) => {
      context.strokeStyle = stroke.color;
      context.lineWidth = 2;
      context.beginPath();
      stroke.points.forEach((point, index) => {
        if (index === 0) {
          context.moveTo(point.x, point.y);
        } else {
          context.lineTo(point.x, point.y);
        }
      });
      context.stroke();
    });

    // Draw Current Strokes
    if (currentStroke.length > 0) {
      context.strokeStyle = currentPlayer?.color || "black";
      context.lineWidth = 2;
      context.beginPath();
      currentStroke.forEach((point, index) => {
        if (index === 0) {
          context.moveTo(point.x, point.y);
        } else {
          context.lineTo(point.x, point.y);
        }
      });
      context.stroke();
    }
  }, [strokes, currentStroke, players, currentPlayer]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!currentPlayer || !player) return;
    if (currentPlayer.id !== player.id) return;

    setIsDrawing(true);
    setCurrentStroke([
      {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      },
    ]);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!currentPlayer || !player) return;
    if (currentPlayer.id !== player.id || !isDrawing) return;

    setCurrentStroke((prevStroke) => [
      ...prevStroke,
      {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
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
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="bg-white"
    />
  );
}
