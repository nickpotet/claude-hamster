import { describe, expect, mock, test } from 'claude-code/testing'

import { advise as adviseIn } from '../hooks/advice'
import { UI, langOf } from '../hooks/text'
import { OFFICIAL, TIPS, TIP_MS, tipAt } from '../hooks/tips'
import { ANIMS, animationAt } from '../hooks/anim'
import type { AnimName } from '../hooks/anim'
import type { Look } from '../hooks/advice'
import { hamsterSvg } from '../hooks/art'
import { COLOR } from '../hooks/palette'
import {
  GEAR_NAMES,
  LEVEL_XP,
  MAX_LEVEL,
  TITLES,
  gearOf,
  levelOf,
  moodOf,
  newPet,
  observe,
  progressOf,
  rebase,
  settle,
  titleOf,
} from '../hooks/pet'

const MIN = 60000

describe('hamster rules', () => {
  test('fun sinks with time and never below zero', async () => {
    const pet = { ...newPet(0), fun: 70 }
    expect(settle(pet, 10 * MIN).fun).toBeLessThan(70)
    expect(settle(pet, 10_000 * MIN).fun).toBe(0)
  })

  test('food is the context and does not sink with time', async () => {
    const pet = rebase(newPet(0), 100000, 50, 0)
    expect(settle(pet, 60 * MIN).food).toBe(50)
  })

  test('a growing context earns xp and no fun', async () => {
    const start = rebase(newPet(0), 10000, 5, 0)
    const { pet, change } = observe(start, 30000, 15, 0)
    expect(change).toBe('grew')
    expect(Math.abs(pet.xp - 20)).toBeLessThan(0.001)
    expect(pet.fun).toBe(start.fun)
    expect(pet.food).toBe(15)
  })

  test('a clear or a compaction earns xp and fun', async () => {
    const start = { ...rebase(newPet(0), 150000, 75, 0), fun: 10 }
    const { pet, change } = observe(start, 8000, 4, 0)
    expect(change).toBe('cleaned')
    expect(pet.xp).toBeGreaterThan(100)
    expect(pet.fun).toBeGreaterThan(40)
    expect(pet.food).toBe(4)
  })

  test('a small dip is not a clean-up, and a flat context changes nothing', async () => {
    const start = { ...rebase(newPet(0), 100000, 50, 0) }
    expect(observe(start, 95000, 47, 0).change).toBe(null)
    expect(observe(start, 100000, 50, 0).pet.xp).toBe(0)
  })

  test('a new session is a baseline, not a clear', async () => {
    const old = rebase(newPet(0), 150000, 75, 0)
    const fresh = rebase(old, 0, 0, 1000)
    expect(fresh.xp).toBe(old.xp)
    expect(Math.abs(fresh.fun - old.fun)).toBeLessThan(0.1)
  })

  test('mood follows the context and fun; levels grow with xp', async () => {
    expect(moodOf({ ...newPet(0), food: 0 })).toBe('dead')
    expect(moodOf({ ...newPet(0), food: 10 })).toBe('hungry')
    expect(moodOf({ ...newPet(0), food: 50, fun: 10 })).toBe('bored')
    expect(moodOf({ ...newPet(0), food: 90, fun: 90 })).toBe('happy')
  })
})

