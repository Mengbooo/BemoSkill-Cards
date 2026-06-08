---
name: bemoskill-cards
description: Generate BemoSkill dark/light social card systems for Xiaohongshu/Rednote 3:4 carousels, WeChat official account covers, and X/Twitter headers from article titles, notes, product ideas, or technical content. Use when the user asks for BemoSkill-Cards, 小红书封面/正文卡片, 微信公众号封面, 推特/X 封面, dark/light social cards, ReactGo-style cards, or reusable social cover workflows.
---

# BemoSkill Cards

Create reusable social card and cover packages with deterministic HTML/CSS rendering. The default visual system has two modes:

- **Dark**: black background, white type, sparse grid, Vercel-like technical clarity.
- **Light**: warm paper background, charcoal type, restrained accent, Anthropic-like editorial calm.

Prefer local HTML/CSS rendering over image generation when exact Chinese text, logo placement, and platform dimensions matter.

## Outputs

Use this skill for:

- Xiaohongshu/Rednote portrait card sets: `1080x1440`.
- WeChat official account covers: `900x383`.
- X/Twitter headers: `1500x500`.
- Paired dark/light variants for the same content.
- Brand/IP cards that must include a logo, tag, signature, or slogan.

Do not use this skill for pure photo editing, logo design, or long slide decks.

## Required References

Load only what is needed:

- `references/platform-specs.md` for dimensions, output naming, and folder conventions.
- `references/style-system.md` for dark/light visual rules.
- `references/workflow.md` for intake, copy planning, rendering, and QA.

## Workflow

1. **Intake**
   - Confirm platforms: Xiaohongshu, WeChat, X/Twitter, or all.
   - Confirm style mode: `dark`, `light`, or both.
   - Collect title/topic, subtitle, tags, logo path, slogan/signature, and hard text.
   - If content involves current facts, browse and cite sources.

2. **Plan**
   - For carousels, make 5-10 pages: cover plus one idea per card.
   - For platform covers, make 3-5 title/topic variants per platform unless the user gives exact titles.
   - Remove page numbers from standalone covers.

3. **Build**
   - Start from templates in `assets/templates/`.
   - Replace copy and logo references. Keep dimensions unchanged.
   - Keep all primary text left-aligned.
   - Avoid dense decoration. For dark mode, no white ornamental dots in corners. For light mode, keep the paper background quiet.

4. **Render**
   - Use `scripts/render-html-assets.mjs` to screenshot `.card` or `.cover-card` nodes.
   - Use `scripts/make-overview.mjs` for a contact sheet.
   - Save under `output/<style>/<platform>/` or a user-requested folder.

5. **Verify**
   - Check PNG dimensions with `file`.
   - Inspect at least one representative image per style/platform.
   - Confirm no text overflow, no accidental page numbers on standalone covers, and no missing logo.

## Template Commands

Render the included templates:

```bash
npm run render:xhs-dark
npm run render:xhs-light
npm run render:platform
npm run overview:platform
```

For a custom HTML file:

```bash
node scripts/render-html-assets.mjs \
  --html path/to/index.html \
  --out output/custom \
  --selector .cover-card \
  --group-attrs data-style,data-platform \
  --viewport 1600x900
```
