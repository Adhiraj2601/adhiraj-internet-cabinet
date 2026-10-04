const sharp = require('sharp');
const path = require('path');

async function generateCardTextures() {
  const width = 1600;
  const height = 1200;

  // 1. Prepare photo
  // Photo area: inset with padding
  const paddingX = 44;
  const paddingTop = 44;
  const photoW = width - paddingX * 2; // 1512
  const photoH = 970; // leaving 1200 - 44 - 970 = 186px for polaroid caption

  const heroPath = path.join(__dirname, '../public/images/hero-800.webp');
  const resizedPhotoBuf = await sharp(heroPath)
    .resize(photoW, photoH, { fit: 'cover', position: 'center' })
    .toBuffer();

  // 2. Prepare SVG overlay for Card Front (frame border, photo border, and captions)
  const svgFrontOverlay = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .card-border { stroke: rgba(23, 23, 23, 0.16); stroke-width: 3; fill: none; }
      .photo-border { stroke: rgba(23, 23, 23, 0.14); stroke-width: 2.5; fill: none; }
      .caption-script {
        font-family: 'Caveat', cursive, sans-serif;
        font-size: 54px;
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
  <rect x="2" y="2" width="${width - 4}" height="${height - 4}" rx="28" class="card-border" />

  <!-- Inset Photo border -->
  <rect x="${paddingX}" y="${paddingTop}" width="${photoW}" height="${photoH}" rx="8" class="photo-border" />

  <!-- Polaroid-style Caption Area along bottom -->
  <g transform="translate(${paddingX + 16}, 1115)">
    <!-- Rotated handwriting note on the left -->
    <text class="caption-script" transform="rotate(-1.5)">welcome to my little corner</text>
  </g>

  <!-- Mono Fig label on the right -->
  <g transform="translate(${width - paddingX - 16}, 1110)">
    <text class="caption-mono">FIG. 01 / ARTIFACT</text>
  </g>
</svg>
`;

  // 3. Composite Card Front
  // Background rectangle
  const frontBg = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 244, g: 241, b: 234, alpha: 1 } // #F4F1EA
    }
  }).png().toBuffer();

  await sharp(frontBg)
    .composite([
      {
        input: resizedPhotoBuf,
        top: paddingTop,
        left: paddingX
      },
      {
        input: Buffer.from(svgFrontOverlay),
        top: 0,
        left: 0
      }
    ])
    .png()
    .toFile('src/assets/lanyard/card_front_43.png');

  // 4. Composite Card Back
  const svgBack = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .card-border { stroke: rgba(23, 23, 23, 0.16); stroke-width: 3; fill: none; }
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

  <rect width="${width}" height="${height}" rx="28" fill="#F4F1EA" />
  <rect x="2" y="2" width="${width - 4}" height="${height - 4}" rx="28" class="card-border" />

  <text x="${width / 2}" y="${height / 2 - 25}" class="center-mono">ADHIRAJ SENGAR · ARCHIVE 2026</text>
  <text x="${width / 2}" y="${height / 2 + 35}" class="sub-mono">PERSONAL ACCESS CARD</text>
</svg>
`;

  await sharp(Buffer.from(svgBack)).png().toFile('src/assets/lanyard/card_back_43.png');

  console.log('Successfully generated 4:3 card textures with sharp composite!');
}

generateCardTextures().catch(console.error);