describe('hamster levels', () => {
  test('there are ten, and the first step is 5 xp', async () => {
    expect(MAX_LEVEL).toBe(10)
    expect(LEVEL_XP[1]).toBe(5)
    expect(levelOf(0)).toBe(1)
    expect(levelOf(4.9)).toBe(1)
    expect(levelOf(5)).toBe(2)
  })

  test('thresholds only go up and the last is 60 days of medium work', async () => {
    for (let i = 1; i < LEVEL_XP.length; i++) {
      expect(LEVEL_XP[i]!).toBeGreaterThan(LEVEL_XP[i - 1]!)
    }
    expect(LEVEL_XP[9]! / 1000).toBe(60)
    expect(levelOf(59999)).toBe(9)
    expect(levelOf(60000)).toBe(10)
    expect(levelOf(10_000_000)).toBe(10)
  })

  test('every level has its own name; the last is legendary', async () => {
    expect(new Set(TITLES).size).toBe(10)
    expect(titleOf(1, 'ru')).toBe('Новорождённый хомячок')
    expect(titleOf(1, 'en')).toBe('Newborn Hamster')
    expect(titleOf(10, 'ru')).toBe('Легендарный хомяк')
    expect(titleOf(99, 'ru')).toBe('Легендарный хомяк')
  })

  test('progress runs from one threshold to the next, and tops out', async () => {
    expect(progressOf(0).share).toBe(0)
    expect(progressOf(0).next).toBe(5)
    expect(progressOf(52.5).level).toBe(2)
    expect(progressOf(52.5).next).toBe(100)
    expect(Math.round(progressOf(52.5).share)).toBe(50)
    expect(progressOf(70000).next).toBe(null)
    expect(progressOf(70000).share).toBe(100)
  })
})

// The tests read Russian unless they say otherwise.
const advise = (l: Look, lang: 'ru' | 'en' = 'ru') => adviseIn(l, lang)

const look = (over: Partial<Look> = {}): Look => ({
  percent: 10,
  fun: 70,
  ageMs: 60000,
  idleMs: 0,
  limits: [],
  now: 0,
  ...over,
})

describe('hamster advice', () => {
  test('warns at 60% and louder at 80%, as a toast once', async () => {
    expect(advise(look({ percent: 40 })).toast).toBe(null)
    const a = advise(look({ percent: 65 }))
    expect(a.toast?.key).toBe('ctx60')
    expect(a.tip).toContain('65%')
    expect(advise(look({ percent: 85 })).toast?.key).toBe('ctx80')
  })

  test('reminds to compact when work pauses, while the cache is warm', async () => {
    const a = advise(look({ percent: 50, idleMs: 4 * 60000 }))
    expect(a.toast?.key).toBe('idle')
    expect(a.tip).toContain('кэш ещё тёплый')
    expect(advise(look({ percent: 50, idleMs: 60000 })).toast).toBe(null)
    expect(advise(look({ percent: 5, idleMs: 4 * 60000 })).toast).toBe(null)
  })

  test('after a long pause it advises clearing instead of compacting', async () => {
    const a = advise(look({ percent: 50, idleMs: 3 * 3600000 }))
    expect(a.toast?.key).toBe('cold')
    expect(a.tip).toContain('/clear')
  })

  test('an old session is not worth compacting', async () => {
    const a = advise(look({ percent: 40, ageMs: 20 * 3600000 }))
    expect(a.tip).toContain('20 ч')
    expect(a.tip).toContain('/clear')
  })

  test('warns when a rate-limit window runs out', async () => {
    const a = advise(look({ limits: [{ kind: 'five_hour', percentUsed: 82 }] }))
    expect(a.toast?.key).toBe('limit-five_hour')
    expect(a.tip).toContain('82%')
  })

  test('with nothing urgent it gives a general tip that rotates', async () => {
    const a = advise(look({ now: 0 }))
    const b = advise(look({ now: TIP_MS }))
    expect(a.toast).toBe(null)
    expect(a.tip.length).toBeGreaterThan(10)
    expect(a.tip).not.toBe(b.tip)
  })
})

describe('hamster advice levels', () => {
  test('a calm tip is info, a warning is warn, a plea is urgent', async () => {
    expect(advise(look({ percent: 10 })).level).toBe('info')
    expect(Object.values(UI.ru.tags)).toContain(advise(look({ percent: 10 })).tag)
    expect(advise(look({ percent: 65 })).level).toBe('warn')
    expect(advise(look({ percent: 85 })).level).toBe('urgent')
    expect(advise(look({ percent: 85 })).tag).toBe('СЖАТЬ СЕЙЧАС')
  })

  test('end of work and a cold cache are warnings with their own labels', async () => {
    const idle = advise(look({ percent: 50, idleMs: 4 * 60000 }))
    expect(idle.level).toBe('warn')
    expect(idle.tag).toBe('КОНЕЦ РАБОТЫ?')
    const cold = advise(look({ percent: 50, idleMs: 3 * 3600000 }))
    expect(cold.level).toBe('warn')
    expect(cold.tag).toBe('КЭШ ОСТЫЛ')
  })

  test('a limit nearly spent is urgent, a limit running low a warning', async () => {
    const limit = (percentUsed: number) =>
      advise(look({ limits: [{ kind: 'five_hour', percentUsed }] }))
    expect(limit(75).level).toBe('warn')
    expect(limit(95).level).toBe('urgent')
  })

  test('every tip has words and a label', async () => {
    for (const percent of [5, 35, 65, 85]) {
      const a = advise(look({ percent }))
      expect(a.tip.length).toBeGreaterThan(8)
      expect(a.tag.length).toBeGreaterThan(2)
    }
  })
})

