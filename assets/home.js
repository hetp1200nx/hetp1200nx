/* Home page: renders one employee's page (or the team directory) from content, then wires up the interactions. */
(() => {
  const S = window.STORE;
  const T = S.text, A = S.attr, U = S.url;
  const ICON = {
    vcard: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>',
    moon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
    left: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    right: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
    expand: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>',
    close: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  };
  const pad = (n) => String(n).padStart(2, '0');
  const initials = (name) => String(name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '·';

  /* ---------- head / SEO ---------- */
  const setMeta = (c) => {
    const p = c.profile, name = p.name || 'Mechvac Technologies';
    document.title = c.seo.title || (p.companyShort ? `${name} | ${p.companyShort}` : name);
    const desc = c.seo.description || `${p.role} at ${p.company}`;
    const set = (sel, attrName, val) => { let m = document.head.querySelector(sel); if (!m) { m = document.createElement('meta'); const [k, v] = sel.replace(/^meta\[|\]$/g, '').split('='); m.setAttribute(k, v.replace(/"/g, '')); document.head.appendChild(m); } m.setAttribute(attrName, val); };
    set('meta[name="description"]', 'content', `${name}, ${desc}`);
    set('meta[property="og:title"]', 'content', `${name}, ${p.role || ''}`.replace(/, $/, ''));
    set('meta[property="og:description"]', 'content', desc);
    if (p.photo) set('meta[property="og:image"]', 'content', new URL(U(p.photo), location.href).href);
  };

  /* ---------- sections ---------- */
  const sectionsOf = (c) => [
    ['about', c.about.show !== false],
    ['experience', c.experience.show !== false && (c.experience.items || []).length],
    ['skills', c.skills.show !== false],
    ['group', c.group.show !== false && (c.group.companies || []).length],
    ['products', c.products.show !== false && (c.products.items || []).length],
    ['spares', c.spares.show !== false],
    ['downloads', c.brochures.show !== false && (c.brochures.items || []).length],
    ['contact', true],
  ].filter(([, on]) => on).map(([id]) => id);

  const head = (num, title) => `<div class="sec-head"><span class="num mono">${pad(num)}</span><h2>${T(title)}</h2></div>`;

  const nav = (c, shown) => {
    const L = (id, label, cls) => (shown.includes(id) ? `<a href="#${id}"${cls ? ` class="${cls}"` : ''}>${label}</a>` : '');
    return `<nav class="nav" id="nav"><div class="wrap">
      <a href="#top" class="brand">${T(c.profile.name)}</a>
      <div class="nav-links">
        ${L('about', 'About', 'hide-sm')}${L('experience', 'Experience', 'hide-sm')}${L('products', 'Products', 'hide-sm')}
        <a href="${A(S.link('application/'))}">Applications</a>
        ${L('spares', 'Spares', 'hide-sm')}<a href="#contact">Contact</a>
        <button class="theme-btn" id="themeBtn" aria-label="Toggle colour theme" title="Toggle theme">${ICON.moon}</button>
      </div></div></nav>`;
  };

  const hero = (c) => {
    const p = c.profile, h = c.hero;
    return `<header class="hero"><div class="wrap hero-grid"><div>
      <div class="enter"><span class="eyebrow"><span class="dot"></span>${T(h.eyebrow)}</span></div>
      <h1 class="enter">${T(h.headline)}<br><span class="soft">${T(h.headlineSoft)}</span></h1>
      <p class="lede enter">${h.lede || ''}</p>
      <div class="hero-cta enter">
        <a class="btn primary" href="${A(S.link('inquiry/'))}">Send enquiry</a>
        <a class="btn" href="${A(S.vcardHref(c))}" download="${A(S.fileName(c, '.vcf'))}">${ICON.vcard}<span>Save contact</span></a>
        ${p.linkedin ? `<a class="btn" href="${A(p.linkedin)}" target="_blank" rel="noopener">LinkedIn ↗</a>` : ''}
      </div></div>
      <div class="avatar enter" aria-hidden="true">${p.photo ? `<img src="${A(U(p.photo))}" alt="${A(p.name)}" onerror="this.parentNode.textContent='${A(initials(p.name))}'">` : T(initials(p.name))}</div>
    </div></header>`;
  };

  const about = (c, n) => `<section id="about" style="padding-top:16px"><div class="wrap">${head(n, c.about.title)}
    <div class="about"><div class="card reveal">${(c.about.paragraphs || []).map((x) => `<p>${x}</p>`).join('')}</div>
    <ul class="card facts reveal">${(c.about.facts || []).map((f) => `<li><small>${T(f.label)}</small><span>${T(f.value)}</span></li>`).join('')}</ul></div></div></section>`;

  const experience = (c, n) => `<section id="experience" style="padding-top:24px"><div class="wrap">${head(n, c.experience.title)}
    <div class="timeline">${(c.experience.items || []).map((e) => `<div class="tl-item card reveal">
      <div class="tl-head"><div><h3>${T(e.role)}</h3><div style="color:var(--muted);font-size:14px">${T(e.company)}</div></div>${e.when ? `<span class="when">${T(e.when)}</span>` : ''}</div>
      <div class="role" style="display:block"><ul>${(e.points || []).map((x) => `<li>${x}</li>`).join('')}</ul></div></div>`).join('')}</div></div></section>`;

  const skills = (c, n) => `<section id="skills" style="padding-top:24px"><div class="wrap">${head(n, c.skills.title)}
    <div class="skills">${(c.skills.items || []).map((s) => `<div class="card skill reveal"><h3>${T(s.title)}</h3><p>${T(s.text)}</p></div>`).join('')}</div>
    ${(c.skills.industries || []).length ? `<div class="ind reveal" style="margin-top:20px">${c.skills.industries.map((x) => `<span>${T(x)}</span>`).join('')}</div>` : ''}
    ${c.skills.applicationsCta ? `<a class="btn reveal" href="${A(S.link('application/'))}" style="margin-top:16px">${T(c.skills.applicationsCta)}</a>` : ''}
    </div></section>`;

  const list = (id, items, sub) => `<ul class="g-list${sub ? ' ' + sub : ''}" id="${id}">${items.map((it, i) => `<li><button type="button" data-i="${i}"><span class="ix mono">${pad(i + 1)}</span><span><b>${T(it[0])}</b><small>${T(it[1])}</small></span></button></li>`).join('')}</ul>`;
  const ctrl = (p, count, hint, what) => `<div class="g-ctrl">
    <button class="g-arrow" id="${p}Prev" type="button" aria-label="Previous ${what}">${ICON.left}</button>
    <button class="g-arrow" id="${p}Next" type="button" aria-label="Next ${what}">${ICON.right}</button>
    <span class="g-count mono" id="${p}Count" aria-live="polite">01 / ${pad(count)}</span>
    <span class="g-hint">${hint}</span></div>`;
  const dots = (id, n) => `<div class="g-dots" id="${id}" aria-hidden="true">${'<i></i>'.repeat(n)}</div>`;
  const tone = (t) => (t === 'warm' ? 'pumps' : 'spares');

  const group = (c, n) => {
    const cos = c.group.companies || [];
    const card = (g, i) => `<article class="gcard ${tone(g.tone)}" aria-roledescription="slide" aria-label="${i + 1} of ${cos.length}">
      <div class="gc-top"><span class="gc-co">${T(g.name)}</span><span class="gc-tag">${T(g.tag)}</span>
        <div class="gc-imgs">${(g.images || []).filter((im) => im.src).map((im) => `<img src="${A(U(im.src))}" alt="${A(im.alt || '')}" class="h${[100, 70, 60, 55].includes(+im.size) ? +im.size : 100}${im.wide ? ' wide' : ''}" draggable="false">`).join('')}</div></div>
      <div class="gc-body">${g.lead ? `<p class="gc-lead">${g.lead}</p>` : ''}
        ${(g.blocks || []).map((b) => b.style === 'chips'
          ? `<div><h4>${T(b.heading)}</h4><div class="gc-chips">${(b.items || []).map((x) => `<span${/^\+/.test(x) ? ' class="more"' : ''}>${T(x)}</span>`).join('')}</div></div>`
          : `<div><h4>${T(b.heading)}</h4><ul${b.style === 'one' ? ' class="one"' : ''}>${(b.items || []).map((x) => `<li>${T(x)}</li>`).join('')}</ul></div>`).join('')}
        ${(g.notes || []).map((x) => `<p>${T(x)}</p>`).join('')}</div></article>`;
    return `<section id="group" style="padding-top:24px"><div class="wrap">${head(n, c.group.title)}<div class="group">
      <div class="g-info reveal"><p class="sec-sub" style="margin:0">${T(c.group.intro)}</p>
        ${list('gList', cos.map((g) => [g.name, g.short]))}${ctrl('g', cos.length, 'Swipe or drag the cards', 'company')}</div>
      <div class="deck reveal" id="deck" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Group companies">${cos.map(card).join('')}${dots('gDots', cos.length)}</div>
    </div></div></section>`;
  };

  const partsGrid = (parts) => `<div class="parts-grid">${parts.map((x) => `<figure><img src="${A(U(x.image))}" alt="${A(x.label)}" loading="lazy" draggable="false"><figcaption>${T(x.label)}</figcaption></figure>`).join('')}</div>`;

  const products = (c, n) => {
    const items = c.products.items || [];
    const card = (p, i) => {
      const parts = (p.parts || []).filter((x) => x.image);
      const art = parts.length ? partsGrid(parts)
        : `<div class="gc-imgs">${p.image ? `<img class="h100${p.wide ? ' wide' : ''}" src="${A(U(p.image))}" alt="${A(p.name)}" loading="lazy" draggable="false">` : ''}</div>${p.inset ? `<span class="p-inset"><img src="${A(U(p.inset))}" alt="" loading="lazy" draggable="false"></span>` : ''}`;
      return `<article class="gcard ${tone(p.tone)}${parts.length ? ' pfeature' : ''}" aria-roledescription="slide" aria-label="${i + 1} of ${items.length}">
        <div class="gc-top"><span class="gc-co">${T(p.series)}</span><span class="gc-tag">${T(p.tag)}</span>${art}</div>
        <div class="gc-body p-body"><h3>${T(p.name)}</h3><p>${T(p.desc)}</p>
          <div class="gc-chips">${(p.chips || []).map((x) => `<span>${T(x)}</span>`).join('')}</div>
          <span class="pd-open"><span>Tap for full overview</span>${ICON.expand}</span></div></article>`;
    };
    return `<section id="products" style="padding-top:24px"><div class="wrap">${head(n, c.products.title)}<div class="group">
      <div class="g-info reveal"><p class="sec-sub" style="margin:0">${T(c.products.intro)}</p>
        ${list('pList', items.map((p) => [p.name, p.series]), 'p-list')}${ctrl('p', items.length, 'Swipe to browse · tap to open', 'product')}</div>
      <div class="deck reveal" id="pDeck" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Products">${items.map(card).join('')}${dots('pDots', items.length)}</div>
    </div></div></section>
    <dialog id="pdlg" aria-labelledby="pdName"><div class="pd-sheet" id="pdSheet">
      <button class="pd-close" id="pdClose" type="button" aria-label="Close">${ICON.close}</button>
      <div class="pd-grid"><div class="pd-art" id="pdArt"></div><div class="pd-main">
        <div class="pd-pills"><span class="pd-series" id="pdSeries"></span><span class="pd-tag" id="pdTag"></span></div>
        <h2 id="pdName"></h2><p class="pd-over" id="pdOver"></p><div class="pd-specs" id="pdSpecs"></div></div></div>
      <div class="pd-cols"><div><h4>Key features</h4><ul class="pd-feat" id="pdFeat"></ul></div><div><h4 id="pdAppsT">Typical applications</h4><div class="pd-apps" id="pdApps"></div></div></div>
      <div class="pd-foot"><div class="pd-np"><button type="button" id="pdPrev" aria-label="Previous product">←</button><button type="button" id="pdNext" aria-label="Next product">→</button></div>
        <div class="pd-btns"><a class="btn" id="pdWa" href="#" target="_blank" rel="noopener">WhatsApp</a><a class="btn primary" id="pdEnq" href="#">Enquire</a></div></div>
    </div></dialog>`;
  };

  const spares = (c, n) => {
    const s = c.spares, tabs = s.tabs || [];
    return `<section id="spares" style="padding-top:24px"><div class="wrap">${head(n, s.title)}
      <p class="sec-sub">${s.intro || ''}</p>
      ${(s.proof || []).length ? `<div class="offer-proof reveal">${s.proof.map((x) => `<span class="tag">${T(x)}</span>`).join('')}</div>` : ''}
      ${tabs.length ? `<div class="tabs reveal" id="tabs" role="tablist" aria-label="Pump type">
        <div class="tab-list" id="tabBase">${tabs.map((t, i) => `<button class="tab" role="tab" data-i="${i}" aria-selected="${i === 0}">${T(t.label)}</button>`).join('')}</div>
        <div class="tab-list active-copy" id="tabCopy" aria-hidden="true">${tabs.map((t) => `<span class="tab">${T(t.label)}</span>`).join('')}</div></div>
      <div class="panels">${tabs.map((t, i) => `<div class="panel${i === 0 ? ' on' : ''}" role="tabpanel">
        <div class="card"><h3>${T(t.title)}</h3><ul class="parts">${(t.parts || []).map((x) => `<li>${T(x)}</li>`).join('')}</ul></div>
        <div class="card why">${(t.why || []).map((x, k) => `<div><span class="k">${k + 1}</span><p>${x}</p></div>`).join('')}</div></div>`).join('')}</div>` : ''}
      ${(s.brands || []).length ? `<div class="brands reveal"><div class="brands-head"><span><b>Any brand</b> — including</span><span>No brand limitation</span></div>
        <div class="marquee"><div class="track" id="row1"></div></div><div class="marquee row2" style="padding-top:0"><div class="track" id="row2"></div></div></div>` : ''}
      <div class="card cta-card reveal"><p>${s.cta || ''}</p><div style="display:flex;gap:8px;flex-wrap:wrap">
        <a class="btn primary" href="${A(S.link('inquiry/'))}">Send enquiry</a>
        <a class="btn" data-wa href="#" target="_blank" rel="noopener">WhatsApp</a>
        ${c.contact.officePhone ? `<a class="btn" href="${A(S.tel(c.contact.officePhone))}">Call office</a>` : ''}</div></div>
    </div></section>`;
  };

  const brochures = (c, n) => `<section id="downloads" style="padding-top:24px"><div class="wrap">${head(n, c.brochures.title)}<div class="dls">
    ${(c.brochures.items || []).map((b) => `<a class="dl-card reveal" href="${A(U(b.file))}" download target="_blank" rel="noopener">
      <div class="dl-cover${b.wide ? ' wide' : ''}">${b.cover ? `<img src="${A(U(b.cover))}" alt="${A(b.title)} cover" loading="lazy">` : ''}</div>
      <div class="dl-body"><h3>${T(b.title)}</h3><p>${T(b.text)}</p><span class="dl-meta">${T(b.meta)}<b>Download ↓</b></span></div></a>`).join('')}
    </div></div></section>`;

  const contact = (c, n) => {
    const k = c.contact, p = c.profile, cs = c.contactSection;
    const items = [];
    if (k.officePhone) items.push(`<a class="c-item reveal" href="${A(S.tel(k.officePhone))}"><div><small>Office phone</small><span>${T(k.officePhone)}</span></div><span class="act">Call</span></a>`);
    if (k.officeEmail) items.push(`<button class="c-item reveal" data-copy="${A(k.officeEmail)}"><div><small>Office email</small><span>${T(k.officeEmail)}</span></div><span class="act">Copy</span></button>`);
    if (k.whatsapp) items.push(`<a class="c-item reveal" data-wa href="#" target="_blank" rel="noopener"><div><small>WhatsApp</small><span>${T(k.whatsapp)}</span></div><span class="act">Chat ↗</span></a>`);
    if (p.linkedin) items.push(`<a class="c-item reveal" href="${A(p.linkedin)}" target="_blank" rel="noopener"><div><small>LinkedIn</small><span>${T(p.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\//, ''))}</span></div><span class="act">Open ↗</span></a>`);
    if (k.website) items.push(`<a class="c-item reveal" href="${A(k.website)}" target="_blank" rel="noopener"><div><small>Company</small><span>${T(k.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))}</span></div><span class="act">Visit ↗</span></a>`);
    if (k.locationLabel) items.push(`<div class="c-item reveal" style="cursor:default"><div><small>Location</small><span>${T(k.locationLabel)}</span></div></div>`);
    const cards = (c.cards || []).filter((x) => x.image);
    const cardHtml = (cd, i) => `<div class="card vcard reveal">
      <button class="flip" type="button" aria-label="Business card — tap to flip"><div class="flip-inner">
        <div class="face back-side"><img src="${A(U(cd.image))}" alt="${A(cd.alt || 'Business card')}" loading="lazy"></div>
        ${cd.backImage ? `<div class="face back"><img src="${A(U(cd.backImage))}" alt="${A((cd.alt || 'Business card') + ' (back)')}" loading="lazy"></div>` : ''}
      </div></button>
      <div class="vcard-side"><h3>${T(i === 0 ? cs.cardsTitle : (cd.title || cs.cardsTitle))}</h3>
        ${i === 0 ? `<p style="margin-top:6px">${T(cs.cardsText)}</p>` : ''}
        <div class="btns">${i === 0 ? `<a class="btn primary" href="${A(S.vcardHref(c))}" download="${A(S.fileName(c, '.vcf'))}">Save contact</a>` : ''}
          <a class="btn" href="${A(U(cd.image))}" download="${A(S.fileName(c, '-card' + (i ? '-' + (i + 1) : '') + '.jpg'))}" target="_blank" rel="noopener">Download card</a>
          ${i === 0 && k.website ? `<a class="btn" href="${A(k.website)}" target="_blank" rel="noopener">${T(k.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))} ↗</a>` : ''}</div></div></div>`;
    return `<section id="contact" style="padding-top:24px"><div class="wrap">${head(n, cs.title)}
      <div class="contact">${items.join('')}</div>
      ${cards.length ? `<div class="vcards">${cards.map(cardHtml).join('')}</div>` : ''}</div></section>`;
  };

  /* ---------- whole page ---------- */
  const renderEmployee = (data) => {
    const c = data.content;
    const shown = sectionsOf(c);
    const R = { about, experience, skills, group, products, spares, downloads: brochures, contact };
    const draft = data.mode === 'live' && data.employee && data.employee.published === false;
    document.getElementById('app').innerHTML =
      (draft ? `<div class="draft-bar">Draft preview: this page is not published, so only admins can see it. <a href="${A(S.ROOT + 'admin/')}">Open admin</a></div>` : '') +
      nav(c, shown) + `<main id="top">${hero(c)}${shown.map((id, i) => R[id](c, i + 1)).join('')}</main>` +
      `<footer><div class="wrap"><span>© <span id="yr">${new Date().getFullYear()}</span> ${T(c.profile.name)}</span><span>${T(c.footer.note)}</span></div></footer>`;
    setMeta(c);
    wire(c);
  };

  const renderTeam = (data) => {
    const team = data.team || [];
    document.title = 'Our team | Mechvac Technologies';
    document.getElementById('app').innerHTML = `<nav class="nav" id="nav"><div class="wrap"><a href="${A(S.ROOT)}" class="brand">Mechvac Technologies</a>
      <div class="nav-links"><a href="${A(S.ROOT + 'application/')}">Applications</a><button class="theme-btn" id="themeBtn" aria-label="Toggle colour theme" title="Toggle theme">${ICON.moon}</button></div></div></nav>
      <main id="top"><header class="hero"><div class="wrap"><div class="enter"><span class="eyebrow"><span class="dot"></span>Mechvac Technologies Pvt. Ltd.</span></div>
      <h1 class="enter">Talk to our team.<br><span class="soft">Vacuum pumps, systems and spares.</span></h1></div></header>
      <section style="padding-top:8px"><div class="wrap"><div class="team">${team.length ? team.map((m) => {
        const p = m.profile || {};
        return `<a class="member" href="${A(S.ROOT + '?u=' + encodeURIComponent(m.slug))}"><span class="ph">${p.photo ? `<img src="${A(U(p.photo))}" alt="">` : T(initials(m.name))}</span><span><b>${T(m.name)}</b><small>${T(m.role || p.role || '')}</small></span></a>`;
      }).join('') : '<p class="sec-sub">No published pages yet.</p>'}</div></div></section></main>
      <footer><div class="wrap"><span>© <span id="yr">${new Date().getFullYear()}</span> Mechvac Technologies Pvt. Ltd.</span><span></span></div></footer>`;
    wireCommon();
  };

  const renderState = (title, msg) => {
    document.title = title;
    document.getElementById('app').innerHTML = `<main class="state"><div><h1>${T(title)}</h1><p>${T(msg)}</p><a class="btn primary" href="${A(S.ROOT)}">Go to the home page</a></div></main>`;
  };

  /* ---------- interactions ---------- */
  const wireCommon = () => {
    const root = document.documentElement;
    try { const t = localStorage.getItem('theme'); if (t) root.dataset.theme = t; } catch (e) {}
    const tb = document.getElementById('themeBtn');
    tb && tb.addEventListener('click', () => {
      const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
      root.dataset.theme = dark ? 'light' : 'dark';
      try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
    });
    const nav = document.getElementById('nav');
    if (nav) { const onScroll = () => nav.classList.toggle('scrolled', scrollY > 8); addEventListener('scroll', onScroll, { passive: true }); onScroll(); }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { const t = e.target; t.classList.add('in'); io.unobserve(t); setTimeout(() => { t.classList.remove('reveal', 'in'); t.style.transitionDelay = ''; }, 800); } });
    }, { rootMargin: '0px 0px -60px 0px' });
    document.querySelectorAll('.reveal').forEach((el) => {
      const sibs = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
      el.style.transitionDelay = (sibs.indexOf(el) % 6) * 50 + 'ms';
      io.observe(el);
    });
  };

  const wire = (c) => {
    wireCommon();
    const lang = () => (window.SITE ? window.SITE.lang : 'en');
    const tr = (item, key) => { const t = item.tr && item.tr[lang()]; return (t && t[key] != null && t[key] !== '') ? t[key] : item[key]; };

    /* brands marquee */
    const brands = c.spares.brands || [];
    const half = Math.ceil(brands.length / 2);
    const fill = (id, arr) => {
      const el = document.getElementById(id); if (!el) return;
      const html = (cls) => arr.map((b) => `<span class="chip ${cls}">${T(b)}</span>`).join('') + `<span class="chip any ${cls}">+ any brand</span>`;
      el.innerHTML = html('') + html('dup');
      el.querySelectorAll('.dup').forEach((d) => d.setAttribute('aria-hidden', 'true'));
    };
    fill('row1', brands.slice(0, half)); fill('row2', brands.slice(half));

    /* clip-path tabs */
    const base = document.getElementById('tabBase');
    if (base) {
      const copy = document.getElementById('tabCopy');
      const tabs = [...base.querySelectorAll('.tab')];
      const panels = [...document.querySelectorAll('.panel')];
      const clipTo = (btn) => { if (!btn) return; const l = btn.offsetLeft - base.offsetLeft, r = base.offsetWidth - (l + btn.offsetWidth); copy.style.clipPath = `inset(0 ${r}px 0 ${l}px round 9px)`; };
      const current = () => tabs.find((t) => t.getAttribute('aria-selected') === 'true');
      const select = (i, focus) => {
        tabs.forEach((t, j) => { t.setAttribute('aria-selected', j === i); t.tabIndex = j === i ? 0 : -1; });
        panels.forEach((p, j) => p.classList.toggle('on', j === i));
        clipTo(tabs[i]); if (focus) tabs[i].focus();
      };
      tabs.forEach((t, i) => t.addEventListener('click', () => select(i)));
      base.addEventListener('keydown', (e) => {
        const cur = tabs.indexOf(current());
        if (e.key === 'ArrowRight') select((cur + 1) % tabs.length, true);
        if (e.key === 'ArrowLeft') select((cur - 1 + tabs.length) % tabs.length, true);
      });
      copy.style.transition = 'none'; select(0);
      requestAnimationFrame(() => requestAnimationFrame(() => (copy.style.transition = '')));
      addEventListener('resize', () => clipTo(current()));
      document.fonts && document.fonts.ready.then(() => clipTo(current()));
      addEventListener('langchange', () => requestAnimationFrame(() => clipTo(current())));
    }

    /* flip cards */
    document.querySelectorAll('.flip').forEach((f) => f.addEventListener('click', () => { if (f.querySelector('.face.back')) f.classList.toggle('flipped'); }));

    /* swipeable decks */
    const makeDeck = (ids) => {
      const deck = document.getElementById(ids.deck); if (!deck) return null;
      const cards = [...deck.querySelectorAll('.gcard')];
      if (!cards.length) return null;
      const listB = [...document.querySelectorAll('#' + ids.list + ' button')];
      const dotsE = [...document.querySelectorAll('#' + ids.dots + ' i')];
      const count = document.getElementById(ids.count);
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const n = cards.length;
      let order = cards.map((_, i) => i), busy = false;
      const place = (cd, k) => {
        cd.style.zIndex = 10 - k;
        cd.style.transform = reduce ? 'none' : `translateY(${k * 16}px) scale(${1 - k * 0.05})`;
        cd.style.opacity = reduce ? (k === 0 ? 1 : 0) : (k > 2 ? 0 : 1 - k * 0.12);
      };
      const layout = () => {
        order.forEach((ci, k) => { const cd = cards[ci]; cd.classList.toggle('top', k === 0); cd.inert = k !== 0; cd.setAttribute('aria-hidden', k !== 0); place(cd, k); });
        const cur = order[0];
        listB.forEach((b, i) => b.setAttribute('aria-current', i === cur));
        dotsE.forEach((d, i) => d.classList.toggle('on', i === cur));
        count.textContent = `${pad(cur + 1)} / ${pad(n)}`;
      };
      const flyOut = (dir) => {
        if (busy || n < 2) return; busy = true;
        const cd = cards[order[0]];
        cd.classList.remove('dragging');
        cd.style.transition = 'transform 280ms cubic-bezier(0.23,1,0.32,1), opacity 280ms ease';
        cd.style.transform = reduce ? 'none' : `translateX(${dir * (deck.offsetWidth + 80)}px) rotate(${dir * 14}deg)`;
        cd.style.opacity = 0;
        order.forEach((ci, k) => { if (k > 0) place(cards[ci], k - 1); });
        setTimeout(() => { order.push(order.shift()); cd.style.transition = 'none'; place(cd, n - 1); cd.offsetWidth; cd.style.transition = ''; layout(); busy = false; }, 280);
      };
      const next = () => flyOut(-1);
      const prev = () => {
        if (busy || n < 2) return; busy = true;
        const cd = cards[order[n - 1]];
        cd.style.transition = 'none'; cd.style.zIndex = 20;
        cd.style.transform = reduce ? 'none' : `translateX(${-(deck.offsetWidth + 80)}px) rotate(-14deg)`;
        cd.style.opacity = 0; cd.offsetWidth; cd.style.transition = '';
        order.unshift(order.pop()); layout();
        setTimeout(() => (busy = false), 300);
      };
      const goTo = (i) => {
        if (i === order[0] || busy) return;
        if (i === order[1]) return next();
        if (i === order[n - 1]) return prev();
        while (order[0] !== i) order.push(order.shift());
        layout();
      };
      let sx = 0, st = 0, dx = 0, dragging = false, pid = null, moved = false;
      deck.addEventListener('pointerdown', (e) => {
        const cd = e.target.closest('.gcard.top');
        if (!cd || busy || (e.pointerType === 'mouse' && e.button !== 0) || pid !== null) return;
        pid = e.pointerId; sx = e.clientX; st = performance.now(); dx = 0; dragging = false; moved = false;
        cd.setPointerCapture(pid);
      });
      deck.addEventListener('pointermove', (e) => {
        if (e.pointerId !== pid || n < 2) return;
        const cd = cards[order[0]];
        dx = e.clientX - sx;
        if (!dragging && Math.abs(dx) > 6) { dragging = true; moved = true; cd.classList.add('dragging'); }
        if (!dragging) return;
        cd.style.transform = `translateX(${dx}px) rotate(${dx * 0.045}deg)`;
        const p = Math.min(Math.abs(dx) / 220, 1), under = cards[order[1]];
        under.style.transition = 'none';
        under.style.transform = `translateY(${16 - 16 * p}px) scale(${0.95 + 0.05 * p})`;
        under.style.opacity = 0.88 + 0.12 * p;
      });
      const end = (e) => {
        if (e.pointerId !== pid) return;
        pid = null;
        const cd = cards[order[0]];
        if (n > 1) cards[order[1]].style.transition = '';
        if (!dragging) { if (ids.onTap && !busy) ids.onTap(order[0], cd); return; }
        const v = Math.abs(dx) / (performance.now() - st);
        if (Math.abs(dx) > 110 || v > 0.11) flyOut(Math.sign(dx) || -1);
        else { cd.classList.remove('dragging'); layout(); }
        dragging = false;
      };
      deck.addEventListener('pointerup', end);
      deck.addEventListener('pointercancel', end);
      deck.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
      deck.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
        if ((e.key === 'Enter' || e.key === ' ') && ids.onTap && e.target === deck) { e.preventDefault(); ids.onTap(order[0], cards[order[0]]); }
      });
      document.getElementById(ids.next).addEventListener('click', next);
      document.getElementById(ids.prev).addEventListener('click', prev);
      listB.forEach((b) => b.addEventListener('click', () => goTo(+b.dataset.i)));
      cards.forEach((cd) => (cd.style.transition = 'none'));
      layout();
      requestAnimationFrame(() => cards.forEach((cd) => (cd.style.transition = '')));
      return { goTo, current: () => order[0], card: (i) => cards[i] };
    };

    /* product overview */
    const items = c.products.items || [];
    const overview = (() => {
      const dlg = document.getElementById('pdlg'); if (!dlg || !items.length) return null;
      const sheet = document.getElementById('pdSheet');
      const $ = (id) => document.getElementById(id);
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const t = (s) => (window.SITE ? window.SITE.t(s) : s);
      const first = window.PROFILE.firstName;
      const WA = {
        en: (nm) => `Hi${first ? ' ' + first : ''}, I would like details and a quote for the ${nm}.`,
        hi: (nm) => `नमस्ते${first ? ' ' + first : ''}, मुझे ${nm} की जानकारी और कोटेशन चाहिए।`,
        gu: (nm) => `નમસ્તે${first ? ' ' + first : ''}, મારે ${nm} ની માહિતી અને ક્વોટેશન જોઈએ છે.`,
      };
      let cur = 0, origin = null, deckApi = null;
      const fill = (i) => {
        cur = i;
        const d = items[i];
        const parts = (d.parts || []).filter((x) => x.image);
        sheet.dataset.tone = d.tone === 'warm' ? 'warm' : 'cool';
        $('pdArt').innerHTML = parts.length
          ? partsGrid(parts.map((x) => ({ image: x.image, label: (x.tr && x.tr[lang()]) || x.label })))
          : (d.image ? `<img class="p-main" src="${A(U(d.image))}" alt="${A(tr(d, 'name'))}">` : '') + (d.inset ? `<span class="p-inset"><img src="${A(U(d.inset))}" alt=""></span>` : '');
        $('pdSeries').textContent = tr(d, 'series') || '';
        $('pdTag').textContent = tr(d, 'tag') || '';
        $('pdName').textContent = tr(d, 'name') || '';
        $('pdOver').textContent = tr(d, 'overview') || tr(d, 'desc') || '';
        $('pdSpecs').innerHTML = (tr(d, 'specs') || []).map((s) => `<span>${T(s)}</span>`).join('');
        $('pdFeat').innerHTML = (tr(d, 'features') || []).map((s) => `<li>${T(s)}</li>`).join('');
        $('pdAppsT').textContent = tr(d, 'appsTitle') || t('Typical applications');
        $('pdApps').innerHTML = (tr(d, 'apps') || []).map((s) => `<span>${T(s)}</span>`).join('');
        $('pdApps').parentElement.hidden = !(tr(d, 'apps') || []).length;
        $('pdFeat').parentElement.hidden = !(tr(d, 'features') || []).length;
        $('pdEnq').href = S.link('inquiry/') + (S.SLUG ? '&' : '?') + 'app=' + encodeURIComponent(d.name);
        $('pdWa').hidden = !window.PROFILE.whatsapp;
        $('pdWa').href = window.SITE ? window.SITE.waLink((WA[lang()] || WA.en)(tr(d, 'name'))) : '#';
        sheet.querySelectorAll('.pd-main > *, .pd-cols > div').forEach((el, k) => { el.classList.remove('pd-in'); el.offsetWidth; el.style.animationDelay = (k * 35) + 'ms'; el.classList.add('pd-in'); });
        history.replaceState(null, '', location.pathname + location.search + '#p-' + (d.id || i));
      };
      const toRect = (el) => {
        const a = el.getBoundingClientRect(), b = sheet.getBoundingClientRect();
        return `translate(${a.left + a.width / 2 - (b.left + b.width / 2)}px, ${a.top + a.height / 2 - (b.top + b.height / 2)}px) scale(${a.width / b.width})`;
      };
      const open = (i, cardEl) => {
        fill(i); sheet.scrollTop = 0; dlg.showModal();
        requestAnimationFrame(() => dlg.classList.add('show'));
        origin = cardEl || null;
        if (reduce || !origin) { sheet.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: 'ease' }); return; }
        const from = toRect(origin);
        origin.style.visibility = 'hidden';
        sheet.animate([{ transform: from, opacity: 0.6, borderRadius: '22px' }, { transform: 'none', opacity: 1 }], { duration: 460, easing: 'cubic-bezier(0.32,0.72,0,1)' });
      };
      const close = () => {
        if (!dlg.open) return;
        dlg.classList.remove('show');
        history.replaceState(null, '', location.pathname + location.search);
        const target = deckApi ? deckApi.card(deckApi.current()) : origin;
        const done = () => { dlg.close(); if (origin) origin.style.visibility = ''; if (target) target.style.visibility = ''; origin = null; };
        if (reduce || !target || target.getBoundingClientRect().bottom < 0 || target.getBoundingClientRect().top > innerHeight) {
          sheet.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, easing: 'ease-out' }).onfinish = done; return;
        }
        if (origin && origin !== target) origin.style.visibility = '';
        target.style.visibility = 'hidden';
        sheet.animate([{ transform: 'none', opacity: 1 }, { transform: toRect(target), opacity: 0.4 }], { duration: 260, easing: 'cubic-bezier(0.23,1,0.32,1)' }).onfinish = done;
      };
      const step = (dir) => { const i = (cur + dir + items.length) % items.length; fill(i); sheet.scrollTop = 0; if (deckApi) deckApi.goTo(i); };
      $('pdClose').addEventListener('click', close);
      $('pdPrev').addEventListener('click', () => step(-1));
      $('pdNext').addEventListener('click', () => step(1));
      dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
      dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
      dlg.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); });
      addEventListener('langchange', () => { if (dlg.open) fill(cur); });
      return { open, setDeck: (api) => (deckApi = api) };
    })();
    window.PRODUCT_OVERVIEW = overview;

    makeDeck({ deck: 'deck', list: 'gList', dots: 'gDots', count: 'gCount', prev: 'gPrev', next: 'gNext' });
    const pDeck = makeDeck({ deck: 'pDeck', list: 'pList', dots: 'pDots', count: 'pCount', prev: 'pPrev', next: 'pNext',
      onTap: (i, card) => overview && overview.open(i, card) });
    if (overview && pDeck) {
      overview.setDeck(pDeck);
      const openFromHash = () => {
        const m = location.hash.match(/^#p-(.+)$/);
        const i = m ? items.findIndex((d, k) => (d.id || String(k)) === decodeURIComponent(m[1])) : -1;
        if (i > -1) { pDeck.goTo(i); setTimeout(() => overview.open(i, pDeck.card(i)), 300); }
      };
      addEventListener('pageready', openFromHash, { once: true });
    }
    if (location.hash && !/^#p-/.test(location.hash)) addEventListener('pageready', () => { const el = document.querySelector(location.hash); el && el.scrollIntoView(); }, { once: true });

    /* toast + copy */
    const toast = document.getElementById('toast');
    let tt;
    const show = (msg) => { clearTimeout(tt); toast.textContent = msg; toast.classList.remove('hide'); toast.classList.add('show'); tt = setTimeout(() => { toast.classList.add('hide'); toast.classList.remove('show'); }, 2200); };
    const copyText = async (txt, msg) => { try { await navigator.clipboard.writeText(txt); show(msg); } catch (e) { show('Copy not available — ' + txt.slice(0, 40)); } };
    document.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', () => copyText(b.dataset.copy, window.SITE ? window.SITE.t('Email copied') : 'Email copied')));
  };

  S.boot((data) => {
    if (data.kind === 'employee') renderEmployee(data);
    else if (data.kind === 'team') renderTeam(data);
    else if (data.kind === 'missing') renderState('Page not found', 'This page does not exist or is not published yet.');
    else renderState('Something went wrong', 'The page could not be loaded. Please check your connection and try again.');
  });
})();
