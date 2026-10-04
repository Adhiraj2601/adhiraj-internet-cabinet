/* eslint-disable react/no-unknown-property */
/* oxlint-disable */
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

import cardGLB from '../../assets/lanyard/card.glb';
import defaultLanyard from '../../assets/lanyard/lanyard.png';
import defaultFrontImage from '../../assets/lanyard/card_front_43.png';
import defaultBackImage from '../../assets/lanyard/card_back_43.png';

import './Lanyard.css';

extend({ MeshLineGeometry, MeshLineMaterial });
useGLTF.preload(cardGLB);

/**
 * 3D Lanyard ID Badge Component
 * Features:
 * - Orthographic camera (1 world unit = 100 CSS px) for 1:1 DOM matching
 * - Custom 4:3 landscape card mesh with front portrait + polaroid captions and back paper
 * - Sage-green strap with repeating mono text passing between WORK and BOOKS
 * - Rapier physics locked to XY plane with linear/angular damping & drag velocity clamping
 * - Full responsive support for Desktop and Mobile viewports
 */
export default function Lanyard({
  gravity = [0, -35, 0],
  frontImage = defaultFrontImage,
  backImage = defaultBackImage,
  lanyardImage = defaultLanyard,
  isMobile: isMobileProp,
  frameloop = 'always',
  targetRef,
  className = '',
  style
}) {
  const [internalIsMobile, setInternalIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 1024
  );

  useEffect(() => {
    const handleResize = () => setInternalIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = isMobileProp !== undefined ? isMobileProp : internalIsMobile;

  // Measure target DOM placeholder rect relative to canvas container
  const coords = useMeasuredCoords(targetRef, isMobile);

  return (
    <div className={`lanyard-wrapper ${className}`.trim()} style={style}>
      <Canvas
        orthographic
        camera={{
          position: [0, 0, 50],
          zoom: 100,
          near: 0.1,
          far: 1000
        }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
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
          timeStep={isMobile ? 1 / 30 : 1 / 60}
        >
          <Band
            isMobile={isMobile}
            coords={coords}
            frontImage={frontImage}
            backImage={backImage}
            lanyardImage={lanyardImage}
          />
        </Physics>
      </Canvas>
    </div>
  );
}

/**
 * Measure DOM target rect and canvas bounds
 */
function useMeasuredCoords(targetRef, isMobile) {
  const [coords, setCoords] = useState(() => {
    if (isMobile) {
      const sw = typeof window !== 'undefined' ? window.innerWidth : 390;
      const wPx = Math.min(320, sw * 0.78);
      const hPx = wPx * 0.75;
      return {
        cardW: wPx / 100,
        cardH: hPx / 100,
        restX: 0,
        restY: 0.05,
        anchorX: 0,
        anchorY: 2.2,
        canvasW: sw / 100,
        canvasH: 4.2
      };
    }
    return {
      cardW: 4.2,
      cardH: 3.15,
      restX: 1.15,
      restY: 0.18,
      anchorX: 1.10,
      anchorY: 4.8,
      canvasW: 8.6,
      canvasH: 9.0
    };
  });

  useEffect(() => {
    function measure() {
      if (typeof window === 'undefined') return;

      if (isMobile) {
        const sw = window.innerWidth;
        const wPx = Math.min(320, sw * 0.78);
        const hPx = wPx * 0.75;
        const mobileContainer = document.querySelector('.hero-lanyard-mobile-container');
        const cH = mobileContainer ? mobileContainer.clientHeight : 420;
        setCoords({
          cardW: wPx / 100,
          cardH: hPx / 100,
          restX: 0,
          restY: 0.05,
          anchorX: 0,
          anchorY: (cH / 2 + 25) / 100,
          canvasW: sw / 100,
          canvasH: cH / 100
        });
        return;
      }

      // Desktop: measure relative to .hero-lanyard-desktop-container
      const desktopContainer = document.querySelector('.hero-lanyard-desktop-container');
      const targetEl = targetRef?.current || document.querySelector('.hero-badge-target-placeholder');

      if (desktopContainer) {
        const containerRect = desktopContainer.getBoundingClientRect();
        let cardWPx = 420;
        let cardHPx = 315;
        let targetCenterXPx = containerRect.left + containerRect.width * 0.62;
        let targetCenterYPx = containerRect.top + containerRect.height * 0.48;

        if (targetEl) {
          const tRect = targetEl.getBoundingClientRect();
          if (tRect.width > 50) {
            cardWPx = tRect.width;
            cardHPx = tRect.height;
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

        const containerCenterXPx = containerRect.left + containerRect.width / 2;
        const containerCenterYPx = containerRect.top + containerRect.height / 2;

        const anchorXPx = navMidX ?? targetCenterXPx;
        const aX = (anchorXPx - containerCenterXPx) / 100;
        const rX = (targetCenterXPx - containerCenterXPx) / 100;
        const rY = (containerCenterYPx - targetCenterYPx) / 100;
        const aY = (containerRect.height / 2 + 35) / 100;

        setCoords({
          cardW: cardWPx / 100,
          cardH: cardHPx / 100,
          restX: rX,
          restY: rY,
          anchorX: aX,
          anchorY: aY,
          canvasW: containerRect.width / 100,
          canvasH: containerRect.height / 100
        });
      }
    }

    measure();
    window.addEventListener('resize', measure);
    const t = setTimeout(measure, 150);
    return () => {
      window.removeEventListener('resize', measure);
      clearTimeout(t);
    };
  }, [targetRef, isMobile]);

  return coords;
}

function Band({
  maxSpeed = 45,
  minSpeed = 0,
  isMobile = false,
  coords,
  frontImage,
  backImage,
  lanyardImage
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

  const segmentProps = useMemo(() => ({
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: 3.5,
    linearDamping: 3.5
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

        const W = 1600;
        const H = 1200;

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
        const padX = 46;
        const padTop = 46;
        const photoW = W - padX * 2;
        const photoH = 955;

        ctxF.fillStyle = '#F4F1EA';
        ctxF.fillRect(padX, padTop, photoW, photoH);
        ctxF.strokeStyle = 'rgba(23, 23, 23, 0.12)';
        ctxF.lineWidth = 3;
        ctxF.strokeRect(padX, padTop, photoW, photoH);

        // Draw portrait image
        ctxF.save();
        ctxF.beginPath();
        ctxF.rect(padX + 2, padTop + 2, photoW - 4, photoH - 4);
        ctxF.clip();
        ctxF.drawImage(img, padX + 2, padTop + 2, photoW - 4, photoH - 4);
        ctxF.restore();

        // Bottom polaroid caption: handwriting on left, mono fig label on right
        ctxF.save();
        ctxF.translate(padX + 20, H - 86);
        ctxF.rotate(-0.032);
        ctxF.font = '500 52px "Caveat", cursive';
        ctxF.fillStyle = '#6E6A62';
        ctxF.textBaseline = 'middle';
        ctxF.fillText('welcome to my little corner', 0, 0);
        ctxF.restore();

        ctxF.save();
        ctxF.font = '600 24px "Space Mono", monospace';
        ctxF.letterSpacing = '5px';
        ctxF.fillStyle = '#77736B';
        ctxF.textAlign = 'right';
        ctxF.textBaseline = 'middle';
        ctxF.fillText('FIG. 01 / ARTIFACT', W - padX - 20, H - 90);
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
        ctxB.letterSpacing = '6px';
        ctxB.textAlign = 'center';
        ctxB.textBaseline = 'middle';
        ctxB.fillText('ADHIRAJ SENGAR · ARCHIVE 2026', W / 2, H / 2 - 25);

        ctxB.fillStyle = '#948F85';
        ctxB.font = '600 20px "Space Mono", monospace';
        ctxB.letterSpacing = '4.5px';
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

  // Dimensions & Physics Setup
  const cardT = 0.035;
  const clipScale = isMobile ? 1.5 : 1.9;
  const clipAnchorY = coords.cardH / 2 + 0.1505 * clipScale;
  const ropeLength = Math.max(0.6, coords.anchorY - (coords.restY + clipAnchorY));
  const segLen = ropeLength / 3;

  // Touch gesture discriminator for mobile
  const touchStartRef = useRef(null);
  const isGestureDecidedRef = useRef(false);
  const isDraggingBadgeRef = useRef(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], segLen]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], segLen]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], segLen]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, clipAnchorY, 0]
  ]);

  useEffect(() => {
    if (hovered && !isMobile) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => {
        document.body.style.cursor = 'auto';
      };
    }
  }, [hovered, dragged, isMobile]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0).unproject(state.camera);
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());

      const targetX = vec.x - dragged.x;
      const targetY = vec.y - dragged.y;

      const halfW = coords.cardW / 2;
      const halfH = coords.cardH / 2;
      const canvasHalfW = coords.canvasW / 2;
      const canvasHalfH = coords.canvasH / 2;

      // Safe drag bounds: keep card fully inside canvas boundaries to prevent clipping
      const clampedX = Math.max(-canvasHalfW + halfW + 0.1, Math.min(canvasHalfW - halfW - 0.1, targetX));
      const clampedY = Math.max(-canvasHalfH + halfH + 0.1, Math.min(coords.anchorY - 0.6, targetY));

      card.current?.setNextKinematicTranslation({
        x: clampedX,
        y: clampedY,
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

      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));

      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: 0, y: ang.y - rot.y * 0.35, z: ang.z });
    }
  });

  const handlePointerDown = useCallback((e) => {
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
      e.target.releasePointerCapture(e.pointerId);
    } catch {}
    drag(false);
    touchStartRef.current = null;
    isGestureDecidedRef.current = false;
    isDraggingBadgeRef.current = false;

    if (card.current) {
      const linvel = card.current.linvel();
      const speed = Math.hypot(linvel.x, linvel.y);
      const maxReleaseSpeed = 7.0;
      if (speed > maxReleaseSpeed) {
        card.current.setLinvel({
          x: (linvel.x / speed) * maxReleaseSpeed,
          y: (linvel.y / speed) * maxReleaseSpeed,
          z: 0
        });
      } else {
        card.current.setLinvel({ x: linvel.x, y: linvel.y, z: 0 });
      }

      const angvel = card.current.angvel();
      const maxAngSpeed = 3.5;
      if (Math.abs(angvel.z) > maxAngSpeed) {
        card.current.setAngvel({
          x: 0,
          y: 0,
          z: Math.sign(angvel.z) * maxAngSpeed
        });
      }
    }
  }, []);

  return (
    <>
      <group position={[0, 0, 0]}>
        {/* Fixed strap anchor hidden behind top nav */}
        <RigidBody
          ref={fixed}
          position={[coords.anchorX, coords.anchorY, 0]}
          {...segmentProps}
          type="fixed"
        />

        {/* Dynamic rope segments */}
        <RigidBody
          position={[coords.anchorX, coords.anchorY - segLen, 0]}
          ref={j1}
          {...segmentProps}
          enabledTranslations={[true, true, false]}
          enabledRotations={[false, false, true]}
        >
          <BallCollider args={[0.08]} />
        </RigidBody>

        <RigidBody
          position={[coords.anchorX, coords.anchorY - 2 * segLen, 0]}
          ref={j2}
          {...segmentProps}
          enabledTranslations={[true, true, false]}
          enabledRotations={[false, false, true]}
        >
          <BallCollider args={[0.08]} />
        </RigidBody>

        <RigidBody
          position={[coords.anchorX, coords.anchorY - 3 * segLen, 0]}
          ref={j3}
          {...segmentProps}
          enabledTranslations={[true, true, false]}
          enabledRotations={[false, false, true]}
        >
          <BallCollider args={[0.08]} />
        </RigidBody>

        {/* Card rigid body: locked to XY plane */}
        <RigidBody
          position={[coords.restX, coords.restY, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
          enabledTranslations={[true, true, false]}
          enabledRotations={[false, true, true]}
        >
          <CuboidCollider args={[coords.cardW / 2, coords.cardH / 2, cardT / 2]} />
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
              scale={clipScale}
              position={[0, coords.cardH / 2 - 1.023 * clipScale, 0]}
            >
              <mesh
                geometry={nodes.clip.geometry}
                material={materials.metal}
                material-roughness={0.25}
              />
              <mesh
                geometry={nodes.clamp.geometry}
                material={materials.metal}
                material-roughness={0.25}
              />
            </group>
          </group>
        </RigidBody>
      </group>

      {/* Repeating Sage-Green Lanyard Strap */}
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={strapTex}
          repeat={isMobile ? [-2.2, 1] : [-4.0, 1]}
          lineWidth={isMobile ? 0.055 : 0.07}
        />
      </mesh>
    </>
  );
}
