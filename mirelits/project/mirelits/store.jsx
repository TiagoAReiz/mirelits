/* =========================================================================
   store.jsx — estado global, seed, persistência (localStorage), auth mock
   ========================================================================= */
const { createContext, useContext, useState, useEffect, useRef, useCallback } = React;

const LS_KEY = "mirelits.state.v1";

/* ---- paleta de matizes para os placeholders (substituídos por arte real) ---- */
const HUES = {
  azul:   { base: "oklch(0.62 0.13 245)", stripe: "#1b3a6b" },
  marinho:{ base: "oklch(0.42 0.12 255)", stripe: "#0c1f44" },
  laranja:{ base: "oklch(0.74 0.15 55)",  stripe: "#7a3b12" },
  verde:  { base: "oklch(0.72 0.13 150)", stripe: "#1f4a31" },
  roxo:   { base: "oklch(0.62 0.15 300)", stripe: "#3d2160" },
  rosa:   { base: "oklch(0.78 0.11 10)",  stripe: "#7a2540" },
  ocre:   { base: "oklch(0.80 0.10 80)",  stripe: "#6b531a" },
  pedra:  { base: "oklch(0.74 0.02 90)",  stripe: "#3a3833" },
  ceu:    { base: "oklch(0.83 0.07 220)", stripe: "#274a63" },
  vinho:  { base: "oklch(0.50 0.13 20)",  stripe: "#4a1322" },
};
const HUE_KEYS = Object.keys(HUES);

let _imgSeq = 0;
function img(hue, ratio, cap) {
  return { id: "img_" + (++_imgSeq), hue, ratio, cap };
}

/* ---- projetos seed (placeholders; a artista substitui pelas obras reais) ---- */
function seedProjects() {
  _imgSeq = 0;
  return [
    {
      id: "p_oceano", title: "Fundo do Quintal", subtitle: "Série editorial · 2025",
      year: "2025", category: "Editorial", pinned: true, pinLabel: "destaque",
      description: "Uma travessia submersa sobre memória e migração. Tinta digital sobre textura de papel, publicada em tiragem limitada.",
      images: [
        img("marinho", 1.32, "fig. 01"), img("azul", 0.78, "fig. 02"),
        img("ceu", 1.0, "fig. 03"), img("marinho", 1.5, "fig. 04"),
        img("azul", 0.82, "fig. 05"), img("ceu", 1.28, "fig. 06"),
      ],
    },
    {
      id: "p_verao", title: "Praia de Domingo", subtitle: "Pôster · 2025",
      year: "2025", category: "Pôster", pinned: true, pinLabel: "novo",
      description: "Cena coletiva de um verão paulistano. Composição densa, cheia de pequenas histórias acontecendo em paralelo.",
      images: [
        img("laranja", 0.7, "fig. 01"), img("ocre", 1.3, "fig. 02"),
        img("rosa", 0.95, "fig. 03"), img("laranja", 1.15, "fig. 04"),
        img("ocre", 0.8, "fig. 05"),
      ],
    },
    {
      id: "p_quarto", title: "O Apartamento", subtitle: "Quadrinho · 2024",
      year: "2024", category: "Quadrinho", pinned: false, pinLabel: "",
      description: "Capítulo de uma graphic novel em andamento. Interiores, silêncio e a luz da tarde entrando pela janela.",
      images: [
        img("vinho", 1.4, "fig. 01"), img("ocre", 0.85, "fig. 02"),
        img("pedra", 1.1, "fig. 03"), img("vinho", 0.9, "fig. 04"),
      ],
    },
    {
      id: "p_flores", title: "Estações", subtitle: "Padronagem · 2024",
      year: "2024", category: "Padronagem", pinned: false, pinLabel: "",
      description: "Quatro padronagens cíclicas para uma coleção têxtil. Flores, pássaros e o sol nascendo sobre o mar.",
      images: [
        img("rosa", 1.0, "fig. 01"), img("verde", 1.0, "fig. 02"),
        img("ceu", 1.0, "fig. 03"), img("ocre", 1.0, "fig. 04"),
        img("rosa", 0.75, "fig. 05"), img("verde", 0.75, "fig. 06"),
      ],
    },
    {
      id: "p_cidade", title: "Madrugada", subtitle: "Ilustração · 2023",
      year: "2023", category: "Ilustração", pinned: false, pinLabel: "",
      description: "Céu estrelado sobre uma cidade que não dorme. Estudo de luz e movimento em azul profundo.",
      images: [
        img("marinho", 1.45, "fig. 01"), img("roxo", 0.9, "fig. 02"),
        img("azul", 1.1, "fig. 03"),
      ],
    },
    {
      id: "p_retratos", title: "Gente Conhecida", subtitle: "Retratos · 2023",
      year: "2023", category: "Retratos", pinned: false, pinLabel: "",
      description: "Série de retratos de amigos e familiares. Cada rosto, uma paleta própria.",
      images: [
        img("ocre", 1.25, "fig. 01"), img("verde", 0.85, "fig. 02"),
        img("roxo", 1.05, "fig. 03"), img("laranja", 0.8, "fig. 04"),
        img("pedra", 1.2, "fig. 05"),
      ],
    },
    {
      id: "p_capa", title: "Capas de Livro", subtitle: "Editorial · 2022",
      year: "2022", category: "Capa", pinned: false, pinLabel: "",
      description: "Seleção de capas feitas para editoras independentes entre 2021 e 2022.",
      images: [
        img("verde", 1.5, "fig. 01"), img("vinho", 1.5, "fig. 02"),
        img("ceu", 1.5, "fig. 03"),
      ],
    },
    {
      id: "p_animado", title: "Pequenos Loops", subtitle: "Animação · 2022",
      year: "2022", category: "Animação", pinned: false, pinLabel: "",
      description: "Quadros-chave de animações curtas para redes sociais. Movimento mínimo, máxima expressão.",
      images: [
        img("roxo", 0.9, "fig. 01"), img("rosa", 1.1, "fig. 02"),
        img("laranja", 0.95, "fig. 03"), img("ceu", 1.2, "fig. 04"),
      ],
    },
  ];
}

