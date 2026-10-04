/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

import cardGLB from '../../assets/lanyard/card.glb';
import defaultLanyard from '../../assets/lanyard/lanyard.png';
import defaultFrontImage from '../../assets/lanyard/card_face.png';
import defaultBackImage from '../../assets/lanyard/card_back.png';

import './Lanyard.css';

extend({ MeshLineGeometry, MeshLineMaterial });
useGLTF.preload(cardGLB);

// 1x1 transparent pixel for unconditional texture loading
const BLANK_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// The card model's front face is UV-mapped to the LEFT half of the texture
// atlas and the back face to the RIGHT half (measured from card.glb).
const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 };
const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 0.757 };

export default function Lanyard({
  position,
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  frontImage = defaultFrontImage,
  backImage = defaultBackImage,
  imageFit = 'cover',
  lanyardImage = defaultLanyard,
  lanyardWidth = 1,
  isMobile: isMobileProp,
  frameloop = 'always',
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

  // Responsive camera defaults:
  // Desktop: position [0, 0, 24], fov 20 (badge resting at vertical center of hero)
  // Mobile: position [0, 1.2, 13], fov 20 (badge is ~45% screen width, roughly 175px on 392px screen)
  const effectivePosition = position || (isMobile ? [0, 1.2, 13] : [0, 0, 24]);

  return (
    <div className={`lanyard-wrapper ${className}`.trim()} style={style}>
      <Canvas
        camera={{ position: effectivePosition, fov: fov }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        gl={{ alpha: transparent, antialias: true, powerPreference: 'high-performance' }}
        frameloop={frameloop}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1);
        }}
      >
        <ambientLight intensity={Math.PI * 0.9} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band
            isMobile={isMobile}
            frontImage={frontImage}
            backImage={backImage}
            imageFit={imageFit}
            lanyardImage={lanyardImage}
            lanyardWidth={lanyardWidth}
          />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={8}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1
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
  const dir = useRef(new THREE.Vector3()).current;

  const segmentProps = useMemo(() => ({
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4
  }), []);

  const { nodes, materials } = useGLTF(cardGLB);
  const texture = useTexture(lanyardImage || defaultLanyard);
  const frontTex = useTexture(frontImage || BLANK_PIXEL);
  const backTex = useTexture(backImage || BLANK_PIXEL);

  // Composite the custom badge front and back images into the card's texture atlas
  const cardMap = useMemo(() => {
    const baseMap = materials.base?.map;
    if (!baseMap || !baseMap.image) return baseMap;

    const baseImg = baseMap.image;
    const W = baseImg.width || 1678;
    const H = baseImg.height || 1677;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return baseMap;

    // Draw original baked atlas for card edges and clip details
    ctx.drawImage(baseImg, 0, 0, W, H);

    const drawFitted = (img, rect) => {
      if (!img || !img.width || !img.height) return;
      const rx = rect.x * W;
      const ry = rect.y * H;
      const rw = rect.w * W;
      const rh = rect.h * H;
      const pick = imageFit === 'contain' ? Math.min : Math.max;
      const scale = pick(rw / img.width, rh / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = rx + (rw - dw) / 2;
      const dy = ry + (rh - dh) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.clip();
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    };

    if (frontImage && frontTex && frontTex.image) {
      drawFitted(frontTex.image, FRONT_UV_RECT);
    }
    if (backImage && backTex && backTex.image) {
      drawFitted(backTex.image, BACK_UV_RECT);
    }

    const composite = new THREE.CanvasTexture(canvas);
    composite.colorSpace = THREE.SRGBColorSpace;
    composite.flipY = baseMap.flipY;
    composite.anisotropy = 16;
    composite.needsUpdate = true;
    return composite;
  }, [frontImage, backImage, imageFit, frontTex, backTex, materials.base]);

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

  useEffect(() => {
    if (texture) {
      // oxlint-disable-next-line react/immutability
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.needsUpdate = true;
    }
  }, [texture]);

  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);

  // Gesture tracking refs for touch devices:
  // Allows natural vertical scrolling over the badge area while enabling horizontal/diagonal badge swinging.
  const touchStartRef = useRef(null);
  const isGestureDecidedRef = useRef(false);
  const isDraggingBadgeRef = useRef(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.5, 0]
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
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());

      // Safe drag bounds: prevent card from leaving container or colliding with left heading
      const targetX = vec.x - dragged.x;
      const targetY = vec.y - dragged.y;
      const targetZ = vec.z - dragged.z;

      const clampedX = Math.max(-4.0, Math.min(4.0, targetX));
      const clampedY = Math.max(-5.0, Math.min(2.5, targetY));

      card.current?.setNextKinematicTranslation({
        x: clampedX,
        y: clampedY,
        z: targetZ
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
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  // Pointer event handlers with touch pan-y gesture discrimination
  const handlePointerDown = useCallback((e) => {
    if (e.pointerType === 'mouse') {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch {}
      drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
      return;
    }

    // Touch device: record initial touch coordinates
    touchStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      point: new THREE.Vector3().copy(e.point),
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

      // If user swipes vertically: allow native page scroll
      if (absDy > 7 && absDy > absDx * 1.15) {
        isGestureDecidedRef.current = true;
        isDraggingBadgeRef.current = false;
        touchStartRef.current = null;
        return;
      }

      // If user drags horizontally or diagonally: swing badge!
      if (absDx > 6 || Math.hypot(dx, dy) > 8) {
        isGestureDecidedRef.current = true;
        isDraggingBadgeRef.current = true;
        try {
          touchStartRef.current.target.setPointerCapture(touchStartRef.current.pointerId);
        } catch {}
        drag(new THREE.Vector3().copy(touchStartRef.current.point).sub(vec.copy(card.current.translation())));
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
  }, []);

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardMap}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.88}
                metalness={0.4}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  );
}
