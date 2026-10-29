/**
 * Downloads website marketing photos into assets/photos as webp.
 * Usage: node scripts/fetch-site-photos.mjs
 */
import { mkdir, writeFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "assets", "photos");
const BASE = "https://www.globalsponsorhub.com/_next/image";

const PHOTOS = [
  ["hero-walker.webp", "/marketing/gsh-hero-walker-2x.webp"],
  ["about-city.webp", "/marketing/editorial/about-city-conversation.jpg"],
  ["dublin.webp", "/marketing/graded/01-dublin.jpg"],
  ["arrival.webp", "/marketing/graded/03-arrival.jpg"],
  ["toronto.webp", "/marketing/graded/05-toronto.jpg"],
  ["sydney.webp", "/marketing/graded/06-sydney.jpg"],
  ["berlin.webp", "/marketing/graded/07-berlin.jpg"],
  ["amsterdam.webp", "/marketing/graded/09-amsterdam.jpg"],
  ["newyork.webp", "/marketing/graded/11-newyork.jpg"],
  ["specialists.webp", "/marketing/graded/13-specialists-hero.jpg"],
  ["relocation.webp", "/marketing/graded/14-relocation.jpg"],
  ["money.webp", "/marketing/graded/17-money.jpg"],
  ["employers.webp", "/marketing/graded/18-employers-hero.jpg"],
  ["talent-pool.webp", "/marketing/graded/19-talent-pool.jpg"],
  ["plan-hero.webp", "/marketing/graded/20-plan-hero.jpg"],
  ["plan-perks.webp", "/marketing/graded/21-plan-perks.jpg"],
  ["uk.webp", "/marketing/graded/22-uk-tile.jpg"],
  ["uae.webp", "/marketing/graded/23-uae-tile.jpg"],
];

await mkdir(OUT_DIR, { recursive: true });

let total = 0;
for (const [file, path] of PHOTOS) {
  const url = `${BASE}?url=${encodeURIComponent(path)}&w=828&q=80`;
  const res = await fetch(url, { headers: { Accept: "image/webp" } });
  if (!res.ok) {
    throw new Error(`Failed ${file}: HTTP ${res.status} for ${url}`);
  }
  const type = res.headers.get("content-type") || "";
  if (!type.includes("image/webp") && !type.includes("image/")) {
    // Some CDNs omit precise type; still require webp bytes when claimed.
  }
  const buf = Buffer.from(await res.arrayBuffer());
  // WebP files start with RIFF....WEBP
  const isWebp =
    buf.length > 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP";
  if (!isWebp && !type.includes("image/webp")) {
    throw new Error(`Failed ${file}: response is not image/webp (got ${type || "unknown"})`);
  }
  const out = join(OUT_DIR, file);
  await writeFile(out, buf);
  const size = (await stat(out)).size;
  total += size;
  console.log(`${file}\t${size} bytes`);
}

console.log(`Done: ${PHOTOS.length} files, ${(total / 1024 / 1024).toFixed(2)} MB total`);
