-- Ay Yıldız: Hedef Kızıl Elma — performans testi raporları (V2.12)
-- Supabase → SQL Editor → bu dosyanın tamamını yapıştır → Run. Bir kez çalıştırmak yeter (tekrar çalıştırmak zararsız).
-- Oyuncular raporu anonim olarak ekleyebilir (giriş gerekmez); raporları yalnız yöneticiler okuyabilir ve silebilir.
create table if not exists public.perf_reports(
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  version text,
  device text,
  gpu text,
  summary jsonb,
  data jsonb not null
);
alter table public.perf_reports enable row level security;
drop policy if exists "performans raporu ekleme" on public.perf_reports;
create policy "performans raporu ekleme" on public.perf_reports for insert to anon, authenticated
  with check (pg_column_size(data) < 200000 and coalesce(length(device),0) < 200 and coalesce(length(gpu),0) < 200);
drop policy if exists "performans raporu okuma" on public.perf_reports;
create policy "performans raporu okuma" on public.perf_reports for select to authenticated using (public.is_admin());
drop policy if exists "performans raporu silme" on public.perf_reports;
create policy "performans raporu silme" on public.perf_reports for delete to authenticated using (public.is_admin());
