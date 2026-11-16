-- Ay Yıldız: Hedef Kızıl Elma — içe aktarılan modellerin bulut yedeği (V2.53)
-- Supabase → SQL Editor → New query → bu dosyanın tamamını yapıştır → Run. Tekrar çalıştırmak güvenlidir.
-- Giriş yapan oyuncunun Model Kütüphanesi'nde içe aktardığı modeller özel 'models' deposunda, kendi klasöründe
-- (<oyuncu kimliği>/<uçak>.glb ve .json) durur. Herkes yalnız KENDİ klasörünü görebilir, yazabilir ve silebilir.
insert into storage.buckets (id, name, public, file_size_limit)
values ('models', 'models', false, 47185920)            -- 45 MB
on conflict (id) do update set public = false, file_size_limit = 47185920;

drop policy if exists "model okuma" on storage.objects;
create policy "model okuma" on storage.objects for select to authenticated
  using (bucket_id = 'models' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "model yükleme" on storage.objects;
create policy "model yükleme" on storage.objects for insert to authenticated
  with check (bucket_id = 'models' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "model değiştirme" on storage.objects;
create policy "model değiştirme" on storage.objects for update to authenticated
  using (bucket_id = 'models' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'models' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "model silme" on storage.objects;
create policy "model silme" on storage.objects for delete to authenticated
  using (bucket_id = 'models' and (storage.foldername(name))[1] = auth.uid()::text);
