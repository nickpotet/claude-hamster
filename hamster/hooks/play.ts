import type { Anim } from './anim'
import type { Scene } from './gear'
import type { Key } from './palette'

const put = (s: Scene, rows: readonly string[], x0: number, y0: number, map: Record<string, Key>) => {
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const key = map[row[i]!]
      if (key) s.dot(x0 + i, y0 + j, key)
    }
  })
}

const PAW = [
  [36, 6],
  [37, 4],
  [38, 2],
  [37, 1],
  [38, 2],
  [37, 1],
  [38, 2],
  [37, 4],
  [36, 6],
] as const

const MOUTH = [0, 1, 2, 3, 4, 4, 3, 2, 1] as const

const Z = ['ZZZ', '.Z.', 'ZZZ']

const COIN = ['YYY', 'YyY', 'YYY']

// What the hamster does on top of the picture, drawn after everything else.
// The small facial moves (sniff, ear flick, closed eyes) are in art.ts.
export const play = (a: Anim, s: Scene) => {
  const { step } = a

  switch (a.name) {
    // A front paw rubs the face.
    case 'groom': {
      const [x, y] = PAW[Math.min(step, PAW.length - 1)]!
      put(s, ['kPPk', 'PPPP', 'PPPP', '.kk.'], x, s.hy + y, { P: 'P', k: 'k' })
      break
    }

    // Crumbs fall from the full cheeks.
    case 'munch': {
      for (let k = 0; k < 2; k++) {
        const t = (step + k * 2) % 4
        s.dot(42 + k * 2, s.hy + 5 + t, 'C')
      }
      break
    }

    // A wide yawn, a pink tongue at the back.
    case 'yawn': {
      const open = MOUTH[Math.min(step, MOUTH.length - 1)]!
      for (let j = 0; j < open; j++) {
        const y = s.hy + 2 + j
        const isTongue = j === open - 1 && open > 2
        for (let x = 40; x <= 43; x++) s.dot(x, y, isTongue ? 'P' : j === 0 ? 'K' : 'r')
      }
      break
    }

    // Asleep: Zs float up one after another.
    case 'sleep': {
      for (let i = 0; i < 3; i++) {
        const t = step - i * 6
        if (t < 0 || t >= 12) continue
        put(s, Z, 38 + i * 3 + Math.floor(t / 3), s.top - 3 - Math.floor(t / 2), { Z: 'U' })
      }
      break
    }

    // Digs at the ground: bits of earth fly in arcs.
    case 'dig': {
      for (let j = 0; j < 4; j++) {
        const t = step - j * 2
        if (t < 0 || t >= 7) continue
        const x = 40 + j + Math.round(t * 1.3)
        const y = s.ground - 1 - Math.round(t * (7 - t) * 0.6)
        const c: Key = j % 2 === 0 ? 'B' : 'D'
        s.dot(x, y, c)
        s.dot(x + 1, y, c)
        if (t < 4) s.dot(x, y - 1, c)
      }
      break
    }

    // A butterfly flutters across the top.
    case 'butterfly': {
      const x = 44 - Math.round(step * 1.5)
      const y = 6 + Math.round(Math.sin(step * 0.7) * 3)
      const wings = step % 2 === 0
        ? ['QQ.QQ', 'QQNQQ', '.QNQ.']
        : ['.....', '.QNQ.', 'QQNQQ']
      put(s, wings, x - 2, y - 1, { Q: 'Q', N: 'N' })
      break
    }

    // A seed rolls by across the ground.
    case 'roll': {
      const x = 46 - Math.round(step * 2.2)
      put(s, step % 2 === 0 ? ['.DDDD.', 'DWWDWD', '.DDDD.'] : ['.DDDD.', 'DWDWWD', '.DDDD.'], x, s.ground - 2, {
        D: 'D',
        W: 'W',
      })
      break
    }

    // A shooting star.
    case 'star': {
      const x = 2 + step * 3
      const y = 2 + Math.round(step * 0.7)
      s.dot(x, y, 'W')
      const tail: Key[] = ['S', 'S', 'y', 'y', 'Y', 'Y']
      tail.forEach((c, i) => s.dot(x - 1 - i, y - Math.round((i + 1) * 0.4), c))
      break
    }

    // A gold coin drops, lands and glints.
    case 'coin': {
      const y = Math.min(s.ground - 3, Math.round(step * 2.4 - 3))
      put(s, COIN, 44, y, { Y: 'Y', y: 'y' })
      if (y === s.ground - 3 && step >= 12) {
        const on = step % 2 === 0
        s.dot(43, y - 1, on ? 'W' : 'S')
        s.dot(47, y + 1, on ? 'S' : 'W')
      }
      break
    }

    default:
      break
  }
}
