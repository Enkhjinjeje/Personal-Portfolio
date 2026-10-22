---
name: "Jeje's portfolio"
description: "Modern black-and-white portfolio with open spacing and Manrope typography."
colors:
  primary: "#000"
  paper: "#fff"
  secondary: "#626262"
  line: "#dedede"
  soft: "#f3f3f3"
  project-surface: "#ededed"
  inverse-copy: "#bcbcbc"
  connection-mark: "#929292"
  inverse-line: "#7a7a7a"
  window-dot: "#aaa"
  scrollbar: "#777"
typography:
  display:
    fontFamily: "'Manrope Variable', sans-serif"
    fontSize: "clamp(210px,34vw,485px)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-.04em"
  headline:
    fontFamily: "'Manrope Variable', sans-serif"
    fontSize: "clamp(35px,4vw,57px)"
    fontWeight: 500
    lineHeight: 1.13
    letterSpacing: "-.035em"
  title:
    fontFamily: "'Manrope Variable', sans-serif"
    fontSize: "clamp(30px,3.1vw,44px)"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-.035em"
  body:
    fontFamily: "'Manrope Variable', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "'Manrope Variable', sans-serif"
    fontSize: "12px"
    fontWeight: 400
  navigation:
    fontFamily: "'Manrope Variable', sans-serif"
    fontSize: "14px"
    fontWeight: 500
rounded:
  browser: "7px"
  project: "12px"
  pill: "999px"
  circle: "50%"
spacing:
  icon-gap: "12px"
  compact: "24px"
  medium: "30px"
  wide: "48px"
  feature-gap: "64px"
  section-gap: "100px"
components:
  visit-project:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "12px 17px"
  text-link:
    textColor: "{colors.primary}"
    padding: "5px 0"
  text-link-hover:
    textColor: "{colors.secondary}"
  copy-button:
    backgroundColor: "transparent"
    rounded: "{rounded.circle}"
    width: "40px"
    height: "40px"
  copy-button-hover:
    backgroundColor: "{colors.soft}"
  navigation:
    textColor: "{colors.primary}"
    typography: "{typography.navigation}"
  technology-list:
    textColor: "{colors.secondary}"
  experience-disclosure:
    padding: "27px 0"
---

# Design System: Jeje's portfolio

## Overview

**Creative North Star: "White paper, pure black"**

A modern monochrome portfolio built around generous open space and Manrope typography. Oversized lettering supplies personality; neutral grays support reading, and the black section reverses the same palette.

The implemented system is mostly flat, with thin dividers and restrained rounded controls. A soft shadow and tilted browser frame give the real project screenshot depth. Motion is concentrated in the interactive name and directional cues.

**Key Characteristics:**

- Pure black and white with supporting neutral grays.
- Manrope throughout, with medium headings and extra-bold identity lettering.
- Open grids, thin dividers, and selective rounded shapes.
- Focused interaction with keyboard focus and reduced-motion support.

Recorded at completion from [the stylesheet](src/style.css) and [the React implementation](src/App.tsx), with confirmed direction in [PRODUCT.md](PRODUCT.md) and [the homepage brief](.impeccable/surface.md). This is a source-derived record; it does not assert a new rendered accessibility audit. Frontmatter names describe existing values rather than newly introduced CSS variables.

## Colors

The palette is strictly monochrome. Primary black carries headings, actions, selection backgrounds, and the inverse section. Paper white supplies the page, browser preview, inverse headings, and selected text. Secondary gray supports body copy and metadata; line gray separates sections and disclosures. Soft gray supplies copy-button hover and the scrollbar track; project-surface is the image surround. Inverse-copy, inverse-line, and connection-mark support the dark section. Window-dot and scrollbar are small chrome details.

**The Monochrome Rule.** Use black, white, and supporting neutral grays throughout the interface.

## Typography

Manrope Variable is imported locally through the font package, with sans-serif fallback. Display is the interactive name; headline is the introduction; title is the repeated section heading. Body records repeated project/community prose, not a universal paragraph override. Labels describe the common small metadata size; navigation has its own medium weight. There is no separate serif or monospace voice.

