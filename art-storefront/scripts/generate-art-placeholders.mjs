#!/usr/bin/env node
// Generates deterministic, abstract SVG placeholders for the mock catalog in
// data/artworks.json, plus a handful of site images (hero, artist portrait).
// These stand in for real photography in Phase 1 and should be swapped for
// actual studio photos before launch.

import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const artworks = JSON.parse(
  await import("node:fs/promises").then((fs) =>
    fs.readFile(path.join(root, "data/artworks.json"), "utf8")
  )
);

const outDir = path.join(root, "public/images/art");
const siteDir = path.join(root, "public/images/site");
mkdirSync(outDir, { recursive: true });
mkdirSync(siteDir, { recursive: true });

// Small seeded PRNG so re-running the script produces identical output.
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

const PALETTES = {
  painting: [
    ["#f4ede1", "#d98a5f", "#8a3b2b", "#f1c56b"],
    ["#eef1ec", "#5f7a63", "#2c3d31", "#c9d6a8"],
    ["#f3e7e1", "#b95c50", "#5a2a27", "#e8b4a2"],
    ["#eceef4", "#5c6ea3", "#2b3357", "#a9b7d9"],
  ],
  sculpture: [
    ["#eeeae4", "#a68a6d", "#4a3c2e", "#cbb69a"],
    ["#e9e6e1", "#7d7568", "#332e27", "#b7ab97"],
    ["#efe7de", "#b2673f", "#5c3320", "#dba178"],
    ["#e7e9ea", "#6c7578", "#2e3436", "#a6afb2"],
  ],
  print: [
    ["#faf8f4", "#c98f5e", "#7a4a2b", "#e7c9a3"],
    ["#f8f9f6", "#7f9b7a", "#3a4d38", "#c3d3b9"],
    ["#f9f6f4", "#b06a63", "#63302b", "#dfb3ac"],
  ],
};

function paletteFor(slug, category) {
  const set = PALETTES[category] || PALETTES.painting;
  const rng = mulberry32(hashString(slug));
  return set[Math.floor(rng() * set.length) % set.length];
}

function aspectFor(artwork) {
  const { height, width } = artwork.dimensions;
  if (artwork.category === "sculpture") return { w: 1200, h: 1400 };
  const ratio = width / height;
  if (ratio >= 1.15) return { w: 1500, h: 1150 }; // landscape
  if (ratio <= 0.85) return { w: 1150, h: 1500 }; // portrait
  return { w: 1300, h: 1300 }; // square-ish
}

function paintingShapes(rng, w, h, colors, view) {
  const [, mid, dark, light] = colors;
  const bands = [];
  const count = view === "detail" ? 3 : 6;
  for (let i = 0; i < count; i++) {
    const y = (h / count) * i + rng() * (h / count) * 0.3;
    const bandH = h / count + rng() * 40 - 20;
    const colorPool = [mid, dark, light];
    const color = colorPool[Math.floor(rng() * colorPool.length)];
    const opacity = 0.55 + rng() * 0.35;
    const curve = rng() * 60 - 30;
    bands.push(
      `<path d="M0,${y} Q${w / 2},${y + curve} ${w},${y} L${w},${
        y + bandH
      } Q${w / 2},${y + bandH + curve} 0,${y + bandH} Z" fill="${color}" opacity="${opacity.toFixed(
        2
      )}" />`
    );
  }
  const blobCount = view === "detail" ? 5 : 3;
  for (let i = 0; i < blobCount; i++) {
    const cx = rng() * w;
    const cy = rng() * h;
    const r = (view === "detail" ? 0.18 : 0.1) * Math.min(w, h) * (0.6 + rng());
    const color = [mid, dark, light][Math.floor(rng() * 3)];
    bands.push(
      `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(
        0
      )}" fill="${color}" opacity="${(0.25 + rng() * 0.3).toFixed(2)}" />`
    );
  }
  return bands.join("\n");
}

function sculptureShapes(rng, w, h, colors, view) {
  const [, mid, dark, light] = colors;
  const cx = w / 2 + (rng() * 60 - 30);
  const baseY = h * 0.82;
  const shapes = [];
  const rotation = { front: 0, side: 90, back: 180, detail: 45 }[view] ?? 0;
  const layerCount = view === "detail" ? 2 : 5;
  for (let i = 0; i < layerCount; i++) {
    const t = i / layerCount;
    const layerW = (w * 0.5 - t * w * 0.28) * (view === "detail" ? 1.6 : 1);
    const layerH = h * 0.1;
    const y = baseY - t * h * 0.62;
    const skew = Math.sin((rotation * Math.PI) / 180) * 18;
    const color = [mid, dark][i % 2];
    shapes.push(
      `<ellipse cx="${(cx + skew).toFixed(0)}" cy="${y.toFixed(
        0
      )}" rx="${layerW.toFixed(0)}" ry="${layerH.toFixed(0)}" fill="${color}" opacity="${(
        0.75 - t * 0.25
      ).toFixed(2)}" />`
    );
  }
  // A soft radial "light" to suggest volume/lighting from one side.
  const lightX = view === "back" ? w * 0.25 : w * 0.72;
  shapes.push(
    `<ellipse cx="${lightX.toFixed(0)}" cy="${(h * 0.35).toFixed(
      0
    )}" rx="${(w * 0.3).toFixed(0)}" ry="${(h * 0.4).toFixed(
      0
    )}" fill="${light}" opacity="0.25" />`
  );
  return shapes.join("\n");
}

