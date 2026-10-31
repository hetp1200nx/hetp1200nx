# Mechvac employee pages

Personal intro pages for the sales and application team at **Mechvac Technologies Pvt. Ltd.**, Vadodara (VacSolutë group). Every employee gets the same design, with their own name, role, contacts, products and text, managed from one admin page.

**Live:** [het-patel.work.gd](https://het-patel.work.gd/) · Admin: [/admin/](https://het-patel.work.gd/admin/)

Pages show company contact details only (office phone, office email, office WhatsApp), never personal numbers.

## How it works

| Part | What it does |
| --- | --- |
| **Home** (`index.html`) | About, experience, skills, group companies deck, products deck with overviews, spares, brochures, contact and visiting cards |
| **Applications** (`application/`) | Industrial vacuum applications with industry filters and details |
| **Enquiry** (`inquiry/`) | Spares enquiry form, sent to the email set for that person |
| **Admin** (`admin/`) | Sign in, add or remove employees, publish or unpublish, edit everything, upload images and PDFs |

Each person’s page is `het-patel.work.gd/?u=<page-link>`, for example `?u=het-patel`. The main address shows the person (or the team directory) chosen in the admin.

Data lives in **Supabase**: an `employees` table with each page’s content as JSON, a `settings` table, and a `media` storage bucket. Row-level security lets anyone read published pages, while only emails listed in the `admins` table can write.

### Features
- Swipeable card decks for group companies and products; tap a product for its overview
- English, Hindi and Gujarati on every page
- Floating WhatsApp and enquiry buttons
- **Save contact** vCard built from each person’s details, and flip visiting cards
- Brochure downloads, light and dark themes, reduced motion support

## Setup

See **[SETUP.md](SETUP.md)**: create a Supabase project, run `supabase/schema.sql` and `supabase/seed.sql`, add the admin user, and fill in `assets/config.js`. Until then the site runs in demo mode with the built-in content.

## Repository layout

```
index.html, application/, inquiry/   Public pages (render from data)
admin/                               Admin page
assets/
  config.js        Supabase URL, anon key, admin email
  store.js         Loads a page's data (Supabase or built-in defaults)
  defaults.js      Built-in template content (generated)
  home.js, applications.js, inquiry.js, thanks.js   Page renderers
  admin.js, admin-schema.js, admin.css             Admin editor
  site.js, i18n.js Language switch, floating buttons, translations
supabase/          schema.sql (tables and security), seed.sql (first page)
tools/             build-defaults.mjs regenerates defaults.js and seed.sql
downloads/         Brochure PDFs
```

Plain static HTML, CSS and JavaScript on GitHub Pages; no build step is needed to deploy.

---

Brand names belong to their respective owners. Spares are equivalent replacements made to the OEM part and position number.
