/* Data layer shared by every page.
   - Loads one employee's content from Supabase (by ?u=<slug>), or the home-page choice from settings.
   - Falls back to window.DEFAULT_CONTENT when Supabase is not configured (demo mode).
   - Small helpers: escaping, asset URLs, links that keep ?u=, vCard, WhatsApp links. */
(() => {
  const CFG = window.SITE_CONFIG || {};
  const me = document.currentScript && document.currentScript.src;
  const ROOT = me ? me.replace(/assets\/store\.js.*$/, '') : '/';
  const SUPABASE_JS = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';
  const params = new URLSearchParams(location.search);
  const SLUG = (params.get('u') || '').toLowerCase().replace(/[^a-z0-9-]/g, '');

  const configured = !!(CFG.supabaseUrl && CFG.supabaseAnonKey);

  /* ---------- helpers ---------- */
  const text = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const attr = (s) => text(s).replace(/"/g, '&quot;');
  const url = (p) => {
    if (!p) return '';
    if (/^(https?:|data:|blob:|mailto:|tel:)/i.test(p)) return p;
    return ROOT + String(p).replace(/^\/+/, '');
  };
  // page link that keeps the current employee: link('inquiry/'), link('', '#contact')
  const link = (page, hash) => ROOT + (page || '') + (SLUG ? '?u=' + encodeURIComponent(SLUG) : '') + (hash || '');
  const digits = (s) => String(s || '').replace(/[^0-9]/g, '');
  const tel = (s) => 'tel:+' + digits(s).replace(/^0+/, '');

  const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
  // fill in anything missing from a stored row with the defaults (arrays are taken as stored)
  const merge = (base, over) => {
    if (!isObj(base)) return over === undefined ? base : over;
    const out = { ...base };
    if (isObj(over)) for (const k of Object.keys(over)) out[k] = isObj(base[k]) && isObj(over[k]) ? merge(base[k], over[k]) : over[k];
    return out;
  };
  const clone = (o) => JSON.parse(JSON.stringify(o));

  /* ---------- Supabase ---------- */
  let clientP = null;
  const client = () => {
    if (!configured) return Promise.resolve(null);
    if (clientP) return clientP;
    clientP = new Promise((res, rej) => {
      const go = () => res(window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, storageKey: 'mechvac-admin-auth' },
      }));
      if (window.supabase && window.supabase.createClient) return go();
      const s = document.createElement('script');
      s.src = SUPABASE_JS; s.onload = go; s.onerror = () => rej(new Error('Could not load the Supabase library'));
      document.head.appendChild(s);
    });
    return clientP;
  };

  const withDefaults = (content) => merge(clone(window.DEFAULT_CONTENT || {}), content || {});

  /* load what the current page should show
     -> { mode: 'demo'|'live', kind: 'employee'|'team'|'missing'|'error', employee, content, team } */
  const load = async () => {
    if (!configured) {
      return { mode: 'demo', kind: 'employee', employee: { slug: '', name: (window.DEFAULT_CONTENT || {}).profile?.name, published: true }, content: withDefaults({}) };
    }
    try {
      const sb = await client();
      let slug = SLUG;
      if (!slug) {
        const { data: s } = await sb.from('settings').select('value').eq('key', 'home').maybeSingle();
        const home = (s && s.value) || {};
        if (home.mode === 'employee' && home.slug) slug = home.slug;
        else {
          const { data: team, error } = await sb.from('employees').select('slug,name,role,content->profile,content->contact').eq('published', true).order('sort').order('name');
          if (error) throw error;
          // nothing set up yet (no home setting, no published pages): keep showing the built-in page
          if (!home.mode && !(team || []).length) return { mode: 'live', kind: 'employee', employee: { slug: '', name: (window.DEFAULT_CONTENT || {}).profile?.name, published: true }, content: withDefaults({}) };
          return { mode: 'live', kind: 'team', team: team || [], content: withDefaults({}) };
        }
      }
      const { data, error } = await sb.from('employees').select('slug,name,role,published,content').eq('slug', slug).maybeSingle();
      if (error) throw error;
      if (!data) return { mode: 'live', kind: 'missing', slug, content: withDefaults({}) };
      return { mode: 'live', kind: 'employee', employee: data, content: withDefaults(data.content) };
    } catch (e) {
      console.error('[store]', e);
      return { mode: 'live', kind: 'error', error: e, content: withDefaults({}) };
    }
  };

  /* ---------- contact helpers ---------- */
  const vcard = (c) => {
    const p = c.profile || {}, k = c.contact || {};
    const [first, ...rest] = String(p.name || '').trim().split(/\s+/);
    const esc = (s) => String(s || '').replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
    const lines = ['BEGIN:VCARD', 'VERSION:3.0', `N:${esc(rest.join(' '))};${esc(first)};;;`, `FN:${esc(p.name)}`];
    if (p.company) lines.push(`ORG:${esc(p.company)}`);
    if (p.role) lines.push(`TITLE:${esc(p.role)}`);
    if (k.officePhone) lines.push(`TEL;TYPE=WORK,VOICE:+${digits(k.officePhone)}`);
    if (k.whatsapp && digits(k.whatsapp) !== digits(k.officePhone)) lines.push(`TEL;TYPE=WORK,CELL:+${digits(k.whatsapp)}`);
    if (k.officeEmail) lines.push(`EMAIL;TYPE=WORK,INTERNET:${k.officeEmail}`);
    if (k.address) lines.push(`ADR;TYPE=WORK:;;${esc(k.address)};;;;`);
    const site = (CFG.siteUrl || location.origin).replace(/\/$/, '') + '/' + (SLUG ? '?u=' + SLUG : '');
    lines.push(`URL:${site}`);
    if (k.website) lines.push(`URL;TYPE=WORK:${k.website}`);
    lines.push('END:VCARD');
    return lines.join('\r\n') + '\r\n';
  };
  const vcardHref = (c) => 'data:text/vcard;charset=utf-8,' + encodeURIComponent(vcard(c));
  const fileName = (c, ext) => (String((c.profile || {}).name || 'contact').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'contact') + ext;

  /* load the language + floating-button scripts after the page has rendered */
  const loadScripts = (srcs) => srcs.reduce((p, src) => p.then(() => new Promise((res) => {
    const s = document.createElement('script'); s.src = ROOT + src; s.onload = res; s.onerror = res; document.body.appendChild(s);
  })), Promise.resolve());

  /* boot a page: load data, let the page render, then start shared scripts */
  const boot = async (render) => {
    const data = await load();
    window.PAGE_DATA = data;
    const c = data.content;
    window.PROFILE = {
      firstName: (c.profile && (c.profile.firstName || String(c.profile.name || '').split(' ')[0])) || '',
      whatsapp: digits(c.contact && c.contact.whatsapp),
    };
    try { render(data); } catch (e) { console.error('[render]', e); }
    await loadScripts(['assets/i18n.js', 'assets/site.js']);
    document.documentElement.classList.add('ready');
    window.dispatchEvent(new CustomEvent('pageready', { detail: data }));
  };

  window.STORE = { ROOT, SLUG, configured, CFG, text, attr, url, link, digits, tel, merge, clone, client, load, boot, vcard, vcardHref, fileName, withDefaults };
})();
