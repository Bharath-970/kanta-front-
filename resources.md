# Visual Resources — Public Domain / CC Licensed

> All items below are either public domain (pre-1900 works) or CC-licensed from Wikimedia Commons.
> Verify individual licenses before final production use.

---

## 1. Arthashastra Manuscripts (Grantha Script, ~16th century copies)

Direct source text for "Kantaka Śodhana". Palm leaf manuscripts in Grantha script.

- https://commons.wikimedia.org/wiki/File:Rediscovered_circa_16th_century_Arthashastra_manuscript_in_Grantha_script_from_the_Oriental_Research_Institute_(ORI)_which_was_found_in_1905_02.jpg
- https://commons.wikimedia.org/wiki/File:Rediscovered_circa_16th_century_Arthashastra_manuscript_in_Grantha_script_from_the_Oriental_Research_Institute_(ORI)_which_was_found_in_1905_03.jpg
- https://commons.wikimedia.org/wiki/File:Rediscovered_circa_16th_century_Arthashastra_manuscript_in_Grantha_script_from_the_Oriental_Research_Institute_(ORI)_which_was_found_in_1905_05.jpg

**Usage:** Hero background texture, section dividers. Apply grayscale + dark overlay + low opacity (5-12%).

---

## 2. Copper Plate Inscriptions

Engraved royal decrees on copper — perfect for the "decree/authority" theme.

- https://commons.wikimedia.org/wiki/File:Chola_emblem-Copper_plate_grant,_Govt_Museum-Egmore-Chennai.jpg (Chola emblem copper plate)
- https://commons.wikimedia.org/wiki/File:Vazhappally_copper_plate_(c._830_CE).jpg (830 CE Kerala)
- https://commons.wikimedia.org/wiki/File:Tirupparappu_fragmentary_copper_plate_inscription_(Ay_dynasty).jpg (Ay dynasty fragment)
- https://commons.wikimedia.org/wiki/Category:Copper_plate_inscriptions_in_India (Full category — dozens more)

**Usage:** Card/panel backgrounds, section accent textures. Apply sepia + contrast filter.

---

## 3. Palm Leaf Manuscripts

Aged organic texture with incised script lines.

- https://commons.wikimedia.org/wiki/File:Sinhala_palm-leaf_medical_manuscripts,_open_leaves,_large_image..JPG (Sinhala medical — PD Mark 1.0)
- https://commons.wikimedia.org/wiki/File:Odia_palm_leaf_manuscript.JPG (Odia script)
- https://commons.wikimedia.org/wiki/Category:Palm-leaf_manuscripts_from_India (Full category)

**Usage:** Subtle background texture for light-mode panels, about section, or philosophy block.

---

## 4. Ashoka Edicts & Brahmi Script

The original "system commands" — royal decrees carved in stone, 3rd century BCE.

- https://commons.wikimedia.org/wiki/File:3rd_century_BCE_Asoka_rock_edict,_Brahmi_script,_Brahmagiri_(Isila),_Chitradurga,_Karnataka_2.jpg (Brahmagiri rock edict)
- https://commons.wikimedia.org/wiki/Category:Ashoka_Major_Rock_Edict,_Khalsi (Khalsi edicts — multiple images)
- https://commons.wikimedia.org/wiki/Category:Brahmi_inscriptions (Full Brahmi category)

**Usage:** Stone texture overlays, decorative watermark characters, section backgrounds.

---

## 5. Yantra / Sacred Geometry

Precise geometric diagrams — perfect for loading states, seal elements, decorative overlays.

- https://commons.wikimedia.org/wiki/File:Sri_Yantra.svg (Sri Yantra — clean SVG, 9 interlocking triangles)
- https://commons.wikimedia.org/wiki/Category:Sri_Yantra (Multiple Sri Yantra renditions)
- https://commons.wikimedia.org/wiki/Category:Yantra (Full yantra collection)

**Usage:** SVG trace animations (stroke-dasharray reveal on scroll), loading spinners, watermark patterns, seal/badge elements.

---

## 6. Mohenjo-daro / Indus Valley

Ancient grid city layouts — literally looks like circuit boards. Archaeological photos.

- https://commons.wikimedia.org/wiki/Category:Mohenjo-daro (Full photo collection)
- https://commons.wikimedia.org/wiki/Category:The_Great_Bath_of_Moenjodaro (The Great Bath — geometric architecture)
- https://commons.wikimedia.org/wiki/Category:Art_of_Mohenjo-daro (Artifacts, seals, pottery)

**Usage:** Grid/blueprint background patterns, simplified SVG wireframe traces, "ancient tech" narrative.

---

## 7. Additional Categories to Explore

- https://commons.wikimedia.org/wiki/Category:Sanskrit-language_manuscripts
- https://commons.wikimedia.org/wiki/Category:Sacred_geometry
- https://commons.wikimedia.org/wiki/Category:Copper_plate_inscriptions_from_Madhya_Pradesh (5th-6th century plates with clear script)

---

## Treatment Guide

| Technique | CSS/Style | Best For |
|-----------|-----------|----------|
| Dark overlay | `linear-gradient(rgba(3,3,5,0.85), rgba(3,3,5,0.95))` over image | Dark mode backgrounds |
| Grayscale + contrast | `filter: grayscale(1) contrast(1.1)` | Stone/metal textures |
| Sepia aged | `filter: sepia(0.4) saturate(0.6)` | Copper/parchment panels |
| Blend multiply | `mix-blend-mode: multiply; opacity: 0.08` | Subtle grain overlays |
| Blend soft-light | `mix-blend-mode: soft-light; opacity: 0.15` | Manuscript watermarks |
| SVG trace | `stroke-dasharray` + `stroke-dashoffset` animation | Yantra/geometry reveals |

---

## Achievements (Ruler Carousel)

| # | Place | Event | Problem Statement | Topic |
|---|-------|-------|-------------------|-------|
| 1 | 🥈 2nd Place | NHA (National Health Authority) Hackathon | PS-2 | Radiological image-based correlation |
| 2 | 🥉 3rd Place | NHA (National Health Authority) Hackathon | PS-3 | Document forgery detection |

**Display format:** Ruler carousel (#7) — infinite scroll, spring physics, each achievement as a card.

---

## UI Elements Inventory

| # | Element | Purpose |
|---|---------|---------|
| 1 | Day/Night toggle | Theme switch |
| 2 | 4-dot orbital loader | Loading states |
| 3 | 3D tilting segmented control | Tab switcher |
| 4 | GLSL terrain hills | Hero background |
| 5 | Scroll-driven 3D card | Dashboard showcase |
| 6 | ShaderPlane + EnergyRing | Decorative 3D |
| 7 | Ruler carousel | Achievements slider |
| 8 | Team showcase | About section |
| 9 | Accordion | FAQ / details |
| 10 | Magnetic pill nav | Top navigation |
| 11 | Progressive blur | Edge fades / frost |
| 12 | Text rotate | Hero tagline / headings |

## Dependencies

```
three / @react-three/fiber / framer-motion (motion/react) / gsap / lucide-react / lenis / @radix-ui/react-accordion / @radix-ui/react-icons
```
