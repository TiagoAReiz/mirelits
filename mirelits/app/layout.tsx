import type { Metadata } from 'next'
import {
  Newsreader, Hanken_Grotesk, Space_Mono,
  Playfair_Display, Cormorant_Garamond, Lora,
  Inter, DM_Sans, Plus_Jakarta_Sans,
} from 'next/font/google'
import { prisma } from '@/lib/prisma'
import { AuthProvider } from '@/components/auth-provider'
import './globals.css'

const newsreader = Newsreader({
  subsets: ['latin'], variable: '--font-newsreader', display: 'swap',
  style: ['normal', 'italic'],
})
const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'], variable: '--font-hanken', display: 'swap',
})
const spaceMono = Space_Mono({
  subsets: ['latin'], variable: '--font-mono', display: 'swap',
  weight: ['400', '700'], style: ['normal', 'italic'],
})
const playfairDisplay = Playfair_Display({
  subsets: ['latin'], variable: '--font-playfair', display: 'swap',
  style: ['normal', 'italic'],
})
const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'], variable: '--font-cormorant', display: 'swap',
  weight: ['300', '400', '500', '600'], style: ['normal', 'italic'],
})
const lora = Lora({
  subsets: ['latin'], variable: '--font-lora', display: 'swap',
  style: ['normal', 'italic'],
})
const inter = Inter({
  subsets: ['latin'], variable: '--font-inter', display: 'swap',
})
const dmSans = DM_Sans({
  subsets: ['latin'], variable: '--font-dm-sans', display: 'swap',
})
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'], variable: '--font-jakarta', display: 'swap',
})

export const metadata: Metadata = {
  title: 'mirelits — portfólio',
  description: 'Portfólio de ilustração e quadrinhos',
}

export const dynamic = 'force-dynamic'

const FONT_STACK: Record<string, { cssVar: string; fallback: string }> = {
  newsreader: { cssVar: '--font-newsreader', fallback: 'Georgia, serif' },
  playfair:   { cssVar: '--font-playfair',   fallback: 'Georgia, serif' },
  cormorant:  { cssVar: '--font-cormorant',  fallback: 'Georgia, serif' },
  lora:       { cssVar: '--font-lora',       fallback: 'Georgia, serif' },
  hanken:     { cssVar: '--font-hanken',     fallback: 'system-ui, sans-serif' },
  inter:      { cssVar: '--font-inter',      fallback: 'system-ui, sans-serif' },
  'dm-sans':  { cssVar: '--font-dm-sans',    fallback: 'system-ui, sans-serif' },
  jakarta:    { cssVar: '--font-jakarta',    fallback: 'system-ui, sans-serif' },
}

function resolveFont(key: string | null | undefined): string | null {
  if (!key) return null
  const entry = FONT_STACK[key]
  return entry ? `var(${entry.cssVar}), ${entry.fallback}` : null
}

async function getTheme() {
  try {
    const profile = await prisma.artistProfile.findFirst({
      select: {
        colorBg: true, colorInk: true, colorAcc1: true, colorAcc2: true, colorAcc3: true,
        fontDisplay: true, fontSubtitle: true, fontBody: true,
      },
    })
    return profile
  } catch {
    return null
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = await getTheme()

  function cssColor(val: string | null | undefined): string | null {
    if (!val) return null
    if (val.startsWith('#') || val.startsWith('oklch(') || val.startsWith('rgb')) return val
    return `oklch(${val})`
  }

  const bg   = cssColor(theme?.colorBg)
  const ink  = cssColor(theme?.colorInk)
  const acc1 = cssColor(theme?.colorAcc1)
  const acc2 = cssColor(theme?.colorAcc2)
  const acc3 = cssColor(theme?.colorAcc3)

  const displayFont  = resolveFont(theme?.fontDisplay)
  const subtitleFont = resolveFont(theme?.fontSubtitle)
  const bodyFont     = resolveFont(theme?.fontBody)

  const themeVars = [
    bg   ? `--bg: ${bg};` : '',
    ink  ? `--ink: ${ink}; --ink-soft: oklch(from ${ink} calc(l + 0.25) c h); --ink-faint: oklch(from ${ink} calc(l + 0.44) c h);` : '',
    acc1 ? `--acc-1: ${acc1}; --acc-1-ink: oklch(from ${acc1} calc(l - 0.28) c h);` : '',
    acc2 ? `--acc-2: ${acc2};` : '',
    acc3 ? `--acc-3: ${acc3};` : '',
    displayFont  ? `--ff-display:  ${displayFont};`  : '',
    subtitleFont ? `--ff-subtitle: ${subtitleFont};` : '',
    bodyFont     ? `--ff-body:     ${bodyFont};`     : '',
  ].filter(Boolean).join('\n')

  const allFontVars = `${newsreader.variable} ${hankenGrotesk.variable} ${spaceMono.variable} ${playfairDisplay.variable} ${cormorantGaramond.variable} ${lora.variable} ${inter.variable} ${dmSans.variable} ${plusJakartaSans.variable}`

  return (
    <html lang="pt-BR" className={allFontVars}>
      {themeVars && (
        <head>
          <style>{`:root { ${themeVars} }`}</style>
        </head>
      )}
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
