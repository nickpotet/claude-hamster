import type { Key } from './palette'
import { COLOR } from './palette'

// What a gear piece needs to know about the hamster it is put on. Every
// coordinate is in the picture's own pixels, before the idle bob.
export type Scene = {
  dot: (x: number, y: number, color: Key) => void
  at: (x: number, y: number) => Key | null
  leftmost: (y: number) => number
  width: number
  ground: number
  hy: number
  top: number
  ey: number
  bodyCy: number
  bodyRy: number
  bodyRx: number
  frame: number
}

type Layers = {
  // Drawn before the body, which covers it: things behind the hamster.
  pre?: (s: Scene) => void
  // Drawn on the body, before the outline: hats, a beard, a pile of loot.
  // The outline then wraps them with the rest.
  mid?: (s: Scene) => void
  // Drawn last, over the outline.
  post?: (s: Scene) => void
}

// Draws rows of letters from the palette; `.` leaves a pixel alone.
const stamp = (s: Scene, rows: readonly string[], x0: number, y0: number) => {
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const c = row[i]!
      if (c !== '.' && c in COLOR) s.dot(x0 + i, y0 + j, c as Key)
    }
  })
}

// Paints over what is already there and leaves empty pixels empty.
const tint = (s: Scene, x: number, y: number, color: Key) => {
  if (s.at(x, y)) s.dot(x, y, color)
}

const SEED = ['.DDDD.', 'DWDWDD', '.DDDD.']
const SACK = ['..DD..', '.OOOO.', 'OOOOOO', 'OOLLOO', 'OOOOOO']
const DIRT = ['...DD.....', '..DBBD....', '.DBBBBD...', 'DBBDBBBD..']
const GRAIN = ['....OL....', '...OLOL...', '..OLOLOL..', '.OLOLOLOLO', 'OLOLOLOLOL']
const COINS = ['....yY....', '...YyYy...', '..YyYyYY..', '.YyYYyYyYY', 'YYyYyYYyYy']
const SCROLL = ['.CCCCC.', 'QCCRCCQ', '.CCCCC.']
const BOOK = ['UUUUUUU', 'UYUUUYU', 'RRRRRRR', 'RYRRRYR']
const QUESTION = ['.YYY.', 'Y...Y', '....Y', '..YY.', '..Y..', '.....', '..Y..']
const HARD_HAT = ['....YY....', '..YYYYYY..', '.YYYYYYYY.', 'YYYYYYYYYY', 'QQQQQQQQQQ']
const BICORNE = ['...NNNNNN...', '.NNNNNNNNNN.', 'NNNNNYYNNNNN', 'NNNNNNNNNNNN']
const CROWN = ['Y.Y.Y.Y.Y', 'YYYYYYYYY', 'YRYYUYYRY']
const BEARD = ['.WWWWW.', 'WWTWWTW', '.WWWWW.', '..WTW..', '...W...']
const GLASSES = ['.GGGG.', 'G....G', 'G....G', '.GGGG.']
const SUNGLASSES = ['NWNNNN', 'NNNNNN', '.NNNN.']
const HALO = ['.YYYYYYY.', 'Y.......Y', '.YYYYYYY.']

const SPARKLES = [
  [5, 6],
  [43, 7],
  [8, 20],
  [44, 22],
  [25, 3],
  [15, 11],
] as const

// Gear for each of the ten levels, by level.
export const GEAR: Record<number, Layers> = {
  // A sunflower seed, the first thing it owns.
  1: {
    mid: s => stamp(s, SEED, 41, s.ground - 2),
  },

  // A question mark over its head: it wants to know everything.
  2: {
    post: s => stamp(s, QUESTION, 35, s.top - 9),
  },

  // A sack of supplies behind it and a little heap of seeds in front.
  3: {
    pre: s => stamp(s, SACK, 1, s.ground - 4),
    mid: s => {
      stamp(s, ['..OLO..', '.OLOLO.', 'OLOLOLO'], 40, s.ground - 2)
    },
  },

  // A red headband and speed lines behind: it runs all night.
  4: {
    post: s => {
      for (let y = s.hy - 4; y <= s.hy - 3; y++) {
        for (let x = 24; x <= 40; x++) tint(s, x, y, 'R')
      }
      stamp(s, ['RR', '.R', '..R'], 21, s.hy - 4)

      const row = Math.round(s.bodyCy)
      const left = s.leftmost(row)
      if (left >= 5 && left < s.width) {
        for (const dy of [-2, 1, 4]) {
          for (let x = Math.max(0, left - 9); x < left - 1; x++) {
            s.dot(x, row + dy, 'G')
          }
        }
      }
    },
  },

  // A hard hat with a lamp, and a heap of dug-up earth behind it.
  5: {
    pre: s => stamp(s, DIRT, 0, s.ground - 3),
    mid: s => stamp(s, HARD_HAT, 27, s.top - 3),
    post: s => {
      s.dot(36, s.top - 1, 'S')
      s.dot(37, s.top - 1, 'S')
      s.dot(38, s.top, 'S')
    },
  },

  // A pile of grain by its paws. It guards the stores.
  6: {
    mid: s => stamp(s, GRAIN, 38, s.ground - 4),
  },

  // A bicorne, and a rolled-up map of campaigns to come.
  7: {
    mid: s => {
      stamp(s, BICORNE, 26, s.top - 2)
      stamp(s, SCROLL, 41, s.ground - 1)
    },
  },

  // A white beard, spectacles on a temple arm, and the book it has read.
  8: {
    mid: s => {
      stamp(s, BEARD, 33, s.hy + 4)
      stamp(s, BOOK, 40, s.ground - 3)
    },
    post: s => {
      stamp(s, GLASSES, 34, s.ey - 1)
      stamp(s, ['GGGG'], 30, s.ey)
    },
  },

  // A crown, a red cloak flying behind, and a heap of gold.
  9: {
    mid: s => {
      stamp(s, CROWN, 28, s.top - 2)
      stamp(s, COINS, 38, s.ground - 4)

      const bottom = s.bodyCy + s.bodyRy * 0.4
      for (let y = Math.floor(s.bodyCy - s.bodyRy); y <= bottom; y++) {
        const first = s.leftmost(y)
        for (let x = first; x <= 22; x++) {
          tint(s, x, y, y >= bottom - 1 ? 'r' : x % 5 === 0 ? 'r' : 'R')
        }
        if (y > s.bodyCy - s.bodyRy * 0.6 && first < s.width) {
          s.dot(first - 1, y, 'R')
          if (y > s.bodyCy - s.bodyRy * 0.2) s.dot(first - 2, y, 'r')
        }
      }
    },
  },

  // A halo, dark glasses, a golden outline and sparkles. Cool and legendary.
  10: {
    post: s => {
      stamp(s, HALO, 28, s.top - 6)
      stamp(s, SUNGLASSES, 34, s.ey - 1)
      stamp(s, ['NNNNNN'], 28, s.ey - 1)

      SPARKLES.forEach(([x, y], i) => {
        if ((i + s.frame) % 3 !== 0) return
        s.dot(x, y, 'W')
        s.dot(x - 1, y, 'S')
        s.dot(x + 1, y, 'S')
        s.dot(x, y - 1, 'S')
        s.dot(x, y + 1, 'S')
      })
    },
  },
}

// The tombstone that stands by a hamster who has starved.
export const TOMBSTONE = [
  '.GGGG.',
  'GGKKGG',
  'GKKKKG',
  'GGKKGG',
  'GGKKGG',
  'GGGGGG',
  'GGGGGG',
  'KKKKKK',
] as const
