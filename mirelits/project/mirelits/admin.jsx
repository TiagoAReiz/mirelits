/* =========================================================================
   admin.jsx — Login, AdminShell, Dashboard, Editor (drag), Configurações
   ========================================================================= */

function readFileAsDataURL(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

/* --------------------------- LOGIN --------------------------- */
function AdminLogin() {
  const { state, actions } = useStore();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState(false);

  useEffect(() => { if (state.auth) nav("/admin/projetos"); }, [state.auth]);

  const submit = (e) => {
    e.preventDefault();
    if (actions.login(u, p)) nav("/admin/projetos");
    else setErr(true);
  };

  return (
    <div className="route" data-screen-label="Admin · Login" style={{ flex: 1, display: "grid", placeItems: "center", padding: "var(--gut)" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <a href="#/" style={{ display: "flex", alignItems: "center", gap: 11, justifyContent: "center", marginBottom: 28 }}>
          <Avatar size={42} />
        </a>
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <SectionLabel color="var(--acc-2)"><span style={{ margin: "0 auto" }}>Área da artista</span></SectionLabel>
          <h1 className="serif" style={{ fontSize: 38, margin: "12px 0 0", fontWeight: 500 }}>Entrar no ateliê</h1>
          <p style={{ color: "var(--ink-soft)", marginTop: 8, fontSize: 14.5 }}>Acesso restrito para gerenciar projetos e ajustes do site.</p>
        </div>
        <form onSubmit={submit} style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 12, padding: 24, display: "grid", gap: 14 }}>
          <label style={{ display: "grid", gap: 7 }}>
            <span className="label">Usuário</span>
            <input className="field" value={u} onChange={e => { setU(e.target.value); setErr(false); }} placeholder="mira" autoFocus />
          </label>
          <label style={{ display: "grid", gap: 7 }}>
            <span className="label">Senha</span>
            <input className="field" type="password" value={p} onChange={e => { setP(e.target.value); setErr(false); }} placeholder="••••••" />
          </label>
          {err && <div className="mono" style={{ fontSize: 12, color: "var(--acc-1-ink)" }}>Preencha usuário e senha para entrar.</div>}
          <button type="submit" className="btn" style={{ justifyContent: "center", padding: "13px" }}>Entrar</button>
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-faint)", textAlign: "center", lineHeight: 1.6 }}>
            protótipo · qualquer usuário/senha funciona<br />sugestão: <strong>mira</strong> / <strong>arte</strong>
          </div>
        </form>
        <div style={{ textAlign: "center", marginTop: 18 }}>
          <a href="#/" className="label" style={{ color: "var(--ink-soft)" }}>← Voltar ao site</a>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- SHELL (header admin) --------------------------- */
function AdminShell({ route, children }) {
  const { state, actions } = useStore();
  const tabs = [
    { label: "Projetos", path: "/admin/projetos", on: route.name === "admin-projetos" || route.name === "admin-editor" },
    { label: "Configurações", path: "/admin/config", on: route.name === "admin-config" },
  ];
  return (
    <>
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--ink)", color: "var(--bg)" }}>
        <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 58, gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <Avatar size={30} />
            <div style={{ minWidth: 0 }}>
              <div className="serif" style={{ fontSize: 16, fontWeight: 500, lineHeight: 1, whiteSpace: "nowrap" }}>{state.settings.name}</div>
              <div className="mono" style={{ fontSize: 9, letterSpacing: ".14em", opacity: .6, textTransform: "uppercase" }}>modo artista</div>
            </div>
          </div>
          <nav style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {tabs.map(t => (
              <a key={t.label} href={"#" + t.path} className="mono"
                 style={{ fontSize: 12, padding: "7px 11px", borderRadius: 99, letterSpacing: ".03em",
                   background: t.on ? "color-mix(in oklch, var(--bg) 18%, transparent)" : "transparent",
                   color: t.on ? "var(--bg)" : "color-mix(in oklch, var(--bg) 65%, transparent)" }}>
                {t.label}
              </a>
            ))}
            <a href="#/" className="mono nav-hide-sm" style={{ fontSize: 12, padding: "7px 11px", color: "color-mix(in oklch, var(--bg) 65%, transparent)" }} title="Ver site">Ver site ↗</a>
            <button onClick={() => { actions.logout(); nav("/"); }} className="mono"
              style={{ fontSize: 12, padding: "7px 12px", borderRadius: 99, background: "transparent", border: "1px solid color-mix(in oklch, var(--bg) 35%, transparent)", color: "var(--bg)" }}>Sair</button>
          </nav>
        </div>
      </header>
      <div className="route" style={{ flex: 1 }}>{children}</div>
      <style>{`@media (max-width:560px){ .nav-hide-sm{ display:none !important; } }`}</style>
    </>
  );
}

function AdminTitle({ kicker, title, action }) {
  return (
    <div className="admin-title">
      <div>
        <SectionLabel color="var(--acc-2)">{kicker}</SectionLabel>
        <h1 className="serif" style={{ fontSize: "clamp(28px,5vw,42px)", lineHeight: 1.05, margin: "10px 0 0", fontWeight: 500 }}>{title}</h1>
      </div>
      {action ? <div style={{ flexShrink: 0 }}>{action}</div> : null}
      <style>{`
        .admin-title { display:flex; flex-direction:column; align-items:flex-start; gap:16px; margin-bottom:26px; }
        @media (min-width:640px){ .admin-title{ flex-direction:row; align-items:flex-end; justify-content:space-between; } }
      `}</style>
    </div>
  );
}

/* --------------------------- DASHBOARD (projetos) --------------------------- */
function AdminProjetos() {
  const { state, actions } = useStore();
  const dl = useDragList((from, to) => actions.reorderProjects(from, to));
  const [editLabel, setEditLabel] = useState(null);

  return (
    <div data-screen-label="Admin · Projetos" className="wrap" style={{ paddingTop: "clamp(28px,5vw,48px)", paddingBottom: 60 }}>
      <AdminTitle kicker="Gerenciar" title="Seus projetos"
        action={<a href="#/admin/novo" className="btn btn--accent">+ Novo projeto</a>} />

      <div className="mono" style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <span>⠿ arraste para reordenar</span>
        <span><span className="dot" style={{ background: "var(--acc-1)", marginRight: 5 }}></span>fixados sobem para o topo da home</span>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {state.projects.map((p, i) => {
          const cover = p.images[0] || {};
          return (
            <div key={p.id} {...dl.itemProps(i)}
              style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--paper)", border: "1px solid var(--line)",
                borderRadius: 10, padding: 12, transition: "box-shadow .2s, transform .12s",
                boxShadow: dl.over === i ? "0 0 0 2px var(--acc-1)" : "none" }}>
              <span className="mono" style={{ color: "var(--ink-faint)", cursor: "grab", fontSize: 18, lineHeight: 1, userSelect: "none" }}>⠿</span>
              <Ph hue={cover.hue} src={cover.src} showCap={false} style={{ width: 56, height: 56, borderRadius: 6, flex: "0 0 auto" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span className="serif" style={{ fontSize: 19, fontWeight: 500 }}>{p.title}</span>
                  {p.pinned && p.pinLabel ? <span className="mono" style={{ fontSize: 9.5, background: "var(--acc-1)", color: "#fff", padding: "2px 7px", borderRadius: 99, letterSpacing: ".08em", textTransform: "uppercase" }}>{p.pinLabel}</span> : null}
                </div>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 2 }}>{p.subtitle} · {p.images.length} fotos</div>
                {editLabel === p.id && (
                  <div style={{ display: "flex", gap: 6, marginTop: 8, alignItems: "center" }}>
                    <input className="field" style={{ padding: "6px 9px", fontSize: 12, maxWidth: 160 }} value={p.pinLabel}
                      placeholder="destaque, novo..." onChange={e => actions.setPinLabel(p.id, e.target.value)} autoFocus />
                    <button className="btn btn--sm btn--ghost" onClick={() => setEditLabel(null)}>ok</button>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <button title={p.pinned ? "Desafixar" : "Fixar / destacar"}
                  onClick={() => { actions.togglePin(p.id); if (!p.pinned) setEditLabel(p.id); }}
                  className="mono" style={{ width: 36, height: 36, borderRadius: 8, fontSize: 15,
                    border: "1px solid " + (p.pinned ? "var(--acc-1)" : "var(--line)"),
                    background: p.pinned ? "color-mix(in oklch, var(--acc-1) 14%, transparent)" : "var(--bg)",
                    color: p.pinned ? "var(--acc-1-ink)" : "var(--ink-soft)" }}>
                  {p.pinned ? "★" : "☆"}
                </button>
                {p.pinned && (
                  <button onClick={() => setEditLabel(editLabel === p.id ? null : p.id)} className="btn btn--sm btn--ghost nav-hide-sm" style={{ fontSize: 10 }}>nome</button>
                )}
                <a href={"#/admin/editar/" + p.id} className="btn btn--sm btn--ghost">Editar</a>
                <button onClick={() => { if (confirm("Excluir \"" + p.title + "\"?")) actions.deleteProject(p.id); }}
                  className="mono" style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--ink-soft)", fontSize: 14 }} title="Excluir">✕</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* --------------------------- EDITOR (drag-and-drop) --------------------------- */
function AdminEditor({ id }) {
  const { state, actions } = useStore();
  const existing = id ? state.projects.find(p => p.id === id) : null;
  const [proj, setProj] = useState(() => existing ? structuredClone(existing) : {
    id: genId("p"), title: "", subtitle: "", category: "Ilustração", year: String(new Date().getFullYear()),
    description: "", pinned: false, pinLabel: "", images: [],
  });
  const set = (k) => (e) => setProj(p => ({ ...p, [k]: e.target.value }));
  const fileRef = useRef(null);

  const dl = useDragList((from, to) => setProj(p => {
    const a = [...p.images]; const [m] = a.splice(from, 1); a.splice(to, 0, m); return { ...p, images: a };
  }));

  const addSwatch = (hue) => setProj(p => ({ ...p, images: [...p.images, img(hue, [0.75, 1, 1.3, 1.5][Math.floor(Math.random() * 4)], "fig. " + String(p.images.length + 1).padStart(2, "0"))] }));
  const removeImg = (imgId) => setProj(p => ({ ...p, images: p.images.filter(x => x.id !== imgId) }));
  const makeCover = (imgId) => setProj(p => { const a = [...p.images]; const i = a.findIndex(x => x.id === imgId); if (i > 0) { const [m] = a.splice(i, 1); a.unshift(m); } return { ...p, images: a }; });
  const onUpload = async (e) => {
    const files = [...e.target.files];
    for (const f of files) {
      try { const url = await readFileAsDataURL(f); setProj(p => ({ ...p, images: [...p.images, { id: genId("img"), hue: "pedra", ratio: 1, cap: f.name, src: url }] })); } catch (_) {}
    }
    e.target.value = "";
  };

  const valid = proj.title.trim() && proj.images.length > 0;
  const save = () => { if (!valid) return; actions.saveProject(proj); nav("/admin/projetos"); };

  return (
    <div data-screen-label="Admin · Editor" className="wrap" style={{ paddingTop: "clamp(24px,4vw,40px)", paddingBottom: 80 }}>
      <a href="#/admin/projetos" className="mono" style={{ fontSize: 12, color: "var(--ink-soft)", letterSpacing: ".05em" }}>← Projetos</a>
      <AdminTitle kicker={existing ? "Editar" : "Criar"} title={existing ? "Editar projeto" : "Novo projeto"}
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <a href="#/admin/projetos" className="btn btn--ghost btn--sm">Cancelar</a>
            <button onClick={save} disabled={!valid} className="btn btn--accent btn--sm" style={{ opacity: valid ? 1 : .4, cursor: valid ? "pointer" : "not-allowed" }}>Salvar projeto</button>
          </div>
        } />

      <div style={{ display: "grid", gap: "clamp(20px,3vw,36px)", gridTemplateColumns: "1fr" }} className="editor-grid">
        {/* coluna esquerda: dados */}
        <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
          <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 10, padding: 18, display: "grid", gap: 14 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span className="label">Título</span>
              <input className="field" value={proj.title} onChange={set("title")} placeholder="Nome do projeto" />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span className="label">Subtítulo</span>
              <input className="field" value={proj.subtitle} onChange={set("subtitle")} placeholder="Ex.: Série editorial · 2025" />
            </label>
            <div style={{ display: "flex", gap: 12 }}>
              <label style={{ display: "grid", gap: 6, flex: 1 }}>
                <span className="label">Categoria</span>
                <select className="field" value={proj.category} onChange={set("category")}>
                  {["Ilustração", "Editorial", "Capa", "Padronagem", "Quadrinho", "Retratos", "Animação", "Pôster"].map(o => <option key={o}>{o}</option>)}
                </select>
              </label>
              <label style={{ display: "grid", gap: 6, width: 110 }}>
                <span className="label">Ano</span>
                <input className="field" value={proj.year} onChange={set("year")} />
              </label>
            </div>
            <label style={{ display: "grid", gap: 6 }}>
              <span className="label">Descrição</span>
              <textarea className="field" value={proj.description} onChange={set("description")} placeholder="Sobre o projeto, técnica, contexto..."></textarea>
            </label>
            <label style={{ display: "flex", gap: 9, alignItems: "center", cursor: "pointer" }}>
              <input type="checkbox" checked={proj.pinned} onChange={e => setProj(p => ({ ...p, pinned: e.target.checked }))} style={{ accentColor: "var(--acc-1)", width: 16, height: 16 }} />
              <span style={{ fontSize: 14 }}>Fixar na home</span>
              {proj.pinned && <input className="field" style={{ padding: "5px 9px", fontSize: 12, maxWidth: 130, marginLeft: 4 }} placeholder="rótulo: novo" value={proj.pinLabel} onChange={set("pinLabel")} />}
            </label>
          </div>
        </div>

        {/* coluna direita: fotos drag-and-drop */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
            <span className="label">Fotos do projeto · arraste para ordenar</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-faint)" }}>{proj.images.length} fotos</span>
          </div>

          {/* paleta para adicionar placeholders + upload */}
          <div style={{ background: "var(--paper)", border: "1px dashed var(--line)", borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <div className="mono" style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 9 }}>Adicionar foto:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, alignItems: "center" }}>
              {HUE_KEYS.map(h => (
                <button key={h} onClick={() => addSwatch(h)} title={"+ " + h}
                  style={{ width: 30, height: 30, borderRadius: 7, border: "2px solid var(--bg)", boxShadow: "0 0 0 1px var(--line)", background: HUES[h].base, cursor: "pointer" }} />
              ))}
              <button onClick={() => fileRef.current && fileRef.current.click()} className="btn btn--ghost btn--sm" style={{ marginLeft: 4 }}>↑ Enviar imagem</button>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={onUpload} style={{ display: "none" }} />
            </div>
          </div>

          {proj.images.length === 0 ? (
            <div style={{ border: "1px dashed var(--line)", borderRadius: 10, padding: 40, textAlign: "center", color: "var(--ink-faint)" }} className="mono">
              Nenhuma foto ainda.<br />Adicione cores acima ou envie imagens.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12 }}>
              {proj.images.map((im, i) => (
                <div key={im.id} {...dl.itemProps(i)}
                  style={{ position: "relative", borderRadius: 8, overflow: "hidden", cursor: "grab",
                    boxShadow: dl.over === i ? "0 0 0 3px var(--acc-1)" : "0 0 0 1px var(--line)",
                    transition: "box-shadow .15s" }}>
                  <Ph hue={im.hue} src={im.src} ratio={1} showCap={false} style={{ width: "100%" }} />
                  {i === 0 && <span style={{ position: "absolute", top: 6, left: 6, background: "var(--acc-1)", color: "#fff", fontFamily: "var(--ff-mono)", fontSize: 9, padding: "2px 7px", borderRadius: 99, letterSpacing: ".08em" }}>CAPA</span>}
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 6, opacity: 0, transition: "opacity .2s", background: "color-mix(in oklch, var(--ink) 30%, transparent)" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button onClick={(ev) => { ev.preventDefault(); removeImg(im.id); }} className="mono"
                        style={{ width: 26, height: 26, borderRadius: 6, border: "none", background: "var(--bg)", color: "var(--ink)", fontSize: 12 }}>✕</button>
                    </div>
                    {i !== 0 && <button onClick={(ev) => { ev.preventDefault(); makeCover(im.id); }} className="mono"
                      style={{ border: "none", background: "var(--bg)", color: "var(--ink)", fontSize: 10, padding: "5px", borderRadius: 6, letterSpacing: ".05em" }}>tornar capa</button>}
                  </div>
                  <span className="mono" style={{ position: "absolute", bottom: 5, right: 6, fontSize: 9, color: "#fff", background: "color-mix(in oklch, #000 45%, transparent)", padding: "1px 5px", borderRadius: 4 }}>{String(i + 1).padStart(2, "0")}</span>
                </div>
              ))}
            </div>
          )}

          {/* prévia da capa */}
          {proj.images[0] && (
            <div style={{ marginTop: 18 }}>
              <span className="label">Prévia do card na home</span>
              <div style={{ marginTop: 10, width: 180 }}>
                <div style={{ borderRadius: 6, overflow: "hidden", aspectRatio: "1 / " + (proj.images[0].ratio || 1), boxShadow: "0 2px 12px color-mix(in oklch, var(--ink) 14%, transparent)" }}>
                  <Ph hue={proj.images[0].hue} src={proj.images[0].src} showCap={false} style={{ width: "100%", height: "100%" }} />
                </div>
                <div className="serif" style={{ fontSize: 16, marginTop: 8 }}>{proj.title || "Título do projeto"}</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--ink-soft)" }}>{proj.subtitle || "subtítulo"}</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@media (min-width:860px){ .editor-grid{ grid-template-columns: 360px 1fr !important; align-items: start; } }`}</style>
    </div>
  );
}

/* --------------------------- CONFIGURAÇÕES --------------------------- */
function Swatch({ color, active, onClick, title }) {
  return <button onClick={onClick} title={title}
    style={{ width: 34, height: 34, borderRadius: "50%", background: color, cursor: "pointer",
      border: "3px solid var(--bg)", boxShadow: active ? "0 0 0 2px var(--ink)" : "0 0 0 1px var(--line)" }} />;
}

function AdminConfig() {
  const { state, actions } = useStore();
  const s = state.settings;
  const photoRef = useRef(null);
  const tdl = useDragList((from, to) => actions.reorderTimeline(from, to));

  const acc1Opts = ["oklch(0.685 0.175 45)", "oklch(0.62 0.17 250)", "oklch(0.63 0.15 350)", "oklch(0.60 0.15 150)", "oklch(0.60 0.16 300)"];
  const onPhoto = async (e) => { const f = e.target.files[0]; if (f) { const url = await readFileAsDataURL(f); actions.setProfileImage(url); } e.target.value = ""; };

  const card = { background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 12, padding: "clamp(16px,3vw,24px)" };

  return (
    <div data-screen-label="Admin · Configurações" className="wrap" style={{ paddingTop: "clamp(28px,5vw,48px)", paddingBottom: 80 }}>
      <AdminTitle kicker="Ajustes" title="Configurações do site" />

      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr" }} className="config-grid">

        {/* cores */}
        <section style={card}>
          <h2 className="serif" style={{ fontSize: 22, margin: "0 0 4px", fontWeight: 500 }}>Cores do site</h2>
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)", margin: "0 0 16px" }}>Escolha uma combinação ou ajuste o acento principal. Muda em tempo real.</p>
          <span className="label">Temas</span>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10, marginBottom: 20 }}>
            {COLOR_PRESETS.map(pre => {
              const on = s.colors.bg === pre.bg && s.colors.ink === pre.ink && s.colors.acc1 === pre.acc1;
              return (
                <button key={pre.id} onClick={() => actions.setColors({ bg: pre.bg, ink: pre.ink, acc1: pre.acc1, acc2: pre.acc2, acc3: pre.acc3 })}
                  style={{ display: "flex", flexDirection: "column", gap: 8, padding: 10, borderRadius: 10, cursor: "pointer",
                    background: pre.bg, border: "2px solid " + (on ? "var(--acc-1)" : "var(--line)"), minWidth: 96 }}>
                  <div style={{ display: "flex", gap: 5 }}>
                    {[pre.acc1, pre.acc2, pre.acc3].map((c, i) => <span key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: c }}></span>)}
                  </div>
                  <span className="mono" style={{ fontSize: 11, color: pre.ink, letterSpacing: ".04em" }}>{pre.name}</span>
                </button>
              );
            })}
          </div>
          <span className="label">Acento principal</span>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
            {acc1Opts.map(c => <Swatch key={c} color={c} active={s.colors.acc1 === c} onClick={() => actions.setColors({ acc1: c })} />)}
          </div>
          <button className="btn btn--ghost btn--sm" style={{ marginTop: 20 }} onClick={() => actions.setColors({ ...DEFAULT_COLORS })}>Restaurar padrão</button>
        </section>

        {/* perfil */}
        <section style={card}>
          <h2 className="serif" style={{ fontSize: 22, margin: "0 0 4px", fontWeight: 500 }}>Foto de perfil & logo</h2>
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)", margin: "0 0 16px" }}>Aparece na home, no Sobre e como logo do header.</p>
          <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", flex: "0 0 auto" }}><Avatar size={9999} /></div>
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="btn btn--ghost btn--sm" onClick={() => photoRef.current && photoRef.current.click()}>↑ Enviar foto</button>
                {s.profileImage && <button className="btn btn--ghost btn--sm" onClick={() => actions.setProfileImage(null)}>Remover</button>}
                <input ref={photoRef} type="file" accept="image/*" onChange={onPhoto} style={{ display: "none" }} />
              </div>
              {!s.profileImage && (
                <div>
                  <span className="label">Ou uma cor de fundo</span>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    {HUE_KEYS.slice(0, 8).map(h => <Swatch key={h} color={HUES[h].base} active={s.profileHue === h} onClick={() => actions.updateSettings({ profileHue: h })} title={h} />)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* identidade */}
        <section style={card}>
          <h2 className="serif" style={{ fontSize: 22, margin: "0 0 16px", fontWeight: 500 }}>Identidade & bio</h2>
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <label style={{ display: "grid", gap: 6, flex: "1 1 160px" }}><span className="label">Nome</span><input className="field" value={s.name} onChange={e => actions.updateSettings({ name: e.target.value })} /></label>
              <label style={{ display: "grid", gap: 6, flex: "1 1 120px" }}><span className="label">@ / handle</span><input className="field" value={s.handle} onChange={e => actions.updateSettings({ handle: e.target.value })} /></label>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <label style={{ display: "grid", gap: 6, flex: "1 1 160px" }}><span className="label">Profissão</span><input className="field" value={s.tagline} onChange={e => actions.updateSettings({ tagline: e.target.value })} /></label>
              <label style={{ display: "grid", gap: 6, flex: "1 1 120px" }}><span className="label">Local</span><input className="field" value={s.location} onChange={e => actions.updateSettings({ location: e.target.value })} /></label>
            </div>
            <label style={{ display: "grid", gap: 6 }}><span className="label">E-mail de contato</span><input className="field" value={s.email} onChange={e => actions.updateSettings({ email: e.target.value })} /></label>
            <label style={{ display: "grid", gap: 6 }}><span className="label">Bio curta (home)</span><textarea className="field" value={s.shortBio} onChange={e => actions.updateSettings({ shortBio: e.target.value })}></textarea></label>
            <label style={{ display: "grid", gap: 6 }}><span className="label">Bio completa (sobre)</span><textarea className="field" style={{ minHeight: 160 }} value={s.fullBio} onChange={e => actions.updateSettings({ fullBio: e.target.value })}></textarea></label>
          </div>
        </section>

        {/* timeline */}
        <section style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 className="serif" style={{ fontSize: 22, margin: 0, fontWeight: 500 }}>Linha do tempo</h2>
            <button className="btn btn--ghost btn--sm" onClick={actions.addTimeline}>+ Marco</button>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {s.timeline.map((t, i) => (
              <div key={t.id} {...tdl.itemProps(i)}
                style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: 10, borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg)",
                  boxShadow: tdl.over === i ? "0 0 0 2px var(--acc-1)" : "none" }}>
                <span className="mono" style={{ cursor: "grab", color: "var(--ink-faint)", fontSize: 16, paddingTop: 8 }}>⠿</span>
                <input className="field" style={{ width: 76, padding: "8px", fontSize: 13 }} value={t.year} onChange={e => actions.updateTimeline(t.id, { year: e.target.value })} />
                <div style={{ flex: 1, display: "grid", gap: 6 }}>
                  <input className="field" style={{ padding: "8px 10px", fontSize: 14 }} value={t.title} onChange={e => actions.updateTimeline(t.id, { title: e.target.value })} />
                  <input className="field" style={{ padding: "8px 10px", fontSize: 13 }} value={t.text} onChange={e => actions.updateTimeline(t.id, { text: e.target.value })} />
                </div>
                <button onClick={() => actions.removeTimeline(t.id)} className="mono" style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--ink-soft)", flexShrink: 0 }}>✕</button>
              </div>
            ))}
          </div>
        </section>

        {/* reset */}
        <section style={{ ...card, borderColor: "color-mix(in oklch, var(--acc-1) 30%, var(--line))" }}>
          <h2 className="serif" style={{ fontSize: 20, margin: "0 0 6px", fontWeight: 500 }}>Restaurar protótipo</h2>
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)", margin: "0 0 14px" }}>Apaga tudo que você editou e volta aos dados de exemplo.</p>
          <button className="btn btn--ghost btn--sm" onClick={() => { if (confirm("Restaurar todos os dados de exemplo? Suas edições serão perdidas.")) actions.resetAll(); }}>Restaurar dados de exemplo</button>
        </section>
      </div>
      <style>{`@media (min-width:920px){ .config-grid{ grid-template-columns: 1fr 1fr !important; } }`}</style>
    </div>
  );
}

Object.assign(window, { AdminLogin, AdminShell, AdminProjetos, AdminEditor, AdminConfig });
