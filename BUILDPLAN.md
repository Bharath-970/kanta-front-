# Kantaka Śodhana — Full Build Plan

## Architecture

```
src/
├── app/
│   ├── layout.tsx              ← Root layout (fonts, theme provider, nav, footer)
│   ├── page.tsx                ← Homepage (entry gate + hero + sections)
│   ├── globals.css             ← Tailwind + theme tokens + grain + keyframes
│   ├── what-we-do/page.tsx     ← Philosophy + approach
│   ├── what-we-build/page.tsx  ← Pipeline breakdown (horizontal scroll)
│   ├── achievements/page.tsx   ← Ruler carousel
│   ├── team/page.tsx           ← Staggered photo grid
│   ├── contact/page.tsx        ← Minimal contact form
│   ├── dashboard/page.tsx      ← Fake dashboard UI
│   └── not-found.tsx           ← Custom 404 "SIGNAL LOST"
├── components/
│   ├── EnterGate.tsx           ← [EXISTS] CRT entry transition
│   ├── CustomCursor.tsx        ← [EXISTS] Enhanced with trail + per-section modes
│   ├── Navigation.tsx          ← Magnetic pill nav + clock + theme toggle
│   ├── Footer.tsx              ← Logo + links + coordinates + "built with"
│   ├── PageTransition.tsx      ← CRT flash between routes
│   ├── ThemeProvider.tsx       ← Dark/light mode context
│   ├── ThemeToggle.tsx         ← Moon/sun toggle switch
│   ├── ScrollProgress.tsx      ← Top progress bar
│   ├── GrainOverlay.tsx        ← Subtle film grain
│   ├── Preloader.tsx           ← 4-dot orbital loader
│   ├── TechMarquee.tsx         ← Infinite scrolling tech logos
│   ├── MagneticButton.tsx      ← Button with cursor-pull effect
│   ├── ProgressiveBlur.tsx     ← Directional backdrop blur
│   ├── TextRotate.tsx          ← Staggered text animation
│   ├── GLSLTerrain.tsx         ← Three.js Perlin noise hills
│   ├── ScrollCard.tsx          ← Scroll-driven 3D card container
│   ├── RulerCarousel.tsx       ← Infinite film-strip slider
│   ├── TeamShowcase.tsx        ← Staggered grid + name list
│   ├── Accordion.tsx           ← Radix accordion
│   ├── SegmentedControl.tsx    ← 3D tilting tab switcher
│   ├── ShaderEffects.tsx       ← ShaderPlane + EnergyRing (R3F)
│   ├── SealStamp.tsx           ← Circular badge/watermark
│   └── HorizontalScroll.tsx    ← Vertical scroll → horizontal section
├── lib/
│   ├── utils.ts                ← cn() utility
│   ├── theme.ts                ← Theme tokens + colors
│   └── constants.ts            ← Site content, nav links, team data
└── hooks/
    ├── useScrollVelocity.ts    ← Scroll speed detection for text skew
    ├── useMagnetic.ts          ← Magnetic pull effect hook
    └── useReducedMotion.ts     ← prefers-reduced-motion detection
```

## Pages Breakdown

### 1. Homepage (`/`)
- Entry gate (first visit only via sessionStorage)
- Hero: GLSL terrain background + title + TextRotate tagline
- "The Thesis" block: Big manifesto line + progressive blur edge
- Stats: 3×, 60%, 24/7, 100% styled as case file numbers
- Brief "What We Do" teaser → CTA to full page
- Tech stack marquee

### 2. What We Do (`/what-we-do`)
- Philosophy section (Arthashastra reference, narrative)
- Problem → Solution breakdown
- Accordion for detailed explanations
- Background: manuscript texture overlay (low opacity)

### 3. What We Build (`/what-we-build`)
- Segmented control: Data Pipelines | Training | Deployment
- Horizontal scroll pipeline visualization
- Each stage has tech logos + descriptions
- Scroll-driven 3D card showing a demo/dashboard preview

