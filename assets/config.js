/* Site configuration.
   Fill in the two Supabase values from: Supabase Dashboard -> Project Settings -> API.
   The anon key is designed to be public; never put the service_role key here.
   Until these are filled in, every page shows the built-in default content (demo mode). */
window.SITE_CONFIG = {
  supabaseUrl: 'https://ictxizxvekruqijoeovk.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljdHhpenh2ZWtydXFpam9lb3ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0NTQ5NzIsImV4cCI6MjEwOTAzMDk3Mn0.xUGDegbhpcr6sUeuYFudMhe4D8bvbgBl64KbmcDdntc',

  // The admin page accepts the username "Admin" and signs in with this email behind the scenes.
  adminEmail: 'het.patel@mechvactech.com',

  // Public address of the site, used for links in enquiry emails and link previews.
  siteUrl: 'https://het-patel.work.gd',
};
