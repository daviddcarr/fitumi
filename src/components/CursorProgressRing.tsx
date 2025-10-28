import { useEffect, useState, useMemo } from "react";
import Lottie from "lottie-react";
import fireworksAnimationBase from "../../public/lottie/fireworks/Fireworks.json";
import { recolorLottieAnimation } from "../utils/lottieColorizer";

interface CursorProgressRingProps {
  isDrawing: boolean;
  progress: number; // 0 to 1
  cursorX: number;
  cursorY: number;
  color: string;
  onComplete?: () => void;
}

export default function CursorProgressRing({
  isDrawing,
  progress,
  cursorX,
  cursorY,
  color,
  onComplete,
}: CursorProgressRingProps) {
  const [showFireworks, setShowFireworks] = useState(false);
  const [prevProgress, setPrevProgress] = useState(0);
  const [hasCompletedThisStroke, setHasCompletedThisStroke] = useState(false);

  // Freeze fireworks position when they trigger
  const [fireworksX, setFireworksX] = useState(0);
  const [fireworksY, setFireworksY] = useState(0);

  // Recolor the fireworks animation to match the player's color
  const fireworksAnimation = useMemo(
    () => recolorLottieAnimation(fireworksAnimationBase, color),
    [color]
  );

  // Detect when progress reaches 100%
  useEffect(() => {
    if (progress >= 1 && prevProgress < 1 && isDrawing && !hasCompletedThisStroke) {
      // Capture current cursor position for fireworks
      setFireworksX(cursorX);
      setFireworksY(cursorY);

      setShowFireworks(true);
      setHasCompletedThisStroke(true);
      onComplete?.();

      // Hide fireworks after animation completes
      setTimeout(() => {
        setShowFireworks(false);
      }, 1500);
    }
    setPrevProgress(progress);
  }, [progress, prevProgress, isDrawing, onComplete, hasCompletedThisStroke, cursorX, cursorY]);

  // Reset fireworks and completion flag when starting a new stroke
  useEffect(() => {
    if (!isDrawing) {
      setShowFireworks(false);
      setHasCompletedThisStroke(false);
    }
  }, [isDrawing]);

  if (!isDrawing && !showFireworks) return null;

  const ringSize = 60; // Ring diameter
  const strokeWidth = 4;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Cap progress at 100% to prevent looping
  const cappedProgress = Math.min(progress, 1);
  const strokeDashoffset = circumference - cappedProgress * circumference;

  // Opacity increases with progress, but disappears when fireworks show or after completion
  const opacity = (showFireworks || hasCompletedThisStroke) ? 0 : Math.min(cappedProgress * 1.5, 1);

  return (
    <>
      {/* Progress Ring - hidden when fireworks show or after completion */}
      {!showFireworks && !hasCompletedThisStroke && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: `${cursorX}px`,
            top: `${cursorY}px`,
            transform: "translate(-50%, -50%)",
            opacity: opacity,
            transition: "opacity 0.1s ease-out",
          }}
        >
        <svg
          width={ringSize}
          height={ringSize}
          style={{
            transform: "rotate(-90deg)",
          }}
        >
          {/* Background circle */}
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: "stroke-dashoffset 0.1s ease-out",
            }}
          />
        </svg>
        </div>
      )}

      {/* Fireworks Animation - uses frozen position */}
      {showFireworks && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: `${fireworksX}px`,
            top: `${fireworksY}px`,
            transform: "translate(-50%, -50%)",
            width: "240px",
            height: "240px",
          }}
        >
          <Lottie
            animationData={fireworksAnimation}
            loop={false}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      )}
    </>
  );
}
