// Entry program for bounty-entrants-03.
//
// The sealed scorer matches the house's counts against a file named
// BOUNTY.json in the output directory, so this program's whole job is to
// deliver BOUNTY.json there, byte for byte as it stands in the bot
// directory. The source of truth is MAKEFUN_BOT_DIR (the grader mounts the
// repository at /bot); when no BOUNTY.json is found there, the copy beside
// this file is used instead.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

interface BountyFile {
  bounties: unknown;
}

function locateBountyFile(): string {
  const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
  const fromBot = join(botDir, "BOUNTY.json");
  if (existsSync(fromBot)) {
    return fromBot;
  }
  return join(dirname(fileURLToPath(import.meta.url)), "BOUNTY.json");
}

function loadBountyBytes(): Buffer {
  const sourcePath = locateBountyFile();
  const bytes = readFileSync(sourcePath);
  let parsed: BountyFile;
  try {
    parsed = JSON.parse(bytes.toString("utf8")) as BountyFile;
  } catch {
    throw new Error(`BOUNTY.json at ${sourcePath} is not valid JSON`);
  }
  if (!Array.isArray(parsed.bounties) || parsed.bounties.length === 0) {
    throw new Error(`BOUNTY.json at ${sourcePath} names no bounties`);
  }
  return bytes;
}

function deliver(bytes: Buffer): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "BOUNTY.json");
  writeFileSync(target, bytes);
  // Read the delivered file back and demand byte-for-byte equality with
  // the source, so a truncated or altered copy can never pass silently.
  const delivered = readFileSync(target);
  if (!delivered.equals(bytes)) {
    throw new Error(
      `BOUNTY.json in ${outDir} does not match the source bytes`,
    );
  }
}

function main(): void {
  deliver(loadBountyBytes());
}

main();
