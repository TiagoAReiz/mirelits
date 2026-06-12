/* =========================================================================
   ui.jsx — roteador hash, Header comum, Footer, Avatar/Logo, placeholders
   ========================================================================= */

/* ---------- roteamento por hash ---------- */
function nav(path) {
  if (location.hash !== "#" + path) location.hash = path;
  else window.scrollTo({ top: 0 });
}
function parseRoute() {
  let h = location.hash.replace(/^#/, "");
  if (!h || h === "/") return { name: "home", params: {} };
  const seg = h.split("/").filter(Boolean);
  if (seg[0] === "projeto") return { name: "projeto", params: { id: seg[1] } };
  if (seg[0] === "sobre") return { name: "sobre", params: {} };
  if (seg[0] === "contato") return { name: "contato", params: {} };
  if (seg[0] === "admin") {
    if (!seg[1]) return { name: "admin-login", params: {} };
    if (seg[1] === "projetos") return { name: "admin-projetos", params: {} };
    if (seg[1] === "novo") return { name: "admin-editor", params: { id: null } };
    if (seg[1] === "editar") return { name: "admin-editor", params: { id: seg[2] } };
    if (seg[1] === "config") return { name: "admin-config", params: {} };
    return { name: "admin-login", params: {} };
  }
  return { name: "home", params: {} };
}
function useRoute() {
  const [route, setRoute] = useState(parseRoute);
  useEffect(() => {
    const on = () => { setRoute(parseRoute()); window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" }); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}

/* ---------- placeholder de obra ---------- */
function Ph({ hue = "pedra", ratio, cap, src, className = "", style = {}, showCap = true, angle }) {
  const h = HUES[hue] || HUES.pedra;
  const st = {
    "--ph-base": h.base,
    "--ph-stripe": h.stripe,
    ...(angle ? { "--ph-angle": angle } : {}),
    ...(ratio ? { aspectRatio: String(1) + " / " + ratio } : {}),
    ...style,
  };
  if (src) {
    return (
      <div className={"ph " + className} style={st}>
        <img src={src} alt={cap || ""} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 1 }} />
      </div>
    );
  }
  return (
    <div className={"ph " + className} style={st}>
      {showCap && cap ? <span className="ph-cap">{cap}</span> : null}
    </div>
  );
}

/* ---------- avatar / logo da artista ---------- */
function Avatar({ size = 36, ring = false }) {
  const { state } = useStore();
  const s = state.settings;
  const initials = (s.name || "M").split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const h = HUES[s.profileHue] || HUES.laranja;
  const fill = size >= 1000;
  const dim = fill ? "100%" : size;
  const fontPx = fill ? 72 : size * 0.4;
  const box = {
    width: dim, height: dim, borderRadius: "50%", overflow: "hidden",
    flex: "0 0 auto", position: "relative",
    boxShadow: ring ? "0 0 0 3px var(--bg), 0 0 0 4px var(--line)" : "none",
  };
  if (s.profileImage) {
    return <div style={box}><img src={s.profileImage} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>;
  }
  return (
    <div style={{ ...box, background: h.base, display: "grid", placeItems: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(125deg, transparent 0 7px, color-mix(in oklch," + h.stripe + " 14%, transparent) 7px 8px)" }}></div>
      <span className="serif" style={{ position: "relative", color: "#fff", fontSize: fontPx, fontWeight: 600, lineHeight: 1, textShadow: "0 1px 2px color-mix(in oklch," + h.stripe + " 50%, transparent)" }}>{initials}</span>
    </div>
  );
}

/* ---------- rótulo de seção (mono + ponto colorido) ---------- */
function SectionLabel({ children, color = "var(--acc-1)" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <span className="dot" style={{ background: color }}></span>
      <span className="label">{children}</span>
    </div>
  );
}

/* ---------- HEADER comum ---------- */
function Header({ route }) {
  const { state } = useStore();
  const s = state.settings;
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [route && route.name]);

  const links = [
    { label: "Projetos", path: "/", active: route.name === "home" || route.name === "projeto" },
    { label: "Sobre", path: "/sobre", active: route.name === "sobre" },
    { label: "Contato", path: "/contato", active: route.name === "contato" },
  ];

  const Link = ({ l }) => (
    <a href={"#" + l.path} className="mono"
       style={{
         fontSize: 13, letterSpacing: "0.04em", padding: "6px 2px",
         color: l.active ? "var(--ink)" : "var(--ink-soft)",
         borderBottom: "2px solid " + (l.active ? "var(--acc-1)" : "transparent"),
         transition: "color .2s, border-color .2s",
       }}
       onMouseEnter={e => e.currentTarget.style.color = "var(--ink)"}
       onMouseLeave={e => e.currentTarget.style.color = l.active ? "var(--ink)" : "var(--ink-soft)"}>
      {l.label}
    </a>
  );

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "color-mix(in oklch, var(--bg) 88%, transparent)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--line-soft)",
    }}>
      <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, gap: 16 }}>
        {/* logo */}
        <a href="#/" style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
          <Avatar size={34} />
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.05, minWidth: 0 }}>
            <span className="serif" style={{ fontSize: 19, fontWeight: 500, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{s.name}</span>
            <span className="mono" style={{ fontSize: 9.5, letterSpacing: "0.12em", color: "var(--ink-faint)", textTransform: "uppercase" }}>{s.tagline}</span>
          </span>
        </a>

        {/* nav desktop */}
        <nav className="nav-desk" style={{ display: "none", alignItems: "center", gap: 26 }}>
          {links.map(l => <Link key={l.label} l={l} />)}
          <a href="#/contato" className="btn btn--sm" style={{ marginLeft: 4 }}>Propor projeto</a>
        </nav>

        {/* botão mobile */}
        <button className="nav-burger" aria-label="Menu" onClick={() => setOpen(o => !o)}
          style={{ display: "inline-flex", flexDirection: "column", gap: 4, background: "none", border: "none", padding: 8 }}>
          <span style={{ width: 22, height: 2, background: "var(--ink)", borderRadius: 2, transition: "transform .25s", transform: open ? "translateY(6px) rotate(45deg)" : "none" }}></span>
          <span style={{ width: 22, height: 2, background: "var(--ink)", borderRadius: 2, opacity: open ? 0 : 1, transition: "opacity .2s" }}></span>
          <span style={{ width: 22, height: 2, background: "var(--ink)", borderRadius: 2, transition: "transform .25s", transform: open ? "translateY(-6px) rotate(-45deg)" : "none" }}></span>
        </button>
      </div>

      {/* menu mobile */}
      <div style={{
        overflow: "hidden", borderBottom: open ? "1px solid var(--line-soft)" : "none",
        maxHeight: open ? 320 : 0, transition: "max-height .3s cubic-bezier(.2,.7,.2,1)",
        background: "var(--bg)",
      }}>
        <div className="wrap" style={{ display: "flex", flexDirection: "column", gap: 4, paddingBlock: open ? 12 : 0 }}>
          {links.map(l => (
            <a key={l.label} href={"#" + l.path} className="serif"
               style={{ fontSize: 28, padding: "8px 0", color: l.active ? "var(--acc-1-ink)" : "var(--ink)", display: "flex", alignItems: "center", gap: 12 }}>
              {l.active && <span className="dot" style={{ background: "var(--acc-1)" }}></span>}
              {l.label}
            </a>
          ))}
          <a href="#/contato" className="btn" style={{ marginTop: 8, justifyContent: "center" }}>Propor projeto</a>
        </div>
      </div>
      <style>{`@media (min-width: 760px){ .nav-desk{ display:flex !important; } .nav-burger{ display:none !important; } }`}</style>
    </header>
  );
}

