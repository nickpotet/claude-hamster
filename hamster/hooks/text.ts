// Every word the mod shows, in the two languages it speaks. The language
// follows Claude's own: the `language` setting, else the system locale.
export type Lang = 'ru' | 'en'

// Claude's language setting is free text ("russian", "Русский", "ru"): Russian
// when it says so, any other language falls back to English. With no setting,
// the system locale decides.
export const langOf = (setting: unknown, locale: string | undefined): Lang => {
  const said = typeof setting === 'string' ? setting.trim().toLowerCase() : ''

  if (said !== '') return /^(ru\b|ru[-_]|russian|рус)/.test(said) ? 'ru' : 'en'

  return /^ru/i.test(locale ?? '') ? 'ru' : 'en'
}

// The languages a person can pick, each with its flag.
export const LANGS = [
  { code: 'ru', flag: '🇷🇺', name: 'Русский' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
] as const

// What the person chose: one of the languages, or to follow Claude's own.
export type Pref = 'auto' | Lang

export const isPref = (value: unknown): value is Pref =>
  value === 'auto' || value === 'ru' || value === 'en'

export const flagOf = (lang: Lang) => LANGS.find(l => l.code === lang)!.flag

export const UI = {
  ru: {
    level: 'УР.',
    xp: 'Опыт',
    fed: 'Сытость',
    joy: 'Радость',
    context: 'контекст',
    working: '· Claude работает',
    hamster: 'Хомяк',
    moods: {
      happy: 'сыт и активен',
      ok: 'в норме',
      hungry: 'голоден: контекст почти пуст',
      bored: 'скучает: очисти или сожми контекст',
      dead: 'не подаёт признаков жизни',
    },
    xpAlt: (n: number) => `Опыт: ${n}% до следующего уровня`,
    fedAlt: (n: number) => `Сытость: контекст заполнен на ${n}%`,
    joyAlt: (n: number) => `Радость ${n}%`,
    cleared: 'Контекст очищен: хомяк получил опыт и радость.',
    levelUp: (n: number, title: string) => `Новый уровень ${n}: ${title}!`,
    compact: (title: string, level: number, ctx: number, joy: number) =>
      `${title} · ур. ${level} · контекст ${ctx}% · радость ${joy}%`,
    official: 'плагин из официального каталога',
    language: 'Язык',
    auto: 'Как у Claude',
    gotIt: 'Понятно',
    joyNote: '(/clear или /compact даст радость)',
    tags: {
      tokens: 'ТОКЕНЫ',
      skill: 'СКИЛЛ',
      plugin: 'ПЛАГИН',
      mcp: 'MCP',
      collection: 'ПОДБОРКА',
      trick: 'ПРИЁМ',
    },
    titles: [
      'Новорождённый хомячок',
      'Любопытный хомячок',
      'Запасливый хомяк',
      'Ночной бегун',
      'Мастер нор',
      'Хранитель закромов',
      'Хомяк-стратег',
      'Мудрый хомяк',
      'Владыка зернохранилища',
      'Легендарный хомяк',
    ],
  },
  en: {
    level: 'LV.',
    xp: 'XP',
    fed: 'Fullness',
    joy: 'Joy',
    context: 'context',
    working: '· Claude is working',
    hamster: 'Hamster',
    moods: {
      happy: 'full and lively',
      ok: 'doing fine',
      hungry: 'hungry: the context is almost empty',
      bored: 'bored: clear or compact the context',
      dead: 'showing no signs of life',
    },
    xpAlt: (n: number) => `XP: ${n}% to the next level`,
    fedAlt: (n: number) => `Fullness: the context is ${n}% full`,
    joyAlt: (n: number) => `Joy ${n}%`,
    cleared: 'Context cleared: the hamster gained XP and joy.',
    levelUp: (n: number, title: string) => `Level ${n}: ${title}!`,
    compact: (title: string, level: number, ctx: number, joy: number) =>
      `${title} · lv. ${level} · context ${ctx}% · joy ${joy}%`,
    official: 'official catalog plugin',
    language: 'Language',
    auto: 'Same as Claude',
    gotIt: 'Got it',
    joyNote: '(/clear or /compact will bring joy)',
    tags: {
      tokens: 'TOKENS',
      skill: 'SKILL',
      plugin: 'PLUGIN',
      mcp: 'MCP',
      collection: 'COLLECTION',
      trick: 'TRICK',
    },
    titles: [
      'Newborn Hamster',
      'Curious Hamster',
      'Hoarding Hamster',
      'Night Runner',
      'Burrow Master',
      'Keeper of the Stash',
      'Hamster Strategist',
      'Wise Hamster',
      'Lord of the Granary',
      'Legendary Hamster',
    ],
  },
} as const
