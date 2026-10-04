const sharp = require('sharp');
const path = require('path');

async function generateCardTextures() {
  const heroPath = path.join(__dirname, '../public/images/hero-800.webp');
  const heroMeta = await sharp(heroPath).metadata();
  const naturalAspect = heroMeta.width / heroMeta.height; // e.g. 800 / 600 = 1.333333

  console.log(`Hero image: ${heroMeta.width}x${heroMeta.height}, natural aspect: ${naturalAspect}`);

  // 1. Choose canvas width and padding
  const canvasW = 1680;
  const padding = 48; // inner padding (top, left, right, bottom)
  const photoW = canvasW - padding * 2; // 1584
  const photoH = Math.round(photoW / naturalAspect); // 1188 (exact 4:3)
  const captionStripH = 168; // slim polaroid caption strip
  const canvasH = padding + photoH + captionStripH + padding; // 48 + 1188 + 168 + 48 = 1452

  console.log(`Card dimensions: ${canvasW}x${canvasH}, aspect: ${canvasW / canvasH}`);
  console.log(`Photo box: ${photoW}x${photoH}, aspect: ${photoW / photoH}`);

  // 2. Prepare resized photo with exact aspect ratio (no cover crop, no squash)
  const resizedPhotoBuf = await sharp(heroPath)
    .resize(photoW, photoH, { fit: 'contain', background: { r: 244, g: 241, b: 234, alpha: 1 } })
    .toBuffer();

  // 3. Prepare SVG overlay for Card Front
  const captionCenterY = padding + photoH + captionStripH / 2;
  const svgFrontOverlay = `
<svg width="${canvasW}" height="${canvasH}" viewBox="0 0 ${canvasW} ${canvasH}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .card-border { stroke: rgba(23, 23, 23, 0.16); stroke-width: 3.5; fill: none; }
      .photo-border { stroke: rgba(23, 23, 23, 0.13); stroke-width: 2.5; fill: none; }
      .caption-script {
        font-family: 'Caveat', cursive, sans-serif;
        font-size: 52px;
        font-weight: 500;
        fill: #6E6A62;
      }
      .caption-mono {
        font-family: 'Space Mono', monospace;
        font-size: 25px;
        font-weight: 600;
        letter-spacing: 4.5px;
        fill: #77736B;
        text-anchor: end;
      }
    </style>
  </defs>

  <!-- Outer card border -->
  <rect x="2" y="2" width="${canvasW - 4}" height="${canvasH - 4}" rx="28" class="card-border" />

  <!-- Inset Photo border -->
  <rect x="${padding}" y="${padding}" width="${photoW}" height="${photoH}" rx="8" class="photo-border" />

  <!-- Polaroid-style Caption Area along bottom -->
  <g transform="translate(${padding + 20}, ${captionCenterY + 14})">
    <text class="caption-script" transform="rotate(-1.5)">welcome to my little corner</text>
  </g>

  <g transform="translate(${canvasW - padding - 20}, ${captionCenterY + 8})">
    <text class="caption-mono">FIG. 01 / ARTIFACT</text>
  </g>
</svg>
`;

  // 4. Composite Card Front
  const frontBg = await sharp({
    create: {
      width: canvasW,
      height: canvasH,
      channels: 4,
      background: { r: 244, g: 241, b: 234, alpha: 1 }
    }
  }).png().toBuffer();

  await sharp(frontBg)
    .composite([
      {
        input: resizedPhotoBuf,
        top: padding,
        left: padding
      },
      {
        input: Buffer.from(svgFrontOverlay),
        top: 0,
        left: 0
      }
    ])
    .png()
    .toFile('src/assets/lanyard/card_front_43.png');

  // 5. Composite Card Back
  const svgBack = `
<svg width="${canvasW}" height="${canvasH}" viewBox="0 0 ${canvasW} ${canvasH}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .card-border { stroke: rgba(23, 23, 23, 0.16); stroke-width: 3.5; fill: none; }
      .center-mono {
        font-family: 'Space Mono', monospace;
        font-size: 34px;
        font-weight: 700;
        letter-spacing: 6px;
        fill: #6E6A62;
        text-anchor: middle;
        dominant-baseline: central;
      }
      .sub-mono {
        font-family: 'Space Mono', monospace;
        font-size: 20px;
        letter-spacing: 4.5px;
        fill: #948F85;
        text-anchor: middle;
        dominant-baseline: central;
      }
    </style>
  </defs>

  <rect width="${canvasW}" height="${canvasH}" rx="28" fill="#F4F1EA" />
  <rect x="2" y="2" width="${canvasW - 4}" height="${canvasH - 4}" rx="28" class="card-border" />

  <text x="${canvasW / 2}" y="${canvasH / 2 - 25}" class="center-mono">ADHIRAJ SENGAR · ARCHIVE 2026</text>
  <text x="${canvasW / 2}" y="${canvasH / 2 + 35}" class="sub-mono">PERSONAL ACCESS CARD</text>
</svg>
`;

  await sharp(Buffer.from(svgBack)).png().toFile('src/assets/lanyard/card_back_43.png');

  console.log('Successfully generated undistorted 4:3 card textures!');
}

generateCardTextures().catch(console.error);