/* ---------- FOOTER comum ---------- */
function Footer() {
  const { state } = useStore();
  const s = state.settings;
  return (
    <footer style={{ borderTop: "1px solid var(--line-soft)", marginTop: 72, paddingBlock: 36 }}>
      <div className="wrap" style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar size={30} />
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-soft)", lineHeight: 1.5 }}>
            {s.name} © 2026<br />
            <span style={{ color: "var(--ink-faint)" }}>Não autorizo uso destas imagens para fins de IA.</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <a href="#/sobre" className="label" style={{ color: "var(--ink-soft)" }}>Sobre</a>
          <a href="#/contato" className="label" style={{ color: "var(--ink-soft)" }}>Contato</a>
          <a href="#/admin" className="label" title="Área da artista"
             style={{ color: "var(--ink-faint)", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span className="dot" style={{ background: "var(--acc-2)" }}></span>Área da artista
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ---------- hook utilitário: drag-and-drop por índice (HTML5 DnD) ---------- */
function useDragList(onReorder) {
  const dragIndex = useRef(null);
  const [over, setOver] = useState(null);
  return {
    over,
    itemProps: (index) => ({
      draggable: true,
      onDragStart: (e) => { dragIndex.current = index; e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", String(index)); } catch (_) {} },
      onDragOver: (e) => { e.preventDefault(); if (over !== index) setOver(index); },
      onDragEnter: (e) => { e.preventDefault(); },
      onDrop: (e) => {
        e.preventDefault();
        const from = dragIndex.current;
        if (from != null && from !== index) onReorder(from, index);
        dragIndex.current = null; setOver(null);
      },
      onDragEnd: () => { dragIndex.current = null; setOver(null); },
    }),
  };
}

Object.assign(window, {
  nav, parseRoute, useRoute, Ph, Avatar, SectionLabel, Header, Footer, useDragList,
});
