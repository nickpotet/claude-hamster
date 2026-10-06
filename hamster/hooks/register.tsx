import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Pet, Tip } from '../types'

import { TICK_MS } from './anim'
import { advise } from './advice'
import { TIP_MS } from './tips'
import { hamsterSvg } from './art'
import { BAR_HEIGHT, GOLD, JOY, barSvg, barWidth, contextColor } from './bars'
import { levelOf, moodOf, newPet, observe, progressOf, rebase, titleOf } from './pet'
import type { Change } from './pet'
import { LANGS, UI, flagOf, isPref, langOf } from './text'
import type { Lang, Pref } from './text'

// The scale the hamster is drawn at in the band: whole pixels, 3 to 1.
const BAND = { width: 144, height: 102 }
// The bars: one length for all three, after a label column this wide.
const SEGMENTS = 20
const LABEL = 10
// The tip card's label column, wide enough for the longest tag.
const TAG = 17

// How a tip looks at each level: the colour of its label, its frame and its
// background. The band itself has no plate: only the tip card is framed.
const LOOK = {
  info: { color: GOLD, frame: '#88888855', fill: '#88888814' },
  warn: { color: '#f2a33a', frame: '#f2a33a', fill: '#f2a33a22' },
  urgent: { color: '#e5584d', frame: '#e5584d', fill: '#e5584d2a' },
} as const
const KEY = 'pet'
const pet = atom({ plugin: 'hamster', key: 'pet' } as const, newPet(0))
const frame = atom({ plugin: 'hamster', key: 'frame' } as const, 0) // the tick
const menu = atom({ plugin: 'hamster', key: 'menu' } as const, false) // the language menu
const tip = atom({ plugin: 'hamster', key: 'tip' } as const, {
  text: '',
  tag: '',
  level: 'info',
} as Tip)

// Kept for the life of the session; a hot reload starts them over.
const toasted = new Set<string>()
let lastTurnAt = 0
let lastStatus = ''
// Claude's language, looked up again every minute.
let lang: Lang = 'en'
let langAt = -Infinity
// The person's own pick, kept in the store; 'auto' follows Claude.
let pref: Pref = 'auto'
// Warnings the person has waved off: they stay quiet until their cause clears.
const dismissed = new Set<string>()

// The tip slot the back button holds on screen, and until when; null follows the clock.
const HOLD_MS = 60000
let held: number | null = null
let heldAt = 0

// Follows Claude's language: its `language` setting, else the system locale.
async function speak($: EngineInterface, now: number) {
  if (now - langAt < 60000) return
  langAt = now

  if (pref !== 'auto') {
    lang = pref

    return
  }

  try {
    const settings = await $.settings.read()
    const locale = await $.env.get('LANG')
    lang = langOf(settings.language, locale)
  } catch {
    // Keeps the language it had.
  }
}

async function loadPref($: EngineInterface) {
  try {
    const saved = await $.store.get('lang')
    if (isPref(saved)) pref = saved
  } catch {
    // No saved pick: follow Claude.
  }
}

// The person picked a language from the menu: keep it, and redraw in it.
async function choose($: EngineInterface, picked: Pref) {
  pref = picked
  langAt = -Infinity
  try {
    await $.store.set('lang', picked)
  } catch {
    // The pick lasts for the session at least.
  }
  await speak($, await $.clock.now())
  await update($, menu, () => false)
  await sync($)
}

const asTip = (a: ReturnType<typeof advise>): Tip => ({
  text: a.tip,
  tag: a.tag,
  level: a.level,
  link: a.link,
  href: a.href,
  id: a.id,
})

// The band redraws twice a second, and a handle the host holds for a drawing
// dies with it. So the buttons carry no behaviour of their own: they all share
// this empty handler and every press is answered by the `ui.press` hook below,
// which does not depend on which drawing the pointer was over.
const noop = () => {}

// Is a tip held on the card by the back and forward buttons?
const browsing = (now: number) => held !== null && now - heldAt < HOLD_MS

// "Forward": the tip after the held one; reaching the current one lets the
// rotation carry on by itself.
async function goForward($: EngineInterface) {
  const now = await $.clock.now()
  if (!browsing(now)) return
  const next = held! + 1
  held = next >= Math.floor(now / TIP_MS) ? null : next
  heldAt = now
  await showHeld($, now)
}

const LIMIT_TOAST_GAP_MS = 60 * 60 * 1000

// True when no limit notice has been shown for an hour; records this one.
async function limitToastDue($: EngineInterface, now: number): Promise<boolean> {
  try {
    const last = Number(await $.store.get('limitToastAt')) || 0
    if (now - last < LIMIT_TOAST_GAP_MS) return false
    await $.store.set('limitToastAt', now)
  } catch {
    // Without a store the notice still comes at most once per session and kind.
  }

  return true
}

