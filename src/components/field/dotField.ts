import { cells, type FieldImage, type FieldMark } from './field'

// Dot-field background, ported from the dualscroll component: every dot is a damped spring tied to its grid
// cell, and one pass per frame moves and paints them all. The pointer pushes dots away and blooms them, and a
// slow wave nudges the home cells so the field never sits frozen. An image can be
// set into the field: under it each dot grows with the picture's tone, like a halftone screen, and the dots
// keep their size as the pointer scatters them. A colour wave turns each dot it passes into a circle
// holding its piece of the photo, and the next wave turns them back; near the pointer the image shows the other
// way round, in colour while it is black and white and in black and white while it is in colour. A wordmark can
// be set into the field too: its dots gather from across the screen into the letters, and a soft highlight
// sweeps through them every few seconds. A page change runs as a flow: a strong ring whose radius the page sets
// each frame, out from a click to the far side and back; the portrait and wordmark only show beyond its front.
export const FIELD_DEFAULTS = {
  gap: 6,            // grid spacing, css px; --field-gap overrides it, so small screens get a finer grid
  dot: .42,          // resting radius
  maxDots: 40000,    // spacing widens past this so big screens stay at 60fps
  density: 1,        // how many times as many dots: spacing shrinks by its square root, the cap grows with it
  restAlpha: .2,
  spring: .055,      // pull back toward home, per 60Hz step
  friction: .82,     // velocity kept per step
  repelRadius: 48,   // pointer reach
  push: 1.1,         // pointer shove, scaled up by pointer speed
  swell: 1.8,        // how much a fully bloomed dot grows (× radius)
  bloom: 1,          // 0 = displacement only, no swell or darkening
  jitter: .7,        // 0 = every dot pops alike; higher = each dot's swell, reach and timing vary more
  ringSpeed: 775,    // px/s
  ringWidth: 46,
  ringPush: 2.4,
  breathe: 1.6,      // idle wave amplitude, px
  peekRadius: 85,    // how far round the pointer the image shows its other look
  idleFps: 30,       // draw rate once nothing has moved for a moment
  color: null as string | null,  // dot colour; defaults to the canvas's computed --ink
  invert: 0,         // 1 = light parts of the image get the big dots (light dots on a dark ground)
  still: () => false,
}

export type FieldOptions = typeof FIELD_DEFAULTS

// Per-theme look: these CSS custom properties, when set on or above the canvas, override the matching options
// on every refresh(). Dark dots on light paper need more weight than light dots on dark to read the same.
const CSS_VARS = { restAlpha: '--field-rest-alpha', dot: '--field-dot', swell: '--field-swell', push: '--field-push', invert: '--field-invert' } as const

const STEP = 1 / 60
const BUCKETS = 8
const TILE_LEVELS = 6  // how many steps the colour fades in by
const PORTRAIT_GAP = '#0b0b0a'  // between the colour circles
const MARK_TONE = .6     // a wordmark dot's size at rest, as a share of a full dot
const SHINE_EVERY = 6.5  // seconds between highlight sweeps through the wordmark
const SHINE_FOR = 2.2    // seconds a sweep takes to cross it
const MAX_PIXELS = 8e6  // backing-store cap, so a 4K screen at 2x isn't a 33MP canvas
const FLOW_WIDTH = 90   // the page-change ring's band, css px either side of its front
const FLOW_PUSH = 3.2
const FLOW_CREST = 34   // the bright band on the flow's front, css px either side
export const FLOW_EDGE = 60  // the soft edge of what the flow hides, css px either side of its front; the page's mask matches it

type Ring = { x: number, y: number, r: number, paint?: number }
// dir 1 runs outward from (x, y), -1 back toward it
export type Flow = { x: number, y: number, r: number, dir: 1 | -1 }

