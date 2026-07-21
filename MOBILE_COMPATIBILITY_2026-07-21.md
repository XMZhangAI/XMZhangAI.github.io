# Mobile compatibility update

This release preserves the desktop visual system while rebuilding narrow-screen behavior for the homepage, MetaMind dossier, both field notes, interactive research figures, tables, formulas, and navigation.

## What changed

- Page-level width containment prevents any component from widening the document viewport.
- Long headings, citations, links, and captions wrap safely on narrow screens.
- MetaMind figures reflow into single-column narratives instead of retaining desktop grids.
- The cross-model comparison and long-horizon trace now scale to the phone viewport.
- KaTeX blocks keep equation-level touch scrolling without forcing the whole article sideways.
- Wide evidence tables remain locally scrollable with momentum scrolling.
- The MetaMind stage trace becomes a vertical, touch-friendly control below 520 px.
- Dossier artwork uses mobile aspect ratios so captions remain legible without extreme cropping.
- The full-screen mobile navigation respects safe-area insets and allows vertical scrolling.

## Verification

```bash
npm ci
npm run verify
```

`npm run verify` performs Astro type checking, builds every route, validates local links and social metadata, and runs the mobile layout contract checks.

Recommended final device checks: 320×568, 375×812, 390×844, 430×932, 768×1024, and desktop 1440×900.
