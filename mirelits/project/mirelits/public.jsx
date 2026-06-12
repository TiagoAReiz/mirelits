/* =========================================================================
   public.jsx — Home, ProjetoDetalhe, Contato, Sobre
   ========================================================================= */

/* CSS específico das telas públicas (injetado uma vez) */
function PublicStyles() {
  return <style>{`
    .masonry { column-gap: 18px; columns: 2; }
    @media (min-width: 560px){ .masonry{ columns: 2; } }
    @media (min-width: 820px){ .masonry{ columns: 3; } }
    @media (min-width: 1100px){ .masonry{ columns: var(--mason-cols, 4); } }

    .pcard {
      break-inside: avoid; margin-bottom: 18px; position: relative;
      cursor: pointer; display: block; z-index: 1;
    }
    .pcard__media { position: relative; }   /* contexto p/ capa + cartas (overflow visível) */
    .pcard__cover {
      position: absolute; inset: 0; border-radius: 6px; overflow: hidden; z-index: 4;
      box-shadow: 0 1px 2px color-mix(in oklch, var(--ink) 8%, transparent);
      transition: transform .42s cubic-bezier(.2,.7,.2,1), box-shadow .42s;
    }
    .deck__layer {
      position: absolute; inset: 0; border-radius: 6px; overflow: hidden; z-index: 2;
      transform: rotate(0) translate(0,0) scale(.96);
      transform-origin: 50% 88%; opacity: 0;
      box-shadow: 0 4px 14px color-mix(in oklch, var(--ink) 18%, transparent);
      transition: transform .5s cubic-bezier(.2,.8,.2,1), opacity .32s ease;
    }
    .pcard__cap { padding: 9px 2px 2px; }
    .pcard__tag {
      position: absolute; top: 9px; left: 9px; z-index: 6;
      font-family: var(--ff-mono); font-size: 9.5px; letter-spacing: .1em; text-transform: uppercase;
      background: var(--acc-1); color: #fff; padding: 3px 8px 2px; border-radius: 99px;
      display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 2px 8px color-mix(in oklch, var(--acc-1) 35%, transparent);
    }

    /* ----- mobile / no-hover: legenda sempre visível, sem cartas ----- */
    .pcard__cap-static { display: block; }
    .pcard__overlay, .pcard__belowhover { display: none; }

    @media (hover: hover) and (min-width: 760px) {
      .pcard__cap-static { display: none; }

      /* ====== Estilo A: escurecer + texto sobreposto ====== */
      [data-hover="dark"] .pcard__overlay {
        display: flex; position: absolute; inset: 0; z-index: 5;
        flex-direction: column; justify-content: flex-end; padding: 16px;
        background: linear-gradient(to top, color-mix(in oklch, var(--ink) 84%, transparent) 0%, color-mix(in oklch, var(--ink) 32%, transparent) 48%, transparent 80%);
        opacity: 0; transition: opacity .35s ease;
      }
      [data-hover="dark"] .pcard:hover .pcard__overlay { opacity: 1; }
      [data-hover="dark"] .pcard:hover .pcard__cover { transform: translateY(-3px); box-shadow: 0 14px 30px color-mix(in oklch, var(--ink) 22%, transparent); }
      [data-hover="dark"] .pcard__overlay .ttl { transform: translateY(8px); transition: transform .35s ease .03s; }
      [data-hover="dark"] .pcard:hover .pcard__overlay .ttl { transform: none; }

      /* ====== Estilo B: deck de cartas ====== */
      [data-hover="deck"] .pcard:hover { z-index: 30; }
      [data-hover="deck"] .pcard:hover .pcard__cover { transform: translateY(-12px) rotate(-1.5deg); box-shadow: 0 18px 38px color-mix(in oklch, var(--ink) 26%, transparent); }
      [data-hover="deck"] .pcard:hover .deck__layer {
        opacity: 1;
        transform: rotate(var(--r)) translate(var(--x), var(--y)) scale(.92);
      }
      [data-hover="deck"] .pcard__belowhover {
        display: block; overflow: hidden; max-height: 0; opacity: 0;
        transition: max-height .42s cubic-bezier(.2,.7,.2,1), opacity .35s ease;
      }
      [data-hover="deck"] .pcard:hover .pcard__belowhover { max-height: 90px; opacity: 1; }
    }
  `}</style>;
}