function printShapes(rng, w, h, colors, view) {
  const [, mid, dark, light] = colors;
  const marginX = w * 0.12;
  const marginY = h * 0.12;
  const shapes = [
    `<rect x="${marginX}" y="${marginY}" width="${w - marginX * 2}" height="${
      h - marginY * 2
    }" fill="none" stroke="${dark}" stroke-width="2" opacity="0.35" />`,
  ];
  const lineCount = view === "detail" ? 10 : 5;
  for (let i = 0; i < lineCount; i++) {
    const y = marginY + ((h - marginY * 2) / lineCount) * i + rng() * 20;
    const color = [mid, dark, light][Math.floor(rng() * 3)];
    shapes.push(
      `<line x1="${marginX + rng() * 30}" y1="${y.toFixed(0)}" x2="${
        w - marginX - rng() * 30
      }" y2="${(y + (rng() * 40 - 20)).toFixed(0)}" stroke="${color}" stroke-width="${(
        2 + rng() * 6
      ).toFixed(1)}" opacity="0.7" stroke-linecap="round" />`
    );
  }
  return shapes.join("\n");
}

function buildSvg(artwork, image) {
  const { w, h } = aspectFor(artwork);
  const colors = paletteFor(artwork.slug, artwork.category);
  const [bg] = colors;
  const rng = mulberry32(hashString(artwork.slug + "|" + image.src));

  let body = "";
  if (artwork.category === "painting") {
    body = paintingShapes(rng, w, h, colors, image.view);
  } else if (artwork.category === "sculpture") {
    body = sculptureShapes(rng, w, h, colors, image.view);
  } else {
    body = printShapes(rng, w, h, colors, image.view);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${escapeXml(
    image.alt
  )}">
  <rect width="${w}" height="${h}" fill="${bg}" />
  ${body}
</svg>`;
}

function escapeXml(str) {
  return str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

let written = 0;
for (const artwork of artworks) {
  for (const image of artwork.images) {
    const svg = buildSvg(artwork, image);
    const filePath = path.join(root, "public", image.src.replace(/^\//, ""));
    writeFileSync(filePath, svg, "utf8");
    written++;
  }
}

// A few standalone site images (hero, artist portrait, studio) that aren't
// tied to a single catalog piece.
const siteImages = [
  {
    file: "hero.svg",
    w: 1800,
    h: 1200,
    seed: "site-hero",
    palette: PALETTES.painting[0],
    kind: "painting",
    alt: "Abstract warm-toned hero artwork",
  },
  {
    file: "artist-portrait.svg",
    w: 1000,
    h: 1250,
    seed: "site-artist-portrait",
    palette: PALETTES.sculpture[0],
    kind: "portrait",
    alt: "Placeholder portrait silhouette of the artist in the studio",
  },
  {
    file: "studio-wall.svg",
    w: 1600,
    h: 1100,
    seed: "site-studio-wall",
    palette: PALETTES.print[1],
    kind: "sculpture",
    alt: "Placeholder studio wall with works in progress",
  },
];

for (const img of siteImages) {
  const rng = mulberry32(hashString(img.seed));
  let body;
  if (img.kind === "portrait") {
    const [, mid, dark, light] = img.palette;
    body = `
      <ellipse cx="${img.w * 0.5}" cy="${img.h * 0.38}" rx="${img.w * 0.18}" ry="${
      img.h * 0.22
    }" fill="${mid}" opacity="0.9" />
      <path d="M${img.w * 0.22},${img.h} Q${img.w * 0.5},${img.h * 0.55} ${
      img.w * 0.78
    },${img.h} Z" fill="${dark}" opacity="0.85" />
      <ellipse cx="${img.w * 0.68}" cy="${img.h * 0.3}" rx="${img.w * 0.25}" ry="${
      img.h * 0.3
    }" fill="${light}" opacity="0.2" />
    `;
  } else if (img.kind === "sculpture") {
    body = sculptureShapes(rng, img.w, img.h, img.palette, "front");
  } else {
    body = paintingShapes(rng, img.w, img.h, img.palette, "front");
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${img.w} ${img.h}" width="${img.w}" height="${img.h}" role="img" aria-label="${escapeXml(
    img.alt
  )}">
  <rect width="${img.w}" height="${img.h}" fill="${img.palette[0]}" />
  ${body}
</svg>`;
  writeFileSync(path.join(siteDir, img.file), svg, "utf8");
  written++;
}

console.log(`Generated ${written} placeholder SVGs.`);