export class DotField {
  private o: FieldOptions
  private v: FieldOptions
  private g: CanvasRenderingContext2D
  private ro: ResizeObserver
  private ptr = { x: 0, y: 0, on: false, speed: 0, t: 0 }
  private rings: Ring[] = []
  private flow: Flow | null = null
  private time = 0
  private acc = 0
  private since = 0
  private lastActive = -Infinity
  private ink = '#1e1e1e'
  private colored = 0
  private w = 0
  private h = 0
  private dpr = 1
  private gap = 6
  private ox = 0
  private oy = 0
  private cols = 0
  private rows = 0
  private n = 0
  private markData: FieldMark | null = null
  private pres = 0      // how far the portrait and wordmark have faded in
  private presAim = 0
  private picture: FieldImage | null = null
  private detail: HTMLCanvasElement | null = null  // the colour circles, painted once per layout
  private detailX = 0
  private detailY = 0
  private covered = 0   // how many dots the portrait covers
  private tiles: number[][] = Array.from({ length: TILE_LEVELS }, () => [])
  private hold: { x: number, y: number } | null = null  // where a wave was sent; the lens waits until the pointer leaves it
  private hx = new Float32Array(0)
  private hy = new Float32Array(0)
  private x = new Float32Array(0)
  private y = new Float32Array(0)
  private vx = new Float32Array(0)
  private vy = new Float32Array(0)
  private bloom = new Float32Array(0)
  private gain = new Float32Array(0)
  private reach = new Float32Array(0)
  private rate = new Float32Array(0)
  private curve = new Float32Array(0)
  private lum = new Float32Array(0)    // the image's lightness under each dot
  private cover = new Float32Array(0)  // how much of the image covers each dot, 0 to 1
  private tone = new Float32Array(0)   // the size each dot takes from the image, 0 to 1
  private aim = new Float32Array(0)    // 1 once a colour wave has passed the dot, 0 once a plain one has
  private hue = new Float32Array(0)    // how far each dot has turned to colour, easing toward aim
  private peek = new Float32Array(0)   // how close the pointer is, easing; flips the dot's look
  private mark = new Float32Array(0)   // how much of the wordmark covers each dot, 0 to 1
  private sx = new Float32Array(0)     // how far each dot is pushed off its breathing home
  private sy = new Float32Array(0)
  private wait = new Float32Array(0)   // seconds a wordmark dot holds before it flies home

  constructor(private canvas: HTMLCanvasElement, options: Partial<FieldOptions> = {}) {
    this.o = this.v = { ...FIELD_DEFAULTS, ...options }
    this.g = canvas.getContext('2d')!
    canvas.style.width = canvas.style.height = '100%'
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(canvas)
    this.resize()
    this.refresh()
  }

  destroy() { this.ro.disconnect() }

  resize() {
    const { width: w, height: h } = this.canvas.getBoundingClientRect()
    if (!w || !h || (w === this.w && h === this.h)) return
    const o = this.o, dpr = this.dpr = Math.min(devicePixelRatio || 1, 2, Math.sqrt(MAX_PIXELS / (w * h)))
    this.w = w; this.h = h
    this.canvas.width = Math.round(w * dpr); this.canvas.height = Math.round(h * dpr)
    // the grid sits on whole device pixels, so the colour picture's cells meet without seams
    const cssGap = parseFloat(getComputedStyle(this.canvas).getPropertyValue('--field-gap'))
    const base = (cssGap > 0 ? cssGap : o.gap) / Math.sqrt(o.density), cap = o.maxDots * o.density
    const gap = this.gap = Math.max(1, Math.ceil(Math.max(base, Math.sqrt(w * h / cap)) * dpr)) / dpr
    const cols = this.cols = Math.ceil(w / gap) + 1, rows = this.rows = Math.ceil(h / gap) + 1, n = this.n = cols * rows
    const ox = this.ox = Math.round((w - (cols - 1) * gap) / 2 * dpr) / dpr, oy = this.oy = Math.round((h - (rows - 1) * gap) / 2 * dpr) / dpr
    for (const k of ['hx', 'hy', 'x', 'y', 'vx', 'vy', 'bloom', 'gain', 'reach', 'rate', 'curve', 'lum', 'cover', 'tone', 'aim', 'hue', 'peek', 'sx', 'sy', 'mark', 'wait'] as const) this[k] = new Float32Array(n)
    this.aim.fill(this.colored); this.hue.fill(this.colored)
    // Homes stay on the exact grid; only each dot's temperament is random, so the pop scatters but the field stays ordered
    const rnd = () => (Math.random() * 2 - 1) * o.jitter
    for (let j = 0, i = 0; j < rows; j++) for (let k = 0; k < cols; k++, i++) {
      this.hx[i] = this.x[i] = ox + k * gap
      this.hy[i] = this.y[i] = oy + j * gap
      this.gain[i] = Math.max(.15, 1 + rnd() * .9)   // how far it swells
      this.reach[i] = 1 + rnd() * .3                 // how early it notices the pointer
      this.rate[i] = .18 * (1 + rnd() * .8)          // how quickly it pops and fades
      this.curve[i] = 1 + rnd() * .8                 // soft or sudden onset
    }
    this.sample()
    this.sampleMark()
    this.draw()
  }

