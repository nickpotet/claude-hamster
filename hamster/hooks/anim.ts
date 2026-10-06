// When the hamster does something besides sit there. The time is cut into
// slots of 20 s; most slots hold one small show, picked by weight, so a
// sniff comes often and a shooting star almost never. Everything follows
// from the tick alone, so a picture can be redrawn for any moment.

export const TICK_MS = 500
const SLOT = 40
const CHANCE = 0.6

export type AnimName =
  | 'sniff'
  | 'earflick'
  | 'groom'
  | 'munch'
  | 'yawn'
  | 'sleep'
  | 'butterfly'
  | 'dig'
  | 'roll'
  | 'star'
  | 'coin'

export type Tier = 'common' | 'uncommon' | 'rare' | 'legendary'

export type Anim = { name: AnimName; step: number }

type Spec = {
  // How many ticks it lasts.
  length: number
  // Its share among the shows open at the level.
  weight: number
  tier: Tier
  // The level it opens at, so there is always something new to catch.
  level: number
}

export const ANIMS: Record<AnimName, Spec> = {
  sniff: { length: 6, weight: 10, tier: 'common', level: 1 },
  earflick: { length: 8, weight: 10, tier: 'common', level: 1 },
  munch: { length: 12, weight: 8, tier: 'common', level: 1 },
  groom: { length: 12, weight: 4, tier: 'uncommon', level: 1 },
  yawn: { length: 10, weight: 4, tier: 'uncommon', level: 2 },
  sleep: { length: 24, weight: 1.5, tier: 'rare', level: 3 },
  butterfly: { length: 28, weight: 1.5, tier: 'rare', level: 4 },
  dig: { length: 14, weight: 1.5, tier: 'rare', level: 5 },
  roll: { length: 20, weight: 1.2, tier: 'rare', level: 6 },
  star: { length: 16, weight: 0.4, tier: 'legendary', level: 8 },
  coin: { length: 20, weight: 0.4, tier: 'legendary', level: 9 },
}

const NAMES = Object.keys(ANIMS) as AnimName[]

// A fixed scramble of two numbers into one, the same on every run.
const hash = (a: number, b: number) => {
  let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x7f4a7c15, 0xc2b2ae35)
  h ^= h >>> 15
  h = Math.imul(h, 0x2c1b3c6d)
  h ^= h >>> 12
  h = Math.imul(h, 0x297a2d39)
  h ^= h >>> 15

  return h >>> 0
}

export const animationAt = (tick: number, level: number, seed = 7): Anim | null => {
  const slot = Math.floor(tick / SLOT)
  const offset = tick - slot * SLOT

  if ((hash(slot, seed) % 1000) / 1000 >= CHANCE) return null

  const open = NAMES.filter(n => ANIMS[n].level <= level)
  const total = open.reduce((n, name) => n + ANIMS[name].weight, 0)
  let roll = ((hash(slot, seed + 1) % 100000) / 100000) * total
  let name = open[0]!
  for (const n of open) {
    roll -= ANIMS[n].weight
    if (roll < 0) {
      name = n
      break
    }
  }

  const { length } = ANIMS[name]
  const start = hash(slot, seed + 2) % (SLOT - length - 1)
  if (offset < start || offset >= start + length) return null

  return { name, step: offset - start }
}
