const sharp = require('sharp');
const path = require('path');

const width = 1025;
const height = 250;

// SVG with sage green background, edge stitching, and repeating mono text
const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .bg { fill: #A8CB7C; }
      .stitch { stroke: #8FB561; stroke-width: 4; stroke-dasharray: 10,6; }
      .edge { stroke: #7EA84D; stroke-width: 6; }
      .text {
        font-family: 'Space Mono', 'Courier New', monospace;
        font-weight: 700;
        font-size: 36px;
        letter-spacing: 4px;
        fill: #34581C;
        text-anchor: middle;
        dominant-baseline: central;
      }
    </style>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" class="bg" />

  <!-- Outer edge borders -->
  <line x1="0" y1="3" x2="${width}" y2="3" class="edge" />
  <line x1="0" y1="${height - 3}" x2="${width}" y2="${height - 3}" class="edge" />

  <!-- Stitching lines near edges -->
  <line x1="0" y1="18" x2="${width}" y2="18" class="stitch" />
  <line x1="0" y1="${height - 18}" x2="${width}" y2="${height - 18}" class="stitch" />

  <!-- Repeating text: 2 segments seamlessly tiling -->
  <g transform="translate(256, 125)">
    <text class="text">ADHIRAJ SENGAR · ARCHIVE 2026</text>
  </g>
  <g transform="translate(768, 125)">
    <text class="text">ADHIRAJ SENGAR · ARCHIVE 2026</text>
  </g>
</svg>
`;

sharp(Buffer.from(svg))
  .png()
  .toFile(path.join(__dirname, '../src/assets/lanyard/lanyard.png'))
  .then(info => console.log('Generated lanyard.png successfully:', info))
  .catch(err => console.error(err));