/* ----- card de projeto na home ----- */
function ProjectCard({ project, hoverStyle }) {
  const cover = project.images[0] || {};
  const fan = project.images.slice(1, 5); // até 4 cartas atrás da capa (capa = 1ª)
  const extra = Math.max(0, project.images.length - 5);

  // ângulos do leque (espalha em volta da capa, como uma mão de cartas)
  const spread = [
    { r: -17, x: -58, y: 18 },
    { r: 15, x: 56, y: 12 },
    { r: -8, x: -30, y: 42 },
    { r: 21, x: 30, y: 38 },
  ];

  return (
    <a className="pcard" href={"#/projeto/" + project.id} aria-label={project.title}>
      {project.pinned && project.pinLabel ? (
        <span className="pcard__tag"><span className="dot" style={{ background: "#fff" }}></span>{project.pinLabel}</span>
      ) : null}

      <div className="pcard__media" style={{ aspectRatio: "1 / " + (cover.ratio || 1) }}>
        {/* cartas do deck (estilo B) — irmãs da capa, espalham para fora no hover */}
        {hoverStyle === "deck" && fan.map((im, i) => (
          <div key={im.id} className="deck__layer"
               style={{ "--r": spread[i].r + "deg", "--x": spread[i].x + "px", "--y": spread[i].y + "px" }}>
            <Ph hue={im.hue} src={im.src} showCap={false} style={{ width: "100%", height: "100%" }} />
            {i === fan.length - 1 && extra > 0 ? (
              <span style={{ position: "absolute", right: 7, bottom: 7, zIndex: 3, fontFamily: "var(--ff-mono)", fontSize: 10, background: "color-mix(in oklch, var(--ink) 78%, transparent)", color: "#fff", padding: "2px 7px", borderRadius: 99 }}>+{extra}</span>
            ) : null}
          </div>
        ))}

        {/* capa */}
        <div className="pcard__cover">
          <Ph hue={cover.hue} src={cover.src} cap={cover.cap} showCap={false} style={{ width: "100%", height: "100%" }} />
          {/* overlay escuro (estilo A) */}
          <div className="pcard__overlay">
            <div className="ttl">
              <div className="serif" style={{ color: "#fff", fontSize: 22, lineHeight: 1.1, fontWeight: 500 }}>{project.title}</div>
              <div className="mono" style={{ color: "color-mix(in oklch, #fff 82%, transparent)", fontSize: 11, marginTop: 5, letterSpacing: ".04em" }}>{project.subtitle}</div>
            </div>
          </div>
        </div>
      </div>

      {/* legenda abaixo — no hover (estilo deck) */}
      <div className="pcard__belowhover pcard__cap">
        <div className="serif" style={{ fontSize: 18, lineHeight: 1.12 }}>{project.title}</div>
        <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-soft)", marginTop: 3, letterSpacing: ".04em" }}>{project.subtitle}</div>
      </div>

      {/* legenda estática (mobile / sem hover) */}
      <div className="pcard__cap-static pcard__cap">
        <div className="serif" style={{ fontSize: 17, lineHeight: 1.12 }}>{project.title}</div>
        <div className="mono" style={{ fontSize: 10, color: "var(--ink-soft)", marginTop: 2, letterSpacing: ".03em" }}>{project.subtitle}</div>
      </div>
    </a>
  );
}

