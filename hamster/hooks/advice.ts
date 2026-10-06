import { OFFICIAL, TIP_MS, tipAt } from './tips'
import { UI } from './text'
import type { Lang } from './text'

const MIN = 60000
const HOUR = 60 * MIN

export type Look = {
  percent: number
  fun: number
  ageMs: number
  idleMs: number
  limits: { kind: string; percentUsed: number }[]
  now: number
  // The calm tip's slot when one is held (the back button); else follows the clock.
  slot?: number
}

// How loudly to say it: a quiet hint, a warning, or a plea.
export type Level = 'info' | 'warn' | 'urgent'

export type Advice = {
  // Which warning this is, so it can be dismissed; null for a calm tip.
  id: string | null
  // Shown in the band, always: a few words for the label, then the text.
  tag: string
  tip: string
  // Where to read more, for a recommendation; null for everything else.
  link: string | null
  // The link as an address a person can open (https://...), when there is one.
  href: string | null
  level: Level
  // Shown once as a toast, when set; `key` keeps it from repeating.
  toast: { key: string; text: string } | null
}


const hours = (ms: number) => Math.floor(ms / HOUR)

const say = (
  level: Level,
  tag: string,
  tip: string,
  key: string | null,
  link: string | null = null,
  href: string | null = null,
  id: string | null = key,
): Advice => ({
  id,
  level,
  tag,
  tip,
  link,
  href,
  toast: key ? { key, text: tip } : null,
})

// The warnings, worded for each language. Each takes the numbers it quotes.
const SAY = {
  ru: {
    cold: ['КЭШ ОСТЫЛ', (h: number, p: number) => `Пауза ${h} ч, контекст ${p}%: компакт сейчас обойдётся дорого. Лучше /clear и новая сессия.`],
    idle: ['КОНЕЦ РАБОТЫ?', (p: number) => `Сожми контекст (${p}%) сейчас: кэш ещё тёплый, завтра это будет в разы дороже.`],
    old: ['СТАРАЯ СЕССИЯ', (h: number, p: number) => `Сессии ${h} ч, контекст ${p}%: компакт старого чата дорог. Лучше /clear и новая сессия.`],
    ctx80: ['СЖАТЬ СЕЙЧАС', (p: number) => `Контекст ${p}%. Автокомпакт сработает вслепую и может потерять детали.`],
    ctx60: ['ПОРА СЖИМАТЬ', (p: number) => `Контекст ${p}%: пока это дёшево.`],
    limit: ['ЛИМИТ', (p: number, name: string) => `Использовано ${p}% ${name}: переключись на Sonnet и не запускай много агентов сразу.`],
    bored: ['СКУЧАЕТ', () => 'Хомяк скучает: сожми или очисти контекст, когда будет удобно.'],
    windows: { five_hour: '5-часового окна', seven_day: 'недельного окна', other: (k: string) => `лимита ${k}` },
  },
  en: {
    cold: ['CACHE COLD', (h: number, p: number) => `Idle for ${h} h, context ${p}%: compacting now would be costly. Better /clear and start a new session.`],
    idle: ['END OF WORK?', (p: number) => `Compact the context (${p}%) now: the cache is still warm, tomorrow it will cost many times more.`],
    old: ['OLD SESSION', (h: number, p: number) => `Session is ${h} h old, context ${p}%: compacting an old chat is costly. Better /clear and start a new session.`],
    ctx80: ['COMPACT NOW', (p: number) => `Context ${p}%. Auto-compact will run blind and may lose details.`],
    ctx60: ['TIME TO COMPACT', (p: number) => `Context ${p}%: it's still cheap.`],
    limit: ['LIMIT', (p: number, name: string) => `${p}% of the ${name} used: switch to Sonnet and don't launch many agents at once.`],
    bored: ['BORED', () => 'The hamster is bored: compact or clear the context when convenient.'],
    windows: { five_hour: '5-hour window', seven_day: 'weekly window', other: (k: string) => `${k} limit` },
  },
} as const

// What to tell the person, most urgent first. A pure function of what the
// session looks like right now. A warning the person has dismissed stays out
// of the way (the next rule speaks instead) until the hamster re-arms it.
export const advise = (
  look: Look,
  lang: Lang,
  dismissed: ReadonlySet<string> = new Set(),
): Advice => {
  const w = SAY[lang]
  const pct = Math.round(look.percent)
  const worst = look.limits.reduce((a, l) => (l.percentUsed > a.percentUsed ? l : a), {
    kind: '',
    percentUsed: 0,
  })
  // A louder warning that was dismissed also silences the quieter ones of its kind.
  const off = (...ids: string[]) => ids.some(id => dismissed.has(id))

  if (pct >= 30 && look.idleMs >= HOUR && !off('cold')) {
    return say('warn', w.cold[0], w.cold[1](hours(look.idleMs), pct), 'cold', null, null, 'cold')
  }
  if (pct >= 30 && look.idleMs >= 3 * MIN && !off('idle', 'cold')) {
    return say('warn', w.idle[0], w.idle[1](pct), 'idle', null, null, 'idle')
  }
  if (pct >= 20 && look.ageMs >= 12 * HOUR && !off('old')) {
    return say('warn', w.old[0], w.old[1](hours(look.ageMs), pct), null, null, null, 'old')
  }
  if (pct >= 80 && !off('ctx80')) {
    return say('urgent', w.ctx80[0], w.ctx80[1](pct), 'ctx80', null, null, 'ctx80')
  }
  if (pct >= 60 && !off('ctx60', 'ctx80')) {
    return say('warn', w.ctx60[0], w.ctx60[1](pct), 'ctx60', null, null, 'ctx60')
  }
  if (worst.percentUsed >= 70) {
    const urgent = worst.percentUsed >= 90
    const id = urgent ? `limit90-${worst.kind}` : `limit-${worst.kind}`
    const name =
      worst.kind === 'five_hour'
        ? w.windows.five_hour
        : worst.kind === 'seven_day'
          ? w.windows.seven_day
          : w.windows.other(worst.kind)

    if (!off(id, `limit90-${worst.kind}`)) {
      return say(
        urgent ? 'urgent' : 'warn',
        w.limit[0],
        w.limit[1](Math.round(worst.percentUsed), name),
        `limit-${worst.kind}`,
        null,
        null,
        id,
      )
    }
  }
  if (look.fun < 25 && !off('bored')) {
    return say('info', w.bored[0], w.bored[1](), null, null, null, 'bored')
  }

  const calm = tipAt(look.slot ?? Math.floor(look.now / TIP_MS))
  const official = calm.link === OFFICIAL
  const link = official ? UI[lang].official : calm.link
  const href = calm.link === null || official ? null : `https://${calm.link}`

  return say('info', UI[lang].tags[calm.kind], calm[lang], null, link, href, null)
}
