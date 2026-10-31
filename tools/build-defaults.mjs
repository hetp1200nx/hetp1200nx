// Builds assets/defaults.js (the default content every page falls back to) and supabase/seed.sql.
// Usage: node tools/build-defaults.mjs [admin-email]
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const SRC = (p) => path.join(ROOT, 'tools', 'src', p);   // frozen copies of the old static data

const base = JSON.parse(read('tools/base-content.json'));

// --- products: old products-data.js (overview + hi/gu) + card text from the old page
const win = {};
vm.runInNewContext(fs.readFileSync(SRC('products-data.js'), 'utf8'), { window: win });
vm.runInNewContext(fs.readFileSync(SRC('i18n.js'), 'utf8'), { window: win });

const CARD = {
  'spares': { desc: 'OEM-equivalent spares for rotary vane, dry screw and claw pumps of any brand, matched to the OEM part number. Up to 30–45% below OEM price, with a 6-month warranty.', chips: ['20,000+ parts in stock', 'Any brand', '6-month warranty'] },
  'oil-sealed-rv': { desc: 'Robust FCD 400 stator and EN 31 rotor reaching 0.1 mbar with low noise. Built-in gas ballast and oil check valve for packaging, drying and general process vacuum.', chips: ['25–300 m³/h', '0.1 mbar ultimate', 'Gas ballast'] },
  'dry-rv': { desc: 'Runs 100% oil-free on long-life composite vanes, so the exhaust stays clean. Quiet, compact vacuum for pharma, food, packaging and CNC hold-down.', chips: ['8–400 m³/h', '100% oil-free', 'Composite vanes'] },
  'double-stage-rv': { desc: 'Two pumping stages for deep vacuum, with gas ballast for water vapour and quiet, air-cooled running. A reliable backing pump for Roots boosters, freeze dryers and R&D.', chips: ['Deep vacuum', 'Gas ballast', 'Backs Roots boosters'] },
  'interceptor': { desc: 'Double-acting, oil-free pump with Hastelloy wetted parts for highly corrosive solvent and acid vapours. Water-cooled skids for chemical and pharma API drying.', chips: ['100–10,000 m³/h', 'Hastelloy wetted parts', 'Chemical & pharma'] },
  'dry-screw': { desc: 'Oil-free screw rotors handle heavy solvent and condensable loads in reactors, distillation and drying. In-house PEEK, nickel and Xylan coatings for corrosive duty.', chips: ['Oil-free', 'Handles condensables', 'Coated rotors'] },
  'dry-claw': { desc: 'Contact-free claw rotors give oil-free vacuum with very low wear and maintenance. Suited to pneumatic conveying, packaging and central vacuum where a clean exhaust matters.', chips: ['Contact-free rotors', 'Low maintenance', 'Clean exhaust'] },
  'vacuum-system': { desc: 'Complete vacuum solutions built around your process, with custom condensing systems. They prevent oil contamination, improve vacuum flow efficiency and extend pump life.', chips: ['Custom condensers', 'No oil contamination', 'Longer pump life'] },
};
const KEYS = ['series', 'tag', 'name', 'overview', 'features', 'specs', 'apps', 'appsTitle'];
const pick = (o) => Object.fromEntries(KEYS.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]));

base.products.items = win.PRODUCTS.map((p) => ({
  id: p.id,
  tone: p.tone,
  image: p.img ? `assets/products/${p.img}.webp` : '',
  inset: p.inset ? `assets/products/${p.inset}.webp` : '',
  wide: !!p.wide || ['dry-rv', 'dry-screw', 'dry-claw', 'vacuum-system'].includes(p.id),
  parts: p.parts ? win.PARTS.map((x) => ({ image: `assets/products/parts/${x.id}.webp`, label: x.en, tr: { hi: x.hi, gu: x.gu } })) : [],
  ...pick(p.en),
  appsTitle: p.en.appsTitle || '',
  desc: CARD[p.id].desc,
  chips: CARD[p.id].chips,
  tr: { hi: pick(p.hi), gu: pick(p.gu) },
}));

// --- applications: APPS array from the old applications page + APP_TR translations
const appHtml = fs.readFileSync(SRC('application.html'), 'utf8');
const appsSrc = appHtml.slice(appHtml.indexOf('const APPS = ['), appHtml.indexOf('];', appHtml.indexOf('const APPS = [')) + 2);
const indSrc = appHtml.match(/const INDUSTRIES = \{[^;]*\};/)[0];
const ctx = {};
vm.runInNewContext(appsSrc.replace('const APPS', 'APPS') + indSrc.replace('const INDUSTRIES', 'INDUSTRIES'), ctx);
base.applications.items = ctx.APPS.map((a) => {
  const t = win.APP_TR[a.id] || {};
  const tr = {};
  for (const L of ['hi', 'gu']) if (t[L]) tr[L] = { title: t[L][0], sum: t[L][1], pumps: t[L][2], issues: t[L][3], fix: t[L][4] };
  return { id: a.id, image: `application/img/${a.id}.svg`, industries: [a.ind, ...a.also], title: a.title, sum: a.sum, rangeFrom: a.range[0], rangeTo: a.range[1], pumps: a.pumps, issues: a.issues, fix: a.fix, tr };
});
base.applications.industries = Object.entries(ctx.INDUSTRIES).filter(([k]) => k !== 'all').map(([id, label]) => ({ id, label, tr: { hi: win.IND_TR.hi[id], gu: win.IND_TR.gu[id] } }));

fs.writeFileSync(path.join(ROOT, 'assets', 'defaults.js'),
  '/* Default content: what a page shows before Supabase is connected, and the starting point for new employees.\n' +
  '   Generated by tools/build-defaults.mjs from tools/base-content.json. */\n' +
  'window.DEFAULT_CONTENT = ' + JSON.stringify(base, null, 1) + ';\n');

// --- seed
const adminEmail = (process.argv[2] || 'change-me@example.com').toLowerCase();
const seed = `-- Seed data: who is the admin. Run this AFTER schema.sql, in the Supabase SQL editor.
-- CHANGE the email below to the admin email you created in Supabase Authentication.
insert into public.admins (email) values ('${adminEmail}')
  on conflict (email) do nothing;

-- Het Patel's page itself is created from the admin page: sign in, then press
-- "Create Het Patel's page from the built-in content".
`;
fs.mkdirSync(path.join(ROOT, 'supabase'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'supabase', 'seed.sql'), seed);
console.log('products', base.products.items.length, '| applications', base.applications.items.length,
  '| industries', base.applications.industries.length, '| defaults.js', fs.statSync(path.join(ROOT, 'assets', 'defaults.js')).size, 'bytes');
