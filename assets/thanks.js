/* Thank-you page after an enquiry is sent. */
(() => {
  const S = window.STORE;
  const T = S.text, A = S.attr;
  S.boot((data) => {
    const c = data.content, k = c.contact, q = c.inquiry, p = c.profile;
    document.title = 'Enquiry sent';
    document.getElementById('app').innerHTML = `
<nav class="nav"><div class="wrap">
  <a href="${A(S.link(''))}" class="brand"><span class="back">←</span>${T(data.kind === 'employee' ? p.name : 'Home')}</a>
  <div class="nav-links"><a href="${A(S.link('application/'))}" class="hide-sm">Applications</a><a href="${A(S.link('', '#contact'))}">Contact</a>
    <button class="theme-btn" id="themeBtn" aria-label="Toggle colour theme" title="Toggle theme"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg></button></div></div></nav>
<main class="done">
  <div class="tick enter"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
  <h1 class="enter">${T(q.thanksTitle)}</h1>
  <p class="enter">${T(q.thanksText)}</p>
  <div class="btns enter">
    ${k.officePhone ? `<a class="btn primary" href="${A(S.tel(k.officePhone))}">Call ${T(k.officePhone)}</a>` : ''}
    ${k.whatsapp ? '<a class="btn wa" data-wa href="#" target="_blank" rel="noopener">WhatsApp</a>' : ''}
    <a class="btn" href="${A(S.link(''))}">Back to home</a>
  </div>
</main>`;
    const root = document.documentElement;
    try { const t = localStorage.getItem('theme'); if (t) root.dataset.theme = t; } catch (e) {}
    document.getElementById('themeBtn').addEventListener('click', () => {
      const d = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
      root.dataset.theme = d ? 'light' : 'dark';
      try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
    });
  });
})();
