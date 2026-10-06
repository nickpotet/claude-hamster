// The calm advice the hamster rotates through when nothing is urgent:
// saving tokens, skills, plugins, MCP servers and ways of working.
export type Kind = 'tokens' | 'skill' | 'plugin' | 'mcp' | 'collection' | 'trick'
export type Tip = { kind: Kind; ru: string; en: string; link: string | null }

// Stands in for a link: shown as a note that the plugin is in the official catalog.
export const OFFICIAL = 'official'

const t = (kind: Kind, ru: string, en: string, link: string | null = null): Tip => ({
  kind,
  ru,
  en,
  link,
})
const tokens = (ru: string, en: string, link: string | null = null) => t('tokens', ru, en, link)
const skill = (ru: string, en: string, link: string | null = null) => t('skill', ru, en, link)
const plugin = (ru: string, en: string, link: string | null = null) => t('plugin', ru, en, link)
const mcp = (ru: string, en: string, link: string | null = null) => t('mcp', ru, en, link)

export const TIPS: Tip[] = [
  // Saving tokens.
  tokens('Перед /compact добавь подсказку, что сохранить: /compact Сохрани цель, решения с причинами, файлы и следующие шаги.', 'Add a hint before /compact saying what to keep: /compact Keep the goal, decisions with reasons, files and next steps.'),
  tokens('Простое отдавай Sonnet, Opus оставь для сложного: расход лимита заметно ниже.', 'Give routine work to Sonnet and keep Opus for the hard parts: it uses noticeably less of your limit.'),
  tokens('/clear бесплатен: используй его между несвязанными задачами.', '/clear is free: use it between unrelated tasks.'),
  tokens('Не продолжай вчерашние чаты: новая сессия с короткой справкой дешевле, чем старый контекст.', "Don't continue yesterday's chats: a new session with a short brief is cheaper than an old context."),
  tokens('Просишь вывод команд? Проси кратко: длинные результаты быстрее всего раздувают контекст.', 'Asking for command output? Ask for it short: long results bloat the context fastest.'),
  tokens('Лишние плагины и скиллы входят в каждый ход: отключай то, чем не пользуешься.', "Unused plugins and skills ride along on every turn: switch off what you don't use."),
  tokens('Перед /clear попроси сохранить цель, решения и следующие шаги в файл, и продолжай с него в новой сессии.', 'Before /clear, ask Claude to save the goal, decisions and next steps to a file, and continue from it in a new session.'),
  tokens('Кэш живёт недолго: сжимать контекст дешевле сразу после ответа, чем после паузы.', 'The cache expires quickly: compacting right after a reply is cheaper than after a break.'),
  tokens('Как остывает кэш: пока он тёплый, Claude берёт за перечитывание чата всего 10% цены. Кэш живёт около 5 минут после последнего ответа (в некоторых режимах до часа) и продлевается с каждым новым сообщением.', 'How the cache cools: while it is warm, rereading the chat costs only 10% of the price. The cache lives about 5 minutes after the last reply (up to an hour in some modes) and is extended with every new message.', 'platform.claude.com/docs/en/build-with-claude/prompt-caching'),
  tokens('Остывший кэш: после паузы весь чат записывается заново, это примерно в 12 раз дороже, чем читать из тёплого (1,25× против 0,1×). Одно сообщение или /compact в большом чате после перерыва стоит как несколько обычных ходов. Лучше /clear.', 'A cold cache: after a pause the whole chat is written again, roughly 12 times pricier than reading from a warm one (1.25× vs 0.1×). One message or /compact in a big chat after a break costs as much as several normal turns. Better /clear.'),
  tokens('/context показывает, что съедает окно: MCP, скиллы, CLAUDE.md, история.', '/context shows what fills the window: MCP, skills, CLAUDE.md, history.'),
  tokens('session-report: HTML-отчёт по сессиям с самыми дорогими промптами, кэшем и субагентами.', 'session-report: an HTML report of your sessions with the most expensive prompts, cache use and subagents.', OFFICIAL),
  tokens('ccusage: расход по дням и моделям. Попроси: «запусти npx ccusage daily».', 'ccusage: spend by day and model. Ask: "run npx ccusage daily".', 'github.com/ccusage/ccusage'),
  tokens('Serena: Claude находит нужные функции и классы, не читая файлы целиком. Большая экономия на крупных проектах.', 'Serena: Claude finds the right functions and classes without reading whole files. Big savings on large projects.', 'github.com/oraios/serena'),
  tokens('Context7: документация нужной версии библиотеки вместо десяти попыток угадать API.', 'Context7: docs for the exact library version instead of ten attempts at guessing the API.', 'github.com/upstash/context7'),
  tokens('claude-mem: сжимает прошлые сессии в заметки и подгружает только нужное.', "claude-mem: compresses past sessions into notes and loads only what's relevant.", 'github.com/thedotmack/claude-mem'),
  tokens('claude-md-management: аудит CLAUDE.md, вычищает лишнее, которое грузится каждый ход.', 'claude-md-management: audits CLAUDE.md and trims what gets loaded on every turn.', OFFICIAL),
  tokens('Каждый ход Claude перечитывает весь чат, поэтому 30-е сообщение стоит в десятки раз дороже первого.', 'Every turn Claude rereads the whole chat, so the 30th message costs many times more than the first.'),
  tokens('Каждый MCP-сервер платит за описания своих инструментов в каждом ходе: держи включёнными только нужные.', 'Every MCP server pays for its tool descriptions on every turn: keep only the ones you need enabled.'),
  tokens('@путь/файл вместо «найди, где там оплата»: не будет чтения полпроекта.', '@path/file instead of "find where the payment is": no reading half the project.'),
  tokens('Поиск по большому коду отдай агенту Explore: тебе вернётся вывод, а не 50 файлов.', 'Hand searches over big code to the Explore agent: you get an answer back, not 50 files.'),
  tokens('Своим агентам-поисковикам ставь model: haiku в .claude/agents/*.md.', 'Set model: haiku on your search agents in .claude/agents/*.md.'),
  tokens('Effort high и max нужен только для сложного, на рутине хватит low или medium.', 'High and max effort are for the hard stuff; low or medium is enough for routine work.'),
  tokens('Из лога давай последние 50 строк или саму ошибку. Скриншоты обрезай.', 'From a log, give the last 50 lines or just the error. Crop screenshots.'),
  tokens('Все уточнения пиши одним сообщением, а не тремя подряд.', 'Put all clarifications in one message, not three in a row.'),
  tokens('Неудачный ответ откати через /rewind, а не спорь: спор остаётся в контексте.', 'Roll back a bad reply with /rewind instead of arguing: the argument stays in the context.'),
  tokens('Лимит считается 5-часовыми окнами: перед тяжёлой задачей проверь /usage.', 'The limit runs in 5-hour windows: check /usage before a heavy task.'),
  tokens('Правило в скилле дешевле, чем в CLAUDE.md: от скилла в каждом ходе висит только описание.', "A rule in a skill is cheaper than one in CLAUDE.md: only a skill's description is carried each turn."),
  tokens('Запрети через deny-правила чтение node_modules, dist и lock-файлов.', 'Use deny rules to keep Claude out of node_modules, dist and lock files.'),
  tokens('5 параллельных агентов расходуют 5 контекстов: запускай флот, только если задача делится.', '5 parallel agents burn 5 contexts: run a fleet only when the task really splits.'),

  // Skills.
  skill('writing-skills (Superpowers): пишет и проверяет скиллы через тесты, как код.', 'writing-skills (Superpowers): writes and tests skills the way you test code.', 'github.com/obra/superpowers'),
  skill('brainstorming (Superpowers): идея → вопросы → дизайн, и только потом код.', 'brainstorming (Superpowers): idea → questions → design, and only then code.', 'github.com/obra/superpowers'),
  skill('writing-plans + executing-plans (Superpowers): план из шагов, проверка после каждого.', 'writing-plans + executing-plans (Superpowers): a plan in steps, checked after each one.', 'github.com/obra/superpowers'),
  skill('systematic-debugging (Superpowers): сначала гипотезы и проверки, потом фикс.', 'systematic-debugging (Superpowers): hypotheses and checks first, the fix after.', 'github.com/obra/superpowers'),
  skill('test-driven-development (Superpowers): падающий тест → код → тест проходит.', 'test-driven-development (Superpowers): failing test → code → test passes.', 'github.com/obra/superpowers'),
  skill('subagent-driven-development (Superpowers): каждый шаг плана делает свежий агент, следующий проверяет его работу.', 'subagent-driven-development (Superpowers): a fresh agent does each plan step and the next one reviews its work.', 'github.com/obra/superpowers'),
  skill('verification-before-completion (Superpowers): «готово» только с доказательством.', 'verification-before-completion (Superpowers): "done" only with proof.', 'github.com/obra/superpowers'),
  skill('using-git-worktrees + finishing-a-development-branch (Superpowers): изолированная ветка и аккуратный финал.', 'using-git-worktrees + finishing-a-development-branch (Superpowers): an isolated branch and a tidy finish.', 'github.com/obra/superpowers'),
  skill('pr-review-toolkit: silent-failure-hunter ищет проглоченные ошибки и пустые catch.', 'pr-review-toolkit: silent-failure-hunter finds swallowed errors and empty catch blocks.', OFFICIAL),
  skill('hookify: «/hookify не давай коммитить в main» делает хук из одной фразы.', 'hookify: "/hookify don\'t let me commit to main" turns one sentence into a hook.', OFFICIAL),
  skill('skill-creator: создаёт скилл и прогоняет его на тестовых задачах.', 'skill-creator: builds a skill and runs it on test tasks.', OFFICIAL),
  skill('find-skills: «найди скилл для X» ищет в каталоге skills.sh.', 'find-skills: "find a skill for X" searches the skills.sh catalog.', 'github.com/vercel-labs/skills'),
  skill('high-end-visual-design: шрифты, отступы и тени дорогого лендинга.', 'high-end-visual-design: the fonts, spacing and shadows of an expensive landing page.', 'github.com/leonxlnx/taste-skill'),
  skill('better-colors: палитра, токены, проверка контраста.', 'better-colors: palettes, tokens and contrast checks.', 'github.com/jakubkrehel/skills'),
  skill('pixel-art-sprites: спрайты и анимация, им рисовали этого хомяка.', 'pixel-art-sprites: sprites and animation; it drew this hamster.', 'github.com/omer-metin/skills-for-antigravity'),
  skill('remotion-best-practices: видео, написанное кодом на React.', 'remotion-best-practices: video written as React code.', 'github.com/remotion-dev/skills'),
  skill('web-perf: аудит скорости сайта (Core Web Vitals) через Chrome DevTools.', 'web-perf: a site speed audit (Core Web Vitals) through Chrome DevTools.', 'github.com/cloudflare/skills'),
  skill('agent-reach: Reddit, X, YouTube, GitHub и другие площадки в одном скилле.', 'agent-reach: Reddit, X, YouTube, GitHub and other platforms in one skill.', 'github.com/Panniantong/Agent-Reach'),
  skill('marketing-psychology: ментальные модели для лендингов и цен.', 'marketing-psychology: mental models for landing pages and pricing.', 'github.com/coreyhaines31/marketingskills'),
  skill('docx, pdf, xlsx, pptx: настоящие файлы, таблицы с формулами, заполнение PDF-форм.', 'docx, pdf, xlsx, pptx: real files, spreadsheets with formulas, PDF form filling.', 'github.com/anthropics/skills'),
  skill('deep-research: многошаговое исследование с источниками. Встроен в Claude.', 'deep-research: multi-step research with sources. Built into Claude.'),
  skill('dataviz: графики и дашборды в едином стиле, со светлой и тёмной темой. Встроен в Claude.', 'dataviz: charts and dashboards in one style, light and dark. Built into Claude.'),
  skill('/code-review, /simplify, /security-review: баги, чистка и уязвимости в текущем диффе. Встроены в Claude Code.', '/code-review, /simplify, /security-review: bugs, cleanup and vulnerabilities in the current diff. Built into Claude Code.'),
  skill('/fewer-permission-prompts: добавляет безопасные команды в список разрешённых, вопросов «разрешить?» меньше.', '/fewer-permission-prompts: adds safe commands to the allowlist, so fewer "allow?" questions.'),
  skill('engineering и product-management: /debug, /system-design, /write-spec (спецификация фичи из одной фразы).', 'engineering and product-management: /debug, /system-design, /write-spec (a feature spec from one sentence).', 'github.com/anthropics/knowledge-work-plugins'),
  skill('anthropics/skills: официальная коллекция скиллов Anthropic.', "anthropics/skills: Anthropic's official skills collection.", 'github.com/anthropics/skills'),
  skill('frontend-design: самый устанавливаемый скилл, убирает «ИИ-шный» вид интерфейса.', 'frontend-design: the most installed skill; it removes the "AI look" from interfaces.', OFFICIAL),
  skill('webapp-testing: Claude пишет Playwright-скрипт и сам проверяет приложение.', 'webapp-testing: Claude writes a Playwright script and tests your app itself.', 'github.com/anthropics/skills'),
  skill('mcp-builder: свой MCP-сервер по лучшим практикам.', 'mcp-builder: your own MCP server, built by best practice.', 'github.com/anthropics/skills'),
  skill('doc-coauthoring: совместное написание документа по этапам.', 'doc-coauthoring: write a document together, stage by stage.', 'github.com/anthropics/skills'),
  skill('algorithmic-art: генеративная графика на p5.js.', 'algorithmic-art: generative graphics in p5.js.', 'github.com/anthropics/skills'),
  skill('react-best-practices от Vercel: правила производительности React и Next.', 'react-best-practices by Vercel: performance rules for React and Next.', 'github.com/vercel-labs/agent-skills'),
  skill('web-design-guidelines от Vercel: аудит интерфейса на доступность и UX.', 'web-design-guidelines by Vercel: an interface audit for accessibility and UX.', 'github.com/vercel-labs/agent-skills'),
  skill('ui-ux-pro-max: стили, палитры и шрифты под тип продукта.', 'ui-ux-pro-max: styles, palettes and fonts matched to the product type.', 'github.com/nextlevelbuilder/ui-ux-pro-max-skill'),
  skill('trailofbits/skills: аудит безопасности от Trail of Bits.', 'trailofbits/skills: security auditing from Trail of Bits.', 'github.com/trailofbits/skills'),
  skill('frontend-slides: анимированные презентации в HTML.', 'frontend-slides: animated presentations in HTML.', 'github.com/zarazhangrui/frontend-slides'),
  skill('dev-browser: быстрый браузер для Claude, помнит состояние между шагами.', 'dev-browser: a fast browser for Claude that keeps state between steps.', 'github.com/SawyerHood/dev-browser'),
  skill('playwright-skill: браузерные проверки на лету.', 'playwright-skill: browser checks on the fly.', 'github.com/lackeyjb/playwright-skill'),
  skill('expo/skills: React Native от авторов Expo.', 'expo/skills: React Native from the Expo team.', 'github.com/expo/skills'),
  skill('cloudflare/skills: Workers, Durable Objects и Agents SDK.', 'cloudflare/skills: Workers, Durable Objects, Agents SDK.', 'github.com/cloudflare/skills'),
  skill('scientific-agent-skills: научные базы и библиотеки для анализа данных.', 'scientific-agent-skills: scientific databases and libraries for data analysis.', 'github.com/K-Dense-AI/scientific-agent-skills'),
  skill('elements-of-style: ясный текст по правилам Странка.', "elements-of-style: clear writing by Strunk's rules.", 'github.com/obra/superpowers-marketplace'),
  skill('episodic-memory: поиск по прошлым разговорам с Claude и Codex.', 'episodic-memory: search across past conversations with Claude and Codex.', 'github.com/obra/episodic-memory'),
  skill('marketingskills целиком: копирайтинг, SEO, CRO, цены.', 'The whole marketingskills set: copywriting, SEO, CRO, pricing.', 'github.com/coreyhaines31/marketingskills'),
  skill('skills.sh: каталог скиллов с рейтингом установок, видно, что ставят другие.', 'skills.sh: a skills catalog ranked by installs, so you can see what others use.', 'skills.sh'),
  skill('plugin-authoring: свои моды, панели и полосы, как этот хомяк. Встроен в Claude Code.', 'plugin-authoring: build your own mods, panels and bands, like this hamster. Built into Claude Code.'),

  // Plugins.
  plugin('feature-dev: исследование кода → архитектура → реализация → ревью.', 'feature-dev: code exploration → architecture → implementation → review.', OFFICIAL),
  plugin('code-review: ревью PR несколькими агентами, ложные находки отсекаются по уверенности.', 'code-review: PR review by several agents; false findings are cut by confidence.', OFFICIAL),
  plugin('security-guidance: предупреждения прямо во время правок плюс ревью диффа.', 'security-guidance: warnings while you edit, plus a diff review.', OFFICIAL),
  plugin('claude-security: глубокий скан уязвимостей, каждая находка перепроверяется.', 'claude-security: a deep vulnerability scan; every finding is re-checked.', OFFICIAL),
  plugin('claude-code-setup: смотрит проект и советует хуки, скиллы, MCP и агентов.', 'claude-code-setup: looks at your project and suggests hooks, skills, MCP servers and agents.', OFFICIAL),
  plugin('commit-commands: коммит, push и PR одной командой.', 'commit-commands: commit, push and open a PR in one command.', OFFICIAL),
  plugin('code-simplifier: упрощает свежий код, поведение не меняется.', 'code-simplifier: simplifies fresh code, behavior unchanged.', OFFICIAL),
  plugin('ralph-loop: Claude крутит задачу в цикле, пока не выполнит критерий.', 'ralph-loop: Claude loops on a task until the success criterion is met.', OFFICIAL),
  plugin('playground: интерактивные HTML-песочницы с ползунками и живым превью.', 'playground: interactive HTML playgrounds with sliders and a live preview.', OFFICIAL),
  plugin('typescript-lsp, pyright-lsp: Claude видит ошибки типов сразу, как в IDE.', 'typescript-lsp, pyright-lsp: Claude sees type errors right away, like an IDE.', OFFICIAL),
  plugin('learning-output-style: ключевые куски кода Claude оставляет писать тебе, так ты учишься.', 'learning-output-style: Claude leaves the key pieces of code for you to write, so you learn.', OFFICIAL),
  plugin('receipts: отчёт о том, что ты сделал с Claude, для самооценки или руководителя.', 'receipts: a report of what you did with Claude, for a self-review or your manager.', OFFICIAL),
  plugin('project-artifact: живая страница статуса проекта по приватной ссылке.', 'project-artifact: a living project status page behind a private link.', OFFICIAL),
  plugin('double-shot-latte: убирает вопрос «продолжить?», Claude сам решает, доделывать ли.', 'double-shot-latte: removes the "shall I continue?" question; Claude decides whether to carry on.', 'github.com/obra/superpowers-marketplace'),
  plugin('coderabbit, greptile: внешний ИИ-ревьюер PR со статическими анализаторами.', 'coderabbit, greptile: an outside AI reviewer for PRs with static analyzers.', OFFICIAL),

  // MCP servers.
  mcp('Playwright MCP: Claude кликает по твоему приложению.', 'Playwright MCP: Claude clicks through your app.', 'github.com/microsoft/playwright-mcp'),
  mcp('Chrome DevTools MCP: консоль, сеть, трейсы производительности.', 'Chrome DevTools MCP: console, network, performance traces.', 'github.com/ChromeDevTools/chrome-devtools-mcp'),
  mcp('GitHub MCP: задачи, PR и Actions.', 'GitHub MCP: issues, PRs, Actions.', 'github.com/github/github-mcp-server'),
  mcp('Sentry: от стека ошибки сразу к месту в коде.', "Sentry: from an error's stack trace straight to the place in code.", OFFICIAL),
  mcp('Figma: код по макету вместе с токенами дизайна.', 'Figma: code from the design, design tokens included.', OFFICIAL),
  mcp('Supabase MCP или Neon: база и миграции, к проду только read-only.', 'Supabase MCP or Neon: database and migrations; read-only for production.', 'github.com/supabase/mcp'),
  mcp('Firecrawl: любой сайт превращает в чистый markdown.', 'Firecrawl: turns any site into clean markdown.', 'github.com/firecrawl/firecrawl-mcp-server'),
  mcp('Exa: поиск по смыслу и глубокие исследования.', 'Exa: search by meaning and deep research.', 'github.com/exa-labs/exa-mcp-server'),
  mcp('Linear, Notion, Atlassian: задача из трекера → код → статус обратно.', 'Linear, Notion, Atlassian: task from the tracker → code → status back.', OFFICIAL),
  mcp('Vercel, PostHog: деплои и логи, аналитика и фичефлаги прямо в чате.', 'Vercel, PostHog: deploys and logs, analytics and feature flags right in the chat.', OFFICIAL),

  // Collections and ways of working.
  t('collection', 'awesome-claude-code: главный каталог скиллов, хуков и команд.', 'awesome-claude-code: the main catalog of skills, hooks and commands.', 'github.com/hesreallyhim/awesome-claude-code'),
  t('collection', 'awesome-claude-skills от Composio.', 'awesome-claude-skills by Composio.', 'github.com/ComposioHQ/awesome-claude-skills'),
  t('collection', 'wshobson/agents: большая коллекция готовых субагентов и плагинов.', 'wshobson/agents: a big collection of ready-made subagents and plugins.', 'github.com/wshobson/agents'),
  t('collection', 'awesome-claude-code-subagents: сотни ролей, копируешь нужную в .claude/agents.', 'awesome-claude-code-subagents: hundreds of roles; copy the one you want into .claude/agents.', 'github.com/VoltAgent/awesome-claude-code-subagents'),
  t('collection', 'claude-code-templates: агенты, команды, хуки и MCP, ставятся одной командой.', 'claude-code-templates: agents, commands, hooks and MCP, installed with one command.', 'github.com/davila7/claude-code-templates'),
  t('trick', 'Слово «ultracode» включает оркестрацию десятков агентов: для огромных задач, дорого.', 'The word "ultracode" turns on orchestration of dozens of agents: for huge tasks, and it\'s costly.'),
  t('trick', 'Каждая сессия десктопа может работать в своём worktree: две фичи параллельно без конфликтов.', 'Every desktop session can work in its own worktree: two features in parallel without conflicts.'),
  t('trick', 'Remote Control: отвечай Claude с телефона, пока он работает.', 'Remote Control: answer Claude from your phone while it works.'),
  t('trick', '/schedule и /loop: агент по расписанию, например ночные тесты или утренний обзор PR.', '/schedule and /loop: an agent on a timer, like nightly tests or a morning PR digest.'),
]

// A fixed shuffle, so neighbours in the list never show back to back and
// the order looks random while staying the same for everyone.
const order = (n: number): number[] => {
  const idx = Array.from({ length: n }, (_, i) => i)
  let seed = 0x9e3779b9
  for (let i = n - 1; i > 0; i--) {
    seed = (Math.imul(seed ^ (seed >>> 15), 0x2c1b3c6d) + 0x6d2b79f5) >>> 0
    const j = seed % (i + 1)
    ;[idx[i], idx[j]] = [idx[j]!, idx[i]!]
  }
  return idx
}

const ORDER = order(TIPS.length)

// How long one calm tip stays on the card.
export const TIP_MS = 20000

// The tip for a given slot of TIP_MS: a new one every 20 seconds, none
// repeated until all have been shown.
export const tipAt = (slot: number): Tip =>
  TIPS[ORDER[((slot % TIPS.length) + TIPS.length) % TIPS.length]!]!
