# Setup: Supabase and the admin page

The site works in two modes:

- **Demo mode:** `assets/config.js` is empty. Every page shows the built-in content from `assets/defaults.js`, and the admin page shows these setup steps.
- **Live mode:** `assets/config.js` points at a Supabase project. Employee pages, settings and uploaded images are stored there and edited from `/admin/`.

Setup takes about 10 minutes.

## 1. Create the Supabase project

1. Sign in at [supabase.com](https://supabase.com) and click **New project**. The free plan is enough.
2. Choose a name (for example `mechvac-pages`), a database password (keep it safe, it is not used by the site) and the region closest to you (for example *Mumbai*).

## 2. Create the database

1. Open **SQL Editor → New query**.
2. Paste the whole of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**. It creates the tables, security rules and the `media` storage bucket. You can run it again safely.
3. Open [`supabase/seed.sql`](supabase/seed.sql), replace `change-me@example.com` with the email you will use for the admin (step 3), paste it into a new query and click **Run**.

## 3. Create the admin login

1. Open **Authentication → Users → Add user → Create new user**.
2. Email: the same admin email you put in `seed.sql`. Password: `Admin@123`. Tick **Auto Confirm User**.
3. Open **Authentication → Sign In / Providers** and turn off **Allow new users to sign up**. Only the accounts you add here can sign in, and only emails in the `admins` table can change anything.

> `Admin@123` is easy to guess. Change it later in **Authentication → Users → … → Change password**. To add another admin, create their user here and run
> `insert into public.admins (email) values ('their@email.com');`

## 4. Connect the site

1. Open **Project Settings → API** (or **Data API / API Keys**).
2. Copy the **Project URL** and the **anon / publishable** key.
3. Edit `assets/config.js`:

```js
window.SITE_CONFIG = {
  supabaseUrl: 'https://xxxxxxxx.supabase.co',
  supabaseAnonKey: 'eyJhbGciOi...',
  adminEmail: 'the-admin-email@yourcompany.com',
  siteUrl: 'https://het-patel.work.gd',
};
```

The anon key is meant to be public; the security rules protect the data. **Never** put the `service_role` / secret key in this file.

4. Commit. GitHub Pages updates in a minute or two.

## 5. Use it

Open `https://het-patel.work.gd/admin/` and sign in with username **Admin** and password **Admin@123** (you can also type the full email).

The first time, the list is empty: press **Create Het Patel's page from the built-in content**. It adds the current page, published, as the home page.

- **Add employee:** name, role and page link (`ravi-kumar` → `het-patel.work.gd/?u=ravi-kumar`). Copy from an existing page so the products and text come along. New pages start as drafts.
- **Edit:** every text on the page, the company contact details, where the enquiry form is sent, products, spares, group companies, brochures, visiting cards, the Applications and Enquiry pages. Upload images and PDFs directly.
- **Preview** a draft while signed in; visitors see “Page not found” until you **publish**.
- **Home page:** choose which person the main address shows, or a team directory.

### Notes

- **Enquiry emails** use [FormSubmit](https://formsubmit.co). The first enquiry sent to a new address triggers a one-time activation email to that address; click the link in it.
- **Translations:** built-in text is translated to Hindi and Gujarati. When you change the English text of a product or application, its translations are removed and the English shows in every language.
- **Backups:** the editor’s *Advanced* tab can download any page as JSON and load it back.
