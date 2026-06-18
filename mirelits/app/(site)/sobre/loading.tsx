export default function Loading() {
  return (
    <main style={{ flex: 1 }}>
      <div className="wrap" style={{ paddingTop: 'clamp(36px,6vw,68px)', paddingBottom: 'clamp(40px,7vw,72px)' }}>
        <div style={{ display: 'grid', gap: 'clamp(28px,5vw,56px)', gridTemplateColumns: '1fr' }} className="about-grid">
          <div>
            <div className="skel" style={{ width: 100, height: 13 }} />
            <div className="skel" style={{ width: '50%', height: 'clamp(40px,7vw,76px)', marginTop: 14 }} />
            <div className="skel" style={{ width: '42%', height: 22, marginTop: 10 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 20 }}>
              {([90, 78, 83, 65] as number[]).map((w, i) => (
                <div key={i} className="skel" style={{ width: `${w}%`, height: 14 }} />
              ))}
            </div>
          </div>
          <div className="about-portrait" style={{ justifySelf: 'start' }}>
            <div className="skel" style={{ width: 'clamp(150px,40vw,260px)', aspectRatio: '1', borderRadius: '50%' }} />
          </div>
        </div>

        <div style={{ marginTop: 'clamp(40px,7vw,72px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <div className="skel" style={{ width: 160, height: 28 }} />
            <div className="skel" style={{ width: 110, height: 13 }} />
          </div>
          <div style={{ display: 'flex', gap: 28 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ flex: '0 0 auto', width: 248 }}>
                <div className="skel" style={{ width: 60, height: 22 }} />
                <div className="skel" style={{ width: 13, height: 13, borderRadius: '50%', marginTop: 9 }} />
                <div className="skel" style={{ width: '70%', height: 18, marginTop: 16 }} />
                <div className="skel" style={{ width: '85%', height: 13, marginTop: 8 }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 820px) {
          .about-grid { grid-template-columns: 1fr auto !important; align-items: start; }
        }
      `}</style>
    </main>
  )
}
