# Kantaka Śodhana — Project Handoff

**Goal:** Awwwards SOTD submission — AI & MLOps fraud detection platform website  
**Stack:** Next.js 16.2.4 (App Router, Turbopack) · React 19 · Tailwind CSS 4 · Framer Motion · WebGL (raw)  
**Status as of handoff:** ~65% to Awwwards nomination level

---

## 1. What Is This

Single-page marketing site for Kantaka Śodhana — an AI/MLOps platform for fraud detection. Named after the classical Indian governance concept of "removing thorns" (antisocial actors from the marketplace).

Design language:
- Dark theme (`#030305` bg) with orange accent (`#FF4D00`)
- Geist Mono font throughout (monospace = technical credibility)
- Noto Sans Devanagari for Sanskrit script elements
- CSS variables for all colors (`--bg`, `--surface`, `--accent`, `--border`, `--text`, `--text-muted`)
- Light/dark toggle supported via ThemeProvider

---

## 2. Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout — Navigation, Footer, Preloader, ClientCursor, GrainOverlay, ScrollProgress, PageTransition
│   ├── page.tsx            # MAIN FILE — entire single-page site lives here
│   ├── globals.css         # CSS variables, keyframes, base styles
│   ├── not-found.tsx       # Custom 404 with CRT static animation
│   ├── login/page.tsx      # Placeholder login page
│   ├── signup/page.tsx     # Placeholder signup page
│   ├── dashboard/page.tsx  # Live dashboard (metrics, alerts, model registry)
│   ├── achievements/       # Standalone achievements page (legacy, not linked from nav)
│   ├── contact/            # Standalone contact page (legacy, not linked from nav)
│   ├── team/               # Standalone team page (legacy, not linked from nav)
│   ├── what-we-build/      # Standalone stack page (legacy, not linked from nav)
│   └── what-we-do/         # Standalone philosophy page (legacy, not linked from nav)
│
└── components/
    ├── [see Section 3]
```

> **Note:** The standalone pages (`/achievements`, `/contact`, `/team`, etc.) still exist but are NOT linked from the navbar. The nav uses hash anchors (`#process`, `#stack`, `#wins`, `#team`, `#contact`) that scroll to sections within `page.tsx`. These pages can be deleted or kept as fallback.

---

## 3. Component Inventory

### Core Site Infrastructure
| Component | Purpose | Status |
|-----------|---------|--------|
| `Navigation.tsx` | Fixed pill navbar — hash anchor links, active section tracking via scroll, live clock, theme toggle, Login/Sign Up buttons | ✅ Done |
| `Footer.tsx` | Large Devanagari mark, nav links, CTA, coordinates, live pulse | ✅ Done |
| `ThemeProvider.tsx` | Dark/light theme context | ✅ Done |
| `ThemeToggle.tsx` | Moon/sun toggle button | ✅ Done |
| `Preloader.tsx` | 4 pulsing orange dots + site name, fades after 1400ms, covers hydration gap | ✅ Done |
| `ClientCursor.tsx` | `"use client"` wrapper for dynamic import of CustomCursor (needed because layout.tsx is a Server Component) | ✅ Done |
| `CustomCursor.tsx` | Orange dot + ring custom cursor, dispatches `kvs-cursor-move` custom event for other components to listen | ✅ Done |
| `GrainOverlay.tsx` | Subtle film grain texture overlay (CSS, fixed, pointer-events-none) | ✅ Done |
| `ScrollProgress.tsx` | Thin orange line at top tracking scroll position | ✅ Done |
| `PageTransition.tsx` | Framer Motion AnimatePresence wrapper for route transitions | ✅ Done |

### Hero & Entry
| Component | Purpose | Status |
|-----------|---------|--------|
| `EnterGate.tsx` | Full-screen CRT monitor effect — canvas grid of Sanskrit/ASCII chars, mouse interaction activates orange tiles, click triggers fill→flash→decay animation sequence, stores pass in sessionStorage | ✅ Done |
| `GLSLTerrain.tsx` | Raw WebGL2 shader — fingerprint pattern + sonar sweep, subtle mouse illumination (orange glow ring follows cursor) | ✅ Done |
| `SweepText.tsx` | Rotating hero headline — cycles through brand phrases with animation | ✅ Done |

