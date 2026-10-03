import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import { useEffect, useRef } from 'react';

import './CircularGallery.css';

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1, p2, t) {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance) {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach(key => {
    if (key !== 'constructor' && typeof instance[key] === 'function') {
      instance[key] = instance[key].bind(instance);
    }
  });
}

const DEFAULT_FONT = '600 32px Caveat, cursive';
const DEFAULT_FONT_URL = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&display=swap';

function deriveFontFamilyFromUrl(url) {
  const fileName = (url.split('/').pop() || 'custom-font').split('?')[0];
  const base = fileName.replace(/\.(woff2?|ttf|otf|eot)$/i, '');
  return base.replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'CircularGalleryFont';
}

async function loadFontFromStylesheet(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch font stylesheet (${response.status})`);
  const cssText = await response.text();
  const faceBlocks = cssText.match(/@font-face\s*{[^}]*}/g) || [];
  let family = null;
  const fontFaces = [];
  for (const block of faceBlocks) {
    const familyMatch = block.match(/font-family:\s*['"]?([^;'"]+)['"]?/);
    const urlMatch = block.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/);
    if (!familyMatch || !urlMatch) continue;
    family = familyMatch[1].trim();
    const descriptors = {};
    const weightMatch = block.match(/font-weight:\s*([^;]+);/);
    const styleMatch = block.match(/font-style:\s*([^;]+);/);
    const rangeMatch = block.match(/unicode-range:\s*([^;]+);/);
    if (weightMatch) descriptors.weight = weightMatch[1].trim();
    if (styleMatch) descriptors.style = styleMatch[1].trim();
    if (rangeMatch) descriptors.unicodeRange = rangeMatch[1].trim();
    fontFaces.push(new FontFace(family, `url(${urlMatch[1]})`, descriptors));
  }
  if (!family) throw new Error('No @font-face rule found in the stylesheet');
  await Promise.allSettled(
    fontFaces.map(async face => {
      await face.load();
      document.fonts.add(face);
    })
  );
  return family;
}

async function loadFontFromFile(url) {
  const family = deriveFontFamilyFromUrl(url);
  const fontFace = new FontFace(family, `url(${url})`);
  await fontFace.load();
  document.fonts.add(fontFace);
  return family;
}

async function loadCustomFont(fontUrl) {
  const isStylesheet = fontUrl.includes('fonts.googleapis.com') || /\.css(\?.*)?$/i.test(fontUrl);
  return isStylesheet ? loadFontFromStylesheet(fontUrl) : loadFontFromFile(fontUrl);
}

async function resolveFont(font, fontUrl) {
  const effectiveUrl = fontUrl || (font === DEFAULT_FONT ? DEFAULT_FONT_URL : null);
  if (!effectiveUrl) {
    if (document.fonts && document.fonts.load) {
      try {
        await document.fonts.load(font);
        await document.fonts.ready;
      } catch {
        // Fall back to default rendered font
      }
    }
    return font;
  }
  try {
    const family = await loadCustomFont(effectiveUrl);
    const sizeMatch = font.match(/^\s*(.*?\d+px)/);
    const prefix = sizeMatch ? sizeMatch[1].trim() : 'bold 30px';
    const resolved = `${prefix} "${family}"`;
    if (document.fonts && document.fonts.load) {
      try {
        await document.fonts.load(resolved);
        await document.fonts.ready;
      } catch {
        // Fall back
      }
    }
    return resolved;
  } catch (error) {
    console.error('CircularGallery: unable to load font from', fontUrl, error);
    return font;
  }
}

function getFontSize(font) {
  const match = font.match(/(\d+)px/);
  return match ? parseInt(match[1], 10) : 30;
}

// ============================================================================
// [CHANGE 4: DPR-Scaled, Aspect-Locked, Regenerated Text Texture]
// The Title class manages the title mesh for each card. It renders to a 2D
// canvas at high-DPI resolution, scales the font size relative to the card's
// world scale, locks the mesh aspect ratio to the texture aspect ratio (no stretch),
// and sits at a consistent offset directly beneath the card.
// ============================================================================
class Title {
  constructor({ gl, plane, renderer, text, textColor = '#171717', font = "600 32px 'Caveat', cursive" }) {
    autoBind(this);
    this.gl = gl;
    this.plane = plane;
    this.renderer = renderer;
    this.text = text;
    this.textColor = textColor;
    this.baseFont = font;
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.texture = new Texture(this.gl, { generateMipmaps: false });
    this.createMesh();
  }

  createMesh() {
    const geometry = new Plane(this.gl);
    const program = new Program(this.gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.05) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: this.texture } },
      transparent: true
    });
    this.mesh = new Mesh(this.gl, { geometry, program });
    this.mesh.setParent(this.plane);
    this.renderTextTexture();
  }

  renderTextTexture() {
    if (!this.mesh || !this.plane || !this.context) return;

    // [CHANGE 4]: Render resolution based on DPR and card width
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const baseFontSize = getFontSize(this.baseFont);

    // Scale font size proportionally to card height in world units (desktop base ~9.94)
    const cardScaleRatio = Math.max(0.45, this.plane.scale.y / 9.94);
    const scaledFontSize = Math.max(14, Math.round(baseFontSize * cardScaleRatio));
    const renderFontSize = Math.round(scaledFontSize * dpr);
    const fontSpec = this.baseFont.replace(/\d+px/, `${renderFontSize}px`);

    this.context.font = fontSpec;
    const metrics = this.context.measureText(this.text);
    const textWidth = Math.ceil(metrics.width);
    const textHeight = Math.ceil(renderFontSize * 1.35);

    const canvasWidth = Math.max(64, textWidth + Math.round(28 * dpr));
    const canvasHeight = Math.max(32, textHeight + Math.round(16 * dpr));

    if (this.canvas.width !== canvasWidth || this.canvas.height !== canvasHeight) {
      this.canvas.width = canvasWidth;
      this.canvas.height = canvasHeight;
    }

    this.context.font = fontSpec;
    this.context.fillStyle = this.textColor;
    this.context.textBaseline = 'middle';
    this.context.textAlign = 'center';
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillText(this.text, this.canvas.width / 2, this.canvas.height / 2);

    this.texture.image = this.canvas;
    this.texture.needsUpdate = true;

    // [CHANGE 4]: Keep text plane aspect ratio strictly locked to the canvas texture so it NEVER stretches
    const textureAspect = canvasWidth / canvasHeight;
    const desiredWorldTextHeight = this.plane.scale.y * 0.12;
    const desiredWorldTextWidth = desiredWorldTextHeight * textureAspect;

    // Account for parent transform scale so world scale is exact and undistorted
    this.mesh.scale.x = desiredWorldTextWidth / Math.max(0.001, this.plane.scale.x);
    this.mesh.scale.y = desiredWorldTextHeight / Math.max(0.001, this.plane.scale.y);

    // In parent local space: parent bottom is at y = -0.5
    // Maintain a consistent proportional gap below card bottom in local space
    this.mesh.position.y = -0.5 - (this.mesh.scale.y * 0.5) - 0.03;
  }

  onResize() {
    this.renderTextTexture();
  }
}

// ============================================================================
// Media (Book Card) Class
// ============================================================================
class Media {
  constructor({
    geometry,
    gl,
    image,
    index,
    length,
    renderer,
    scene,
    screen,
    text,
    viewport,
    bend,
    textColor,
    borderRadius = 0,
    font
  }) {
    this.extra = 0;
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.text = text;
    this.viewport = viewport;
    this.bend = bend;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.font = font;
    this.createShader();
    this.createMesh();
    this.createTitle();
    this.onResize();
  }

  createShader() {
    const texture = new Texture(this.gl, {
      generateMipmaps: true
    });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;
        
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }
        
        void main() {
          // Safeguard against division by zero on mobile OpenGL ES drivers
          float imgAspect = (uImageSizes.y > 0.0 && uImageSizes.x > 0.0) ? (uImageSizes.x / uImageSizes.y) : (2.0 / 3.0);
          float planeAspect = (uPlaneSizes.y > 0.0 && uPlaneSizes.x > 0.0) ? (uPlaneSizes.x / uPlaneSizes.y) : (2.0 / 3.0);
          vec2 ratio = vec2(
            min(planeAspect / imgAspect, 1.0),
            min(imgAspect / planeAspect, 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);
          
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          
          // Smooth antialiasing for edges
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);
          
          gl_FragColor = vec4(color.rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [2, 3] },
        uImageSizes: { value: [2, 3] },
        uBorderRadius: { value: this.borderRadius }
      },
      transparent: true
    });
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth || 200, img.naturalHeight || 300];
    };
    img.onerror = () => {
      this.program.uniforms.uImageSizes.value = [200, 300];
    };
  }

  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program
    });
    this.plane.setParent(this.scene);
  }

  createTitle() {
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      renderer: this.renderer,
      text: this.text,
      textColor: this.textColor,
      font: this.font
    });
  }

  // ==========================================================================
  // [CHANGE 3: Aspect-Ratio Scaled & Clamped Bend]
  // Scales the curve radius proportionally with the viewport aspect ratio so
  // that mobile and desktop curvature look harmonious. Clamps the turn angle
  // to avoid steep edge cuts or leaving the visible area.
  // ==========================================================================
  update(scroll, direction) {
    this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      // Reference aspect ratio for desktop (~2.4)
      const desktopAspect = 2.4;
      const currentAspect = Math.max(0.4, (this.screen.width || 1) / (this.screen.height || 1));
      const aspectFactor = Math.min(1.0, currentAspect / desktopAspect);

      // Scale bend smoothly with aspect ratio (clamped between 0.35 and 1.0 of base bend)
      const responsiveBend = this.bend * Math.max(0.35, aspectFactor);
      const B_abs = Math.max(0.001, Math.abs(responsiveBend));
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);

      // Clamp turn angle to ~26 degrees (0.45 rad) so cards on narrow viewports never rotate too sharply
      const maxTurnAngle = 0.45;
      const maxEffectiveX = Math.min(H * 0.95, R * Math.sin(maxTurnAngle));
      const effectiveX = Math.min(Math.abs(x), maxEffectiveX);

      const arc = R - Math.sqrt(Math.max(0, R * R - effectiveX * effectiveX));
      const asinArg = Math.min(0.999, Math.max(-0.999, effectiveX / R));
      const turnAngle = Math.asin(asinArg);

      if (responsiveBend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * turnAngle;
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * turnAngle;
      }
    }

    this.speed = scroll.current - scroll.last;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;

    // Buffer wrap check so cards smoothly wrap completely offscreen
    while (direction === 'right' && this.plane.position.x + planeOffset < -viewportOffset - this.padding) {
      this.extra -= this.widthTotal;
      this.plane.position.x = this.x - scroll.current - this.extra;
    }
    while (direction === 'left' && this.plane.position.x - planeOffset > viewportOffset + this.padding) {
      this.extra += this.widthTotal;
      this.plane.position.x = this.x - scroll.current - this.extra;
    }
  }

  // ==========================================================================
  // [CHANGE 1: Responsive Sizing (3 books on Android/mobile, 5 books on PC)]
  // Recalculates card scale relative to container width:
  // - On Android / mobile (< 640px): 3 books visible across screen without side clipping.
  // - On PC / desktop (>= 1024px): 5 large books across screen with 2.0 padding (matching black book reference).
  // - Between 640px and 1024px: smoothly interpolates for tablets.
  // - Maintains exact 2:3 portrait book aspect ratio everywhere.
  // ==========================================================================
  onResize({ screen, viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height];
      }
    }
    if (!this.screen || !this.viewport) return;

    const widthPx = this.screen.width;
    const heightPx = this.screen.height;

    // Portrait-mode mobile/Android detection:
    // Only treat as "small" (3-card layout) when device is in portrait orientation
    // (width < height) AND it's actually a small handheld device (width < 640px).
    // Landscape mobile falls through to the width-based interpolation logic instead,
    // which produces a natural wide gallery layout like iPad landscape.
    const isPortraitMobile = widthPx < heightPx && widthPx < 640;
    const isSmall = isPortraitMobile;

    // Desktop base dimensions (PC): 5 prominent books across screen.
    // Adaptive padding = force ~5 books regardless of monitor width (handles 1920px etc.)
    const desktopHeight = this.viewport.height * 0.61;
    const desktopWidth = desktopHeight * (2 / 3);
    const desktopPadding = Math.max(2.0, this.viewport.width / 5 - desktopWidth);

    // Mobile / Android portrait target: exactly 3 books visible across screen without side clipping.
    // Card height is capped to 55% of camera height so it's safe in landscape too.
    let mobileWidth = this.viewport.width * 0.265;
    let mobileHeight = mobileWidth * 1.5;
    const maxMobileHeight = this.viewport.height * 0.55;
    if (mobileHeight > maxMobileHeight) {
      mobileHeight = maxMobileHeight;
      mobileWidth = mobileHeight * (2 / 3);
    }
    const mobilePadding = mobileWidth * 0.20;

    let cardWidth, cardHeight, padding;

    if (isSmall) {
      cardWidth = mobileWidth;
      cardHeight = mobileHeight;
      padding = mobilePadding;
    } else if (widthPx < 1024) {
      // Smooth interpolation for landscape mobile and tablets between 3-card and 5-card layout
      const t = Math.max(0, Math.min(1, (widthPx - 640) / (1024 - 640)));
      cardWidth = mobileWidth * (1 - t) + desktopWidth * t;
      cardHeight = mobileHeight * (1 - t) + desktopHeight * t;
      padding = mobilePadding * (1 - t) + desktopPadding * t;
    } else {
      cardWidth = desktopWidth;
      cardHeight = desktopHeight;
      padding = desktopPadding;
    }

    this.plane.scale.x = cardWidth;
    this.plane.scale.y = cardHeight;
    this.plane.program.uniforms.uPlaneSizes.value = [cardWidth, cardHeight];

    this.padding = padding;
    this.width = cardWidth + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;

    // Regenerate and reposition text texture to match new card size and DPR
    if (this.title) {
      this.title.onResize();
    }
  }
}

// ============================================================================
// App Class: Orchestrates OGL Renderer, Camera, Scene, and Gestures
// ============================================================================
class App {
  constructor(
    container,
    {
      items,
      bend = 3,
      textColor = '#1a1a1a',
      borderRadius = 0,
      font = 'bold 30px Figtree',
      scrollSpeed = 2,
      scrollEase = 0.06,
      offsetY = 1.2,
      autoplay = 'drift',
      speed = 1.8,
      pauseOnHover = false,
      direction = 'left',
      onActiveChange
    } = {}
  ) {
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onActiveChange = onActiveChange;
    this.offsetY = offsetY;
    this.autoplay = autoplay;
    this.speed = speed;
    this.pauseOnHover = pauseOnHover;
    this.driftDir = direction === 'right' ? -1 : 1;
    this.isHovered = false;
    this.isDown = false;
    this.holdUntil = 0;
    this.lastTime = 0;
    this.isVisible = true;
    this.raf = 0;
    this.samples = [];
    this.lastActiveIndex = -1;
    this.onCheckDebounce = debounce(this.onCheck, 200);

    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend, textColor, borderRadius, font);
    this.update();
    this.addEventListeners();
    // [CHANGE 2]: ResizeObserver handling
    this.setupResizeObserver();
    // [CHANGE 6]: IntersectionObserver performance pause
    this.setupIntersectionObserver();
  }

  // [CHANGE 6]: Cap renderer DPR at Math.min(devicePixelRatio, 2)
  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2)
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);

    // [CHANGE 5 & 7]: Ensure canvas fills container with pan-y touch action
    this.gl.canvas.style.width = '100%';
    this.gl.canvas.style.height = '100%';
    this.gl.canvas.style.display = 'block';
    this.gl.canvas.style.touchAction = 'pan-y';
    this.gl.canvas.style.userSelect = 'none';
    this.gl.canvas.style.webkitUserSelect = 'none';
    this.container.appendChild(this.gl.canvas);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  createScene() {
    this.scene = new Transform();
    this.scene.position.y = this.offsetY;
  }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 1,
      widthSegments: 1
    });
  }

  createMedias(items, bend = 3, textColor, borderRadius, font) {
    const defaultItems = [
      { image: `https://picsum.photos/seed/1/800/600?grayscale`, text: 'Bridge' },
      { image: `https://picsum.photos/seed/2/800/600?grayscale`, text: 'Desk Setup' },
      { image: `https://picsum.photos/seed/3/800/600?grayscale`, text: 'Waterfall' },
      { image: `https://picsum.photos/seed/4/800/600?grayscale`, text: 'Strawberries' },
      { image: `https://picsum.photos/seed/5/800/600?grayscale`, text: 'Deep Diving' },
      { image: `https://picsum.photos/seed/16/800/600?grayscale`, text: 'Train Track' },
      { image: `https://picsum.photos/seed/17/800/600?grayscale`, text: 'Santorini' },
      { image: `https://picsum.photos/seed/8/800/600?grayscale`, text: 'Blurry Lights' }
    ];
    const galleryItems = items && items.length ? items : defaultItems;
    this.originalLength = galleryItems.length;

    // Repeat items until there are at least 8 slides to avoid broken loop
    let repeated = [...galleryItems];
    while (repeated.length < 8) {
      repeated = repeated.concat(galleryItems);
    }
    this.mediasImages = repeated.concat(repeated);
    this.medias = this.mediasImages.map((data, index) => {
      return new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text: data.text,
        viewport: this.viewport,
        bend,
        textColor,
        borderRadius,
        font
      });
    });
  }

  // ==========================================================================
  // [CHANGE 5: Unified Pointer Events with Pan-Y, Inertia & Card Snapping]
  // ==========================================================================
  onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = e.clientX;
    this.startY = e.clientY;
    this.pointerId = e.pointerId;
    this.isScrolling = undefined;
    this.pointerMoved = false;
    this.samples = [{ time: performance.now(), target: this.scroll.current }];
  }

  onPointerMove(e) {
    if (!this.isDown) return;
    if (this.pointerId !== undefined && e.pointerId !== undefined && e.pointerId !== this.pointerId) return;

    const deltaX = this.start - e.clientX;
    const deltaY = this.startY - e.clientY;

    // Detect gesture axis: if vertical swipe, allow natural vertical page scroll
    if (this.isScrolling === undefined) {
      if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
        if (Math.abs(deltaY) > Math.abs(deltaX) * 1.15 && e.pointerType !== 'mouse') {
          this.isScrolling = true;
          this.isDown = false;
          return;
        } else {
          this.isScrolling = false;
          this.pointerMoved = true;
          try {
            if (this.container && this.container.setPointerCapture) {
              this.container.setPointerCapture(e.pointerId);
            }
          } catch {}
        }
      } else {
        return;
      }
    }

    if (this.isScrolling) {
      return;
    }

    if (Math.abs(deltaX) > 12) {
      this.driftDir = deltaX > 0 ? 1 : -1;
    }

    // Touch sensitivity tuned: responsive and 1:1 feel with finger
    const touchFactor = e.pointerType === 'touch' ? 0.032 : 0.025;
    const distance = deltaX * (this.scrollSpeed * touchFactor);
    this.scroll.target = this.scroll.position + distance;

    const now = performance.now();
    this.samples.push({ time: now, target: this.scroll.target });
    while (this.samples.length > 2 && now - this.samples[0].time > 120) {
      this.samples.shift();
    }
  }

  onPointerUp(e) {
    if (this.pointerId !== undefined && e.pointerId !== undefined && e.pointerId !== this.pointerId) return;
    if (this.pointerMoved && this.container?.hasPointerCapture?.(e.pointerId)) {
      try {
        this.container.releasePointerCapture(e.pointerId);
      } catch {}
    }
    this.isDown = false;
    this.pointerId = undefined;
    this.isScrolling = undefined;

    // Calculate release velocity for inertia scrolling
    let velocity = 0;
    if (this.samples && this.samples.length >= 2) {
      const first = this.samples[0];
      const last = this.samples[this.samples.length - 1];
      const span = (last.time - first.time) / 1000;
      if (span > 0.01) {
        velocity = (last.target - first.target) / span;
      }
    }
    this.samples = [];

    // [CHANGE 5]: Snap to nearest card on release with inertia
    if (this.medias && this.medias[0]) {
      const cardWidth = this.medias[0].width;
      if (cardWidth > 0) {
        const maxInertia = cardWidth * 2.2;
        const rawInertia = velocity * 0.22;
        const inertia = Math.sign(rawInertia) * Math.min(Math.abs(rawInertia), maxInertia);

        const projected = this.scroll.target + inertia;
        const nearestIndex = Math.round(projected / cardWidth);
        this.scroll.target = nearestIndex * cardWidth;
      }
    }

    this.pointerMoved = false;
    this.holdUntil = performance.now() + 1600;
  }

  onPointerCancel(e) {
    if (this.pointerMoved && this.container?.hasPointerCapture?.(e.pointerId)) {
      try {
        this.container.releasePointerCapture(e.pointerId);
      } catch {}
    }
    this.isDown = false;
    this.pointerId = undefined;
    this.isScrolling = undefined;
    this.pointerMoved = false;
    this.samples = [];
    this.holdUntil = performance.now() + 1000;
  }

  onWheel(e) {
    // Only intercept horizontal trackpad/wheel gestures.
    // Allow natural vertical page scroll when rolling mouse wheel up/down over gallery.
    const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    if (!isHorizontal || Math.abs(e.deltaX) < 1) return;

    e.preventDefault();
    this.holdUntil = performance.now() + 1500;
    this.driftDir = e.deltaX > 0 ? 1 : -1;
    this.scroll.target += (e.deltaX > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2;
    if (this.autoplay !== 'drift') {
      this.onCheckDebounce();
    }
  }

  onKeyDown(e) {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        this.holdUntil = performance.now() + 1500;
        this.driftDir = 1;
        this.scroll.target += this.scrollSpeed * 5;
        if (this.autoplay !== 'drift') this.onCheckDebounce();
        break;

      case 'ArrowLeft':
        e.preventDefault();
        this.holdUntil = performance.now() + 1500;
        this.driftDir = -1;
        this.scroll.target -= this.scrollSpeed * 5;
        if (this.autoplay !== 'drift') this.onCheckDebounce();
        break;

      case 'Home':
        e.preventDefault();
        this.holdUntil = performance.now() + 1500;
        this.scroll.target = 0;
        if (this.autoplay !== 'drift') this.onCheckDebounce();
        break;

      default:
        break;
    }
  }

  onCheck() {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    if (!width) return;
    const itemIndex = Math.round(this.scroll.target / width);
    this.scroll.target = width * itemIndex;
  }

  // ==========================================================================
  // [CHANGE 2: Debounced ResizeObserver & Dynamic Viewport Recalculation]
  // ==========================================================================
  setupResizeObserver() {
    if (typeof ResizeObserver === 'undefined' || !this.container) return;
    this.resizeRaf = 0;
    this.resizeObserver = new ResizeObserver(() => {
      if (this.resizeRaf) cancelAnimationFrame(this.resizeRaf);
      this.resizeRaf = requestAnimationFrame(() => {
        this.onResize();
      });
    });
    this.resizeObserver.observe(this.container);
  }

  onResize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (!width || !height) return;

    const oldCardWidth = this.medias && this.medias[0] ? this.medias[0].width : null;

    this.screen = { width, height };

    if (this.renderer) {
      this.renderer.setSize(width, height);
    }

    if (this.camera) {
      this.camera.perspective({
        aspect: width / height
      });
      const fov = (this.camera.fov * Math.PI) / 180;
      const camHeight = 2 * Math.tan(fov / 2) * this.camera.position.z;
      const camWidth = camHeight * this.camera.aspect;
      this.viewport = { width: camWidth, height: camHeight };
    }

    if (this.scene) {
      // Responsive vertical positioning: scales with container height so cards and labels stay visible
      const heightRatio = Math.min(1.0, Math.max(0.45, height / 500));
      this.scene.position.y = this.offsetY * heightRatio;
    }

    if (this.medias) {
      this.medias.forEach(media => media.onResize({ screen: this.screen, viewport: this.viewport }));
    }

    const newCardWidth = this.medias && this.medias[0] ? this.medias[0].width : null;
    if (oldCardWidth && newCardWidth && oldCardWidth !== newCardWidth) {
      const ratio = newCardWidth / oldCardWidth;
      this.scroll.current *= ratio;
      this.scroll.target *= ratio;
      this.scroll.last *= ratio;
    }
  }

  // ==========================================================================
  // [CHANGE 6: Render Loop & Off-Screen Pausing]
  // ==========================================================================
  update(time) {
    if (!this.isVisible) return;

    const now = typeof time === 'number' && time > 0 ? time : performance.now();
    const dt = this.lastTime > 0 ? Math.min((now - this.lastTime) / 1000, 0.05) : 1 / 60;
    this.lastTime = now;

    // Autoplay drift effect
    const isPaused =
      (this.pauseOnHover && this.isHovered) ||
      this.isDown ||
      now < this.holdUntil;

    if (this.autoplay === 'drift' && !isPaused) {
      this.scroll.target += this.speed * this.driftDir * dt;
    }

    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current >= this.scroll.last ? 'right' : 'left';
    if (this.medias) {
      this.medias.forEach(media => media.update(this.scroll, direction));
    }

    // Determine centered active slide
    if (this.medias && this.medias[0] && this.originalLength > 0) {
      const mediaWidth = this.medias[0].width;
      if (mediaWidth > 0) {
        const rawIndex = Math.round(this.scroll.current / mediaWidth);
        const activeIndex = ((rawIndex % this.originalLength) + this.originalLength) % this.originalLength;
        if (activeIndex !== this.lastActiveIndex) {
          this.lastActiveIndex = activeIndex;
          this.onActiveChange?.(activeIndex);
        }
      }
    }

    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }

  setupIntersectionObserver() {
    this.isVisible = true;
    if (typeof IntersectionObserver !== 'undefined' && this.container) {
      this.io = new IntersectionObserver(([entry]) => {
        this.isVisible = entry.isIntersecting;
        if (this.isVisible) {
          this.lastTime = performance.now();
          if (!this.raf) {
            this.raf = window.requestAnimationFrame(this.update.bind(this));
          }
        } else {
          if (this.raf) {
            window.cancelAnimationFrame(this.raf);
            this.raf = 0;
          }
          this.lastTime = 0;
        }
      });
      this.io.observe(this.container);
    }
  }

  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnWheel = this.onWheel.bind(this);
    this.boundOnPointerDown = this.onPointerDown.bind(this);
    this.boundOnPointerMove = this.onPointerMove.bind(this);
    this.boundOnPointerUp = this.onPointerUp.bind(this);
    this.boundOnPointerCancel = this.onPointerCancel.bind(this);
    this.boundOnKeyDown = this.onKeyDown.bind(this);
    this.boundOnMouseEnter = () => {
      this.isHovered = true;
    };
    this.boundOnMouseLeave = () => {
      this.isHovered = false;
    };
    this.boundOnVisibilityChange = () => {
      if (document.hidden) {
        if (this.raf) {
          window.cancelAnimationFrame(this.raf);
          this.raf = 0;
        }
        this.lastTime = 0;
      } else if (this.isVisible) {
        this.lastTime = performance.now();
        if (!this.raf) {
          this.raf = window.requestAnimationFrame(this.update.bind(this));
        }
      }
    };

    window.addEventListener('resize', this.boundOnResize);
    window.addEventListener('pointermove', this.boundOnPointerMove);
    window.addEventListener('pointerup', this.boundOnPointerUp);
    window.addEventListener('pointercancel', this.boundOnPointerCancel);
    document.addEventListener('visibilitychange', this.boundOnVisibilityChange);

    if (this.container) {
      this.container.addEventListener('mouseenter', this.boundOnMouseEnter);
      this.container.addEventListener('mouseleave', this.boundOnMouseLeave);
      this.container.addEventListener('wheel', this.boundOnWheel, { passive: false });
      this.container.addEventListener('pointerdown', this.boundOnPointerDown);
      this.container.addEventListener('keydown', this.boundOnKeyDown);
    }
  }

  destroy() {
    if (this.raf) {
      window.cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
    if (this.resizeRaf) {
      cancelAnimationFrame(this.resizeRaf);
      this.resizeRaf = 0;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.io) {
      this.io.disconnect();
      this.io = null;
    }
    window.removeEventListener('resize', this.boundOnResize);
    window.removeEventListener('pointermove', this.boundOnPointerMove);
    window.removeEventListener('pointerup', this.boundOnPointerUp);
    window.removeEventListener('pointercancel', this.boundOnPointerCancel);
    document.removeEventListener('visibilitychange', this.boundOnVisibilityChange);

    if (this.container) {
      this.container.removeEventListener('mouseenter', this.boundOnMouseEnter);
      this.container.removeEventListener('mouseleave', this.boundOnMouseLeave);
      this.container.removeEventListener('wheel', this.boundOnWheel);
      this.container.removeEventListener('pointerdown', this.boundOnPointerDown);
      this.container.removeEventListener('keydown', this.boundOnKeyDown);
    }
    if (this.renderer && this.renderer.gl && this.renderer.gl.canvas && this.renderer.gl.canvas.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
    }
    const loseContext = this.gl?.getExtension('WEBGL_lose_context');
    if (loseContext) loseContext.loseContext();
  }
}

