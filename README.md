# Het Patel · Industrial Vacuum

Hi, I'm **Het Patel**, Sales & Application Engineer at **Mechvac Technologies Pvt. Ltd.**, Vadodara (VacSolutë group of companies).

I help process plants keep their vacuum running. Most of my work happens on plant floors with maintenance and production teams: studying the process, finding out why a vacuum line isn't pulling down or a pump keeps losing oil, and matching the right pump, spare or service to it.

This repository is my personal intro site.

**Live site:** [het-patel.work.gd](https://het-patel.work.gd/)

## What I can help with

- **Vacuum pump spares for any brand:** OEM-equivalent kits and parts for rotary vane, dry screw and claw pumps (Busch, Leybold, Edwards, Toshniwal, Atlas Copco, Becker, Pfeiffer and more), matched to the OEM part number, with a 6-month warranty
- **Pump selection:** new Mechvac pumps or direct equivalents for installed pumps, sized on vacuum level, capacity, gas load, condensables and corrosiveness
- **Service, repair and AMC:** overhauls, engineer visits and annual maintenance contracts
- **Vacuum systems:** engineered systems with custom condensing, to prevent oil contamination and extend pump life

### Products I supply
- Oil-sealed rotary vane vacuum pumps (MT series)
- Dry rotary vane vacuum pumps (MTD series)
- Double-stage rotary vane vacuum pumps (RD series)
- Interceptor Series dry reciprocating vacuum pumps, for highly corrosive chemical and pharma duty
- Dry screw vacuum pumps (Alesol)
- Dry claw vacuum pumps
- Engineered vacuum systems

### Industries
Pharmaceuticals, chemicals, petrochemicals, food and dairy, packaging, plastics and rubber, automotive, transformers, solar, battery, medical devices and EPC projects.

## Contact

| | |
| --- | --- |
| Office phone / WhatsApp | [+91 95580 08035](tel:+919558008035) |
| Office email | [Het.patel@mechvactech.com](mailto:Het.patel@mechvactech.com) |
| LinkedIn | [in/het-patel-81b8071b4](https://www.linkedin.com/in/het-patel-81b8071b4) |
| Company | [mechvactech.com](https://www.mechvactech.com) |
| Spares enquiry | [het-patel.work.gd/inquiry](https://het-patel.work.gd/inquiry/) |

---

## About the site

| Page | What it does |
| --- | --- |
| **Home** (`index.html`) | About me, experience, skills, the VacSolutë group companies, products, spares, brochures and contact |
| **Applications** (`application/`) | 14 industrial vacuum applications with vacuum range, typical pumps, common problems and the spares that fix them |
| **Enquiry** (`inquiry/`) | Spares enquiry form with nameplate photo upload, sent to my office email, or the same details on WhatsApp |

### Features
- Swipeable card decks for the group companies and products; tap a product to open its full overview
- English, Hindi and Gujarati, switchable on every page
- Floating WhatsApp and enquiry buttons
- One-tap **Save contact** (vCard) and a flippable business card
- Brochure downloads
- Light and dark themes, and reduced motion for visitors who turn it on in their settings
- Direct links to each product and application, for example `het-patel.work.gd/#p-interceptor` and `het-patel.work.gd/application/#transformer`

### Repository layout

```
index.html                     Home page
application/                   Applications page and its illustrations (img/)
inquiry/                       Enquiry form and thank-you page
assets/
  site.css, site.js            Shared styles and behaviour (language switch, floating buttons)
  i18n.js                      Hindi and Gujarati text
  products-data.js             Product overview content
  group/, products/            Product and group images
downloads/                     Brochure PDFs and cover images
het-patel.vcf                  Contact card for "Save contact"
card-front.jpg, card-back.jpg  Business card
Img.jpeg                       Profile photo
```

It is a plain static site (HTML, CSS and JavaScript) with no build step, hosted on GitHub Pages with a custom domain.

### Updating
- **Text and sections:** edit `index.html`, `application/index.html` or `inquiry/index.html`
- **Product overviews:** edit `assets/products-data.js`
- **Translations:** edit `assets/i18n.js`; each entry is keyed by its English text
- **Images:** replace files in `assets/products/` or `application/img/`, keeping the same names
- **Enquiry form:** submissions go through [FormSubmit](https://formsubmit.co) to the office email; the first submission sends a one-time confirmation link to that inbox

Brand names belong to their owners; spares are equivalent replacements.
