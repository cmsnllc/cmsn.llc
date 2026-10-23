import type { ReactElement } from "react";

const GLYPHS: Record<string, string[]> = {
  C: ["..####.", ".##..##", "##.....", "##.....", "##.....", ".##..##", "..####."],
  M: ["##...##", "###.###", "#######", "##.#.##", "##.#.##", "##...##", "##...##"],
  S: [".#####.", "##...##", "##.....", ".#####.", ".....##", "##...##", ".#####."],
  N: ["##...##", "###..##", "####.##", "##.####", "##..###", "##...##", "##...##"],
};
const LINES = ["CM", "SN"];
const GLYPH = 7;
const GAP = 1;
const MARGIN = 2;
const SIZE = MARGIN * 2 + GLYPH * 2 + GAP;

function rng(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function letterAt(x: number, y: number): number {
  const gx = x - MARGIN;
  const gy = y - MARGIN;
  if (gx < 0 || gy < 0 || gx >= SIZE - MARGIN * 2 || gy >= SIZE - MARGIN * 2) return -1;
  const col = Math.floor(gx / (GLYPH + GAP));
  const row = Math.floor(gy / (GLYPH + GAP));
  const cx = gx % (GLYPH + GAP);
  const cy = gy % (GLYPH + GAP);
  if (cx >= GLYPH || cy >= GLYPH) return -1;
  return GLYPHS[LINES[row][col]][cy][cx] === "#" ? row * LINES[0].length + col : -1;
}

const SUB = 3;
const STEPS = 16;

export function PixelMark({ label, className }: { label: string; className?: string }) {
  const rand = rng(2018_11_01);
  const noise = [];
  const letters: ReactElement[][] = LINES.join("").split("").map(() => []);
  for (let y = 0; y < SIZE * SUB; y++) {
    for (let x = 0; x < SIZE * SUB; x++) {
      const letter = letterAt(Math.floor(x / SUB), Math.floor(y / SUB));
      const r = rand();
      if (letter >= 0) {
        const d = 4 + Math.floor(r * (STEPS - 5));
        letters[letter].push(<rect key={`${x}-${y}`} className={`px-on px-d${d}`} x={x} y={y} />);
      } else if (r < 0.22) {
        const d = Math.floor(rand() * (STEPS - 4));
        noise.push(<rect key={`${x}-${y}`} className={`px-noise px-d${d}`} x={x} y={y} />);
      }
    }
  }
  return (
    <svg
      className={className}
      viewBox={`0 0 ${SIZE * SUB} ${SIZE * SUB}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
    >
      {noise}
      {letters.map((rects, i) => (
        <g key={i} className={`px-letter px-letter-${i}`}>
          {rects}
        </g>
      ))}
    </svg>
  );
}
