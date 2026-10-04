const sharp = require('sharp');
const path = require('path');

async function generateCardFaces() {
  const width = 840;
  const height = 1266;

  // Read hero.png avatar (343x361)
  const avatarPath = path.join(__dirname, '../src/assets/hero.png');
  const avatarBuffer = await sharp(avatarPath)
    .resize(380, 380, { fit: 'contain', background: { r: 244, g: 241, b: 234, alpha: 0 } })
    .toBuffer();

  const avatarBase64 = `data:image/png;base64,${avatarBuffer.toString('base64')}`;

  const frontSvg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .bg { fill: #F4F1EA; }
      .border-line { stroke: rgba(23, 23, 23, 0.12); stroke-width: 2; fill: none; }
      .photo-frame { fill: #ECE8DF; stroke: rgba(23, 23, 23, 0.15); stroke-width: 2; }
      .title {
        font-family: 'Geologica', 'Arial Black', sans-serif;
        font-weight: 800;
        font-size: 46px;
        letter-spacing: 2px;
        fill: #171717;
        text-anchor: middle;
      }
      .mono-label {
        font-family: 'Space Mono', 'Courier New', monospace;
        font-weight: 600;
        font-size: 20px;
        letter-spacing: 4px;
        fill: #77736B;
        text-anchor: middle;
      }
      .mono-id {
        font-family: 'Space Mono', 'Courier New', monospace;
        font-weight: 700;
        font-size: 24px;
        letter-spacing: 3px;
        fill: #477224;
        text-anchor: middle;
      }
      .pill-bg { fill: #E8EFE0; stroke: #A8CB7C; stroke-width: 1.5; }
      .pill-text {
        font-family: 'Space Mono', monospace;
        font-weight: 700;
        font-size: 18px;
        letter-spacing: 2px;
        fill: #34581C;
        text-anchor: middle;
        dominant-baseline: central;
      }
      .barcode-bar { fill: rgba(23, 23, 23, 0.35); }
    </style>
    <clipPath id="photoClip">
      <circle cx="${width / 2}" cy="470" r="180" />
    </clipPath>
  </defs>

  <!-- Card Background -->
  <rect width="${width}" height="${height}" class="bg" rx="28" />

  <!-- Outer Guide Border -->
  <rect x="24" y="24" width="${width - 48}" height="${height - 48}" class="border-line" rx="20" />

  <!-- Top Header Section -->
  <g transform="translate(0, 140)">
    <text x="${width / 2}" y="0" class="mono-label">MEMBER IDENTIFICATION</text>
    <line x1="160" y1="25" x2="${width - 160}" y2="25" stroke="rgba(23,23,23,0.1)" stroke-width="1.5" />
  </g>

  <!-- Photo Outer Circle & Frame -->
  <circle cx="${width / 2}" cy="470" r="192" fill="#FFFFFF" stroke="rgba(23,23,23,0.12)" stroke-width="2" />
  <circle cx="${width / 2}" cy="470" r="182" class="photo-frame" />

  <!-- Avatar Image Embedded with clipPath -->
  <image href="${avatarBase64}" x="${width / 2 - 190}" y="${470 - 190}" width="380" height="380" clip-path="url(#photoClip)" />

  <!-- Status Pill -->
  <g transform="translate(${width / 2}, 710)">
    <rect x="-95" y="-18" width="190" height="36" rx="8" class="pill-bg" />
    <text x="0" y="1" class="pill-text">CREATOR · 2026</text>
  </g>

  <!-- Name & Subtitle -->
  <g transform="translate(${width / 2}, 810)">
    <text x="0" y="0" class="title">ADHIRAJ SENGAR</text>
    <text x="0" y="45" class="mono-id">No. 001</text>
    <text x="0" y="90" class="mono-label">EXPLORER &amp; BUILDER</text>
  </g>

  <!-- Bottom Divider & Barcode -->
  <line x1="80" y1="980" x2="${width - 80}" y2="980" stroke="rgba(23,23,23,0.12)" stroke-width="1.5" />

  <g transform="translate(180, 1020)">
    <rect x="0" y="0" width="8" height="60" class="barcode-bar" />
    <rect x="14" y="0" width="4" height="60" class="barcode-bar" />
    <rect x="24" y="0" width="12" height="60" class="barcode-bar" />
    <rect x="42" y="0" width="6" height="60" class="barcode-bar" />
    <rect x="54" y="0" width="16" height="60" class="barcode-bar" />
    <rect x="76" y="0" width="4" height="60" class="barcode-bar" />
    <rect x="86" y="0" width="10" height="60" class="barcode-bar" />
    <rect x="102" y="0" width="18" height="60" class="barcode-bar" />
    <rect x="126" y="0" width="6" height="60" class="barcode-bar" />
    <rect x="138" y="0" width="12" height="60" class="barcode-bar" />
    <rect x="156" y="0" width="4" height="60" class="barcode-bar" />
    <rect x="166" y="0" width="14" height="60" class="barcode-bar" />
    <rect x="186" y="0" width="8" height="60" class="barcode-bar" />
    <rect x="200" y="0" width="16" height="60" class="barcode-bar" />
    <rect x="222" y="0" width="6" height="60" class="barcode-bar" />
    <rect x="234" y="0" width="10" height="60" class="barcode-bar" />
    <rect x="250" y="0" width="4" height="60" class="barcode-bar" />
    <rect x="260" y="0" width="18" height="60" class="barcode-bar" />
    <rect x="284" y="0" width="8" height="60" class="barcode-bar" />
    <rect x="298" y="0" width="14" height="60" class="barcode-bar" />
    <rect x="318" y="0" width="6" height="60" class="barcode-bar" />
    <rect x="330" y="0" width="12" height="60" class="barcode-bar" />
    <rect x="348" y="0" width="4" height="60" class="barcode-bar" />
    <rect x="358" y="0" width="18" height="60" class="barcode-bar" />
    <rect x="382" y="0" width="10" height="60" class="barcode-bar" />
    <rect x="398" y="0" width="6" height="60" class="barcode-bar" />
    <rect x="410" y="0" width="14" height="60" class="barcode-bar" />
    <rect x="430" y="0" width="8" height="60" class="barcode-bar" />
    <rect x="444" y="0" width="16" height="60" class="barcode-bar" />
    <rect x="466" y="0" width="4" height="60" class="barcode-bar" />
  </g>

  <g transform="translate(${width / 2}, 1120)">
    <text x="0" y="0" class="mono-label" style="font-size: 15px; fill: #99948B;">ADHIRAJ.XYZ · DIGITAL CABINET</text>
  </g>
</svg>
`;

  const backSvg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .bg { fill: #F4F1EA; }
      .border-line { stroke: rgba(23, 23, 23, 0.12); stroke-width: 2; fill: none; }
      .magnetic-stripe { fill: #1D1C1A; }
      .signature-panel { fill: #FAF8F5; stroke: rgba(23, 23, 23, 0.12); stroke-width: 1.5; }
      .sig-line { stroke: rgba(23, 23, 23, 0.08); stroke-width: 1; }
      .mono-label {
        font-family: 'Space Mono', 'Courier New', monospace;
        font-weight: 600;
        font-size: 18px;
        letter-spacing: 3px;
        fill: #77736B;
        text-anchor: middle;
      }
      .mono-sm {
        font-family: 'Space Mono', 'Courier New', monospace;
        font-size: 14px;
        letter-spacing: 1.5px;
        fill: #99948B;
        text-anchor: middle;
      }
      .barcode-bar { fill: rgba(23, 23, 23, 0.4); }
    </style>
  </defs>

  <rect width="${width}" height="${height}" class="bg" rx="28" />
  <rect x="24" y="24" width="${width - 48}" height="${height - 48}" class="border-line" rx="20" />

  <!-- Magnetic Stripe -->
  <rect x="24" y="140" width="${width - 48}" height="140" class="magnetic-stripe" />

  <!-- Signature / Specimen Area -->
  <rect x="60" y="340" width="${width - 120}" height="180" class="signature-panel" rx="10" />
  <line x1="80" y1="390" x2="${width - 80}" y2="390" class="sig-line" />
  <line x1="80" y1="440" x2="${width - 80}" y2="440" class="sig-line" />
  <text x="90" y="490" font-family="'Caveat', cursive, sans-serif" font-size="36" fill="#171717">adhiraj sengar</text>
  <text x="${width - 120}" y="490" class="mono-sm" style="text-anchor: end; font-size: 13px;">AUTHORIZED</text>

  <!-- Terms / Notes in minimal mono -->
  <g transform="translate(${width / 2}, 600)">
    <text x="0" y="0" class="mono-label">PERSONAL ACCESS PASS</text>
    <text x="0" y="40" class="mono-sm">PROPERTY OF ADHIRAJ SENGAR</text>
    <text x="0" y="70" class="mono-sm">INTERNET CABINET · ARCHIVE 2026</text>
    <text x="0" y="110" class="mono-sm">IF FOUND, PLEASE RETURN TO</text>
    <text x="0" y="140" class="mono-label" style="fill: #34581C; font-size: 20px;">ADHIRAJ.XYZ</text>
  </g>

  <!-- Bottom Barcode -->
  <line x1="80" y1="880" x2="${width - 80}" y2="880" stroke="rgba(23,23,23,0.12)" stroke-width="1.5" />

  <g transform="translate(180, 930)">
    <rect x="0" y="0" width="8" height="80" class="barcode-bar" />
    <rect x="14" y="0" width="4" height="80" class="barcode-bar" />
    <rect x="24" y="0" width="12" height="80" class="barcode-bar" />
    <rect x="42" y="0" width="6" height="80" class="barcode-bar" />
    <rect x="54" y="0" width="16" height="80" class="barcode-bar" />
    <rect x="76" y="0" width="4" height="80" class="barcode-bar" />
    <rect x="86" y="0" width="10" height="80" class="barcode-bar" />
    <rect x="102" y="0" width="18" height="80" class="barcode-bar" />
    <rect x="126" y="0" width="6" height="80" class="barcode-bar" />
    <rect x="138" y="0" width="12" height="80" class="barcode-bar" />
    <rect x="156" y="0" width="4" height="80" class="barcode-bar" />
    <rect x="166" y="0" width="14" height="80" class="barcode-bar" />
    <rect x="186" y="0" width="8" height="80" class="barcode-bar" />
    <rect x="200" y="0" width="16" height="80" class="barcode-bar" />
    <rect x="222" y="0" width="6" height="80" class="barcode-bar" />
    <rect x="234" y="0" width="10" height="80" class="barcode-bar" />
    <rect x="250" y="0" width="4" height="80" class="barcode-bar" />
    <rect x="260" y="0" width="18" height="80" class="barcode-bar" />
    <rect x="284" y="0" width="8" height="80" class="barcode-bar" />
    <rect x="298" y="0" width="14" height="80" class="barcode-bar" />
    <rect x="318" y="0" width="6" height="80" class="barcode-bar" />
    <rect x="330" y="0" width="12" height="80" class="barcode-bar" />
    <rect x="348" y="0" width="4" height="80" class="barcode-bar" />
    <rect x="358" y="0" width="18" height="80" class="barcode-bar" />
    <rect x="382" y="0" width="10" height="80" class="barcode-bar" />
    <rect x="398" y="0" width="6" height="80" class="barcode-bar" />
    <rect x="410" y="0" width="14" height="80" class="barcode-bar" />
    <rect x="430" y="0" width="8" height="80" class="barcode-bar" />
    <rect x="444" y="0" width="16" height="80" class="barcode-bar" />
    <rect x="466" y="0" width="4" height="80" class="barcode-bar" />
  </g>

  <text x="${width / 2}" y="1060" class="mono-label" style="font-size: 16px; letter-spacing: 5px;">001-2026-ADI-CABINET</text>
</svg>
`;

  await Promise.all([
    sharp(Buffer.from(frontSvg)).png().toFile(path.join(__dirname, '../src/assets/lanyard/card_face.png')),
    sharp(Buffer.from(backSvg)).png().toFile(path.join(__dirname, '../src/assets/lanyard/card_back.png'))
  ]);

  console.log('Generated card_face.png and card_back.png successfully!');
}

generateCardFaces().catch(console.error);
