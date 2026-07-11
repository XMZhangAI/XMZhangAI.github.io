# Xuanming Zhang — AI Research Website

A clean, production-built research website centered on three questions: where reasoning happens, what a model must understand, and what changes across time.

## Quick review

- Windows: double-click `CHECK_WEBSITE_WINDOWS.bat`
- macOS/Linux: run `./CHECK_WEBSITE_MAC_LINUX.command`
- Manual: `npm run preview:dist`

Read [START_HERE_中文.md](START_HERE_中文.md) for step-by-step instructions.

## Development

```bash
npm install
npm run dev
```

Production verification:

```bash
npm run check
npm run build
npm run preview:dist
```

## Architecture

- Astro 7 static output
- Local variable fonts; no runtime font/CDN dependency
- Semantic HTML and progressive vanilla TypeScript interaction
- No service worker and no cache-first runtime
- GitHub Actions deployment to Pages
- Analytics disabled by default

## Content routes

- `/` — research thesis, interactive instrument, systems, publications, trajectory
- `/projects/mariolm/` — MarioLM system dossier
- `/notes/` — field-note index
- `/blog/MetaMind/` — MetaMind dossier and two Chinese essays
- `/privacy/` — privacy configuration

## Production output

`dist/` is included in the review ZIP and is reproducible with `npm run build`.

© 2026 Xuanming Zhang.