### UI Elements (the original 12)
| Component | Purpose | Used In | Status |
|-----------|---------|---------|--------|
| `RulerCarousel.tsx` | Spring-physics drag carousel with ruler tick marks, dot pagination, keyboard nav | `#wins` section | ✅ Done |
| `SegmentedControl.tsx` | Animated pill tab switcher — measures real DOM widths via `offsetLeft`/`offsetWidth` to fix alignment | `#stack` section | ✅ Done |
| `TeamShowcase.tsx` | Two offset columns of photo cards (grayscale→color on click), name list with social icons | `#team` section | ✅ Done |
| `Accordion.tsx` | Radix UI accordion — built, exported as named exports + default `AccordionList` wrapper | Built, replaced by ProcessShowcase | ✅ Built |
| `ProgressiveBlur.tsx` | Stacked backdrop-filter blur with gradient mask for directional depth | Built, not integrated | ✅ Built |
| `ScrollCard.tsx` | Framer Motion `whileInView` wrapper — opacity+translate reveal on scroll, configurable delay/direction | Wraps all section headings and cards | ✅ Done |
| `TextRotate.tsx` | AnimatePresence word cycling — words slide up/down on interval | Contact section heading | ✅ Done |
| `EnergyRing.tsx` | Raw WebGL canvas — 3 concentric animated rings with rotating arcs, orange glow | Behind contact section form | ✅ Done |
| `ProcessShowcase.tsx` | Split panel — left rail with 4 numbered steps, right panel with live canvas viz per step (Ingest/Detect/Trace/Govern each have unique animation) | `#process` section | ✅ Done |
| `CountUp.tsx` | IntersectionObserver-triggered number animation (ease-out cubic) for stat counters | Stats section | ✅ Done |

### Not Built from Original Spec
*(These were in the original 12 elements but not implemented as separate components — their functionality was absorbed or superseded)*
| Element | Notes |
|---------|-------|
| `ScrollCard` wrapping | Done via `ScrollCard.tsx` |
| All 12 elements | ✅ All 12 now implemented and in use |

---

## 4. page.tsx — Single Page Architecture

All content lives in `src/app/page.tsx`. Section order:

```
1. EnterGate (conditionally rendered, sessionStorage gated)
2. Hero (GLSLTerrain bg + SweepText + copy + scroll hint)
3. Stats (4 counters with CountUp animation)
4. Tech Marquee (draggable, Framer Motion drag)
5. Thesis ("Every fraud leaves a trace. We find it.")
6. [belowFold sentinel — IntersectionObserver defers render]
7. #process — ProcessShowcase (split panel + canvas viz)
8. #stack  — SegmentedControl + animated cards (Data/Training/Deployment)
9. #wins   — RulerCarousel with NHA achievements
10. #team  — TeamShowcase (photo grid + name list)
11. #contact — EnergyRing bg + TextRotate heading + ContactForm
```

Key hooks in page.tsx:
- `useBelowFold()` — defers sections 7–11 render until user scrolls near (200px rootMargin)
- `entered` state — controls hero visibility after gate passes
- `activeStack` state — controls SegmentedControl tab

---

## 5. Navigation System

`NAV_LINKS` in `src/lib/constants.ts`:
```ts
{ label: "Home", href: "/" },
{ label: "Process", href: "#process" },
{ label: "Stack", href: "#stack" },
{ label: "Wins", href: "#wins" },
{ label: "Team", href: "#team" },
{ label: "Contact", href: "#contact" },
```

Navigation.tsx behavior:
- Hash clicks → `document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })`
- Active section tracked by scroll position — checks `getBoundingClientRect().top <= 120`
- Hides on scroll down (>6px), shows on scroll up or near top
- Login/Sign Up buttons → `/login` and `/signup` (placeholder pages)

---

## 6. Tech Stack & Dependencies

```
next: 16.2.4        (App Router, Turbopack dev, static build)
react: 19.2.4
framer-motion: 12   (animations, drag, whileInView, AnimatePresence)
tailwindcss: 4      (CSS variables based, no config file needed)
@radix-ui/react-accordion  (Accordion component)
lucide-react: 1.16  (icons — NOTE: no Linkedin/Twitter/Instagram in this version)
                    (use ExternalLink, AtSign, Globe instead)
three: 0.184        (installed but NOT used — GLSLTerrain is raw WebGL2)
gsap: 3.15          (installed but NOT used)
lenis: 1.3          (installed but NOT used)
```