const DEFAULT_COLORS = {
  bg: "oklch(0.984 0.006 85)",
  ink: "oklch(0.215 0.012 65)",
  acc1: "oklch(0.685 0.175 45)",
  acc2: "oklch(0.66 0.135 158)",
  acc3: "oklch(0.555 0.16 295)",
};

const COLOR_PRESETS = [
  { id: "ateliê", name: "Ateliê", bg: "oklch(0.984 0.006 85)", ink: "oklch(0.215 0.012 65)", acc1: "oklch(0.685 0.175 45)", acc2: "oklch(0.66 0.135 158)", acc3: "oklch(0.555 0.16 295)" },
  { id: "tinta", name: "Tinta", bg: "oklch(0.97 0.004 250)", ink: "oklch(0.20 0.02 260)", acc1: "oklch(0.62 0.17 250)", acc2: "oklch(0.70 0.13 195)", acc3: "oklch(0.60 0.16 320)" },
  { id: "argila", name: "Argila", bg: "oklch(0.96 0.014 60)", ink: "oklch(0.25 0.02 40)", acc1: "oklch(0.63 0.15 35)", acc2: "oklch(0.60 0.10 130)", acc3: "oklch(0.55 0.12 20)" },
  { id: "noite", name: "Noite", bg: "oklch(0.22 0.012 265)", ink: "oklch(0.95 0.01 90)", acc1: "oklch(0.74 0.16 60)", acc2: "oklch(0.78 0.14 165)", acc3: "oklch(0.72 0.15 300)" },
];

function seedState() {
  return {
    auth: false,
    settings: {
      name: "mirelits",
      handle: "@mirelits",
      tagline: "Ilustradora & quadrinista",
      location: "São Paulo, Brasil",
      shortBio: "Ilustro histórias do cotidiano com cor densa e linha solta. Trabalho com editorial, quadrinhos e padronagem — sempre em busca da pequena cena que ninguém viu.",
      fullBio: "Mira Lits (ela/dela) é ilustradora e quadrinista baseada em São Paulo. Seu trabalho parte da observação do cotidiano — gente na praia, o silêncio de um apartamento à tarde, o fundo do quintal virando oceano — e se constrói em camadas de cor saturada sobre texturas de papel.\n\nÉ formada em Artes Visuais e já colaborou com editoras independentes, revistas e marcas têxteis. Acredita em ilustração como forma de guardar memória, e não consente o uso de suas imagens para fins de treinamento de IA.",
      email: "ola@mirelits.com",
      profileHue: "laranja",
      profileImage: null,
      colors: { ...DEFAULT_COLORS },
      timeline: [
        { id: "t1", year: "2018", title: "Formação", text: "Bacharel em Artes Visuais — formação em pintura e gravura." },
        { id: "t2", year: "2019", title: "Primeiro estúdio", text: "Início como ilustradora freelancer para editoras independentes." },
        { id: "t3", year: "2021", title: "Residência", text: "Residência artística de 3 meses dedicada a quadrinhos autorais." },
        { id: "t4", year: "2023", title: "Exposição coletiva", text: "Participação em mostra de ilustração contemporânea brasileira." },
        { id: "t5", year: "2024", title: "Graphic novel", text: "Início de 'O Apartamento', primeira graphic novel longa." },
        { id: "t6", year: "2025", title: "Representação", text: "Passa a ser representada por agência internacional de ilustração." },
      ],
    },
    projects: seedProjects(),
  };
}

