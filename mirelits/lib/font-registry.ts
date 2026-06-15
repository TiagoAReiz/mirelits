export const FONT_REGISTRY = {
  newsreader: { cssVar: '--font-newsreader', fallback: 'Georgia, serif',         label: 'Newsreader'         },
  playfair:   { cssVar: '--font-playfair',   fallback: 'Georgia, serif',         label: 'Playfair Display'   },
  cormorant:  { cssVar: '--font-cormorant',  fallback: 'Georgia, serif',         label: 'Cormorant Garamond' },
  lora:       { cssVar: '--font-lora',       fallback: 'Georgia, serif',         label: 'Lora'               },
  hanken:     { cssVar: '--font-hanken',     fallback: 'system-ui, sans-serif',  label: 'Hanken Grotesk'     },
  inter:      { cssVar: '--font-inter',      fallback: 'system-ui, sans-serif',  label: 'Inter'              },
  'dm-sans':  { cssVar: '--font-dm-sans',    fallback: 'system-ui, sans-serif',  label: 'DM Sans'            },
  jakarta:    { cssVar: '--font-jakarta',    fallback: 'system-ui, sans-serif',  label: 'Plus Jakarta Sans'  },
} as const

export type FontKey = keyof typeof FONT_REGISTRY
