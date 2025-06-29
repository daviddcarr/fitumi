import { useRef, useEffect } from "react";
import { pointLerp } from "@lib/math";

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  lineWidth: number;
  progress: number;
  speed: number;
}

export default function CanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const animationFrameRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);

  const strokeCountRef = useRef<number>(0);
  const isResettingRef = useRef<boolean>(false);
  const fadeProgressRef = useRef<number>(0);

  const MAX_ACTIVE_STROKES = 50;
  const STROKES_PER_CYCLE = 10;
  const RESET_FADE_FRAME = 60;

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    canvas.getContext("2d")?.scale(dpr, dpr);
  };

  const createCurve = (): Stroke => {
    const canvas = canvasRef.current!;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;

    const N = 60; // Number of points in stroke

    const randNodes: Point[] = [
      { x: Math.random() * W, y: Math.random() * H },
      { x: Math.random() * W, y: Math.random() * H },
      { x: Math.random() * W, y: Math.random() * H },
      { x: Math.random() * W, y: Math.random() * H },
    ];

    const points: Point[] = [];

    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);

      const p0 = pointLerp(randNodes[0], randNodes[1], t);
      const p1 = pointLerp(randNodes[1], randNodes[2], t);
      const p2 = pointLerp(randNodes[2], randNodes[3], t);

      const p01 = pointLerp(p0, p1, t);
      const p12 = pointLerp(p1, p2, t);

      const p012 = pointLerp(p01, p12, t);

      points.push(p012);
    }

    const hue = Math.floor(Math.random() * 360);
    const color = `hsla(${hue}, 70%, 65%, 0.4)`;

    const lineWidth = 1 + Math.random() * 2;

    const speed = 0.002 + Math.random() * 0.02;

    return {
      points,
      color,
      lineWidth,
      progress: 0,
      speed,
    };
  };

  const drawPartialStroke = (
    ctx: CanvasRenderingContext2D,
    s: Stroke,
    t: number
  ) => {
    const points = s.points;
    const total = points.length;

    const clampedT = Math.min(Math.max(t, 0), 1);

    const endIdx = Math.floor(clampedT * (total - 1));
    if (endIdx < 1) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i <= endIdx; i++) {
      const p = points[i];
      ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.clientWidth;
    const H = canvas.clientHeight;

    if (isResettingRef.current) {
      fadeProgressRef.current += 1 / RESET_FADE_FRAME;
      const alpha = Math.min(fadeProgressRef.current, 1);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fillRect(0, 0, W, H);

      if (fadeProgressRef.current >= 1) {
        ctx.clearRect(0, 0, W, H);
        strokesRef.current = [];
        strokeCountRef.current = 0;
        isResettingRef.current = false;
        fadeProgressRef.current = 0;
      }
    } else {
      // Add a slight blur every frame to soften the strokes over time
      ctx.save();
      ctx.filter = "blur(0.5px)";
      ctx.drawImage(canvas, 0, 0, W, H);
      ctx.restore();

      // Add translucent white rectangle over entire canvas to slowly fade old strokes
      ctx.fillStyle = "rgba(255, 255, 255, 0.01)";
      ctx.fillRect(0, 0, W, H);
    }

    const strokes = strokesRef.current;
    for (let i = strokes.length - 1; i >= 0; i--) {
      const s = strokes[i];
      s.progress += s.speed;

      if (s.progress >= 4) {
        drawPartialStroke(ctx, s, 1);
        strokes.splice(i, 1);
      }

      drawPartialStroke(ctx, s, s.progress);
    }

    if (!isResettingRef.current) {
      spawnTimerRef.current -= 1;

      if (spawnTimerRef.current <= 0) {
        if (strokes.length < MAX_ACTIVE_STROKES) {
          strokes.push(createCurve());
          strokeCountRef.current += 1;
          if (strokeCountRef.current >= STROKES_PER_CYCLE) {
            isResettingRef.current = true;
          }
        }
        spawnTimerRef.current = 90 + Math.random() * 90;
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    spawnTimerRef.current = 90 + Math.random() * 90;
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="h-screen"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100dvh",
        zIndex: -1,
        backgroundColor: "#FFFFFF",
      }}
    />
  );
}
