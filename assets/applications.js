/* Applications page, rendered from the employee's content.applications. */
(() => {
  const S = window.STORE;
  const T = S.text, A = S.attr, U = S.url;
  const SVC = {
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    spark: '<path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4"/>',
    swap: '<path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  };
  const icon = (k) => `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${SVC[k] || SVC.box}</svg>`;
  const pad = (n) => String(n).padStart(2, '0');
  const pos = (p) => ((3 - Math.log10(p)) / 6) * 100;
  const rangeText = (a, b) => `${a} – ${b} mbar`;
  const bar = (a, b) => `left:${pos(a)}%;width:${Math.max(pos(b) - pos(a), 3)}%`;
  const firstSentence = (txt) => { const m = String(txt || '').match(/^.*?[.।](\s|$)/); return m ? m[0].trim() : txt; };

  const render = (data) => {
    const c = data.content, ap = c.applications, k = c.contact, p = c.profile;
    if (data.kind === 'missing' || data.kind === 'error') {
      document.getElementById('app').innerHTML = `<main class="state"><div><h1>${data.kind === 'missing' ? 'Page not found' : 'Something went wrong'}</h1><p>This page is not available right now.</p><a class="btn primary" href="${A(S.ROOT)}">Go to the home page</a></div></main>`;
      return;
    }
    const items = (ap.items || []).filter((a) => a.title);
    const inds = ap.industries || [];
    const homeName = data.kind === 'team' ? 'Mechvac Technologies' : p.name;
    document.title = `Vacuum Applications | ${homeName}`;

    document.getElementById('app').innerHTML = `
<nav class="nav" id="nav"><div class="wrap">
  <a href="${A(S.link(''))}" class="brand"><span class="back">←</span>${T(homeName)}</a>
  <div class="nav-links">
    <a href="${A(S.link('', '#about'))}" class="hide-sm">About</a>
    <a href="${A(S.link('application/'))}" aria-current="page">Applications</a>
    <a href="${A(S.link('', '#spares'))}" class="hide-sm">Spares</a>
    <a href="${A(S.link('', '#contact'))}">Contact</a>
    <button class="theme-btn" id="themeBtn" aria-label="Toggle colour theme" title="Toggle theme"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg></button>
  </div></div></nav>
<main>
<header class="hero"><div class="wrap">
  <div class="crumb enter"><a href="${A(S.link(''))}">Home</a> / <span>Applications</span></div>
  <h1 class="enter">${T(ap.title)}<br><span class="soft">${T(ap.titleSoft)}</span></h1>
  <p class="lede enter">${T(ap.lede)}</p>
  ${ap.heroImage ? `<figure class="hero-art enter"><img src="${A(U(ap.heroImage))}" alt="${A(ap.heroAlt || '')}" width="1600" height="1057">${ap.heroCaption ? `<figcaption>${T(ap.heroCaption)}</figcaption>` : ''}</figure>` : ''}
  <div class="scale enter">
    <div><b><i style="background:color-mix(in srgb,var(--accent) 35%,transparent)"></i>Rough vacuum</b><span>1000 – 1 mbar · handling, packaging, forming, drying</span></div>
    <div><b><i style="background:color-mix(in srgb,var(--accent) 70%,transparent)"></i>Medium vacuum</b><span>1 – 0.001 mbar · freeze drying, transformers, furnaces</span></div>
    <div><b><i style="background:var(--accent)"></i>The bar on each card</b><span>shows where the process runs, from atmosphere (left) to deep vacuum (right)</span></div>
  </div></div></header>

<section id="apps" style="padding-top:32px"><div class="wrap">
  <div class="sec-head"><span class="num mono">01</span><h2>${T(ap.listTitle)}</h2></div>
  <p class="sec-sub">${T(ap.listIntro)}</p>
  <div class="filters" id="filters" role="toolbar" aria-label="Filter by industry"></div>
  <div class="grid" id="grid"></div></div></section>

${(ap.steps || []).length ? `<section id="approach" style="padding-top:16px"><div class="wrap">
  <div class="sec-head"><span class="num mono">02</span><h2>${T(ap.approachTitle)}</h2></div>
  <p class="sec-sub">${T(ap.approachIntro)}</p>
  <div class="steps">${ap.steps.map((s) => `<div class="step reveal"><h3>${T(s.title)}</h3><p>${T(s.text)}</p></div>`).join('')}</div></div></section>` : ''}

${(ap.services || []).length ? `<section id="service" style="padding-top:16px"><div class="wrap">
  <div class="sec-head"><span class="num mono">${(ap.steps || []).length ? '03' : '02'}</span><h2>${T(ap.serviceTitle)}</h2></div>
  <p class="sec-sub">${T(ap.serviceIntro)}</p>
  <div class="svc reveal">${ap.services.map((s) => `<div><span class="ic">${icon(s.icon)}</span><h3>${T(s.title)}</h3><p>${T(s.text)}</p></div>`).join('')}</div></div></section>` : ''}

<section style="padding-top:16px"><div class="wrap"><div class="cta reveal">
  <div><h2>${T(ap.ctaTitle)}</h2><p>${T(ap.ctaText)}</p></div>
  <div style="display:flex;gap:8px;flex-wrap:wrap">
    <a class="btn" href="${A(S.link('inquiry/'))}">Send enquiry</a>
    ${k.officePhone ? `<a class="btn ghost" href="${A(S.tel(k.officePhone))}">${T(k.officePhone)}</a>` : ''}
  </div></div></div></section>
</main>
<footer><div class="wrap"><span>© <span id="yr">${new Date().getFullYear()}</span> ${T(homeName)}${p.company ? ' · ' + T(p.company) : ''}</span><span>${T(ap.footerNote)}</span></div></footer>

<dialog id="dlg" aria-labelledby="dTitle"><div class="sheet" style="position:relative">
  <button class="close" id="dClose" aria-label="Close"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
  <div class="sheet-top"><div class="sheet-art"><img id="dImg" alt=""></div>
    <div class="sheet-head"><span class="ind-tag" id="dInd"></span><h2 id="dTitle"></h2><p id="dDesc"></p>
      <div><div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:6px"><span style="font-size:13px;font-weight:500">Working vacuum</span><span class="range-val mono" id="dRange"></span></div>
        <div class="range range-lg"><b id="dBar"></b></div>
        <div class="ticks mono"><span>1000</span><span>100</span><span>10</span><span>1</span><span>0.1</span><span>0.01</span><span>0.001</span></div></div></div></div>
  <div class="sheet-body"><div><h4>Typical pumps</h4><ul id="dPumps"></ul></div><div><h4>What goes wrong</h4><ul id="dIssues"></ul></div><div class="fix"><h4>What I supply</h4><ul id="dFix"></ul></div></div>
  <div class="sheet-foot"><div class="nextprev"><button id="dPrev" aria-label="Previous application">←</button><button id="dNext" aria-label="Next application">→</button></div>
    <div class="btns"><a class="btn" id="dMail" href="#">Ask about this</a>${k.officePhone ? `<a class="btn primary" href="${A(S.tel(k.officePhone))}">Call</a>` : ''}</div></div>
</div></dialog>`;

    /* --- grid, filters, dialog --- */
    const LANG = () => (window.SITE ? window.SITE.lang : 'en');
    const t = (s) => (window.SITE ? window.SITE.t(s) : s);
    const tr = (a) => { const x = a.tr && a.tr[LANG()]; return x ? { title: x.title || a.title, sum: x.sum || a.sum, pumps: x.pumps || a.pumps, issues: x.issues || a.issues, fix: x.fix || a.fix } : a; };
    const indById = Object.fromEntries(inds.map((i) => [i.id, i]));
    const indName = (id) => { const i = indById[id]; if (!i) return id; return (i.tr && i.tr[LANG()]) || i.label; };
    const allLabel = () => ({ en: 'All', hi: 'सभी', gu: 'બધા' }[LANG()] || 'All');
    const appInds = (a) => (a.industries || []).filter((x) => indById[x]);

    const grid = document.getElementById('grid'), filters = document.getElementById('filters');
    let currentFilter = 'all', rendered = false, cur = 0;
    const counts = { all: items.length };
    inds.forEach((i) => (counts[i.id] = items.filter((a) => appInds(a).includes(i.id)).length));
    const applyFilter = () => grid.querySelectorAll('.app').forEach((card) => { card.hidden = !(currentFilter === 'all' || card.dataset.ind.split(' ').includes(currentFilter)); });
    const renderGrid = () => {
      grid.innerHTML = items.map((a, i) => { const x = tr(a); return `
      <button class="app${rendered ? '' : ' reveal'}" data-i="${i}" data-ind="${A(appInds(a).join(' '))}" aria-haspopup="dialog">
        <div class="art">${a.image ? `<img src="${A(U(a.image))}" alt="" loading="lazy" width="320" height="200">` : ''}</div>
        <div class="app-body"><span class="ind-tag">${T(appInds(a).map(indName).join(' · '))}</span><h3>${T(x.title)}</h3><p>${T(firstSentence(x.sum))}</p>
          <div style="margin-top:4px"><div class="range"><b style="${bar(a.rangeFrom, a.rangeTo)}"></b></div></div>
          <div class="more"><span class="range-val mono">${rangeText(a.rangeFrom, a.rangeTo)}</span><span>${T(t('Details →'))}</span></div></div>
      </button>`; }).join('');
      applyFilter(); rendered = true;
    };
    const renderFilters = () => {
      filters.innerHTML = ['all', ...inds.map((i) => i.id)].filter((id) => counts[id]).map((id) =>
        `<button class="chip" data-k="${A(id)}" aria-pressed="${id === currentFilter}">${T(id === 'all' ? allLabel() : indName(id))}<span class="n">${counts[id]}</span></button>`).join('');
    };
    filters.addEventListener('click', (e) => {
      const b = e.target.closest('.chip'); if (!b) return;
      currentFilter = b.dataset.k;
      filters.querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', x === b));
      grid.querySelectorAll('.app').forEach((card) => { card.classList.remove('reveal'); card.style.transitionDelay = ''; });
      applyFilter();
    });

    const dlg = document.getElementById('dlg'), $ = (id) => document.getElementById(id);
    const visible = () => [...grid.querySelectorAll('.app:not([hidden])')].map((x) => +x.dataset.i);
    const fill = (i) => {
      const a = items[i], x = tr(a); cur = i;
      $('dImg').src = a.image ? U(a.image) : ''; $('dImg').alt = x.title;
      $('dInd').textContent = appInds(a).map(indName).join(' · ');
      $('dTitle').textContent = x.title; $('dDesc').textContent = x.sum;
      $('dRange').textContent = rangeText(a.rangeFrom, a.rangeTo); $('dBar').style.cssText = bar(a.rangeFrom, a.rangeTo);
      const li = (arr) => (arr || []).map((v) => `<li>${T(v)}</li>`).join('');
      $('dPumps').innerHTML = li(x.pumps); $('dIssues').innerHTML = li(x.issues); $('dFix').innerHTML = li(x.fix);
      $('dMail').href = S.link('inquiry/') + (S.SLUG ? '&' : '?') + 'app=' + encodeURIComponent(a.title);
      history.replaceState(null, '', location.pathname + location.search + '#' + (a.id || i));
    };
    const openApp = (i) => { fill(i); if (!dlg.open) { dlg.classList.remove('closing'); dlg.showModal(); requestAnimationFrame(() => dlg.classList.add('show')); } };
    const closeApp = () => {
      if (!dlg.open) return;
      dlg.classList.add('closing'); dlg.classList.remove('show');
      setTimeout(() => { dlg.close(); dlg.classList.remove('closing'); }, 150);
      history.replaceState(null, '', location.pathname + location.search);
    };
    grid.addEventListener('click', (e) => { const x = e.target.closest('.app'); if (x) openApp(+x.dataset.i); });
    $('dClose').addEventListener('click', closeApp);
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); closeApp(); });
    dlg.addEventListener('click', (e) => { if (e.target === dlg) closeApp(); });
    const step = (d) => { const v = visible(); const n = v.indexOf(cur); fill(v[(n + d + v.length) % v.length]); };
    $('dPrev').addEventListener('click', () => step(-1));
    $('dNext').addEventListener('click', () => step(1));
    dlg.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); });

    renderFilters(); renderGrid();
    addEventListener('langchange', () => { renderFilters(); renderGrid(); if (dlg.open) fill(cur); });
    addEventListener('pageready', () => { const i = items.findIndex((a) => '#' + a.id === location.hash); if (i > -1) openApp(i); }, { once: true });

    /* chrome */
    const root = document.documentElement;
    try { const th = localStorage.getItem('theme'); if (th) root.dataset.theme = th; } catch (e) {}
    $('themeBtn').addEventListener('click', () => {
      const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
      root.dataset.theme = dark ? 'light' : 'dark';
      try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
    });
    const nav = $('nav'); const onScroll = () => nav.classList.toggle('scrolled', scrollY > 8);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { const el = e.target; el.classList.add('in'); io.unobserve(el); setTimeout(() => { el.classList.remove('reveal', 'in'); el.style.transitionDelay = ''; }, 800); } }), { rootMargin: '0px 0px -60px 0px' });
    document.querySelectorAll('.reveal').forEach((el) => {
      const sib = [...el.parentElement.children].filter((x) => x.classList.contains('reveal'));
      el.style.transitionDelay = (sib.indexOf(el) % 3) * 50 + 'ms';
      io.observe(el);
    });
  };

  S.boot(render);
})();
