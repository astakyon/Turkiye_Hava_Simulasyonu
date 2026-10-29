# Google Play'e yükleme rehberi (V2.52)

Oyun Google Play'e **TWA** (Trusted Web Activity) olarak çıkar: küçük bir Android kabuğu, GitHub Pages'teki oyunu tam ekran
açar. Oyun her güncellendiğinde uygulama da kendiliğinden güncellenir; Play'e yeni paket yüklemek yalnız uygulama kabuğu
(simge, ad, sürüm) değişince gerekir.

Hazır olanlar:

| Ne | Nerede |
|---|---|
| Android paketi üreten iş akışı | GitHub → Actions → **Android paketi (Play Store)** (`.github/workflows/android.yml`) |
| Uygulama ayarları (paket adı, yatay tam ekran, simgeler, kısayollar) | `twa-manifest.json` |
| Mağaza görselleri | `docs/play-store/` (öne çıkan görsel 1024×500, 5 ekran görüntüsü 1600×900) |
| Gizlilik politikası | https://astakyon.github.io/Turkiye_Hava_Simulasyonu/privacy.html |
| Hesap silme (Play şartı) | Oyunda Profil → Hesap → **Hesabımı sil** · web: `privacy.html#hesap-silme` · sunucu: `supabase/hesap_silme.sql` |

Senin yapman gerekenler aşağıda. Geliştirici hesabını açmak, ödeme, kimlik doğrulama ve Play Console'daki gönderimler
senin hesabınla yapılır.

## 1. Google Play geliştirici hesabı

1. https://play.google.com/console → Google hesabınla gir → **Kişisel** hesap.
2. Tek seferlik kayıt ücretini öde (25 ABD doları) ve kimlik doğrulamasını tamamla (birkaç gün sürebilir).
3. **Önemli:** yeni kişisel hesaplarda uygulama doğrudan herkese açılamaz. Önce **kapalı test**: en az **12 test kullanıcısı**
   uygulamayı **14 gün** boyunca yüklü tutmalı. Sonra Play Console'dan üretime geçiş başvurusu yapılır. Test kullanıcılarını
   (arkadaşlar, aile) şimdiden belirle; Gmail adresleri gerekecek.

## 2. İmza anahtarı (bir kez)

Paketin imza anahtarı **yükleme anahtarıdır**; Google, uygulamayı kendi anahtarıyla yeniden imzalar (Play App Signing).
Anahtarı kendi bilgisayarında üret ve **yedekle**:

```bash
keytool -genkeypair -keystore android.keystore -alias ayyildiz -keyalg RSA -keysize 2048 -validity 10000
# şifre sorar; ad-soyad alanına "Ay Yildiz" yazman yeterli
base64 -w0 android.keystore > keystore.txt     # macOS: base64 -i android.keystore -o keystore.txt
```

GitHub → depo → **Settings → Secrets and variables → Actions → New repository secret**:

| Ad | Değer |
|---|---|
| `ANDROID_KEYSTORE_B64` | `keystore.txt` dosyasının içeriği |
| `ANDROID_KEYSTORE_PASSWORD` | anahtar deposu şifresi |
| `ANDROID_KEY_PASSWORD` | anahtar şifresi (genelde aynı) |

> Secrets eklenmeden iş akışı yine çalışır ama geçici bir **deneme anahtarı** kullanır: çıkan `.apk` telefonda denenebilir,
> Play'e yüklenemez. `android.keystore` ve şifreyi asla depoya koyma.

## 3. Paketi üret

GitHub → **Actions → Android paketi (Play Store) → Run workflow**. 2–3 dakika sonra işin sayfasında **Artifacts →
android-paket-play** (Secrets yoksa `android-paket-deneme`) indir. İçinde:

- `app-release-bundle.aab`: Play'e yüklenecek dosya
- `app-release-signed.apk`: telefona doğrudan kurup denemek için
- `assetlinks-yukleme-anahtari.json`: adım 5 için
- `twa-manifest.json`: sürüm adı ve kodu `VERSION` dosyasından gelir (V2.52 → 2.52 / 252)

Her yeni Play paketinde sürüm kodu artmalı. Bu yüzden paketi yeni bir oyun sürümü yayınlandıktan sonra üret.

## 4. Play Console'da uygulama