describe('hamster alert mark', () => {
  const pet = { ...newPet(0), xp: 100, food: 70 }
  const calm = hamsterSvg(pet, 0, null, null)

  test('an urgent mark stays lit, a warning blinks', async () => {
    expect(hamsterSvg(pet, 0, null, 'urgent')).not.toBe(calm)
    expect(hamsterSvg(pet, 1, null, 'urgent')).not.toBe(hamsterSvg(pet, 1, null, null))
    expect(hamsterSvg(pet, 0, null, 'warn')).not.toBe(calm)
    expect(hamsterSvg(pet, 1, null, 'warn')).toBe(hamsterSvg(pet, 1, null, null))
  })

  test('the dead show no mark', async () => {
    const dead = { ...pet, food: 0 }
    expect(hamsterSvg(dead, 0, null, 'urgent')).toBe(hamsterSvg(dead, 0, null, null))
  })
})

describe('hamster art', () => {
  test('is pixel art on a transparent background, with no text or emoji', async () => {
    const svg = hamsterSvg({ ...newPet(0), food: 60 }, 0, null)
    expect(svg).toContain('shape-rendering="crispEdges"')
    expect(svg).toContain('<rect')
    expect(svg).not.toContain('<text')
    expect(svg).not.toContain('<ellipse')
    expect(svg).not.toMatch(/<rect x="0" y="0" width="48" height="34"/)
  })

  test('the blink and the cheeks change the picture', async () => {
    const pet = { ...newPet(0), food: 60 }
    expect(hamsterSvg(pet, 17, null)).not.toBe(hamsterSvg(pet, 16, null))
    expect(hamsterSvg({ ...pet, food: 100 }, 0, null)).not.toBe(hamsterSvg({ ...pet, food: 30 }, 0, null))
  })
})

const area = (svg: string) =>
  [...svg.matchAll(/width="(\d+)" height="1"/g)].reduce((n, m) => n + Number(m[1]), 0)

describe('hamster body', () => {
  test('the fuller the context, the bigger the hamster', async () => {
    const at = (food: number) => area(hamsterSvg({ ...newPet(0), food }, 0, null))
    expect(at(100)).toBeGreaterThan(at(60))
    expect(at(60)).toBeGreaterThan(at(15))
  })

  test('with an empty context it is dead: upside down, crosses for eyes', async () => {
    const dead = { ...newPet(0), food: 0 }
    expect(moodOf(dead)).toBe('dead')
    expect(hamsterSvg(dead, 0)).toContain('scale(1 -1)')
    expect(hamsterSvg(dead, 0)).toBe(hamsterSvg(dead, 3))
    expect(hamsterSvg({ ...dead, food: 50 }, 0, null)).not.toContain('scale(1 -1)')
  })
})

