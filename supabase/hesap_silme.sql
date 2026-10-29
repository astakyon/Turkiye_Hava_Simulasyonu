-- Ay Yıldız: Hedef Kızıl Elma — oyuncunun kendi hesabını silmesi (V2.52, Google Play şartı)
-- Supabase → SQL Editor → New query → bu dosyanın tamamını yapıştır → Run. Tekrar çalıştırmak güvenlidir.
-- Oyunda Profil → Hesap → "Hesabımı sil" bu işlevi çağırır. Yalnız giriş yapmış oyuncu, yalnız KENDİ hesabını silebilir:
-- auth.users satırı silinir; profiles ve saves tabloları "on delete cascade" ile birlikte silinir.
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'giriş gerekli'; end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