**Uygulama oluştur:** ad *Ay Yıldız: Hedef Kızıl Elma*, varsayılan dil Türkçe, **Oyun**, **Ücretsiz**.

**Mağaza girişi**:

- **Kısa açıklama** (80 karakter):
  `KAAN, Hürjet, Bayraktar, ANKA-3 ile uç; Altay, ATAK, TCG Anadolu ile savaş.`
- **Tam açıklama**:

```
Ay Yıldız: Hedef Kızıl Elma, Türk hava, kara ve deniz sistemleriyle oynanan bir uçuş ve harekât oyunu.

UÇ
• TUSAŞ KAAN, Hürjet, Hürkuş, ANKA, ANKA-3, Aksungur; Baykar Bayraktar TB2, TB3, Akıncı ve Kızılelma.
• Her uçak gerçek boyutlarıyla, ayrıntılı modeliyle ve gerçek Türk mühimmatıyla: GÖKDOĞAN, BOZDOĞAN, SOM-J,
  MAM-L, MAM-C, TEBER-82, LUMTAS… İç silah yuvaları atışta açılır, TB3'ün kanatları katlanır.
• Kalkış, iniş, havada ikmal, akrobasi, gece uçuşu, değişen hava.

SAVAŞ VE GÖREV
• Harekât: Kızıl Elma hikâyeli kampanyası, kariyer ve rütbeler.
• Hızlı oyun, görev panosu, görev editörü, yarışlar.
• Çok oyunculu: arkadaşlarınla aynı gökyüzünde, bas-konuş sesli sohbet.

KARADA VE DENİZDE
• T129 ATAK ve T625 GÖKBEY helikopterleri; Altay, Fırtına, Pars, Kirpi, Korkut, Hisar.
• TCG Anadolu, Ada korveti, İstif fırkateyni, hücumbotlar; araçları sür, gemileri yönet.

TELEFONA UYGUN
• Dokunmatik kumanda ya da eğerek uçuş, titreşim, otomatik grafik ayarı.
• İnternetsiz de oynanır. Reklam yok, uygulama içi satın alma yok.

Model Kütüphanesi'nde bütün araçları 3B olarak incele. Sistem bilgileri Defence Turk Sistem Envanteri'nden atıfla alınmıştır.
Bu oyun hobi amaçlı, bağımsız bir projedir; adı geçen şirketlerle resmî bir bağı yoktur.
```

