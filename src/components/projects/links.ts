import { spotCentre, type Layout } from './layout'

// A pulse from a click on the background: it runs from the click (x, y) to the edge (ex, ey) of the nearest project,
// whose centre is (tx, ty). All in canvas coordinates (the view's less the pan), so it travels with the canvas.
export type Pulse = { x: number, y: number, ex: number, ey: number, tx: number, ty: number, start: number, dur: number }

export type Scene = {
  w: number, h: number, ink: string
  layout: Layout, scale: number, copies: { cols: number, rows: number }
  ox: number, oy: number            // the plane's offset, the pan folded into one block
  pan: { x: number, y: number }
  flow: number                      // how far the link dots have drifted, px
  pointer: { x: number, y: number } | null
  pulses: Pulse[]
  now: number
}

const DOT_GAP = 9  // px between the dots of a link

// Draw the dotted links on the canvas behind the tiles: each project to the next, the pointer to the nearest
// project, and any pulses on their way. Returns the key (`row-col-i`) of the tile nearest the pointer, and the
// pulses that have just arrived.
export function drawLinks(g: CanvasRenderingContext2D, s: Scene) {
  const { layout, scale, copies, ox, oy, flow } = s, n = layout.spots.length
  const bw = layout.block.w * scale, bh = layout.block.h * scale
  const centre = (row: number, col: number, i: number) => {
    const [x, y] = spotCentre(layout, scale, i)
    return [ox + col * bw + x, oy + row * bh + y] as const
  }

  g.clearRect(0, 0, s.w, s.h)
  g.lineCap = 'round'
  g.strokeStyle = g.fillStyle = s.ink
  g.lineWidth = 2
  g.setLineDash([0, DOT_GAP])

  // each project to the nearest copy of the next one: a loop through all the work, its dots drifting slowly along
  g.globalAlpha = .28
  g.lineDashOffset = -flow
  g.beginPath()
  for (let row = 0; row <= copies.rows; row++) for (let col = 0; col <= copies.cols; col++) for (let i = 0; i < n; i++) {
    const [ax, ay] = centre(row, col, i)
    let to: readonly [number, number] | null = null, toD = Infinity
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const b = centre(row + dr, col + dc, (i + 1) % n), d = (b[0] - ax) ** 2 + (b[1] - ay) ** 2
      if (d < toD) { toD = d; to = b }
    }
    if (to) { g.moveTo(ax, ay); g.lineTo(to[0], to[1]) }
  }
  g.stroke()

  // the pointer to the nearest project
  const pt = s.pointer
  let near: string | null = null
  if (pt) {
    let to: readonly [number, number] | null = null, toD = Infinity
    for (let row = 0; row <= copies.rows; row++) for (let col = 0; col <= copies.cols; col++) for (let i = 0; i < n; i++) {
      const c = centre(row, col, i), d = (c[0] - pt.x) ** 2 + (c[1] - pt.y) ** 2
      if (d < toD) { toD = d; to = c; near = `${row}-${col}-${i}` }
    }
    if (to) {
      g.globalAlpha = .85
      g.lineDashOffset = flow * 1.5
      g.beginPath(); g.moveTo(pt.x, pt.y); g.lineTo(to[0], to[1]); g.stroke()
      g.beginPath(); g.arc(pt.x, pt.y, 3, 0, Math.PI * 2); g.fill()
    }
  }

  // the pulses: the link's own dots swell as the pulse passes, from 2px to 3 and 5 at its front, and the swell runs
  // along the line to the project; behind it the line stays lit, ahead of it faint
  const arrived: Pulse[] = []
  for (const pl of s.pulses) {
    const u = Math.min(1, (s.now - pl.start) / pl.dur), front = u < .5 ? 2 * u * u : 1 - 2 * (1 - u) ** 2
    const x0 = pl.x + s.pan.x, y0 = pl.y + s.pan.y, x1 = pl.ex + s.pan.x, y1 = pl.ey + s.pan.y
    const len = Math.hypot(x1 - x0, y1 - y0), at = len * front
    for (let d = 0; d <= len; d += DOT_GAP) {
      const r = 1 + 1.5 * Math.exp(-(((d - at) / 8.6) ** 2))
      g.globalAlpha = d <= at ? .9 : .25
      g.beginPath(); g.arc(x0 + (x1 - x0) * d / len, y0 + (y1 - y0) * d / len, r, 0, Math.PI * 2); g.fill()
    }
    if (u === 1) arrived.push(pl)
  }
  g.globalAlpha = 1
  return { near, arrived }
}
