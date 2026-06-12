/* =========================================================================
   app.jsx — roteador, guarda de admin, Tweaks, montagem
   ========================================================================= */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "hover": "deck",
  "type": "galeria",
  "cols": 4
}/*EDITMODE-END*/;

const TYPE_PAIRS = {
  galeria: { display: '"Newsreader", Georgia, serif', body: '"Hanken Grotesk", system-ui, sans-serif', name: "Serifa de galeria" },
  mono:    { display: '"Space Mono", monospace',       body: '"Hanken Grotesk", system-ui, sans-serif', name: "Mono técnico" },
  serifa:  { display: '"Newsreader", Georgia, serif',  body: '"Newsreader", Georgia, serif',            name: "Tudo serifa" },
};

function App() {
  const route = useRoute();
  const { state } = useStore();
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // aplica tipografia + colunas do masonry
  useEffect(() => {
    const r = document.documentElement.style;
    const pair = TYPE_PAIRS[t.type] || TYPE_PAIRS.galeria;
    r.setProperty("--ff-display", pair.display);
    r.setProperty("--ff-body", pair.body);
    r.setProperty("--mason-cols", String(t.cols || 4));
  }, [t.type, t.cols]);

  const isAdminRoute = route.name.indexOf("admin") === 0;
  const needsAuth = isAdminRoute && route.name !== "admin-login";

  // guarda de rota protegida
  useEffect(() => {
    if (needsAuth && !state.auth) nav("/admin");
  }, [needsAuth, state.auth]);

  let content;
  if (route.name === "admin-login") {
    content = <AdminLogin />;
  } else if (needsAuth) {
    if (!state.auth) {
      content = null; // redirecionando
    } else if (route.name === "admin-projetos") {
      content = <AdminShell route={route}><AdminProjetos /></AdminShell>;
    } else if (route.name === "admin-editor") {
      content = <AdminShell route={route}><AdminEditor key={route.params.id || "novo"} id={route.params.id} /></AdminShell>;
    } else if (route.name === "admin-config") {
      content = <AdminShell route={route}><AdminConfig /></AdminShell>;
    }
  } else {
    // rotas públicas
    let page;
    if (route.name === "projeto") page = <ProjetoDetalhe id={route.params.id} />;
    else if (route.name === "sobre") page = <Sobre />;
    else if (route.name === "contato") page = <Contato />;
    else page = <Home hoverStyle={t.hover} />;
    content = (
      <>
        <Header route={route} />
        {page}
        <Footer />
      </>
    );
  }

  return (
    <>
      {content}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Cards de projeto" />
        <TweakRadio label="Hover" value={t.hover === "dark" ? "escurecer" : "deck"}
          options={["deck", "escurecer"]}
          onChange={(v) => setTweak("hover", v === "escurecer" ? "dark" : "deck")} />
        <TweakSection label="Layout" />
        <TweakRadio label="Colunas (desktop)" value={String(t.cols)}
          options={["3", "4", "5"]} onChange={(v) => setTweak("cols", Number(v))} />
        <TweakSection label="Tipografia" />
        <TweakSelect label="Combinação" value={t.type}
          options={Object.keys(TYPE_PAIRS).map(k => ({ value: k, label: TYPE_PAIRS[k].name }))}
          onChange={(v) => setTweak("type", v)} />
        <TweakSection label="Cores" />
        <div style={{ fontSize: 12, color: "var(--ink-soft, #666)", lineHeight: 1.5, padding: "2px 0 6px" }}>
          As cores do site são controladas pela artista em <strong>Admin → Configurações</strong>.
        </div>
      </TweaksPanel>
    </>
  );
}

/* montagem */
ReactDOM.createRoot(document.getElementById("root")).render(
  <StoreProvider><App /></StoreProvider>
);
