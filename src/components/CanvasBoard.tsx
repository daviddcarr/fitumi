import React, { useRef, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Player } from "../pages/GameRoom";
import type RoomState from "../lib/interfaces/room-state";
import type { Point, Stroke } from "../lib/interfaces/room-state";

interface CanvasBoardProps {
  roomId: string;
  playerId: string;
  players: Player[];
  state: RoomState;
  setState: (state: RoomState) => void;
}

export default function CanvasBoard({
  roomId,
  playerId,
  players,
  state,
  setState,
}: CanvasBoardProps) {
  const { currentTurnIndex, strokes = [] } = state;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);

  useEffect(() => {
    console.log("State", state);
  }, [state]);

  useEffect(() => {
    console.log("Attempting to Redraw");
    const canvas = canvasRef.current!;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    console.log("Clearing Canvas");
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Saved Strokes
    console.log("Drawing Every Stroke");
    strokes.forEach((stroke) => {
      console.log("Drawing Stroke", stroke);
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
      context.strokeStyle = players[currentTurnIndex].color;
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
  }, [strokes, currentStroke, players, currentTurnIndex]);

  const handleMouseDown = (e: React.MouseEvent) => {
    console.log("Trying mouse down");
    if (!players[currentTurnIndex]) return;
    if (players[currentTurnIndex].id !== playerId) return;
    console.log("Starting Stroke");

    setIsDrawing(true);
    setCurrentStroke([
      {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      },
    ]);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    console.log("Mouse Moving");
    if (!players[currentTurnIndex]) return;
    if (players[currentTurnIndex].id !== playerId || !isDrawing) return;
    console.log("Contnuing Stroke");

    setCurrentStroke((prevStroke) => [
      ...prevStroke,
      {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      },
    ]);
  };

  const handleMouseUp = async () => {
    console.log("Mouse Up");
    if (!isDrawing) return;
    console.log("Ending Stroke");
    setIsDrawing(false);

    const newStroke: Stroke = {
      playerId,
      points: currentStroke,
      color: players[currentTurnIndex].color,
    };
    const newRoomState: RoomState = {
      ...state,
      strokes: [...(strokes ?? []), newStroke],
      currentTurnIndex: (currentTurnIndex + 1) % players.length,
    };

    setCurrentStroke([]);
    setState(newRoomState);
    await supabase
      .from("rooms")
      .update({ state: newRoomState })
      .eq("id", roomId);
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
