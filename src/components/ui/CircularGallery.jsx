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

function createTextTexture(gl, text, font = "600 32px 'Caveat', cursive", color = '#171717') {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = font;
  const metrics = context.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const textHeight = Math.ceil(getFontSize(font) * 1.4);
  canvas.width = textWidth + 30;
  canvas.height = textHeight + 24;
  context.font = font;
  context.fillStyle = color;
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

class Title {
  constructor({ gl, plane, renderer, text, textColor = '#171717', font = "600 32px 'Caveat', cursive" }) {
    autoBind(this);
    this.gl = gl;
    this.plane = plane;
    this.renderer = renderer;
    this.text = text;
    this.textColor = textColor;
    this.font = font;
    this.createMesh();
  }
  createMesh() {
    const { texture, width, height } = createTextTexture(this.gl, this.text, this.font, this.textColor);
    this.textureWidth = width;
    this.textureHeight = height;
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
          if (color.a < 0.1) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true
    });
    this.mesh = new Mesh(this.gl, { geometry, program });
    this.updateTransform();
    this.mesh.setParent(this.plane);
  }
  updateTransform() {
    if (!this.mesh) return;
    const aspect = (this.textureWidth || 1) / (this.textureHeight || 1);
    const textHeight = this.plane.scale.y * 0.15;
    const textWidth = textHeight * aspect;
    this.mesh.scale.set(textWidth, textHeight, 1);
    this.mesh.position.y = -this.plane.scale.y * 0.5 - textHeight * 0.5 - 0.05;
  }
  onResize() {
    this.updateTransform();
  }
}

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
  update(scroll, direction) {
    this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      // Scale effective bend on narrow mobile viewports so radius does not collapse
      const isMobileScreen = this.screen && this.screen.width < 640;
      const currentBend = isMobileScreen ? Math.min(this.bend, 1.2) : this.bend;
      const B_abs = Math.abs(currentBend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H * 0.98);

      const arc = R - Math.sqrt(Math.max(0, R * R - effectiveX * effectiveX));
      const asinRatio = Math.min(0.999, Math.max(-0.999, effectiveX / R));
      if (currentBend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(asinRatio);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(asinRatio);
      }
    }

    this.speed = scroll.current - scroll.last;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }
  onResize({ screen, viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height];
      }
    }
    const isSmall = this.screen.width < 640;
    const isMedium = this.screen.width < 1024;
    // Scale card dimensions dynamically so mobile screens fit 3 cards gracefully
    const cardScale = isSmall ? 0.65 : (isMedium ? 0.82 : 1.0);
    this.scale = (this.screen.height / 1500) * cardScale;
    this.plane.scale.y = (this.viewport.height * (900 * this.scale)) / this.screen.height;
    // Factor 600 maintains 2:3 portrait book aspect ratio
    this.plane.scale.x = (this.viewport.width * (600 * this.scale)) / this.screen.width;
    this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    this.padding = isSmall ? 1.0 : (isMedium ? 1.5 : 2.0);
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
    if (this.title) {
      this.title.onResize();
    }
  }
}

class App {
  constructor(
    container,
    {
      items,
      bend,
      textColor = '#1a1a1a',
      borderRadius = 0,
      font = 'bold 30px Figtree',
      scrollSpeed = 2,
      scrollEase = 0.05,
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
    this.setupIntersectionObserver();
  }
  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2)
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
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
  createMedias(items, bend = 1, textColor, borderRadius, font) {
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
  onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = e.clientX;
    this.startY = e.clientY;
    this.pointerId = e.pointerId;
    this.isScrolling = undefined;
    this.pointerMoved = false;
  }
  onPointerMove(e) {
    if (!this.isDown) return;
    if (this.pointerId !== undefined && e.pointerId !== undefined && e.pointerId !== this.pointerId) return;

    const deltaX = this.start - e.clientX;
    const deltaY = this.startY - e.clientY;

    // Detect if the user is swiping vertically to scroll the page
    if (this.isScrolling === undefined) {
      if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
        if (Math.abs(deltaY) > Math.abs(deltaX) * 1.15 && e.pointerType !== 'mouse') {
          // Allow natural vertical page scroll on touch devices
          this.isScrolling = true;
          this.isDown = false;
          return;
        } else {
          // Capture horizontal carousel gesture
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

    const distance = deltaX * (this.scrollSpeed * 0.025);
    this.scroll.target = this.scroll.position + distance;
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
    this.pointerMoved = false;
    this.holdUntil = performance.now() + 800;
    if (this.autoplay !== 'drift') {
      this.onCheck();
    }
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
    this.holdUntil = performance.now() + 800;
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
  onResize() {
    if (!this.container) return;
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight
    };
    if (this.renderer && this.screen.width && this.screen.height) {
      this.renderer.setSize(this.screen.width, this.screen.height);
    }
    this.camera.perspective({
      aspect: (this.screen.width || 1) / (this.screen.height || 1)
    });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    if (this.medias) {
      this.medias.forEach(media => media.onResize({ screen: this.screen, viewport: this.viewport }));
    }
  }
  update(time) {
    if (!this.isVisible) return;

    const now = typeof time === 'number' && time > 0 ? time : performance.now();
    const dt = this.lastTime > 0 ? Math.min((now - this.lastTime) / 1000, 0.05) : 1 / 60;
    this.lastTime = now;

    // Autoplay drift effect (matching Sketches CircularCarousel)
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

    // Determine active centered slide
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

    // Attach wheel and gesture start ONLY to container, NOT window
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

export default function CircularGallery({
  items,
  bend = 3,
  textColor = '#1a1a1a',
  borderRadius = 0.05,
  font = "600 32px 'Caveat', cursive",
  fontUrl,
  scrollSpeed = 2,
  scrollEase = 0.05,
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
