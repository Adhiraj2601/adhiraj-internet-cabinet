/* eslint-disable react/no-unknown-property */
/* oxlint-disable */
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

import cardGLB from '../../assets/lanyard/card.glb';
import defaultLanyard from '../../assets/lanyard/lanyard.png';
import defaultFrontImage from '../../assets/lanyard/card_front_43.png';
import defaultBackImage from '../../assets/lanyard/card_back_43.png';

import { checkIsStackedLayout, STACKED_MEDIA_QUERY } from '../../hooks/useStackedLayout';
import './Lanyard.css';

extend({ MeshLineGeometry, MeshLineMaterial });
useGLTF.preload(cardGLB);
useTexture.preload(defaultLanyard);
useTexture.preload(defaultFrontImage);
useTexture.preload(defaultBackImage);

/**
 * Fit image inside box without distortion (contain)
 */
function drawContain(ctx, img, x, y, w, h) {
  const nw = img.naturalWidth || img.width;
  const nh = img.naturalHeight || img.height;
  const s = Math.min(w / nw, h / nh);
  const dw = nw * s;
  const dh = nh * s;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

/**
 * 3D Lanyard ID Badge Component
 * Features:
 * - Orthographic camera (1 world unit = 100 CSS px) for 1:1 DOM matching
 * - Custom 4:3 landscape card mesh with front portrait + polaroid captions and back paper
 * - Sage-green strap with repeating mono text passing cleanly through navbar
 * - Rapier physics locked to XY plane with linear/angular damping & drag velocity clamping
 * - Single source of truth stacked layout: phones (< 768px) and tall portrait screens (tablets)
 */
export const MOBILE_BREAKPOINT = 768;

export default function Lanyard({
  gravity = [0, -40, 0],
  frontImage = defaultFrontImage,
  backImage = defaultBackImage,
  lanyardImage = defaultLanyard,
  isMobile: isMobileProp,
  prefersReducedMotion = false,
  frameloop = 'always',
  targetRef,
  eventSource,
  className = '',
  style
}) {
  const [internalIsMobile, setInternalIsMobile] = useState(
    () => checkIsStackedLayout()
  );

  useEffect(() => {
    const handleLayoutChange = () => setInternalIsMobile(checkIsStackedLayout());
    const mql = window.matchMedia(STACKED_MEDIA_QUERY);
    mql.addEventListener('change', handleLayoutChange);
    window.addEventListener('resize', handleLayoutChange);
    window.addEventListener('orientationchange', handleLayoutChange);
    return () => {
      mql.removeEventListener('change', handleLayoutChange);
      window.removeEventListener('resize', handleLayoutChange);
      window.removeEventListener('orientationchange', handleLayoutChange);
    };
  }, []);

  const isMobile = isMobileProp !== undefined ? isMobileProp : internalIsMobile;

  // Measure target DOM placeholder rect relative to canvas container
  const coords = useMeasuredCoords(targetRef, isMobile);

  const [ready, setReady] = useState(prefersReducedMotion);
  const isFirstMountRef = useRef(true);

  useEffect(() => {
    isFirstMountRef.current = false;
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setReady(true);
    }
  }, [prefersReducedMotion]);

  const handleReady = useCallback(() => {
    setReady(true);
  }, []);

  return (
    <div
      className={`lanyard-wrapper ${ready ? 'is-ready' : ''} ${className}`.trim()}
      style={style}
    >
      <Canvas
        orthographic
        camera={{
          position: [0, 0, 50],
          zoom: 100,
          near: 0.1,
          far: 1000
        }}
        eventSource={eventSource || undefined}
        eventPrefix="client"
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        frameloop={frameloop}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color(0x000000), 0);
        }}
      >
        <ambientLight intensity={Math.PI} />
        <directionalLight position={[0, 5, 10]} intensity={1.2} />
        <Physics
          gravity={gravity}
          timeStep={1 / 60}
          paused={!ready || prefersReducedMotion}
        >
          <Band
            key={isMobile ? 'mobile' : 'desktop'}
            isMobile={isMobile}
            isFirstMount={isFirstMountRef.current}
            coords={coords}
            frontImage={frontImage}
            backImage={backImage}
            lanyardImage={lanyardImage}
            prefersReducedMotion={prefersReducedMotion}
            onReady={handleReady}
          />
        </Physics>
      </Canvas>
    </div>
  );
}

