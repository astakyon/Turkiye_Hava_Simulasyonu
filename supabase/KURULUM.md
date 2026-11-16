# Bulut hesap kurulumu (Supabase)

Oyun, hesaplar ve kayıtlar için ücretsiz bir **Supabase** projesi kullanır.
Proje olmadan da oyun çalışır; bu durumda oyuncular **misafir** olarak oynar ve kayıtları yalnız kendi cihazlarında kalır.

## 1. Projeyi aç (5 dakika)
1. <https://supabase.com> → **Start your project** → GitHub ya da e-postayla üye ol.
2. **New project**:
   - İsim: `ay-yildiz`
   - Veritabanı parolası: güçlü bir parola (bir yere not et)
   - Bölge: **Central EU (Frankfurt)**
3. Proje hazır olunca **SQL Editor → New query** aç. Repodaki `supabase/schema.sql` dosyasının tamamını yapıştır ve **Run**'a bas.

## 2. Giriş yöntemleri
1. **Authentication → Providers → Email**: açık olsun.
   - İstersen *Confirm email* seçeneğini kapat; böylece oyuncular e-posta onayı beklemeden girer.
2. **Google** ile giriş (isteğe bağlı):
   - **Authentication → Providers → Google**'ı aç.
   - Google Cloud Console'da OAuth istemcisi oluştur.
   - Yönlendirme adresi olarak Supabase'in gösterdiği adresi kullan.
3. **Authentication → URL Configuration**:
   - Site URL: `https://astakyon.github.io/Turkiye_Hava_Simulasyonu/`
   - Redirect URLs: aynı adresi ekle.

## 3. Anahtarları oyuna ver
1. **Project Settings → API**:
   - **Project URL** (`https://xxxx.supabase.co`)
   - **anon public** anahtarı (bu anahtar herkese açık olacak şekilde tasarlanmıştır; güvenliği veritabanı kuralları sağlar)
2. İki yol var:
   - **Oyundan:** Ayarlar → Arayüz → *Gelişmiş* → **Bulut bağlantısı** satırına URL ve anahtarı yapıştır → **Bağlan**. Bu yalnız o cihazda geçerli olur.
   - **Herkes için:** iki değeri bana gönder, `src/js/ag/hesap-ayari.js` dosyasına yazayım.
     - **service_role** anahtarını asla paylaşma.

## 4. Kendini yönetici yap
1. Oyuna kendi hesabınla bir kez gir ve profilini oluştur.
2. **SQL Editor**'da `schema.sql`'in en altındaki satırı, kendi e-postanı yazarak çalıştır:
   ```sql
   update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'SENIN@EPOSTAN.com');
   ```
3. Oyunu yenile. Ana menüde **Yönetim** bölümü ve kütüphaneler görünür.

## 5. Performans raporları (V2.12)

Oyundaki **Ayarlar → Grafik → Performans testi** sonucunda oyuncular "Raporu gönder" diyebilir. Raporların kaydedilmesi için Supabase'te bir tablo gerekir:

1. Supabase → **SQL Editor** → **New query**.
2. `supabase/perf_reports.sql` dosyasının tamamını yapıştır → **Run**.

Raporlar anonimdir (cihaz, ekran kartı, grafik ayarları, ölçümler). Oyuncular yalnız ekleyebilir; okuma ve silme yalnız yöneticilere açıktır. Raporlar oyunda **Yönetim → Performans** sekmesinde listelenir. Tablo kurulmadan önce de test çalışır: sonuç cihazda saklanır ve "Kopyala" ile paylaşılabilir.

## 6. Hesap silme (V2.52, Google Play şartı)

Google Play, hesap açılan uygulamalarda oyuncunun hesabını **uygulamanın içinden** silebilmesini ister. Oyundaki **Profil → Hesap → Hesabımı sil** düğmesinin çalışması için:

1. Supabase → **SQL Editor** → **New query**.
2. `supabase/hesap_silme.sql` dosyasının tamamını yapıştır → **Run**.

İşlev yalnız giriş yapmış oyuncunun **kendi** hesabını siler; profil ve bulut kaydı birlikte silinir. İşlev kurulmadan önce düğme, oyuncuyu gizlilik sayfasındaki *Hesap silme* bölümüne yönlendirir.

## 7. Model yedeği ve sunucunun uyumaması (V2.53)

**Model yedeği:** Model Kütüphanesi'nde içe aktarılan modeller giriş yapan oyuncu için buluta da yedeklenir; tarayıcı verisi silinse bile yeniden giriş yapınca geri gelir.

1. Supabase → **SQL Editor** → **New query**.
2. `supabase/model_yedek.sql` dosyasının tamamını yapıştır → **Run**.

Her oyuncu yalnız kendi klasörünü görür. Bir model en çok 45 MB olabilir; daha büyükler yalnız cihazda kalır. Ücretsiz planda toplam depolama 1 GB'tır.

**Sunucunun uyumaması:** Ücretsiz Supabase projeleri bir hafta kullanılmayınca duraklatılır (oyunda giriş yaparken "Failed to fetch"). Depodaki **Bulut sunucusunu uyanık tut** iş akışı üç günde bir sunucudan tek satır okur. Kurulum gerekmez. Sunucu yanıt vermezse iş kırmızı olur ve GitHub sana e-posta gönderir; o zaman supabase.com → proje → **Restore project**. GitHub, depoda 60 gün hiç değişiklik olmazsa zamanlanmış işleri durdurur; Actions sekmesinden yeniden açılır.
