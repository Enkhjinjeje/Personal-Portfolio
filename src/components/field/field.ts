// Shared by the dot field and the page: the boxes and images it draws, and how it reads them onto its grid

export type Box = { x: number, y: number, w: number, h: number }
// The portrait: fitted inside the box (canvas css px) and sitting on its bottom edge
export type FieldImage = Box & { image: HTMLImageElement }
// The wordmark: `source` is drawn into `box`, and each cell it covers takes the letters' coverage
export type FieldMark = { source: CanvasImageSource, box: Box }

export type Grid = { gap: number, ox: number, oy: number, cols: number, rows: number }

// Draw `src` into `box` averaged down to one pixel per grid cell, lined up with the grid (cell k is centred on
// ox + k * gap), and visit every cell it reaches with that cell's index and its RGBA at data[at]
export function cells(src: CanvasImageSource, box: Box, grid: Grid, visit: (i: number, data: Uint8ClampedArray, at: number) => void) {
  const { gap, ox, oy, cols, rows } = grid
  const k0 = Math.max(0, Math.floor((box.x - ox) / gap)), k1 = Math.min(cols - 1, Math.ceil((box.x + box.w - ox) / gap))
  const j0 = Math.max(0, Math.floor((box.y - oy) / gap)), j1 = Math.min(rows - 1, Math.ceil((box.y + box.h - oy) / gap))
  const w = k1 - k0 + 1, h = j1 - j0 + 1
  if (w < 1 || h < 1) return
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const g = canvas.getContext('2d', { willReadFrequently: true })!
  g.imageSmoothingQuality = 'high'
  // cell k covers [ox + (k - .5) gap, ox + (k + .5) gap]
  g.drawImage(src, (box.x - (ox + (k0 - .5) * gap)) / gap, (box.y - (oy + (j0 - .5) * gap)) / gap, box.w / gap, box.h / gap)
  const data = g.getImageData(0, 0, w, h).data
  for (let j = 0; j < h; j++) for (let k = 0; k < w; k++) visit((j0 + j) * cols + k0 + k, data, (j * w + k) * 4)
}
