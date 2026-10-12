# Android paketi (hazırlık)

Oyun zaten bir **PWA** (çevrimdışı çalışan web uygulaması): `manifest.webmanifest` + `sw.js`. Telefonda Chrome ile
GitHub Pages adresini açıp **⋮ → Ana ekrana ekle** dersen tam ekran, yatay ve çevrimdışı çalışır. Google Play için iki yol var:

## 1. TWA (Trusted Web Activity) — önerilen, en hafif yol

Uygulama, Pages'teki oyunu tam ekran Chrome motoruyla açan küçük bir Android kabuğudur; oyun güncellenince uygulamayı
yeniden yüklemek gerekmez.

1. Bilgisayara Node.js 18+ ve JDK 17 kur.
2. `npm i -g @bubblewrap/cli`
3. `bubblewrap init --manifest https://astakyon.github.io/Turkiye_Hava_Simulasyonu/manifest.webmanifest`
   - Paket adı: `tr.ayyildiz.hedefkizilelma` (örnek) · Uygulama adı: *Ay Yıldız: Hedef Kızıl Elma* · Yön: yatay.
   - Sorulan imza anahtarını oluştur ve **yedekle** (kaybolursa Play'de güncelleme yapılamaz).
4. `bubblewrap build` → `app-release-signed.apk` ve `app-release-bundle.aab` oluşur.
5. **Digital Asset Links:** adres çubuğunun gizlenmesi için alan adının kökünde
   `/.well-known/assetlinks.json` gerekir. Proje sayfası (`astakyon.github.io/Turkiye_Hava_Simulasyonu`) kök değildir;
   bu dosya `astakyon.github.io` adlı **kullanıcı sitesi deposunun** köküne konur (ya da kendi alan adına geçilir).
   İçeriği `bubblewrap fingerprint` komutu üretir.
6. Play Console'da yeni uygulama → `.aab` dosyasını yükle → içerik derecelendirmesi, gizlilik politikası (oyun kişisel veri
   toplamıyor; hesap açanlar için Supabase), ekran görüntüleri.

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