### 4. Achievements (`/achievements`)
- Ruler carousel with NHA wins
- Space for future additions
- Background: copper plate texture

### 5. Team (`/team`)
- Staggered photo grid (6 members)
- Grayscale → color on hover
- Social links slide in
- Placeholder data for now

### 6. Dashboard (`/dashboard`)
- Fake but convincing metrics UI
- Model performance charts (CSS/SVG, no real data)
- Alert indicators, pipeline status
- "Login required" overlay or open preview

### 7. Contact (`/contact`)
- Minimal form (name, email, message)
- Company info + coordinates
- Magnetic submit button

### 8. 404 (`not-found.tsx`)
- "SIGNAL LOST" with CRT static canvas animation
- Glitching text effect
- Link back to homepage

## Build Order

### Phase 1: Foundation (Day 1)
1. Dependencies install
2. `lib/utils.ts`, `lib/theme.ts`, `lib/constants.ts`
3. `ThemeProvider.tsx` + `ThemeToggle.tsx` (dark/light)
4. `globals.css` (full theme tokens, grain, keyframes)
5. `Navigation.tsx` (magnetic pill + clock + toggle)
6. `Footer.tsx`
7. `layout.tsx` (wire up provider, nav, footer)
8. `PageTransition.tsx` (CRT flash between routes)
9. `ScrollProgress.tsx`
10. `GrainOverlay.tsx`

### Phase 2: Homepage (Day 1-2)
11. `GLSLTerrain.tsx` (Three.js hero background)
12. `TextRotate.tsx`
13. `ProgressiveBlur.tsx`
14. `MagneticButton.tsx`
15. `TechMarquee.tsx`
16. Homepage `page.tsx` (wire everything together)
17. `Preloader.tsx` (while Three.js loads)

### Phase 3: Inner Pages (Day 2-3)
18. `Accordion.tsx`
19. What We Do page
20. `SegmentedControl.tsx`
21. `HorizontalScroll.tsx`
22. What We Build page
23. `RulerCarousel.tsx`
24. Achievements page
25. `TeamShowcase.tsx`
26. Team page
27. Contact page
28. `ScrollCard.tsx`
29. Dashboard page (fake UI)

### Phase 4: Polish (Day 3-4)
30. `CustomCursor.tsx` enhancement (trail + section modes)
31. `useScrollVelocity.ts` (text skew on fast scroll)
32. `SealStamp.tsx` (watermark element)
33. Custom 404 page
34. OG images / meta per page
35. View Transitions API integration
36. Reduced motion support
37. Console easter egg
38. Lazy loading / code splitting Three.js
39. Performance audit (Lighthouse 90+)
40. Mobile responsive pass

## Color Tokens

### Dark Mode (default)
```
--bg:         #030305
--surface:    #0a0a0f
--border:     rgba(255, 255, 255, 0.08)
--text:       #E8E6E3
--text-muted: #6B6B7B
--accent:     #FF4D00
--accent-dim: #C7511F
```

### Light Mode
```
--bg:         #F5F0E8
--surface:    #FFFFFF
--border:     rgba(0, 0, 0, 0.08)
--text:       #1a1a1a
--text-muted: #6B6B7B
--accent:     #C7511F
--accent-dim: #8F2D1F
```

## Dependencies to Install

```bash
npm install three @react-three/fiber @react-three/drei framer-motion gsap lucide-react lenis @radix-ui/react-accordion @radix-ui/react-icons clsx tailwind-merge
```

## Key Decisions
- framer-motion for component animations + page transitions
- GSAP + ScrollTrigger for scroll-driven effects
- Three.js (raw) for GLSL terrain hero
- @react-three/fiber for smaller embedded 3D elements
- Lenis for smooth scroll
- Radix for accessible primitives
- Tailwind v4 for styling
- Next.js App Router for routing + layouts
