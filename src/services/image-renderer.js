import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { config } from "../config.js";
import { ensureDir, escapeXml, slugify, timestampId } from "../utils.js";

const themeByVertical = {
  motivation: {
    backgroundA: "#fff7ed",
    backgroundB: "#fed7aa",
    accent: "#9a3412",
    text: "#1c1917",
  },
  fitness: {
    backgroundA: "#ecfeff",
    backgroundB: "#a5f3fc",
    accent: "#155e75",
    text: "#082f49",
  },
  finance: {
    backgroundA: "#f0fdf4",
    backgroundB: "#86efac",
    accent: "#166534",
    text: "#052e16",
  },
  startup: {
    backgroundA: "#eef2ff",
    backgroundB: "#c7d2fe",
    accent: "#3730a3",
    text: "#1e1b4b",
  },
};

function splitLines(text, maxCharsPerLine = 18) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.slice(0, 7);
}

export async function renderThoughtImage({ quote, vertical }) {
  const theme = themeByVertical[vertical] ?? themeByVertical.motivation;
  const lines = splitLines(quote);
  const lineHeight = 88;
  const startY = 420 - Math.floor((lines.length - 1) * lineHeight * 0.5);

  const svg = `
  <svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1080" y2="1080" gradientUnits="userSpaceOnUse">
        <stop stop-color="${theme.backgroundA}" />
        <stop offset="1" stop-color="${theme.backgroundB}" />
      </linearGradient>
    </defs>
    <rect width="1080" height="1080" fill="url(#bg)" />
    <circle cx="920" cy="180" r="220" fill="${theme.accent}" fill-opacity="0.08" />
    <circle cx="140" cy="920" r="240" fill="${theme.accent}" fill-opacity="0.08" />
    <rect x="70" y="70" width="940" height="940" rx="48" fill="white" fill-opacity="0.38" />
    <text x="120" y="160" fill="${theme.accent}" font-size="36" font-family="Arial, Helvetica, sans-serif" font-weight="700" letter-spacing="4">
      ${escapeXml(config.brandName.toUpperCase())}
    </text>
    <text x="120" y="240" fill="${theme.text}" font-size="28" font-family="Arial, Helvetica, sans-serif" font-weight="600" opacity="0.7">
      ${escapeXml(vertical.toUpperCase())} THOUGHT OF THE DAY
    </text>
    ${lines
      .map(
        (line, index) => `
      <text x="120" y="${startY + index * lineHeight}" fill="${theme.text}" font-size="62" font-family="Georgia, Times New Roman, serif" font-weight="700">
        ${escapeXml(line)}
      </text>`,
      )
      .join("\n")}
    <line x1="120" y1="850" x2="320" y2="850" stroke="${theme.accent}" stroke-width="10" stroke-linecap="round" />
    <text x="120" y="920" fill="${theme.text}" font-size="30" font-family="Arial, Helvetica, sans-serif" font-weight="500" opacity="0.7">
      Generated daily for Instagram
    </text>
  </svg>`;

  const outputDir = path.resolve("output");
  await ensureDir(outputDir);

  const fileName = `${timestampId()}-${slugify(vertical)}.png`;
  const filePath = path.join(outputDir, fileName);

  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  await fs.writeFile(filePath, png);

  return filePath;
}