  setMark(mark: FieldMark | null) {
    this.markData = mark
    this.sampleMark()
    this.draw()
  }

  // fade the portrait and the wordmark in or out; `instant` when a flow is hiding the change
  show(visible: boolean, instant = false) {
    this.presAim = visible ? 1 : 0
    if (instant || this.o.still()) { this.pres = this.presAim; this.draw() }
    this.lastActive = this.time
  }

  setFlow(flow: Flow | null) {
    this.flow = flow
    this.lastActive = this.time
  }

  private grid() { return { gap: this.gap, ox: this.ox, oy: this.oy, cols: this.cols, rows: this.rows } }

  private sampleMark() {
    this.mark.fill(0)
    if (this.markData && this.n) cells(this.markData.source, this.markData.box, this.grid(), (i, data, at) => { this.mark[i] = data[at + 3] / 255 })
  }

  // The wordmark's dots scatter across the screen and fly home, left to right
  assemble() {
    const box = this.markData?.box
    if (this.o.still() || !box) return
    const { mark, hx, hy, x, y, vx, vy, wait } = this, spread = Math.max(this.w, this.h) * .45
    for (let i = 0; i < this.n; i++) {
      if (mark[i] < .05) continue
      const a = Math.random() * Math.PI * 2, d = 120 + Math.random() * spread
      x[i] = hx[i] + Math.cos(a) * d; y[i] = hy[i] + Math.sin(a) * d * .7
      vx[i] = vy[i] = 0
      wait[i] = .1 + (hx[i] - box.x) / box.w * .8 + Math.random() * .35
    }
    this.lastActive = this.time + 2
  }

  setImage(picture: FieldImage | null) {
    this.picture = picture
    this.sample()
    this.draw()
  }

  // Read the portrait at one grid cell per dot, so each dot takes the average of the patch it stands for
  private sample() {
    this.cover.fill(0)
    this.detail = null
    const pic = this.picture
    if (pic?.image.naturalWidth && this.n) {
      const fit = Math.min(pic.w / pic.image.naturalWidth, pic.h / pic.image.naturalHeight)
      const dw = pic.image.naturalWidth * fit, dh = pic.image.naturalHeight * fit
      const left = pic.x + (pic.w - dw) / 2, top = pic.y + pic.h - dh
      cells(pic.image, { x: left, y: top, w: dw, h: dh }, this.grid(), (i, data, at) => {
        this.cover[i] = data[at + 3] / 255
        this.lum[i] = (data[at] * .299 + data[at + 1] * .587 + data[at + 2] * .114) / 255
      })
      this.paintDetail(pic.image, left, top, dw, dh)
    }
    this.covered = 0
    for (let i = 0; i < this.n; i++) if (this.cover[i]) this.covered++
    this.shade()
  }