// "Back": show the tip before the one on the card and keep it there for a
// minute, so it can be read; then the rotation carries on.
async function goBack($: EngineInterface) {
  const now = await $.clock.now()
  const live = browsing(now)
  held = (live ? held! : Math.floor(now / TIP_MS)) - 1
  heldAt = now

  await showHeld($, now)
}

// Show the held (or, once released, the current) tip at once, without waiting
// for the next reading of the context.
async function showHeld($: EngineInterface, now: number) {
  const p = await read($, pet)
  const calm = advise(
    { percent: p.food, fun: 100, ageMs: 0, idleMs: 0, limits: [], now, slot: held ?? undefined },
    lang,
  )
  await update($, tip, () => asTip(calm))
  await sync($)
}

// "Got it": the warning on the card gives way to the ordinary tips.
async function dismiss($: EngineInterface, id: string) {
  dismissed.add(id)
  await sync($)

  // If the context could not be read just now, still take the warning down;
  // the band then shows an ordinary tip until the next reading.
  const shown = await read($, tip)
  if (shown.id === id) {
    await update($, tip, () => ({ text: '', tag: '', level: 'info', link: null, href: null, id: null }))
  }
}

// A warning comes back once what caused it has cleared, so that a later
// one is not missed.
function rearm(percent: number, fun: number, limits: { percentUsed: number }[]) {
  if (percent < 50) {
    dismissed.delete('ctx60')
    dismissed.delete('ctx80')
  }
  if (fun >= 40) dismissed.delete('bored')
  if (!limits.some(l => l.percentUsed >= 70)) {
    for (const id of [...dismissed]) {
      if (id.startsWith('limit')) dismissed.delete(id)
    }
  }
}

async function save($: EngineInterface, p: Pet) {
  try {
    await $.store.set(KEY, p)
  } catch {
    // A pet that cannot be saved just lives on in memory.
  }
}

async function load($: EngineInterface): Promise<Pet | undefined> {
  try {
    return ((await $.store.get(KEY)) as Pet | undefined) ?? undefined
  } catch {
    return undefined
  }
}

type Look = {
  tokens: number
  percent: number
  // True when the figures are the local estimate, not a model reply's.
  estimated: boolean
  startedAt: number
  limits: { kind: string; percentUsed: number }[]
}

// The session's context and limits, or null when the engine will not say
// (so that nothing else in the mod depends on this call working).
async function look($: EngineInterface): Promise<Look | null> {
  try {
    const u = await $.session.usage()
    let { tokens, percent } = u.context
    let estimated = false

    // The figures come from the last model reply, so there are none right
    // after /compact or /clear; the local estimate (free, no model call)
    // is what the app itself shows in that gap.
    if (percent === undefined) {
      try {
        const b = (await $.session.usage({ breakdown: 'summary' })).context.breakdown
        if (b) {
          tokens = b.totalTokens
          percent = Math.min(100, b.percentage)
          estimated = true
        }
      } catch {
        // keep the missing figures: they read as 0 below
      }
    }

    return {
      tokens: tokens ?? 0,
      percent: percent ?? 0,
      estimated,
      startedAt: u.startedAt,
      limits: u.rateLimits,
    }
  } catch {
    return null
  }
}

