/**
 * ThreeUI Sketchbook Component — Physics & 3D Paper Architecture
 * Vendored from @designcodeio/threeui (MIT License)
 * Rebuilt with multi-layered 3D perspective, direct object dragging with inertia,
 * pointer-driven tilt & parallax, active live-magnifying glass, and warm desk environment.
 */

const t = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Interactive Sketchbook</title>
<style>
@font-face {
  font-family: 'Patrick Hand';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(sketchbook/PatrickHand.ttf) format('truetype');
}

:root {
  --desk: #F3EFE6;
  --paper: #FAF7F0;
  --ink: #171717;
  --ink-soft: rgba(23, 23, 23, 0.76);
  --ink-faint: rgba(23, 23, 23, 0.55);
  --hairline: rgba(23, 23, 23, 0.15);
  --earth: #315CFF;
  --mustard: #E3B859;
  --sage: #C7DCB1;
  --display: 'Patrick Hand', cursive, sans-serif;
  --font: 'Patrick Hand', cursive, sans-serif;
  --track-caps: 0.12em;
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
html { -webkit-text-size-adjust: 100%; }
body {
  font-family: var(--font);
  font-weight: 400;
  background: var(--desk);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
a { color: inherit; text-decoration: none; }
button { font: inherit; }

/* ---------------- Environmental Desk Surface ---------------- */
.desk-wash {
  position: fixed;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  background:
    radial-gradient(ellipse at 50% 42%, #FAF7F0 0%, #F2EDE2 45%, #E5DDD0 100%);
}
/* Subtle botanical watercolor elements in background corners */
.botany {
  position: absolute;
  pointer-events: none;
  z-index: 0;
  opacity: 0.18;
  transition: opacity 0.3s ease;
}
.botany.left {
  left: -20px;
  bottom: 0px;
  width: clamp(140px, 22vw, 320px);
  transform: rotate(-8deg);
}
.botany.right {
  right: -20px;
  top: 10px;
  width: clamp(130px, 20vw, 300px);
  transform: rotate(12deg);
}

/* ---------------- Stage & Drag Container ---------------- */
.sb-stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  touch-action: pan-y;
  cursor: grab;
}
.sb-stage.dragging {
  cursor: grabbing;
}

.sb-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  z-index: 2;
}

/* Outer navigation arrows */
.sb-arrow {
  position: absolute;
  top: 48%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 10px;
  border: 0;
  background: rgba(250, 247, 240, 0.65);
  border: 1.5px solid rgba(23, 23, 23, 0.18);
  border-radius: 999px;
  color: var(--ink);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(23, 23, 23, 0.08);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: transform 0.18s ease, background-color 0.18s ease, border-color 0.18s ease;
  z-index: 40;
}
.sb-arrow:hover {
  transform: translateY(-50%) scale(1.12);
  background: #FAF7F0;
  border-color: rgba(23, 23, 23, 0.45);
}
.sb-arrow.left { left: clamp(10px, 3vw, 36px); }
.sb-arrow.right { right: clamp(10px, 3vw, 36px); }

/* ---------------- 3D Perspective Box & Book ---------------- */
.sb-3d {
  position: relative;
  width: 100%;
  max-width: min(900px, 88vw, calc((100vh - 120px) * 1.419));
  perspective: 1600px;
  perspective-origin: 50% 50%;
  touch-action: pan-y;
  will-change: transform;
}

/* Physics-driven object tilt & inertia */
.sb-tilt {
  position: relative;
  transform-style: preserve-3d;
  transform:
    translate3d(var(--bx, 0px), var(--by, 0px), 0px)
    rotateZ(var(--bz, 0deg))
    rotateX(var(--rx, 0deg))
    rotateY(var(--ry, 0deg))
    scale(var(--zoom, 1));
  will-change: transform;
  touch-action: pan-y;
}

.sb-book {
  position: relative;
  width: 100%;
  aspect-ratio: 1760/1240;
  transform-style: preserve-3d;
  z-index: 1;
  touch-action: pan-y;
}

/* Dynamic Multi-Level Environmental Shadows */
.sb-cast {
  position: absolute;
  pointer-events: none;
  z-index: 0;
  border-radius: 40px;
  will-change: transform, opacity;
}
/* Deep ambient soft pool */
.sb-cast.ambient {
  left: 3%; right: 3%; top: 22%; bottom: -4%;
  background: radial-gradient(50% 50% at 50% 55%,
    rgba(25, 20, 15, 0.38) 0%, rgba(35, 28, 20, 0.18) 45%, rgba(0, 0, 0, 0) 75%);
  filter: blur(34px);
  transform: translate3d(var(--shx, 0px), var(--shy, 0px), 0);
  opacity: calc(1 - var(--shade, 0) * 0.35);
}
/* Crisp contact shadow right under the base */
.sb-cast.contact {
  left: 6%; right: 6%; top: 58%; bottom: 6%;
  background: radial-gradient(50% 45% at 50% 42%,
    rgba(18, 14, 10, 0.45) 0%, rgba(25, 20, 15, 0.20) 50%, rgba(0, 0, 0, 0) 80%);
  filter: blur(12px);
  transform: translate3d(calc(var(--shx, 0px) * 0.6), calc(var(--shy, 0px) * 0.6), 0);
  opacity: calc(1 - var(--shade, 0) * 0.45);
}
/* Hair contact shadow along center spine */
.sb-cast.spine {
  left: 45%; right: 45%; top: 30%; bottom: 12%;
  background: radial-gradient(50% 50% at 50% 50%,
    rgba(15, 10, 5, 0.42) 0%, rgba(0, 0, 0, 0) 75%);
  filter: blur(8px);
}

.sb-full { position: absolute; inset: 0; }
.sb-full img { width: 100%; height: auto; display: block; }
.sb-half { position: absolute; top: 0; bottom: 0; width: 50%; overflow-x: clip; overflow-y: visible; }
.sb-half.left { left: 0; }
.sb-half.right { left: 50%; }
.sb-half-img { width: 200%; max-width: none; height: auto; display: block; }
.sb-half-img.right { margin-left: -100%; }

/* Gutter shadow */
.gutter-shade {
  position: absolute;
  top: var(--pg, 21.8%);
  bottom: var(--pg, 21.8%);
  width: 46%;
  pointer-events: none;
  opacity: calc(var(--shade, 0) * 0.65);
  -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 5.2%, #000 94.8%, transparent 100%);
  mask-image: linear-gradient(180deg, transparent 0, #000 5.2%, #000 94.8%, transparent 100%);
}
.gutter-shade.left { right: 0; background: linear-gradient(270deg, rgba(23, 20, 16, 0.28), rgba(23, 20, 16, 0) 82%); }
.gutter-shade.right { left: 0; background: linear-gradient(90deg, rgba(23, 20, 16, 0.22), rgba(23, 20, 16, 0) 82%); }

/* ---- The 18 Nested Strips Page Curl Architecture ---- */
.curl {
  position: absolute; top: 0; height: 100%;
  width: calc(var(--bw, 0px) * var(--span));
  transform-style: preserve-3d; z-index: 6;
}
.curl.next { left: 50%; transform-origin: left center; transform: rotateY(calc(-1 * var(--tt, 0deg))); }
.curl.prev { right: 50%; transform-origin: right center; transform: rotateY(var(--tt, 0deg)); }
.strip {
  position: absolute; top: 0; height: 100%;
  width: calc(var(--bw, 0px) * var(--span) / var(--n));
  transform-style: preserve-3d;
}
.curl.next .strip { transform-origin: left center; }
.curl.prev .strip { transform-origin: right center; }
.curl.next > .strip { left: 0; }
.curl.prev > .strip { right: 0; left: auto; }
.curl.next .strip .strip { left: 100%; transform: rotateY(var(--td, 0deg)); }
.curl.prev .strip .strip { right: 100%; transform: rotateY(calc(-1 * var(--td, 0deg))); }

.face {
  position: absolute; top: 0; bottom: 0; left: 0; right: -1.2px;
  backface-visibility: hidden; -webkit-backface-visibility: hidden;
  background-repeat: no-repeat; background-size: var(--bw, 0px) auto;
}
.face.back { transform: rotateY(180deg); }
.face .sh, .face .gl {
  -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 5.2%, #000 94.8%, transparent 100%);
  mask-image: linear-gradient(180deg, transparent 0, #000 5.2%, #000 94.8%, transparent 100%);
}
.strip.edge .face .sh, .strip.edge .face .gl {
  -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 9%, #000 91%, transparent 100%), var(--hf);
  mask-image: linear-gradient(180deg, transparent 0, #000 9%, #000 91%, transparent 100%), var(--hf);
  -webkit-mask-composite: source-in; mask-composite: intersect;
}
.curl.next .strip.edge .face.front, .curl.prev .strip.edge .face.back {
  --hf: linear-gradient(90deg, #000 0 22%, transparent 96%);
}
.curl.next .strip.edge .face.back, .curl.prev .strip.edge .face.front {
  --hf: linear-gradient(270deg, #000 0 22%, transparent 96%);
}
.face .sh { position: absolute; left: 0; right: 0; top: var(--pg, 21.8%); bottom: var(--pg, 21.8%); pointer-events: none; }
.curl.next .face.front .sh, .curl.prev .face.back .sh {
  background: linear-gradient(90deg, rgba(23, 20, 16, var(--a1, 0)), rgba(23, 20, 16, var(--a2, 0)));
}
.curl.next .face.back .sh, .curl.prev .face.front .sh {
  background: linear-gradient(90deg, rgba(23, 20, 16, var(--a2, 0)), rgba(23, 20, 16, var(--a1, 0)));
}
.face .gl {
  position: absolute; left: 0; right: 0; top: var(--pg, 21.8%); bottom: var(--pg, 21.8%);
  pointer-events: none;
  background: linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.12) 35%, rgba(255,255,255,0) 100%);
  opacity: calc(var(--shade, 0) * var(--lit, 1) * var(--lit, 1) * 0.25);
}

/* ---- Active Live Magnifier Lens ---- */
.loupe {
  position: absolute; left: 0; top: 0;
  width: var(--lr, 260px); height: var(--lr, 260px);
  pointer-events: none; z-index: 80; opacity: 0;
  transition: opacity 0.25s ease;
  will-change: transform;
}
.loupe.on { opacity: 1; }
.loupe.held .ring { cursor: grabbing; }

.loupe .ring {
  position: absolute; inset: 0; border-radius: 50%;
  pointer-events: auto; cursor: grab;
  padding: calc(var(--lr, 260px) * 0.058);
  box-shadow:
    0 1px 3px rgba(23, 18, 12, 0.35),
    0 10px 22px rgba(23, 18, 12, 0.28),
    0 26px 42px rgba(23, 18, 12, 0.22),
    0 48px 68px rgba(23, 18, 12, 0.15);
}
/* Beveled metallic ring */
.loupe .ring:before {
  content: ""; position: absolute; inset: 0; border-radius: 50%; pointer-events: none;
  background: linear-gradient(146deg,
    #FFF8E8 0%, #E3B859 18%, #2A2620 38%, #171717 50%,
    #2A2620 62%, #E3B859 82%, #171717 100%);
  box-shadow:
    inset 0 1.5px 2px rgba(255, 255, 255, 0.85),
    inset 0 -2.5px 4px rgba(23, 18, 12, 0.65);
  -webkit-mask-image: radial-gradient(circle closest-side at 50% 50%, transparent 0 88.2%, #000 89.8% 100%);
  mask-image: radial-gradient(circle closest-side at 50% 50%, transparent 0 88.2%, #000 89.8% 100%);
}
.loupe .grip {
  position: absolute; left: 50%; top: 50%;
  width: calc(var(--lr, 260px) * 0.74); height: calc(var(--lr, 260px) * 0.125);
  transform-origin: 0 50%;
  transform: rotate(40deg) translate(calc(var(--lr, 260px) * 0.33), -50%);
  border-radius: calc(var(--lr, 260px) * 0.06);
  pointer-events: auto; cursor: grab;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.48) 0 14%, rgba(255, 255, 255, 0) 45%,
                    rgba(0, 0, 0, 0.30) 100%),
    linear-gradient(90deg, #E3B859 0 14%, #2A2620 14% 20%, #171717 20% 62%,
                    #2A2620 62% 92%, #171717 92% 100%);
  box-shadow: 0 8px 16px rgba(23, 18, 12, 0.28), 0 18px 28px rgba(23, 18, 12, 0.16);
}
.lens {
  position: relative; display: block; width: 100%; height: 100%; border-radius: 50%;
  background-repeat: no-repeat; overflow: hidden;
  box-shadow:
    inset 0 0 0 1.5px rgba(23, 18, 12, 0.6),
    inset 0 4px 14px rgba(23, 18, 12, 0.32),
    inset 0 -8px 18px rgba(250, 247, 240, 0.16);
}
.lens .mag { display: none; }

/* The live duplicated magnified view */
.zoomwrap {
  position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 50;
  opacity: 0;
  will-change: transform, -webkit-mask-image;
}
.zoominner { position: absolute; inset: 0; transform-origin: 0 0; }
.lens:before, .lens:after { content: ""; position: absolute; inset: 0; border-radius: 50%; pointer-events: none; }
.lens:before { z-index: 1; }
.lens:after { z-index: 2; }
/* Glass rim chromatic reflection */
.lens:before {
  background: radial-gradient(circle at 50% 50%,
    rgba(0, 0, 0, 0) 54%, rgba(23, 18, 12, 0.12) 76%, rgba(23, 18, 12, 0.36) 100%);
  box-shadow:
    inset 0 0 0 2px rgba(49, 92, 255, 0.28),
    inset 0 0 0 4px rgba(227, 184, 89, 0.22);
}
/* Glass dome specular highlights */
.lens:after {
  background:
    radial-gradient(36% 26% at 28% 18%, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0) 76%),
    radial-gradient(24% 16% at 74% 86%, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0) 80%),
    linear-gradient(150deg, rgba(255, 255, 255, 0.08) 0 18%, rgba(255, 255, 255, 0) 42%);
}

/* ---- Controls Bar & Typography ---- */
.sb-tools {
  display: flex; align-items: center; gap: 6px;
  border: 1.5px solid rgba(23, 23, 23, 0.25);
  border-radius: 999px;
  padding: 4px 8px; background: rgba(250, 247, 240, 0.78);
  box-shadow: 0 4px 14px rgba(23, 23, 23, 0.06);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.tool {
  width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center;
  border: 0; border-radius: 999px; background: transparent; color: var(--ink);
  cursor: pointer; transition: background-color 0.18s ease, color 0.18s ease;
}
.tool:hover { background: rgba(23, 23, 23, 0.08); color: var(--ink); }
.tool[aria-pressed="true"] { background: var(--mustard); color: #171717; }
.tool:disabled { opacity: 0.32; cursor: default; background: transparent; }
.tool svg { width: 15px; height: 15px; display: block; }
.tool-sep { width: 1px; height: 16px; background: var(--hairline); margin: 0 2px; }
.zoom-read {
  font-family: var(--font); font-size: 15px; letter-spacing: 0.03em; color: var(--ink);
  min-width: 42px; text-align: center; font-variant-numeric: tabular-nums; font-weight: bold;
}
@media (pointer: coarse), (max-width: 640px) {
  .loupe, #loupeBtn, .tool-sep, .zoomwrap { display: none !important; }
}

/* Page Turn Interaction Zones */
.sb-zone {
  position: absolute; top: 0; bottom: 0; border: 0; background: transparent; cursor: grab; z-index: 60;
  -webkit-tap-highlight-color: transparent; touch-action: pan-y;
}
.sb-zone:active { cursor: grabbing; }
.sb-prev { left: 0; width: 44%; }
.sb-next { right: 0; width: 44%; }

/* Captions and Hints */
.sb-captions { display: grid; justify-items: center; min-height: 24px; }
.sb-captions > * { grid-area: 1/1; margin: 0; }
.sb-caption {
  font-family: var(--font);
  font-size: 20px;
  letter-spacing: 0.03em;
  color: #171717;
  font-weight: 600;
  animation: sb-cap-in 0.5s ease both;
}
.sb-caption.live { animation: none; }
@keyframes sb-cap-in { 0% { opacity: 0; transform: translateY(4px); } }
@keyframes sb-cap-out { to { opacity: 0; transform: translateY(-4px); } }

.sb-hint {
  margin: 0;
  font-family: var(--font);
  font-size: 14.5px;
  letter-spacing: 0.03em;
  color: rgba(23, 23, 23, 0.78);
  font-weight: 500;
  transition: opacity 0.4s ease;
}
.sb-hint.gone { opacity: 0; }
.hint-m { display: none; }
@media (pointer: coarse), (max-width: 640px) {
  .hint-d { display: none; }
  .hint-m { display: inline; }
}

.sb-wrap.intro .sb-full img, .sb-wrap.intro .sb-half-img { filter: url(#sb-mblur-1); }
.sb-wrap.intro.b2 .sb-full img, .sb-wrap.intro.b2 .sb-half-img { filter: url(#sb-mblur-2); }
.sb-wrap.intro .sb-caption { animation: none; }
.sb-wrap.intro .sb-caption.cap-out { display: none; }

@media (max-width: 640px) {
  .sb-wrap { gap: 8px; }
  .sb-arrow { padding: 10px 8px; }
  .sb-arrow.left { left: 4px; }
  .sb-arrow.right { right: 4px; }
  .sb-caption { font-size: 17px; }
  .sb-hint { font-size: 13px; text-align: center; }
}
</style>
</head>
<body>
<div class="desk-wash" aria-hidden="true"></div>

<!-- Ambient botanical watercolor accents in corners -->
<svg class="botany left" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M20 180C40 130 90 90 150 40M150 40C120 70 80 120 70 170M150 40C165 65 170 100 150 130M95 105C80 85 50 80 30 95C45 110 75 115 95 105ZM125 70C115 50 95 40 75 50C85 68 110 75 125 70Z" stroke="#4F6642" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
<svg class="botany right" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M180 20C140 60 110 110 60 170M60 170C85 135 125 95 170 80M60 170C45 145 40 110 60 80M115 105C130 85 160 80 180 95C165 110 135 115 115 105ZM85 140C95 120 115 110 135 120C125 138 100 145 85 140Z" stroke="#4F6642" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

<main class="sb-stage" id="sbStage">
  <button class="sb-arrow left" id="sbLeft" aria-label="previous page">
    <svg viewBox="0 0 14 44" width="14" height="44" fill="none" aria-hidden="true"><polyline points="11,3 3,22 11,41" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </button>
  <button class="sb-arrow right" id="sbRight" aria-label="next page">
    <svg viewBox="0 0 14 44" width="14" height="44" fill="none" aria-hidden="true"><polyline points="3,3 11,22 3,41" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </button>

  <div class="sb-wrap" id="sbWrap">
    <svg width="0" height="0" style="position:absolute" aria-hidden="true">
      <filter id="sb-mblur-1"><feGaussianBlur stdDeviation="5 0"/></filter>
      <filter id="sb-mblur-2"><feGaussianBlur stdDeviation="14 0"/></filter>
    </svg>

    <div class="sb-3d" id="sb3d">
      <div class="sb-tilt" id="sbTilt">
        <div class="sb-cast ambient" id="sbCastAmbient" aria-hidden="true"></div>
        <div class="sb-cast contact" id="sbCastContact" aria-hidden="true"></div>
        <div class="sb-cast spine" aria-hidden="true"></div>
        <div class="sb-book" id="sbBook"></div>
      </div>
      <div class="zoomwrap" id="zoomWrap" aria-hidden="true"><div class="zoominner" id="zoomInner"></div></div>
      <div class="loupe" id="loupe"><span class="grip"></span><span class="ring"><span class="lens" id="loupeLens"><span class="mag" id="loupeMag"></span></span></span></div>
    </div>

    <div class="sb-captions" id="sbCaptions"></div>
    <div class="sb-tools" role="group" aria-label="view controls">
      <button class="tool" id="zOut" aria-label="zoom out"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="8.6" cy="8.6" r="5.6"/><path d="M12.8 12.8 17.4 17.4M6.2 8.6h4.8"/></svg></button>
      <span class="zoom-read" id="zRead">100%</span>
      <button class="tool" id="zIn" aria-label="zoom in"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="8.6" cy="8.6" r="5.6"/><path d="M12.8 12.8 17.4 17.4M6.2 8.6h4.8M8.6 6.2v4.8"/></svg></button>
      <span class="tool-sep" aria-hidden="true"></span>
      <button class="tool" id="loupeBtn" aria-label="magnifier" aria-pressed="true"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="8.8" cy="8.8" r="5.8"/><path d="M13 13l4.4 4.4"/><path d="M6.4 7.2a3.2 3.2 0 0 1 2.4-1.4" opacity=".55"/></svg></button>
    </div>
    <p class="sb-hint" id="sbHint"><span class="hint-d">Drag anywhere to move book · Hover to tilt · Drag glass to inspect</span><span class="hint-m">Swipe or tap to turn pages · Pinch to zoom</span></p>
  </div>
</main>

<script>
const Q=new URLSearchParams(location.search);
const DIR='sketchbook/';
const PAGES=[
  {file:'spread-01.webp', title:'radhe radhe', place:'March 2026'},
  {file:'spread-02.webp', title:'and when the heart loves something', place:'January 2026'},
  {file:'spread-03.webp', title:'world "building"', place:'February 2026'},
  {file:'spread-04.webp', title:'hands-on learning', place:'March 2026'},
  {file:'spread-05.webp', title:'Finished watching A.O.T', place:'March 2026'},
  {file:'spread-06.webp', title:'random scribbles', place:'March 2026'}
];
PAGES.forEach(p=>p.url=DIR+p.file);
const M=PAGES.length, LAND=0;

const wrap=document.getElementById('sbWrap');
const stage=document.getElementById('sbStage');
const sb3d=document.getElementById('sb3d');
const sbTilt=document.getElementById('sbTilt');
const book=document.getElementById('sbBook');
const capBox=document.getElementById('sbCaptions');
const hint=document.getElementById('sbHint');
const castAmbient=document.getElementById('sbCastAmbient');
const castContact=document.getElementById('sbCastContact');
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------ the turning leaf */
const N=18;
const SPAN=0.449;
const BETA=0.60;
let idx=0, turn=null;
let strips=[];

function el(t,c){const e=document.createElement(t);if(c)e.className=c;return e}
function imgEl(i,side){
  const im=new Image();im.className='sb-half-img '+side;
  im.draggable=false;im.alt='';im.src=PAGES[i].url;return im;
}

function halfEl(pos,i){
  const d=el('div','sb-half '+pos);
  d.appendChild(imgEl(i,pos));
  d.appendChild(el('div','gutter-shade '+pos));
  return d;
}

function buildCurl(dir,from,to){
  strips=[];
  const c=el('div','curl '+dir);
  c.style.setProperty('--n',N);
  c.style.setProperty('--span',SPAN);
  let host=c;
  for(let i=0;i<N;i++){
    const s=el('div','strip');
    s.style.setProperty('--i',i);
    const gut='calc(var(--bw) * 0.5)';
    const sw='calc(var(--bw) * '+SPAN+' / '+N+')';
    const A='calc(-1 * ('+gut+' + '+i+' * '+sw+'))';
    const B='calc('+(i+1)+' * '+sw+' - '+gut+')';
    const f=el('div','face front'), b=el('div','face back');
    const dress=(e,url,px)=>{
      e.style.backgroundImage='url('+url+')';
      e.style.backgroundPositionX=px;
    };
    dress(f,PAGES[from].url, dir==='next'?A:B);
    dress(b,PAGES[to].url,   dir==='next'?B:A);
    f.appendChild(el('div','sh'));f.appendChild(el('div','gl'));
    b.appendChild(el('div','sh'));b.appendChild(el('div','gl'));
    s.appendChild(f);s.appendChild(b);
    if(i===N-1)s.classList.add('edge');
    host.appendChild(s);host=s;
    strips.push(s);
  }
  return c;
}

function applyTurn(t){
  const th=Math.PI*t;
  const beta=BETA*Math.sin(Math.PI*t);
  const D=180/Math.PI;
  const tt=th+beta, td=2*beta/N;
  sbTilt.style.setProperty('--tt',(tt*D).toFixed(2)+'deg');
  sbTilt.style.setProperty('--td',(td*D).toFixed(3)+'deg');
  sbTilt.style.setProperty('--shade',Math.sin(Math.PI*t).toFixed(3));
  fadeCaption(t);
  for(let i=0;i<strips.length;i++){
    const l1=Math.abs(Math.cos(tt-i*td));
    const l2=Math.abs(Math.cos(tt-(i+1)*td));
    const st=strips[i].style;
    st.setProperty('--lit',l1.toFixed(3));
    st.setProperty('--a1',((1-l1)*0.62).toFixed(3));
    st.setProperty('--a2',((1-l2)*0.62).toFixed(3));
  }
}

function paint(){
  book.textContent='';
  if(!turn){
    const f=el('div','sb-full');
    const im=new Image();im.src=PAGES[idx].url;im.alt=PAGES[idx].title;
    im.draggable=false;
    f.appendChild(im);book.appendChild(f);
    sbTilt.style.setProperty('--shade','0');
  }else{
    const next=turn.dir==='next';
    book.appendChild(halfEl('left', next?turn.from:turn.to));
    book.appendChild(halfEl('right',next?turn.to:turn.from));
    book.appendChild(buildCurl(turn.dir,turn.from,turn.to));
    applyTurn(turn.t);
  }
  const a=el('button','sb-zone sb-prev'),b=el('button','sb-zone sb-next');
  a.setAttribute('aria-label','previous page');b.setAttribute('aria-label','next page');
  book.appendChild(a);book.appendChild(b);
  layout();
  caption();
  if(typeof syncZoomLayer==='function')syncZoomLayer();
  if(typeof placeLoupe==='function')placeLoupe();
}

function caption(){
  capBox.textContent='';
  capOut=capIn=null;
  if(turn){
    capOut=el('p','sb-caption live');capOut.textContent=PAGES[turn.from].title;capBox.appendChild(capOut);
    capIn=el('p','sb-caption live');capIn.textContent=PAGES[turn.to].title;capBox.appendChild(capIn);
    fadeCaption(turn.t);
  }else{
    const p=el('p','sb-caption');p.textContent=PAGES[idx].title;capBox.appendChild(p);
  }
}
let capOut=null,capIn=null;
function fadeCaption(t){
  if(!capOut||!capIn)return;
  const out=1-Math.max(0,Math.min(1,(t-0.10)/0.28));
  const inn=Math.max(0,Math.min(1,(t-0.56)/0.30));
  capOut.style.opacity=out.toFixed(3);
  capIn.style.opacity=inn.toFixed(3);
}
function layout(){
  sb3d.style.setProperty('--bw',book.clientWidth+'px');
}
addEventListener('resize',layout);

/* ------------------------------------------------------ spring physics */
let spring=null;
function animateTo(target,onDone,stiff,damp){
  spring={kind:'spring',v:0,target:target,done:onDone,k:stiff||150,c:damp||22};
  kick();
}
function tweenTo(target,dur,onDone){
  spring={kind:'tween',from:turn?turn.t:0,target:target,dur:dur,e:0,done:onDone};
  kick();
}

/* ------------------------------------------- Direct Book Dragging System */
const bookPos={x:0, y:0, vx:0, vy:0, rotZ:0};
let bookDrag=null;
let bookSpringActive=false;

function updateBookTransform(){
  sbTilt.style.setProperty('--bx',bookPos.x.toFixed(2)+'px');
  sbTilt.style.setProperty('--by',bookPos.y.toFixed(2)+'px');
  sbTilt.style.setProperty('--bz',bookPos.rotZ.toFixed(2)+'deg');
  // Shadow moves inversely to reinforce elevation
  castAmbient.style.setProperty('--shx',(-bookPos.x*0.4).toFixed(1)+'px');
  castAmbient.style.setProperty('--shy',(-bookPos.y*0.3).toFixed(1)+'px');
  castContact.style.setProperty('--shx',(-bookPos.x*0.25).toFixed(1)+'px');
  castContact.style.setProperty('--shy',(-bookPos.y*0.2).toFixed(1)+'px');
}

function updateBookPhysics(dt){
  if(!bookSpringActive)return false;
  const k=140, c=20;
  const ax=-k*bookPos.x - c*bookPos.vx;
  const ay=-k*bookPos.y - c*bookPos.vy;
  bookPos.vx+=ax*dt;
  bookPos.vy+=ay*dt;
  bookPos.x+=bookPos.vx*dt;
  bookPos.y+=bookPos.vy*dt;
  bookPos.rotZ*=Math.pow(0.04,dt);

  updateBookTransform();

  if(Math.abs(bookPos.x)<0.3 && Math.abs(bookPos.y)<0.3 &&
     Math.abs(bookPos.vx)<1 && Math.abs(bookPos.vy)<1 && Math.abs(bookPos.rotZ)<0.1){
    bookPos.x=0; bookPos.y=0; bookPos.vx=0; bookPos.vy=0; bookPos.rotZ=0;
    bookSpringActive=false;
    updateBookTransform();
    return false;
  }
  return true;
}

let raf=null,last=0;
function tick(now){
  raf=null;
  const dt=Math.min(0.032,(now-last)/1000||0.016);last=now;
  if(spring&&turn){
    const s=spring;
    if(s.kind==='tween'){
      s.e+=dt;
      const k=Math.min(1,s.e/s.dur);
      turn.t=s.from+(s.target-s.from)*k;
      applyTurn(turn.t);
      if(k>=1){spring=null;const d=s.done;d&&d();}
    }else{
      const x=turn.t-s.target;
      s.v+= (-s.k*x - s.c*s.v)*dt;
      turn.t+=s.v*dt;
      if(Math.abs(turn.t-s.target)<0.002&&Math.abs(s.v)<0.02){
        turn.t=s.target;spring=null;
        applyTurn(turn.t);
        const d=s.done;d&&d();
      }else applyTurn(turn.t);
    }
  }
  viewSpring();
  const lmoved=loupeEase();
  const bmoved=updateBookPhysics(dt);
  if((spring||viewActive||lmoved||bmoved)&&raf===null) raf=requestAnimationFrame(tick);
}
function kick(){ if(raf===null){last=performance.now();raf=requestAnimationFrame(tick);} }

/* ------------------------------------------- Tilt + Zoom ---------------- */
const TILT_X=8, TILT_Y=12;
const ZOOM_MIN=0.85, ZOOM_MAX=1.6;
const view={rx:0,ry:0,z:1, trx:0,try_:0,tz:1};
let viewActive=false;
let lastZ=1;

function applyView(){
  sbTilt.style.setProperty('--rx',view.rx.toFixed(2)+'deg');
  sbTilt.style.setProperty('--ry',view.ry.toFixed(2)+'deg');
  sbTilt.style.setProperty('--zoom',view.z.toFixed(3));
  if(view.z!==lastZ){lastZ=view.z;if(typeof placeLoupe==='function')placeLoupe();}
}

function viewSpring(){
  const e=0.15;
  let moved=false;
  for(const [k,t] of [['rx','trx'],['ry','try_'],['z','tz']]){
    const d=view[t]-view[k];
    if(Math.abs(d)>0.0006){view[k]+=d*e;moved=true;}
    else view[k]=view[t];
  }
  if(moved)applyView();
  viewActive=moved;
  return moved;
}

function setView(rx,ry,z){
  view.trx=Math.max(-TILT_X,Math.min(TILT_X,rx));
  view.try_=Math.max(-TILT_Y,Math.min(TILT_Y,ry));
  view.tz=Math.max(ZOOM_MIN,Math.min(ZOOM_MAX,z));
  viewActive=true;kick();
  if(typeof syncZoom==='function')syncZoom();
}

function tiltTo(cx,cy){
  if(drag||bookDrag)return;
  const r=book.getBoundingClientRect();
  if(!r.width)return;
  const nx=Math.max(-1,Math.min(1,(cx-(r.left+r.width/2))/(r.width*0.52)));
  const ny=Math.max(-1,Math.min(1,(cy-(r.top+r.height/2))/(r.height*0.75)));
  setView(-ny*TILT_X, nx*TILT_Y, view.tz);
}

addEventListener('pointermove',e=>{
  if(e.pointerType==='touch')return;
  tiltTo(e.clientX,e.clientY);
},{passive:true});
addEventListener('pointerout',e=>{if(!e.relatedTarget)setView(0,0,view.tz)});
addEventListener('blur',()=>setView(0,0,view.tz));
stage.addEventListener('dblclick',()=>setView(0,0,1));

// Mouse wheel zoom
stage.addEventListener('wheel',e=>{
  if(Math.abs(e.deltaY)<3)return;
  e.preventDefault();
  const delta=e.deltaY>0 ? 0.94 : 1.06;
  setView(view.trx, view.try_, view.tz*delta);
  hideHint();
},{passive:false});

/* ------------------------------------------------ Pointer Interactions */
let drag=null;
let pendingTouch=null;
function bookRect(){return book.getBoundingClientRect()}
function hideHint(){hint.classList.add('gone')}

stage.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;
  const onLoupe=e.target.closest('.loupe');
  if(onLoupe)return; // loupe has its own grab handler

  const onTool=e.target.closest('.sb-tools, .sb-arrow');
  if(onTool)return;

  const onZone=e.target.closest('.sb-zone');
  hideHint();

  // If on mobile touch:
  if(e.pointerType==='touch'){
    pendingTouch={
      id:e.pointerId,
      x0:e.clientX,
      y0:e.clientY,
      target:onZone,
      decided:false
    };
    return;
  }

  // Mouse / Fine pointer:
  if(onZone && !introOn){
    // Start page turn curl
    e.preventDefault();
    stage.setPointerCapture(e.pointerId);
    const r=bookRect();
    const dir=(e.clientX-r.left)/r.width>0.5?'next':'prev';
    startTurn(dir,0);
    drag={dir:dir,x0:e.clientX,w:r.width,moved:0,vel:0,tPrev:performance.now()};
  } else {
    // Direct Book Dragging on the desk!
    e.preventDefault();
    stage.setPointerCapture(e.pointerId);
    stage.classList.add('dragging');
    bookSpringActive=false;
    bookDrag={
      id:e.pointerId,
      x0:e.clientX,
      y0:e.clientY,
      initX:bookPos.x,
      initY:bookPos.y,
      vx:0,
      vy:0,
      tPrev:performance.now()
    };
  }
});

stage.addEventListener('pointermove',e=>{
  // Mobile touch differentiation: scroll vs turn
  if(pendingTouch&&pendingTouch.id===e.pointerId&&!pendingTouch.decided){
    const dx=e.clientX-pendingTouch.x0;
    const dy=e.clientY-pendingTouch.y0;
    const adx=Math.abs(dx);
    const ady=Math.abs(dy);
    if(ady>adx&&ady>8){
      pendingTouch=null; // Let browser scroll page
      return;
    }
    if(adx>ady&&adx>8){
      pendingTouch.decided=true;
      try{stage.setPointerCapture(e.pointerId);}catch(_){}
      const r=bookRect();
      const dir=dx<0?'next':'prev';
      startTurn(dir,0);
      drag={dir:dir,x0:pendingTouch.x0,w:r.width,moved:adx,vel:0,tPrev:performance.now()};
      pendingTouch=null;
    }
  }

  // Handle Book Dragging
  if(bookDrag&&bookDrag.id===e.pointerId){
    const dx=e.clientX-bookDrag.x0;
    const dy=e.clientY-bookDrag.y0;
    bookPos.x=bookDrag.initX+dx;
    bookPos.y=bookDrag.initY+dy;

    const now=performance.now();
    const dt=Math.max(0.001,(now-bookDrag.tPrev)/1000);
    bookDrag.vx=dx/dt;
    bookDrag.vy=dy/dt;
    bookDrag.tPrev=now;

    bookPos.rotZ=Math.max(-8,Math.min(8,bookDrag.vx*0.012));
    updateBookTransform();
    return;
  }

  // Handle Page Turn Curl
  if(!drag)return;
  const dx=e.clientX-drag.x0;
  drag.moved=Math.max(drag.moved,Math.abs(dx));
  const raw=(drag.dir==='next'? -dx : dx)/(drag.w*0.62);
  const t=Math.max(0,Math.min(1,raw));
  const now=performance.now();
  drag.vel=(t-(turn?turn.t:0))/Math.max(0.001,(now-drag.tPrev)/1000);
  drag.tPrev=now;
  if(turn){turn.t=t;applyTurn(t);}
});

function endDrag(e){
  if(pendingTouch&&pendingTouch.id===e.pointerId){
    const pt=pendingTouch;
    pendingTouch=null;
    if(!introOn&&pt.target){
      const r=bookRect();
      const dir=(pt.x0-r.left)/r.width>0.5?'next':'prev';
      step(dir);
      return;
    }
  }

  if(bookDrag&&bookDrag.id===e.pointerId){
    stage.classList.remove('dragging');
    bookPos.vx=Math.max(-500,Math.min(500,bookDrag.vx*0.12));
    bookPos.vy=Math.max(-500,Math.min(500,bookDrag.vy*0.12));
    bookDrag=null;
    bookSpringActive=true;
    kick();
    return;
  }

  if(!drag)return;
  const d=drag;drag=null;
  if(!turn)return;
  if(d.moved<6){
    commit();return;
  }
  const go = turn.t>0.42 || d.vel>1.1;
  if(go)commit(); else cancel();
}

stage.addEventListener('dragstart',e=>e.preventDefault());
stage.addEventListener('selectstart',e=>e.preventDefault());
stage.addEventListener('pointerup',endDrag);
stage.addEventListener('pointercancel',endDrag);

/* ------------------------------------------------ Turn Control */
function startTurn(dir,t){
  spring=null;
  if(turn){idx=turn.to;turn=null;}
  if(typeof shoveLoupe==='function')shoveLoupe(dir);
  const from=idx;
  turn={dir:dir,from:from,to:dir==='next'?(from+1)%M:(from-1+M)%M,t:t||0};
  paint();
}
function commit(){
  if(!turn)return;
  if(REDUCED){idx=turn.to;turn=null;paint();return;}
  animateTo(1,()=>{idx=turn.to;turn=null;paint();},170,26);
  kick();
}
function cancel(){
  if(!turn)return;
  animateTo(0,()=>{turn=null;paint();},150,24);
  kick();
}
function step(dir){
  if(introOn)endIntro();
  if(turn){ idx=turn.to;turn=null; }
  startTurn(dir,0);commit();
}
function goTo(i){
  if(introOn)endIntro();
  if(i===idx)return;
  if(turn){idx=turn.to;turn=null;}
  const fwd=(i-idx+M)%M, back=(idx-i+M)%M;
  if(Math.min(fwd,back)===1){step(fwd===1?'next':'prev');return;}
  idx=i;paint();
}
document.getElementById('sbLeft').onclick=()=>step('prev');
document.getElementById('sbRight').onclick=()=>step('next');
addEventListener('keydown',e=>{
  if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;
  if(e.metaKey||e.ctrlKey||e.altKey)return;
  const t=e.target;
  if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;
  e.preventDefault();hideHint();
  step(e.key==='ArrowRight'?'next':'prev');
});

/* ------------------------------------------- Active Live Magnifier Lens */
const loupe=document.getElementById('loupe');
const lens=document.getElementById('loupeLens');
const zRead=document.getElementById('zRead');
const loupeBtn=document.getElementById('loupeBtn');
const zInBtn=document.getElementById('zIn'), zOutBtn=document.getElementById('zOut');
const MAG=2.4;
let loupeOn=true, lx=null, ly=null, lgrab=null, lTarget=null;

function loupeSize(){return Math.round(Math.max(170,Math.min(265,book.clientWidth*0.24)));}
function bookBox(){
  return {x:0,y:0,w:book.clientWidth,h:book.clientHeight};
}
// Initially position the loupe DIRECTLY ON the left artwork
function restLoupe(){
  const b=bookBox();
  lx=b.x+b.w*0.35;
  ly=b.y+b.h*0.52;
  placeLoupe();
}
const zoomWrap=document.getElementById('zoomWrap');
const zoomInner=document.getElementById('zoomInner');

function syncZoomLayer(){
  zoomInner.textContent='';
  for(const c of book.children){
    if(c.classList.contains('sb-zone'))continue;
    zoomInner.appendChild(c.cloneNode(true));
  }
}

function placeLoupe(){
  if(lx===null)return;
  const B=bookBox(), bw=B.w, bh=B.h;
  if(!bw)return;
  const R=loupeSize()/2, bez=R*2*0.058;
  loupe.style.setProperty('--lr',R*2+'px');
  loupe.style.transform='translate3d('+(lx-R).toFixed(1)+'px,'+(ly-R).toFixed(1)+'px,0)';
  if(loupeOn)loupe.classList.add('on');

  const z=view.z, cx=bw/2, cy=bh/2;
  const x0=cx+(bw*0.051-cx)*z, x1=cx+(bw*0.949-cx)*z;
  const y0=cy+(bh*0.218-cy)*z, y1=cy+(bh*0.782-cy)*z;
  const nx=Math.max(x0,Math.min(lx,x1));
  const ny=Math.max(y0,Math.min(ly,y1));
  const inside=(lx>x0&&lx<x1&&ly>y0&&ly<y1)
    ? Math.min(lx-x0, x1-lx, ly-y0, y1-ly)
    : -Math.hypot(lx-nx,ly-ny);
  const k=Math.max(0,Math.min(1,(inside+R*0.45)/(R*0.55)));

  zoomWrap.style.opacity=(loupeOn?k:0).toFixed(3);
  if(k<=0.002)return;
  const r=(R-bez).toFixed(1);
  const mask='radial-gradient(circle '+r+'px at '+lx.toFixed(1)+'px '+ly.toFixed(1)+'px,'
    +'#000 calc(100% - 1px),transparent 100%)';
  zoomWrap.style.webkitMaskImage=mask;
  zoomWrap.style.maskImage=mask;
  const px=cx+(lx-cx)/z, py=cy+(ly-cy)/z, s=MAG*z;
  zoomInner.style.transform='translate('+(lx-px*s).toFixed(1)+'px,'+(ly-py*s).toFixed(1)+'px) '
    +'scale('+s.toFixed(4)+')';
}

function shoveLoupe(dir){
  if(!loupeOn||lx===null||lgrab)return;
  const b=bookBox();
  const nx=(b.w/2+(lx-b.x-b.w/2)/view.z)/b.w, ny=(b.h/2+(ly-b.y-b.h/2)/view.z)/b.h;
  if(nx<0.02||nx>0.98||ny<0.17||ny>0.83)return;
  lTarget={x:b.x+b.w*(dir==='next'?0.22:0.78), y:b.y+b.h*0.55};
  kick();
}

function loupeEase(){
  if(!lTarget)return false;
  if(lgrab){lTarget=null;return false;}
  const dx=lTarget.x-lx, dy=lTarget.y-ly;
  if(Math.abs(dx)<0.5&&Math.abs(dy)<0.5){lx=lTarget.x;ly=lTarget.y;lTarget=null;placeLoupe();return false;}
  lx+=dx*0.18;ly+=dy*0.18;placeLoupe();
  return true;
}

loupe.addEventListener('pointerdown',e=>{
  if(!loupeOn||e.button!==0)return;
  e.preventDefault();e.stopPropagation();
  lTarget=null;
  lgrab={cx:e.clientX,cy:e.clientY,lx0:lx,ly0:ly};
  loupe.classList.add('held');
  loupe.setPointerCapture(e.pointerId);
  hideHint();
});

loupe.addEventListener('pointermove',e=>{
  if(!lgrab)return;
  const b=bookBox(), R=loupeSize()/2;
  lx=Math.max(b.x-R*0.5,Math.min(b.x+b.w+R*0.5, lgrab.lx0+(e.clientX-lgrab.cx)));
  ly=Math.max(b.y-R*0.5,Math.min(b.y+b.h+R*0.8, lgrab.ly0+(e.clientY-lgrab.cy)));
  placeLoupe();
});

function dropLoupe(){lgrab=null;loupe.classList.remove('held');}
loupe.addEventListener('pointerup',dropLoupe);
loupe.addEventListener('pointercancel',dropLoupe);

loupeBtn.onclick=()=>{
  loupeOn=!loupeOn;
  loupeBtn.setAttribute('aria-pressed',String(loupeOn));
  loupe.classList.toggle('on',loupeOn);
  if(loupeOn&&lx===null)restLoupe();
  placeLoupe();
};
addEventListener('resize',()=>{lx=null;restLoupe();});

function syncZoom(){
  zRead.textContent=Math.round(view.tz*100)+'%';
  zOutBtn.disabled=view.tz<=ZOOM_MIN+0.001;
  zInBtn.disabled=view.tz>=ZOOM_MAX-0.001;
}
zInBtn.onclick=()=>{setView(view.trx,view.try_,view.tz*1.15);hideHint();};
zOutBtn.onclick=()=>{setView(view.trx,view.try_,view.tz/1.15);hideHint();};

/* ---------------------------------------------------------- Intro */
let riffle=null,riffleAt=0,introOn=false;
function endIntro(){
  introOn=false;wrap.classList.remove('intro','b2');
}
function riffleStep(){
  const s=riffle[riffleAt];
  wrap.classList.toggle('b2',s.bell>0.55);
  startTurn('next',0);
  tweenTo(1,s.dur,()=>{
    idx=turn.to;turn=null;
    riffleAt++;
    if(introOn&&riffleAt<riffle.length){paint();riffleStep();}
    else{endIntro();paint();}
  });
}
function startIntro(){
  const coarse=matchMedia('(max-width: 640px), (pointer: coarse)').matches;
  if(coarse||REDUCED||Q.has('nointro')||window.__SKIP_INTRO__){idx=LAND;paint();return;}
  const steps=M+LAND;
  riffle=[];
  for(let r=0;r<steps;r++){
    const bell=Math.sin(Math.PI*(r/(steps-1)));
    riffle.push({bell:bell,dur:0.26-0.19*bell});
  }
  riffleAt=0;introOn=true;wrap.classList.add('intro');
  riffleStep();
}

/* ------------------------------------------------------------- Boot */
(async function boot(){
  idx=Q.has('shot')?(parseInt(Q.get('shot'),10)||0)%M:0;
  paint();applyView();
  await Promise.all(PAGES.map(p=>{
    const im=new Image();im.src=p.url;
    return im.decode?im.decode().catch(()=>{}):new Promise(r=>{im.onload=im.onerror=r});
  }));
  if(document.fonts&&document.fonts.ready)await document.fonts.ready.catch(()=>{});
  syncZoom();
  restLoupe();
  document.body.dataset.ready='1';
  if(Q.has('shot')){
    if(Q.has('t')){startTurn(Q.get('dir')||'next',parseFloat(Q.get('t')));}
    return;
  }
  setTimeout(startIntro,220);
})();
</script>
</body>
</html>
`, a = `<style id="threeui-sketchbook-host">
html,body,.page{width:100%;height:100%;min-height:0;overflow:hidden}
body{background:transparent}
.sb-stage{width:100%;height:100%;min-height:0;padding:6px 0;align-content:center;display:flex;flex-direction:column;justify-content:center;box-sizing:border-box}
.sb-3d{max-width:min(900px, 90vw, calc((100vh - 105px) * 1.419))}
.sb-captions{min-height:24px}
@media(max-width:640px){
  .sb-stage{padding:4px 0}
  .sb-3d{max-width:min(96vw, calc((100vh - 86px) * 1.419))}
}
</style>`;

function createSketchbookDocument(assetBaseUrl = "/sketchbook/", skipIntro = false) {
  const e = assetBaseUrl.endsWith("/") ? assetBaseUrl : `${assetBaseUrl}/`;
  let html = t.replaceAll("sketchbook/", e);
  if (skipIntro) {
    html = html.replace('const Q=new URLSearchParams(location.search);', 'const Q=new URLSearchParams(location.search);window.__SKIP_INTRO__=true;');
  }
  return html.replace("</head>", `${a}</head>`);
}

export {
  t as CANONICAL_SKETCHBOOK_HTML,
  createSketchbookDocument
};
