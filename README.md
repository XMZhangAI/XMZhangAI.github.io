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
- `/blog/MetaMind/` — MetaMind dossier
- `/blog/MetaMind/technical-contribution/` — evidence-led technical account
- `/blog/MetaMind/cognitive-frontier/` — cognitive architecture, self-evolvement, cognitive worlds, and super-world games
- `/connect/` — private CV and opportunity contact route
- `/privacy/` — privacy configuration

## Production output

`dist/` is included in the review ZIP and is reproducible with `npm run build`.

## Operations

- Domain, Stanford redirect, and social cards: [DOMAIN_AND_SHARING_中文.md](DOMAIN_AND_SHARING_中文.md)
- First-party analytics dashboard: [ANALYTICS_BACKEND_中文.md](ANALYTICS_BACKEND_中文.md)
- What changed in this release: [RELEASE_NOTES_v3_中文.md](RELEASE_NOTES_v3_中文.md)
- CV is intentionally absent from the public build; the interface routes requests to `/connect/`.

© 2026 Xuanming Zhang.
