/* Shared behaviour for all pages: language switch, WhatsApp, floating enquiry button.
   Pages may define window.I18N = { "English html": { hi: "...", gu: "..." }, ... } before this file. */
(() => {
  const ROOT = 'https://het-patel.work.gd/';
  const WA_NUMBER = '919558008035';           // WhatsApp number (office)
  const LANGS = ['en', 'hi', 'gu'];
  const LABEL = { en: 'EN', hi: 'हि', gu: 'ગુ' };

  const COMMON = {
    'About': { hi: 'परिचय', gu: 'પરિચય' },
    'Experience': { hi: 'अनुभव', gu: 'અનુભવ' },
    'Applications': { hi: 'एप्लिकेशन', gu: 'એપ્લિકેશન' },
    'Spares': { hi: 'स्पेयर्स', gu: 'સ્પેર્સ' },
    'Contact': { hi: 'संपर्क', gu: 'સંપર્ક' },
    'Enquiry': { hi: 'पूछताछ', gu: 'પૂછપરછ' },
    'Home': { hi: 'होम', gu: 'હોમ' },
    'Save contact': { hi: 'कॉन्टैक्ट सेव करें', gu: 'કોન્ટેક્ટ સેવ કરો' },
    'WhatsApp': { hi: 'WhatsApp', gu: 'WhatsApp' },
    'Brand names belong to their owners; parts are equivalent replacements.': {
      hi: 'ब्रांड नाम उनके मालिकों के हैं; पार्ट्स समकक्ष रिप्लेसमेंट हैं।',
      gu: 'બ્રાન્ડ નામ તેમના માલિકોના છે; પાર્ટ્સ સમકક્ષ રિપ્લેસમેન્ટ છે.' },
  };
  const WA_TEXT = {
    en: 'Hi Het, I need spares for my ___ vacuum pump.',
    hi: 'नमस्ते हेत, मुझे मेरे ___ वैक्यूम पंप के लिए स्पेयर्स चाहिए।',
    gu: 'નમસ્તે હેત, મારે મારા ___ વેક્યુમ પંપ માટે સ્પેર્સ જોઈએ છે.',
  };
  const FAB_LABEL = { en: 'Send enquiry', hi: 'पूछताछ भेजें', gu: 'પૂછપરછ મોકલો' };

  const DICT = Object.assign({}, COMMON, window.I18N || {});
  const norm = (s) => s.replace(/\s+/g, ' ').trim();

  let lang = 'en';
  try { const s = localStorage.getItem('lang'); if (LANGS.includes(s)) lang = s; } catch (e) {}
  const q = new URLSearchParams(location.search).get('lang');
  if (LANGS.includes(q)) lang = q;

  /* collect translatable elements once (topmost match wins when applied) */
  let nodes = null;
  const collect = () => {
    nodes = [];
    document.querySelectorAll('body *:not(script):not(style):not(svg):not(svg *)').forEach((el) => {
      if (el.closest('[data-no-i18n]')) return;
      const key = norm(el.innerHTML);
      if (key && DICT[key]) nodes.push({ el, key, en: el.innerHTML });
    });
    document.querySelectorAll('[placeholder]').forEach((el) => {
      const key = norm(el.getAttribute('placeholder'));
      if (DICT[key]) nodes.push({ el, key, en: el.getAttribute('placeholder'), attr: 'placeholder' });
    });
    document.querySelectorAll('[aria-label]').forEach((el) => {
      const key = norm(el.getAttribute('aria-label'));
      if (DICT[key]) nodes.push({ el, key, en: el.getAttribute('aria-label'), attr: 'aria-label' });
    });
  };

  const t = (en, l = lang) => (l === 'en' || !DICT[norm(en)] || !DICT[norm(en)][l]) ? en : DICT[norm(en)][l];

  const apply = () => {
    if (!nodes) collect();
    nodes.forEach((n) => {
      const val = lang === 'en' ? n.en : (DICT[n.key][lang] || n.en);
      if (n.attr) n.el.setAttribute(n.attr, val);
      else if (n.el.isConnected && n.el.innerHTML !== val) n.el.innerHTML = val;
    });
    document.documentElement.lang = lang;
    document.querySelectorAll('.lang button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.l === lang));
    const wa = document.querySelectorAll('[data-wa]');
    wa.forEach((a) => (a.href = waLink()));
    const fl = document.querySelector('.fab .enq span'); if (fl) fl.textContent = FAB_LABEL[lang];
    const fe = document.querySelector('.fab .enq'); if (fe) fe.setAttribute('aria-label', FAB_LABEL[lang]);
    window.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  };

  const setLang = (l) => {
    if (l === lang) return;
    lang = l;
    try { localStorage.setItem('lang', l); } catch (e) {}
    apply();
  };

  const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text || WA_TEXT[lang])}`;

  /* language switch in nav (before theme button) */
  const host = document.querySelector('.nav-links');
  if (host) {
    const sw = document.createElement('div');
    sw.className = 'lang'; sw.setAttribute('role', 'group'); sw.setAttribute('aria-label', 'Language');
    sw.innerHTML = LANGS.map((l) => `<button type="button" data-l="${l}" aria-pressed="${l === lang}" lang="${l}" title="${{ en: 'English', hi: 'हिंदी', gu: 'ગુજરાતી' }[l]}">${LABEL[l]}</button>`).join('');
    sw.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) setLang(b.dataset.l); });
    const theme = host.querySelector('.theme-btn');
    host.insertBefore(sw, theme || null);
  }

  /* floating buttons */
  const onEnquiry = document.body.dataset.page === 'inquiry';
  const fab = document.createElement('div');
  fab.className = 'fab';
  fab.innerHTML =
    `<a class="wa" data-wa href="${waLink()}" target="_blank" rel="noopener" aria-label="WhatsApp">` +
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01Zm-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.01 4.54-3.69 8.23-8.22 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z"/></svg></a>' +
    (onEnquiry ? '' :
      `<a class="enq" href="${ROOT}inquiry/" aria-label="${FAB_LABEL[lang]}">` +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/></svg>' +
      `<span>${FAB_LABEL[lang]}</span></a>`);
  document.body.appendChild(fab);
  setTimeout(() => fab.classList.add('in'), 700);

  /* public helpers for pages */
  window.SITE = { t, waLink, get lang() { return lang; }, root: ROOT, apply };

  document.querySelectorAll('[data-wa]').forEach((a) => (a.href = waLink()));
  if (lang !== 'en') apply(); else document.documentElement.lang = 'en';
})();
