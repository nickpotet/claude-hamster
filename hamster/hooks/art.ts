import type { Pet } from '../types'

import { animationAt } from './anim'
import type { Anim } from './anim'
import { GEAR, TOMBSTONE } from './gear'
import type { Scene } from './gear'
import { COLOR } from './palette'
import type { Key } from './palette'
import { levelOf, moodOf } from './pet'
import { play } from './play'

const W = 48
const H = 34
const SCALE = 7
const GROUND = 31

type Ellipse = readonly [number, number, number, number]

const inside = (x: number, y: number, [cx, cy, rx, ry]: Ellipse) =>
  ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1

// The shading contour: below 1 is inside the ellipse.
const field = (x: number, y: number, [cx, cy, rx, ry]: Ellipse) =>
  ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2

// The outline takes a dark version of the fur it wraps.
const OUTLINE: Partial<Record<Key, Key>> = { O: 'k', L: 'k', C: 'c', P: 'k', M: 'k' }

const rect = (x: number, y: number, w: number, color: Key) =>
  `<rect x="${x}" y="${y}" width="${w}" height="1" fill="${COLOR[color]}"/>`

// A side view of a golden hamster, facing right, drawn pixel by pixel.
// No mouth and no smile. The body follows the food: a bare-ribbed skeleton
// near zero, a stuffed ball at a hundred, and at zero it lies dead belly up
// beside a tombstone, with crosses for eyes. Each level has its own gear
// (see gear.ts), and now and then it does something (see anim.ts). It never
// bobs: it sits still between shows. `tick` counts every half second, the
// blink comes every eighteenth. `forced` shows one show regardless of the clock.
export const hamsterSvg = (
  pet: Pet,
  tick = 0,
  forced?: Anim | null,
  alert: 'warn' | 'urgent' | null = null,
) => {
  const mood = moodOf(pet)
  const isDead = mood === 'dead'
  const level = levelOf(pet.xp)
  const f = Math.max(0, Math.min(1, pet.food / 100))
  const frame = Math.floor(tick / 3)
  const anim = isDead ? null : forced !== undefined ? forced : animationAt(tick, level)
  const name = anim?.name
  const step = anim?.step ?? 0
  const isFlat =
    mood === 'hungry' ||
    mood === 'bored' ||
    isDead ||
    (name === 'earflick' && [1, 2, 5, 6].includes(step)) ||
    name === 'sleep'
  const isBlink =
    !isDead &&
    (tick % 18 === 17 ||
      mood === 'bored' ||
      name === 'sleep' ||
      name === 'groom' ||
      name === 'yawn')
  const sniff = name === 'sniff' && step % 2 === 1
  // The only vertical motion there is: the slow breath of sleep and the
  // shaking of a dig. Idle, the hamster does not bob.
  const dy = name === 'dig' ? step % 2 : name === 'sleep' ? Math.floor(step / 4) % 2 : 0

  const bodyRy = 5 + 7.5 * f
  const bodyRx = 11 + 6.5 * f
  const bodyCy = GROUND - bodyRy
  const headCy = GROUND - 9 - 5 * f
  const cheek = 3.5 + 4 * f + (name === 'munch' && step % 2 === 1 ? 1 : 0)
  const hy = Math.round(headCy)

  const grid: (Key | null)[][] = Array.from({ length: H }, () =>
    Array.from({ length: W }, () => null),
  )
  const paint = (shape: Ellipse, color: (x: number, y: number) => Key) => {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (inside(x, y - dy, shape)) {
          grid[y]![x] = color(x, y - dy)
        }
      }
    }
  }
  // Paints over what is already drawn and adds no new pixels to the shape.
  const over = (shape: Ellipse, color: (x: number, y: number) => Key) => {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (grid[y]![x] && inside(x, y - dy, shape)) {
          grid[y]![x] = color(x, y - dy)
        }
      }
    }
  }
  const dot = (x: number, y: number, color: Key) => {
    const row = grid[y + dy]
    if (row && x >= 0 && x < W) row[x] = color
  }
  const scene: Scene = {
    dot,
    at: (x, y) => grid[y + dy]?.[x] ?? null,
    leftmost: y => {
      const i = (grid[y + dy] ?? []).findIndex(Boolean)

      return i < 0 ? W : i
    },
    width: W,
    ground: GROUND,
    hy,
    top: hy - 7,
    ey: hy - 2,
    bodyCy,
    bodyRy,
    bodyRx,
    frame,
  }
  const gear = isDead ? {} : (GEAR[level] ?? {})

  gear.pre?.(scene)

  // Light comes from the upper left. The back is shaded in a crescent that
  // follows the body, the belly catches light from below, and every step
  // blends into the next through a checkerboard, never a straight band.
  const lift = bodyRy * 0.4
  paint([20, bodyCy, bodyRx, bodyRy], (x, y) => {
    const checker = (x + y) % 2 === 0
    const back = field(x, y, [20, bodyCy + lift, bodyRx, bodyRy])
    const belly = field(x, y, [20, bodyCy - lift * 1.1, bodyRx, bodyRy])

    if (belly > 1) return 'C'
    if (belly > 0.9) return checker ? 'C' : 'L'
    if (belly > 0.78) return 'L'
    if (back > 1) return 'D'
    if (back > 0.92) return checker ? 'D' : 'B'
    if (back > 0.8) return 'B'
    if (back > 0.72) return checker ? 'B' : 'O'

    return 'O'
  })
  // A highlight on the shoulder and rump, where the light lands first.
  over([12, bodyCy - bodyRy * 0.62, 4, 1.6], () => 'B')
  over([13, bodyCy - bodyRy * 0.6, 2, 0.8], () => 'O')
  paint([14, GROUND - 0.5, 4, 1.8], () => 'P')
  paint([30, GROUND - 0.5, 3.5, 1.8], () => 'P')
  paint([32, headCy, 8.5, 7], (x, y) => {
    const checker = (x + y) % 2 === 0
    const crown = field(x, y, [32, headCy + 2.5, 8.5, 7])
    const jaw = field(x, y, [32, headCy - 3, 8.5, 7])

    if (jaw > 1) return 'L'
    if (jaw > 0.9) return checker ? 'L' : 'O'
    if (crown > 1) return 'B'
    if (crown > 0.9) return checker ? 'B' : 'O'

    return 'O'
  })
  over([29, headCy - 4, 2.6, 1.3], () => 'M')
  paint([39, headCy + 2, 3.5, 2.6], () => 'L')
  paint([33.5, headCy + 4, cheek, cheek - 1], () => 'L')
  paint(
    isFlat ? [27.5, headCy - 5, 3, 2] : [28, headCy - 7, 3, 3.4],
    () => 'B',
  )
  paint(
    isFlat ? [27.5, headCy - 4.8, 1.5, 1] : [28, headCy - 6.4, 1.6, 2],
    () => 'P',
  )

  gear.mid?.(scene)

  // A one-pixel dark edge around the whole silhouette. The legend gets a
  // gold one that shimmers.
  const edge: [number, number, Key][] = []
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!grid[y]![x]) continue
      const open = [grid[y - 1]?.[x], grid[y + 1]?.[x], grid[y]![x - 1], grid[y]![x + 1]]
      if (open.some(n => !n)) edge.push([x, y, grid[y]![x]!])
    }
  }
  const gold: Key | null = level === 10 && !isDead ? (frame % 2 === 0 ? 'Y' : 'S') : null
  for (const [x, y, own] of edge) grid[y]![x] = gold ?? OUTLINE[own] ?? 'K'

  // A starving hamster shows its ribs.
  if (f < 0.35) {
    for (const x of [11, 14, 17, 20, 23]) {
      for (let k = 0; k < 3; k++) dot(x + (k > 1 ? 1 : 0), Math.round(bodyCy) - 1 + k, 'D')
    }
  }

  const ey = hy - 2
  if (isDead) {
    for (const [x, y] of [
      [35, 0], [37, 0], [36, 1], [35, 2], [37, 2],
    ] as const) {
      dot(x, ey + y, 'E')
    }
  } else if (isBlink) {
    dot(36, ey + 1, 'D')
    dot(37, ey + 1, 'D')
  } else {
    dot(36, ey, 'H')
    dot(37, ey, 'E')
    dot(36, ey + 1, 'E')
    dot(37, ey + 1, 'E')
  }
  const nx = sniff ? 1 : 0
  dot(41 + nx, hy, 'P')
  dot(42 + nx, hy, 'P')
  dot(41 + nx, hy + 1, 'P')

  gear.post?.(scene)
  if (anim) play(anim, scene)

  // A warning shows as an exclamation mark beside the head: it blinks for a
  // warning and stays lit when it is urgent.
  if (alert && !isDead && (alert === 'urgent' || tick % 2 === 0)) {
    const mark: Key = alert === 'urgent' ? 'R' : 'Q'
    for (const [x, y] of [
      [44, 0], [45, 0], [44, 1], [45, 1], [44, 2], [45, 2], [44, 3], [45, 3], [44, 5], [45, 5],
    ] as const) {
      dot(x, scene.top - 6 + y, mark)
    }
  }

  const rects: string[] = []
  for (let y = 0; y < H; y++) {
    let x = 0
    while (x < W) {
      const key = grid[y]![x]
      if (!key) {
        x++
        continue
      }
      let end = x
      while (grid[y]![end + 1] === key) end++
      rects.push(rect(x, y, end - x + 1, key))
      x = end + 1
    }
  }
  const body = rects.join('')

  // Dead: turned over inside its own height, so it still lies on the ground.
  const top = grid.findIndex(row => row.some(Boolean))
  const art = isDead
    ? `<g transform="translate(0 ${GROUND + 1 + top}) scale(1 -1)">${body}</g>` +
      TOMBSTONE.map((row, j) =>
        [...row]
          .map((c, i) => (c === '.' ? '' : `<rect x="${i}" y="${GROUND - 6 + j}" width="1" height="1" fill="${COLOR[c as Key]}"/>`))
          .join(''),
      ).join('')
    : body

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * SCALE}" height="${H * SCALE}" shape-rendering="crispEdges">${art}</svg>`
}

export const SIZE = { width: W * SCALE, height: H * SCALE }
