/* Enquiry form, rendered for the current employee. Submissions go (via FormSubmit) to the employee's enquiry email. */
(() => {
  const S = window.STORE;
  const T = S.text, A = S.attr, U = S.url;
  const MOON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';

  const render = (data) => {
    const c = data.content, k = c.contact, q = c.inquiry, p = c.profile;
    const app = document.getElementById('app');
    const to = (k.enquiryEmail || k.officeEmail || '').trim();
    if (data.kind === 'missing' || data.kind === 'error' || data.kind === 'team' || !to) {
      app.innerHTML = `<main class="state"><div><h1>${data.kind === 'missing' ? 'Page not found' : 'Choose a person first'}</h1><p>Open the enquiry form from a team member's page.</p><a class="btn primary" href="${A(S.ROOT)}">Go to the home page</a></div></main>`;
      return;
    }
    const thanks = new URL(S.link('inquiry/thanks.html'), location.href).href;
    const pageUrl = new URL(S.link(''), location.href).href;
    const types = q.pumpTypes || [];

    app.innerHTML = `
<nav class="nav"><div class="wrap">
  <a href="${A(S.link(''))}" class="brand"><span class="back">←</span>${T(p.name)}</a>
  <div class="nav-links"><a href="${A(S.link('application/'))}" class="hide-sm">Applications</a><a href="${A(S.link('', '#contact'))}">Contact</a>
    <button class="theme-btn" id="themeBtn" aria-label="Toggle colour theme" title="Toggle theme">${MOON}</button></div></div></nav>

<main class="wrap">
  <header class="hero">
    <div class="crumb enter"><a href="${A(S.link(''))}">Home</a> / <span>Enquiry</span></div>
    <h1 class="enter">${T(q.title)}</h1>
    <p class="lede enter">${T(q.lede)}</p>
  </header>
  <div class="layout">
    <form class="card" id="form" action="https://formsubmit.co/${A(encodeURIComponent(to))}" method="POST" enctype="multipart/form-data" novalidate>
      <input type="hidden" name="_subject" id="subj" value="New spares enquiry">
      <input type="hidden" name="_template" value="table">
      <input type="hidden" name="_captcha" value="false">
      <input type="hidden" name="_next" value="${A(thanks)}">
      <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
      <input type="hidden" name="Language" id="langField" value="en">
      <input type="hidden" name="Sent to" value="${A(p.name)}">
      <input type="hidden" name="Page" value="${A(pageUrl)}">

      <fieldset>
        <legend><span class="n">1</span><span>Your details</span></legend>
        <div class="row">
          <label data-f="name"><span>Name <span class="req">*</span></span><input name="Name" autocomplete="name" required><span class="err">Please enter your name.</span></label>
          <label data-f="company"><span>Company / plant <span class="req">*</span></span><input name="Company" autocomplete="organization" required><span class="err">Please enter your company.</span></label>
        </div>
        <div class="row">
          <label data-f="phone"><span>Mobile / WhatsApp <span class="req">*</span></span><input name="Phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+91" required pattern="[+0-9 ()-]{8,}"><span class="err">Please enter a valid phone number.</span></label>
          <label data-f="email"><span>Email</span><input name="email" type="email" autocomplete="email"><span class="err">Please check the email address.</span></label>
        </div>
        <label><span>City</span><input name="City" autocomplete="address-level2"></label>
      </fieldset>

      <fieldset>
        <legend><span class="n">2</span><span>Pump details</span></legend>
        ${types.length ? `<div class="seg" role="radiogroup" aria-label="Pump type">${types.map((t, i) => `<label><input type="radio" name="Pump type" value="${A(t)}"${i === 0 ? ' checked' : ''}><span>${T(t)}</span></label>`).join('')}</div>` : ''}
        <div class="row">
          <label data-f="brand"><span>Pump brand <span class="req">*</span></span><input name="Brand" list="brands" required placeholder="e.g. Busch, Leybold"><span class="err">Please enter the pump brand.</span></label>
          <label><span>Model</span><input name="Model" placeholder="e.g. RA 0100 F"></label>
        </div>
        <div class="row">
          <label><span>Serial number</span><input name="Serial no"></label>
          <label><span>Application</span><input name="Application" placeholder="e.g. vacuum drying, packaging"></label>
        </div>
        <datalist id="brands">${(q.brands || []).map((b) => `<option value="${A(b)}">`).join('')}</datalist>
      </fieldset>

      <fieldset>
        <legend><span class="n">3</span><span>What you need</span></legend>
        <label data-f="need"><span>Part / kit needed <span class="req">*</span></span><textarea name="Requirement" required placeholder="e.g. complete overhauling kit, vanes, exhaust filters, part no. from manual"></textarea><span class="err">Please describe the part or kit you need.</span></label>
        <div class="row">
          <label><span>Quantity</span><input name="Quantity" inputmode="numeric" placeholder="1"></label>
          <label><span>How urgent?</span>
            <select name="Urgency">
              <option value="Breakdown - pump stopped">Breakdown — pump stopped</option>
              <option value="Within a week">Within a week</option>
              <option value="Planned maintenance" selected>Planned maintenance</option>
              <option value="Just a quotation">Just a quotation</option>
            </select></label>
        </div>
        <div data-f="photo">
          <label class="drop" id="drop">
            <input type="file" name="attachment" id="photo" accept="image/*,application/pdf">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="color:var(--accent)"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/></svg>
            <span class="hint"><b>Add nameplate photo</b><br>Tap to take a photo or choose a file (max 5 MB)</span>
          </label>
          <div class="thumbs" id="thumbs"></div>
          <span class="err" id="photoErr">This file is larger than 5 MB. Please choose a smaller photo.</span>
        </div>
        <label><span>Anything else?</span><textarea name="Message" placeholder="Problem you see: vacuum drop, oil loss, noise, overheating…" style="min-height:72px"></textarea></label>
      </fieldset>

      <div class="actions">
        <button class="btn primary" type="submit" id="send"><span>Send enquiry</span></button>
        ${k.whatsapp ? `<a class="btn wa" id="waSend" href="#" target="_blank" rel="noopener"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Z"/></svg><span>Send on WhatsApp</span></a>` : ''}
        <span class="note">${T(q.note)}</span>
      </div>
    </form>

    <aside>
      ${(q.nextSteps || []).length ? `<div class="card"><h3>${T(q.nextTitle)}</h3><ol class="steps">${q.nextSteps.map((s) => `<li><span>${T(s)}</span></li>`).join('')}</ol></div>` : ''}
      ${k.officePhone || k.officeEmail ? `<div class="card direct"><h3 style="margin-bottom:4px">Prefer to talk?</h3>
        ${k.officePhone ? `<a href="${A(S.tel(k.officePhone))}"><span><small>Office phone</small>${T(k.officePhone)}</span><span>→</span></a>` : ''}
        ${k.officeEmail ? `<a href="mailto:${A(k.officeEmail)}"><span><small>Office email</small>${T(k.officeEmail)}</span><span>→</span></a>` : ''}</div>` : ''}
      ${(c.brochures.items || []).length && c.brochures.show !== false ? `<div class="card"><h3 style="margin-bottom:4px">${T(c.brochures.title)}</h3>
        ${c.brochures.items.map((b) => `<a class="dl" href="${A(U(b.file))}" download target="_blank" rel="noopener">${b.cover ? `<img src="${A(U(b.cover))}" alt="" loading="lazy">` : ''}<span><b>${T(b.title)}</b><small>${T(b.meta)}</small></span></a>`).join('')}</div>` : ''}
    </aside>
  </div>
</main>
<footer><div class="wrap"><span>© <span id="yr">${new Date().getFullYear()}</span> ${T(p.name)}${p.company ? ' · ' + T(p.company) : ''}</span><span>${T(c.footer.note)}</span></div></footer>`;
    document.title = `${q.title} | ${p.name}`;
    wire(c);
  };

  const wire = (c) => {
    const form = document.getElementById('form');
    const $ = (s) => form.querySelector(s);
    const root = document.documentElement;
    try { const t = localStorage.getItem('theme'); if (t) root.dataset.theme = t; } catch (e) {}
    document.getElementById('themeBtn').addEventListener('click', () => {
      const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
      root.dataset.theme = dark ? 'light' : 'dark';
      try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
    });

    const qs = new URLSearchParams(location.search);
    if (qs.get('brand')) $('[name="Brand"]').value = qs.get('brand');
    if (qs.get('model')) $('[name="Model"]').value = qs.get('model');
    if (qs.get('app')) $('[name="Application"]').value = qs.get('app');
    if (qs.get('type')) { const r = [...form.querySelectorAll('[name="Pump type"]')].find((x) => x.value === qs.get('type')); if (r) r.checked = true; }

    const MAX = 5 * 1024 * 1024;
    const photo = document.getElementById('photo'), drop = document.getElementById('drop'), thumbs = document.getElementById('thumbs');
    const photoBox = form.querySelector('[data-f="photo"]');
    photo.addEventListener('change', () => {
      thumbs.innerHTML = ''; photoBox.classList.remove('invalid');
      const f = photo.files[0]; if (!f) return;
      if (f.size > MAX) { photoBox.classList.add('invalid'); photo.value = ''; return; }
      const d = document.createElement('div'); d.className = 'thumb';
      if (f.type.startsWith('image/')) { const i = new Image(); i.src = URL.createObjectURL(f); i.alt = ''; d.appendChild(i); }
      else d.innerHTML = '<div style="display:grid;place-items:center;height:100%;font-size:12px;color:var(--muted)">PDF</div>';
      const s = document.createElement('small'); s.textContent = f.name; d.appendChild(s);
      thumbs.appendChild(d);
    });
    ['dragenter', 'dragover'].forEach((e) => drop.addEventListener(e, () => drop.classList.add('over')));
    ['dragleave', 'drop'].forEach((e) => drop.addEventListener(e, () => drop.classList.remove('over')));

    const fields = [...form.querySelectorAll('[data-f]')].filter((l) => l.dataset.f !== 'photo');
    const check = (box) => { const el = box.querySelector('input,textarea,select'); const ok = el.checkValidity() && (!el.required || el.value.trim() !== ''); box.classList.toggle('invalid', !ok); return ok; };
    fields.forEach((box) => { const el = box.querySelector('input,textarea');
      el.addEventListener('blur', () => { if (box.classList.contains('invalid') || el.value) check(box); });
      el.addEventListener('input', () => { if (box.classList.contains('invalid')) check(box); }); });

    const get = (n) => ((form.elements[n] && form.elements[n].value) || '').trim();
    const summary = () => {
      const L = (en) => (window.SITE ? window.SITE.t(en) : en);
      const type = form.querySelector('[name="Pump type"]:checked');
      return [L('Spares enquiry'), `${L('Name')}: ${get('Name')}`, `${L('Company / plant')}: ${get('Company')}`,
        get('City') && `${L('City')}: ${get('City')}`, type && `${L('Pump type')}: ${type.value}`, `${L('Pump brand')}: ${get('Brand')}`,
        get('Model') && `${L('Model')}: ${get('Model')}`, get('Serial no') && `${L('Serial number')}: ${get('Serial no')}`,
        get('Application') && `${L('Application')}: ${get('Application')}`, `${L('Part / kit needed')}: ${get('Requirement')}`,
        get('Quantity') && `${L('Quantity')}: ${get('Quantity')}`, `${L('How urgent?')} ${get('Urgency')}`,
        get('Message') && `${L('Anything else?')} ${get('Message')}`].filter(Boolean).join('\n');
    };
    form.addEventListener('submit', (e) => {
      const bad = fields.filter((b) => !check(b));
      if (bad.length) { e.preventDefault(); bad[0].querySelector('input,textarea').focus(); return; }
      document.getElementById('subj').value = `Spares enquiry: ${get('Brand')} ${get('Model')} — ${get('Company')}`.trim();
      document.getElementById('langField').value = window.SITE ? window.SITE.lang : 'en';
      const b = document.getElementById('send');
      b.disabled = true; b.querySelector('span').textContent = window.SITE ? window.SITE.t('Sending…') : 'Sending…';
    });
    const wa = document.getElementById('waSend');
    wa && wa.addEventListener('click', (e) => { e.currentTarget.href = window.SITE.waLink(summary()); });
    addEventListener('pageshow', () => { const b = document.getElementById('send'); if (!b) return; b.disabled = false; b.querySelector('span').textContent = window.SITE ? window.SITE.t('Send enquiry') : 'Send enquiry'; });
  };

  S.boot(render);
})();