Heading sizes are fluid rather than a fixed-ratio scale. The dark-section heading uses (44–72px), the contact heading (40–90px), and the brand (34px, weight 800). Body copy generally uses (13–15px); supporting metadata uses (11–13px). Project/community numerals use tabular figures. Preserve the source's responsive overrides instead of applying desktop display sizes everywhere.

## Layout

The centered shell is capped at (1328px), with width calculated as the viewport minus (112px). At maximum (1000px), that subtraction becomes (64px); at maximum (700px), it becomes (40px). The body minimum width is (320px). Desktop header height is (112px), becoming (80px) on mobile.

Desktop introduction and featured work use asymmetric two-column grids (1.4:1 and 1.3:1); about and community use equal columns. Large sections generally have (92–106px) vertical padding and generous grid gaps. Reading measures vary by content: project prose (60ch), about prose (65ch), community prose (51ch).

At maximum (1000px), gaps narrow and the featured grid becomes (1.1:1). At maximum (700px), major grids stack, navigation changes to a toggle-controlled menu, section padding generally becomes (60–65px), disclosure dates move above roles, and contact links wrap. The name becomes (35vw) with a (180px) minimum block height. At minimum (1600px), the hero gains top space (80px). The only additional Tailwind breakpoint used in markup is lg (64rem), controlling a biography line break.

## Elevation & Depth

Depth is mostly tonal: white paper, a pale project surround, and a black section. The browser preview alone has the soft shadow recorded in the sidecar. It rests at a slight tilt (-3deg), straightening and rising (6px) on hover.

**The Selective Depth Rule.** Reserve the soft shadow for the project browser preview; use whitespace and dividers elsewhere.

## Shapes

Rounded corners belong to the project surround and nested browser frame; pills identify the visit action, and circles define the copy control and browser dots. Content sections and experience rows remain open, separated by thin (1px) rules. Icons use outlined SVGs; the connection motif uses overlapping circles.

## Components

- **Project preview and visit action:** A grayscale screenshot sits inside a tilted browser frame. A black pill with white text and arrow sits at the lower right. Hover movement belongs to the containing project link; the pill has no independent hover color.
- **Text links:** Medium-bold text with a bottom border; hover shifts to secondary gray. The inverse résumé link uses an understated gray border that turns white on hover.
- **Navigation:** Small, medium-weight desktop links with underlined hover states. Mobile uses a (44px) menu control and a white menu with (20px) link text. The toggle exposes expanded state; Escape within the menu closes it and restores toggle focus. No active-section highlight is implemented.
- **Technology list:** Plain wrapping text with spacing, without badge backgrounds or borders.
- **Disclosures:** Native details/summary elements use rules, generous row padding, and plus/minus icons. Project details rotate the plus when open; experience rows swap plus and minus. No bespoke hover effect is defined.
- **Copy control:** Circular outlined (40px) button with soft hover fill; success swaps copy for a check and announces “Copied!” for (2500ms). Failure asks the visitor to copy the visible address.
- **Interactive signature:** An oversized, borderless name button follows mouse position and toggles a rotated letter composition on click or keyboard activation; its pressed state is exposed. The secondary remix control toggles the same composition.
- **Contact cue:** The large arrow moves diagonally on hover; the title remains a mail link.

Links, buttons, and summaries use a visible current-color outline (2px) with offset (6px). A focus-revealed skip link targets main content. Reduced-motion preferences disable transitions, animations, and smooth scrolling, and suppress pointer transforms on unremixed letters; the deliberate remixed arrangement still changes instantly.

Sidecar previews are static HTML/CSS extracts. Framework-managed menu, copy feedback, and signature state remain documented here rather than simulated with invented behavior. No form inputs or filter chips exist.

## Do's and Don'ts

### Do:

- Do use Manrope and the implemented monochrome roles.
- Do preserve open spacing, responsive stacking, and readable text widths.
- Do retain visible keyboard focus, semantic disclosures, and reduced-motion behavior.
- Do use authentic project imagery with the existing grayscale treatment.

### Don't:

- Don't introduce chromatic accents or ornamental badges into this confirmed world.
- Don't apply the project preview shadow to every section or content row.
- Don't invent portraits, project imagery, or unsupported content.
