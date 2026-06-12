export const HUES: Record<string, { base: string; stripe: string }> = {
  azul:    { base: 'oklch(0.68 0.14 245)',  stripe: 'oklch(0.42 0.16 245)' },
  marinho: { base: 'oklch(0.40 0.11 250)',  stripe: 'oklch(0.25 0.12 255)' },
  laranja: { base: 'oklch(0.685 0.175 45)', stripe: 'oklch(0.45 0.20 45)'  },
  verde:   { base: 'oklch(0.66 0.135 158)', stripe: 'oklch(0.42 0.14 158)' },
  roxo:    { base: 'oklch(0.555 0.16 295)', stripe: 'oklch(0.35 0.18 295)' },
  rosa:    { base: 'oklch(0.70 0.15 0)',    stripe: 'oklch(0.45 0.18 0)'   },
  ocre:    { base: 'oklch(0.72 0.10 90)',   stripe: 'oklch(0.48 0.12 90)'  },
  pedra:   { base: 'oklch(0.78 0.04 85)',   stripe: 'oklch(0.55 0.06 80)'  },
  ceu:     { base: 'oklch(0.78 0.09 215)',  stripe: 'oklch(0.52 0.11 220)' },
  vinho:   { base: 'oklch(0.45 0.14 15)',   stripe: 'oklch(0.28 0.15 15)'  },
}

export const COLOR_PRESETS: Record<string, {
  bg: string; ink: string; acc1: string; acc2: string; acc3: string
}> = {
  'Ateliê': { bg: '0.984 0.006 85', ink: '0.215 0.012 65', acc1: '0.685 0.175 45', acc2: '0.66 0.135 158', acc3: '0.555 0.16 295' },
  'Tinta':  { bg: '0.97 0.005 260', ink: '0.20 0.012 265', acc1: '0.68 0.14 245',  acc2: '0.70 0.14 0',   acc3: '0.66 0.14 158' },
  'Argila': { bg: '0.96 0.018 55',  ink: '0.28 0.025 50',  acc1: '0.60 0.15 25',   acc2: '0.62 0.12 145', acc3: '0.50 0.13 280' },
  'Noite':  { bg: '0.15 0.015 255', ink: '0.88 0.008 75',  acc1: '0.80 0.16 55',   acc2: '0.72 0.15 165', acc3: '0.65 0.17 305' },
}

export const DEFAULT_PROFILE = {
  name: 'mirelits',
  handle: '@mirelits',
  tagline: 'Ilustradora & quadrinista',
  location: 'São Paulo, Brasil',
  email: 'ola@mirelits.com',
  shortBio: '',
  fullBio: '',
  profileHue: 'laranja',
  profilePhotoUrl: null as string | null,
}
