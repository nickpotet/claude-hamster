# All 110 tips

The hamster rotates through these every 20 seconds (English; the mod has a Russian twin for each). Generated from `hamster/hooks/tips.ts`.

## Saving tokens (30)

- Add a hint before /compact saying what to keep: /compact Keep the goal, decisions with reasons, files and next steps.
- Give routine work to Sonnet and keep Opus for the hard parts: it uses noticeably less of your limit.
- /clear is free: use it between unrelated tasks.
- Don't continue yesterday's chats: a new session with a short brief is cheaper than an old context.
- Asking for command output? Ask for it short: long results bloat the context fastest.
- Unused plugins and skills ride along on every turn: switch off what you don't use.
- Before /clear, ask Claude to save the goal, decisions and next steps to a file, and continue from it in a new session.
- The cache expires quickly: compacting right after a reply is cheaper than after a break.
- How the cache cools: while it is warm, rereading the chat costs only 10% of the price. The cache lives about 5 minutes after the last reply (up to an hour in some modes) and is extended with every new message. [platform.claude.com/docs/en/build-with-claude/prompt-caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- A cold cache: after a pause the whole chat is written again, roughly 12 times pricier than reading from a warm one (1.25× vs 0.1×). One message or /compact in a big chat after a break costs as much as several normal turns. Better /clear.
- /context shows what fills the window: MCP, skills, CLAUDE.md, history.
- session-report: an HTML report of your sessions with the most expensive prompts, cache use and subagents. *(official catalog plugin)*
- ccusage: spend by day and model. Ask: "run npx ccusage daily". [github.com/ccusage/ccusage](https://github.com/ccusage/ccusage)
- Serena: Claude finds the right functions and classes without reading whole files. Big savings on large projects. [github.com/oraios/serena](https://github.com/oraios/serena)
- Context7: docs for the exact library version instead of ten attempts at guessing the API. [github.com/upstash/context7](https://github.com/upstash/context7)
- claude-mem: compresses past sessions into notes and loads only what's relevant. [github.com/thedotmack/claude-mem](https://github.com/thedotmack/claude-mem)
- claude-md-management: audits CLAUDE.md and trims what gets loaded on every turn. *(official catalog plugin)*
- Every turn Claude rereads the whole chat, so the 30th message costs many times more than the first.
- Every MCP server pays for its tool descriptions on every turn: keep only the ones you need enabled.
- @path/file instead of "find where the payment is": no reading half the project.
- Hand searches over big code to the Explore agent: you get an answer back, not 50 files.
- Set model: haiku on your search agents in .claude/agents/*.md.
- High and max effort are for the hard stuff; low or medium is enough for routine work.
- From a log, give the last 50 lines or just the error. Crop screenshots.
- Put all clarifications in one message, not three in a row.
- Roll back a bad reply with /rewind instead of arguing: the argument stays in the context.
- The limit runs in 5-hour windows: check /usage before a heavy task.
- A rule in a skill is cheaper than one in CLAUDE.md: only a skill's description is carried each turn.
- Use deny rules to keep Claude out of node_modules, dist and lock files.
- 5 parallel agents burn 5 contexts: run a fleet only when the task really splits.

## Skills (46)

- writing-skills (Superpowers): writes and tests skills the way you test code. [github.com/obra/superpowers](https://github.com/obra/superpowers)
- brainstorming (Superpowers): idea → questions → design, and only then code. [github.com/obra/superpowers](https://github.com/obra/superpowers)
- writing-plans + executing-plans (Superpowers): a plan in steps, checked after each one. [github.com/obra/superpowers](https://github.com/obra/superpowers)
- systematic-debugging (Superpowers): hypotheses and checks first, the fix after. [github.com/obra/superpowers](https://github.com/obra/superpowers)
- test-driven-development (Superpowers): failing test → code → test passes. [github.com/obra/superpowers](https://github.com/obra/superpowers)
- subagent-driven-development (Superpowers): a fresh agent does each plan step and the next one reviews its work. [github.com/obra/superpowers](https://github.com/obra/superpowers)
- verification-before-completion (Superpowers): "done" only with proof. [github.com/obra/superpowers](https://github.com/obra/superpowers)
- using-git-worktrees + finishing-a-development-branch (Superpowers): an isolated branch and a tidy finish. [github.com/obra/superpowers](https://github.com/obra/superpowers)
- pr-review-toolkit: silent-failure-hunter finds swallowed errors and empty catch blocks. *(official catalog plugin)*
- hookify: "/hookify don't let me commit to main" turns one sentence into a hook. *(official catalog plugin)*
- skill-creator: builds a skill and runs it on test tasks. *(official catalog plugin)*
- find-skills: "find a skill for X" searches the skills.sh catalog. [github.com/vercel-labs/skills](https://github.com/vercel-labs/skills)
- high-end-visual-design: the fonts, spacing and shadows of an expensive landing page. [github.com/leonxlnx/taste-skill](https://github.com/leonxlnx/taste-skill)
- better-colors: palettes, tokens and contrast checks. [github.com/jakubkrehel/skills](https://github.com/jakubkrehel/skills)
- pixel-art-sprites: sprites and animation; it drew this hamster. [github.com/omer-metin/skills-for-antigravity](https://github.com/omer-metin/skills-for-antigravity)
- remotion-best-practices: video written as React code. [github.com/remotion-dev/skills](https://github.com/remotion-dev/skills)
- web-perf: a site speed audit (Core Web Vitals) through Chrome DevTools. [github.com/cloudflare/skills](https://github.com/cloudflare/skills)
- agent-reach: Reddit, X, YouTube, GitHub and other platforms in one skill. [github.com/Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach)
- marketing-psychology: mental models for landing pages and pricing. [github.com/coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills)
- docx, pdf, xlsx, pptx: real files, spreadsheets with formulas, PDF form filling. [github.com/anthropics/skills](https://github.com/anthropics/skills)
- deep-research: multi-step research with sources. Built into Claude.
- dataviz: charts and dashboards in one style, light and dark. Built into Claude.
- /code-review, /simplify, /security-review: bugs, cleanup and vulnerabilities in the current diff. Built into Claude Code.
- /fewer-permission-prompts: adds safe commands to the allowlist, so fewer "allow?" questions.
- engineering and product-management: /debug, /system-design, /write-spec (a feature spec from one sentence). [github.com/anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins)
- anthropics/skills: Anthropic's official skills collection. [github.com/anthropics/skills](https://github.com/anthropics/skills)
- frontend-design: the most installed skill; it removes the "AI look" from interfaces. *(official catalog plugin)*
- webapp-testing: Claude writes a Playwright script and tests your app itself. [github.com/anthropics/skills](https://github.com/anthropics/skills)
- mcp-builder: your own MCP server, built by best practice. [github.com/anthropics/skills](https://github.com/anthropics/skills)
- doc-coauthoring: write a document together, stage by stage. [github.com/anthropics/skills](https://github.com/anthropics/skills)
- algorithmic-art: generative graphics in p5.js. [github.com/anthropics/skills](https://github.com/anthropics/skills)
- react-best-practices by Vercel: performance rules for React and Next. [github.com/vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)
- web-design-guidelines by Vercel: an interface audit for accessibility and UX. [github.com/vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)
- ui-ux-pro-max: styles, palettes and fonts matched to the product type. [github.com/nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
- trailofbits/skills: security auditing from Trail of Bits. [github.com/trailofbits/skills](https://github.com/trailofbits/skills)
- frontend-slides: animated presentations in HTML. [github.com/zarazhangrui/frontend-slides](https://github.com/zarazhangrui/frontend-slides)
- dev-browser: a fast browser for Claude that keeps state between steps. [github.com/SawyerHood/dev-browser](https://github.com/SawyerHood/dev-browser)
- playwright-skill: browser checks on the fly. [github.com/lackeyjb/playwright-skill](https://github.com/lackeyjb/playwright-skill)
- expo/skills: React Native from the Expo team. [github.com/expo/skills](https://github.com/expo/skills)
- cloudflare/skills: Workers, Durable Objects, Agents SDK. [github.com/cloudflare/skills](https://github.com/cloudflare/skills)
- scientific-agent-skills: scientific databases and libraries for data analysis. [github.com/K-Dense-AI/scientific-agent-skills](https://github.com/K-Dense-AI/scientific-agent-skills)
- elements-of-style: clear writing by Strunk's rules. [github.com/obra/superpowers-marketplace](https://github.com/obra/superpowers-marketplace)
- episodic-memory: search across past conversations with Claude and Codex. [github.com/obra/episodic-memory](https://github.com/obra/episodic-memory)
- The whole marketingskills set: copywriting, SEO, CRO, pricing. [github.com/coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills)
- skills.sh: a skills catalog ranked by installs, so you can see what others use. [skills.sh](https://skills.sh)
- plugin-authoring: build your own mods, panels and bands, like this hamster. Built into Claude Code.

## Plugins (15)

- feature-dev: code exploration → architecture → implementation → review. *(official catalog plugin)*
- code-review: PR review by several agents; false findings are cut by confidence. *(official catalog plugin)*
- security-guidance: warnings while you edit, plus a diff review. *(official catalog plugin)*
- claude-security: a deep vulnerability scan; every finding is re-checked. *(official catalog plugin)*
- claude-code-setup: looks at your project and suggests hooks, skills, MCP servers and agents. *(official catalog plugin)*
- commit-commands: commit, push and open a PR in one command. *(official catalog plugin)*
- code-simplifier: simplifies fresh code, behavior unchanged. *(official catalog plugin)*
- ralph-loop: Claude loops on a task until the success criterion is met. *(official catalog plugin)*
- playground: interactive HTML playgrounds with sliders and a live preview. *(official catalog plugin)*
- typescript-lsp, pyright-lsp: Claude sees type errors right away, like an IDE. *(official catalog plugin)*
- learning-output-style: Claude leaves the key pieces of code for you to write, so you learn. *(official catalog plugin)*
- receipts: a report of what you did with Claude, for a self-review or your manager. *(official catalog plugin)*
- project-artifact: a living project status page behind a private link. *(official catalog plugin)*
- double-shot-latte: removes the "shall I continue?" question; Claude decides whether to carry on. [github.com/obra/superpowers-marketplace](https://github.com/obra/superpowers-marketplace)
- coderabbit, greptile: an outside AI reviewer for PRs with static analyzers. *(official catalog plugin)*

## MCP servers (10)

- Playwright MCP: Claude clicks through your app. [github.com/microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)
- Chrome DevTools MCP: console, network, performance traces. [github.com/ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- GitHub MCP: issues, PRs, Actions. [github.com/github/github-mcp-server](https://github.com/github/github-mcp-server)
- Sentry: from an error's stack trace straight to the place in code. *(official catalog plugin)*
- Figma: code from the design, design tokens included. *(official catalog plugin)*
- Supabase MCP or Neon: database and migrations; read-only for production. [github.com/supabase/mcp](https://github.com/supabase/mcp)
- Firecrawl: turns any site into clean markdown. [github.com/firecrawl/firecrawl-mcp-server](https://github.com/firecrawl/firecrawl-mcp-server)
- Exa: search by meaning and deep research. [github.com/exa-labs/exa-mcp-server](https://github.com/exa-labs/exa-mcp-server)
- Linear, Notion, Atlassian: task from the tracker → code → status back. *(official catalog plugin)*
- Vercel, PostHog: deploys and logs, analytics and feature flags right in the chat. *(official catalog plugin)*

## Collections (5)

- awesome-claude-code: the main catalog of skills, hooks and commands. [github.com/hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)
- awesome-claude-skills by Composio. [github.com/ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills)
- wshobson/agents: a big collection of ready-made subagents and plugins. [github.com/wshobson/agents](https://github.com/wshobson/agents)
- awesome-claude-code-subagents: hundreds of roles; copy the one you want into .claude/agents. [github.com/VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents)
- claude-code-templates: agents, commands, hooks and MCP, installed with one command. [github.com/davila7/claude-code-templates](https://github.com/davila7/claude-code-templates)

## Tricks (4)

- The word "ultracode" turns on orchestration of dozens of agents: for huge tasks, and it's costly.
- Every desktop session can work in its own worktree: two features in parallel without conflicts.
- Remote Control: answer Claude from your phone while it works.
- /schedule and /loop: an agent on a timer, like nightly tests or a morning PR digest.

