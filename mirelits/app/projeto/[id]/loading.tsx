import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function Loading() {
  return (
    <>
      <Header profile={{ name: 'mirelits', profileHue: 'laranja', socialLinks: [] }} />

      <main role="status" aria-label="A carregar" style={{ flex: 1 }}>
        <article aria-hidden="true" className="wrap" style={{ paddingTop: 'clamp(28px,5vw,52px)' }}>

          {/* back link */}
          <div className="skel" style={{ width: 120, height: 13, borderRadius: 3 }} />

          {/* project header */}
          <header style={{ marginTop: 22, maxWidth: 760, borderBottom: '1px solid var(--line)', paddingBottom: 30 }}>
            {/* category + year */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div className="skel" style={{ width: 88, height: 22, borderRadius: 999 }} />
              <div className="skel" style={{ width: 36, height: 14 }} />
            </div>
            {/* title */}
            <div className="skel" style={{ width: '58%', height: 'clamp(38px,7vw,72px)', marginTop: 18 }} />
            {/* subtitle */}
            <div className="skel" style={{ width: '38%', height: 20, marginTop: 14 }} />
            {/* description */}
            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 9 }}>
              <div className="skel" style={{ width: '88%', height: 13 }} />
              <div className="skel" style={{ width: '72%', height: 13 }} />
              <div className="skel" style={{ width: '52%', height: 13 }} />
            </div>
          </header>

          {/* image placeholders */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'clamp(20px,4vw,44px)',
            marginTop: 'clamp(28px,5vw,48px)',
          }}>
            <div className="skel" style={{ width: '100%', maxWidth: 940, aspectRatio: '4 / 3', borderRadius: 6 }} />
            <div className="skel" style={{ width: '100%', maxWidth: 720, aspectRatio: '3 / 4', borderRadius: 6 }} />
            <div className="skel" style={{ width: '100%', maxWidth: 940, aspectRatio: '16 / 9', borderRadius: 6 }} />
          </div>

        </article>

        {/* next project skeleton */}
        <div style={{ borderTop: '1px solid var(--line)', marginTop: 64 }}>
          <div className="wrap" style={{ paddingBlock: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="skel" style={{ width: 100, height: 12 }} />
              <div className="skel" style={{ width: 240, height: 'clamp(26px,4vw,40px)' }} />
            </div>
            <div className="skel" style={{ width: 48, height: 48, borderRadius: 999 }} />
          </div>
        </div>
      </main>

      <Footer profile={{ name: 'mirelits', profileHue: 'laranja' }} />
    </>
  )
}
