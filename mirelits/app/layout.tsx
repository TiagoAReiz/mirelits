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

  const themeVars = theme
    ? [
        theme.colorBg   ? `--bg: oklch(${theme.colorBg});` : '',
        theme.colorInk  ? `--ink: oklch(${theme.colorInk}); --ink-soft: oklch(from oklch(${theme.colorInk}) calc(l + 0.25) c h); --ink-faint: oklch(from oklch(${theme.colorInk}) calc(l + 0.44) c h);` : '',
        theme.colorAcc1 ? `--acc-1: oklch(${theme.colorAcc1}); --acc-1-ink: oklch(from oklch(${theme.colorAcc1}) calc(l - 0.28) c h);` : '',
        theme.colorAcc2 ? `--acc-2: oklch(${theme.colorAcc2});` : '',
        theme.colorAcc3 ? `--acc-3: oklch(${theme.colorAcc3});` : '',
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