// Reads the session's context fill and lets the hamster react to it.
async function sync($: EngineInterface) {
  const now = await $.clock.now()
  await speak($, now)
  const seen0 = await look($)
  if (!seen0) return
  const { tokens, percent } = seen0
  const before = await read($, pet)
  let change: Change = null

  await update($, pet, p => {
    // The estimate differs from what a reply reports, so it only moves the
    // fullness bar: read as a drop in tokens it would count as a clean-up and
    // feed the joy. The real count, once a reply gives it, is compared with
    // the last real one.
    if (seen0.estimated) return { ...p, food: Math.max(0, Math.min(100, percent)) }
    const seen = observe(p, tokens, percent, now)
    change = seen.change

    return seen.pet
  })

  const after = await read($, pet)
  await save($, after)

  rearm(percent, after.fun, seen0.limits)
  const advice = advise(
    {
      percent,
      fun: after.fun,
      ageMs: now - seen0.startedAt,
      idleMs: lastTurnAt === 0 ? 0 : now - lastTurnAt,
      limits: seen0.limits,
      now,
      slot: browsing(now) ? held! : undefined,
    },
    lang,
    dismissed,
  )
  const shown: Tip = {
    text: advice.tip,
    tag: advice.tag,
    level: advice.level,
    link: advice.link,
    href: advice.href,
    id: advice.id,
  }
  const shownBefore = await read($, tip)
  if (JSON.stringify(shownBefore) !== JSON.stringify(shown)) {
    await update($, tip, () => shown)
  }

  // A warning is also put on the status line, so it still shows when the
  // band is folded away; a calm tip clears it.
  const status = advice.level === 'info' ? '' : `${UI[lang].hamster}: ${advice.tag}. ${advice.tip}`
  if (status !== lastStatus) {
    lastStatus = status
    $.ui.status(status === '' ? undefined : status)
  }

  // Context levels may warn again once the context has been cleared.
  if (percent < 50) {
    toasted.delete('ctx60')
    toasted.delete('ctx80')
  }
  if (advice.toast && !toasted.has(advice.toast.key)) {
    if (advice.toast.key.startsWith('limit')) {
      // The limit notice is the one that nags: at most once an hour, across
      // sessions and restarts too (the card keeps showing it meanwhile).
      if (await limitToastDue($, now)) $.ui.toast(advice.toast.text)
    } else {
      toasted.add(advice.toast.key)
      $.ui.toast(advice.toast.text)
    }
  }

  if (change === 'cleaned') {
    $.ui.toast(UI[lang].cleared)
  }
  if (levelOf(after.xp) > levelOf(before.xp)) {
    $.ui.toast(UI[lang].levelUp(levelOf(after.xp), titleOf(levelOf(after.xp), lang)))
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const now = await $.clock.now()
    lastTurnAt = now
    await loadPref($)
    await speak($, now)

    // The animation clock: a tick every half second, the same for any
    // viewer, so what is on screen follows from the time alone.
    // A redraw rebuilds the buttons under the pointer (the hover blinks and
    // a press can fall between two drawings), so the clock only redraws the
    // band when the hamster itself would look different.
    let drawn = ''
    $.clock.every(TICK_MS, async () => {
      const at = Math.floor((await $.clock.now()) / TICK_MS)
      const [p, t] = [await read($, pet), await read($, tip)]
      const picture = hamsterSvg(p, at, undefined, t.level === 'info' ? null : t.level)
      if (picture === drawn) return
      drawn = picture
      await update($, frame, () => at)
    })
    // The context is read every 3 s, and after each turn below.
    $.clock.every(3000, async () => {
      await sync($)
    })

    // Start counting from the context as it is now, awarding nothing.
    const saved = await load($)
    const seen = await look($)
    const base = { ...newPet(now), ...saved }
    await update($, pet, () =>
      rebase(base, seen && !seen.estimated ? seen.tokens : base.ctx, seen?.percent ?? 0, now),
    )

    return next(e)
  })

  // Work in progress is not idleness: every prompt and tool call restarts it.
  on('prompt.submit', async ($, e, next) => {
    lastTurnAt = await $.clock.now()
    toasted.delete('idle')
    toasted.delete('cold')
    dismissed.delete('idle')
    dismissed.delete('cold')

    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    lastTurnAt = await $.clock.now()

    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    // A turn ends the idle period, so the end-of-work reminders may fire again.
    lastTurnAt = await $.clock.now()
    toasted.delete('idle')
    toasted.delete('cold')
    dismissed.delete('idle')
    dismissed.delete('cold')
    await sync($)

    return next(e)
  })

  on('ui.press', async ($, e, next) => {
    if (e.plugin !== 'hamster') return next(e)

    if (e.element === 'lang') {
      await update($, menu, v => !v)
    } else if (e.element === 'back') {
      await goBack($)
    } else if (e.element === 'forward') {
      await goForward($)
    } else if (e.element === 'dismiss') {
      const shown = await read($, tip)
      if (shown.id) await dismiss($, shown.id)
    } else if (e.element.startsWith('lang-')) {
      const pick = e.element.slice(5)
      if (isPref(pick)) await choose($, pick)
    } else {
      return next(e)
    }

    return { element: e.element }
  })

  // The hamster lives in a band above the prompt: the hamster on the left,
  // its numbers in a quiet column on the right, and the tip below in a
  // framed card, the only plate in the band.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)

    const { Box, Text, Svg, Link, Button } = $.ui.resolve(e)
    const open = await read($, menu)
    const p = await read($, pet)
    const tick = await read($, frame)
    const stored = await read($, tip)
    const clockNow = await $.clock.now()
    // Until the first reading, the calm tip stands in so the card is never empty.
    const advice =
      stored.text !== ''
        ? stored
        : asTip(
            advise(
              { percent: p.food, fun: 100, ageMs: 0, idleMs: 0, limits: [], now: await $.clock.now() },
              lang,
              dismissed,
            ),
          )
    const tone = LOOK[advice.level]
    const { level, next: nextAt, share } = progressOf(p.xp)
    const mood = moodOf(p)
    const percent = Math.round(p.food)
    const ui = UI[lang]
    const title = titleOf(level, lang)

    // Without the room or the vector element, one plain line.
    if (e.surface !== 'desktop' || e.props.maxRows < 8) {
      return <Text dimColor>{ui.compact(title, level, percent, Math.round(p.fun))}</Text>
    }

    const xpText =
      nextAt === null ? `${Math.floor(p.xp)}` : `${Math.floor(p.xp)} / ${nextAt}`

    // One label column, so the three bars start and end on the same line.
    const row = (label: string, bar: string, alt: string, value: string) => (
      <Box columnGap={2} alignItems="center">
        <Box width={LABEL}>
          <Text dimColor>{label}</Text>
        </Box>
        <Svg source={bar} alt={alt} width={barWidth(SEGMENTS)} height={BAR_HEIGHT} />
        <Text dimColor>{value}</Text>
      </Box>
    )

    // No plate of its own: the hamster and its numbers sit straight on the
    // window. The same margin all round; one blank row between the blocks.
    return (
      <Box flexDirection="column" rowGap={1} paddingX={2} paddingY={1} position="relative">
        <Box position="absolute" top={1} right={2} flexDirection="column" alignItems="flex-end">
          <Button key="lang" plain onPress={noop}>
            {flagOf(lang)}
          </Button>
          {open && (
            <Box borderStyle="round" borderColor={tone.frame} flexDirection="column" paddingX={1}>
              {LANGS.map(l => (
                <Button key={`lang-${l.code}`} plain onPress={noop}>
                  {`${pref === l.code ? '✓' : ' '} ${l.flag} ${l.name}`}
                </Button>
              ))}
              <Button key="lang-auto" plain onPress={noop}>
                {`${pref === 'auto' ? '✓' : ' '} 🌐 ${ui.auto}`}
              </Button>
            </Box>
          )}
        </Box>
        <Box flexDirection="row" flexWrap="wrap" alignItems="center" columnGap={4}>
          <Svg
            source={hamsterSvg(p, tick, undefined, advice.level === 'info' ? null : advice.level)}
            alt={`${ui.hamster}, ${ui.moods[mood]}`}
            width={BAND.width}
            height={BAND.height}
          />
          <Box flexDirection="column" flexGrow={1} minWidth={34} rowGap={1}>
            <Box flexDirection="column">
              <Box columnGap={1}>
                <Text dimColor>{`${ui.level} ${level} / 10`}</Text>
                <Text dimColor>·</Text>
                <Text dimColor>{ui.moods[mood]}</Text>
                {e.props.isWorking && <Text color={GOLD}>{ui.working}</Text>}
              </Box>
              <Text bold>{title}</Text>
            </Box>
            <Box flexDirection="column">
              {row(
                ui.xp,
                barSvg(share, GOLD, SEGMENTS),
                ui.xpAlt(Math.round(share)),
                xpText,
              )}
              {row(
                ui.fed,
                barSvg(p.food, contextColor(p.food), SEGMENTS),
                ui.fedAlt(percent),
                `${ui.context} ${percent}%`,
              )}
              {row(
                ui.joy,
                barSvg(p.fun, JOY, SEGMENTS),
                ui.joyAlt(Math.round(p.fun)),
                `${Math.round(p.fun)}% ${ui.joyNote}`,
              )}
            </Box>
          </Box>
        </Box>
        {advice.text !== '' && (
          <Box
            borderStyle="round"
            borderColor={tone.frame}
            backgroundColor={tone.fill}
            paddingX={2}
            columnGap={1}
            alignItems="flex-start"
          >
            <Box width={TAG}>
              <Text bold color={tone.color}>{advice.tag}</Text>
            </Box>
            <Box flexGrow={1} flexShrink={1} flexDirection="column">
              <Text bold={advice.level !== 'info'} wrap="wrap">{advice.text}</Text>
              {advice.href ? (
                <Text wrap="wrap">
                  {'→ '}
                  <Link href={advice.href}>{advice.link ?? advice.href}</Link>
                </Text>
              ) : (
                advice.link && <Text dimColor wrap="wrap">{`→ ${advice.link}`}</Text>
              )}
            </Box>
            <Box columnGap={2} alignItems="flex-start">
              {advice.level === 'info' && !advice.id && (
                <Button key="back" plain onPress={noop}>
                  ←
                </Button>
              )}
              {advice.level === 'info' && !advice.id && held !== null && browsing(clockNow) && (
                <Button key="forward" plain onPress={noop}>
                  →
                </Button>
              )}
              {advice.id && (
                <Button key="dismiss" plain onPress={noop}>
                  {ui.gotIt}
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Box>
    )
  })
}
