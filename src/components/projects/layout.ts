// Where the project tiles sit on the endless canvas

export const pad = (n: number) => String(n).padStart(2, '0')

export const TILE = { w: 320, h: 200 }   // a tile's picture, css px at full size

// One block of the pattern at full size, css px: the projects sit at staggered spots inside it, and the block
// repeats in every direction, so the canvas never ends. A narrow screen gets a zigzag about as wide as the screen,
// stretched downward where a phone has room, with clear space between each project and the next copy of the block.
export const LAYOUTS = {
  wide: { block: { w: 1380, h: 1000 }, spots: [[80, 80], [780, 220], [340, 600]] },
  narrow: { block: { w: 880, h: 1200 }, spots: [[40, 60], [460, 430], [60, 820]] },
}
export type Layout = typeof LAYOUTS.wide

// the layout for a view this size, how far to scale it, and how many copies of the block cover the view at any offset
export function fitLayout(width: number, height: number) {
  const layout = width < 700 ? LAYOUTS.narrow : LAYOUTS.wide
  const scale = layout === LAYOUTS.narrow ? Math.min(.62, Math.max(.4, width / 780)) : Math.min(1, Math.max(.55, width / 1200))
  const copies = { cols: Math.ceil(width / (layout.block.w * scale)) + 1, rows: Math.ceil(height / (layout.block.h * scale)) + 1 }
  return { layout, scale, copies }
}

// the centre of project i's picture in the first block, in canvas px
export function spotCentre(layout: Layout, scale: number, i: number) {
  return [(layout.spots[i][0] + TILE.w / 2) * scale, (layout.spots[i][1] + TILE.h / 2) * scale] as const
}

// the canvas offset that puts the whole group of projects in the middle of a view this size
export function groupCentre(layout: Layout, scale: number, width: number, height: number) {
  const xs = layout.spots.map(s => s[0]), ys = layout.spots.map(s => s[1])
  return [
    width / 2 - (Math.min(...xs) + Math.max(...xs) + TILE.w) / 2 * scale,
    height / 2 - (Math.min(...ys) + Math.max(...ys) + TILE.h) / 2 * scale,
  ] as const
}

// a distance on a repeating axis, folded into one period centred on zero
export function wrapHalf(d: number, period: number) {
  return ((d % period) + period * 1.5) % period - period / 2
}
