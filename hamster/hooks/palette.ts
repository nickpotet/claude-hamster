export const COLOR = {
  // The fur ramp shifts hue with the light: shadows lean red-violet,
  // highlights lean yellow, instead of one brown made darker and lighter.
  D: '#6a3b2f',
  B: '#96592f',
  O: '#c4854a',
  L: '#e5b476',
  C: '#f6e4bd',
  M: '#f9dc9c',
  P: '#e29a9a',
  K: '#2c1a14',
  // Softer outlines for the lighter fur, so a pale belly is not ringed in black.
  k: '#4a2c1e',
  c: '#70493a',
  E: '#0d0a08',
  H: '#ffffff',
  T: '#d8c9ae',
  Y: '#f2c14e',
  y: '#ffe066',
  R: '#c8352b',
  r: '#8f2420',
  W: '#f4f4f0',
  G: '#9a9fa6',
  N: '#222a44',
  V: '#4f8a3c',
  U: '#4a86c8',
  Q: '#e8832a',
  S: '#fff6b8',
} as const

export type Key = keyof typeof COLOR