/* ---------- persistência ---------- */
function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw);
    const base = seedState();
    // shallow-merge para tolerar versões antigas
    return {
      ...base, ...parsed,
      settings: { ...base.settings, ...(parsed.settings || {}),
        colors: { ...base.settings.colors, ...((parsed.settings || {}).colors || {}) } },
    };
  } catch (e) { return seedState(); }
}
function persist(state) {
  try {
    const toSave = { ...state };
    localStorage.setItem(LS_KEY, JSON.stringify(toSave));
  } catch (e) { /* quota / private mode */ }
}

/* ---------- contexto ---------- */
const StoreContext = createContext(null);
const useStore = () => useContext(StoreContext);

function uid(prefix) { return prefix + "_" + Math.random().toString(36).slice(2, 9); }

function StoreProvider({ children }) {
  const [state, setState] = useState(loadState);

  useEffect(() => { persist(state); }, [state]);

  // aplica cores no :root
  useEffect(() => {
    const c = state.settings.colors;
    const r = document.documentElement.style;
    r.setProperty("--bg", c.bg);
    r.setProperty("--ink", c.ink);
    r.setProperty("--acc-1", c.acc1);
    r.setProperty("--acc-2", c.acc2);
    r.setProperty("--acc-3", c.acc3);
    // derivados sensíveis a tema claro/escuro
    const dark = isDarkBg(c.bg);
    r.setProperty("--paper", dark ? "oklch(0.27 0.012 265)" : "oklch(1 0 0)");
    r.setProperty("--ink-soft", mix(c.ink, c.bg, 0.32));
    r.setProperty("--ink-faint", mix(c.ink, c.bg, 0.52));
    r.setProperty("--line", mix(c.ink, c.bg, dark ? 0.78 : 0.86));
    r.setProperty("--line-soft", mix(c.ink, c.bg, dark ? 0.85 : 0.93));
  }, [state.settings.colors]);

  const update = useCallback((fn) => {
    setState(prev => {
      const draft = structuredClone(prev);
      fn(draft);
      return draft;
    });
  }, []);

  const actions = {
    login: (user, pass) => {
      // auth mock: aceita qualquer coisa não-vazia; sugere mira / arte
      if (user && pass) { update(d => { d.auth = true; }); return true; }
      return false;
    },
    logout: () => update(d => { d.auth = false; }),

    updateSettings: (patch) => update(d => { Object.assign(d.settings, patch); }),
    setColors: (colors) => update(d => { d.settings.colors = { ...d.settings.colors, ...colors }; }),
    setProfileImage: (dataUrl) => update(d => { d.settings.profileImage = dataUrl; }),

    addTimeline: () => update(d => { d.settings.timeline.push({ id: uid("t"), year: "20—", title: "Novo marco", text: "Descrição do marco." }); }),
    updateTimeline: (id, patch) => update(d => { const t = d.settings.timeline.find(x => x.id === id); if (t) Object.assign(t, patch); }),
    removeTimeline: (id) => update(d => { d.settings.timeline = d.settings.timeline.filter(x => x.id !== id); }),
    reorderTimeline: (from, to) => update(d => { const a = d.settings.timeline; const [m] = a.splice(from, 1); a.splice(to, 0, m); }),

    togglePin: (id) => update(d => { const p = d.projects.find(x => x.id === id); if (p) p.pinned = !p.pinned; }),
    setPinLabel: (id, label) => update(d => { const p = d.projects.find(x => x.id === id); if (p) p.pinLabel = label; }),
    reorderProjects: (from, to) => update(d => { const a = d.projects; const [m] = a.splice(from, 1); a.splice(to, 0, m); }),
    deleteProject: (id) => update(d => { d.projects = d.projects.filter(x => x.id !== id); }),
    saveProject: (proj) => update(d => {
      const i = d.projects.findIndex(x => x.id === proj.id);
      if (i >= 0) d.projects[i] = proj;
      else d.projects.unshift(proj);
    }),

    resetAll: () => { localStorage.removeItem(LS_KEY); setState(seedState()); },
  };

  return <StoreContext.Provider value={{ state, actions }}>{children}</StoreContext.Provider>;
}

/* ---------- helpers de cor ---------- */
function parseOklch(str) {
  const m = /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/.exec(str || "");
  if (!m) return null;
  return { l: parseFloat(m[1]), c: parseFloat(m[2]), h: parseFloat(m[3]) };
}
function isDarkBg(bg) { const p = parseOklch(bg); return p ? p.l < 0.5 : false; }
function mix(a, b, t) { return `color-mix(in oklch, ${a} ${Math.round((1 - t) * 100)}%, ${b})`; }

function genId(p) { return uid(p); }

/* expõe ao escopo global (cada <script babel> é isolado) */
Object.assign(window, {
  StoreProvider, StoreContext, useStore,
  HUES, HUE_KEYS, COLOR_PRESETS, DEFAULT_COLORS,
  img, genId, uid, seedProjects,
});