  // The colour picture: the photo itself, kept only inside one round window per field cell, so every dot of the
  // black and white portrait becomes a circle that holds its own piece of the real image, with all its colours.
  // The gaps between the circles are near black in either theme, so on light paper the picture keeps its depth
  // instead of breaking up into the page. It is painted once here; draw() moves each dot's circle along with the dot.
  private paintDetail(image: HTMLImageElement, left: number, top: number, dw: number, dh: number) {
    const { gap, dpr } = this
    const cornerX = this.hx[0] - gap / 2, cornerY = this.hy[0] - gap / 2
    // start on a cell corner, one cell outside the image, so every source cell is whole pixels
    const x0 = this.detailX = cornerX + Math.floor((left - gap - cornerX) / gap) * gap
    const y0 = this.detailY = cornerY + Math.floor((top - gap - cornerY) / gap) * gap
    const out = this.detail = document.createElement('canvas')
    out.width = Math.ceil((left + dw + gap - x0) * dpr); out.height = Math.ceil((top + dh + gap - y0) * dpr)
    const g = out.getContext('2d')!
    g.setTransform(dpr, 0, 0, dpr, -x0 * dpr, -y0 * dpr)
    // a touch brighter and crisper, so a dark coat still reads on a dark ground
    g.filter = 'brightness(1.12) contrast(1.06) saturate(1.1)'
    g.drawImage(image, left, top, dw, dh)
    g.filter = 'none'
    const size = Math.max(2, Math.round(gap * dpr))
    const dot = document.createElement('canvas')
    dot.width = dot.height = size
    const dg = dot.getContext('2d')!
    dg.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    dg.fill()
    const lattice = g.createPattern(dot, 'repeat')!
    lattice.setTransform(new DOMMatrix().translate(cornerX, cornerY).scale(gap / size))
    g.globalCompositeOperation = 'destination-in'
    g.fillStyle = lattice
    g.fillRect(x0, y0, out.width / dpr, out.height / dpr)
    // the backing under the circles: the cutout's own silhouette in one dark tone, so its edge stays smooth
    const shape = document.createElement('canvas')
    shape.width = out.width; shape.height = out.height
    const sg = shape.getContext('2d')!
    sg.setTransform(dpr, 0, 0, dpr, -x0 * dpr, -y0 * dpr)
    sg.drawImage(image, left, top, dw, dh)
    sg.globalCompositeOperation = 'source-in'
    sg.fillStyle = PORTRAIT_GAP
    sg.fillRect(x0, y0, out.width / dpr, out.height / dpr)
    g.setTransform(1, 0, 0, 1, 0, 0)
    g.globalCompositeOperation = 'destination-over'
    g.drawImage(shape, 0, 0)
    g.globalCompositeOperation = 'source-over'
  }

  // Turn the sampled lightness into dot sizes for the current theme. Dark dots on paper read the photo directly.
  // Light dots on a dark page need more care, or the skin's mid-tones all reach full size and the face becomes one
  // bright patch: the subject's tones are stretched so its darkest and lightest few percent reach the ends, and a
  // curve saves the biggest dots for real highlights. A floor keeps the outline (dark hair on a dark page, a white
  // shirt on paper) visible.
  private shade() {
    const { cover, lum, tone } = this, invert = this.v.invert
    if (!invert) {
      for (let i = 0; i < this.n; i++) tone[i] = cover[i] && cover[i] * (.2 + .8 * Math.pow(1 - lum[i], .85))
      return
    }
    const counts = new Uint32Array(64)
    let total = 0
    for (let i = 0; i < this.n; i++) if (cover[i] > .5) { counts[Math.min(63, lum[i] * 64 | 0)]++; total++ }
    const at = (share: number) => { let sum = 0; for (let b = 0; b < 64; b++) if ((sum += counts[b]) >= total * share) return b / 63; return 1 }
    const lo = total ? at(.03) : 0, hi = total ? Math.max(lo + .1, at(.995)) : 1
    for (let i = 0; i < this.n; i++) {
      const l = Math.min(1, Math.max(0, (lum[i] - lo) / (hi - lo)))
      tone[i] = cover[i] && cover[i] * (.2 + .8 * Math.pow(l, 2))
    }
  }

  // Re-read the dot colour and the per-theme CSS overrides, e.g. after a theme switch
  refresh() {
    const css = getComputedStyle(this.canvas)
    this.ink = this.o.color || css.getPropertyValue('--ink').trim() || '#1e1e1e'
    this.v = { ...this.o }
    for (const [k, name] of Object.entries(CSS_VARS) as [keyof typeof CSS_VARS, string][]) {
      const n = parseFloat(css.getPropertyValue(name))
      if (!Number.isNaN(n)) this.v[k] = n
    }
    this.shade()
    this.draw()
  }

  // Coordinates are local to the canvas, in css px
  pointer(x: number, y: number, t: number) {
    const p = this.ptr
    if (p.on) p.speed = Math.max(p.speed, Math.hypot(x - p.x, y - p.y) / Math.max(1, t - p.t))
    Object.assign(p, { x, y, t, on: true })
    this.lastActive = this.time
  }

  leave() { this.ptr.on = false }