function Home({ hoverStyle }) {
  const { state } = useStore();
  const s = state.settings;
  const ordered = [...state.projects].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="route" data-screen-label="Home">
      <PublicStyles />
      {/* ---- hero: sobre a artista (resumo) ---- */}
      <section className="wrap" style={{ paddingTop: "clamp(36px, 7vw, 80px)", paddingBottom: "clamp(28px, 5vw, 52px)" }}>
        <div style={{ display: "grid", gap: "clamp(24px,5vw,56px)", gridTemplateColumns: "1fr", alignItems: "start" }} className="hero-grid">
          <div style={{ maxWidth: 620 }}>
            <SectionLabel>Olá, eu sou</SectionLabel>
            <h1 className="serif" style={{ fontSize: "clamp(44px, 9vw, 88px)", lineHeight: 0.98, letterSpacing: "-0.02em", margin: "14px 0 0", fontWeight: 500 }}>
              {s.name}
            </h1>
            <p className="serif ital" style={{ fontSize: "clamp(19px,3vw,26px)", color: "var(--acc-1-ink)", margin: "8px 0 0", lineHeight: 1.25 }}>
              {s.tagline} · {s.location}
            </p>
            <p style={{ fontSize: "clamp(16px,2.2vw,18px)", color: "var(--ink-soft)", marginTop: 20, maxWidth: 540, textWrap: "pretty", lineHeight: 1.6 }}>
              {s.shortBio}
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 26, flexWrap: "wrap" }}>
              <a href="#/sobre" className="btn btn--ghost">Sobre a artista</a>
              <a href="#/contato" className="btn">Propor um projeto</a>
            </div>
          </div>
          <div style={{ justifySelf: "start" }} className="hero-portrait">
            <div style={{ width: "clamp(130px, 34vw, 220px)" }}>
              <div style={{ borderRadius: "50%", overflow: "hidden", aspectRatio: "1", boxShadow: "0 18px 40px color-mix(in oklch, var(--ink) 16%, transparent)" }}>
                <Avatar size={9999} />
              </div>
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-faint)", textAlign: "center", marginTop: 12, letterSpacing: ".08em" }}>{s.handle}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- projetos (masonry) ---- */}
      <section className="wrap" style={{ paddingBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20, borderTop: "1px solid var(--line)", paddingTop: 22, gap: 12, flexWrap: "wrap" }}>
          <h2 className="serif" style={{ fontSize: "clamp(24px,4vw,34px)", margin: 0, fontWeight: 500 }}>Projetos selecionados</h2>
          <span className="mono" style={{ fontSize: 12, color: "var(--ink-faint)", letterSpacing: ".06em" }}>{state.projects.length.toString().padStart(2, "0")} trabalhos</span>
        </div>
        <div className="masonry" data-hover={hoverStyle}>
          {ordered.map(p => <ProjectCard key={p.id} project={p} hoverStyle={hoverStyle} />)}
        </div>
      </section>

      <style>{`@media (min-width: 760px){ .hero-grid{ grid-template-columns: 1fr auto !important; } }
        @media (max-width: 759px){ .hero-portrait{ order: -1; } }`}</style>
    </div>
  );
}