> **Important:** `lucide-react@1.16` does NOT export `Linkedin`, `Twitter`, or `Instagram`. Use `ExternalLink`, `AtSign`, `Globe` instead.

---

## 7. Running the Project

```bash
# Dev (Turbopack, HMR)
npm run dev
# → http://127.0.0.1:3000  (use 127.0.0.1 not localhost in Opera GX)

# Production (faster, use for testing performance)
npm run build && npx next start

# After any code change in prod mode:
npm run build && pkill -f "next start" && npx next start
```

> **Always hard refresh (Cmd+Shift+R) after switching from dev→prod** — browser caches old chunks.

---

## 8. Known Issues / Gotchas

| Issue | Status | Notes |
|-------|--------|-------|
| `ssr: false` in Server Components | Fixed | Use `ClientCursor.tsx` pattern — create a `"use client"` wrapper before using `next/dynamic` with `ssr: false` |
| EnterGate mouse coordinate mapping | Fixed | Must keep `relative w-screen h-screen` shell div intact. Do NOT make canvas directly `fixed inset-0` — breaks `getBoundingClientRect()` offset calculation |
| `lucide-react` missing social icons | Fixed | Use `ExternalLink`, `AtSign`, `Globe` instead of `Linkedin`, `Twitter`, `Instagram` |
| TeamShowcase social interface | Fixed | `social` type only has `twitter`, `linkedin`, `instagram` — no `github` |
| `output: "export"` in next.config | Removed | Was breaking HMR and dynamic routes — do not re-add |
| Opera GX localhost blocking | Workaround | Use `http://127.0.0.1:3000` instead of `localhost:3000` |
| SegmentedControl pill misalignment | Fixed | Uses `offsetLeft`/`offsetWidth` DOM measurement, not CSS % widths |
| Custom cursor disappearing in sections | Fixed | Moved CustomCursor to layout.tsx via ClientCursor wrapper — no longer per-page |
| `allowedDevOrigins` for IP access | Set | `allowedDevOrigins: ["127.0.0.1"]` in next.config.ts |

---

## 9. What's Done ✅

- [x] Entry gate (full-screen CRT canvas, mouse interaction, fill/flash/decay animation)
- [x] WebGL hero terrain (fingerprint + sonar, mouse glow)
- [x] Rotating hero headline (SweepText)
- [x] Single-page architecture with hash anchor nav
- [x] Scroll-based active section detection
- [x] Login / Sign Up buttons (placeholder routes)
- [x] Preloader (covers hydration black screen)
- [x] Custom cursor (site-wide)
- [x] Stats with CountUp animation on scroll
- [x] Draggable tech marquee
- [x] Process section — ProcessShowcase (split panel + 4 live canvas visualizations)
- [x] Stack section — SegmentedControl tabs with animated card swap
- [x] Achievements — RulerCarousel with NHA 2026 hackathon wins
- [x] Team section — TeamShowcase (placeholder names, ready for real photos)
- [x] Contact section — EnergyRing bg + TextRotate heading + working form
- [x] ScrollCard reveals on all sections (staggered, whileInView)
- [x] Section numbers (01–04) as giant ghost typography
- [x] Footer — redesigned with large brand mark, CTA, live pulse
- [x] Hero copy rewritten ("Every fraudster leaves a fingerprint. We built the scanner.")
- [x] Dark/light theme toggle
- [x] Grain overlay + scroll progress bar
- [x] Custom 404 page

---

## 10. What Needs to Be Built 🔴

### Critical for Awwwards

| Task | Priority | Effort |
|------|----------|--------|
| **Real team names + photos** | P0 | Content only — plug into `TEAM_MEMBERS` in `page.tsx` and `TeamShowcase` `image` prop |
| **Mobile responsiveness** | P0 | Never tested. Nav, RulerCarousel, TeamShowcase, ProcessShowcase all likely break on mobile |
| **Console error audit** | P0 | Run DevTools, fix any errors before submission |

### High Impact Polish