describe('hamster gear', () => {
  const at = (level: number, frame = 0, food = 70) =>
    hamsterSvg({ ...newPet(0), xp: LEVEL_XP[level - 1]!, food }, frame * 3, null)

  test('every level looks different from every other', async () => {
    const looks = new Set(LEVEL_XP.map((_x, i) => at(i + 1)))
    expect(looks.size).toBe(10)
  })

  test('every level has a described outfit', async () => {
    expect(GEAR_NAMES).toHaveLength(10)
    expect(new Set(GEAR_NAMES).size).toBe(10)
    expect(gearOf(10)).toContain('Нимб')
  })

  test('the legend shimmers and sparkles from frame to frame', async () => {
    expect(at(10, 0)).not.toBe(at(10, 2))
    expect(at(10, 1)).not.toBe(at(10, 3))
  })

  test('the cloak and the legend hold at every body size', async () => {
    for (const food of [5, 30, 60, 100]) {
      for (const level of [5, 8, 9, 10]) {
        const svg = at(level, 0, food)
        expect(svg).toContain('<rect')
        expect(svg).not.toContain('NaN')
      }
    }
  })

  test('the dead wear nothing but a tombstone beside them', async () => {
    const dead = (level: number) =>
      hamsterSvg({ ...newPet(0), xp: LEVEL_XP[level - 1]!, food: 0 }, 0)
    expect(dead(1)).toBe(dead(10))
    expect(dead(5)).toContain('#9a9fa6')
  })
})

const NAMES = Object.keys(ANIMS) as AnimName[]

describe('hamster animations', () => {
  const count = (level: number) => {
    const seen: Record<string, number> = {}
    for (let tick = 0; tick < 400_000; tick++) {
      const a = animationAt(tick, level)
      if (a && a.step === 0) seen[a.name] = (seen[a.name] ?? 0) + 1
    }

    return seen
  }

  test('the same moment always shows the same thing', async () => {
    for (let tick = 0; tick < 5000; tick += 7) {
      expect(animationAt(tick, 10)).toEqual(animationAt(tick, 10))
    }
  })

  test('a show runs its length once, in order, and never overlaps another', async () => {
    let last: { name: string; step: number } | null = null
    for (let tick = 0; tick < 50_000; tick++) {
      const a = animationAt(tick, 10)
      if (a) {
        expect(a.step).toBeGreaterThanOrEqual(0)
        expect(a.step).toBeLessThan(ANIMS[a.name].length)
        if (last && last.name === a.name && a.step > 0) {
          expect(a.step).toBe(last.step + 1)
        }
      }
      last = a
    }
  })

  test('the rarer a show, the less often it plays', async () => {
    const seen = count(10)
    const total = (names: AnimName[]) => names.reduce((n, k) => n + (seen[k] ?? 0), 0)
    const tier = (t: string) => NAMES.filter(n => ANIMS[n].tier === t)
    const common = total(tier('common')) / tier('common').length
    const uncommon = total(tier('uncommon')) / tier('uncommon').length
    const rare = total(tier('rare')) / tier('rare').length
    const legendary = total(tier('legendary')) / tier('legendary').length
    expect(common).toBeGreaterThan(uncommon)
    expect(uncommon).toBeGreaterThan(rare)
    expect(rare).toBeGreaterThan(legendary)
    expect(legendary).toBeGreaterThan(0)
  })

  test('shows open with the level, and a low level never sees a late one', async () => {
    const early = count(1)
    for (const name of NAMES) {
      if (ANIMS[name].level > 1) expect(early[name]).toBe(undefined)
    }
    expect(Object.keys(early).length).toBeGreaterThan(2)
    expect(Object.keys(count(10))).toHaveLength(NAMES.length)
  })

  test('every show draws at every step, and shows something different', async () => {
    const pet = { ...newPet(0), xp: 60000, food: 70 }
    for (const name of NAMES) {
      let isDifferent = false
      for (let step = 0; step < ANIMS[name].length; step++) {
        const svg = hamsterSvg(pet, 100 + step, { name, step })
        expect(svg.startsWith('<svg')).toBe(true)
        expect(svg).not.toContain('NaN')
        expect(svg.length).toBeLessThan(131072)
        if (svg !== hamsterSvg(pet, 100 + step, null)) isDifferent = true
      }
      expect(isDifferent).toBe(true)
    }
  })

  test('the dead do not play', async () => {
    const dead = { ...newPet(0), xp: 60000, food: 0 }
    expect(hamsterSvg(dead, 5, { name: 'sleep', step: 3 })).toBe(hamsterSvg(dead, 5, null))
  })
})

