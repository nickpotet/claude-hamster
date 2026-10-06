// Segmented pixel bars, drawn like the hamster: hard edges, whole pixels.
// A filled cell has a light top edge; a half cell is dimmed; an empty cell
// is a faint track that reads on a light and on a dark background alike.

const CELL = 6
const GAP = 1
const HEIGHT = 8

export const barWidth = (cells: number) => cells * (CELL + GAP) - GAP

export const barSvg = (value: number, color: string, cells = 12) => {
  const full = (Math.max(0, Math.min(100, value)) / 100) * cells
  const parts: string[] = []

  for (let i = 0; i < cells; i++) {
    const x = i * (CELL + GAP)
    const share = Math.max(0, Math.min(1, full - i))

    if (share >= 0.99) {
      parts.push(`<rect x="${x}" y="0" width="${CELL}" height="${HEIGHT}" fill="${color}"/>`)
      parts.push(`<rect x="${x}" y="0" width="${CELL}" height="2" fill="#fff" fill-opacity="0.32"/>`)
    } else if (share > 0.45) {
      parts.push(`<rect x="${x}" y="0" width="${CELL}" height="${HEIGHT}" fill="${color}" fill-opacity="0.5"/>`)
    } else {
      parts.push(`<rect x="${x}" y="0" width="${CELL}" height="${HEIGHT}" fill="#888" fill-opacity="0.22"/>`)
    }
  }

  const w = barWidth(cells)

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${HEIGHT}" width="${w}" height="${HEIGHT}" shape-rendering="crispEdges">${parts.join('')}</svg>`
}

export const BAR_HEIGHT = HEIGHT

// The colours: gold for experience, and for the context the same steps as
// the advice (calm up to 60%, amber to 80%, then red).
export const GOLD = '#e0b04a'
export const JOY = '#e68fb0'
export const contextColor = (percent: number) =>
  percent >= 80 ? '#e5584d' : percent >= 60 ? '#f2a33a' : '#58b368'