function measureCoords(targetRef, isMobile) {
  if (typeof window === 'undefined') {
    return {
      cardW: 4.2,
      cardH: 3.63,
      restX: 4.0,
      restY: 0.18,
      anchorX: 3.8,
      anchorY: 4.5,
      canvasW: 14.4,
      canvasH: 9.0
    };
  }

  const sw = window.innerWidth;
  const isMob = isMobile ?? checkIsStackedLayout();
  const container =
    document.querySelector('.hero-lanyard-container') ||
    document.querySelector('.hero-section') ||
    document.body;

  const containerRect = container ? container.getBoundingClientRect() : { left: 0, top: 0, width: sw, height: window.innerHeight };
  const containerCenterXPx = containerRect.left + containerRect.width / 2;
  const containerCenterYPx = containerRect.top + containerRect.height / 2;

  if (isMob) {
    const textCol = document.querySelector('.hero-text-column');
    const textRightPx = textCol ? textCol.getBoundingClientRect().right : Math.round(sw * 0.54);

    // Target strap X at ~62-65% across the screen
    const targetStrapX = Math.round(sw * 0.63);

    // If desktop nav links are rendered in the navbar (e.g. on tablets in portrait),
    // snap the strap to the natural gap between links closest to targetStrapX that is clear of intro text
    let chosenStrapXPx = targetStrapX;
    const navLinks = Array.from(document.querySelectorAll('nav a'));
    const menuLinks = navLinks.filter(a => {
      const text = a.textContent?.trim();
      if (!text || text === 'ADHIRAJ SENGAR') return false;
      const rect = a.getBoundingClientRect();
      return rect.width > 0 && rect.right > 0;
    });

    if (menuLinks.length >= 2) {
      let bestGapMid = null;
      let minDiff = Infinity;
      for (let i = 0; i < menuLinks.length - 1; i++) {
        const leftRect = menuLinks[i].getBoundingClientRect();
        const rightRect = menuLinks[i + 1].getBoundingClientRect();
        const gapMid = (leftRect.right + rightRect.left) / 2;
        const gapWidth = rightRect.left - leftRect.right;
        // Ensure there is an actual gap and it is at least 15px to the right of the intro text
        if (gapWidth > 10 && gapMid > textRightPx + 15) {
          const diff = Math.abs(gapMid - targetStrapX);
          if (diff < minDiff) {
            minDiff = diff;
            bestGapMid = gapMid;
          }
        }
      }
      if (bestGapMid !== null) {
        chosenStrapXPx = Math.round(bestGapMid);
      }
    } else {
      // If mobile menu button is present, ensure strap is to the left of the MENU button with clearance
      const menuBtn = document.querySelector('button[aria-label="Open menu"]');
      if (menuBtn) {
        const btnRect = menuBtn.getBoundingClientRect();
        if (btnRect.width > 0) {
          const maxSafeStrap = btnRect.left - 16;
          chosenStrapXPx = Math.min(chosenStrapXPx, maxSafeStrap);
        }
      }
      // Ensure at least 15px clear of intro text
      chosenStrapXPx = Math.max(chosenStrapXPx, textRightPx + 15);
    }

    const strapXPx = chosenStrapXPx;

    // Card is horizontally centered on the strap.
    // Scale card adaptively from ~190px on small phones up to 340px on tablets
    const targetCardW = Math.round(180 + (sw / 1000) * 160);
    const maxSafeW = Math.floor((sw - strapXPx - 16) * 2);
    const cardWPx = Math.max(190, Math.min(340, Math.min(targetCardW, maxSafeW)));
    const cardHPx = cardWPx * (1452 / 1680);

    const mobileSlot = document.querySelector('.hero-lanyard-mobile-card-slot');

    const cTop = containerRect.top;
    const cHeight = containerRect.height || window.innerHeight;
    const containerCenterYPx = cTop + cHeight / 2;

    // Anchor at top of page behind navbar: 40px above container top
    const anchorYPx = cTop - 40;
    const aY = (containerCenterYPx - anchorYPx) / 100;
    const aX = (strapXPx - containerCenterXPx) / 100;

    let targetCenterYPx = cTop + 480;
    if (mobileSlot) {
      const sRect = mobileSlot.getBoundingClientRect();
      targetCenterYPx = sRect.top + sRect.height * 0.48;
    }

    const rY = (containerCenterYPx - targetCenterYPx) / 100;
    const rX = aX;

    return {
      cardW: cardWPx / 100,
      cardH: cardHPx / 100,
      restX: rX,
      restY: rY,
      anchorX: aX,
      anchorY: aY,
      canvasW: (containerRect.width || sw) / 100,
      canvasH: cHeight / 100
    };
  }

  // Desktop (>= 768px)
  let cardWPx = 420;
  let cardHPx = 363;
  let targetCenterXPx = containerRect.left + containerRect.width * 0.78;
  let targetCenterYPx = containerCenterYPx;

  const targetEl = targetRef?.current || document.querySelector('.hero-badge-target-placeholder');
  if (targetEl) {
    const tRect = targetEl.getBoundingClientRect();
    if (tRect.width > 50) {
      cardWPx = Math.min(420, Math.max(260, tRect.width));
      cardHPx = cardWPx * (1452 / 1680);
      targetCenterXPx = tRect.left + tRect.width / 2;
      targetCenterYPx = tRect.top + tRect.height / 2;
    }
  }

  // Measure nav midpoint between WORK and BOOKS
  let navMidX = null;
  const navLinks = Array.from(document.querySelectorAll('nav a'));
  const workLink = navLinks.find(a => a.textContent?.toLowerCase().includes('work'));
  const booksLink = navLinks.find(a => a.textContent?.toLowerCase().includes('books'));
  if (workLink && booksLink) {
    const wR = workLink.getBoundingClientRect();
    const bR = booksLink.getBoundingClientRect();
    navMidX = (wR.right + bR.left) / 2;
  }

  // Safety boundaries to prevent overlapping text and overflowing screen
  const textCol = document.querySelector('.hero-text-column');
  const textRightPx = textCol ? textCol.getBoundingClientRect().right : containerCenterXPx;
  const minSafeX = Math.max(containerCenterXPx + 40, textRightPx + cardWPx / 2 + 20);
  const maxSafeX = (containerRect.right || sw) - cardWPx / 2 - 20;

  // Prefer navMidX only if cleanly aligned with the target placeholder (e.g. wide desktop);
  // otherwise strictly track the right-column target placeholder so the card stays firmly on the right.
  let calculatedAnchorX = targetCenterXPx;
  if (navMidX !== null && Math.abs(navMidX - targetCenterXPx) <= 35) {
    calculatedAnchorX = navMidX;
  }
  const safeAnchorXPx = Math.max(minSafeX, Math.min(calculatedAnchorX, maxSafeX));

  const aX = (safeAnchorXPx - containerCenterXPx) / 100;
  const rX = aX;
  const rY = (containerCenterYPx - targetCenterYPx) / 100;
  const aY = (containerRect.height / 2 + 35) / 100;

  return {
    cardW: cardWPx / 100,
    cardH: cardHPx / 100,
    restX: rX,
    restY: rY,
    anchorX: aX,
    anchorY: aY,
    canvasW: (containerRect.width || sw) / 100,
    canvasH: (containerRect.height || window.innerHeight) / 100
  };
}

