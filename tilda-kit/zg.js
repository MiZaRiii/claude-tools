// ZG — сборка Zero Block из спецификации прямо в редакторе Тильды (без локального сервера).
// Загрузка один раз за вкладку (в окне редактора страницы или Zero):
//   eval(await (await fetch("https://raw.githubusercontent.com/MiZaRiii/claude-tools/main/tilda-kit/zg.js", { cache: "no-store" })).text());
// Дальше:
//   ZG.cfg({ screens: [1200, 640, 320], family: "Inter", weight: "400", color: "#000000" }); // screens: адаптивы блока по убыванию, первый — базовый
//   const { text, image, shape, group } = ZG;
//   await ZG.build([ ...корневые узлы ], { artboard, freeGroups, patch });
// Свойство: скаляр (только базовый адаптив, остальные наследуют) или массив по screens: [1200, 640, 320]; undefined — не задавать.
// Сохраняет и публикует человек, если не поручено иначе.
window.ZG = (() => {
  const C = { screens: null, family: "Arial", weight: "400", color: "#000000" };
  let seq = 0;
  const tmpId = () => "tmp" + String(++seq).padStart(4, "0");
  const rhd = (x) => Math.ceil(x - 0.5); // размер шрифта целый, .5 вниз
  const two = (x) => +x.toFixed(2);
  const scr = () => C.screens || detect();
  const sfx = (r) => (r === scr()[0] ? "" : "-res-" + r);
  const all = (v) => (Array.isArray(v) ? v : scr().map(() => v));
  const lsPx = (pct, fs) => all(pct).map((p, i) => (p === undefined ? undefined : two((p / 100) * rhd(Array.isArray(fs) ? fs[i] : fs))));
  const INT = new Set(["top", "left", "width", "height"]);
  const num = (v, k) => (typeof v === "number" ? String(INT.has(k) ? Math.round(v) : two(v)) : v);
  const apply = (out, pairs) => {
    const S = scr();
    for (const [k, v] of Object.entries(pairs)) {
      if (v === undefined) continue;
      if (Array.isArray(v)) v.forEach((x, i) => { if (x !== undefined && S[i]) out[k + sfx(S[i])] = num(x, k); });
      else out[k] = num(v, k);
    }
  };
  const FREE = { container: "grid", axisx: "left", axisy: "top", margin: "0 0 0 0", leftunits: "px", topunits: "px", widthunits: "px", heightunits: "px" };
  const node = (p, type = "element", children) => ({ id: p.id, index: 0, type, isSelected: false, props: p, ...(children ? { children } : {}) });
  // x: любые поля Zero напрямую, { container: "window", widthunits: ["%", "px"], axisx: "center", ... }

  function text(o) {
    if (o.padding !== undefined) throw new Error("text: padding запрещён, оберни в группу с pad");
    const p = { elem_type: "text", id: tmpId(), layer: o.name, name: o.name, ...FREE };
    const fs = all(o.fontsize).map((v) => (v === undefined ? undefined : rhd(v)));
    apply(p, {
      fontsize: fs, color: o.color ?? C.color, fontfamily: o.family ?? C.family, fontweight: o.weight ?? C.weight,
      lineheight: o.lh, letterspacing: o.lsPct !== undefined ? lsPx(o.lsPct, fs) : o.ls, lettercase: o.upper ? "uppercase" : undefined,
      align: o.align ?? "left", textfit: o.textfit ?? "autoheight", valign: o.valign ?? "top",
      top: o.top, left: o.left, width: o.width, height: o.height, widthmode: o.widthmode, heightmode: o.heightmode,
      zindex: o.z, hidden: o.hidden ?? "n", tag: o.tag ?? "div", classname: o.classname, ...o.x,
    });
    Object.assign(p, { padding: "0 0 0 0", shadow_text_opacity: "100", borderradius: "0px 0px 0px 0px", text: o.text });
    return node(p);
  }
  function image(o) {
    const p = { elem_type: "image", id: tmpId(), layer: o.name, name: o.name, img: o.img, imagefit: o.fit ?? "cover", filewidth: String(o.fw), fileheight: String(o.fh), opacity: "1", rotate: "0", borderradius: "0px 0px 0px 0px", ...FREE };
    apply(p, { top: o.top, left: o.left, width: o.width, height: o.height, widthmode: o.wm ?? "fixed", heightmode: "fixed", zindex: o.z, hidden: o.hidden ?? "n", alt: o.alt, classname: o.classname, imageposition: o.pos ?? "center center", borderradius: o.radius, ...o.x });
    return node(p);
  }
  function shape(o) {
    const p = { elem_type: "shape", id: tmpId(), layer: o.name, name: o.name, rotate: "0", borderstyle: "solid", borderradius: "0px 0px 0px 0px", ...FREE };
    apply(p, { top: o.top, left: o.left, width: o.width, height: o.height, opacity: o.opacity ?? "1", bgcolor: o.bgcolor ?? "", bordercolor: o.bordercolor, borderwidth: o.borderwidth, borderradius: o.radius, zindex: o.z, hidden: o.hidden ?? "n", widthmode: o.wm ?? "fixed", heightmode: "fixed", classname: o.classname, ...o.x });
    return node(p);
  }
  // flex: "auto" автокомпоновка, "" свободная группа
  function group(o, children = []) {
    const p = { elem_type: "group", type: "physical", id: tmpId(), name: o.name, layer: o.name, groupid: "", container: "grid", flex: o.flex ?? "auto",
      overflow: o.overflow ?? "visible visible", margin: "0 0 0 0", leftunits: "px", topunits: "px", widthunits: "px", heightunits: "px", borderradius: "0px 0px 0px 0px" };
    for (const r of scr().slice(1)) p["container" + sfx(r)] = "grid";
    apply(p, {
      flexdirection: o.dir ?? all("row"), flexgapx: o.gapx, flexgapy: o.gapy, flexalignitems: o.alignItems ?? "flex-start", flexjustifycontent: o.justify ?? "flex-start", flexaligncontent: "flex-start",
      widthmode: o.wm ?? "fixed", heightmode: o.hm ?? "hug", width: o.width, height: o.height, left: o.left, top: o.top, zindex: o.z, hidden: o.hidden ?? "n",
      padding: o.pad, bgcolor: o.bg, bordercolor: o.bc, borderwidth: o.bw, borderradius: o.radius, opacity: o.opacity, classname: o.cls, ...o.x,
    });
    return node(p, "group", children);
  }
  // порядок: автокомпоновка — разворот; свободная группа и корень при автокомпоновке артборда — как есть; корень свободного артборда — разворот
  function finalize(nodes, parent, opts = {}) {
    const keep = (parent && parent.props.flex === "") || (!parent && opts.rootAutolayout);
    if (!keep) nodes.reverse();
    const keys = scr().flatMap((r) => ["top" + sfx(r), "left" + sfx(r)]);
    nodes.forEach((n, i) => {
      n.index = i;
      if (parent) {
        n.props.groupid = parent.id;
        if (n.props.elem_type === "text") { n.props.heightmode ??= "hug"; n.props.widthmode ??= "fixed"; }
        for (const k of keys) if (parent.props[k] !== undefined && n.props[k] === undefined) n.props[k] = parent.props[k];
      }
      if (n.children) finalize(n.children, n, opts);
    });
    return nodes;
  }
  const depth = (ns, d = 1) => Math.max(...ns.map((n) => (n.children ? depth(n.children, d + 1) : d)));
  const count = (ns) => ns.reduce((s, n) => s + 1 + (n.children ? count(n.children) : 0), 0);

  // ---- редактор (Zero может быть открыт внутри страницы редактора: ищем его окно сами) ----
  const f = typeof document !== "undefined" ? [...document.querySelectorAll("iframe")].find((x) => /zero/.test(x.src)) : null;
  const w = f ? f.contentWindow : window, d = w.document;
  // адаптивы из переключателя экранов редактора
  function detect() {
    const out = new Set();
    for (const e of d?.querySelectorAll?.(".tn-res-item") || []) for (const s of [e.textContent, ...[...e.attributes].map((a) => a.value)]) { const m = String(s).trim().match(/^(\d{3,4})$/); if (m) out.add(+m[1]); }
    if (!out.size) throw new Error("ZG: адаптивы не найдены, задай ZG.cfg({ screens: [...] })");
    return (C.screens = [...out].sort((a, b) => b - a));
  }
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const ev = (el) => ["input", "change", "blur"].forEach((t) => el.dispatchEvent(new w.Event(t, { bubbles: true })));
  const setInput = (name, val) => { const i = d.querySelector(`input[name="${name}"]`); if (!i) return false; Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set.call(i, String(val)); ev(i); return true; };
  const setSelect = (name, val) => { const s = d.querySelector(`select[name="${name}"]`); if (!s) return false; s.value = val; ev(s); return true; };
  const layer = (n) => [...d.querySelectorAll(".tn-elem")].find((e) => e.getAttribute("data-field-layer-value") === n);
  const grp = (n) => [...d.querySelectorAll(".tn-group")].find((e) => [...e.attributes].some((a) => a.name.includes("group-name") && a.value === n));
  const res = async (r) => { w.zero.core__switchResolution(r); await sleep(450); };
  const key = (k, code, kc, mods = {}) => { const o = { key: k, code, keyCode: kc, which: kc, bubbles: true, cancelable: true, ...mods }; d.dispatchEvent(new w.KeyboardEvent("keydown", o)); d.dispatchEvent(new w.KeyboardEvent("keyup", o)); };
  const elems = () => d.querySelectorAll(".tn-elem").length;
  const setAll = (e, fld, v) => { for (const r of scr()) w.elem__setFieldValue(e, fld, String(v), "render", "updateui", r); };

  async function ready() {
    for (let i = 0; i < 100; i++) {
      // окно «есть несохранённая локальная версия блока» — отказываемся, работаем с сохранённой
      if (/locally saved|локальн/i.test(d.body.innerText.slice(0, 4000))) { const b = [...d.querySelectorAll("*")].find((e) => e.children.length === 0 && /^(cancel|отмена)$/i.test((e.textContent || "").trim()) && e.offsetParent); if (b) b.click(); }
      if (w.zero && d.querySelector(".tn-layout") && d.querySelector(".tn-artboard") && d.querySelectorAll(".tn-res-item").length) break;
      await sleep(300);
    }
    await sleep(500); scr();
  }
  // Ctrl+A берёт только видимые на текущем адаптиве слои: чистим на каждом
  async function clear() {
    for (const r of [...scr(), scr()[0]]) { await res(r); key("a", "KeyA", 65, { ctrlKey: true }); await sleep(150); key("Delete", "Delete", 46); await sleep(250); }
    return elems();
  }
  async function deselect() {
    const x = w.innerWidth * 0.35, y = w.innerHeight * 0.85, t = d.elementFromPoint(x, y);
    if (t) ["mousedown", "mouseup", "click"].forEach((n) => t.dispatchEvent(new w.MouseEvent(n, { bubbles: true, cancelable: true, clientX: x, clientY: y, view: w })));
    await sleep(300);
  }
  // cfg: { flex: "auto"|"", <ширина>: { flexdirection, gap, paddinghorizontal, paddingvertical | paddingtop+paddingbottom, heightmode, height } }
  // адаптив без своего ключа не трогаем (наследует)
  async function setArtboard(cfg) {
    for (const r of scr()) {
      const c = cfg[r]; if (!c && r !== scr()[0]) continue;
      await res(r); await deselect();
      setSelect("flex", cfg.flex === "auto" ? "auto" : ""); await sleep(250);
      if (!c) continue;
      if (cfg.flex !== "auto") { if (c.height !== undefined) setInput("height", c.height); continue; }
      if (!d.getElementById(c.flexdirection)) {
        const h = [...d.querySelectorAll("*")].find((e) => e.children.length === 0 && /^auto layout$/i.test((e.textContent || "").trim()) && e.offsetParent);
        if (h) { h.click(); await sleep(300); }
      }
      d.getElementById(c.flexdirection).parentElement.click();
      setInput(c.flexdirection === "column" ? "flexgapy" : "flexgapx", c.gap ?? 0);
      setInput("paddinghorizontal", c.paddinghorizontal ?? 0);
      if (c.paddingtop !== undefined || c.paddingbottom !== undefined) {
        const dif = d.querySelector('.sui-panel__differ[data-original-field="padding"]');
        if (dif && !d.querySelector('input[name="paddingtop"]')?.offsetParent) { dif.click(); await sleep(150); }
        setInput("paddingtop", c.paddingtop ?? 0); setInput("paddingbottom", c.paddingbottom ?? 0);
      } else setInput("paddingvertical", c.paddingvertical ?? 0);
      if (c.heightmode !== undefined) { if (c.heightmode === "hug") { setSelect("heightmode", ""); await sleep(200); } setSelect("heightmode", c.heightmode); }
      await sleep(250);
    }
  }
  function inject(data) {
    const j = JSON.parse(JSON.stringify({ res: scr()[0], data }));
    const map = {}; const walk = (n) => { map[n.id] = w.t396__getUniqueId(); (n.children || []).forEach(walk); }; j.data.forEach(walk);
    const fix = (n) => { n.id = map[n.id]; n.props.id = n.id; if (n.props.groupid) n.props.groupid = map[n.props.groupid]; (n.children || []).forEach(fix); }; j.data.forEach(fix);
    j.timestamp = Date.now(); w.localStorage.setItem("tn_store_buffer__copy-paste", JSON.stringify(j));
    return Object.keys(map).length;
  }
  const paste = () => key("v", "KeyV", 86, { ctrlKey: true });
  // свободные группы: [{ group, kids: { "Слой": { <ширина>: [l,t,w,h] } } }] — координаты от левого верха группы
  async function fixFreeGroups(list) {
    for (const g of list || []) for (const r of scr()) {
      if (!Object.values(g.kids).some((geo) => geo[r])) continue;
      await res(r);
      const el = grp(g.group); if (!el) continue;
      const gl = +(el.getAttribute(`data-field-left${sfx(r)}-value`) ?? el.getAttribute("data-field-left-value")), gt = +(el.getAttribute(`data-field-top${sfx(r)}-value`) ?? el.getAttribute("data-field-top-value"));
      for (const [n, geo] of Object.entries(g.kids)) {
        const e = layer(n); if (!e || !geo[r]) continue; const [l, t, wd, h] = geo[r];
        for (const [k, v] of [["left", gl + l], ["top", gt + t], ["width", wd], ["height", h]]) w.elem__setFieldValue(e, k, String(v), "render", "updateui", r);
      }
      await sleep(150);
    }
  }
  // [["Слой","поле","значение",ширина], ...]; группы ищутся по имени, если нет такого слоя
  function patch(list) {
    const miss = [];
    for (const [n, fld, v, r] of list) { const e = layer(n) || grp(n); if (e) w.elem__setFieldValue(e, fld, String(v), "render", "updateui", r ?? scr()[0]); else miss.push(n); }
    return miss.length ? { miss } : "ok";
  }
  // «Upload to Tilda» подряд по всем картинкам с внешних адресов; ждём смены адреса, без лишних пауз
  async function uploadImages(match = /^https?:\/\/(?!(static|thb|optim)\.tildacdn)/) {
    await res(scr()[0]); const out = [];
    for (const e of [...d.querySelectorAll(".tn-elem")].filter((x) => x.querySelector("img") && match.test(x.querySelector("img").src))) {
      const n = e.getAttribute("data-field-layer-value"), src0 = e.querySelector("img").src;
      w.elem__select(e, false); let b;
      for (let i = 0; i < 20 && !b; i++) { await sleep(100); b = [...d.querySelectorAll(".sui-file-upload")].find((x) => x.offsetParent && /upload to tilda/i.test(x.textContent)); }
      if (!b) { out.push(n + ": нет кнопки"); continue; }
      b.click();
      for (let i = 0; i < 60 && e.querySelector("img")?.src === src0; i++) await sleep(250);
      out.push(n + ": " + (e.querySelector("img")?.src === src0 ? "не загрузилось" : e.querySelector("img").src));
    }
    return out;
  }
  async function heights() { const h = {}; for (const r of scr()) { await res(r); h[r] = d.querySelector(".tn-artboard").style.height; } await res(scr()[0]); return h; }

  // ВСЁ ОДНИМ ВЫЗОВОМ: финализация → очистка → артборд → вставка → свободные группы → fill корней → patch → высота
  async function build(roots, meta = {}) {
    await ready();
    finalize(roots, null, { rootAutolayout: meta.rootAutolayout ?? meta.artboard?.flex === "auto" });
    const dp = depth(roots); if (dp > 6) throw new Error("глубина групп " + dp + " > 6");
    const log = { screens: scr(), cleared: meta.keep ? "-" : await clear(), depth: dp };
    if (meta.artboard) await setArtboard(meta.artboard);
    log.nodes = inject(roots);
    await res(scr()[0]); await deselect(); paste(); await sleep(900); await deselect();
    await fixFreeGroups(meta.freeGroups);
    // редактор переводит корневые группы из fill в fixed: возвращаем
    const fill = meta.fillRoots ?? roots.filter((n) => n.type === "group" && n.props.widthmode === "fill").map((n) => n.props.name);
    for (const n of fill) { const g = grp(n); if (g) setAll(g, "widthmode", "fill"); }
    if (meta.patch) log.patch = patch(meta.patch);
    await sleep(300);
    if (meta.artboard) await setArtboard(meta.artboard);
    log.elems = elems(); log.heights = await heights();
    return log;
  }
  // компактная выгрузка текущего блока: имя | геометрия по каждому адаптиву — для сверки без скриншотов
  function dump() {
    const g = (e, k) => e.getAttribute(`data-field-${k}-value`);
    return "layer | " + scr().join(" | ") + "\n" + [...d.querySelectorAll(".tn-elem,.tn-group")].map((e) => [g(e, "layer") || g(e, "group-name") || "?", ...scr().map((r) => ["left", "top", "width", "height"].map((k) => g(e, k + sfx(r)) ?? "").join(","))].join(" | ")).join("\n");
  }

  return {
    cfg: (o) => Object.assign(C, o), screens: scr, text, image, shape, group, lsPx, rhd, finalize, depth, count,
    w, d, sleep, res, layer, group_: grp, ready, clear, deselect, setArtboard, inject, paste, fixFreeGroups, patch, uploadImages, heights, build, dump,
  };
})();
