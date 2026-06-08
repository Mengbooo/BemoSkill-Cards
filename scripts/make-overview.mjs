import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function loadPackage(name) {
  try {
    return require(name);
  } catch (error) {
    const roots = (process.env.NODE_PATH || "")
      .split(path.delimiter)
      .map((item) => item.trim())
      .filter(Boolean);

    for (const root of roots) {
      try {
        return require(path.join(root, name));
      } catch {
        // Try the next NODE_PATH entry.
      }
    }

    throw new Error(
      `Missing dependency "${name}". Run npm install in this skill repository, or set NODE_PATH to a node_modules directory. Original error: ${error.message}`
    );
  }
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith("--")) continue;
    const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
    args[key.slice(2)] = value;
  }
  return args;
}

async function listPngs(root) {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listPngs(full));
    } else if (entry.name.endsWith(".png") && entry.name !== "overview.png") {
      files.push(full);
    }
  }
  return files;
}

const args = parseArgs(process.argv.slice(2));
const root = path.resolve(args.root || "");
const out = path.resolve(args.out || path.join(root, "overview.png"));
const [thumbW, thumbH] = (args.thumb || "300x128").split("x").map(Number);
const cols = Number(args.cols || 5);
const gap = Number(args.gap || 16);
const labelH = Number(args["label-height"] || 34);
const background = args.background || "#111111";

if (!args.root) {
  throw new Error("Missing --root <dir>");
}

const sharp = loadPackage("sharp");
const files = (await listPngs(root)).sort();
const rows = Math.ceil(files.length / cols);
const composites = [];

for (let i = 0; i < files.length; i += 1) {
  const row = Math.floor(i / cols);
  const col = i % cols;
  const x = gap + col * (thumbW + gap);
  const y = gap + row * (thumbH + labelH + gap);
  const rel = path.relative(root, files[i]).replace(/\\/g, "/").replace(/\\.png$/, "");
  const input = await sharp(files[i])
    .resize(thumbW, thumbH, { fit: "contain", background: "#222222" })
    .png()
    .toBuffer();
  const label = Buffer.from(
    `<svg width="${thumbW}" height="${labelH}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#111"/><text x="8" y="22" fill="#fff" font-family="Arial" font-size="14">${rel}</text></svg>`
  );
  composites.push({ input: label, left: x, top: y });
  composites.push({ input, left: x, top: y + labelH });
}

await sharp({
  create: {
    width: cols * thumbW + (cols + 1) * gap,
    height: rows * (thumbH + labelH) + (rows + 1) * gap,
    channels: 3,
    background,
  },
})
  .composite(composites)
  .png()
  .toFile(out);

console.log(`Wrote ${out}`);
