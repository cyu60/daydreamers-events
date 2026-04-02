# DayDreamers Design System

Extracted from: daydreamers-materials, daydreamers-judges, imedia-proposal, ateo-proposal, ara-proposal, eylar-proposal.

---

## Colors

### Core Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `--ink` | `#10111a` | Primary text, headings |
| `--ink-soft` | `#23263a` | Secondary text, soft BG |
| `--paper` | `#f4efe8` | Page background |
| `--card` | `#fbf7f1` | Card backgrounds |
| `--cobalt` | `#2652e6` | Primary accent (buttons, links) |
| `--cobalt-soft` | `#dfe7ff` | Light accent backgrounds |
| `--gold` | `#d3a14a` | Secondary accent (badges, CTAs) |
| `--dust` | `#70675f` | Muted text |
| `--border` | `rgba(16,17,26,0.10)` | Borders, dividers |
| `--border-strong` | `rgba(16,17,26,0.12)` | Emphasized borders |

### Background Gradient
```css
background:
  radial-gradient(circle at 0% 0%, rgba(38,82,230,.14), transparent 30%),
  radial-gradient(circle at 100% 0%, rgba(211,161,74,.18), transparent 28%),
  linear-gradient(180deg, #f6f1e9 0%, #eee6da 100%);
```

### Grain Overlay
```css
background-image: url("data:image/svg+xml,..."); /* SVG noise */
opacity: 0.025–0.04;
```

---

## Typography

### Fonts
| Role | Family | Weight |
|------|--------|--------|
| Display / Headings | DM Serif Display | 400 |
| Body / UI | DM Sans | 400, 500, 600 |
| Mono / Code | DM Mono | 400 |

### Scale
| Element | Size | Weight | Extra |
|---------|------|--------|-------|
| H1 (hero) | `clamp(2.4rem, 5vw, 3.8rem)` | 400 | DM Serif Display |
| H2 (section) | `clamp(1.8rem, 3vw, 2.3rem)` | 400 | DM Serif Display |
| H3 (card) | 1.12rem–1.2rem | 600 | DM Sans |
| Body | 0.95rem–1.05rem | 400 | line-height: 1.7 |
| Small / Label | 0.78rem–0.85rem | 600 | letter-spacing: 0.12em, uppercase |
| Eyebrow | 0.72rem | 700 | letter-spacing: 0.16em, uppercase |

---

## Spacing

| Token | Value |
|-------|-------|
| Section padding | 72px 0 (desktop), 48px 0 (mobile) |
| Card padding | 18px–24px |
| Card gap | 18px–22px |
| Hero gap | 34px |
| Container max-width | 1180px |
| Content max-width | 800px |
| Page inline padding | 32px (desktop), 12px (mobile) |

---

## Border Radius

| Context | Value |
|---------|-------|
| Default (cards, inputs) | 14px |
| Large (hero cards, CTAs) | 28px–36px |
| Pills / Tags | 999px |
| Buttons | 999px |

---

## Shadows

```css
/* Card default */
box-shadow: 0 1px 4px rgba(38,82,230,0.04);

/* Card hover */
box-shadow: 0 4px 18px rgba(38,82,230,0.09);

/* CTA blocks */
box-shadow: 0 2px 12px rgba(38,82,230,0.08);
```

---

## Components

### Buttons

**Primary (Cobalt)**
```css
background: var(--cobalt);
color: #fff;
border: none;
border-radius: 999px;
padding: 13px 36px;
font: 600 0.98rem DM Sans;
letter-spacing: 0.04em;
transition: background 0.16s, transform 0.16s;
```
Hover: `background: #1a3ec2; transform: translateY(-1px);`

**Secondary (Outline)**
```css
background: transparent;
color: var(--cobalt);
border: 1.5px solid var(--cobalt);
border-radius: 999px;
padding: 12px 32px;
```

**Gold**
```css
background: var(--gold);
color: #fff;
border-radius: 999px;
padding: 13px 36px;
```

### Cards
```css
background: var(--card);
border: 1px solid var(--border);
border-radius: 14px;
padding: 22px 24px;
transition: box-shadow 0.25s, transform 0.25s;
```
Hover: `transform: translateY(-2px); box-shadow: 0 4px 18px rgba(38,82,230,0.09);`

### Badges / Pills
```css
/* Tag badge */
background: var(--cobalt-soft);
color: var(--cobalt);
border-radius: 999px;
padding: 4px 14px;
font: 600 0.76rem DM Sans;
letter-spacing: 0.06em;

/* Gold badge */
background: rgba(211,161,74,0.13);
color: var(--gold);
```

### Eyebrow Label
```css
font: 700 0.72rem DM Sans;
letter-spacing: 0.16em;
text-transform: uppercase;
color: var(--cobalt);
display: flex;
align-items: center;
gap: 10px;
```
With `::before` line: `width: 28px; height: 2px; background: var(--cobalt);`

---

## Animations

### Fade Up (staggered entry)
```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to { opacity: 1; transform: translateY(0); }
}
.fade-up { animation: fadeUp 0.8s cubic-bezier(.23,1,.32,1) both; }
.fade-up.d1 { animation-delay: 0.2s; }
.fade-up.d2 { animation-delay: 0.4s; }
.fade-up.d3 { animation-delay: 0.6s; }
.fade-up.d4 { animation-delay: 0.8s; }
```

### Hero Glow
```css
@keyframes heroGlow {
  0% { opacity: 0.7; transform: scale(1); }
  100% { opacity: 1; transform: scale(1.12); }
}
/* 8s infinite alternate */
```

### Hover Transitions
- Buttons: `0.16s ease`
- Cards: `0.25s ease` with `translateY(-2px)`
- Links: `0.15s ease` color transition

---

## SVG Brand Mark (Moon Logo)

```svg
<svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M166 82c-8-4-17-6-27-6c-32 0-58 26-58 58s26 58 58 58c26 0 48-17 55-41c-7 4-16 6-25 6c-26 0-46-20-46-46c0-12 4-22 11-29c7-7 20-7 32 0z"
    stroke="#1c3fdc" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

Light variant: `stroke="#dfe7ff"`

---

## Responsive Breakpoints

| Breakpoint | Target |
|------------|--------|
| `980px` | Tablet — stack grids to 1 col |
| `720px` | Mobile — reduce padding, font sizes |
| `600px` | Small mobile — minimal padding |