// ============================================================================
// React Component Wrapper
// ============================================================================
export default function CircularGallery({
  items,
  bend = 3,
  textColor = '#1a1a1a',
  borderRadius = 0.05,
  font = "600 32px 'Caveat', cursive",
  fontUrl,
  scrollSpeed = 2,
  scrollEase = 0.06,
  offsetY = 1.2,
  autoplay = 'drift',
  speed = 1.8,
  pauseOnHover = false,
  direction = 'left',
  onActiveChange,
  className = '',
  style
}) {
  const containerRef = useRef(null);
  const onActiveChangeRef = useRef(onActiveChange);

  useEffect(() => {
    onActiveChangeRef.current = onActiveChange;
  }, [onActiveChange]);

  useEffect(() => {
    if (!containerRef.current || !items || items.length === 0) return;
    let app;
    let isMounted = true;

    resolveFont(font, fontUrl).then(resolvedFont => {
      if (!isMounted || !containerRef.current) return;
      app = new App(containerRef.current, {
        items,
        bend,
        textColor,
        borderRadius,
        font: resolvedFont,
        scrollSpeed,
        scrollEase,
        offsetY,
        autoplay,
        speed,
        pauseOnHover,
        direction,
        onActiveChange: (index) => onActiveChangeRef.current?.(index)
      });
    });

    return () => {
      isMounted = false;
      if (app) app.destroy();
    };
  }, [items, bend, textColor, borderRadius, font, fontUrl, scrollSpeed, scrollEase, offsetY, autoplay, speed, pauseOnHover, direction]);

  if (!items || items.length === 0) {
    return (
      <div
        className={`circular-gallery circular-gallery--empty flex flex-col items-center justify-center ${className}`.trim()}
        style={{ ...style, minHeight: '320px' }}
      >
        <p className="text-sm font-semibold text-foreground">Nothing here yet</p>
        <p className="text-xs text-muted mt-1">No items match your selection.</p>
      </div>
    );
  }

  return (
    <div
      className={`circular-gallery ${className}`.trim()}
      style={style}
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label="Circular book gallery. Use left and right arrow keys to navigate."
    />
  );
}