describe('hamster stillness', () => {
  const pet = { ...newPet(0), xp: 100, food: 70 }
  const rows = (svg: string) => [...svg.matchAll(/y="(\d+)"/g)].map(m => m[1]).join(',')

  test('idle, it does not move up and down', async () => {
    const base = rows(hamsterSvg(pet, 0, null))
    for (let tick = 0; tick < 36; tick++) {
      if (tick % 18 === 17) continue
      expect(rows(hamsterSvg(pet, tick, null))).toBe(base)
    }
  })

  test('sleep still breathes and a dig still shakes', async () => {
    const at = (name: 'sleep' | 'dig', step: number) =>
      rows(hamsterSvg(pet, 100, { name, step }))
    expect(at('sleep', 0)).not.toBe(at('sleep', 4))
    expect(at('sleep', 0)).toBe(at('sleep', 1))
    expect(at('dig', 0)).not.toBe(at('dig', 1))
  })
})

const BAND = {
  hasSurvey: false,
  isWorking: false,
  maxRows: 20,
  bodyColumns: 120,
} as never

describe('hamster start-up', () => {
  test('it starts even when the session cannot report its context', async ($, on) => {
    mock.clock(on, { now: 0 })
    mock.store(on)
    // The engine beneath the plugin starts the session but cannot say how
    // full the context is (no session.usage answer: that call fails, as it
    // may in a real session). The start must not fall over.
    on('session.start', (_$, e) => ({ cwd: e.cwd }))
    await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  })
})

describe('hamster band', () => {
  const mount = ($: Parameters<Parameters<typeof test>[1]>[0], surface: 'desktop' | 'terminal', props = BAND) =>
    $.ui.mount({ plugin: 'hamster', surface, component: 'AbovePrompt', props })

  test('on the desktop: the hamster, bars, title and only the language flag', async ($, on) => {
    mock.clock(on, { now: 0 })
    mock.store(on)
    const ui = await mount($, 'desktop')
    expect((await ui.findAll({ type: 'Svg' })).length).toBe(4)
    // Two buttons: the language flag and back ("Got it" shows on warnings). Nothing
    // to feed or press on the hamster.
    const buttons = await ui.findAll({ type: 'Button' })
    expect(buttons.map(b => b.key).sort()).toEqual(['back', 'lang'])
    expect(await ui.find({ type: 'Text', text: /Новорождённый|Newborn/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /(УР|LV)\. 1 \/ 10/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Сытость|Fullness/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Опыт|XP/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Радость|Joy/ })).toBeDefined()
    await ui.unmount()
  })

  test('the back button shows the tip before the current one', async ($, on) => {
    mock.clock(on, { now: 100 * 20000 + 5 })
    mock.store(on)
    const ui = await mount($, 'desktop')
    const either = (n: number) => {
      const t = tipAt(n)
      const part = (x: string) => x.slice(0, 30).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      return new RegExp(`${part(t.ru)}|${part(t.en)}`)
    }
    expect(await ui.find({ type: 'Text', text: either(100) })).toBeDefined()
    await ui.press({ key: 'back' })
    expect(await ui.find({ type: 'Text', text: either(99) })).toBeDefined()
    await ui.press({ key: 'back' })
    expect(await ui.find({ type: 'Text', text: either(98) })).toBeDefined()
    // Forward walks back towards the present; there is no forward past it.
    await ui.press({ key: 'forward' })
    expect(await ui.find({ type: 'Text', text: either(99) })).toBeDefined()
    await ui.press({ key: 'forward' })
    expect(await ui.find({ type: 'Text', text: either(100) })).toBeDefined()
    expect((await ui.findAll({ type: 'Button' })).map(b => b.key)).not.toContain('forward')
    await ui.unmount()
  })

  test('on the terminal, or with little room, one plain line', async ($, on) => {
    mock.clock(on, { now: 0 })
    mock.store(on)
    const terminal = await mount($, 'terminal')
    expect(await terminal.find({ type: 'Text', text: /(ур|lv)\. 1/ })).toBeDefined()
    await terminal.unmount()

    const cramped = await mount($, 'desktop', { ...(BAND as object), maxRows: 4 } as never)
    expect(await cramped.findAll({ type: 'Svg' })).toHaveLength(0)
    expect(await cramped.find({ type: 'Text', text: /(ур|lv)\. 1/ })).toBeDefined()
    await cramped.unmount()
  })

  test('it gives way to a survey', async ($, on) => {
    mock.clock(on, { now: 0 })
    mock.store(on)
    // Yielding means passing the draw on down to the engine, where this test
    // has nothing: that is the refusal we look for.
    let isPassed = false
    try {
      await mount($, 'desktop', { ...(BAND as object), hasSurvey: true } as never)
    } catch (error) {
      isPassed = String(error).includes('no implementation for ui.render')
    }
    expect(isPassed).toBe(true)
  })
})