- **Uygulama simgesi:** `icon-512.png`
- **Öne çıkan görsel:** `docs/play-store/feature-graphic-1024x500.png`
- **Telefon ekran görüntüleri:** `docs/play-store/ekran-1.png … ekran-5.png` (en az 2)
- **Kategori:** Oyun → Simülasyon. **Etiketler:** Uçuş simülasyonu, Askerî.
- **İletişim:** bir e-posta adresi ister (Play'de görünür; istersen ayrı bir adres aç).

## 5. Adres çubuğunu gizlemek (Digital Asset Links)

Bu adım yapılmazsa uygulama yine çalışır, ama üstte ince bir tarayıcı adres çubuğu görünür.

1. Play Console → uygulama → **Test et ve yayınla → Uygulama bütünlüğü → Uygulama imzalama**: **Uygulama imzalama
   anahtarı sertifikası** altındaki **SHA-256** değerini kopyala.
2. `assetlinks-yukleme-anahtari.json` dosyasını aç; `sha256_cert_fingerprints` listesine bu değeri de ekle
   (listede iki değer olsun: yükleme anahtarı ve Google'ın anahtarı).
3. Dosya alan adının **köküne** konmalı: `https://astakyon.github.io/.well-known/assetlinks.json`. Oyun bir *proje sayfası*
   olduğu için bu kök başka bir depodur:
   - GitHub'da **`astakyon.github.io`** adlı yeni, herkese açık bir depo aç.
   - İçine `.well-known/assetlinks.json` (adım 2'deki dosya) ve boş bir **`.nojekyll`** dosyası koy. `.nojekyll`
     olmazsa GitHub Pages noktayla başlayan klasörü yayınlamaz.
   - Depo ayarlarında Pages'i aç (main dalı, kök klasör).
4. Birkaç dakika sonra adresi tarayıcıda açıp dosyanın göründüğünü kontrol et. Uygulamayı telefonda kapatıp açınca adres
   çubuğu kaybolur.

## 6. Uygulama içeriği formları

Play Console → **Politika → Uygulama içeriği**:

- **Gizlilik politikası:** `https://astakyon.github.io/Turkiye_Hava_Simulasyonu/privacy.html`
- **Reklamlar:** Hayır, reklam içermiyor.
- **Uygulama erişimi:** Bütün işlevler kısıtlamasız (hesap isteğe bağlı, misafir olarak oynanır).
- **İçerik derecelendirmesi (IARC anketi):** kategori *Oyun*. Şiddet: gerçekçi olmayan askerî araç çatışması, insan
  karakter yok, kan yok. Kullanıcı etkileşimi: **Evet** (çok oyunculu sohbet ve sesli sohbet). Konum paylaşımı: Hayır.
  Dijital satın alma: Hayır. Beklenen sonuç: PEGI 7–12 / Herkes 10+.
- **Hedef kitle:** **13 yaş ve üstü** seç. Çok oyunculu sohbet olduğu için 13 yaş altını seçmek Aileler politikasının
  ek şartlarını getirir.
- **Veri güvenliği:**
  - Veri toplanıyor mu? **Evet** (yalnız hesap açanlar ve rapor gönderenler için). Aktarımda şifreleniyor mu? **Evet** (HTTPS).
    Kullanıcı silme isteyebilir mi? **Evet**, uygulama içinden ve `privacy.html#hesap-silme`.
  - **Kişisel bilgiler → E-posta adresi:** toplanır, isteğe bağlı. Amaç: hesap yönetimi.
  - **Kişisel bilgiler → Kullanıcı kimlikleri** (çağrı adı): toplanır, isteğe bağlı. Amaç: hesap yönetimi, uygulama işlevleri.
  - **Uygulama etkinliği → Oyun içi ilerleme** (rütbe, istatistik, kayıt): toplanır, isteğe bağlı. Amaç: uygulama işlevleri.
  - **Uygulama bilgileri ve performansı → Teşhis** (performans raporu): toplanır, isteğe bağlı, anonim. Amaç: analiz.
  - **Ses** (sesli sohbet): yalnız bas-konuş sırasında diğer oyunculara anlık iletilir, kaydedilmez. Formda
    *geçici olarak işleniyor* seçeneğini işaretle.
  - Üçüncü taraflarla paylaşım: **Yok**. Veriler Supabase (barındırma hizmeti) üzerinde tutulur. Barındırma hizmeti
    sağlayıcısı "paylaşım" sayılmaz.
- **Hesap silme:** web bağlantısı `https://astakyon.github.io/Turkiye_Hava_Simulasyonu/privacy.html#hesap-silme`.
  Supabase'te `supabase/hesap_silme.sql` dosyasını bir kez çalıştır (bkz. `supabase/KURULUM.md`, adım 6). Bunu yapmazsan
  oyundaki *Hesabımı sil* düğmesi çalışmaz, oyuncuyu bu sayfaya yönlendirir.
- **Devlet uygulaması / finans / sağlık:** Hayır. **Haber uygulaması:** Hayır.

## 7. Kapalı test → üretim

1. **Test et ve yayınla → Kapalı test → Kanal oluştur** → test kullanıcılarının e-posta listesini ekle.
2. **Yeni sürüm oluştur** → `app-release-bundle.aab` yükle → sürüm notu (CHANGELOG'dan kısa bir özet) → incelemeye gönder.
3. Testçiler katılım bağlantısıyla uygulamayı kurar. 12 kişi, 14 gün boyunca kurulu tutmalı.
4. 14 gün dolunca **Üretim erişimi için başvur** → sorulara kısa cevaplar (testçilerden ne öğrendin, neyi düzelttin).
5. Onaydan sonra **Üretim → Yeni sürüm** → aynı `.aab` (ya da yenisi) → yayınla.

## Sonraki sürümler

Oyun güncellemeleri (V2.53, V2.54…) Play'e yeni paket yüklemeden telefonlara gelir. Yeni paket yalnız `twa-manifest.json`
değişince (simge, ad, kısayol, en düşük Android sürümü) gerekir: Actions'ta iş akışını yeniden çalıştır, yeni `.aab`'yi
yükle.
