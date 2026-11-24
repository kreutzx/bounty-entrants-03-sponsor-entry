// Entry program for bounty-entrants-03.
//
// Reads BOUNTY.json (next to this file), which names @kreutzx's sponsored
// bounty competitions, and writes a one-line summary of them to
// entry.txt in the output directory.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

interface BountyFile {
  bounties: string[];
}

const BOUNTY_URL_PREFIX = "https://make.fun/bounty/";

function slugOf(url: string): string {
  return url.startsWith(BOUNTY_URL_PREFIX)
    ? url.slice(BOUNTY_URL_PREFIX.length)
    : url;
}

function main(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const raw = readFileSync(join(here, "BOUNTY.json"), "utf8");
  const data = JSON.parse(raw) as BountyFile;
  const slugs = data.bounties.map(slugOf);
  const line = `Sponsored by @kreutzx for bounty-entrants-03: ${slugs.join(", ")}`;
  const outDir = process.env.OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "entry.txt"), line + "\n", "utf8");
}

main();