describe('hamster tips', () => {
  test('the calm tip changes every 20 seconds, not before', async () => {
    expect(TIP_MS).toBe(20000)
    const same = advise(look({ now: 5 * TIP_MS })).tip === advise(look({ now: 5 * TIP_MS + TIP_MS - 1 })).tip
    expect(same).toBe(true)
    expect(advise(look({ now: 5 * TIP_MS })).tip).not.toBe(advise(look({ now: 6 * TIP_MS })).tip)
  })

  test('there are over a hundred, a fifth of them about saving tokens', async () => {
    expect(TIPS.length).toBeGreaterThanOrEqual(100)
    const share = TIPS.filter(x => x.kind === 'tokens').length / TIPS.length
    expect(share).toBeGreaterThanOrEqual(0.2)
    for (const x of TIPS) expect(Object.keys(UI.ru.tags)).toContain(x.kind)
  })

  test('texts are unique and links are bare addresses', async () => {
    expect(new Set(TIPS.map(x => x.ru)).size).toBe(TIPS.length)
    expect(new Set(TIPS.map(x => x.en)).size).toBe(TIPS.length)
    for (const x of TIPS) {
      if (x.link !== null && x.link !== OFFICIAL) {
        expect(/^[a-z0-9.-]+\.[a-z]+(\/[\w.-]+)*$/i.test(x.link)).toBe(true)
      }
    }
  })

  test('every tip is written in both languages', async () => {
    for (const x of TIPS) {
      expect(/[А-Яа-яЁё]/.test(x.en)).toBe(false)
      expect(/[А-Яа-яЁё]/.test(x.ru)).toBe(true)
      expect(x.en.length).toBeGreaterThan(10)
    }
  })

  test('a new tip every 20 seconds, every tip shown once per round', async () => {
    const round = TIPS.map((_, m) => tipAt(m).ru)
    expect(new Set(round).size).toBe(TIPS.length)
    expect(tipAt(0).ru).not.toBe(tipAt(1).ru)
    expect(tipAt(TIPS.length).ru).toBe(tipAt(0).ru)
  })

  test('a calm tip carries its link into the advice', async () => {
    const minute = TIPS.findIndex((_, m) => {
      const l = tipAt(m).link

      return l !== null && l !== OFFICIAL
    })
    const a = advise(look({ now: minute * TIP_MS }))
    expect(a.link).toBe(tipAt(minute).link)
    expect(advise(look({ percent: 85 })).link).toBe(null)
  })

  test('an official-catalog tip says so in the reader\'s language', async () => {
    const minute = TIPS.findIndex((_, m) => tipAt(m).link === OFFICIAL)
    expect(advise(look({ now: minute * TIP_MS }), 'ru').link).toBe(UI.ru.official)
    expect(advise(look({ now: minute * TIP_MS }), 'en').link).toBe(UI.en.official)
  })
})

