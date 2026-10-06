import type { Pet } from '../types'

import { UI } from './text'
import type { Lang } from './text'

// Fun sinks on its own; food is not here: it is the session's context fill.
const FUN_LOSS_PER_MIN = 0.8

// A drop of at least this many tokens, to under 70% of before, is a clear
// or a compaction.
const MIN_FREED = 2000

export type Mood = 'happy' | 'ok' | 'hungry' | 'bored' | 'dead'
export type Change = 'grew' | 'cleaned' | null

const clamp = (n: number) => Math.max(0, Math.min(100, n))

export const newPet = (now: number): Pet => ({
  name: 'Хомка',
  xp: 0,
  food: 0,
  fun: 50,
  at: now,
  ctx: 0,
})

export const settle = (pet: Pet, now: number): Pet => {
  const minutes = Math.max(0, (now - pet.at) / 60000)

  return { ...pet, fun: clamp(pet.fun - minutes * FUN_LOSS_PER_MIN), at: now }
}

// Starts counting from the context as it is now, awarding nothing: a new
// session begins small and must not read as a clear.
export const rebase = (pet: Pet, tokens: number, percent: number, now: number): Pet => ({
  ...settle(pet, now),
  ctx: tokens,
  food: clamp(percent),
})

// One look at the session's context.
//   grew:    more tokens than before; 1 xp per 1000 tokens added.
//   cleaned: far fewer (a /clear or a compaction); xp for the tokens freed
//            and the only thing that raises fun.
export const observe = (
  pet: Pet,
  tokens: number,
  percent: number,
  now: number,
): { pet: Pet; change: Change } => {
  const p = settle(pet, now)
  const freed = p.ctx - tokens
  const base = { ...p, ctx: tokens, food: clamp(percent) }

  if (freed >= MIN_FREED && tokens < p.ctx * 0.7) {
    return {
      pet: {
        ...base,
        xp: p.xp + Math.max(5, freed / 500),
        fun: clamp(p.fun + 25 + Math.min(35, freed / 4000)),
      },
      change: 'cleaned',
    }
  }
  if (tokens > p.ctx) {
    return { pet: { ...base, xp: p.xp + (tokens - p.ctx) / 1000 }, change: 'grew' }
  }

  return { pet: base, change: null }
}

// The xp each level starts at. Medium work earns about 1000 xp a day (a
// context that grows by 1000 tokens is 1 xp; clearing earns more), so the
// tenth level, 60 000 xp, is about 60 days away. The first step is 5 xp.
export const LEVEL_XP = [0, 5, 100, 550, 1900, 4900, 10500, 20500, 36500, 60000] as const

export const TITLES = UI.ru.titles

// What each level wears or owns; the pictures are in gear.ts.
export const GEAR_NAMES = [
  'Семечко: первое имущество',
  'Вопрос над головой: хочет всё знать',
  'Мешок запасов и кучка семечек',
  'Красная повязка и следы скорости',
  'Каска с фонариком и куча земли',
  'Горка зерна под охраной',
  'Треуголка и свиток с картой',
  'Борода, очки и стопка книг',
  'Корона, красный плащ и горка золота',
  'Нимб, тёмные очки, золотой контур и искры',
] as const

export const MAX_LEVEL = LEVEL_XP.length

export const levelOf = (xp: number) => {
  let level = 1
  for (let i = 0; i < LEVEL_XP.length; i++) {
    if (xp >= LEVEL_XP[i]!) level = i + 1
  }

  return level
}

export const gearOf = (level: number) =>
  GEAR_NAMES[Math.max(1, Math.min(MAX_LEVEL, level)) - 1]!

export const titleOf = (level: number, lang: Lang) =>
  UI[lang].titles[Math.max(1, Math.min(MAX_LEVEL, level)) - 1]!

// How far through the current level: where it started, where the next one
// starts and the share done; `next` is null at the top.
export const progressOf = (xp: number) => {
  const level = levelOf(xp)
  const from = LEVEL_XP[level - 1]!
  const next = level >= MAX_LEVEL ? null : LEVEL_XP[level]!
  const share = next === null ? 100 : ((xp - from) / (next - from)) * 100

  return { level, from, next, share }
}

export const moodOf = (pet: Pet): Mood => {
  if (pet.food < 1) return 'dead'
  if (pet.food < 25) return 'hungry'
  if (pet.fun < 25) return 'bored'
  if (pet.food > 65 && pet.fun > 65) return 'happy'

  return 'ok'
}

export const bar = (value: number) => {
  const filled = Math.round(value / 10)

  return '█'.repeat(filled) + '░'.repeat(10 - filled)
}
