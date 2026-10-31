# Het Patel · Industrial Vacuum

Personal site of **Het Patel**, Sales & Application Engineer at **Mechvac Technologies Pvt. Ltd.**, Vadodara (VacSolutë group).

**Live:** [het-patel.work.gd](https://het-patel.work.gd/)

I help process plants choose, maintain and source parts for their vacuum pumps. The site introduces my work, the products I supply, and a quick way to send a spares enquiry.

## What's on the site

| Page | What it does |
| --- | --- |
| **Home** (`index.html`) | About, experience, skills, the VacSolutë group companies, products, spares, brochures and contact |
| **Applications** (`application/`) | 14 industrial vacuum applications with vacuum range, typical pumps, common problems and the spares that fix them |
| **Enquiry** (`inquiry/`) | Spares enquiry form with nameplate photo upload, sent to my office email. Also sends the same details on WhatsApp |

### Products covered
- VacSolutë vacuum pump spares, for any brand: Busch, Leybold, Edwards, Toshniwal, Atlas Copco, Becker, Pfeiffer and more
- Oil-sealed rotary vane vacuum pumps (MT series)
- Dry rotary vane vacuum pumps (MTD series)
- Double-stage rotary vane vacuum pumps (RD series)
- Interceptor Series dry reciprocating vacuum pumps, for highly corrosive chemical and pharma duty
- Dry screw vacuum pumps (Alesol)
- Dry claw vacuum pumps
- Engineered vacuum systems with custom condensing systems

### Features
- Swipeable card decks for the group companies and products. Tap a product to open its full overview
- English, Hindi and Gujarati, switchable on every page
- Floating WhatsApp and enquiry buttons
- One-tap **Save contact** (vCard) and a flippable business card
- Brochure downloads
- Light and dark themes, and reduced motion for visitors who turn it on in their settings
- Each product has its own link, for example `het-patel.work.gd/#p-interceptor`, and each application too, for example `het-patel.work.gd/application/#transformer`

## Repository layout

```
index.html              Home page
application/            Applications page and its illustrations (img/)
inquiry/                Enquiry form and thank-you page
assets/
  site.css, site.js     Shared styles and behaviour (language switch, floating buttons)
  i18n.js               Hindi and Gujarati text
  products-data.js      Product overview content
  group/, products/     Product and group images
downloads/              Brochure PDFs and cover images
het-patel.vcf           Contact card for "Save contact"
card-front.jpg, card-back.jpg   Business card
Img.jpeg                Profile photo
```

It is a plain static site (HTML, CSS and JavaScript) with no build step. It is hosted on GitHub Pages with a custom domain.

## Updating

- **Text and sections:** edit `index.html`, `application/index.html` or `inquiry/index.html`.
- **Product overviews:** edit `assets/products-data.js`.
- **Translations:** edit `assets/i18n.js`. Each entry is keyed by its English text.
- **Images:** replace files in `assets/products/` or `application/img/`, keeping the same names.

Changes go live on GitHub Pages a minute or two after they are committed to `master`.

**Enquiry form:** submissions are delivered by [FormSubmit](https://formsubmit.co) to the office email. FormSubmit asks for a one-time confirmation by email the first time the form is used.

## Contact

- Office: +91 95580 08035
- Email: Het.patel@mechvactech.com
- LinkedIn: [in/het-patel-81b8071b4](https://www.linkedin.com/in/het-patel-81b8071b4)
- Company: [mechvactech.com](https://www.mechvactech.com)

---

Brand names belong to their respective owners. Spares are equivalent replacements made to the OEM part and position number.
