export type Pet = {
  name: string
  xp: number
  food: number
  fun: number
  at: number
  ctx: number
}

export type Tip = {
  text: string
  tag: string
  level: 'info' | 'warn' | 'urgent'
  link?: string | null
  href?: string | null
  id?: string | null
}

declare module 'claude-code' {
  interface PluginState {
    hamster: { pet: Pet; frame: number; tip: Tip; menu: boolean }
  }
}