describe('hamster dismissed warnings', () => {
  const calm = (a: ReturnType<typeof advise>) => a.level === 'info' && a.id === null

  test('a warning carries an id and a calm tip does not', async () => {
    expect(advise(look({ percent: 65 })).id).toBe('ctx60')
    expect(advise(look({ percent: 85 })).id).toBe('ctx80')
    expect(advise(look({ percent: 50, idleMs: 4 * 60000 })).id).toBe('idle')
    expect(advise(look({ percent: 50, idleMs: 3 * 3600000 })).id).toBe('cold')
    expect(advise(look({ percent: 40, ageMs: 20 * 3600000 })).id).toBe('old')
    expect(advise(look({ fun: 10 })).id).toBe('bored')
    expect(advise(look({ percent: 10 })).id).toBe(null)
  })

  test('a dismissed warning gives way to the ordinary tips', async () => {
    for (const [over, id] of [
      [{ percent: 65 }, 'ctx60'],
      [{ percent: 85 }, 'ctx80'],
      [{ fun: 10 }, 'bored'],
      [{ percent: 40, ageMs: 20 * 3600000 }, 'old'],
      [{ limits: [{ kind: 'five_hour', percentUsed: 80 }] }, 'limit-five_hour'],
    ] as const) {
      const a = adviseIn(look(over as never), 'ru', new Set([id]))
      expect(calm(a)).toBe(true)
    }
  })

  test('dismissing the loud one silences the quieter one, not the other way round', async () => {
    // Waved off at 85%: the 60% warning must not pop up in its place.
    expect(calm(adviseIn(look({ percent: 85 }), 'ru', new Set(['ctx80'])))).toBe(true)
    // Waved off at 65%: when the context reaches 85% the plea speaks again.
    expect(adviseIn(look({ percent: 85 }), 'ru', new Set(['ctx60'])).id).toBe('ctx80')
  })

  test('a limit warning that turns urgent speaks again after being waved off', async () => {
    const at80 = look({ limits: [{ kind: 'five_hour', percentUsed: 80 }] })
    const at95 = look({ limits: [{ kind: 'five_hour', percentUsed: 95 }] })
    const waved = new Set(['limit-five_hour'])
    expect(calm(adviseIn(at80, 'ru', waved))).toBe(true)
    expect(adviseIn(at95, 'ru', waved).level).toBe('urgent')
    expect(calm(adviseIn(at95, 'ru', new Set(['limit90-five_hour'])))).toBe(true)
  })

  test('dismissing the cache warning also hides the end-of-work reminder', async () => {
    const cold = look({ percent: 50, idleMs: 3 * 3600000 })
    expect(calm(adviseIn(cold, 'ru', new Set(['cold'])))).toBe(true)
  })

  test('the text is the same in both languages: a button label for each', async () => {
    expect(UI.ru.gotIt).toBe('Понятно')
    expect(UI.en.gotIt).toBe('Got it')
  })
})

describe('hamster language menu', () => {
  const mount = ($: Parameters<Parameters<typeof test>[1]>[0]) =>
    $.ui.mount({ plugin: 'hamster', surface: 'desktop', component: 'AbovePrompt', props: BAND })

  test('the flag opens a menu of languages and a pick redraws the band in it', async ($, on) => {
    mock.clock(on, { now: 0 })
    mock.store(on)
    const ui = await mount($)
    const keys = async () =>
      (await ui.findAll({ type: 'Button' })).map(b => b.key).filter(k => k !== 'back')

    expect(await keys()).toEqual(['lang'])
    await ui.press({ key: 'lang' })
    expect(await keys()).toEqual(['lang', 'lang-ru', 'lang-en', 'lang-auto'])

    await ui.press({ key: 'lang-en' })
    expect(await keys()).toEqual(['lang'])
    expect(await ui.find({ type: 'Text', text: /Newborn Hamster/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Fullness/ })).toBeDefined()

    await ui.press({ key: 'lang' })
    await ui.press({ key: 'lang-ru' })
    expect(await ui.find({ type: 'Text', text: /Новорождённый хомячок/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Сытость/ })).toBeDefined()

    // Leave it as it was found, for whoever draws next.
    await ui.press({ key: 'lang' })
    await ui.press({ key: 'lang-auto' })
    await ui.unmount()
  })

  test('the flag shows the current language', async ($, on) => {
    mock.clock(on, { now: 0 })
    mock.store(on)
    const ui = await mount($)
    await ui.press({ key: 'lang' })
    await ui.press({ key: 'lang-ru' })
    expect(await ui.find({ type: 'Button', text: /🇷🇺/ })).toBeDefined()
    await ui.press({ key: 'lang' })
    await ui.press({ key: 'lang-en' })
    expect(await ui.find({ type: 'Button', text: /🇬🇧/ })).toBeDefined()
    await ui.press({ key: 'lang' })
    await ui.press({ key: 'lang-auto' })
    await ui.unmount()
  })
})

