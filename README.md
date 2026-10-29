# Ay Yıldız: Hedef Kızıl Elma

Türk hava, kara ve deniz sistemleriyle uçuş, sürüş ve muharebe oyunu. Telefonda (yatay) ve bilgisayarda tarayıcıdan oynanır; kurulum gerekmez. Ana ekrana uygulama olarak eklenebilir ve ilk açılıştan sonra çevrimdışı da çalışır. Android (Play Store) sürümü planlı.

Gruplar: **Hilal Kanatlar** (hava sistemleri) · **Mavi Kanatlar** (deniz) · **Bozkurtlar** (kara)

**Güncel sürüm:** bkz. [VERSION](VERSION) · değişiklikler [CHANGELOG.md](CHANGELOG.md) · dönem özetleri [docs/SURUM-GECMISI.md](docs/SURUM-GECMISI.md)

## Oyunda neler var
- **10 uçak ve İHA:** KAAN, ANKA-3, Hürjet, Hürkuş, ANKA, Aksungur, Kızılelma, Bayraktar TB2, TB3, Akıncı; ayrıca helikopterler (T129 ATAK, T625 Gökbey), tanklar ve zırhlılar, arabalar, hücumbot, korvet ve TCG Anadolu.
- **30 km'lik bir ada:** hava, deniz ve kara üsleri, İHA ve test merkezi, şehirler, köyler, marina, Kızıl Bölge; gün saati, hava durumu, canlı trafik ve yayalar.
- **Modlar:** Hızlı Oyun (her şey açık; Hızlı Savaş, serbest uçuş, hızlı görev, üssü gez), Kariyer (rütbeler, uçuş okulu, ehliyet ve sertifikalar, Harekât: Kızıl Elma), Çok Oyunculu (4 kişiye kadar, P2P).
- **Muharebe:** top, bomba, güdümlü füze, hedef kilidi, flare, hava savunma, kanat adamı ve emirleri, hasar ve yakıt.
- **Kontroller:** dokunmatik (düzenlenebilir), klavye ve fare, oyun kolu, telefonu eğerek uçuş.
- **Araçlar:** Rehber, görev editörü, tekrar izleme ve fotoğraf modu, Sistem Envanteri (gerçek veriler), Sorun giderme (performans testi, görüntü testi, tanılama).

Bütün özelliklerin listesi: [docs/OZELLIKLER.md](docs/OZELLIKLER.md) · oyuncu rehberi: [docs/OYUNCU-REHBERI.md](docs/OYUNCU-REHBERI.md)

## Oynamak
- Çevrimiçi adres: https://astakyon.github.io/Turkiye_Hava_Simulasyonu/
- Yerelde: `index.html` dosyasını tarayıcıda aç ya da `python3 -m http.server 8000` → http://localhost:8000. three.js internetten yüklenemezse `vendor/` klasöründeki kopya kullanılır.

**Çevrimiçi oynama:**
1. Oyunu GitHub Pages adresinden aç; claude.ai önizlemesi dış bağlantıları engelleyebilir.
2. Bir kişi *Çok Oyunculu → Oda kur* der ve çıkan 5 harfli kodu paylaşır.
3. Diğerleri *Odaya katıl*'a kodu yazar ya da `.../?oda=KOD` bağlantısını açar.

Eşleştirme ücretsiz PeerJS sunucusuyla yapılır; oyun verisi doğrudan oyuncular arasında akar. Bazı kurumsal ve okul ağları WebRTC'yi engelleyebilir.

## Geliştirme
Kaynak `src/` altında konu klasörlerine bölünmüş: `cekirdek`, `dunya`, `modeller`, `ucus`, `savas`, `gorev`, `ekran`, `kontrol`, `ses`, `yuruyus`, `ag`, `performans`, `veri`. Yükleme sırası `src/js/SIRA.txt` dosyasında; `index.html` bunlardan üretilir.
```
python3 tools/build.py      # src/ → index.html
node tests/paralel.js       # bütün testler, bütün çekirdeklerde (~2 dk); tek tek: sh tests/run.sh
node tools/browser-check.js # gerçek tarayıcıda denetim ve bütçe kapısı (Playwright + Chromium)
tools/release.sh V2.xx "başlık" notlar.md "commit mesajı"   # sürüm, notlar, derleme, denetim, testler, commit, push
```
Üretilen belgeler (yayın betiği her sürümde yeniler):
- `tools/ozellikler.py` → [docs/OZELLIKLER.md](docs/OZELLIKLER.md), [docs/OYUNCU-REHBERI.md](docs/OYUNCU-REHBERI.md) ve oyundaki Rehber
- `tools/metinler.py` → [docs/TERIMLER.md](docs/TERIMLER.md) (terim sözlüğü ve yazım denetimi)
- `tools/surumler.py` → [docs/SURUM-GECMISI.md](docs/SURUM-GECMISI.md)
- `tools/relnotes.py` → oyundaki sürüm notları

**Belgeler:**
- [docs/MIMARI.md](docs/MIMARI.md): modüller, kanca sistemi, girdi, kayıt, performans, yayın hattı
- [docs/MODEL-EKLEME.md](docs/MODEL-EKLEME.md) ve [docs/MODELLER.md](docs/MODELLER.md): yeni araç ve 3B model ekleme
- [docs/ANDROID.md](docs/ANDROID.md): Android yolu
- [docs/KARAR-THREEJS.md](docs/KARAR-THREEJS.md): three.js sürümü kararı
- [ROADMAP.md](ROADMAP.md): tek yol haritası

## GitHub Pages ile yayınlama
1. Depo: `astakyon/Turkiye_Hava_Simulasyonu`, dal: `main`; `index.html` kökte.
2. **Settings → Pages → Source: GitHub Actions.** `.github/workflows/pages.yml` her `main` push'unda testleri çalıştırıp yayınlar. Actions istemezsen *Deploy from a branch → main / (root)* de çalışır; `.nojekyll` hazır.
3. `VERSION` değişip `main`'e gönderilince **Releases** kaydı otomatik açılır (`.github/workflows/release.yml`); notlar CHANGELOG'dan alınır.

## Yasal not
Bu bir hayran/eğitim projesidir. TUSAŞ, Baykar veya başka bir kurumla bağlantısı, onayı ya da sponsorluğu yoktur. Uçak adları yalnızca tanıtım amaçlı kullanılır; modeller stilize, uçuş değerleri yaklaşıktır ve gerçek verileri yansıtmaz. Üçüncü taraf bileşenler: [THIRD_PARTY.md](THIRD_PARTY.md).

**Veri kaynağı:** Oyun içi *Sistem Envanteri*'ndeki bilgiler (sistem adı, kategori, üretici, durum, konfigürasyonlar, kullanıcı ülkeler, teknik özellikler) [Defence Turk · Sistem Envanteri](https://www.defenceturk.tr/tr/sistem-envanteri) kaynağından alınmıştır (açık kaynak bilgiler, Ekim 2026). Açıklama metinleri ve görseller alınmamıştır. Veriyi yenilemek için: `python3 tools/dt_import.py ham.json`.
Lisans: henüz seçilmedi (bkz. aşağıdaki not).

> **Lisans notu:** Lisans eklenmezse kod varsayılan olarak "tüm hakları saklıdır" sayılır ve başkaları kullanamaz/fork'layıp değiştiremez. Açık kaynak istiyorsan `LICENSE` ekle (ör. MIT).