/**
 * Measure DOM target rect and canvas bounds
 */
function useMeasuredCoords(targetRef, isMobile) {
  const [coords, setCoords] = useState(() => measureCoords(targetRef, isMobile));
  const prevIsMobileRef = useRef(isMobile);

  // Synchronously synchronize coords when breakpoint changes to eliminate stale 1-render lag
  let currentCoords = coords;
  if (prevIsMobileRef.current !== isMobile) {
    prevIsMobileRef.current = isMobile;
    currentCoords = measureCoords(targetRef, isMobile);
    setCoords(currentCoords);
  }

  useEffect(() => {
    function measure() {
      setCoords(measureCoords(targetRef, isMobile));
    }

    measure();

    const mql = window.matchMedia(STACKED_MEDIA_QUERY);
    mql.addEventListener('change', measure);
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    window.visualViewport?.addEventListener('resize', measure);
    window.visualViewport?.addEventListener('scroll', measure);

    if (document.fonts?.ready) {
      document.fonts.ready.then(measure);
    }

    const roTarget = document.querySelector('.hero-section') || document.body;
    let ro = null;
    if (typeof ResizeObserver !== 'undefined' && roTarget) {
      ro = new ResizeObserver(measure);
      ro.observe(roTarget);
    }

    const t1 = setTimeout(measure, 100);
    const t2 = setTimeout(measure, 400);

    return () => {
      mql.removeEventListener('change', measure);
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
      window.visualViewport?.removeEventListener('resize', measure);
      window.visualViewport?.removeEventListener('scroll', measure);
      if (ro) ro.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [targetRef, isMobile]);

  return currentCoords;
}

function Band({
  maxSpeed = 50,
  minSpeed = 10,
  isMobile = false,
  isFirstMount = true,
  coords,
  frontImage,
  backImage,
  lanyardImage,
  prefersReducedMotion = false,
  onReady
}) {
  const band = useRef();
  const fixed = useRef();
  const j1 = useRef();
  const j2 = useRef();
  const j3 = useRef();
  const card = useRef();

  const vec = useRef(new THREE.Vector3()).current;
  const ang = useRef(new THREE.Vector3()).current;
  const rot = useRef(new THREE.Vector3()).current;
  const cardQuat = useRef(new THREE.Quaternion()).current;
  const ringWorld = useRef(new THREE.Vector3()).current;

  const { size } = useThree();

  const segmentProps = useMemo(() => ({
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4
  }), []);

  const { nodes, materials } = useGLTF(cardGLB);
  const strapTex = useTexture(lanyardImage || defaultLanyard);
  const initialFrontTex = useTexture(frontImage || defaultFrontImage);
  const initialBackTex = useTexture(backImage || defaultBackImage);

  // Configure textures
  useEffect(() => {
    if (initialFrontTex) {
      initialFrontTex.colorSpace = THREE.SRGBColorSpace;
      initialFrontTex.anisotropy = 16;
      initialFrontTex.needsUpdate = true;
    }
    if (initialBackTex) {
      initialBackTex.colorSpace = THREE.SRGBColorSpace;
      initialBackTex.anisotropy = 16;
      initialBackTex.needsUpdate = true;
    }
    if (strapTex) {
      strapTex.wrapS = strapTex.wrapT = THREE.RepeatWrapping;
      strapTex.colorSpace = THREE.SRGBColorSpace;
      strapTex.anisotropy = 16;
      strapTex.needsUpdate = true;
    }
  }, [initialFrontTex, initialBackTex, strapTex]);

  // Generate dynamic 2D canvas texture with exact fonts and portrait
  const [liveTextures, setLiveTextures] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadDynamicTextures() {
      try {
        await document.fonts.ready;
        const img = new Image();
        img.src = '/images/hero-800.webp';
        try {
          await img.decode();
        } catch {
          await new Promise((res) => {
            img.onload = res;
            img.onerror = res;
          });
        }
        if (!active || !img.width) return;

        const nw = img.naturalWidth || 800;
        const nh = img.naturalHeight || 600;

        // Derive card dimensions dynamically from natural aspect ratio of the photo
        const W = 1680;
        const padding = 48;
        const photoW = W - 2 * padding; // 1584
        const photoH = Math.round(photoW * (nh / nw)); // 1188 for 4:3
        const captionStripH = 168;
        const H = padding + photoH + captionStripH + padding; // 1452

        // Front Face Canvas
        const cF = document.createElement('canvas');
        cF.width = W;
        cF.height = H;
        const ctxF = cF.getContext('2d');
        if (!ctxF) return;

        // Card cream background
        ctxF.fillStyle = '#F4F1EA';
        ctxF.fillRect(0, 0, W, H);

        // Thin outer border
        ctxF.strokeStyle = 'rgba(23, 23, 23, 0.16)';
        ctxF.lineWidth = 4;
        ctxF.strokeRect(4, 4, W - 8, H - 8);

        // Inset photo frame
        ctxF.fillStyle = '#F4F1EA';
        ctxF.fillRect(padding, padding, photoW, photoH);
        ctxF.strokeStyle = 'rgba(23, 23, 23, 0.12)';
        ctxF.lineWidth = 3;
        ctxF.strokeRect(padding, padding, photoW, photoH);

        // Draw portrait image with contain (never stretch or distort)
        ctxF.save();
        ctxF.beginPath();
        ctxF.rect(padding + 2, padding + 2, photoW - 4, photoH - 4);
        ctxF.clip();
        drawContain(ctxF, img, padding + 2, padding + 2, photoW - 4, photoH - 4);
        ctxF.restore();

        // Bottom polaroid caption: handwriting on left, mono fig label on right
        const captionCenterY = padding + photoH + captionStripH / 2;
        ctxF.save();
        ctxF.translate(padding + 20, captionCenterY + 12);
        ctxF.rotate(-0.026);
        ctxF.font = '500 52px "Caveat", cursive';
        ctxF.fillStyle = '#6E6A62';
        ctxF.textBaseline = 'middle';
        ctxF.fillText('welcome to my little corner', 0, 0);
        ctxF.restore();

        ctxF.save();
        ctxF.font = '600 24px "Space Mono", monospace';
        if ('letterSpacing' in ctxF) {
          ctxF.letterSpacing = '4.5px';
        }
        ctxF.fillStyle = '#77736B';
        ctxF.textAlign = 'right';
        ctxF.textBaseline = 'middle';
        ctxF.fillText('FIG. 01 / ARTIFACT', W - padding - 20, captionCenterY + 8);
        ctxF.restore();

        // Back Face Canvas
        const cB = document.createElement('canvas');
        cB.width = W;
        cB.height = H;
        const ctxB = cB.getContext('2d');
        if (!ctxB) return;

        ctxB.fillStyle = '#F4F1EA';
        ctxB.fillRect(0, 0, W, H);
        ctxB.strokeStyle = 'rgba(23, 23, 23, 0.16)';
        ctxB.lineWidth = 4;
        ctxB.strokeRect(4, 4, W - 8, H - 8);

        ctxB.fillStyle = '#6E6A62';
        ctxB.font = '700 32px "Space Mono", monospace';
        if ('letterSpacing' in ctxB) {
          ctxB.letterSpacing = '6px';
        }
        ctxB.textAlign = 'center';
        ctxB.textBaseline = 'middle';
        ctxB.fillText('ADHIRAJ SENGAR · ARCHIVE 2026', W / 2, H / 2 - 25);

        ctxB.fillStyle = '#948F85';
        ctxB.font = '600 20px "Space Mono", monospace';
        if ('letterSpacing' in ctxB) {
          ctxB.letterSpacing = '4.5px';
        }
        ctxB.fillText('PERSONAL ACCESS CARD', W / 2, H / 2 + 35);

        const fTex = new THREE.CanvasTexture(cF);
        fTex.colorSpace = THREE.SRGBColorSpace;
        fTex.anisotropy = 16;
        fTex.needsUpdate = true;

        const bTex = new THREE.CanvasTexture(cB);
        bTex.colorSpace = THREE.SRGBColorSpace;
        bTex.anisotropy = 16;
        bTex.needsUpdate = true;

        if (active) {
          setLiveTextures({ front: fTex, back: bTex });
        }
      } catch (err) {
        console.warn('Canvas texture creation fallback:', err);
      }
    }

    loadDynamicTextures();
    return () => {
      active = false;
    };
  }, []);

  const curve = useRef(
    (() => {
      const c = new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3()
      ]);
      c.curveType = 'chordal';
      return c;
    })()
  ).current;

  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);

  // Compute ring center and hook bounds from GLTF geometry
  const { ringCenter, hookBox } = useMemo(() => {
    nodes.clip.geometry.computeBoundingBox();
    nodes.clamp.geometry.computeBoundingBox();

    const boxClip = nodes.clip.geometry.boundingBox;
    const boxClamp = nodes.clamp.geometry.boundingBox;

    // The ring is at the top (larger max.y) and the hook/clamp is below it
    const isClipRing = boxClip.max.y > boxClamp.max.y;
    const ringGeom = isClipRing ? nodes.clip.geometry : nodes.clamp.geometry;
    const hookGeom = isClipRing ? nodes.clamp.geometry : nodes.clip.geometry;

    const center = new THREE.Vector3();
    ringGeom.boundingBox.getCenter(center);

    return {
      ringCenter: center,
      hookBox: hookGeom.boundingBox
    };
  }, [nodes]);

  // Dimensions & Physics Setup derived from card geometry
  const cardT = 0.035;
  const cardHalfW = coords.cardW / 2;
  const cardHalfH = coords.cardH / 2;
  const groupScale = 2.25;
  const gap = 0.375; // Distance from card top edge to ring center (same as original React Bits)
  const anchorY = cardHalfH + gap;
  const groupPosY = anchorY - ringCenter.y * groupScale;

  const ropeLength = Math.max(0.6, coords.anchorY - (coords.restY + anchorY));
  const segLen = ropeLength / 3;

  const startPositions = useMemo(() => {
    // If user prefers reduced motion, or if this is a remount due to breakpoint resize,
    // start immediately at rest pose so the card doesn't drop from the sky on resize
    if (prefersReducedMotion || !isFirstMount) {
      return {
        fixed: [coords.anchorX, coords.anchorY, 0],
        j1: [coords.anchorX, coords.anchorY - segLen, 0],
        j2: [coords.anchorX, coords.anchorY - 2 * segLen, 0],
        j3: [coords.anchorX, coords.anchorY - 3 * segLen, 0],
        card: [coords.restX, coords.restY, 0],
      };
    }

    // On initial page load: start at top with subtle swing and fall down (React Bits entrance)
    const rightSpace = (coords.canvasW / 2) - coords.anchorX - cardHalfW - 0.15;
    const leftSpace = coords.anchorX - (-coords.canvasW / 2) - cardHalfW - 0.15;

    // Prefer spreading right if space allows (>= 0.6), otherwise left
    let dir = 1;
    let maxSpread = rightSpace;
    if (rightSpace < 0.6 && leftSpace > rightSpace) {
      dir = -1;
      maxSpread = leftSpace;
    }

    // On mobile: the long strap runs down beside the text, so start with a gentle tilt
    // hanging down rather than dropping 500px from the ceiling
    if (isMobile) {
      const angle = 0.12 * dir;
      const sinA = Math.sin(angle);
      const cosA = Math.cos(angle);
      return {
        fixed: [coords.anchorX, coords.anchorY, 0],
        j1: [coords.anchorX + sinA * segLen, coords.anchorY - cosA * segLen, 0],
        j2: [coords.anchorX + sinA * 2 * segLen, coords.anchorY - cosA * 2 * segLen, 0],
        j3: [coords.anchorX + sinA * 3 * segLen, coords.anchorY - cosA * 3 * segLen, 0],
        card: [coords.anchorX + sinA * (ropeLength + 0.08), coords.anchorY - cosA * (ropeLength + 0.08) - anchorY, 0],
      };
    }

    const targetOffset = 1.15;
    const clampedOffset = Math.max(0.25, Math.min(targetOffset, Math.max(0.25, maxSpread)));
    const dx = (clampedOffset / 3.2) * dir;

    const cardStartX = coords.anchorX + 3.2 * dx;
    const cardStartY = coords.anchorY - anchorY + 0.12;

    return {
      fixed: [coords.anchorX, coords.anchorY, 0],
      j1: [coords.anchorX + 1 * dx, coords.anchorY, 0],
      j2: [coords.anchorX + 2 * dx, coords.anchorY, 0],
      j3: [coords.anchorX + 3 * dx, coords.anchorY, 0],
      card: [cardStartX, cardStartY, 0],
    };
  }, [coords, segLen, cardHalfW, anchorY, isMobile, prefersReducedMotion, isFirstMount]);

  const hasUnpausedRef = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      onReady?.();
      return;
    }

    if (liveTextures) {
      const t = setTimeout(() => {
        if (!hasUnpausedRef.current) {
          hasUnpausedRef.current = true;
          [card, j1, j2, j3].forEach(ref => ref.current?.wakeUp());
          onReady?.();
        }
      }, 50);
      return () => clearTimeout(t);
    }

    const fallbackTimer = setTimeout(() => {
      if (!hasUnpausedRef.current) {
        hasUnpausedRef.current = true;
        [card, j1, j2, j3].forEach(ref => ref.current?.wakeUp());
        onReady?.();
      }
    }, 600);
    return () => clearTimeout(fallbackTimer);
  }, [liveTextures, prefersReducedMotion, onReady]);

  // Touch gesture discriminator for mobile
  const touchStartRef = useRef(null);
  const isGestureDecidedRef = useRef(false);
  const isDraggingBadgeRef = useRef(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], segLen]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], segLen]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], segLen]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, anchorY, 0]
  ]);

  // Smoothly move fixed anchor and bodies on continuous viewport changes
  const prevAnchorRef = useRef({ x: coords.anchorX, y: coords.anchorY });
  useEffect(() => {
    const dx = coords.anchorX - prevAnchorRef.current.x;
    const dy = coords.anchorY - prevAnchorRef.current.y;
    prevAnchorRef.current = { x: coords.anchorX, y: coords.anchorY };

    if (fixed.current) {
      try {
        fixed.current.setTranslation({ x: coords.anchorX, y: coords.anchorY, z: 0 }, true);
        if (!dragged && (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001)) {
          [j1, j2, j3, card].forEach(ref => {
            if (ref.current) {
              const pos = ref.current.translation();
              ref.current.setTranslation({ x: pos.x + dx, y: pos.y + dy, z: pos.z }, true);
              ref.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
            }
          });
        }
        [card, j1, j2, j3].forEach(ref => ref.current?.wakeUp());
      } catch {}
    }
  }, [coords.anchorX, coords.anchorY, dragged]);

  useEffect(() => {
    if (!isMobile) {
      document.body.style.cursor = dragged ? 'grabbing' : (hovered ? 'grab' : 'auto');
      return () => {
        document.body.style.cursor = 'auto';
      };
    }
  }, [hovered, dragged, isMobile]);

  const initialKickRef = useRef(false);
  useFrame((state, delta) => {
    if (!initialKickRef.current && card.current && !prefersReducedMotion) {
      initialKickRef.current = true;
      [card, j1, j2, j3].forEach(ref => ref.current?.wakeUp());
    }

    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0).unproject(state.camera);
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());

      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: 0
      });
    }

    if (fixed.current && j1.current && j2.current && j3.current && card.current && band.current) {
      [j1, j2].forEach(ref => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });

      // Calculate world position of ring center so strap end is mathematically locked to the ring
      const r = card.current.rotation();
      cardQuat.set(r.x, r.y, r.z, r.w);
      ringWorld.set(0, anchorY, 0).applyQuaternion(cardQuat).add(card.current.translation());

      curve.points[0].copy(ringWorld);
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(32));

      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: 0, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  const handlePointerDown = useCallback((e) => {
    e.stopPropagation?.();
    if (e.pointerType === 'mouse') {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch {}
      vec.set(e.pointer.x, e.pointer.y, 0).unproject(e.camera);
      drag(new THREE.Vector3().copy(vec).sub(card.current.translation()));
      return;
    }

    touchStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      pointerX: e.pointer.x,
      pointerY: e.pointer.y,
      camera: e.camera,
      target: e.target,
      pointerId: e.pointerId
    };
    isGestureDecidedRef.current = false;
    isDraggingBadgeRef.current = false;
  }, [vec]);

  const handlePointerMove = useCallback((e) => {
    if (e.pointerType === 'mouse' || !touchStartRef.current) return;

    if (!isGestureDecidedRef.current) {
      const dx = e.clientX - touchStartRef.current.x;
      const dy = e.clientY - touchStartRef.current.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDy > 7 && absDy > absDx * 1.15) {
        isGestureDecidedRef.current = true;
        isDraggingBadgeRef.current = false;
        touchStartRef.current = null;
        return;
      }

      if (absDx > 6 || Math.hypot(dx, dy) > 8) {
        isGestureDecidedRef.current = true;
        isDraggingBadgeRef.current = true;
        try {
          touchStartRef.current.target.setPointerCapture(touchStartRef.current.pointerId);
        } catch {}
        vec.set(touchStartRef.current.pointerX, touchStartRef.current.pointerY, 0).unproject(touchStartRef.current.camera);
        drag(new THREE.Vector3().copy(vec).sub(card.current.translation()));
      }
    }
  }, [vec]);

  const handlePointerUp = useCallback((e) => {
    try {
      e?.target?.releasePointerCapture?.(e.pointerId);
    } catch {}
    drag(false);
    touchStartRef.current = null;
    isGestureDecidedRef.current = false;
    isDraggingBadgeRef.current = false;
  }, []);

  useEffect(() => {
    if (!dragged) return;
    const handleGlobalPointerUp = () => {
      drag(false);
      touchStartRef.current = null;
      isGestureDecidedRef.current = false;
      isDraggingBadgeRef.current = false;
    };
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, [dragged]);

  return (
    <>
      <group position={[0, 0, 0]}>
        {/* Fixed strap anchor hidden behind top nav */}
        <RigidBody
          ref={fixed}
          position={startPositions.fixed}
          {...segmentProps}
          type="fixed"
        />

        {/* Dynamic rope segments */}
        <RigidBody
          position={startPositions.j1}
          ref={j1}
          {...segmentProps}
          enabledTranslations={[true, true, false]}
          enabledRotations={[false, false, true]}
        >
          <BallCollider args={[0.02]} mass={0.1} sensor />
        </RigidBody>

        <RigidBody
          position={startPositions.j2}
          ref={j2}
          {...segmentProps}
          enabledTranslations={[true, true, false]}
          enabledRotations={[false, false, true]}
        >
          <BallCollider args={[0.02]} mass={0.1} sensor />
        </RigidBody>

        <RigidBody
          position={startPositions.j3}
          ref={j3}
          {...segmentProps}
          enabledTranslations={[true, true, false]}
          enabledRotations={[false, false, true]}
        >
          <BallCollider args={[0.02]} mass={0.1} sensor />
        </RigidBody>

        {/* Card rigid body: locked to XY plane */}
        <RigidBody
          position={startPositions.card}
          ref={card}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
          enabledTranslations={[true, true, false]}
          enabledRotations={[false, true, true]}
        >
          <CuboidCollider args={[coords.cardW / 2, coords.cardH / 2, cardT / 2]} mass={0.2} />
          <group
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {/* Front Face: Plane Geometry with true colors */}
            <mesh position={[0, 0, cardT / 2 + 0.001]}>
              <planeGeometry args={[coords.cardW, coords.cardH]} />
              <meshBasicMaterial
                map={liveTextures?.front || initialFrontTex}
                toneMapped={false}
              />
            </mesh>

            {/* Back Face: Plane Geometry rotated 180 degrees */}
            <mesh position={[0, 0, -cardT / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[coords.cardW, coords.cardH]} />
              <meshBasicMaterial
                map={liveTextures?.back || initialBackTex}
                toneMapped={false}
              />
            </mesh>

            {/* Thin edge box for 3D card depth */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[coords.cardW, coords.cardH, cardT]} />
              <meshBasicMaterial color="#EAE6DE" toneMapped={false} />
            </mesh>

            {/* Metal Clip and Clamp from card.glb */}
            <group
              scale={groupScale}
              position={[0, groupPosY, -0.01]}
            >
              <mesh
                geometry={nodes.clip.geometry}
                material={materials.metal}
                material-roughness={0.25}
                renderOrder={2}
              />
              <mesh
                geometry={nodes.clamp.geometry}
                material={materials.metal}
                material-roughness={0.25}
                renderOrder={2}
              />
            </group>
          </group>
        </RigidBody>
      </group>

      {/* Repeating Sage-Green Lanyard Strap */}
      <mesh ref={band} renderOrder={1}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={[size.width, size.height]}
          useMap
          map={strapTex}
          repeat={isMobile ? [-3.8, 1] : [-4.0, 1]}
          lineWidth={isMobile ? 0.046 : 0.052}
        />
      </mesh>
    </>
  );
}