describe('hamster links', () => {
  test('a tip with a link has an address a person can open', async () => {
    const minute = TIPS.findIndex((_, m) => {
      const l = tipAt(m).link

      return l !== null && l !== OFFICIAL
    })
    const a = advise(look({ now: minute * TIP_MS }))
    expect(a.href).toBe(`https://${tipAt(minute).link}`)
    expect(() => new URL(a.href!)).not.toThrow()
    expect(new URL(a.href!).href.replace(/\/$/, '')).toBe(a.href!)
  })

  test('every link in the set is a valid https address', async () => {
    for (const x of TIPS) {
      if (x.link === null || x.link === OFFICIAL) continue
      const url = new URL(`https://${x.link}`)
      expect(url.protocol).toBe('https:')
      expect(/^[\x21-\x7e]+$/.test(url.href)).toBe(true)
    }
  })

  test('warnings and tips with only a note have nothing to open', async () => {
    expect(advise(look({ percent: 85 })).href).toBe(null)
    const minute = TIPS.findIndex((_, m) => tipAt(m).link === OFFICIAL)
    const a = advise(look({ now: minute * TIP_MS }))
    expect(a.href).toBe(null)
    expect(a.link).toBe(UI.ru.official)
  })
})

describe('hamster language', () => {
  test('it follows the language Claude is set to', async () => {
    expect(langOf('russian', 'en_US.UTF-8')).toBe('ru')
    expect(langOf('Русский', undefined)).toBe('ru')
    expect(langOf('ru', undefined)).toBe('ru')
    expect(langOf('english', 'ru_RU.UTF-8')).toBe('en')
    expect(langOf('japanese', 'ru_RU.UTF-8')).toBe('en')
  })

  test('with no setting the system locale decides, and English is the default', async () => {
    expect(langOf(undefined, 'ru_RU.UTF-8')).toBe('ru')
    expect(langOf(undefined, 'en_US.UTF-8')).toBe('en')
    expect(langOf(undefined, undefined)).toBe('en')
    expect(langOf('  ', undefined)).toBe('en')
  })

  test('the warnings read in English too, with the same levels', async () => {
    const en = advise(look({ percent: 85 }), 'en')
    expect(en.tag).toBe('COMPACT NOW')
    expect(en.level).toBe('urgent')
    expect(/[А-Яа-яЁё]/.test(en.tip)).toBe(false)
    expect(advise(look({ percent: 50, idleMs: 3 * 3600000 }), 'en').tag).toBe('CACHE COLD')
    expect(advise(look({ percent: 10 }), 'en').tip.length).toBeGreaterThan(10)
  })

  test('both languages name all ten levels and every mood', async () => {
    expect(UI.en.titles).toHaveLength(10)
    expect(new Set(UI.en.titles).size).toBe(10)
    expect(Object.keys(UI.en.moods)).toEqual(Object.keys(UI.ru.moods))
    expect(Object.keys(UI.en.tags)).toEqual(Object.keys(UI.ru.tags))
  })
})
describe('hamster gear placement', () => {
  test('the night runner\'s speed lines trail behind, not in front of the nose', async () => {
    const svg = hamsterSvg({ name: 'Хома', xp: 1712, food: 15, fun: 80, at: 0, ctx: 0 }, 0, null, null)
    const grey = [...svg.matchAll(/<rect x="(\d+)"[^>]*fill="([^"]+)"/g)]
      .filter(m => m[2] === COLOR.G)
      .map(m => Number(m[1]))
    expect(grey.length).toBeGreaterThan(0)
    expect(Math.max(...grey)).toBeLessThan(24)
  })
})
