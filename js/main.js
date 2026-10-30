/* ET'S BURGER · comportamento da página */
(() => {
  "use strict";

  const D = window.ETS;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const mobileQ = matchMedia("(max-width: 900px)");
  const brl = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  document.documentElement.classList.add("js");

  /* ---------- Perfil de desempenho ----------
     Máquina fraca começa no modo leve. As demais medem o FPS na entrada
     e caem para o modo leve se não aguentarem. ?lite e ?full forçam um modo. */
  const params = new URLSearchParams(location.search);
  const weakHardware = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4 || !!(navigator.connection && navigator.connection.saveData);
  let lite = params.has("full") ? false : params.has("lite") || reduced || weakHardware;
  const onLite = [];
  function goLite() {
    if (lite) return;
    lite = true;
    document.documentElement.classList.add("perf-lite");
    onLite.forEach((fn) => fn());
  }
  if (lite) document.documentElement.classList.add("perf-lite");

  function probeFps() {
    if (lite || params.has("full")) return;
    setTimeout(() => {
      if (document.hidden) return;
      let frames = 0;
      const start = performance.now();
      (function count(now) {
        frames++;
        if (now - start < 2000) return requestAnimationFrame(count);
        if (!document.hidden && frames / ((now - start) / 1000) < 40) goLite();
      })(start);
    }, 1200);
  }

  /* ---------- Links e dados comerciais ---------- */
  const waLink = (text) => `https://wa.me/${D.links.whatsappNumero}?text=${encodeURIComponent(text)}`;
  const waHello = waLink("Olá, ET's Burger! Vim pelo site e quero fazer um pedido.");

  function bindData() {
    $$("[data-href]").forEach((a) => { const url = D.links[a.dataset.href]; if (url) a.href = url; });
    $$("[data-wa]").forEach((a) => (a.href = waHello));
    $$("[data-wa-label]").forEach((el) => (el.textContent = D.links.whatsappExibicao));
    $$("[data-insta-user]").forEach((el) => (el.textContent = D.links.instagramUser));
    $$("[data-rua]").forEach((el) => (el.textContent = D.endereco.rua));
    $$("[data-bairro]").forEach((el) => (el.textContent = D.endereco.bairro));
    $$("[data-coord]").forEach((el) => (el.textContent = `${D.endereco.coordenadas} · ${D.endereco.bairro}`));
    $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
    const hours = $("[data-hours]");
    if (hours) hours.innerHTML = D.horarios.map((h) => `<li><b>${h.dias}</b><span>${h.hora}</span></li>`).join("");
  }

  /* ---------- Aberto ou fechado (horário de Brasília) ---------- */
  function updateStatus() {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", weekday: "short", hour: "numeric", hour12: false }).formatToParts(new Date());
    const wd = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[parts.find((p) => p.type === "weekday").value];
    const hour = parseInt(parts.find((p) => p.type === "hour").value, 10) % 24;
    const [open, close] = D.expediente[wd];
    let text, isOpen = false;
    if (hour >= open && hour < close) { isOpen = true; text = `Aberto agora · pedidos até ${close}h`; }
    else if (hour < open) text = `Fechado agora · abre hoje às ${open}h`;
    else text = `Fechado agora · abre amanhã às ${D.expediente[(wd + 1) % 7][0]}h`;
    $$("[data-status-text]").forEach((el) => {
      el.textContent = text;
      el.parentElement.classList.toggle("is-open", isOpen);
      el.parentElement.classList.toggle("is-closed", !isOpen);
    });
  }

  /* ---------- Céu estrelado ---------- */
  function cosmos() {
    const cv = $(".cosmos");
    const ctx = cv.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 1.25);
    let w, h, stars = [], mx = 0, my = 0, tmx = 0, tmy = 0, shoot = null, running = true, last = 0;
    const still = () => reduced || lite;
    const colors = ["244,244,244", "244,244,244", "244,244,244", "183,255,53", "53,217,255"];

    function resize() {
      w = innerWidth; h = innerHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(Math.round((w * h) / (mobileQ.matches ? 12000 : 9000)), 160);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h, z: Math.random() * .8 + .2,
        r: Math.random() * 1.3 + .2, p: Math.random() * Math.PI * 2, c: colors[(Math.random() * colors.length) | 0]
      }));
      if (still()) draw(0);
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      mx += (tmx - mx) * .05; my += (tmy - my) * .05;
      const sy = still() ? 0 : scrollY * .08;
      for (const s of stars) {
        const x = (s.x + mx * s.z * 26 + w) % w;
        const y = ((s.y - sy * s.z + my * s.z * 18) % h + h) % h;
        const a = still() ? .7 : .35 + Math.sin(t * .002 * s.z + s.p) * .35 + .3;
        ctx.fillStyle = `rgba(${s.c},${Math.max(.08, a) * s.z})`;
        ctx.beginPath(); ctx.arc(x, y, s.r * (s.z + .3), 0, 6.283); ctx.fill();
      }
      if (!still()) {
        if (!shoot && Math.random() < .004) shoot = { x: Math.random() * w * .7 + w * .3, y: Math.random() * h * .4, l: 0 };
        if (shoot) {
          shoot.l += 14;
          const g = ctx.createLinearGradient(shoot.x - shoot.l, shoot.y + shoot.l * .45, shoot.x - shoot.l + 120, shoot.y + shoot.l * .45 - 54);
          g.addColorStop(0, "rgba(183,255,53,0)"); g.addColorStop(1, "rgba(244,244,244,.85)");
          ctx.strokeStyle = g; ctx.lineWidth = 1.4; ctx.beginPath();
          ctx.moveTo(shoot.x - shoot.l, shoot.y + shoot.l * .45);
          ctx.lineTo(shoot.x - shoot.l + 120, shoot.y + shoot.l * .45 - 54); ctx.stroke();
          if (shoot.l > w) shoot = null;
        }
      }
    }

    // 30 quadros por segundo bastam para estrelas piscando
    function loop(t) {
      if (still()) return draw(0);
      if (running && t - last > 33) { last = t; draw(t); }
      requestAnimationFrame(loop);
    }
    resize();
    addEventListener("resize", resize);
    if (!still()) {
      addEventListener("pointermove", (e) => { tmx = e.clientX / w - .5; tmy = e.clientY / h - .5; }, { passive: true });
      document.addEventListener("visibilitychange", () => (running = !document.hidden));
      requestAnimationFrame(loop);
    }
  }

  /* ---------- Palco do hero: órbita, partículas, parallax ---------- */
  function heroStage() {
    const parts = $("[data-particles]");
    if (parts && !reduced && !lite) {
      for (let i = 0; i < (mobileQ.matches ? 6 : 12); i++) {
        const p = document.createElement("i");
        p.style.left = `${Math.random() * 100}%`;
        p.style.animationDuration = `${2.5 + Math.random() * 3}s`;
        p.style.animationDelay = `${-Math.random() * 5}s`;
        const s = 2 + Math.random() * 4; p.style.width = p.style.height = `${s}px`;
        parts.appendChild(p);
      }
    }

    const orbit = $("[data-orbit]");
    const orbiters = $$("[data-orbiter]");
    let visible = true, ticking = false;

    function place(t) {
      const rx = orbit.clientWidth * .52, ry = orbit.clientHeight * .14;
      orbiters.forEach((o, i) => {
        const a = t * .00035 + i * (Math.PI / 2);
        const s = Math.sin(a);
        o.style.transform = `translate(${Math.cos(a) * rx}px, ${s * ry}px) scale(${.6 + (s + 1) * .3}) rotate(${a * 40}deg)`;
        o.style.zIndex = s > 0 ? 3 : 1;
        o.style.opacity = .55 + (s + 1) * .225;
      });
    }
    // A órbita só gira com o hero na tela
    function tick(t) {
      if (!visible || lite || reduced) { ticking = false; return; }
      place(t);
      requestAnimationFrame(tick);
    }
    const startOrbit = () => { if (!ticking && !lite && !reduced) { ticking = true; requestAnimationFrame(tick); } };
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) startOrbit(); }).observe($(".hero"));
    place(0);
    startOrbit();

    if (!finePointer) return;
    // Parallax: o loop roda enquanto o mouse se move e dorme quando as camadas assentam
    const layers = $$(".hero [data-depth]");
    let tx = 0, ty = 0, cx = 0, cy = 0, following = false;
    function follow() {
      cx += (tx - cx) * .08; cy += (ty - cy) * .08;
      layers.forEach((l) => { const d = +l.dataset.depth; l.style.translate = `${-cx * d * 30}px ${-cy * d * 20}px`; });
      if (!lite && visible && (Math.abs(tx - cx) > .001 || Math.abs(ty - cy) > .001)) requestAnimationFrame(follow);
      else following = false;
    }
    $(".hero").addEventListener("pointermove", (e) => {
      if (lite || reduced) return;
      tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5;
      if (!following) { following = true; requestAnimationFrame(follow); }
    });
    onLite.push(() => layers.forEach((l) => (l.style.translate = "")));
  }

  /* ---------- Cardápio (dados do Cardápio Web + ajustes de marca) ---------- */
  const MENU = window.ETS_MENU || { categorias: [] };
  const PRODUCTS = {};

  function enrich(item, catName) {
    const x = D.extras[item.id] || {};
    const [base, ...rest] = item.nomeOriginal.split(" - ");
    const desc = x.descricao || item.descricao;
    return {
      ...item,
      categoria: catName,
      nome: x.nome || base.replace(/\s+/g, " ").trim(),
      subtitulo: x.subtitulo || rest.join(" - "),
      etiqueta: x.etiqueta || (item.maiores18 ? "+18" : ""),
      frase: x.frase || "",
      descricao: desc,
      ingredientes: x.frase ? desc.replace(/\.$/, "").split(/,\s*|\s+e\s+(?=[^,]+$)/).filter(Boolean).map((s) => s[0].toUpperCase() + s.slice(1)) : []
    };
  }

  MENU.categorias.forEach((c) => c.itens.forEach((i) => { if (!PRODUCTS[i.id]) PRODUCTS[i.id] = enrich(i, c.nome); }));

  const VIEWS = [
    { id: "destaques", nome: "Destaques", itens: D.destaques.map((id) => PRODUCTS[id]).filter(Boolean) },
    ...MENU.categorias
      .filter((c) => !D.ocultarCategorias.includes(c.nome))
      .map((c) => ({ id: c.id, nome: D.nomesCategorias[c.nome] || c.nome, compacta: D.categoriasCompactas.includes(c.nome), itens: c.itens.map((i) => PRODUCTS[i.id]) }))
  ];
  let currentView = VIEWS[0];

  function slug(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-"); }
  const code = (p) => `EXP-${p.id.slice(-3)}`;
  const priceHTML = (p) => {
    const [reais, cent] = p.preco.toFixed(2).split(".");
    return `<p class="price" aria-label="${p.aPartirDe ? "A partir de " : ""}${brl(p.preco)}">${p.aPartirDe ? "<small>a partir de</small>" : ""}<span>R$</span><b>${reais}</b><span>,${cent}</span></p>`;
  };

  function cardHTML(p, isHero) {
    const media = p.foto
      ? `<img src="${p.foto}" alt="${p.nome}${p.subtitulo ? `, ${p.subtitulo}` : ""}" width="600" height="600" loading="lazy" decoding="async">`
      : `<div class="spec__nophoto"><svg aria-hidden="true"><use href="#logo-mark"/></svg></div>`;
    return `<article class="spec${isHero ? " spec--hero" : ""}" data-id="${p.id}">
      <div class="spec__media">${media}
        <span class="spec__code">${code(p)}</span>
        ${p.etiqueta ? `<span class="spec__tag spec__tag--${slug(p.etiqueta)}">${p.etiqueta}</span>` : ""}
      </div>
      <div class="spec__body">
        <header><h3 class="spec__name">${p.nome}</h3>${p.subtitulo ? `<p class="spec__sub">${p.subtitulo}</p>` : ""}</header>
        <p class="spec__desc">${p.frase || p.descricao}</p>
        ${p.ingredientes.length ? `<ul class="spec__ing" aria-label="Ingredientes">${p.ingredientes.map((n) => `<li>${n}</li>`).join("")}</ul>` : ""}
        <div class="spec__foot">
          ${priceHTML(p)}
          <button class="add" type="button" data-add="${p.id}" aria-label="Quero experimentar ${p.nome}, adicionar à sacola">
            <span class="add__go">Quero experimentar</span><span class="add__ok">✓ A bordo</span>
          </button>
        </div>
      </div>
    </article>`;
  }

  function rowHTML(p) {
    const thumb = p.foto ? `<img src="${p.foto}" alt="" width="72" height="72" loading="lazy" decoding="async">` : `<span class="row__code">${code(p)}</span>`;
    return `<li class="row" data-id="${p.id}">
      <div class="row__thumb">${thumb}</div>
      <div class="row__info"><b>${p.nome}</b>${p.subtitulo || p.descricao ? `<span>${p.subtitulo || p.descricao}</span>` : ""}${p.etiqueta ? `<em>${p.etiqueta}</em>` : ""}</div>
      ${priceHTML(p)}
      <button class="row__add" type="button" data-add="${p.id}" aria-label="Adicionar ${p.nome} à sacola">+</button>
    </li>`;
  }

  function renderFilters() {
    const box = $("[data-filters]");
    box.innerHTML = VIEWS.map((v) => `<button type="button" role="tab" data-view="${v.id}" aria-selected="${v === currentView}">${v.nome}<sup>${String(v.itens.length).padStart(2, "0")}</sup></button>`).join("");
    box.addEventListener("click", (e) => {
      const b = e.target.closest("[data-view]");
      if (!b || b.dataset.view === currentView.id) return;
      currentView = VIEWS.find((v) => v.id === b.dataset.view);
      $$("button", box).forEach((x) => x.setAttribute("aria-selected", x === b));
      swapCards();
    });
  }

  function renderCards(animate) {
    const grid = $("[data-specimens]");
    const v = currentView;
    grid.classList.toggle("specimens--rows", !!v.compacta);
    grid.innerHTML = v.compacta
      ? `<ul class="rows">${v.itens.map(rowHTML).join("")}</ul>`
      : v.itens.map((p, i) => cardHTML(p, v.id === "destaques" && i === 0)).join("");
    bindTilt();
    if (animate && window.gsap && !reduced) gsap.from($$(".spec, .row", grid), { y: 40, opacity: 0, duration: .7, stagger: .035, ease: "expo.out", clearProps: "transform,opacity" });
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }

  function swapCards() {
    const cards = $$("[data-specimens] .spec, [data-specimens] .row");
    if (reduced || !cards.length) return renderCards(false);
    cards.forEach((c) => c.classList.add("is-leaving"));
    setTimeout(() => renderCards(true), 240);
  }

  function bindTilt() {
    if (!finePointer || reduced) return;
    $$(".spec").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        if (lite) return;
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", `${x * 100}%`); card.style.setProperty("--my", `${y * 100}%`);
        card.style.transition = "transform .12s ease-out, border-color .4s";
        card.style.transform = `rotateX(${(.5 - y) * 7}deg) rotateY(${(x - .5) * 9}deg) translateZ(0)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transition = "transform .8s cubic-bezier(.2,.8,.2,1), border-color .4s";
        card.style.transform = "";
      });
    });
  }

  /* ---------- Sacola ---------- */
  let bag = {};
  try { bag = JSON.parse(localStorage.getItem("ets-bag") || "{}") || {}; } catch (_) { bag = {}; }
  Object.keys(bag).forEach((k) => { if (!PRODUCTS[k]) delete bag[k]; });
  const saveBag = () => { try { localStorage.setItem("ets-bag", JSON.stringify(bag)); } catch (_) {} };

  function renderBag() {
    const ids = Object.keys(bag).filter((k) => bag[k] > 0);
    const count = ids.reduce((a, k) => a + bag[k], 0);
    const total = ids.reduce((a, k) => a + bag[k] * PRODUCTS[k].preco, 0);
    $$("[data-bag-count]").forEach((el) => (el.textContent = count));
    $$("[data-open-bag]").forEach((el) => el.setAttribute("aria-label", `Abrir sacola, ${count} ${count === 1 ? "item" : "itens"}`));
    $("[data-bag-list]").innerHTML = ids.map((k) => {
      const p = PRODUCTS[k];
      const thumb = p.foto ? `<img class="bag__thumb" src="${p.foto}" alt="">` : `<span class="bag__thumb bag__thumb--x">${code(p)}</span>`;
      return `<li class="bag__item">${thumb}<div><b>${p.nome}</b><small>${p.aPartirDe ? "a partir de " : ""}${brl(p.preco * bag[k])}</small></div>
        <div class="qty"><button type="button" data-qty="-1" data-id="${k}" aria-label="Remover um ${p.nome}">−</button><span>${bag[k]}</span><button type="button" data-qty="1" data-id="${k}" aria-label="Adicionar um ${p.nome}">+</button></div></li>`;
    }).join("");
    $("[data-bag-empty]").hidden = count > 0;
    $("[data-bag-foot]").hidden = count === 0;
    $("[data-bag-total]").textContent = brl(total);
    const lines = ids.map((k) => { const p = PRODUCTS[k]; return `• ${bag[k]}x ${p.nome}${p.subtitulo ? ` (${p.subtitulo})` : ""}: ${p.aPartirDe ? "a partir de " : ""}${brl(p.preco * bag[k])}`; }).join("\n");
    $("[data-wa-order]").href = waLink(`Olá, ET's Burger! Quero fazer este pedido pelo site:\n\n${lines}\n\nSubtotal estimado: ${brl(total)}\n\nNome:\nEntrega ou retirada:\nEndereço:\nForma de pagamento:`);
  }

  function visibleBagButton() {
    return $$("[data-open-bag]").find((b) => b.getBoundingClientRect().width > 0 && b.closest(".nav, .dock"));
  }

  function addToBag(id, btn) {
    const p = PRODUCTS[id]; if (!p) return;
    bag[id] = (bag[id] || 0) + 1; saveBag(); renderBag();
    toast(`${p.nome} foi abduzido para a sacola.`);
    if (btn && btn.matches(".add, .row__add")) {
      btn.classList.add("is-done");
      clearTimeout(btn._t); btn._t = setTimeout(() => btn.classList.remove("is-done"), 1800);
    }
    const target = visibleBagButton();
    const bump = () => target && (target.classList.remove("is-bump"), void target.offsetWidth, target.classList.add("is-bump"));
    const card = btn && btn.closest(".spec, .row");
    const src = card ? ($(".spec__media, .row__thumb", card) || card) : btn;
    if (!reduced && window.gsap && target && src) {
      const a = src.getBoundingClientRect(), b = target.getBoundingClientRect();
      const fly = document.createElement("div");
      fly.className = "flyer";
      fly.innerHTML = p.foto ? `<img src="${p.foto}" alt="">` : "";
      document.body.appendChild(fly);
      const sx = a.left + a.width / 2 - 35, sy = a.top + a.height / 2 - 35;
      const ex = b.left + b.width / 2 - 35, ey = b.top + b.height / 2 - 35;
      gsap.set(fly, { x: sx, y: sy, scale: .4, opacity: 0 });
      gsap.timeline({ onComplete: () => { fly.remove(); bump(); } })
        .to(fly, { scale: 1.1, opacity: 1, duration: .25, ease: "back.out(2)" })
        .to(fly, { x: ex, duration: .75, ease: "power2.in" }, ">")
        .to(fly, { y: ey, duration: .75, ease: "back.in(1.6)" }, "<")
        .to(fly, { scale: .2, opacity: .3, duration: .3, ease: "power2.in" }, "-=.3");
    } else bump();
  }

  /* ---------- Toast ---------- */
  let toastT;
  function toast(msg) {
    const t = $("[data-toast]");
    t.innerHTML = `<span>${msg}</span> <button type="button" data-open-bag style="background:none;border:0;text-decoration:underline;font-weight:700;color:inherit;cursor:pointer">Ver sacola</button>`;
    t.classList.add("is-on");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("is-on"), 3200);
  }

  /* ---------- Modais ---------- */
  let lastFocus = null;
  function openSheet(name) {
    closeMobileMenu();
    const s = $(`[data-sheet="${name}"]`);
    $$(".sheet:not([hidden])").forEach((o) => o !== s && closeSheet(o, true));
    lastFocus = document.activeElement;
    s.hidden = false;
    void s.offsetWidth;
    s.classList.add("is-open");
    document.body.classList.add("is-locked");
    setTimeout(() => { const f = $(".sheet__panel a[href], .sheet__panel button:not([data-close])", s) || $(".sheet__close", s); f && f.focus(); }, 60);
    $(".dock")?.classList.add("is-hidden");
  }
  function closeSheet(s, silent) {
    if (!s || s.hidden) return;
    s.classList.remove("is-open");
    setTimeout(() => (s.hidden = true), 380);
    if (!silent) {
      document.body.classList.remove("is-locked");
      lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
      updateDock();
    }
  }

  document.addEventListener("keydown", (e) => {
    const open = $(".sheet:not([hidden])");
    if (e.key === "Escape") { if (open) closeSheet(open); else closeMobileMenu(); }
    if (e.key === "Tab" && open) {
      const f = $$("a[href], button:not([disabled])", $(".sheet__panel", open)).filter((x) => x.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-open-channels], [data-open-bag], [data-add], [data-close], [data-qty]");
    if (!t) return;
    if (t.matches("[data-open-channels]")) openSheet("channels");
    else if (t.matches("[data-open-bag]")) { $("[data-toast]").classList.remove("is-on"); openSheet("bag"); }
    else if (t.matches("[data-add]")) addToBag(t.dataset.add, t);
    else if (t.matches("[data-qty]")) { const id = t.dataset.id; bag[id] = Math.max(0, (bag[id] || 0) + +t.dataset.qty); if (!bag[id]) delete bag[id]; saveBag(); renderBag(); }
    else if (t.matches("[data-close]")) closeSheet(t.closest(".sheet"));
  });

  /* ---------- Navegação ---------- */
  const nav = $("[data-nav]");
  const toggle = $(".burger-toggle");
  const mmenu = $(".mmenu");

  function openMobileMenu() {
    mmenu.hidden = false; void mmenu.offsetWidth;
    mmenu.classList.add("is-open"); toggle.setAttribute("aria-expanded", "true"); toggle.setAttribute("aria-label", "Fechar menu");
    document.body.classList.add("is-locked");
  }
  function closeMobileMenu() {
    if (!mmenu.classList.contains("is-open")) return;
    mmenu.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); toggle.setAttribute("aria-label", "Abrir menu");
    document.body.classList.remove("is-locked");
    setTimeout(() => { if (!mmenu.classList.contains("is-open")) mmenu.hidden = true; }, 700);
  }
  toggle.addEventListener("click", () => (mmenu.classList.contains("is-open") ? closeMobileMenu() : openMobileMenu()));
  $$("a", mmenu).forEach((a) => a.addEventListener("click", closeMobileMenu));

  addEventListener("scroll", () => nav.classList.toggle("is-scrolled", scrollY > 30), { passive: true });

  function sectionSpy() {
    const links = $$("[data-link]");
    const ufo = $(".nav__ufo");
    const setActive = (id) => {
      const link = links.find((l) => l.dataset.link === id);
      if (!link) return;
      links.forEach((l) => { l.classList.toggle("is-active", l === link); l.toggleAttribute("aria-current", l === link); });
      ufo.style.setProperty("--ufo-x", `${link.offsetLeft + link.offsetWidth / 2 - 17}px`);
      ufo.classList.add("is-on");
    };
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-45% 0px -50% 0px" });
    links.forEach((l) => { const s = document.getElementById(l.dataset.link); s && io.observe(s); });
  }

  /* ---------- Dock mobile ---------- */
  let launchVisible = false;
  function updateDock() {
    const dock = $(".dock");
    if (!dock) return;
    dock.classList.toggle("is-hidden", launchVisible || !!$(".sheet.is-open"));
  }
  new IntersectionObserver(([e]) => { launchVisible = e.isIntersecting; updateDock(); }, { threshold: .25 }).observe($(".launch .energy"));

  /* ---------- Relatos ---------- */
  function avatar(seed) {
    let h = 0; for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const col = ["#B7FF35", "#35D9FF", "#792BFF", "#FFC43D"][h % 4];
    let cells = "";
    for (let y = 0; y < 5; y++) for (let x = 0; x < 3; x++) {
      h = (h * 1103515245 + 12345) >>> 0;
      if ((h >> 16) & 1) { cells += `<rect x="${x * 8 + 4}" y="${y * 8 + 4}" width="8" height="8"/>`; if (x < 2) cells += `<rect x="${(4 - x) * 8 + 4}" y="${y * 8 + 4}" width="8" height="8"/>`; }
    }
    return `<svg class="msg__avatar" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" fill="#151a30"/><g fill="${col}">${cells}</g></svg>`;
  }
  const stars = (n, cls = "") => Array.from({ length: 5 }, (_, i) => `<svg class="${i < n ? "" : "off"} ${cls}"><use href="#i-star"/></svg>`).join("");

  // Sem depoimentos autorizados, a lista vira canais para ler os relatos reais
  function reviewChannels() {
    const ch = [
      { tag: "Fonte da nota", titulo: "Relatos no iFood", texto: `Onde os clientes deram a nota ${D.avaliacoes.notaGeral.valor.toFixed(1).replace(".", ",")}.`, href: D.links.ifood, cta: "Ler no iFood", icon: "i-star" },
      { tag: "Mapa estelar", titulo: "Relatos no Google", texto: "Avaliações públicas da base em Jarinu.", href: D.links.mapa, cta: "Ler no Google", icon: "i-pin" },
      { tag: "Frequência aberta", titulo: "Mande o seu", texto: `Provou? Marque ${D.links.instagramUser} e conte como foi a sua abdução.`, href: D.links.instagram, cta: "Abrir Instagram", icon: "i-insta" }
    ];
    return ch.map((c) => `
      <a class="msg msg--channel is-real" href="${c.href}" target="_blank" rel="noopener">
        <span class="msg__sig">${c.tag}</span>
        <svg class="msg__icon" aria-hidden="true"><use href="#${c.icon}"/></svg>
        <b class="msg__title">${c.titulo}</b>
        <p>${c.texto}</p>
        <span class="link-arrow mono">${c.cta} <svg aria-hidden="true"><use href="#i-arrow"/></svg></span>
      </a>`).join("");
  }

  function renderReviews() {
    const r = D.avaliacoes;
    const list = $("[data-review-list]");
    list.classList.toggle("transmissions__list--channels", !r.itens.length);
    list.innerHTML = !r.itens.length ? reviewChannels() : r.itens.map((a, i) => `
      <article class="msg${r.demo ? "" : " is-real"}">
        <div class="msg__head">${avatar(a.nome)}<div class="msg__who"><b>${a.nome}</b><span>${a.cidade}</span></div></div>
        <div class="msg__stars" role="img" aria-label="Nota ${a.nota} de 5">${stars(a.nota)}</div>
        <p>${a.texto}</p>
        <span class="msg__sig">Transmissão ${String(i + 1).padStart(3, "0")}${r.demo ? " · conteúdo de demonstração" : ""}</span>
      </article>`).join("");
    $("[data-demo-flag]").hidden = !r.demo;
    const avg = r.notaGeral.valor;
    $("[data-sat-label]").textContent = r.notaGeral.fonte ? `Nota no ${r.notaGeral.fonte}` : "Nota dos clientes";
    $("[data-sat-stars]").innerHTML = stars(Math.round(avg));
    return avg;
  }

  function fillMeter(avg) {
    const v = $("[data-sat-value]"), bar = $("[data-sat-bar]");
    bar.style.width = `${(avg / 5) * 100}%`;
    if (reduced || !window.gsap) { v.textContent = avg.toFixed(1).replace(".", ","); return; }
    const o = { n: 0 };
    gsap.to(o, { n: avg, duration: 1.6, ease: "power2.out", onUpdate: () => (v.textContent = o.n.toFixed(1).replace(".", ",")) });
  }

  /* ---------- Cursor e botões magnéticos ---------- */
  function cursor() {
    if (!finePointer || reduced || lite) return;
    document.documentElement.classList.add("has-cursor");
    onLite.push(() => document.documentElement.classList.remove("has-cursor"));
    const c = $(".cursor"), ring = $(".cursor__ring"), label = $(".cursor__label");
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, moving = false;
    // O anel só persegue o ponteiro enquanto ainda não o alcançou
    function chase() {
      rx += (x - rx) * .35; ry += (y - ry) * .35;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      if (Math.abs(x - rx) > .3 || Math.abs(y - ry) > .3) requestAnimationFrame(chase);
      else moving = false;
    }
    addEventListener("pointermove", (e) => {
      x = e.clientX; y = e.clientY; c.classList.remove("is-hidden");
      if (!moving) { moving = true; requestAnimationFrame(chase); }
    }, { passive: true });
    document.addEventListener("pointerleave", () => c.classList.add("is-hidden"));
    document.addEventListener("pointerover", (e) => {
      const el = e.target.closest("a, button, [data-cursor]");
      c.classList.toggle("is-hover", !!el);
      const l = e.target.closest("[data-cursor]");
      c.classList.toggle("is-label", !!l); label.textContent = l ? l.dataset.cursor : "";
    });
  }

  function magnetic() {
    if (!finePointer || reduced) return;
    $$(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        if (lite) return;
        const r = el.getBoundingClientRect();
        el.style.transition = "translate .15s ease-out, background .3s, color .3s, box-shadow .3s, border-color .3s";
        el.style.translate = `${(e.clientX - r.left - r.width / 2) * .25}px ${(e.clientY - r.top - r.height / 2) * .35}px`;
      });
      el.addEventListener("pointerleave", () => { el.style.transition = "translate .6s cubic-bezier(.2,.8,.2,1), background .3s, color .3s, box-shadow .3s"; el.style.translate = "0 0"; });
    });
    $(".btn--mega")?.setAttribute("data-cursor", "Decolar");
  }

  /* ---------- Títulos divididos em palavras e letras ---------- */
  function splitTitles() {
    if (lite || reduced) return;
    $$("[data-split]").forEach((el) => {
      el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
      const walk = (node) => {
        [...node.childNodes].forEach((n) => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach((part) => {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
              const w = document.createElement("span"); w.className = "split-word"; w.setAttribute("aria-hidden", "true");
              [...part].forEach((ch) => { const c = document.createElement("span"); c.className = "split-char"; c.textContent = ch; w.appendChild(c); });
              frag.appendChild(w);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1) walk(n);
        });
      };
      walk(el);
    });
  }

  /* ---------- Coreografia ---------- */
  function choreography() {
    const meterTarget = $("[data-reviews]");
    const avg = renderReviews();
    const revealSel = ".sec-head__aside, .filters, .menu__more, .dossier, .manifest, .log__entry, .mod, .trophy, .transmissions__meter, .msg, .launch__text, .energy, .launch__alt, .base__grid > *, .base__brand";

    if (!window.gsap || !window.ScrollTrigger || reduced) {
      $$(".mod").forEach((m) => m.classList.add("is-on"));
      $$(".log__entry").forEach((m) => m.classList.add("is-lit"));
      new IntersectionObserver(([e], o) => { if (e.isIntersecting) { fillMeter(avg); o.disconnect(); } }).observe(meterTarget);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    $$(revealSel).forEach((el) => el.classList.add("reveal"));

    // Entrada do hero: céu, título, nave, feixe e burger, nessa ordem
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.from(".planet", { scale: .5, opacity: 0, duration: 2, stagger: .15 }, 0)
      .from(".nebula", { opacity: 0, duration: 2 }, 0)
      .from(".hero__title .w", { yPercent: 70, opacity: 0, rotate: 3, duration: 1.1, stagger: .07 }, .15)
      .from(".stage__ufo", { y: -260, x: 120, rotate: -14, opacity: 0, duration: 1.5, ease: "power4.out" }, .3)
      .from(".stage__beam", { opacity: 0, duration: .5, ease: "steps(4)" }, 1.15)
      .from(".porthole", { y: 160, scale: .6, opacity: 0, duration: 1.4 }, 1.2)
      .from(".status, .hero__sub, .hero__ctas > *, .hero__facts li", { y: 26, opacity: 0, duration: .9, stagger: .07 }, .7)
      .from(".award, .orbiter, .hud", { scale: .4, opacity: 0, duration: 1, stagger: .08, ease: "back.out(1.8)", clearProps: "scale" }, 1.6)
      .from(".scroll-cue", { opacity: 0, duration: .8 }, 2);

    // Efeitos presos ao scroll: recalculam a cada rolagem, então o modo leve não usa
    const scrubs = [];
    const scrub = (tween) => scrubs.push(tween);
    onLite.push(() => scrubs.forEach((tw) => { tw.scrollTrigger && tw.scrollTrigger.kill(); tw.revert(); }));

    if (!lite) {
      // Hero se afasta no scroll
      scrub(gsap.fromTo(".hero__copy", { y: 0, opacity: 1 }, { y: -80, opacity: .2, ease: "none", immediateRender: false, scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } }));
      scrub(gsap.to(".stage", { y: 120, scale: .92, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } }));
      // Faixas cruzadas acompanham o scroll
      scrub(gsap.to(".tape--green", { xPercent: -6, ease: "none", scrollTrigger: { trigger: ".tapes", start: "top bottom", end: "bottom top", scrub: true } }));
      scrub(gsap.to(".tape--purple", { xPercent: 6, ease: "none", scrollTrigger: { trigger: ".tapes", start: "top bottom", end: "bottom top", scrub: true } }));
      // Base de pouso em camadas
      $$("[data-parallax]").forEach((g) => scrub(gsap.fromTo(g, { y: 0 }, { y: +g.dataset.parallax, ease: "none", scrollTrigger: { trigger: ".landing-site", start: "top bottom", end: "bottom top", scrub: true } })));
      // Decolagem no CTA final
      scrub(gsap.fromTo(".launch__ship", { y: 160 }, { y: -320, ease: "none", scrollTrigger: { trigger: ".launch", start: "top bottom", end: "bottom top", scrub: true } }));
      scrub(gsap.fromTo(".launch__thrust", { scaleY: .3, opacity: .2 }, { scaleY: 1.4, opacity: .9, transformOrigin: "top", ease: "none", scrollTrigger: { trigger: ".launch", start: "top bottom", end: "bottom top", scrub: true } }));
      // Assinatura do rodapé desliza
      scrub(gsap.fromTo(".base__sign", { xPercent: 8 }, { xPercent: -8, ease: "none", scrollTrigger: { trigger: ".base__sign", start: "top bottom", end: "bottom top", scrub: true } }));
    }

    // Títulos por letra
    $$("[data-split]").forEach((el) => {
      gsap.from($$(".split-char", el), { yPercent: 115, rotate: 6, duration: 1, stagger: .016, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 86%", once: true } });
    });

    // Revelações em lote
    ScrollTrigger.batch(".reveal", {
      start: "top 90%", once: true,
      onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, stagger: .09, ease: "expo.out", onComplete: () => els.forEach((el) => { el.classList.remove("reveal"); gsap.set(el, { clearProps: "transform,opacity" }); }) })
    });

    // Cards do cardápio
    ScrollTrigger.batch("[data-specimens] .spec, [data-specimens] .row", {
      start: "top 92%", once: true,
      onEnter: (els) => gsap.fromTo(els, { y: 60, opacity: 0, rotateX: -10 }, { y: 0, opacity: 1, rotateX: 0, duration: 1, stagger: .08, ease: "expo.out", clearProps: "transform" })
    });
    gsap.set("[data-specimens] .spec, [data-specimens] .row", { opacity: 0 });

    // Diário de bordo acende conforme a leitura
    $$(".log__entry").forEach((el) => ScrollTrigger.create({ trigger: el, start: "top 65%", onEnter: () => el.classList.add("is-lit") }));

    // Módulos ligam ao entrar
    $$(".mod").forEach((m) => {
      $$(".meter i", m).forEach((i, n) => i.style.setProperty("--i", n));
      ScrollTrigger.create({ trigger: m, start: "top 82%", once: true, onEnter: () => m.classList.add("is-on") });
    });

    // Medidor de satisfação
    ScrollTrigger.create({ trigger: meterTarget, start: "top 80%", once: true, onEnter: () => fillMeter(avg) });

    gsap.from(".launch__mascot", { x: -120, opacity: 0, rotate: -10, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".launch", start: "top 60%", once: true } });
  }

  /* ---------- Animações CSS só rodam na seção visível ---------- */
  function animationZones() {
    const zones = $$("main > section, .tapes, .base");
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle("in-view", e.isIntersecting)), { rootMargin: "120px 0px" });
    zones.forEach((z) => { z.setAttribute("data-zone", ""); io.observe(z); });
  }

  /* ---------- Início ---------- */
  bindData();
  updateStatus(); setInterval(updateStatus, 60000);
  renderFilters();
  renderCards(false);
  renderBag();
  splitTitles();
  cosmos();
  heroStage();
  sectionSpy();
  cursor();
  magnetic();
  updateDock();
  animationZones();

  // Sem GSAP (falha de rede) a página aparece estática
  document.documentElement.classList.add("ready");
  choreography();
  probeFps();
})();
