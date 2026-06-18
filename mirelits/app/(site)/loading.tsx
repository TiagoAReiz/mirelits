export default function Loading() {
  return (
    <main style={{ flex: 1 }}>
      <section className="wrap" style={{ paddingTop: 'clamp(36px, 7vw, 80px)', paddingBottom: 'clamp(28px, 5vw, 52px)' }}>
        <div style={{ display: 'grid', gap: 'clamp(24px,5vw,56px)', gridTemplateColumns: '1fr', alignItems: 'start' }} className="hero-grid">
          <div style={{ maxWidth: 620 }}>
            <div className="skel" style={{ width: 80, height: 13 }} />
            <div className="skel" style={{ width: '55%', height: 'clamp(44px,9vw,88px)', marginTop: 14 }} />
            <div className="skel" style={{ width: '45%', height: 22, marginTop: 10 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
              <div className="skel" style={{ width: '85%', height: 14 }} />
              <div className="skel" style={{ width: '70%', height: 14 }} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 26 }}>
              <div className="skel" style={{ width: 130, height: 38, borderRadius: 999 }} />
              <div className="skel" style={{ width: 150, height: 38, borderRadius: 999 }} />
            </div>
          </div>
          <div className="hero-portrait" style={{ justifySelf: 'start' }}>
            <div className="skel" style={{ width: 'clamp(130px,34vw,220px)', aspectRatio: '1', borderRadius: '50%' }} />
          </div>
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 24 }}>
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 22, marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div className="skel" style={{ width: 200, height: 28 }} />
          <div className="skel" style={{ width: 60, height: 13 }} />
        </div>
        <div style={{ columns: 'var(--mason-cols, 3)', columnGap: 14 }}>
          {([1.4, 0.75, 1.1, 0.6, 1.6, 1.0] as number[]).map((ratio, i) => (
            <div key={i} className="skel" style={{ marginBottom: 14, borderRadius: 4, aspectRatio: `1 / ${ratio}`, breakInside: 'avoid' }} />
          ))}
        </div>
      </section>

      <style>{`
        @media (min-width: 760px) {
          .hero-grid { grid-template-columns: 1fr auto !important; }
        }
        @media (max-width: 759px) {
          .hero-portrait { order: -1; }
        }
      `}</style>
    </main>
  )
}