| Task | Priority | Effort |
|------|----------|--------|
| **Hover states on every element** | P1 | Links, cards, form fields — need micro-animations |
| **Contact form real submission** | P1 | Currently simulates send with `setTimeout`. Wire up Resend/Formspree/etc. |
| **Copy audit** | P1 | Hire or write proper copywriter-quality headlines per section |
| **ProcessShowcase mobile layout** | P1 | Grid collapses poorly on small screens — needs horizontal tab variant |
| **RulerCarousel touch/swipe** | P1 | Framer Motion drag works on desktop, needs testing on mobile |

### Nice to Have

| Task | Priority | Effort |
|------|----------|--------|
| **Stat section typography moment** | P2 | Make the 4 stat numbers dramatically larger with a background accent |
| **Scroll storytelling connectors** | P2 | Floating ambient elements between sections (grid lines, glyphs) |
| **Sound design** | P3 | Subtle hover/click tones (common on SOTD winners) |
| **ProgressiveBlur integration** | P3 | Use at hero→stats transition and top of contact section |
| **Lenis smooth scroll** | P3 | Already installed (`lenis: 1.3`) — just needs initialization in layout |
| **GSAP scroll triggers** | P3 | Installed but unused — could replace some Framer Motion scroll logic |
| **Dashboard page polish** | P3 | Exists at `/dashboard` but is a placeholder |
| **Delete legacy standalone pages** | P3 | `/achievements`, `/contact`, `/team`, `/what-we-build`, `/what-we-do` are orphaned |

---

## 11. Content Placeholders (Replace Before Launch)

| Location | Placeholder | Replace With |
|----------|-------------|--------------|
| `page.tsx` → `TEAM_MEMBERS` | Member 1–6, no images | Real names, roles, photo URLs |
| `constants.ts` → `SITE.coordinates` | `12.9716° N, 77.5946° E` | Confirm or update |
| Contact form | Simulated send | Real API endpoint |
| Login/Signup pages | Placeholder UI | Real auth or waitlist |
| Dashboard page | Static mock data | Real metrics or remove |

---

## 12. Awwwards Submission Checklist

- [ ] Real team names and photos added
- [ ] Mobile tested on iPhone + Android (Chrome + Safari)
- [ ] Zero console errors / warnings
- [ ] All links work (no broken hrefs)
- [ ] Contact form submits successfully
- [ ] Page load < 3s on fast 3G (use Lighthouse)
- [ ] Favicon set
- [ ] OG image set (`og:image` meta tag)
- [ ] Title and description meta tags optimized
- [ ] Site deployed to production URL (not localhost)
- [ ] Submitted to Awwwards with correct category (Agency / Portfolio)
- [ ] Screenshots prepared (Awwwards requires 1280×960 + mobile screenshot)

---

## 13. Design Tokens (CSS Variables)

Defined in `globals.css` and applied via `data-theme="dark"` on `<html>`:

```css
--bg:         #030305    /* page background */
--surface:    #0a0a0f    /* card/panel background */
--border:     rgba(255,255,255,0.06)
--text:       #f0f0f0    /* primary text */
--text-muted: rgba(240,240,240,0.4)
--accent:     #FF4D00    /* orange — primary brand color */
```

---

## 14. File to Edit for Common Changes

| Change | File |
|--------|------|
| Nav links | `src/lib/constants.ts` → `NAV_LINKS` |
| Site name / tagline / coordinates | `src/lib/constants.ts` → `SITE` |
| Stats (3×, 60%, etc.) | `src/lib/constants.ts` → `STATS` |
| Tech stack marquee items | `src/lib/constants.ts` → `TECH_STACK` |
| Team members | `src/app/page.tsx` → `TEAM_MEMBERS` array |
| Achievement carousel cards | `src/app/page.tsx` → `ACHIEVEMENTS` array |
| Stack tab content | `src/app/page.tsx` → `STACK_CONTENT` object |
| Process steps content | `src/components/ProcessShowcase.tsx` → `STEPS` array |
| Hero copy | `src/app/page.tsx` → hero section paragraphs |
| Entry gate animation timing | `src/components/EnterGate.tsx` → `handleClick` timeouts |
| GLSLTerrain shader | `src/components/GLSLTerrain.tsx` → GLSL source strings |
