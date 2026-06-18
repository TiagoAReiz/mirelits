export default function Loading() {
  return (
    <main style={{ flex: 1 }}>
      <div className="wrap" style={{ paddingTop: 'clamp(36px,6vw,68px)', paddingBottom: 80, maxWidth: 640 }}>
        <div className="skel" style={{ width: 90, height: 13 }} />
        <div className="skel" style={{ width: '55%', height: 'clamp(36px,6vw,60px)', marginTop: 16 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 14 }}>
          <div className="skel" style={{ width: '85%', height: 14 }} />
          <div className="skel" style={{ width: '68%', height: 14 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 40 }}>
          <div className="skel" style={{ width: '100%', height: 48, borderRadius: 6 }} />
          <div className="skel" style={{ width: '100%', height: 48, borderRadius: 6 }} />
          <div className="skel" style={{ width: '100%', height: 120, borderRadius: 6 }} />
          <div className="skel" style={{ width: 140, height: 44, borderRadius: 999, marginTop: 8 }} />
        </div>
      </div>
    </main>
  )
}
