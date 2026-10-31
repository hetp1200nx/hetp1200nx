/* What the admin editor shows for each employee's content.
   Field types: text, email, tel, url, number, textarea, html, list (one per line), htmllist, bool, select, image, file, rep (repeating items).
   'path' on a box is where its fields live inside the content object. */
window.ADMIN_SCHEMA = (() => {
  const TONE = [['warm', 'Amber (pumps & systems)'], ['cool', 'Teal (oil-free & spares)']];
  const SHOW = { k: 'show', t: 'bool', l: 'Show this section on the page' };
  const HTML_HINT = 'Basic formatting allowed: <b>bold</b>, <strong>, <br>.';

  return [
    {
      id: 'page', label: 'Person & contact',
      intro: 'Company contact details only. Personal mobile numbers and personal email addresses should not be added.',
      boxes: [
        { title: 'Page', path: '__row', fields: [
          { k: 'slug', t: 'text', l: 'Page link', h: 'Lowercase letters, numbers and dashes. The page opens at /?u=this-value.', w: 2 },
          { k: 'sort', t: 'number', l: 'Order in team list' },
          { k: 'published', t: 'bool', l: 'Published (visible to everyone)' },
        ] },
        { title: 'Person', path: 'profile', fields: [
          { k: 'name', t: 'text', l: 'Full name' },
          { k: 'firstName', t: 'text', l: 'First name', h: 'Used in greetings and WhatsApp messages.' },
          { k: 'role', t: 'text', l: 'Job title' },
          { k: 'company', t: 'text', l: 'Company (full)' },
          { k: 'companyShort', t: 'text', l: 'Company (short)' },
          { k: 'location', t: 'text', l: 'Based in' },
          { k: 'photo', t: 'image', l: 'Photo', w: 2 },
          { k: 'linkedin', t: 'url', l: 'LinkedIn profile (optional)', w: 2 },
        ] },
        { title: 'Company contact details', path: 'contact', fields: [
          { k: 'officePhone', t: 'tel', l: 'Office phone' },
          { k: 'whatsapp', t: 'tel', l: 'Office WhatsApp number', h: 'Leave empty to hide all WhatsApp buttons.' },
          { k: 'officeEmail', t: 'email', l: 'Office email (shown on the page)' },
          { k: 'enquiryEmail', t: 'email', l: 'Enquiry form sends to', h: 'The first enquiry to a new address sends a one-time confirmation email from FormSubmit.' },
          { k: 'website', t: 'url', l: 'Company website' },
          { k: 'locationLabel', t: 'text', l: 'Location shown in contact list' },
          { k: 'address', t: 'textarea', l: 'Office address (used in “Save contact”)', w: 2 },
        ] },
        { title: 'Search & link previews', path: 'seo', fields: [
          { k: 'title', t: 'text', l: 'Browser tab title', h: 'Leave empty for “Name | Company”.' },
          { k: 'description', t: 'textarea', l: 'Short description' },
        ] },
      ],
    },
    {
      id: 'hero', label: 'Top of page',
      boxes: [
        { title: 'Introduction', path: 'hero', fields: [
          { k: 'eyebrow', t: 'text', l: 'Small label above the headline', w: 2 },
          { k: 'headline', t: 'text', l: 'Headline' },
          { k: 'headlineSoft', t: 'text', l: 'Second line (grey)' },
          { k: 'lede', t: 'html', l: 'Intro paragraph', h: HTML_HINT, w: 2 },
        ] },
        { title: 'Footer', path: 'footer', fields: [{ k: 'note', t: 'text', l: 'Footer note', w: 2 }] },
      ],
    },
    {
      id: 'about', label: 'About & experience',
      boxes: [
        { title: 'About', path: 'about', fields: [
          SHOW, { k: 'title', t: 'text', l: 'Section title' },
          { k: 'paragraphs', t: 'htmllist', l: 'Paragraphs', h: 'One paragraph per line. ' + HTML_HINT, w: 2, tall: true },
          { k: 'facts', t: 'rep', l: 'Quick facts', item: 'Fact', title: 'label', blank: { label: '', value: '' }, w: 2, fields: [
            { k: 'label', t: 'text', l: 'Label' }, { k: 'value', t: 'text', l: 'Value' }] },
        ] },
        { title: 'Experience', path: 'experience', fields: [
          SHOW, { k: 'title', t: 'text', l: 'Section title' },
          { k: 'items', t: 'rep', l: 'Jobs', item: 'Job', title: 'role', sub: 'company', blank: { role: '', company: '', when: '', points: [] }, w: 2, fields: [
            { k: 'role', t: 'text', l: 'Job title' }, { k: 'when', t: 'text', l: 'Dates', h: 'For example “2022 – Present”.' },
            { k: 'company', t: 'text', l: 'Company · city', w: 2 },
            { k: 'points', t: 'htmllist', l: 'What you did', h: 'One point per line. ' + HTML_HINT, w: 2 }] },
        ] },
      ],
    },
    {
      id: 'skills', label: 'Skills & industries',
      boxes: [{ title: 'Skills', path: 'skills', fields: [
        SHOW, { k: 'title', t: 'text', l: 'Section title' },
        { k: 'items', t: 'rep', l: 'Skills', item: 'Skill', title: 'title', blank: { title: '', text: '' }, w: 2, fields: [
          { k: 'title', t: 'text', l: 'Skill' }, { k: 'text', t: 'text', l: 'One-line description' }] },
        { k: 'industries', t: 'list', l: 'Industries', h: 'One per line.', w: 2 },
        { k: 'applicationsCta', t: 'text', l: 'Applications button text', h: 'Leave empty to hide the button.', w: 2 },
      ] }],
    },
    {
      id: 'group', label: 'Group companies',
      boxes: [{ title: 'Group companies deck', path: 'group', fields: [
        SHOW, { k: 'title', t: 'text', l: 'Section title' },
        { k: 'intro', t: 'textarea', l: 'Intro', w: 2 },
        { k: 'companies', t: 'rep', l: 'Company cards', item: 'Company', title: 'name', sub: 'tag', w: 2,
          blank: { name: '', short: '', tag: '', tone: 'warm', images: [], lead: '', blocks: [], notes: [] }, fields: [
            { k: 'name', t: 'text', l: 'Company name' }, { k: 'short', t: 'text', l: 'Short description (list)' },
            { k: 'tag', t: 'text', l: 'Badge text' }, { k: 'tone', t: 'select', l: 'Colour', opts: TONE },
            { k: 'images', t: 'rep', l: 'Images', item: 'Image', title: 'alt', w: 2, blank: { src: '', alt: '', size: 100, wide: false }, fields: [
              { k: 'src', t: 'image', l: 'Image', w: 2 }, { k: 'alt', t: 'text', l: 'Description (for screen readers)' },
              { k: 'size', t: 'select', l: 'Height', opts: [[100, 'Full'], [70, '70%'], [60, '60%'], [55, '55%']] },
              { k: 'wide', t: 'bool', l: 'Allow wider image' }] },
            { k: 'lead', t: 'html', l: 'Highlight line (optional)', h: HTML_HINT, w: 2 },
            { k: 'blocks', t: 'rep', l: 'Lists', item: 'List', title: 'heading', w: 2, blank: { heading: '', style: 'list', items: [] }, fields: [
              { k: 'heading', t: 'text', l: 'Heading' },
              { k: 'style', t: 'select', l: 'Style', opts: [['list', 'Two-column list'], ['one', 'One-column list'], ['chips', 'Chips']] },
              { k: 'items', t: 'list', l: 'Items', h: 'One per line. In chips, an item starting with “+” is highlighted.', w: 2 }] },
            { k: 'notes', t: 'list', l: 'Notes', h: 'One paragraph per line.', w: 2 }] },
      ] }],
    },
    {
      id: 'products', label: 'Products',
      intro: 'Products marked “Translated” have Hindi and Gujarati versions. If you change their English text, those translations are removed and the English text shows in every language.',
      boxes: [{ title: 'Products deck', path: 'products', fields: [
        SHOW, { k: 'title', t: 'text', l: 'Section title' },
        { k: 'intro', t: 'textarea', l: 'Intro', w: 2 },
        { k: 'items', t: 'rep', l: 'Products', item: 'Product', title: 'name', sub: 'series', translated: true, w: 2,
          blank: { id: '', tone: 'warm', image: '', inset: '', wide: false, parts: [], series: '', tag: '', name: '', desc: '', chips: [], overview: '', features: [], specs: [], appsTitle: '', apps: [] }, fields: [
            { k: 'name', t: 'text', l: 'Product name' }, { k: 'id', t: 'text', l: 'Link id', h: 'Used in links like /#p-this-id.' },
            { k: 'series', t: 'text', l: 'Series label' }, { k: 'tag', t: 'text', l: 'Badge text' },
            { k: 'tone', t: 'select', l: 'Colour', opts: TONE }, { k: 'wide', t: 'bool', l: 'Wide image' },
            { k: 'image', t: 'image', l: 'Main image', w: 2 }, { k: 'inset', t: 'image', l: 'Small inset image (optional)', w: 2 },
            { k: 'parts', t: 'rep', l: 'Parts grid (shows instead of the main image)', item: 'Part', title: 'label', translated: true, w: 2, blank: { image: '', label: '' }, fields: [
              { k: 'image', t: 'image', l: 'Image', w: 2 }, { k: 'label', t: 'text', l: 'Label', w: 2 }] },
            { k: 'desc', t: 'textarea', l: 'Card description (2 lines)', w: 2 },
            { k: 'chips', t: 'list', l: 'Card key points', h: 'One per line, about 3.', w: 2 },
            { k: 'overview', t: 'textarea', l: 'Overview (shown when the card is tapped)', w: 2 },
            { k: 'specs', t: 'list', l: 'Spec highlights', h: 'One per line.' },
            { k: 'features', t: 'list', l: 'Key features', h: 'One per line.' },
            { k: 'appsTitle', t: 'text', l: 'Applications heading', h: 'Leave empty for “Typical applications”.' },
            { k: 'apps', t: 'list', l: 'Applications / brands', h: 'One per line.' }] },
      ] }],
    },
    {
      id: 'spares', label: 'Spares',
      boxes: [{ title: 'Spares section', path: 'spares', fields: [
        SHOW, { k: 'title', t: 'text', l: 'Section title' },
        { k: 'intro', t: 'html', l: 'Intro', h: HTML_HINT, w: 2 },
        { k: 'proof', t: 'list', l: 'Highlights', h: 'One per line.', w: 2 },
        { k: 'tabs', t: 'rep', l: 'Pump-type tabs', item: 'Tab', title: 'label', w: 2, blank: { label: '', title: '', parts: [], why: [] }, fields: [
          { k: 'label', t: 'text', l: 'Tab label' }, { k: 'title', t: 'text', l: 'Heading' },
          { k: 'parts', t: 'list', l: 'Parts', h: 'One per line.' }, { k: 'why', t: 'htmllist', l: 'Three reasons', h: 'One per line. ' + HTML_HINT }] },
        { k: 'brands', t: 'list', l: 'Brands (scrolling strip)', h: 'One per line.', w: 2 },
        { k: 'cta', t: 'html', l: 'Call-to-action text', h: HTML_HINT, w: 2 },
      ] }],
    },
    {
      id: 'cards', label: 'Contact & cards',
      boxes: [
        { title: 'Contact section', path: 'contactSection', fields: [
          { k: 'title', t: 'text', l: 'Section title' }, { k: 'cardsTitle', t: 'text', l: 'Business card heading' },
          { k: 'cardsText', t: 'textarea', l: 'Business card text', w: 2 }] },
        { title: 'Visiting cards', path: '', fields: [
          { k: 'cards', t: 'rep', l: 'Cards', item: 'Card', title: 'title', w: 2, blank: { image: '', backImage: '', alt: '', title: '' }, fields: [
            { k: 'image', t: 'image', l: 'Front (shown first)', w: 2 }, { k: 'backImage', t: 'image', l: 'Back (shown when tapped, optional)', w: 2 },
            { k: 'title', t: 'text', l: 'Heading (for extra cards)' }, { k: 'alt', t: 'text', l: 'Description (for screen readers)' }] }] },
      ],
    },
    {
      id: 'brochures', label: 'Brochures',
      boxes: [{ title: 'Brochures', path: 'brochures', fields: [
        SHOW, { k: 'title', t: 'text', l: 'Section title' },
        { k: 'items', t: 'rep', l: 'Brochures', item: 'Brochure', title: 'title', w: 2, blank: { title: '', text: '', meta: 'PDF', file: '', cover: '', wide: false }, fields: [
          { k: 'title', t: 'text', l: 'Title' }, { k: 'meta', t: 'text', l: 'Small text', h: 'For example “PDF · 8 pages · 6.7 MB”.' },
          { k: 'text', t: 'textarea', l: 'Description', w: 2 },
          { k: 'file', t: 'file', l: 'PDF file', w: 2 }, { k: 'cover', t: 'image', l: 'Cover image', w: 2 },
          { k: 'wide', t: 'bool', l: 'Landscape cover' }] },
      ] }],
    },
    {
      id: 'apps', label: 'Applications page',
      intro: 'Applications marked “Translated” have Hindi and Gujarati versions. Changing their English text removes those translations.',
      boxes: [
        { title: 'Page text', path: 'applications', fields: [
          { k: 'title', t: 'text', l: 'Headline' }, { k: 'titleSoft', t: 'text', l: 'Second line (grey)' },
          { k: 'lede', t: 'textarea', l: 'Intro', w: 2 },
          { k: 'heroImage', t: 'image', l: 'Banner image', w: 2 }, { k: 'heroCaption', t: 'text', l: 'Banner caption' }, { k: 'heroAlt', t: 'text', l: 'Banner description' },
          { k: 'listTitle', t: 'text', l: 'List title' }, { k: 'listIntro', t: 'text', l: 'List intro' },
          { k: 'approachTitle', t: 'text', l: 'Approach title' }, { k: 'approachIntro', t: 'text', l: 'Approach intro' },
          { k: 'steps', t: 'rep', l: 'Approach steps', item: 'Step', title: 'title', w: 2, blank: { title: '', text: '' }, fields: [
            { k: 'title', t: 'text', l: 'Title' }, { k: 'text', t: 'text', l: 'Text' }] },
          { k: 'serviceTitle', t: 'text', l: 'Services title' }, { k: 'serviceIntro', t: 'text', l: 'Services intro' },
          { k: 'services', t: 'rep', l: 'Services', item: 'Service', title: 'title', w: 2, blank: { icon: 'box', title: '', text: '' }, fields: [
            { k: 'title', t: 'text', l: 'Title' }, { k: 'icon', t: 'select', l: 'Icon', opts: [['box', 'Box'], ['wrench', 'Wrench'], ['calendar', 'Calendar'], ['search', 'Magnifier'], ['spark', 'Spark'], ['swap', 'Swap'], ['phone', 'Phone'], ['shield', 'Shield']] },
            { k: 'text', t: 'textarea', l: 'Text', w: 2 }] },
          { k: 'ctaTitle', t: 'text', l: 'Closing title' }, { k: 'footerNote', t: 'text', l: 'Footer note' },
          { k: 'ctaText', t: 'textarea', l: 'Closing text', w: 2 },
        ] },
        { title: 'Industries (filters)', path: 'applications', fields: [
          { k: 'industries', t: 'rep', l: 'Industries', item: 'Industry', title: 'label', sub: 'id', translated: true, w: 2, blank: { id: '', label: '' }, fields: [
            { k: 'label', t: 'text', l: 'Name' }, { k: 'id', t: 'text', l: 'Id', h: 'Short code used by applications, e.g. pharma.' }] }] },
        { title: 'Applications', path: 'applications', fields: [
          { k: 'items', t: 'rep', l: 'Applications', item: 'Application', title: 'title', translated: true, w: 2,
            blank: { id: '', image: '', industries: [], title: '', sum: '', rangeFrom: 100, rangeTo: 1, pumps: [], issues: [], fix: [] }, fields: [
              { k: 'title', t: 'text', l: 'Title' }, { k: 'id', t: 'text', l: 'Link id' },
              { k: 'image', t: 'image', l: 'Illustration', w: 2 },
              { k: 'industries', t: 'list', l: 'Industry ids', h: 'One per line, from the Industries list (e.g. pharma).' },
              { k: 'rangeFrom', t: 'number', l: 'Vacuum from (mbar)', step: 'any' }, { k: 'rangeTo', t: 'number', l: 'Vacuum to (mbar)', step: 'any' },
              { k: 'sum', t: 'textarea', l: 'Summary', w: 2 },
              { k: 'pumps', t: 'list', l: 'Typical pumps' }, { k: 'issues', t: 'list', l: 'What goes wrong' },
              { k: 'fix', t: 'list', l: 'What I supply', w: 2 }] }] },
      ],
    },
    {
      id: 'inquiry', label: 'Enquiry page',
      boxes: [{ title: 'Enquiry form page', path: 'inquiry', fields: [
        { k: 'title', t: 'text', l: 'Title' }, { k: 'nextTitle', t: 'text', l: '“What happens next” heading' },
        { k: 'lede', t: 'textarea', l: 'Intro', w: 2 },
        { k: 'pumpTypes', t: 'list', l: 'Pump type choices', h: 'One per line.' },
        { k: 'nextSteps', t: 'list', l: 'What happens next', h: 'One per line.' },
        { k: 'brands', t: 'list', l: 'Brand suggestions', h: 'One per line.', w: 2 },
        { k: 'note', t: 'textarea', l: 'Note under the buttons', w: 2 },
        { k: 'thanksTitle', t: 'text', l: 'Thank-you title' }, { k: 'thanksText', t: 'textarea', l: 'Thank-you text' },
      ] }],
    },
    { id: 'json', label: 'Advanced (JSON)', json: true },
  ];
})();
