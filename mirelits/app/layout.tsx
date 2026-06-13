import type { Metadata } from 'next'
import { Newsreader, Hanken_Grotesk, Space_Mono } from 'next/font/google'
import { prisma } from '@/lib/prisma'
import { AuthProvider } from '@/components/auth-provider'
import './globals.css'

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
  style: ['normal', 'italic'],
})

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken',
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '700'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'mirelits — portfólio',
  description: 'Portfólio de ilustração e quadrinhos',
}

export const dynamic = 'force-dynamic'

async function getTheme() {
  try {
    const profile = await prisma.artistProfile.findFirst({
      select: { colorBg: true, colorInk: true, colorAcc1: true, colorAcc2: true, colorAcc3: true },
    })
    return profile
  } catch {
    return null
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = await getTheme()

  // supports both bare oklch params ("0.98 0.006 85") and full CSS values ("oklch(...)" or "#hex")
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

  const themeVars = theme
    ? [
        bg   ? `--bg: ${bg};` : '',
        ink  ? `--ink: ${ink}; --ink-soft: oklch(from ${ink} calc(l + 0.25) c h); --ink-faint: oklch(from ${ink} calc(l + 0.44) c h);` : '',
        acc1 ? `--acc-1: ${acc1}; --acc-1-ink: oklch(from ${acc1} calc(l - 0.28) c h);` : '',
        acc2 ? `--acc-2: ${acc2};` : '',
        acc3 ? `--acc-3: ${acc3};` : '',
      ].filter(Boolean).join('\n')
    : ''

  return (
    <html
      lang="pt-BR"
      className={`${newsreader.variable} ${hankenGrotesk.variable} ${spaceMono.variable}`}
    >
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
