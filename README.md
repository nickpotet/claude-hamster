# Claude Hamster

A pixel hamster that lives above the prompt in the **Claude desktop app** (Code tab). It eats your context window, and it tells you what to do about it.

> Русская версия ниже: [читать по-русски](#по-русски).

- **Its size follows the context fill.** An empty context is a tiny hamster, a full one is a round one. The "Fullness" bar is the context percentage.
- **XP and joy come from how you use the context.** Every 1000 tokens of growth is 1 XP. `/clear` and `/compact` give a lot of XP and raise joy. Ten levels, each with its own gear (seed, backpack, red bandana with speed lines, miner's helmet, crown, halo, and so on).
- **Advice is the point.** A card under the hamster shows a new tip every 20 seconds: 110 of them, about a fifth on saving tokens, the rest on skills, plugins, MCP servers and ways of working, most with a clickable link. Page through them with the arrow buttons. The full list is in [docs/TIPS.md](docs/TIPS.md).
- **Warnings when it matters:** the context passes 60% and 80%, you stepped away and the cache is going cold, the plan limit is running low, the session is very old. Each has a "Got it" button that brings the ordinary tips back. The limit notice pops up at most once an hour.
- **No model calls.** The mod reads only local counters (`$.session.usage`) and spends no tokens of your chat.
- **Russian and English.** It follows Claude's `language` setting, or the system locale. The flag in the top right corner opens a language menu.

## Install

You need a Claude Code build that loads function-hook plugins (the desktop app does).

```bash
claude plugin marketplace add nickpotet/claude-hamster
claude plugin install hamster@claude-hamster
```

Then restart the app. The band appears above the prompt in the Code tab. In a terminal, or when there is little room, it shows one plain line instead.

To make it speak your language regardless of the system locale, set `"language": "russian"` (or `"english"`) in `~/.claude/settings.json`, or pick it with the flag button.

## How it works

| Piece | File |
| --- | --- |
| The pet: XP, joy, levels, what counts as a clean-up | `hamster/hooks/pet.ts` |
| Pixel art and animations | `hamster/hooks/art.ts`, `gear.ts`, `anim.ts`, `palette.ts` |
| When to warn and what to say | `hamster/hooks/advice.ts` |
| The 110 tips | `hamster/hooks/tips.ts` |
| Texts in both languages | `hamster/hooks/text.ts` |
| The band, buttons, timers | `hamster/hooks/register.tsx` |

Notes:

- "End of work" means no prompt, tool call or finished turn for 3 minutes with the context at 30% or more. "Cache cold" means an hour of that. These are the mod's own thresholds, not measured from your account: the prompt cache lifetime depends on the plan and mode.
- XP counts the growth of the real token count from a model reply. Right after `/compact` or `/clear` there is no reply yet, so the bar shows the app's local estimate and only the next real count is compared with the last real one.

## Develop

Tests run with the plugin tooling of the Claude Code build:

```bash
claude plugin validate hamster
claude plugin test hamster
```

Add tips in `hamster/hooks/tips.ts` (a Russian and an English text each, a link without `https://`, or `OFFICIAL` for the official catalog) and regenerate `docs/TIPS.md`.

## License

[MIT](LICENSE)

---

## По-русски

Пиксельный хомяк, который живёт над строкой ввода в **десктопном приложении Claude** (вкладка Code). Он «ест» ваш контекст и подсказывает, что с ним делать.

- **Размер хомяка следует за заполнением контекста.** Пустой контекст: крошка, полный: круглый. Полоска «Сытость» это процент контекста.
- **Опыт и радость зависят от того, как вы работаете.** Каждые 1000 токенов роста дают 1 XP. `/clear` и `/compact` дают много опыта и поднимают радость. Десять уровней, у каждого своё снаряжение.
- **Главное: советы.** Карточка под хомяком каждые 20 секунд показывает новый совет. Всего их 110: около пятой части про экономию токенов, остальные про скиллы, плагины, MCP-серверы и приёмы работы, у большинства есть кликабельная ссылка. Листать можно стрелками. Полный список: [docs/TIPS.md](docs/TIPS.md) (на английском).
- **Предупреждения, когда это важно:** контекст прошёл 60% и 80%, вы отошли и кэш остывает, лимит плана на исходе, сессия очень старая. У каждого есть кнопка «Понятно», после которой снова идут обычные советы. Уведомление про лимит всплывает не чаще раза в час.
- **Никаких вызовов модели.** Мод читает только локальные счётчики и не тратит токены вашего чата.
- **Русский и английский.** Язык берётся из настройки `language` в Claude или из языка системы. Флаг в правом верхнем углу открывает меню выбора.

### Установка

```bash
claude plugin marketplace add nickpotet/claude-hamster
claude plugin install hamster@claude-hamster
```

После этого перезапустите приложение. Хомяк появится над строкой ввода на вкладке Code.

Чтобы всегда был русский, добавьте `"language": "russian"` в `~/.claude/settings.json` или выберите язык флажком.
