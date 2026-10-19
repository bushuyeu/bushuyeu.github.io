// Citation timeline for review-fast-lineage.html. Data: media/fast-lineage.json,
// built in ~/projects/paper-review/FAST/archeologist by scripts/build_graph.py.
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const ROLE_VAR = { shaped: "--ink-2", extends: "--viz-extends", validates: "--viz-validates", challenges: "--viz-challenges" };
  const ROLE_TEXT = { shaped: "Shaped FAST", extends: "Extends", validates: "Validates", challenges: "Challenges" };
  const svg = document.getElementById("g");
  const panel = document.getElementById("panel");

  fetch("/media/fast-lineage.json")
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(start)
    .catch(() => { svg.querySelector("text").textContent = "The citation graph could not load. Reload the page to try again."; });

  function el(tag, attrs, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function add(parent, tag, text, cls) { const e = document.createElement(tag); if (text != null) e.textContent = text; if (cls) e.className = cls; parent.appendChild(e); return e; }
  function link(parent, text, href) { const a = add(parent, "a", text); a.href = href; a.target = "_blank"; a.rel = "noopener"; return a; }

  function start(G) {
    const byId = new Map(G.nodes.map(n => [n.id, n]));
    const FAST = G.fast;
    const outN = new Map(), inN = new Map();
    G.nodes.forEach(n => { outN.set(n.id, []); inN.set(n.id, []); });
    G.edges.forEach(([s, t]) => { outN.get(s).push(t); inN.get(t).push(s); });

    // ---------- geometry ----------
    const W = 960, TOP = 40, GAP = 8, LEFT = 10;
    const LANES = [
      { name: "Signal and text compression", h: 116 },
      { name: "Action tokenizers and representations", h: 196 },
      { name: "VLA models", h: 290 },
      { name: "Data, benchmarks, hardware, surveys", h: 124 },
    ];
    let yy = TOP;
    LANES.forEach(l => { l.y0 = yy; yy += l.h; l.y1 = yy; yy += GAP; });
    const H = yy + 4;
    const BREAKS = [[1950, 60], [2015, 150], [2023, 285], [2025.04, 480], [2026.85, W - 26]];
    function xOf(fy) {
      if (fy <= BREAKS[0][0]) return BREAKS[0][1];
      for (let i = 1; i < BREAKS.length; i++) {
        const [a, xa] = BREAKS[i - 1], [b, xb] = BREAKS[i];
        if (fy <= b) return xa + (fy - a) / (b - a) * (xb - xa);
      }
      return BREAKS[BREAKS.length - 1][1];
    }
    function fracYear(n) {
      if (n.id === FAST) return 2025.04;
      if (n.date) { const d = new Date(n.date + "T00:00:00Z"); const y = d.getUTCFullYear(); return y + (d - Date.UTC(y, 0, 1)) / 31557600000; }
      if (n.year) return n.year + 0.5;
      return 2024.5;
    }
    function hash(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; }
    G.nodes.forEach(n => {
      const lane = LANES[n.lane];
      const v = n.cites == null ? 0.25 : Math.log10(n.cites + 1) / 4.2;
      n.x = xOf(fracYear(n));
      n.y = lane.y1 - 12 - Math.min(1, v) * (lane.h - 42) + (hash(n.id) - 0.5) * 8;
      n.r = n.id === FAST ? 9 : 2.4 + 1.05 * Math.log10((n.cites || 0) + 1);
      if (n.id === FAST) n.y = LANES[1].y0 + 34;
    });

    svg.replaceChildren();
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const gl = el("g", {}, svg);
    LANES.forEach(l => {
      el("rect", { x: LEFT, y: l.y0, width: W - LEFT - 6, height: l.h, rx: 8, class: "lane" }, gl);
      el("text", { x: LEFT + 10, y: l.y0 + 16, class: "lane-name" }, gl).textContent = l.name;
    });
    const ga = el("g", { class: "axis" }, svg);
    [[1960, "1960"], [1990, "1990"], [2015, "2015"], [2020, "2020"], [2023, "2023"], [2024, "2024"], [2025, ""], [2025.5, "Jul 2025"], [2026, "2026"], [2026.5, "Jul 2026"]].forEach(([y, lab]) => {
      const x = xOf(y);
      el("line", { x1: x, x2: x, y1: TOP - 6, y2: H - 4, "stroke-dasharray": "2 5" }, ga);
      if (lab) el("text", { x, y: TOP - 12, "text-anchor": "middle" }, ga).textContent = lab;
    });
    const fx = xOf(2025.04);
    el("line", { x1: fx, x2: fx, y1: TOP - 28, y2: H - 4, class: "fast-rule" }, svg);
    el("text", { x: fx, y: TOP - 24, "text-anchor": "middle", class: "lbl fast" }, svg).textContent = "FAST · Jan 2025";

    const gEdges = el("g", {}, svg), gNodes = el("g", {}, svg), gLabels = el("g", {}, svg);
    function colorOf(n) { return n.id === FAST ? "var(--viz-fast)" : n.kind === "ancestor" ? "var(--viz-before)" : "var(--viz-after)"; }
    const nodeEls = new Map();
    [...G.nodes].sort((a, b) => (a.key ? 1 : 0) - (b.key ? 1 : 0) || (a.id === FAST) - (b.id === FAST) || a.r - b.r).forEach(n => {
      const focusable = n.key || n.id === FAST;
      const g = el("g", { class: "node" + (n.key ? " key" : ""), transform: `translate(${n.x.toFixed(1)},${n.y.toFixed(1)})`, tabindex: focusable ? "0" : "-1", role: "button", "aria-label": `${n.label}, ${n.year || ""}` }, gNodes);
      if (n.key) el("circle", { r: n.r + 3.2, class: "halo", stroke: `var(${ROLE_VAR[n.key]})` }, g);
      el("circle", { r: n.r, class: "core", fill: colorOf(n) }, g);
      el("title", {}, g).textContent = `${n.label} (${n.year || "?"})${n.cites != null ? " · " + n.cites.toLocaleString() + " citations" : ""}\n${n.title || ""}`;
      g.addEventListener("click", () => select(n.id));
      g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(n.id); } });
      nodeEls.set(n.id, g);
    });

    function drawLabels(ids) {
      gLabels.replaceChildren();
      const boxes = [];
      const order = [...ids].sort((a, b) => (byId.get(b).key ? 1 : 0) - (byId.get(a).key ? 1 : 0) || (byId.get(b).cites || 0) - (byId.get(a).cites || 0));
      order.forEach(id => {
        if (id === FAST) return;
        const n = byId.get(id), w = n.label.length * 6.3 + 4, h = 13;
        const cands = [[n.r + 5, 4, "start"], [-(n.r + 5), 4, "end"], [n.r + 2, -n.r - 5, "start"], [n.r + 2, n.r + 13, "start"], [-(n.r + 2), -n.r - 5, "end"], [-(n.r + 2), n.r + 13, "end"]];
        for (const [dx, dy, anchor] of cands) {
          const x0 = anchor === "start" ? n.x + dx : n.x + dx - w, y0 = n.y + dy - 10;
          const box = [x0, y0, x0 + w, y0 + h];
          if (box[0] < LEFT || box[2] > W - 4) continue;
          if (boxes.some(b => !(box[2] < b[0] || box[0] > b[2] || box[3] < b[1] || box[1] > b[3]))) continue;
          boxes.push(box);
          el("text", { x: (n.x + dx).toFixed(1), y: (n.y + dy).toFixed(1), "text-anchor": anchor, class: "lbl" + (n.key ? " key" : "") }, gLabels).textContent = n.label;
          break;
        }
      });
      const f = byId.get(FAST);
      el("text", { x: f.x + 14, y: f.y + 5, class: "lbl fast" }, gLabels).textContent = "FAST";
    }

    function curve(a, b) {
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y, k = 0.18;
      return `M${a.x.toFixed(1)},${a.y.toFixed(1)} Q${(mx - dy * k).toFixed(1)},${(my + dx * k).toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`;
    }
    function edgeColor(s, t) {
      const S = byId.get(s), T = byId.get(t);
      const k = (S.id !== FAST && S.key) ? S.key : T.key;
      return k === "shaped" ? "var(--viz-before)" : k ? `var(${ROLE_VAR[k]})` : "var(--ink-3)";
    }

    let mode = "story", selected = null;
    const btnStory = document.getElementById("mode-story"), btnAll = document.getElementById("mode-all");
    function render() {
      gEdges.replaceChildren();
      const frag = document.createDocumentFragment();
      if (selected) {
        outN.get(selected).forEach(t => frag.appendChild(el("path", { d: curve(byId.get(selected), byId.get(t)), class: "edge out" })));
        inN.get(selected).forEach(s => frag.appendChild(el("path", { d: curve(byId.get(s), byId.get(selected)), class: "edge in" })));
      } else if (mode === "all") {
        G.edges.forEach(([s, t]) => frag.appendChild(el("path", { d: curve(byId.get(s), byId.get(t)), class: "edge faint" })));
      } else {
        G.story.forEach(([s, t]) => frag.appendChild(el("path", { d: curve(byId.get(s), byId.get(t)), class: "edge", stroke: edgeColor(s, t) })));
      }
      gEdges.appendChild(frag);
      const near = selected ? new Set([selected, ...outN.get(selected), ...inN.get(selected)]) : null;
      nodeEls.forEach((g, id) => { g.classList.toggle("dim", !!near && !near.has(id)); g.classList.toggle("sel", id === selected); });
      const keyIds = G.nodes.filter(n => n.key).map(n => n.id);
      let lab = new Set([FAST, ...keyIds]);
      if (selected) {
        const nb = [...near].filter(id => id !== selected).sort((a, b) => (byId.get(b).cites || 0) - (byId.get(a).cites || 0)).slice(0, 14);
        lab = new Set([FAST, selected, ...nb, ...keyIds.filter(id => near.has(id))]);
      }
      drawLabels(lab);
      renderPanel();
      btnStory.setAttribute("aria-pressed", String(mode === "story"));
      btnAll.setAttribute("aria-pressed", String(mode === "all"));
    }

    function fmtDate(n) {
      if (!n.date) return n.year ? String(n.year) : "";
      return new Date(n.date + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
    }
    function chip(parent, id) {
      const b = add(parent, "button", byId.get(id).label, "pill-link pill-link--small"); b.type = "button";
      b.addEventListener("click", () => select(id));
    }
    function renderPanel() {
      panel.replaceChildren();
      if (!selected) {
        add(panel, "h3", "Click any paper");
        add(panel, "p", "Grey dots are papers FAST cites, blue dots cite FAST. Rings mark the papers in the two lists below.");
        add(panel, "p", "A selected paper shows all its links to the other papers here: grey lines go to papers it cites, blue lines come from papers that cite it.");
        const box = add(panel, "div", null, "chips");
        ["ref-39", "ref-7", "2505.23705", "2502.19645", "2506.06072"].forEach(id => chip(box, id));
        return;
      }
      const n = byId.get(selected);
      const eb = add(panel, "p", null, "eyebrow");
      eb.textContent = n.id === FAST ? "This paper" : n.kind === "ancestor" ? "Before FAST" : "After FAST";
      if (n.key) { eb.append(" · "); add(eb, "span", ROLE_TEXT[n.key], "role role--" + n.key); }
      add(panel, "h3", n.label);
      if (n.title && n.title !== n.label) add(panel, "p", n.title);
      const meta = add(panel, "div", null, "meta");
      if (n.authors && n.authors.length) add(meta, "span", n.authors.join(", ") + (n.authors.length >= 3 ? " et al." : ""));
      add(meta, "span", fmtDate(n));
      if (n.cites != null) add(meta, "span", n.cites.toLocaleString() + " citations");
      if (n.kind === "ancestor") add(meta, "span", `ref. [${n.ref}], cited ${n.in_text}× in FAST`);
      if (n.influential) add(meta, "span", "influential");
      if (n.note) add(panel, "p", n.note);
      if (n.contexts && n.contexts.length) {
        add(panel, "p", "How it cites FAST", "eyebrow");
        n.contexts.forEach(c => add(panel, "blockquote", c));
      }
      add(panel, "p", `Links here: cites ${outN.get(n.id).length}, cited by ${inN.get(n.id).length} of the papers shown.`, "eyebrow");
      const nb = [...new Set([...outN.get(n.id), ...inN.get(n.id)])].filter(id => id !== FAST)
        .sort((a, b) => (byId.get(b).key ? 1 : 0) - (byId.get(a).key ? 1 : 0) || (byId.get(b).cites || 0) - (byId.get(a).cites || 0)).slice(0, 12);
      if (nb.length) { const box = add(panel, "div", null, "chips"); nb.forEach(id => chip(box, id)); }
      const links = add(panel, "div", null, "meta");
      if (n.arxiv) link(links, "arXiv", "https://arxiv.org/abs/" + n.arxiv);
      if (n.s2) link(links, "Semantic Scholar", "https://www.semanticscholar.org/paper/" + n.s2);
      const c = add(links, "button", "Clear", "pill-link pill-link--small"); c.type = "button"; c.addEventListener("click", () => select(null));
    }

    function select(id) { selected = id === selected ? null : id; render(); }
    function selectAndShow(id) {
      selected = id; render();
      svg.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    }
    btnStory.addEventListener("click", () => { mode = "story"; selected = null; render(); });
    btnAll.addEventListener("click", () => { mode = "all"; selected = null; render(); });

    const dl = document.getElementById("names"), labelToId = new Map();
    G.nodes.forEach(n => { if (!labelToId.has(n.label)) { labelToId.set(n.label, n.id); const o = document.createElement("option"); o.value = n.label; dl.appendChild(o); } });
    const find = document.getElementById("find");
    find.addEventListener("change", () => {
      const v = find.value.trim().toLowerCase(); if (!v) return;
      const hit = labelToId.get(find.value) || (G.nodes.find(n => n.label.toLowerCase().includes(v)) || G.nodes.find(n => (n.title || "").toLowerCase().includes(v)) || {}).id;
      if (hit) { selected = hit; render(); }
    });

    // ---------- full lists ----------
    function roleCell(td, n) { if (n.key) { td.append(" · "); add(td, "span", ROLE_TEXT[n.key], "role role--" + n.key); } }
    const rb = document.getElementById("refs-body");
    G.nodes.filter(n => n.kind === "ancestor").sort((a, b) => b.in_text - a.in_text || (b.cites || 0) - (a.cites || 0)).forEach(n => {
      const tr = add(rb, "tr"); tr.dataset.id = n.id;
      add(tr, "td", `[${n.ref}]`, "mono");
      roleCell(add(tr, "td", n.label), n);
      add(tr, "td", n.year || "", "num"); add(tr, "td", n.in_text + "×", "num"); add(tr, "td", n.cites != null ? n.cites.toLocaleString() : "–", "num");
      tr.addEventListener("click", () => selectAndShow(n.id));
    });
    const cb = document.getElementById("cit-body");
    const descs = G.nodes.filter(n => n.kind === "descendant").sort((a, b) => (b.cites || 0) - (a.cites || 0));
    function fillCites(f) {
      cb.replaceChildren();
      descs.filter(n => f === "all" || (f === "key" && n.key) || (f === "influential" && n.influential) || n.group === f).forEach(n => {
        const tr = add(cb, "tr"); tr.dataset.id = n.id; tr.title = n.title;
        roleCell(add(tr, "td", n.label), n);
        add(tr, "td", fmtDate(n), "num"); add(tr, "td", (n.cites || 0).toLocaleString(), "num"); add(tr, "td", n.influential ? "yes" : "");
        tr.addEventListener("click", () => selectAndShow(n.id));
      });
    }
    const filters = document.querySelectorAll("[data-f]");
    filters.forEach(b => b.addEventListener("click", () => { filters.forEach(x => x.setAttribute("aria-pressed", String(x === b))); fillCites(b.dataset.f); }));
    fillCites("all");
    render();
  }
})();
