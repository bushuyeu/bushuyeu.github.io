// Citation timeline for review-fast-lineage.html. Data: media/fast-lineage.json,
// built in ~/projects/paper-review/FAST/archeologist by scripts/build_graph.py.
// The SVG is drawn at the pixel width of its box (never scaled), so labels keep their CSS size.
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const ROLE_VAR = { shaped: "--ink-2", extends: "--viz-extends", validates: "--viz-validates", challenges: "--viz-challenges" };
  const ROLE_TEXT = { shaped: "Shaped FAST", extends: "Extends", validates: "Validates", challenges: "Challenges" };
  const MIN_W = 720;
  const svg = document.getElementById("g");
  const box = svg.parentElement;
  const panel = document.getElementById("panel");

  const DATA_URL = "/media/fast-lineage.json?v=6";  // bump with the ?v= on the <script> tag in review-fast-lineage.html
  fetch(DATA_URL)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(start)
    .catch(() => { svg.querySelector("text").textContent = "The citation graph could not load. Reload the page to try again."; });

  function el(tag, attrs, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function add(parent, tag, text, cls) { const e = document.createElement(tag); if (text != null) e.textContent = text; if (cls) e.className = cls; parent.appendChild(e); return e; }
  function link(parent, text, href) { const a = add(parent, "a", text); a.href = href; a.target = "_blank"; a.rel = "noopener"; return a; }
  function overlap(a, b) {
    const w = Math.min(a[2], b[2]) - Math.max(a[0], b[0]), h = Math.min(a[3], b[3]) - Math.max(a[1], b[1]);
    return w > 0 && h > 0 ? w * h : 0;
  }

  function start(G) {
    const byId = new Map(G.nodes.map(n => [n.id, n]));
    const FAST = G.fast;
    const outN = new Map(), inN = new Map();
    G.nodes.forEach(n => { outN.set(n.id, []); inN.set(n.id, []); });
    G.edges.forEach(([s, t]) => { outN.get(s).push(t); inN.get(t).push(s); });

    // ---------- filter: "show only" the picked groups; none picked = All; FAST always stays ----------
    const GROUPS = {
      before: n => n.kind === "ancestor",
      shaped: n => n.key === "shaped",
      after: n => n.kind === "descendant",
      extends: n => n.key === "extends",
      validates: n => n.key === "validates",
      challenges: n => n.key === "challenges",
    };
    const picked = new Set();
    const on = id => id === FAST || !picked.size || [...picked].some(g => GROUPS[g](byId.get(id)));

    // ---------- geometry (pixels; recomputed when the box changes width) ----------
    const TOP = 46, GAP = 8, LEFT = 10;
    const LANES = [
      { name: "Signal and text compression", h: 128 },
      { name: "Action tokenizers and representations", h: 212 },
      { name: "VLA models", h: 300 },
      { name: "Data, benchmarks, hardware, surveys", h: 132 },
    ];
    const X_AT = [[1950, 0.062], [2015, 0.155], [2023, 0.295], [2025.04, 0.5], [2026.85, 0.972]];
    let W = MIN_W, H = 0, breaks = [];
    function xOf(fy) {
      if (fy <= breaks[0][0]) return breaks[0][1];
      for (let i = 1; i < breaks.length; i++) {
        const [a, xa] = breaks[i - 1], [b, xb] = breaks[i];
        if (fy <= b) return xa + (fy - a) / (b - a) * (xb - xa);
      }
      return breaks[breaks.length - 1][1];
    }
    function fracYear(n) {
      if (n.id === FAST) return 2025.04;
      if (n.date) { const d = new Date(n.date + "T00:00:00Z"); const y = d.getUTCFullYear(); return y + (d - Date.UTC(y, 0, 1)) / 31557600000; }
      if (n.year) return n.year + 0.5;
      return 2024.5;
    }
    function hash(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; }
    function layout() {
      W = Math.max(MIN_W, Math.floor(box.clientWidth) || MIN_W);
      breaks = X_AT.map(([y, f]) => [y, f * W]);
      let yy = TOP;
      LANES.forEach(l => { l.y0 = yy; yy += l.h; l.y1 = yy; yy += GAP; });
      H = yy + 4;
      G.nodes.forEach(n => {
        const lane = LANES[n.lane];
        const v = n.cites == null ? 0.25 : Math.log10(n.cites + 1) / 4.2;
        n.x = xOf(fracYear(n));
        n.y = lane.y1 - 12 - Math.min(1, v) * (lane.h - 44) + (hash(n.id) - 0.5) * 8;
        n.r = n.id === FAST ? 9 : 2.6 + 1.1 * Math.log10((n.cites || 0) + 1);
        if (n.id === FAST) n.y = LANES[1].y0 + 36;
      });
    }

    // ---------- static frame: lanes, axis, nodes ----------
    let gEdges, gNodes, gLabels, fixedBoxes = [];
    const nodeEls = new Map();
    function colorOf(n) { return n.id === FAST ? "var(--viz-fast)" : n.kind === "ancestor" ? "var(--viz-before)" : "var(--viz-after)"; }
    function build() {
      layout();
      svg.replaceChildren();
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      svg.setAttribute("width", W);
      svg.setAttribute("height", H);
      const gl = el("g", {}, svg);
      fixedBoxes = [];
      LANES.forEach(l => {
        el("rect", { x: LEFT, y: l.y0, width: W - LEFT - 6, height: l.h, rx: 8, class: "lane" }, gl);
        const lt = el("text", { x: LEFT + 12, y: l.y0 + 19, class: "lane-name" }, gl);
        lt.textContent = l.name;
        fixedBoxes.push([LEFT + 8, l.y0 + 6, LEFT + 16 + lt.getComputedTextLength(), l.y0 + 24]);
      });
      const ga = el("g", { class: "axis" }, svg);
      [[1960, "1960"], [2015, "2015"], [2020, "2020"], [2023, "2023"], [2024, "2024"], [2025, ""], [2025.5, "Jul 2025"], [2026, "2026"], [2026.5, "Jul 2026"]].forEach(([y, lab]) => {
        const x = xOf(y);
        el("line", { x1: x, x2: x, y1: TOP - 6, y2: H - 4, "stroke-dasharray": "2 5" }, ga);
        if (lab) el("text", { x, y: TOP - 13, "text-anchor": "middle" }, ga).textContent = lab;
      });
      const fx = xOf(2025.04);
      el("line", { x1: fx, x2: fx, y1: TOP - 30, y2: H - 4, class: "fast-rule" }, svg);
      el("text", { x: fx, y: TOP - 30, "text-anchor": "middle", class: "lbl fast" }, svg).textContent = "FAST · Jan 2025";

      gEdges = el("g", {}, svg); gNodes = el("g", {}, svg); gLabels = el("g", {}, svg);
      nodeEls.clear();
      [...G.nodes].sort((a, b) => (a.key ? 1 : 0) - (b.key ? 1 : 0) || (a.id === FAST) - (b.id === FAST) || a.r - b.r).forEach(n => {
        const focusable = n.key || n.id === FAST;
        const g = el("g", { class: "node" + (n.key ? " key" : ""), transform: `translate(${n.x.toFixed(1)},${n.y.toFixed(1)})`, tabindex: focusable ? "0" : "-1", role: "button", "data-id": n.id, "aria-label": `${n.label}, ${n.year || ""}` }, gNodes);
        if (n.key) el("circle", { r: n.r + 3.2, class: "halo", stroke: `var(${ROLE_VAR[n.key]})` }, g);
        el("circle", { r: n.r, class: "core", fill: colorOf(n) }, g);
        el("title", {}, g).textContent = `${n.label} (${n.year || "?"})${n.cites != null ? " · " + n.cites.toLocaleString() + " citations" : ""}\n${n.title || ""}`;
        g.addEventListener("click", () => select(n.id));
        g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(n.id); } });
        nodeEls.set(n.id, g);
      });
    }

    // ---------- labels: measured text, placed clear of other labels and of dots ----------
    function drawLabels(ids, near) {
      gLabels.replaceChildren();
      const placed = fixedBoxes.slice();
      const dots = G.nodes.filter(n => on(n.id) && (!near || near.has(n.id))).map(n => ({ id: n.id, b: [n.x - n.r - 2, n.y - n.r - 2, n.x + n.r + 2, n.y + n.r + 2] }));
      const f = byId.get(FAST);
      if (on(FAST)) {
        const ft = el("text", { x: f.x + 15, y: f.y + 5, class: "lbl fast" }, gLabels); ft.textContent = "FAST";
        placed.push([f.x + 15, f.y - 8, f.x + 15 + ft.getComputedTextLength(), f.y + 9]);
      }
      const order = [...ids].filter(id => id !== FAST && on(id)).sort((a, b) => (byId.get(b).key ? 1 : 0) - (byId.get(a).key ? 1 : 0) || (byId.get(b).cites || 0) - (byId.get(a).cites || 0));
      order.forEach(id => {
        const n = byId.get(id);
        const t = el("text", { class: "lbl" + (n.key ? " key" : "") }, gLabels);
        t.textContent = n.label;
        const w = t.getComputedTextLength(), asc = 10, desc = 4;
        const g = n.r + (n.key ? 6 : 4);
        const cands = [[g, 4.5, "start"], [-g, 4.5, "end"], [g - 3, -g, "start"], [g - 3, g + 10, "start"], [-(g - 3), -g, "end"], [-(g - 3), g + 10, "end"], [0, -g - 3, "middle"], [0, g + 13, "middle"], [g + 14, 4.5, "start"], [-(g + 14), 4.5, "end"]];
        let best = null;
        cands.forEach(([dx, dy, anchor], i) => {
          const x = n.x + dx, y = n.y + dy;
          const x0 = anchor === "start" ? x : anchor === "end" ? x - w : x - w / 2;
          const b = [x0 - 1, y - asc, x0 + w + 1, y + desc];
          if (b[0] < LEFT + 2 || b[2] > W - 8 || b[1] < TOP - 4 || b[3] > H - 4) return;
          const onLabels = placed.reduce((s, p) => s + overlap(b, p), 0);
          const onDots = dots.reduce((s, d) => s + (d.id === id ? 0 : overlap(b, d.b)), 0);
          const score = onLabels * 20 + onDots * 0.5 + i * 30;
          if (!best || score < best.score) best = { score, onLabels, x, y, anchor, b };
        });
        if (!best || (!n.key && best.onLabels > 0)) { t.remove(); return; }
        t.setAttribute("x", best.x.toFixed(1)); t.setAttribute("y", best.y.toFixed(1)); t.setAttribute("text-anchor", best.anchor);
        placed.push(best.b);
      });
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
      if (selected && !on(selected)) selected = null;
      gEdges.replaceChildren();
      const frag = document.createDocumentFragment();
      const both = ([s, t]) => on(s) && on(t);
      if (selected) {
        outN.get(selected).filter(on).forEach(t => frag.appendChild(el("path", { d: curve(byId.get(selected), byId.get(t)), class: "edge out" })));
        inN.get(selected).filter(on).forEach(s => frag.appendChild(el("path", { d: curve(byId.get(s), byId.get(selected)), class: "edge in" })));
      } else if (mode === "all") {
        G.edges.filter(both).forEach(([s, t]) => frag.appendChild(el("path", { d: curve(byId.get(s), byId.get(t)), class: "edge faint" })));
      } else {
        G.story.filter(both).forEach(([s, t]) => frag.appendChild(el("path", { d: curve(byId.get(s), byId.get(t)), class: "edge", stroke: edgeColor(s, t) })));
      }
      gEdges.appendChild(frag);
      const near = selected ? new Set([selected, ...outN.get(selected).filter(on), ...inN.get(selected).filter(on)]) : null;
      nodeEls.forEach((g, id) => { g.classList.toggle("off", !on(id)); g.classList.toggle("dim", !!near && !near.has(id)); g.classList.toggle("sel", id === selected); });
      const keyIds = G.nodes.filter(n => n.key && on(n.id)).map(n => n.id);
      let lab = new Set(keyIds);
      const shown = G.nodes.filter(n => n.id !== FAST && on(n.id));
      if (picked.size && shown.length <= 30) lab = new Set(shown.map(n => n.id));
      if (selected) {
        const nb = [...near].filter(id => id !== selected).sort((a, b) => (byId.get(b).cites || 0) - (byId.get(a).cites || 0)).slice(0, 14);
        lab = new Set([selected, ...nb, ...keyIds.filter(id => near.has(id))]);
      }
      drawLabels(lab, near);
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
      b.addEventListener("click", () => { select(id); requestAnimationFrame(focusPanel); revealInGraph(id); });
    }
    // After a control in the panel is used, the panel is rebuilt: put focus on its heading
    function focusPanel() { const h = panel.querySelector("h3"); if (h) h.focus({ preventScroll: true }); }
    // Scroll the graph sideways so a paper's dot is in view (the graph is wider than a phone)
    function revealInGraph(id) {
      const n = byId.get(id); if (!n) return;
      const left = Math.max(0, n.x - box.clientWidth / 2);
      if (Math.abs(box.scrollLeft - left) > 40) box.scrollTo({ left, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
    function renderPanel() {
      panel.replaceChildren();
      if (!selected) {
        add(panel, "h3", "Click any paper");
        add(panel, "p", "Grey dots are papers FAST cites, blue dots cite FAST. Rings mark the papers in the two lists below.");
        add(panel, "p", "A selected paper shows all its links to the other papers here: grey lines go to papers it cites, blue lines come from papers that cite it.");
        const b = add(panel, "div", null, "chips");
        ["ref-39", "ref-7", "2505.23705", "2502.19645", "2506.06072"].forEach(id => chip(b, id));
        return;
      }
      const n = byId.get(selected);
      const eb = add(panel, "p", null, "eyebrow");
      eb.textContent = n.id === FAST ? "This paper" : n.kind === "ancestor" ? "Before FAST" : "After FAST";
      if (n.key) { eb.append(" · "); add(eb, "span", ROLE_TEXT[n.key], "role role--" + n.key); }
      const heading = add(panel, "h3", n.label); heading.tabIndex = -1;
      if (n.title && n.title !== n.label) add(panel, "p", n.title);
      const meta = add(panel, "div", null, "meta");
      if (n.authors && n.authors.length) add(meta, "span", n.authors.join(", ") + ((n.n_authors || 0) > n.authors.length ? " et al." : ""));
      add(meta, "span", fmtDate(n));
      if (n.cites != null) add(meta, "span", n.cites.toLocaleString() + " citations");
      if (n.kind === "ancestor") add(meta, "span", `ref. [${n.ref}], cited ${n.in_text}× in FAST`);
      if (n.influential) add(meta, "span", "influential");
      if (n.note) add(panel, "p", n.note);
      if (n.contexts && n.contexts.length) {
        add(panel, "p", "How it cites FAST", "eyebrow");
        n.contexts.forEach(c => add(panel, "blockquote", c));
      }
      add(panel, "p", `Links here: cites ${outN.get(n.id).filter(on).length}, cited by ${inN.get(n.id).filter(on).length} of the papers shown.`, "eyebrow");
      const nb = [...new Set([...outN.get(n.id), ...inN.get(n.id)])].filter(id => id !== FAST && on(id))
        .sort((a, b) => (byId.get(b).key ? 1 : 0) - (byId.get(a).key ? 1 : 0) || (byId.get(b).cites || 0) - (byId.get(a).cites || 0)).slice(0, 12);
      if (nb.length) { const b = add(panel, "div", null, "chips"); nb.forEach(id => chip(b, id)); }
      const links = add(panel, "div", null, "meta");
      if (n.arxiv) link(links, "arXiv", "https://arxiv.org/abs/" + n.arxiv);
      if (n.s2) link(links, "Semantic Scholar", "https://www.semanticscholar.org/paper/" + n.s2);
      const c = add(links, "button", "Clear", "pill-link pill-link--small"); c.type = "button"; c.addEventListener("click", () => { select(null); requestAnimationFrame(focusPanel); });
    }

    const filterBtns = document.querySelectorAll(".legend .filter[data-cat]"), allBtn = document.getElementById("filter-all");
    function syncFilters() {
      filterBtns.forEach(b => b.setAttribute("aria-pressed", String(picked.has(b.dataset.cat))));
      allBtn.setAttribute("aria-pressed", String(!picked.size));
    }
    // Finding or clicking a paper that is filtered out adds its group, the most specific one
    function reveal(id) {
      if (on(id)) return;
      const n = byId.get(id);
      picked.add(GROUPS[n.key] ? n.key : n.kind === "ancestor" ? "before" : "after");
      syncFilters();
    }
    filterBtns.forEach(b => {
      b.querySelector(".count").textContent = G.nodes.filter(GROUPS[b.dataset.cat]).length;
      b.addEventListener("click", () => {
        const g = b.dataset.cat;
        if (picked.has(g)) picked.delete(g); else picked.add(g);
        syncFilters(); render();
      });
    });
    allBtn.addEventListener("click", () => { picked.clear(); syncFilters(); render(); });

    function select(id) { if (id) reveal(id); selected = id === selected ? null : id; render(); }
    function selectAndShow(id) {
      reveal(id); selected = id; render(); revealInGraph(id);
      svg.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    }
    btnStory.addEventListener("click", () => { mode = "story"; selected = null; render(); });
    btnAll.addEventListener("click", () => { mode = "all"; selected = null; render(); });

    const dl = document.getElementById("names"), labelToId = new Map(), status = document.getElementById("find-status");
    G.nodes.forEach(n => {
      let v = n.year ? `${n.label} (${n.year})` : n.label;
      if (labelToId.has(v)) v = `${v} · ${(n.title || "").split(" ").slice(0, 5).join(" ")}`;
      labelToId.set(v, n.id);
      const o = document.createElement("option"); o.value = v; dl.appendChild(o);
    });
    const find = document.getElementById("find");
    find.addEventListener("change", () => {
      const v = find.value.trim().toLowerCase();
      if (!v) { status.textContent = ""; return; }
      const hit = labelToId.get(find.value.trim()) || (G.nodes.find(n => n.label.toLowerCase().includes(v)) || G.nodes.find(n => (n.title || "").toLowerCase().includes(v)) || {}).id;
      if (!hit) { status.textContent = `No paper matches “${find.value.trim()}”.`; return; }
      status.textContent = "";
      if (hit === selected) return;  // change also fires when focus leaves the box: do not rebuild the panel under the user
      reveal(hit); selected = hit; render(); revealInGraph(hit);
    });

    // ---------- full lists ----------
    function rowButton(td, n) {
      const b = add(td, "button", n.label, "rowbtn"); b.type = "button";
      b.setAttribute("aria-label", `${n.label}: show in the timeline`);
      b.addEventListener("click", e => { e.stopPropagation(); selectAndShow(n.id); });
      return td;
    }
    function roleCell(td, n) { if (n.key) { td.append(" · "); add(td, "span", ROLE_TEXT[n.key], "role role--" + n.key); } }
    const rb = document.getElementById("refs-body");
    G.nodes.filter(n => n.kind === "ancestor").sort((a, b) => b.in_text - a.in_text || (b.cites || 0) - (a.cites || 0)).forEach(n => {
      const tr = add(rb, "tr"); tr.dataset.id = n.id;
      add(tr, "td", `[${n.ref}]`, "mono");
      roleCell(rowButton(add(tr, "td"), n), n);
      add(tr, "td", n.year || "", "num"); add(tr, "td", n.in_text + "×", "num"); add(tr, "td", n.cites != null ? n.cites.toLocaleString() : "–", "num");
      tr.addEventListener("click", () => selectAndShow(n.id));
    });
    const cb = document.getElementById("cit-body");
    const descs = G.nodes.filter(n => n.kind === "descendant").sort((a, b) => (b.cites || 0) - (a.cites || 0));
    function fillCites(f) {
      cb.replaceChildren();
      descs.filter(n => f === "all" || (f === "key" && n.key) || (f === "influential" && n.influential) || n.group === f).forEach(n => {
        const tr = add(cb, "tr"); tr.dataset.id = n.id; tr.title = n.title;
        roleCell(rowButton(add(tr, "td"), n), n);
        add(tr, "td", fmtDate(n), "num"); add(tr, "td", (n.cites || 0).toLocaleString(), "num"); add(tr, "td", n.influential ? "yes" : "");
        tr.addEventListener("click", () => selectAndShow(n.id));
      });
    }
    const filters = document.querySelectorAll("[data-f]");
    filters.forEach(b => b.addEventListener("click", () => { filters.forEach(x => x.setAttribute("aria-pressed", String(x === b))); fillCites(b.dataset.f); }));
    fillCites("all");

    build();
    render();
    // Redraw at the new pixel width when the box is resized (window resize, phone rotation).
    let pending = 0;
    new ResizeObserver(() => {
      const w = Math.max(MIN_W, Math.floor(box.clientWidth) || MIN_W);
      if (Math.abs(w - W) < 8 || pending) return;
      pending = requestAnimationFrame(() => {
        pending = 0;
        const focused = document.activeElement && document.activeElement.getAttribute && document.activeElement.getAttribute("data-id");
        build(); render();
        if (focused && nodeEls.get(focused)) nodeEls.get(focused).focus({ preventScroll: true });
      });
    }).observe(box);
  }
})();
