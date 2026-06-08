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

const args = parseArgs(process.argv.slice(2));
const htmlPath = path.resolve(args.html || "");
const outputDir = path.resolve(args.out || "output/rendered");
const selector = args.selector || ".card";
const nameAttr = args["name-attr"] || "data-name";
const groupAttrs = (args["group-attrs"] || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const viewport = (args.viewport || "1600x1600").split("x").map(Number);

if (!args.html) {
  throw new Error("Missing --html <file>");
}

const { chromium } = loadPackage("playwright");
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: viewport[0] || 1600, height: viewport[1] || 1600 },
  deviceScaleFactor: Number(args.scale || 1),
});

await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.addStyleTag({
  content: `
    @media screen {
      body { background: ${args.background || "#111"} !important; }
      .stage { display: block !important; padding: 0 !important; }
      ${selector} { transform: none !important; margin: 0 !important; }
      ${selector}:not(.active) { display: none !important; }
    }
  `,
});

const items = await page.locator(selector).evaluateAll((nodes, payload) => {
  const { nameAttr, groupAttrs } = payload;
  return nodes.map((node, index) => ({
    index,
    name: node.getAttribute(nameAttr) || String(index + 1).padStart(2, "0"),
    groups: groupAttrs.map((attr) => node.getAttribute(attr) || "default"),
  }));
}, { nameAttr, groupAttrs });

for (const item of items) {
  await page.locator(selector).evaluateAll((nodes, activeIndex) => {
    for (let i = 0; i < nodes.length; i += 1) {
      nodes[i].classList.toggle("active", i === activeIndex);
    }
  }, item.index);

  const dir = path.join(outputDir, ...item.groups);
  await fs.mkdir(dir, { recursive: true });
  await page.locator(`${selector}.active`).screenshot({
    path: path.join(dir, `${item.name}.png`),
    omitBackground: false,
  });
}

await browser.close();
console.log(`Exported ${items.length} assets to ${outputDir}`);
