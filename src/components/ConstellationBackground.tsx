import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";

/**
 * Constellation background: drifting dots joined by faint lines when close.
 * Colors are read from your CSS variables (--foreground, --accent), so it
 * follows your palette automatically.
 *
 * Usage: render once near the root (e.g. in App.tsx / your Layout):
 *   <ConstellationBackground />
 * and make sure your page content sits above it (see notes).
 */

type Node = { x: number; y: number; vx: number; vy: number; r: number; accent: boolean };

// Tweak these to taste
const DENSITY = 1 / 11000;   // nodes per px² (lower = sparser)
const MAX_NODES = 140;
const LINK_DISTANCE = 130;   // px, max distance for a line
const SPEED = 0.18;          // drift speed
const ACCENT_RATIO = 0.16;   // share of nodes drawn in your accent blue
const LINE_ALPHA = 0.14;     // line strength at closest distance
const DOT_ALPHA = 0.5;
const MOUSE_RADIUS = 140;    // px; nodes gently link to the cursor

function readVar(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

// Accepts #rgb, #rrggbb, or rgb()/rgba() and returns "r, g, b"
function toRgb(color: string): string {
  const c = color.trim();
  if (c.startsWith("#")) {
    const h = c.length === 4 ? c.slice(1).split("").map((x) => x + x).join("") : c.slice(1, 7);
    const n = parseInt(h, 16);
    return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
  }
  const m = c.match(/\d+(\.\d+)?/g);
  return m ? m.slice(0, 3).join(", ") : "23, 23, 23";
}

function ConstellationBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ink = toRgb(readVar("--foreground", "#171717"));
    const accent = toRgb(readVar("--accent", "#315CFF"));

    let w = 0;
    let h = 0;
    let nodes: Node[] = [];
    let raf = 0;
    const mouse = { x: -9999, y: -9999 };

    const seed = () => {
      const count = Math.min(MAX_NODES, Math.round(w * h * DENSITY));
      nodes = Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = SPEED * (0.4 + Math.random() * 0.8);
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 1 + Math.random() * 1.6,
          accent: Math.random() < ACCENT_RATIO,
        };
      });
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Lines
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK_DISTANCE) {
            const t = 1 - d / LINK_DISTANCE;
            const rgb = a.accent || b.accent ? accent : ink;
            ctx.strokeStyle = `rgba(${rgb}, ${t * LINE_ALPHA})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        // Cursor links
        const mdx = a.x - mouse.x;
        const mdy = a.y - mouse.y;
        const md = Math.hypot(mdx, mdy);
        if (md < MOUSE_RADIUS) {
          const t = 1 - md / MOUSE_RADIUS;
          ctx.strokeStyle = `rgba(${accent}, ${t * 0.35})`;
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      // Dots
      for (const n of nodes) {
        ctx.fillStyle = `rgba(${n.accent ? accent : ink}, ${n.accent ? 0.75 : DOT_ALPHA})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = () => {
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = w + 20;
        else if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        else if (n.y > h + 20) n.y = -20;
      }
      draw();
      raf = requestAnimationFrame(step);
    };

    const start = () => {
      if (!reduceMotion && !raf) raf = requestAnimationFrame(step);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    resize();
    start();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseout", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

export default ConstellationBackground;
