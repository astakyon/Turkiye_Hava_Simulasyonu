-- Ay Yıldız: Hedef Kızıl Elma — bulut hesap şeması (Supabase / PostgreSQL)
-- Supabase panelinde: SQL Editor → New query → bu dosyanın tamamını yapıştır → Run.
-- Tekrar çalıştırmak güvenlidir (var olanları atlar ya da günceller).

-- ---------- profiller: çağrı adı, birlik, arma, rol (oyuncu / yönetici), rütbe ve tecrübe
create table if not exists public.profiles(
  id uuid primary key references auth.users on delete cascade,
  callsign text not null check (char_length(callsign) between 2 and 20),
  unit text not null default 'hava' check (unit in ('hava','deniz','kara')),
  emblem text not null default 'hilal',
  role text not null default 'player' check (role in ('player','admin')),
  rank int not null default 0,
  xp int not null default 0,
  stats jsonb not null default '{}'::jsonb,
  banned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- ---------- oyuncu kayıtları: ayarlar, tuşlar, boyalar, mühimmat, rekorlar (tek JSON)
create table if not exists public.saves(
  user_id uuid primary key references auth.users on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
-- ---------- yöneticinin yayınladığı içerik: model, ses, müzik, boya (dosyalar 'content' deposunda)
create table if not exists public.content(
  id text primary key,
  kind text not null check (kind in ('model','sound','music','livery')),
  path text,
  meta jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users
);
-- ---------- duyurular (oyun açılışında görünür) ve yönetici işlem kaydı
create table if not exists public.announcements(
  id bigint generated always as identity primary key,
  text text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users
);
create table if not exists public.admin_log(
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  admin uuid references auth.users,
  action text not null,
  target text,
  detail jsonb
);

-- ---------- yönetici mi? (güvenlik kurallarında kullanılır)
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin' and not banned);
$$;

-- oyuncu kendi rolünü, yasak durumunu değiştiremez; rütbe yalnız yükselebilir ya da yönetici değiştirir
create or replace function public.profiles_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    new.role := old.role;
    new.banned := old.banned;
    if new.rank < old.rank then new.rank := old.rank; end if;
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard before update on public.profiles for each row execute function public.profiles_guard();

alter table public.profiles enable row level security;
alter table public.saves enable row level security;
alter table public.content enable row level security;
alter table public.announcements enable row level security;
alter table public.admin_log enable row level security;

drop policy if exists "profil okuma" on public.profiles;
create policy "profil okuma" on public.profiles for select using (true);
drop policy if exists "profil oluşturma" on public.profiles;
create policy "profil oluşturma" on public.profiles for insert to authenticated with check (id = auth.uid() and role = 'player' and not banned);
drop policy if exists "profil güncelleme" on public.profiles;
create policy "profil güncelleme" on public.profiles for update to authenticated using (id = auth.uid() or public.is_admin());

drop policy if exists "kayıt sahibi" on public.saves;
create policy "kayıt sahibi" on public.saves for all to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid());

drop policy if exists "içerik okuma" on public.content;
create policy "içerik okuma" on public.content for select using (true);
drop policy if exists "içerik yazma" on public.content;
create policy "içerik yazma" on public.content for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "duyuru okuma" on public.announcements;
create policy "duyuru okuma" on public.announcements for select using (active or public.is_admin());
drop policy if exists "duyuru yazma" on public.announcements;
create policy "duyuru yazma" on public.announcements for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "kayıt defteri" on public.admin_log;
create policy "kayıt defteri" on public.admin_log for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- dosya deposu: herkes okur, yalnız yönetici yazar
insert into storage.buckets(id, name, public) values ('content','content',true) on conflict (id) do nothing;
drop policy if exists "içerik dosyası okuma" on storage.objects;
create policy "içerik dosyası okuma" on storage.objects for select using (bucket_id = 'content');
drop policy if exists "içerik dosyası yazma" on storage.objects;
create policy "içerik dosyası yazma" on storage.objects for insert to authenticated with check (bucket_id = 'content' and public.is_admin());
drop policy if exists "içerik dosyası değiştirme" on storage.objects;
create policy "içerik dosyası değiştirme" on storage.objects for update to authenticated using (bucket_id = 'content' and public.is_admin());
drop policy if exists "içerik dosyası silme" on storage.objects;
create policy "içerik dosyası silme" on storage.objects for delete to authenticated using (bucket_id = 'content' and public.is_admin());

-- ---------- İLK YÖNETİCİ: oyuna kendi hesabınla bir kez giriş yap, profilini oluştur, sonra aşağıdaki satırda
-- e-posta adresini kendi adresinle değiştirip yalnız bu satırı çalıştır:
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'SENIN@EPOSTAN.com');
