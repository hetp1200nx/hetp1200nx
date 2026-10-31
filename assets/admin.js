/* Admin panel: sign in, manage employee pages, edit every piece of content, upload files. */
(() => {
  const S = window.STORE, CFG = S.CFG, SCHEMA = window.ADMIN_SCHEMA;
  const view = document.getElementById('view'), topR = document.getElementById('topR');
  const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  const MAX_IMG = 5 * 1024 * 1024, MAX_FILE = 25 * 1024 * 1024;

  let sb = null, session = null;
  let employees = [], settings = { mode: 'employee', slug: '' };
  let ed = null;   // { row, content, dirty, tab, open:Set }

  /* ---------- tiny DOM helpers ---------- */
  const h = (tag, props, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    }
    for (const kid of kids.flat(Infinity)) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : String(kid));
    return el;
  };
  const svg = (d, size = 16) => { const s = document.createElement('span'); s.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`; return s.firstChild; };
  const IC = {
    chev: '<path d="M9 18l6-6-6-6"/>', up: '<path d="M18 15l-6-6-6 6"/>', down: '<path d="M6 9l6 6 6-6"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>', copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', ext: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>',
    up2: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>', back: '<path d="M15 18l-6-6 6-6"/>',
  };
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const initials = (n) => String(n || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '·';
  const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  const pageUrl = (slug) => S.ROOT + '?u=' + encodeURIComponent(slug);

  let tt;
  const toast = (msg, bad) => {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.toggle('bad', !!bad); t.classList.add('show');
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), bad ? 5000 : 2600);
  };
  const friendly = (e) => {
    const m = (e && (e.message || e.error_description || e.msg)) || String(e);
    if (/duplicate key|employees_slug_key|already exists/i.test(m)) return 'That page link is already used by another employee.';
    if (/row-level security|permission denied/i.test(m)) return 'Not allowed. Your account is not listed as an admin.';
    if (/Invalid login credentials/i.test(m)) return 'Wrong username or password.';
    if (/Failed to fetch|NetworkError/i.test(m)) return 'Could not reach the server. Check your internet connection.';
    if (/slug/i.test(m) && /check/i.test(m)) return 'Page link can only use lowercase letters, numbers and dashes.';
    return m;
  };

  /* modal: resolves with the clicked button's value (or form data) */
  const modal = (title, bodyNodes, buttons) => new Promise((resolve) => {
    const dlg = document.getElementById('modal'), form = document.getElementById('modalForm');
    form.replaceChildren(h('h2', {}, title), ...bodyNodes,
      h('div', { class: 'acts' }, buttons.map((b) => h('button', { class: 'btn ' + (b.cls || ''), value: b.value, type: b.submit ? 'submit' : 'button', onclick: b.submit ? null : () => { dlg.close(b.value); } }, b.label))));
    const done = () => { dlg.removeEventListener('close', done); resolve({ value: dlg.returnValue, form }); };
    dlg.returnValue = '';
    dlg.addEventListener('close', done);
    form.onsubmit = (e) => { if (form.dataset.validate && !form.reportValidity()) { e.preventDefault(); } };
    dlg.showModal();
    const first = form.querySelector('input,select,textarea'); if (first) first.focus();
  });
  const confirmBox = async (title, text, okLabel, danger) =>
    (await modal(title, [h('p', { class: 'muted' }, text)], [{ label: 'Cancel', value: 'no' }, { label: okLabel, value: 'yes', cls: danger ? 'danger' : 'primary' }])).value === 'yes';

  /* ---------- top bar ---------- */
  const renderTop = () => {
    topR.replaceChildren();
    if (!session) return;
    topR.append(h('span', { class: 'who' }, session.user.email),
      h('a', { class: 'btn sm ghost', href: S.ROOT, target: '_blank', rel: 'noopener' }, 'View site ', svg(IC.ext, 13)),
      h('button', { class: 'btn sm', onclick: signOut }, 'Sign out'));
  };

  /* ---------- screens ---------- */
  const loading = (msg) => view.replaceChildren(h('div', { class: 'loading' }, h('span', { class: 'spin' }), msg || 'Loading…'));

  const renderSetup = () => {
    view.replaceChildren(h('div', { class: 'login card pad' },
      h('h1', {}, 'Connect Supabase'),
      h('p', {}, 'The admin panel needs a Supabase project to store employee pages.'),
      h('div', { class: 'note info', html: 'Open <b>assets/config.js</b> in the repository and fill in <b>supabaseUrl</b>, <b>supabaseAnonKey</b> and <b>adminEmail</b>. Then run <b>supabase/schema.sql</b> and <b>supabase/seed.sql</b> in the Supabase SQL editor. Full steps are in <b>SETUP.md</b>.' })));
  };

  const renderLogin = (msg) => {
    const err = h('div', { class: 'err' }, msg || '');
    const user = h('input', { type: 'text', name: 'user', autocomplete: 'username', required: true, value: 'Admin' });
    const pass = h('input', { type: 'password', name: 'pass', autocomplete: 'current-password', required: true });
    const btn = h('button', { class: 'btn primary', type: 'submit' }, 'Sign in');
    const form = h('form', { onsubmit: async (e) => {
      e.preventDefault(); err.textContent = '';
      const u = user.value.trim();
      const email = u.includes('@') ? u : (u.toLowerCase() === 'admin' ? CFG.adminEmail : '');
      if (!email) { err.textContent = CFG.adminEmail ? 'Unknown username.' : 'adminEmail is not set in assets/config.js.'; return; }
      btn.disabled = true; btn.replaceChildren(h('span', { class: 'spin' }), ' Signing in');
      const { data, error } = await sb.auth.signInWithPassword({ email, password: pass.value });
      btn.disabled = false; btn.textContent = 'Sign in';
      if (error) { err.textContent = friendly(error); pass.select(); return; }
      session = data.session; await afterLogin();
    } },
      h('label', { class: 'f' }, h('span', {}, 'Username'), user),
      h('label', { class: 'f' }, h('span', {}, 'Password'), pass), err, btn);
    view.replaceChildren(h('div', { class: 'login card pad' }, h('h1', {}, 'Admin sign in'), h('p', {}, 'Manage employee pages, content and publishing.'), form));
    pass.focus();
  };

  const signOut = async () => {
    if (ed && ed.dirty && !(await confirmBox('Discard changes?', 'You have unsaved changes. Sign out anyway?', 'Sign out', true))) return;
    await sb.auth.signOut(); session = null; ed = null; renderTop(); location.hash = ''; renderLogin();
  };

  const afterLogin = async () => {
    loading('Checking access…');
    const { data: ok, error } = await sb.rpc('is_admin');
    if (error || !ok) {
      await sb.auth.signOut(); session = null; renderTop();
      renderLogin(error ? friendly(error) : 'This account is not an admin. Add its email to the admins table (see SETUP.md).');
      return;
    }
    renderTop(); route();
  };

  /* ---------- data ---------- */
  const fetchAll = async () => {
    const [{ data: emps, error }, { data: st }] = await Promise.all([
      sb.from('employees').select('*').order('sort').order('name'),
      sb.from('settings').select('value').eq('key', 'home').maybeSingle(),
    ]);
    if (error) throw error;
    employees = emps || [];
    settings = (st && st.value) || { mode: 'team' };
  };

  /* ---------- employee list ---------- */
  const renderList = async () => {
    loading();
    try { await fetchAll(); } catch (e) { view.replaceChildren(h('div', { class: 'card pad err' }, friendly(e))); return; }
    const rows = employees.map((r) => {
      const p = (r.content && r.content.profile) || {};
      const sw = h('input', { type: 'checkbox', checked: r.published, 'aria-label': `Published: ${r.name}`, onchange: async (e) => {
        const on = e.target.checked; e.target.disabled = true;
        const { error } = await sb.from('employees').update({ published: on }).eq('id', r.id);
        e.target.disabled = false;
        if (error) { e.target.checked = !on; toast(friendly(error), true); return; }
        r.published = on; pill.className = 'pill ' + (on ? 'on' : 'off'); pill.textContent = on ? 'Published' : 'Draft';
        toast(on ? `${r.name} is now published` : `${r.name} is now hidden`);
      } });
      const pill = h('span', { class: 'pill ' + (r.published ? 'on' : 'off') }, r.published ? 'Published' : 'Draft');
      return h('div', { class: 'emp card' },
        h('div', { class: 'ph' }, p.photo ? h('img', { src: S.url(p.photo), alt: '' }) : initials(r.name)),
        h('div', {}, h('b', {}, r.name), h('div', { class: 'meta' }, h('span', {}, r.role || p.role || ''), pill, h('span', { class: 'mono' }, '/?u=' + r.slug))),
        h('div', { class: 'acts' },
          h('label', { class: 'switch', title: 'Publish or unpublish' }, sw, h('span')),
          h('a', { class: 'btn sm', href: '#/edit/' + r.id }, 'Edit'),
          h('a', { class: 'btn sm ghost', href: pageUrl(r.slug), target: '_blank', rel: 'noopener', title: 'Open page' }, 'View ', svg(IC.ext, 13)),
          h('button', { class: 'btn sm ghost icon', title: 'Duplicate', 'aria-label': 'Duplicate ' + r.name, onclick: () => createEmployee(r) }, svg(IC.copy, 15)),
          h('button', { class: 'btn sm ghost icon danger', title: 'Delete', 'aria-label': 'Delete ' + r.name, onclick: () => deleteEmployee(r) }, svg(IC.trash, 15))));
    });

    const homeSel = h('select', { 'aria-label': 'Home page shows' },
      h('option', { value: 'team' }, 'Team directory (all published people)'),
      employees.filter((r) => r.published).map((r) => h('option', { value: 'employee:' + r.slug }, r.name + "'s page")));
    homeSel.value = settings.mode === 'employee' && settings.slug ? 'employee:' + settings.slug : 'team';
    if (!homeSel.value) homeSel.value = 'team';
    homeSel.onchange = async () => {
      const v = homeSel.value, value = v === 'team' ? { mode: 'team' } : { mode: 'employee', slug: v.slice(9) };
      const { error } = await sb.from('settings').upsert({ key: 'home', value });
      if (error) toast(friendly(error), true); else { settings = value; toast('Home page updated'); }
    };

    view.replaceChildren(
      h('div', { class: 'head' }, h('div', {}, h('h1', {}, 'Employee pages'), h('p', {}, `${employees.length} ${employees.length === 1 ? 'page' : 'pages'} · ${employees.filter((r) => r.published).length} published`)),
        h('button', { class: 'btn primary', onclick: () => createEmployee(null) }, svg(IC.plus, 15), 'Add employee')),
      rows.length ? h('div', { class: 'emps' }, rows) : h('div', { class: 'card empty' }, 'No employee pages yet. ',
        window.DEFAULT_CONTENT && window.DEFAULT_CONTENT.profile ? h('button', { class: 'btn primary', style: 'margin-left:8px', onclick: importDefault }, `Create ${window.DEFAULT_CONTENT.profile.name}'s page from the built-in content`) : 'Add the first one.'),
      h('div', { class: 'settings card' }, h('label', { class: 'f' }, h('span', {}, 'The main address (' + (CFG.siteUrl || location.origin).replace(/^https?:\/\//, '') + ') shows'), homeSel),
        h('small', { class: 'muted' }, 'Every person also has their own link: /?u=page-link')));
  };

  /* first run: put the built-in page (the one the site shows in demo mode) into the database, published, as the home page */
  const importDefault = async () => {
    const c = clone(window.DEFAULT_CONTENT), p = c.profile || {};
    const slug = slugify(p.name || 'employee') || 'employee';
    const { error } = await sb.from('employees').insert({ slug, name: p.name || slug, role: p.role || '', published: true, sort: 1, content: c });
    if (error) return toast(friendly(error), true);
    await sb.from('settings').upsert({ key: 'home', value: { mode: 'employee', slug } });
    toast('Page created and published');
    route();
  };

  /* new page content for a person: start from a template, swap in their details, clear the previous person's contacts */
  const contentFor = (base, { name, role }) => {
    const c = S.withDefaults(clone(base || {}));
    const first = name.split(/\s+/)[0];
    const prevRole = c.profile.role;
    c.profile = { ...c.profile, name, firstName: first, role, photo: '', linkedin: '' };
    c.contact = { ...c.contact, officePhone: '', officeEmail: '', whatsapp: '', enquiryEmail: '' };
    c.hero.headline = `Hi, I'm ${first}.`;
    c.hero.eyebrow = `${role} · ${c.profile.companyShort || c.profile.company}`;
    (c.about.facts || []).forEach((f) => { if (f.label === 'Role') f.value = role; });
    if ((c.experience.items || [])[0] && c.experience.items[0].role === prevRole) c.experience.items[0].role = role;
    c.cards = [];
    c.seo = { title: '', description: c.seo.description };
    return c;
  };

  const createEmployee = async (from) => {
    const name = h('input', { type: 'text', name: 'name', required: true, placeholder: 'Full name', value: from ? '' : '' });
    const role = h('input', { type: 'text', name: 'role', required: true, value: from ? from.role : 'Sales & Application Engineer' });
    const slug = h('input', { type: 'text', name: 'slug', required: true, pattern: SLUG_RE.source, placeholder: 'e.g. ravi-kumar' });
    let slugTouched = false;
    name.oninput = () => { if (!slugTouched) slug.value = slugify(name.value); };
    slug.oninput = () => { slugTouched = true; };
    const src = h('select', { name: 'src' }, h('option', { value: '' }, 'Default template'), employees.map((r) => h('option', { value: r.id }, r.name)));
    if (from) src.value = from.id;
    const form = document.getElementById('modalForm'); form.dataset.validate = '1';
    const res = await modal(from ? `Duplicate ${from.name}` : 'Add employee', [
      h('label', { class: 'f' }, h('span', {}, 'Full name'), name),
      h('label', { class: 'f' }, h('span', {}, 'Job title'), role),
      h('label', { class: 'f' }, h('span', {}, 'Page link'), slug, h('small', {}, 'The page will open at /?u=' + 'page-link')),
      h('label', { class: 'f' }, h('span', {}, 'Copy text, products and settings from'), src),
      h('p', { class: 'muted', style: 'font-size:13px' }, 'Contact details, photo and visiting cards start empty. The page starts as a draft.'),
    ], [{ label: 'Cancel', value: 'cancel' }, { label: 'Create page', value: 'ok', cls: 'primary', submit: true }]);
    delete form.dataset.validate;
    if (res.value !== 'ok') return;
    const s = slug.value.trim();
    if (!SLUG_RE.test(s)) return toast('Page link can only use lowercase letters, numbers and dashes.', true);
    const base = src.value ? (employees.find((r) => r.id === src.value) || {}).content : window.DEFAULT_CONTENT;
    const content = contentFor(base, { name: name.value.trim(), role: role.value.trim() });
    const sort = employees.reduce((m, r) => Math.max(m, r.sort || 0), 0) + 1;
    const { data, error } = await sb.from('employees').insert({ slug: s, name: name.value.trim(), role: role.value.trim(), published: false, sort, content }).select().single();
    if (error) return toast(friendly(error), true);
    toast('Page created. Fill in the contact details, then publish.');
    location.hash = '#/edit/' + data.id;
  };

  const deleteEmployee = async (r) => {
    const ok = await confirmBox(`Delete ${r.name}?`, `This permanently removes the page at /?u=${r.slug} and all its content. Uploaded files stay in storage.`, 'Delete page', true);
    if (!ok) return;
    const { error } = await sb.from('employees').delete().eq('id', r.id);
    if (error) return toast(friendly(error), true);
    if (settings.mode === 'employee' && settings.slug === r.slug) await sb.from('settings').upsert({ key: 'home', value: { mode: 'team' } });
    toast(`${r.name} deleted`);
    renderList();
  };

  /* ---------- editor ---------- */
  const markDirty = () => {
    if (!ed || ed.dirty) return;
    ed.dirty = true; renderEdHead();
  };

  const upload = async (file, kind) => {
    const max = kind === 'file' ? MAX_FILE : MAX_IMG;
    if (file.size > max) throw new Error(`File is larger than ${Math.round(max / 1048576)} MB.`);
    const ext = (file.name.match(/\.[a-z0-9]+$/i) || [''])[0].toLowerCase();
    const base = slugify(file.name.replace(/\.[^.]+$/, '')) || 'file';
    const path = `${ed.row.slug || 'shared'}/${Date.now().toString(36)}-${base}${ext}`;
    const { error } = await sb.storage.from('media').upload(path, file, { contentType: file.type || undefined, upsert: false, cacheControl: '31536000' });
    if (error) throw error;
    return sb.storage.from('media').getPublicUrl(path).data.publicUrl;
  };

  const lines = (v) => (Array.isArray(v) ? v.join('\n') : '');
  const toLines = (s) => s.split('\n').map((x) => x.trim()).filter(Boolean);

  /* one field bound to obj[k]; hook() runs after any change (used to clear stale translations) */
  const field = (f, obj, hook) => {
    const id = 'f' + Math.random().toString(36).slice(2, 9);
    const set = (v) => { obj[f.k] = v; hook && hook(f.k); markDirty(); };
    const wrap = (input, extra) => h('label', { class: 'f', for: id, style: f.w === 2 ? 'grid-column:1/-1' : null }, h('span', {}, f.l), input, f.h ? h('small', {}, f.h) : null, extra);
    const v = obj[f.k];
    switch (f.t) {
      case 'bool': {
        const cb = h('input', { type: 'checkbox', id, checked: v !== false && v != null ? !!v : false, onchange: (e) => set(e.target.checked) });
        if (f.k === 'show' && v == null) cb.checked = true;
        return h('label', { class: 'check', style: 'grid-column:1/-1' }, cb, f.l);
      }
      case 'select': {
        const s = h('select', { id, onchange: (e) => set(typeof f.opts[0][0] === 'number' ? +e.target.value : e.target.value) }, f.opts.map(([val, lab]) => h('option', { value: val }, lab)));
        s.value = v == null ? f.opts[0][0] : v; return wrap(s);
      }
      case 'number': return wrap(h('input', { type: 'number', id, step: f.step || '1', value: v == null ? '' : v, oninput: (e) => set(e.target.value === '' ? null : +e.target.value) }));
      case 'textarea': case 'html':
        return wrap(h('textarea', { id, oninput: (e) => set(e.target.value) }, v || ''));
      case 'list': case 'htmllist':
        return wrap(h('textarea', { id, class: f.tall ? 'tall' : null, oninput: (e) => set(toLines(e.target.value)) }, lines(v)));
      case 'image': case 'file': {
        const isImg = f.t === 'image';
        const prev = h('div', { class: 'prev' });
        const showPrev = (u) => { prev.style.backgroundImage = isImg && u ? `url("${S.url(u).replace(/"/g, '%22')}")` : ''; prev.textContent = u ? (isImg ? '' : 'PDF') : 'None'; };
        const txt = h('input', { type: 'text', id, value: v || '', placeholder: isImg ? 'Upload or paste an image link' : 'Upload or paste a file link', oninput: (e) => { set(e.target.value.trim()); showPrev(e.target.value.trim()); } });
        const up = h('span', { class: 'btn sm upl' }, svg(IC.up2, 14), 'Upload',
          h('input', { type: 'file', accept: isImg ? 'image/*' : 'application/pdf,image/*', 'aria-label': 'Upload ' + f.l, onchange: async (e) => {
            const file = e.target.files[0]; e.target.value = ''; if (!file) return;
            up.classList.add('busy'); up.childNodes[1].textContent = 'Uploading…';
            try { const u = await upload(file, f.t); txt.value = u; set(u); showPrev(u); toast('Uploaded'); }
            catch (err) { toast(friendly(err), true); }
            finally { up.classList.remove('busy'); up.childNodes[1].textContent = 'Upload'; }
          } }));
        const clear = h('button', { type: 'button', class: 'btn sm ghost', onclick: () => { txt.value = ''; set(''); showPrev(''); } }, 'Clear');
        showPrev(v);
        return h('div', { class: 'f', style: f.w === 2 ? 'grid-column:1/-1' : null }, h('span', {}, f.l),
          h('div', { class: 'img' }, prev, h('div', {}, h('div', { class: 'row' }, txt, up, clear))), f.h ? h('small', {}, f.h) : null);
      }
      case 'rep': return repeater(f, obj);
      default: return wrap(h('input', { type: f.t === 'email' ? 'email' : f.t === 'url' ? 'url' : f.t === 'tel' ? 'tel' : 'text', id, value: v == null ? '' : v, oninput: (e) => set(e.target.value) }));
    }
  };

  const repeater = (f, obj) => {
    if (!Array.isArray(obj[f.k])) obj[f.k] = [];
    const arr = obj[f.k];
    const box = h('div', { class: 'f', style: 'grid-column:1/-1' });
    const draw = () => {
      const list = h('div', { class: 'rep' });
      arr.forEach((item, i) => {
        const key = f.k + ':' + i + ':' + (item.id || '');
        const lbl = h('span', { class: 'lbl' });
        const setLbl = () => {
          const title = (item[f.title] || '').toString().replace(/<[^>]+>/g, '') || `${f.item} ${i + 1}`;
          lbl.replaceChildren(...[title, f.sub && item[f.sub] ? h('small', {}, item[f.sub]) : null, item.tr && Object.keys(item.tr).length ? h('span', { class: 'tr-badge', style: 'margin-left:8px' }, 'Translated') : null].filter(Boolean));
        };
        setLbl();
        const hook = () => {
          if (f.translated && item.tr && Object.keys(item.tr).length) { delete item.tr; toast('Hindi and Gujarati text for this item was removed, because its English changed.'); }
          setLbl();
        };
        const move = (d) => (e) => { e.preventDefault(); const j = i + d; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; markDirty(); draw(); };
        const det = h('details', { class: 'ri', open: ed.open.has(key), ontoggle: (e) => { if (e.target !== det) return; det.open ? ed.open.add(key) : ed.open.delete(key); if (det.open && !det.dataset.built) build(); } },
          h('summary', {}, svg(IC.chev, 16), lbl, h('span', { class: 'tools' },
            h('button', { type: 'button', class: 'btn sm ghost icon', title: 'Move up', 'aria-label': 'Move up', disabled: i === 0, onclick: move(-1) }, svg(IC.up, 14)),
            h('button', { type: 'button', class: 'btn sm ghost icon', title: 'Move down', 'aria-label': 'Move down', disabled: i === arr.length - 1, onclick: move(1) }, svg(IC.down, 14)),
            h('button', { type: 'button', class: 'btn sm ghost icon', title: 'Duplicate', 'aria-label': 'Duplicate', onclick: (e) => { e.preventDefault(); const c = clone(item); delete c.tr; if (c.id) c.id += '-copy'; arr.splice(i + 1, 0, c); markDirty(); draw(); } }, svg(IC.copy, 14)),
            h('button', { type: 'button', class: 'btn sm ghost icon danger', title: 'Remove', 'aria-label': 'Remove', onclick: async (e) => { e.preventDefault(); if (await confirmBox(`Remove this ${f.item.toLowerCase()}?`, 'It is removed when you save.', 'Remove', true)) { arr.splice(i, 1); markDirty(); draw(); } } }, svg(IC.trash, 14)))));
        const build = () => { det.dataset.built = '1'; det.append(h('div', { class: 'body grid2' }, f.fields.map((sf) => field(sf, item, hook)))); };
        if (det.open) build();
        list.append(det);
      });
      const add = h('button', { type: 'button', class: 'btn sm', onclick: () => { arr.push(clone(f.blank || {})); ed.open.add(f.k + ':' + (arr.length - 1) + ':'); markDirty(); draw(); } }, svg(IC.plus, 14), 'Add ' + f.item.toLowerCase());
      box.replaceChildren(h('span', {}, f.l + ` (${arr.length})`), list, h('div', {}, add), ...(f.h ? [h('small', {}, f.h)] : []));
    };
    draw();
    return box;
  };

  const pathObj = (root, path) => {
    if (!path) return root;
    return path.split('.').reduce((o, k) => { if (o[k] == null || typeof o[k] !== 'object') o[k] = {}; return o[k]; }, root);
  };

  const renderPanel = () => {
    const tab = SCHEMA.find((t) => t.id === ed.tab) || SCHEMA[0];
    const panel = document.getElementById('panel');
    if (tab.json) return panel.replaceChildren(jsonPanel());
    panel.replaceChildren(tab.intro ? h('p', { class: 'intro' }, tab.intro) : '',
      ...tab.boxes.map((b) => {
        const obj = b.path === '__row' ? ed.row : pathObj(ed.content, b.path);
        return h('section', { class: 'card box' }, h('h3', {}, b.title), h('div', { class: 'grid2' }, b.fields.map((f) => field(f, obj, b.path === '__row' ? () => renderEdHead() : null))));
      }));
  };

  const jsonPanel = () => {
    const ta = h('textarea', { class: 'code', spellcheck: 'false', 'aria-label': 'Page content as JSON' }, JSON.stringify(ed.content, null, 2));
    const err = h('div', { class: 'err' });
    return h('div', { class: 'stack' },
      h('p', { class: 'intro muted' }, 'Everything on this page as JSON. Edit carefully, then press Apply. Useful for copying content between people or making many changes at once.'),
      h('section', { class: 'card box' }, ta, err, h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' },
        h('button', { class: 'btn primary', onclick: () => { try { const v = JSON.parse(ta.value); if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('Content must be a JSON object.'); ed.content = S.withDefaults(v); err.textContent = ''; markDirty(); toast('Applied. Press Save to keep it.'); } catch (e) { err.textContent = e.message; } } }, 'Apply JSON'),
        h('button', { class: 'btn', onclick: () => { const a = h('a', { href: URL.createObjectURL(new Blob([JSON.stringify(ed.content, null, 2)], { type: 'application/json' })), download: (ed.row.slug || 'page') + '.json' }); a.click(); } }, 'Download JSON'),
        h('button', { class: 'btn danger', onclick: async () => {
          if (!(await confirmBox('Reset all text to the template?', 'Products, applications and every text field go back to the default template. Name, contact details, photo and cards are kept. Nothing is saved until you press Save.', 'Reset', true))) return;
          const keep = { profile: ed.content.profile, contact: ed.content.contact, cards: ed.content.cards, seo: ed.content.seo, hero: { ...window.DEFAULT_CONTENT.hero, headline: ed.content.hero.headline, eyebrow: ed.content.hero.eyebrow } };
          ed.content = S.withDefaults({ ...clone(window.DEFAULT_CONTENT), ...keep }); ta.value = JSON.stringify(ed.content, null, 2); markDirty(); toast('Reset. Press Save to keep it.');
        } }, 'Reset text to template'))));
  };

  const renderEdHead = () => {
    const head = document.getElementById('edHead'); if (!head || !ed) return;
    const r = ed.row, p = ed.content.profile || {};
    const save = h('button', { class: 'btn primary', disabled: !ed.dirty, onclick: saveEditor }, 'Save');
    head.replaceChildren(
      h('a', { class: 'btn sm ghost icon', href: '#/', title: 'Back to list', 'aria-label': 'Back to list' }, svg(IC.back, 16)),
      h('div', { class: 't' }, h('b', {}, p.name || r.name || 'Untitled'), h('div', {}, h('span', { class: 'mono' }, '/?u=' + (r.slug || '')), ' · ', r.published ? 'Published' : 'Draft')),
      ed.dirty ? h('span', { class: 'dirty' }, 'Unsaved changes') : null,
      h('a', { class: 'btn', href: pageUrl(r.slug), target: '_blank', rel: 'noopener', title: 'Opens the saved version' }, 'Preview ', svg(IC.ext, 13)),
      save);
  };

  const renderEditor = async (id) => {
    loading();
    try { if (!employees.length || !employees.find((r) => r.id === id)) await fetchAll(); } catch (e) { view.replaceChildren(h('div', { class: 'card pad err' }, friendly(e))); return; }
    const row = employees.find((r) => r.id === id);
    if (!row) { view.replaceChildren(h('div', { class: 'card empty' }, 'This page no longer exists. ', h('a', { href: '#/' }, 'Back to the list'))); return; }
    ed = { row: { id: row.id, slug: row.slug, published: row.published, sort: row.sort, originalSlug: row.slug }, content: S.withDefaults(clone(row.content || {})), dirty: false, tab: (ed && ed.row.id === id && ed.tab) || 'page', open: new Set() };
    const tabs = h('nav', { class: 'tabs', 'aria-label': 'Sections' }, SCHEMA.map((t) => h('button', { type: 'button', 'aria-current': String(t.id === ed.tab), onclick: (e) => {
      ed.tab = t.id; tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-current', String(b === e.currentTarget))); renderPanel(); scrollTo({ top: 0 });
    } }, t.label)));
    view.replaceChildren(h('div', { class: 'ed-head', id: 'edHead' }), h('div', { class: 'ed' }, tabs, h('div', { class: 'panel', id: 'panel' })));
    renderEdHead(); renderPanel();
  };

  const saveEditor = async () => {
    const r = ed.row, c = ed.content;
    r.slug = String(r.slug || '').trim().toLowerCase();
    if (!SLUG_RE.test(r.slug)) return toast('Page link can only use lowercase letters, numbers and dashes.', true);
    if (!String(c.profile.name || '').trim()) return toast('Please enter the person’s name.', true);
    if (r.slug !== r.originalSlug && !(await confirmBox('Change the page link?', `Old links to /?u=${r.originalSlug} will stop working. New link: /?u=${r.slug}`, 'Change link'))) return;
    const btn = document.querySelector('#edHead .btn.primary'); if (btn) { btn.disabled = true; btn.replaceChildren(h('span', { class: 'spin' }), ' Saving'); }
    const { data, error } = await sb.from('employees').update({
      slug: r.slug, published: !!r.published, sort: +r.sort || 0,
      name: c.profile.name.trim(), role: (c.profile.role || '').trim(), content: c,
    }).eq('id', r.id).select().single();
    if (error) { toast(friendly(error), true); renderEdHead(); return; }
    if (r.slug !== r.originalSlug && settings.mode === 'employee' && settings.slug === r.originalSlug) {
      await sb.from('settings').upsert({ key: 'home', value: { mode: 'employee', slug: r.slug } });
    }
    const i = employees.findIndex((x) => x.id === r.id); if (i > -1) employees[i] = data;
    r.originalSlug = r.slug; ed.dirty = false; renderEdHead(); toast('Saved. The live page is updated.');
  };

  /* ---------- routing ---------- */
  let lastHash = location.hash;
  const route = async () => {
    if (!session) return;
    const m = location.hash.match(/^#\/edit\/([\w-]+)/);
    if (m) renderEditor(m[1]); else { ed = null; renderList(); }
  };
  addEventListener('hashchange', async () => {
    if (ed && ed.dirty && !location.hash.startsWith('#/edit/' + ed.row.id)) {
      const go = await confirmBox('Discard changes?', 'You have unsaved changes on this page.', 'Discard', true);
      if (!go) { history.replaceState(null, '', lastHash || '#/'); return; }
      ed.dirty = false;
    }
    lastHash = location.hash; route();
  });
  addEventListener('beforeunload', (e) => { if (ed && ed.dirty) { e.preventDefault(); e.returnValue = ''; } });
  addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && ed) { e.preventDefault(); if (ed.dirty) saveEditor(); } });

  /* ---------- start ---------- */
  (async () => {
    if (!S.configured) return renderSetup();
    loading();
    try { sb = await S.client(); } catch (e) { view.replaceChildren(h('div', { class: 'login card pad err' }, friendly(e))); return; }
    const { data } = await sb.auth.getSession();
    session = data.session;
    if (session) afterLogin(); else renderLogin();
  })();
})();
