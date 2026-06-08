# Production Workflow

## Intake Checklist

- Target platforms and count.
- Dark, light, or both.
- Logo path and whether to include a slogan.
- Exact title/subtitle/tag text.
- Whether the output should preserve previous generated assets or replace them.

## Copy Planning

- Make cover titles short enough to read at thumbnail size.
- Keep subtitles under one sentence.
- For carousel bodies, one idea per card.
- For platform covers, create one whole-content cover per style/platform. Do not create one cover per subtopic.
- Remove pagination and use topic tags instead.

## Rendering

Use the generic renderer:

```bash
node scripts/render-html-assets.mjs \
  --html assets/templates/platform-covers.html \
  --out output/platform-covers \
  --selector .cover-card \
  --group-attrs data-style,data-platform \
  --viewport 1600x900 \
  --clean true
```

Generate an overview:

```bash
node scripts/make-overview.mjs \
  --root output/platform-covers \
  --out output/platform-covers/overview.png \
  --thumb 300x128 \
  --cols 4
```

## QA

- Run `file output/**/*.png` or `find output -name '*.png' -print0 | xargs -0 file`.
- Inspect an overview image.
- Open at least one full-size image per size and style.
- Fix text overflow, clipped logos, misaligned title/tag blocks, or stale labels before final delivery.
