# Android paketi

> **V2.52:** Google Play'e yükleme için adım adım rehber, mağaza metinleri ve görseller: [PLAY-STORE.md](PLAY-STORE.md). İmzalı paket artık GitHub Actions'ta **Android paketi (Play Store)** iş akışıyla üretiliyor; bilgisayara Android araçları kurmak gerekmiyor.

Oyun zaten bir **PWA** (çevrimdışı çalışan web uygulaması): `manifest.webmanifest` + `sw.js`. Telefonda Chrome ile
GitHub Pages adresini açıp **⋮ → Ana ekrana ekle** dersen tam ekran, yatay ve çevrimdışı çalışır. Google Play için iki yol var:

## 1. TWA (Trusted Web Activity) — önerilen, en hafif yol

Uygulama, Pages'teki oyunu tam ekran Chrome motoruyla açan küçük bir Android kabuğudur; oyun güncellenince uygulamayı
yeniden yüklemek gerekmez.

1. Bilgisayara Node.js 18+ ve JDK 17 kur.
2. `npm i -g @bubblewrap/cli`
3. Depodaki hazır ayar dosyasını kullan: boş bir klasöre `twa-manifest.json` dosyasını kopyala ve orada
   `bubblewrap update` çalıştır (ya da sıfırdan: `bubblewrap init --manifest https://astakyon.github.io/Turkiye_Hava_Simulasyonu/manifest.webmanifest`).
   - Paket adı `tr.ayyildiz.hedefkizilelma`, yön yatay, tam ekran, kısayollar (Hızlı Oyun · Harekât · Görevler) ve
     uyarlanabilir / tek renkli simgeler dosyada hazır.
   - İlk derlemede sorulan imza anahtarını (`android.keystore`) oluştur ve **yedekle** (kaybolursa Play'de güncelleme yapılamaz).
4. `bubblewrap build` → `app-release-signed.apk` ve `app-release-bundle.aab` oluşur.
5. **Digital Asset Links:** adres çubuğunun gizlenmesi için alan adının kökünde
   `/.well-known/assetlinks.json` gerekir. Proje sayfası (`astakyon.github.io/Turkiye_Hava_Simulasyonu`) kök değildir;
   bu dosya `astakyon.github.io` adlı **kullanıcı sitesi deposunun** köküne konur (ya da kendi alan adına geçilir).
   İçeriği `bubblewrap fingerprint` komutu üretir.
6. Play Console'da yeni uygulama → `.aab` dosyasını yükle → içerik derecelendirmesi, ekran görüntüleri ve
   gizlilik politikası adresi: `https://astakyon.github.io/Turkiye_Hava_Simulasyonu/privacy.html`.

## 2. Capacitor — çevrimdışı tam paket

Oyunun `index.html` dosyası uygulamanın içine gömülür (internet olmadan da açılır, ama her sürümde yeni APK gerekir).

```bash
npm init -y && npm i @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Ay Yıldız" tr.ayyildiz.hedefkizilelma --web-dir=www
mkdir www && cp index.html manifest.webmanifest icon-*.png sw.js www/ && cp -r vendor www/
npx cap add android && npx cap open android   # Android Studio'da Build → Generate Signed Bundle
```

`android/app/src/main/AndroidManifest.xml` içinde `android:screenOrientation="sensorLandscape"` ve
`android:configChanges` satırına `orientation|screenSize` eklenmeli.

## Telefon özellikleri (V1.90)

- **Eğerek uç:** Ayarlar → Kontroller → *Eğerek uç*; *Sıfırla* düğmesi o anki tutuşu düz uçuş kabul eder. iPhone ilk açılışta
  hareket sensörü izni ister.
- **Titreşim:** Ayarlar → Erişilebilirlik → *Kumanda titreşimi* (Android; iPhone tarayıcıları titreşim API'sini desteklemez).
- **Kayıt yedeği:** Ayarlar → Kontroller → *Kayıt yedeği*. Dosyaya indir ya da kodu kopyala; diğer cihazda *Dosyadan yükle* /
  *Kodu yükle*. Hesap açanların ilerlemesi zaten bulutta saklanır. İçe aktarılan 3B modeller (cihazdaki model kütüphanesi)
  yedeğe dahil değildir; onları model kütüphanesinden `.glb` olarak indir.

## Simge ve kısayollar (V2.01)

- `icon.svg` kaynak çizimden üretilir: `icon-192.png`, `icon-512.png` (her yerde), `icons/icon-maskable-*.png`
  (Android'in yuvarlak / damla / kare maskeleri için güvenli alanda çizim), `icons/icon-mono-512.png` (Android 13+ temalı
  simge), `icons/icon-48…384.png`.
- Ana ekran simgesine uzun basınca: **Hızlı Oyun**, **Harekât**, **Görevler** kısayolları.
- Oyun tarayıcıda açıkken ana menüdeki ⬇ düğmesi uygulamayı yükler (Android Chrome, bilgisayarda Chrome / Edge). iPhone'da
  Paylaş → Ana Ekrana Ekle yolunu gösterir.
