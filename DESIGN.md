# Design

## Color strategy

Restrained-leaning-Committed: tinted neutrals throughout, one brand hue
(green) carrying primary actions, active navigation, and the "profit" signal
so it reads as both "pitch" and "money" at once. Every neutral is tinted
toward the same green hue (chroma 0.004-0.016) instead of pure gray, so the
whole UI feels cohesive rather than "gray app with a green button bolted on."

All colors are defined in OKLCH as CSS custom properties in
`src/app/globals.css`, registered into Tailwind's `@theme inline` so they're
usable as ordinary utility classes (`bg-brand`, `text-muted-foreground`,
`border-border`, etc.) rather than hardcoded per-component hex/named colors.

## Palette (light / dark pairs)

| Token | Role | Light | Dark |
|---|---|---|---|
| `background` | Page background | `oklch(98.5% 0.004 150)` | `oklch(17% 0.01 150)` |
| `foreground` | Body text | `oklch(19% 0.012 150)` | `oklch(95% 0.006 150)` |
| `surface` | Cards, table rows | `oklch(100% 0 0)` | `oklch(21% 0.012 150)` |
| `surface-secondary` | Nav bar, table headers | `oklch(96.5% 0.008 150)` | `oklch(24.5% 0.014 150)` |
| `border` | Hairline borders/dividers | `oklch(89% 0.008 150)` | `oklch(32% 0.016 150)` |
| `muted-foreground` | Secondary text | `oklch(48% 0.014 150)` | `oklch(68% 0.012 150)` |
| `brand` | Primary buttons, active nav | `oklch(46% 0.15 150)` | `oklch(52% 0.16 150)` |
| `brand-strong` | Hover/pressed | `oklch(40% 0.14 150)` | `oklch(58% 0.15 150)` |
| `brand-subtle` | Tinted highlight backgrounds | `oklch(93% 0.045 150)` | `oklch(28% 0.06 150)` |
| `brand-text` | Green text/icons on a plain surface | `oklch(38% 0.14 150)` | `oklch(72% 0.14 150)` |
| `brand-foreground` | Text on a solid brand background | `oklch(99% 0.004 150)` | `oklch(99% 0.004 150)` |

Semantic states (`success`/`danger`/`warning`/`info`, each with a `-subtle`
background variant) follow the same light/dark pattern — `success` is
aliased to `brand-text` since "won"/positive profit and the brand color are
the same idea in this app. `danger` is a warm red (hue 25), `warning` an
amber (hue 70-75), `info` a cool blue (hue 235-240), each tuned to the same
lightness/chroma relationship as brand across themes.

## Typography

Geist Sans (already in place via `next/font`) for everything — one family
carries headings, labels, buttons, and data, per product-register defaults.
No display font. Weight and size carry hierarchy, not a second typeface.

## Components

- **Status badges** (`ResultBadge`): color + a small inline SVG icon
  (check/cross/warning triangle/clock/equals/circle-slash) + the text
  label — status is never color-only, so it stays legible for colorblind
  users and matches the "win/loss reads instantly" principle in
  PRODUCT.md.
- **Buttons**: solid `bg-brand` for primary actions (save bet, upload,
  sign in), outlined `border-brand text-brand-text` for secondary actions
  (sync results) — reserves the strongest color for the one action that
  matters most on a given screen.
- **Cards/tables**: `bg-surface` on `bg-background`, `border-border`
  hairlines, `bg-surface-secondary` for header rows/nav — no nested cards.
- **Charts** (Recharts): categorical palette anchored by brand green first,
  then harmonized OKLCH hues at matched lightness/chroma (see
  `src/components/summary/chartColors.ts`); grid lines, axis ticks, and
  tooltip chrome all pull from the same CSS custom properties so charts
  stay in sync with light/dark theme automatically.

## Motion

Minimal — transition-colors on hover/active states only (150-200ms,
default Tailwind `transition`), no page-load choreography, no animated
layout properties.
