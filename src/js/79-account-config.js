/* ------------------------------------------------------------------ cloud account configuration (Supabase)
   Fill in the project URL and the *anon public* key (Project Settings → API) to turn on accounts for every player.
   Both are meant to be public; the database rules in supabase/schema.sql do the protecting. Never put the service_role key here.
   Left empty, the game runs in guest mode; a device can still connect from Ayarlar → Arayüz → Gelişmiş → Bulut bağlantısı. */
const ACCOUNT_CFG={url:'', key:''};