  ripple(x: number, y: number) {
    if (this.o.still()) return
    this.rings.push({ x, y, r: 0 })
    this.lastActive = this.time
  }

  // A colour wave from (x, y): the image turns to colour where the ring passes, and the next wave turns it back.
  // Returns whether the image is now in colour.
  wave(x: number, y: number) {
    this.colored = this.colored ? 0 : 1
    this.hold = { x, y }
    if (this.o.still()) { this.aim.fill(this.colored); this.hue.fill(this.colored); this.draw(); return this.colored === 1 }
    this.rings.push({ x, y, r: 0, paint: this.colored })
    this.lastActive = this.time
    return this.colored === 1
  }

  tick(dt: number) {
    if (this.o.still() || !this.n) return
    // at most two steps a frame, so one slow frame does not make the next one slower
    this.acc = Math.min(this.acc + dt, STEP * 2)
    this.since += dt
    const idle = !this.rings.length && !this.flow && this.time - this.lastActive > 1.5
    // with no portrait or wordmark to breathe, a settled field looks the same every frame: stop drawing it
    if (idle && !this.pres && !this.presAim) return
    if (idle && this.since < 1 / this.o.idleFps) return
    this.since = 0
    let ran = false
    while (this.acc >= STEP) { this.step(); this.acc -= STEP; ran = true }
    if (ran) this.draw()
  }

  private step() {
    const o = this.o, t = this.time += STEP, p = this.ptr
    const { hx, hy, x, y, vx, vy, sx, sy, bloom, gain, reach, rate, curve, cover, aim, hue, peek, mark, wait } = this
    const far = Math.hypot(this.w, this.h)
    for (const r of this.rings) r.r += o.ringSpeed * STEP
    this.rings = this.rings.filter(r => r.r < far)
    if (this.rings.length) this.lastActive = t
    if (this.pres !== this.presAim) {
      this.pres += (this.presAim - this.pres) * .07
      if (Math.abs(this.presAim - this.pres) < .004) this.pres = this.presAim
      this.lastActive = t
    }
    const shove = this.v.push * (.35 + Math.min(p.speed, 3))
    p.speed *= .9
    const P = o.peekRadius
    // after a wave, show the picture whole until the pointer moves away from where it clicked
    if (this.hold && p.on && Math.hypot(p.x - this.hold.x, p.y - this.hold.y) > 36) this.hold = null
    const lens = p.on && !this.hold && this.pres > .5 && !this.flow
    const fl = this.flow, fin2 = fl ? Math.max(0, fl.r - FLOW_WIDTH) ** 2 : 0, fout2 = fl ? (fl.r + FLOW_WIDTH) ** 2 : 0
    let turning = false

    for (let i = 0; i < this.n; i++) {
      if (wait[i] > 0) { wait[i] = Math.max(0, wait[i] - STEP); turning = true; continue }
      // the breathing: two slow sines move the home cell a couple of px
      // only the portrait and the wordmark breathe: plain background dots are smaller than a pixel, and drifting
      // by fractions of one makes the whole grid shimmer
      const br = cover[i] || mark[i] ? o.breathe : 0
      const homeX = hx[i] + Math.sin(hy[i] * .011 + t * .8) * br
      const homeY = hy[i] + Math.cos(hx[i] * .009 + t * .65) * br
      let ax = (homeX - x[i]) * o.spring, ay = (homeY - y[i]) * o.spring, near = 0, look = 0

      if (p.on) {
        const dx = x[i] - p.x, dy = y[i] - p.y, R = o.repelRadius * reach[i]
        const d = dx > R || dx < -R || dy > R || dy < -R ? R : Math.hypot(dx, dy)
        if (d < R && d > .01) {
          near = 1 - d / R
          // the colour picture gives way like the rest of the field, its circles carrying the photo with them
          const f = near * near * shove
          ax += dx / d * f; ay += dy / d * f
        }
        // the spotlight measures from the home cell, so it holds steady while the dots scatter
        if (cover[i] && lens) {
          const hdx = hx[i] - p.x, hdy = hy[i] - p.y
          if (hdx < P && hdx > -P && hdy < P && hdy > -P) {
            const k = Math.max(0, 1 - Math.hypot(hdx, hdy) / P)
            look = k * k * (3 - 2 * k)
          }
        }
      }
      for (const r of this.rings) {
        const dx = x[i] - r.x, dy = y[i] - r.y, d = Math.hypot(dx, dy), edge = Math.abs(d - r.r)
        if (r.paint !== undefined && d < r.r) aim[i] = r.paint
        if (edge < o.ringWidth && d > .01) {
          const k = (1 - edge / o.ringWidth) * (1 - r.r / far)
          ax += dx / d * k * o.ringPush; ay += dy / d * k * o.ringPush
          near = Math.max(near, k * .5)
        }
      }
      // the flow's front carries the dots along the way it is running
      if (fl) {
        const dx = x[i] - fl.x, dy = y[i] - fl.y, d2 = dx * dx + dy * dy
        if (d2 > fin2 && d2 < fout2 && d2 > .0001) {
          const d = Math.sqrt(d2), k = 1 - Math.abs(d - fl.r) / FLOW_WIDTH
          ax += fl.dir * dx / d * k * FLOW_PUSH; ay += fl.dir * dy / d * k * FLOW_PUSH
          near = Math.max(near, k * .75)
        }
      }
      vx[i] = (vx[i] + ax) * o.friction; vy[i] = (vy[i] + ay) * o.friction
      x[i] += vx[i]; y[i] += vy[i]
      sx[i] = x[i] - homeX; sy[i] = y[i] - homeY
      const want = near > 0 ? Math.min(1, Math.pow(near, curve[i]) * gain[i]) : 0
      if (want || bloom[i] > .001) bloom[i] += (want - bloom[i]) * rate[i]; else bloom[i] = 0
      if (hue[i] !== aim[i]) {
        const next = hue[i] + (aim[i] - hue[i]) * .11
        hue[i] = Math.abs(aim[i] - next) < .004 ? aim[i] : next
        turning = true
      }
      if (peek[i] !== look) {
        const next = peek[i] + (look - peek[i]) * .16
        peek[i] = Math.abs(look - next) < .004 ? look : next
        turning = true
      }
    }
    if (turning) this.lastActive = t
  }