/* =========================== PROJETO (detalhe) =========================== */
function ProjetoDetalhe({ id }) {
  const { state } = useStore();
  const idx = state.projects.findIndex(p => p.id === id);
  const project = state.projects[idx];
  if (!project) {
    return (
      <div className="route wrap" style={{ paddingTop: 80, textAlign: "center" }}>
        <p className="serif" style={{ fontSize: 28 }}>Projeto não encontrado.</p>
        <a href="#/" className="btn btn--ghost" style={{ marginTop: 16 }}>Voltar à home</a>
      </div>
    );
  }
  const next = state.projects[(idx + 1) % state.projects.length];

  return (
    <div className="route" data-screen-label={"Projeto: " + project.title}>
      <article className="wrap" style={{ paddingTop: "clamp(28px,5vw,52px)" }}>
        <a href="#/" className="mono" style={{ fontSize: 12, color: "var(--ink-soft)", letterSpacing: ".06em", display: "inline-flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 15 }}>←</span> Todos os projetos
        </a>

        <header style={{ marginTop: 22, maxWidth: 760, borderBottom: "1px solid var(--line)", paddingBottom: 30 }}>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
            <SectionLabel color="var(--acc-2)">{project.category}</SectionLabel>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-faint)", letterSpacing: ".08em" }}>{project.year}</span>
          </div>
          <h1 className="serif" style={{ fontSize: "clamp(38px,7vw,72px)", lineHeight: 1.0, letterSpacing: "-0.02em", margin: "14px 0 0", fontWeight: 500 }}>{project.title}</h1>
          <p className="serif ital" style={{ fontSize: "clamp(17px,2.6vw,22px)", color: "var(--acc-1-ink)", margin: "10px 0 0" }}>{project.subtitle}</p>
          <p style={{ fontSize: 17, color: "var(--ink-soft)", marginTop: 18, lineHeight: 1.65, maxWidth: 620, textWrap: "pretty" }}>{project.description}</p>
        </header>

        {/* fila de imagens */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(20px,4vw,44px)", marginTop: "clamp(28px,5vw,48px)" }}>
          {project.images.map((im, i) => (
            <figure key={im.id} style={{ margin: 0, width: "100%", maxWidth: im.ratio > 1.1 ? 720 : 940 }}>
              <Ph hue={im.hue} src={im.src} ratio={im.ratio} showCap={false}
                  style={{ width: "100%", borderRadius: 6, boxShadow: "0 6px 24px color-mix(in oklch, var(--ink) 10%, transparent)" }} />
              <figcaption className="mono" style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 9, letterSpacing: ".06em", textAlign: "center" }}>
                {project.title} — {(i + 1).toString().padStart(2, "0")} / {project.images.length.toString().padStart(2, "0")}
              </figcaption>
            </figure>
          ))}
        </div>
      </article>

      {/* próximo projeto */}
      <a href={"#/projeto/" + next.id} style={{ display: "block", borderTop: "1px solid var(--line)", marginTop: 64 }}>
        <div className="wrap" style={{ paddingBlock: 40, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div>
            <div className="label">Próximo projeto</div>
            <div className="serif" style={{ fontSize: "clamp(26px,4vw,40px)", marginTop: 8, fontWeight: 500 }}>{next.title}</div>
          </div>
          <span className="serif" style={{ fontSize: "clamp(30px,5vw,48px)", color: "var(--acc-1)" }}>→</span>
        </div>
      </a>
    </div>
  );
}

/* =============================== CONTATO =============================== */
function Contato() {
  const { state } = useStore();
  const s = state.settings;
  const [form, setForm] = useState({ nome: "", email: "", tipo: "Ilustração", msg: "" });
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  if (sent) {
    return (
      <div className="route wrap" style={{ paddingTop: "clamp(48px,10vw,120px)", maxWidth: 620, textAlign: "center", marginInline: "auto" }}>
        <span className="dot" style={{ background: "var(--acc-2)", width: 12, height: 12, margin: "0 auto" }}></span>
        <h1 className="serif" style={{ fontSize: "clamp(34px,6vw,56px)", margin: "20px 0 0", fontWeight: 500 }}>Proposta enviada!</h1>
        <p style={{ color: "var(--ink-soft)", marginTop: 14, fontSize: 17 }}>
          Obrigada, {form.nome.split(" ")[0] || "tudo bem"}. Respondo no e-mail <strong>{form.email}</strong> em até alguns dias.
        </p>
        <button className="btn btn--ghost" style={{ marginTop: 26 }} onClick={() => { setSent(false); setForm({ nome: "", email: "", tipo: "Ilustração", msg: "" }); }}>Enviar outra</button>
      </div>
    );
  }

  return (
    <div className="route wrap" data-screen-label="Contato" style={{ paddingTop: "clamp(36px,6vw,68px)" }}>
      <div style={{ display: "grid", gap: "clamp(28px,5vw,64px)", gridTemplateColumns: "1fr" }} className="contact-grid">
        <div style={{ maxWidth: 420 }}>
          <SectionLabel color="var(--acc-3)">Vamos trabalhar juntas</SectionLabel>
          <h1 className="serif" style={{ fontSize: "clamp(38px,7vw,68px)", lineHeight: 1.0, letterSpacing: "-0.02em", margin: "14px 0 0", fontWeight: 500 }}>
            Conte sobre<br />o seu projeto
          </h1>
          <p style={{ color: "var(--ink-soft)", marginTop: 18, fontSize: 17, lineHeight: 1.6, textWrap: "pretty" }}>
            Editorial, capa, padronagem, quadrinho ou algo que ainda não tem nome — me escreva uma proposta e eu retorno com prazos e orçamento.
          </p>
          <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 10 }}>
            <a href={"mailto:" + s.email} className="mono" style={{ fontSize: 14, color: "var(--ink)", display: "inline-flex", gap: 8, alignItems: "center" }}>
              <span className="dot" style={{ background: "var(--acc-1)" }}></span>{s.email}
            </a>
            <span className="mono" style={{ fontSize: 14, color: "var(--ink-soft)", display: "inline-flex", gap: 8, alignItems: "center" }}>
              <span className="dot" style={{ background: "var(--acc-2)" }}></span>{s.handle}
            </span>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}
              style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 10, padding: "clamp(20px,4vw,32px)", maxWidth: 560 }}>
          <div style={{ display: "grid", gap: 16 }}>
            <label style={{ display: "grid", gap: 7 }}>
              <span className="label">Seu nome</span>
              <input className="field" required value={form.nome} onChange={set("nome")} placeholder="Como você se chama?" />
            </label>
            <label style={{ display: "grid", gap: 7 }}>
              <span className="label">E-mail</span>
              <input className="field" type="email" required value={form.email} onChange={set("email")} placeholder="voce@email.com" />
            </label>
            <label style={{ display: "grid", gap: 7 }}>
              <span className="label">Tipo de projeto</span>
              <select className="field" value={form.tipo} onChange={set("tipo")}>
                {["Ilustração", "Editorial", "Capa de livro", "Padronagem", "Quadrinho", "Animação", "Outro"].map(o => <option key={o}>{o}</option>)}
              </select>
            </label>
            <label style={{ display: "grid", gap: 7 }}>
              <span className="label">Mensagem</span>
              <textarea className="field" required value={form.msg} onChange={set("msg")} placeholder="Prazo, formato, referências, orçamento..."></textarea>
            </label>
            <button type="submit" className="btn btn--accent" style={{ justifyContent: "center", padding: "13px 18px" }}>Enviar proposta</button>
          </div>
        </form>
      </div>
      <style>{`@media (min-width:820px){ .contact-grid{ grid-template-columns: 0.9fr 1.1fr !important; } }`}</style>
    </div>
  );
}

