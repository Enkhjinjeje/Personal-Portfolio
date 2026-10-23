// Dot-field background, ported from the dualscroll component: every dot is a damped spring tied to its grid
// cell, and one pass per frame moves and paints them all. The pointer pushes dots away and blooms them, and a
// slow wave nudges the home cells so the field never sits frozen. An image can be
// set into the field: under it each dot grows with the picture's tone, like a halftone screen, and the dots
// keep their size as the pointer scatters them. A colour wave turns each dot it passes into a circle holding
// its piece of the photo, and the next wave turns them back; near the pointer the image shows the other
// way round, in colour while it is black and white and in black and white while it is in colour. A wordmark can
// be set into the field too: its dots gather from across the screen into the letters, and a soft highlight
// sweeps through them every few seconds.
export const FIELD_DEFAULTS = {
  gap: 6,            // grid spacing, css px
  dot: .42,          // resting radius
  maxDots: 40000,    // spacing widens past this so big screens stay at 60fps
  restAlpha: .2,
  spring: .055,      // pull back toward home, per 60Hz step
  friction: .82,     // velocity kept per step
  repelRadius: 48,   // pointer reach
  push: 1.1,         // pointer shove, scaled up by pointer speed
  swell: 1.8,        // how much a fully bloomed dot grows (× radius)
  bloom: 1,          // 0 = displacement only, no swell or darkening
  jitter: .7,        // 0 = every dot pops alike; higher = each dot's swell, reach and timing vary more
  ringSpeed: 620,    // px/s
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

type Ring = { x: number, y: number, r: number, paint: number }
type Box = { x: number, y: number, w: number, h: number }
// The portrait: fitted inside the box (canvas css px) and sitting on its bottom edge
export type FieldImage = Box & { image: HTMLImageElement }

export class DotField {
  private o: FieldOptions
  private v: FieldOptions
  private g: CanvasRenderingContext2D
  private ro: ResizeObserver
  private ptr = { x: 0, y: 0, on: false, speed: 0, t: 0 }
  private rings: Ring[] = []
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
  private markSource: CanvasImageSource | null = null
  private markBox: Box | null = null
  private picture: FieldImage | null = null
  private detail: HTMLCanvasElement | null = null  // the colour circles, painted once per layout
  private detailX = 0
  private detailY = 0
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
  private sx = new Float32Array(0)     // how far each dot is pushed off its breathing home
  private sy = new Float32Array(0)
  private mark = new Float32Array(0)   // how much of the wordmark covers each dot, 0 to 1
  private wait = new Float32Array(0)   // seconds a wordmark dot holds before it flies home

  constructor(private canvas: HTMLCanvasElement, options: Partial<FieldOptions> = {}) {
    this.o = this.v = { ...FIELD_DEFAULTS, ...options }
    this.g = canvas.getContext('2d')!
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
    const gap = this.gap = Math.ceil(Math.max(o.gap, Math.sqrt(w * h / o.maxDots)) * dpr) / dpr
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

  // Set a wordmark into the field: `source` is drawn into `box` (canvas css px) and each dot it covers grows
  set markImage(value: { source: CanvasImageSource, box: Box } | null) {
    this.markSource = value?.source ?? null
    this.markBox = value?.box ?? null
    this.sampleMark()
    this.draw()
  }

  private sampleMark() {
    this.mark.fill(0)
    if (!this.markSource || !this.markBox) return
    this.eachCell(this.markSource, this.markBox, (i, data, at) => { this.mark[i] = data[at + 3] / 255 })
  }

  // Draw `src` into `box` averaged down to one pixel per field cell, lined up with the grid, and visit every cell
  // it reaches with that cell's dot index and its RGBA at data[at]
  private eachCell(src: CanvasImageSource, box: Box, visit: (i: number, data: Uint8ClampedArray, at: number) => void) {
    const { gap, ox, oy, cols, rows } = this
    if (!this.n) return
    const k0 = Math.max(0, Math.floor((box.x - ox) / gap)), k1 = Math.min(cols - 1, Math.ceil((box.x + box.w - ox) / gap))
    const j0 = Math.max(0, Math.floor((box.y - oy) / gap)), j1 = Math.min(rows - 1, Math.ceil((box.y + box.h - oy) / gap))
    const w = k1 - k0 + 1, h = j1 - j0 + 1
    if (w < 1 || h < 1) return
    const cells = document.createElement('canvas')
    cells.width = w; cells.height = h
    const g = cells.getContext('2d', { willReadFrequently: true })!
    g.imageSmoothingQuality = 'high'
    // cell k covers [ox + (k - .5) gap, ox + (k + .5) gap]
    g.drawImage(src, (box.x - (ox + (k0 - .5) * gap)) / gap, (box.y - (oy + (j0 - .5) * gap)) / gap, box.w / gap, box.h / gap)
    const data = g.getImageData(0, 0, w, h).data
    for (let j = 0; j < h; j++) for (let k = 0; k < w; k++) visit((j0 + j) * cols + k0 + k, data, (j * w + k) * 4)
  }

  // The wordmark's dots scatter across the screen and fly home, left to right
  assemble() {
    const box = this.markBox
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
      this.eachCell(pic.image, { x: left, y: top, w: dw, h: dh }, (i, data, at) => {
        this.cover[i] = data[at + 3] / 255
        this.lum[i] = (data[at] * .299 + data[at + 1] * .587 + data[at + 2] * .114) / 255
      })
      this.paintDetail(pic.image, left, top, dw, dh)
    }
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

  // Turn the sampled lightness into dot sizes for the current theme
  private shade() {
    const { cover, lum, tone } = this, invert = this.v.invert
    for (let i = 0; i < this.n; i++) {
      // a floor keeps the outline: hair on a dark ground or a white shirt on paper still gets a visible dot
      tone[i] = cover[i] && cover[i] * (.2 + .8 * Math.pow(invert ? lum[i] : 1 - lum[i], .85))
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
    this.acc = Math.min(this.acc + dt, STEP * 4)
    this.since += dt
    const idle = !this.rings.length && this.time - this.lastActive > 1.5
    if (idle && this.since < 1 / this.o.idleFps) return
    this.since = 0
    let ran = false
    while (this.acc >= STEP) { this.step(); this.acc -= STEP; ran = true }
    if (ran) this.draw()
  }

  private step() {
    const o = this.o, t = this.time += STEP, p = this.ptr
    const { hx, hy, x, y, vx, vy, sx, sy, bloom, gain, reach, rate, curve, cover, aim, hue, peek, wait } = this
    const far = Math.hypot(this.w, this.h)
    for (const r of this.rings) r.r += o.ringSpeed * STEP
    this.rings = this.rings.filter(r => r.r < far)
    if (this.rings.length) this.lastActive = t
    const shove = this.v.push * (.35 + Math.min(p.speed, 3))
    p.speed *= .9
    const P = o.peekRadius
    // after a wave, show the picture whole until the pointer moves away from where it clicked
    if (this.hold && p.on && Math.hypot(p.x - this.hold.x, p.y - this.hold.y) > 36) this.hold = null
    const lens = p.on && !this.hold
    let turning = false

    for (let i = 0; i < this.n; i++) {
      if (wait[i] > 0) { wait[i] = Math.max(0, wait[i] - STEP); turning = true; continue }
      // the breathing: two slow sines move the home cell a couple of px
      const homeX = hx[i] + Math.sin(hy[i] * .011 + t * .8) * o.breathe
      const homeY = hy[i] + Math.cos(hx[i] * .009 + t * .65) * o.breathe
      let ax = (homeX - x[i]) * o.spring, ay = (homeY - y[i]) * o.spring, near = 0, look = 0

      if (p.on) {
        const dx = x[i] - p.x, dy = y[i] - p.y, R = o.repelRadius * reach[i]
        const d = dx > R || dx < -R || dy > R || dy < -R ? R : Math.hypot(dx, dy)
        if (d < R && d > .01) {
          near = 1 - d / R
          // the colour picture holds together more, so the face stays readable under the pointer
          const f = near * near * shove * (cover[i] ? 1 - .65 * hue[i] : 1)
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
        if (d < r.r) aim[i] = r.paint
        if (edge < o.ringWidth && d > .01) {
          const k = (1 - edge / o.ringWidth) * (1 - r.r / far)
          ax += dx / d * k * o.ringPush; ay += dy / d * k * o.ringPush
          near = Math.max(near, k * .5)
        }
      }
      vx[i] = (vx[i] + ax) * o.friction; vy[i] = (vy[i] + ay) * o.friction
      x[i] += vx[i]; y[i] += vy[i]
      sx[i] = x[i] - homeX; sy[i] = y[i] - homeY
      const want = near > 0 ? Math.min(1, Math.pow(near, curve[i]) * gain[i]) : 0
      if (want || bloom[i] > .001) bloom[i] += (want - bloom[i]) * rate[i]; else bloom[i] = 0
      if (hue[i] !== aim[i]) {
        const next = hue[i] + (aim[i] - hue[i]) * .09
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
    const { g, dpr, x, y, hx, hy, sx, sy, bloom, tone, cover, hue, peek, mark, v, gap, detail, tiles } = this
    const full = gap * .56
    // where the highlight is in its sweep through the wordmark, if it is crossing now
    const box = this.markBox, phase = this.time % SHINE_EVERY, band = 150
    const sweep = box && phase < SHINE_FOR ? box.x - band + phase / SHINE_FOR * (box.w + band * 2) : null
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    g.clearRect(0, 0, this.w, this.h)
    g.fillStyle = this.ink
    const paths = Array.from({ length: BUCKETS }, () => new Path2D())
    for (const list of tiles) list.length = 0
    for (let i = 0; i < this.n; i++) {
      const b = Math.min(1, bloom[i] * v.bloom)
      // the waves set how far a dot shows its colour, and the pointer turns that the other way nearby
      const m = cover[i] && detail ? hue[i] + (1 - 2 * hue[i]) * peek[i] : 0
      if (m > .02) tiles[Math.min(TILE_LEVELS - 1, Math.floor(m * TILE_LEVELS))].push(i)
      if (m > .98) continue
      let t = tone[i]
      if (mark[i]) {
        // flying dots stay small and swell as they arrive; the highlight runs on a slant
        const arrive = 1 - Math.min(1, Math.hypot(x[i] - hx[i], y[i] - hy[i]) / 220)
        const s = sweep === null ? 0 : Math.max(0, 1 - Math.abs(hx[i] + (hy[i] - box!.y) * .35 - sweep) / band)
        t = Math.max(t, mark[i] * (MARK_TONE + (1 - MARK_TONE) * s * s * (3 - 2 * s)) * arrive)
      }
      const r = (v.dot + t * (full - v.dot)) * (1 - m) + v.dot * b * v.swell
      const k = Math.round(Math.min(1, Math.max(b, t * 1.8)) * (BUCKETS - 1))
      if (r < 1) { paths[k].rect(x[i] - r, y[i] - r, r * 2, r * 2); continue }
      paths[k].moveTo(x[i] + r, y[i])
      paths[k].arc(x[i], y[i], r, 0, Math.PI * 2)
    }
    paths.forEach((path, k) => {
      g.globalAlpha = v.restAlpha + (1 - v.restAlpha) * k / (BUCKETS - 1)
      g.fill(path)
    })
    if (detail) {
      // cells leave out the breathing and land on whole pixels, so a still picture is seamless and sharp
      const cell = Math.round(gap * dpr), half = gap / 2, snap = (n: number) => Math.round(n * dpr) / dpr
      tiles.forEach((list, level) => {
        g.globalAlpha = (level + 1) / TILE_LEVELS
        for (const i of list) {
          g.drawImage(detail, Math.round((hx[i] - half - this.detailX) * dpr), Math.round((hy[i] - half - this.detailY) * dpr), cell, cell,
            snap(hx[i] + sx[i] - half), snap(hy[i] + sy[i] - half), cell / dpr, cell / dpr)
        }
      })
    }
    g.globalAlpha = 1
  }
}
