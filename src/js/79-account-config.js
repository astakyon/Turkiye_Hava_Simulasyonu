/* ------------------------------------------------------------------ cloud account configuration (Supabase)
   Fill in the project URL and the *anon public* key (Project Settings → API) to turn on accounts for every player.
   Both are meant to be public; the database rules in supabase/schema.sql do the protecting. Never put the service_role key here.
   Left empty, the game runs in guest mode; a device can still connect from Ayarlar → Arayüz → Gelişmiş → Bulut bağlantısı. */
const ACCOUNT_CFG={url:'https://dmxglgkunafjxscwyffp.supabase.co', key:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRteGdsZ2t1bmFmanhzY3d5ZmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3NDIxNDMsImV4cCI6MjEwNzMxODE0M30.julbly2HXpHFowUAb-kmFZ7EmuXSS-fpQt_rABGEo5U'};