  // Dots are bucketed by alpha so a frame is a handful of fills, not one per dot. Resting dots are sub-pixel,
  // so they draw as squares (identical at that size, much cheaper); only image and blooming dots draw as circles.
  // Where the image shows in colour, each dot draws its colour circle instead, faded in TILE_LEVELS steps.
  private draw() {
    if (!this.n) return
    const { g, dpr, x, y, hx, hy, sx, sy, bloom, tone, cover, hue, peek, mark, v, gap, detail, tiles, pres } = this
    const full = gap * .56
    // where the highlight is in its sweep through the wordmark, if it is crossing now
    const box = this.markData?.box, phase = this.time % SHINE_EVERY, band = 150
    const sweep = box && phase < SHINE_FOR ? box.x - band + phase / SHINE_FOR * (box.w + band * 2) : null
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    g.clearRect(0, 0, this.w, this.h)
    g.fillStyle = this.ink
    const paths = Array.from({ length: BUCKETS }, () => new Path2D())
    for (const list of tiles) list.length = 0
    const fl = this.flow
    for (let i = 0; i < this.n; i++) {
      let b = Math.min(1, bloom[i] * v.bloom), pv = pres
      if (fl) {
        // the flow's front is a bright band that keeps up with it, and inside the front the portrait and
        // wordmark are washed away
        const dx = hx[i] - fl.x, dy = hy[i] - fl.y, d = Math.sqrt(dx * dx + dy * dy), c = 1 - Math.abs(d - fl.r) / FLOW_CREST
        if (c > 0) b = Math.max(b, c * c)
        if (pv && (cover[i] || mark[i])) {
          const u = Math.min(1, Math.max(0, (d - fl.r) / (2 * FLOW_EDGE) + .5))
          pv *= u * u * (3 - 2 * u)
        }
      }
      // the waves set how far a dot shows its colour, and the pointer turns that the other way nearby
      const m = cover[i] && detail ? (hue[i] + (1 - 2 * hue[i]) * peek[i]) * pv : 0
      if (m > .02) tiles[Math.min(TILE_LEVELS - 1, Math.floor(m * TILE_LEVELS))].push(i)
      if (m > .98) continue
      let t = tone[i] * pv
      if (mark[i] && pv) {
        // flying dots stay small and swell as they arrive; the highlight runs on a slant
        const arrive = 1 - Math.min(1, Math.hypot(x[i] - hx[i], y[i] - hy[i]) / 220)
        const s = sweep === null ? 0 : Math.max(0, 1 - Math.abs(hx[i] + (hy[i] - box!.y) * .35 - sweep) / band)
        t = Math.max(t, pv * mark[i] * (MARK_TONE + (1 - MARK_TONE) * s * s * (3 - 2 * s)) * arrive)
      }
      const r = (v.dot + t * (full - v.dot)) * (1 - m) + v.dot * b * v.swell
      // a dot's brightness follows its size; on a dark page more gently, so mid-tones stay mid-grey
      const k = Math.round(Math.min(1, Math.max(b, t * (v.invert ? 1.25 : 1.8))) * (BUCKETS - 1))
      // sub-pixel dots draw as squares on whole device pixels, so a resting grid stays crisp instead of blurring
      if (r < 1) { paths[k].rect(Math.round((x[i] - r) * dpr) / dpr, Math.round((y[i] - r) * dpr) / dpr, Math.max(1 / dpr, Math.round(r * 2 * dpr) / dpr), Math.max(1 / dpr, Math.round(r * 2 * dpr) / dpr)); continue }
      paths[k].moveTo(x[i] + r, y[i])
      paths[k].arc(x[i], y[i], r, 0, Math.PI * 2)
    }
    paths.forEach((path, k) => {
      g.globalAlpha = v.restAlpha + (1 - v.restAlpha) * k / (BUCKETS - 1)
      g.fill(path)
    })
    if (detail) {
      // Colour circles the pointer, a wave or a flow is pushing move with their dots, each carrying its piece of the
      // photo. The rest sit on their home cells, on whole pixels, and are drawn a level at a time as the whole
      // colour picture seen through their cells: a draw per level instead of one per dot, so a phone keeps up.
      const cell = Math.round(gap * dpr) / dpr, cellPx = Math.round(gap * dpr), half = gap / 2, snap = (n: number) => Math.round(n * dpr) / dpr
      const dx0 = snap(this.detailX), dy0 = snap(this.detailY), dw = detail.width / dpr, dh = detail.height / dpr
      const settle = .6  // css px a circle may be off home and still draw at home
      tiles.forEach((list, level) => {
        if (!list.length) return
        g.globalAlpha = (level + 1) / TILE_LEVELS
        let home: Path2D | null = null, settled = 0
        // moving circles are grouped by how far they have moved, to the nearest css px: each group is the picture
        // drawn once, shifted by that much, through its circles' home cells. A few groups have a single circle;
        // those are cheaper drawn on their own.
        const moved = new Map<number, number[]>()
        for (const i of list) {
          if (Math.abs(sx[i]) < settle && Math.abs(sy[i]) < settle) {
            (home ??= new Path2D()).rect(snap(hx[i] - half), snap(hy[i] - half), cell, cell)
            settled++
            continue
          }
          const key = (Math.round(sx[i]) + 512) * 1024 + Math.round(sy[i]) + 512
          const group = moved.get(key)
          if (group) group.push(i); else moved.set(key, [i])
        }
        for (const [key, group] of moved) {
          const ox = Math.floor(key / 1024) - 512, oy = key % 1024 - 512
          if (group.length < 4) {
            for (const i of group) g.drawImage(detail, Math.round((hx[i] - half - this.detailX) * dpr), Math.round((hy[i] - half - this.detailY) * dpr), cellPx, cellPx,
              snap(hx[i] + ox - half), snap(hy[i] + oy - half), cell, cell)
            continue
          }
          const cells = new Path2D()
          for (const i of group) cells.rect(snap(hx[i] + ox - half), snap(hy[i] + oy - half), cell, cell)
          g.save(); g.clip(cells)
          g.drawImage(detail, dx0 + ox, dy0 + oy, dw, dh)
          g.restore()
        }
        if (!home) return
        // every covered dot settled at this level: the picture needs no clip
        const whole = settled === this.covered
        if (!whole) { g.save(); g.clip(home) }
        g.drawImage(detail, dx0, dy0, dw, dh)
        if (!whole) g.restore()
      })
    }
    g.globalAlpha = 1
  }
}