/* ================================ SOBRE ================================ */
function Sobre() {
  const { state } = useStore();
  const s = state.settings;
  const cats = [...new Set(state.projects.map(p => p.category))];

  return (
    <div className="route wrap" data-screen-label="Sobre" style={{ paddingTop: "clamp(36px,6vw,68px)" }}>
      <div style={{ display: "grid", gap: "clamp(28px,5vw,56px)", gridTemplateColumns: "1fr" }} className="about-grid">
        <div>
          <SectionLabel>Sobre a artista</SectionLabel>
          <h1 className="serif" style={{ fontSize: "clamp(40px,7vw,76px)", lineHeight: 0.98, letterSpacing: "-0.02em", margin: "14px 0 0", fontWeight: 500 }}>{s.name}</h1>
          <p className="serif ital" style={{ fontSize: "clamp(18px,2.6vw,24px)", color: "var(--acc-1-ink)", margin: "8px 0 0" }}>{s.tagline} — {s.location}</p>
          {s.fullBio.split("\n\n").map((para, i) => (
            <p key={i} style={{ fontSize: 17, color: "var(--ink-soft)", marginTop: 18, lineHeight: 1.7, maxWidth: 640, textWrap: "pretty" }}>{para}</p>
          ))}
          <div style={{ marginTop: 24 }}>
            <span className="label">Trabalho com</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {cats.map((c, i) => (
                <span key={c} className="mono" style={{ fontSize: 12, padding: "6px 12px", borderRadius: 99, border: "1px solid var(--line)", color: "var(--ink-soft)" }}>{c}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="about-portrait" style={{ justifySelf: "start" }}>
          <div style={{ width: "clamp(150px,40vw,260px)", borderRadius: "50%", overflow: "hidden", aspectRatio: "1", boxShadow: "0 18px 44px color-mix(in oklch, var(--ink) 18%, transparent)" }}>
            <Avatar size={9999} />
          </div>
        </div>
      </div>

      {/* linha do tempo horizontal */}
      <section style={{ marginTop: "clamp(40px,7vw,72px)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 className="serif" style={{ fontSize: "clamp(24px,4vw,34px)", margin: 0, fontWeight: 500 }}>Linha do tempo</h2>
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-faint)", letterSpacing: ".06em" }}>arraste para o lado →</span>
        </div>
        <div className="hscroll" style={{ overflowX: "auto", paddingBottom: 14, marginInline: "calc(-1 * var(--gut))", paddingInline: "var(--gut)" }}>
          <div style={{ display: "flex", gap: 0, minWidth: "min-content", position: "relative" }}>
            {/* linha base */}
            <div style={{ position: "absolute", left: 0, right: 0, top: 46, height: 2, background: "var(--line)" }}></div>
            {s.timeline.map((t, i) => (
              <div key={t.id} style={{ flex: "0 0 auto", width: 248, paddingRight: 28, position: "relative", scrollSnapAlign: "start" }}>
                <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--acc-1-ink)" }}>{t.year}</div>
                <div style={{ width: 13, height: 13, borderRadius: "50%", background: "var(--bg)", border: "3px solid var(--acc-1)", marginTop: 9, position: "relative", zIndex: 1 }}></div>
                <div className="serif" style={{ fontSize: 21, marginTop: 16, fontWeight: 500, lineHeight: 1.1 }}>{t.title}</div>
                <p style={{ fontSize: 14.5, color: "var(--ink-soft)", marginTop: 7, lineHeight: 1.55, textWrap: "pretty" }}>{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ marginTop: 48, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <a href="#/" className="btn btn--ghost">Ver projetos</a>
        <a href="#/contato" className="btn">Propor um projeto</a>
      </div>
      <style>{`@media (min-width:820px){ .about-grid{ grid-template-columns: 1fr auto !important; align-items: start; }}`}</style>
    </div>
  );
}

Object.assign(window, { Home, ProjetoDetalhe, Contato, Sobre, ProjectCard });
