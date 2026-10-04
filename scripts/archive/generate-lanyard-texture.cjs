const sharp = require('sharp');
const path = require('path');

// Single repeating tile for the strap
const width = 900;
const height = 180;

const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .bg { fill: #A8CB7C; }
      .stitch { stroke: #8FB561; stroke-width: 3.5; stroke-dasharray: 8,6; }
      .edge { stroke: #7EA84D; stroke-width: 5; }
      .text {
        font-family: 'Space Mono', 'Courier New', monospace;
        font-weight: 700;
        font-size: 26px;
        letter-spacing: 3px;
        fill: #2D4D16;
        text-anchor: middle;
        dominant-baseline: central;
      }
    </style>
  </defs>

  <!-- Sage green strap background -->
  <rect width="${width}" height="${height}" class="bg" />

  <!-- Outer edge borders -->
  <line x1="0" y1="2.5" x2="${width}" y2="2.5" class="edge" />
  <line x1="0" y1="${height - 2.5}" x2="${width}" y2="${height - 2.5}" class="edge" />

  <!-- Stitching lines near edges -->
  <line x1="0" y1="14" x2="${width}" y2="14" class="stitch" />
  <line x1="0" y1="${height - 14}" x2="${width}" y2="${height - 14}" class="stitch" />

  <!-- Single cleanly centered text unit with bullet separator for seamless tiling -->
  <text x="${width / 2}" y="${height / 2}" class="text">ADHIRAJ SENGAR · ARCHIVE 2026 ·</text>
</svg>
`;

sharp(Buffer.from(svg))
  .png()
  .toFile(path.join(__dirname, '../src/assets/lanyard/lanyard.png'))
  .then(info => console.log('Generated lanyard.png successfully:', info))
  .catch(err => console.error(err));
