# Ay Yıldız: Hedef Kızıl Elma

**Hilal Kanatlar** — Türk hava sistemleriyle uçuş ve hava muharebesi oyunu. Telefon (yatay) ve bilgisayarda tarayıcıdan oynanır; ileride Android uygulaması olarak da çıkacak.

Gruplar: **Hilal Kanatlar** (hava sistemleri) · **Mavi Kanatlar** (deniz, yakında) · **Kara sistemleri** (yakında)

Tek dosyalık (`index.html`) oyun; kurulum yok. Ana ekrana eklenebilir (PWA) ve ilk açılıştan sonra çevrimdışı da çalışır.

**Güncel sürüm:** V1.21 (bkz. [CHANGELOG.md](CHANGELOG.md))

## Özellikler
- 10 uçak: KAAN, ANKA-3, Hürjet, Hürkuş, ANKA, Aksungur, Kızılelma, Bayraktar TB2, TB3, Akıncı
- Hangar bekleme alanında uçak seçimi, taksi yolu, otomatik taksi, kalkış kontrol listesi
- Klavye, fare, gamepad ve dokunmatik (telefon/tablet) kontrol
- Görevler, halka parkuru, yer hedefleri, bomba ve güdümlü füze, hedef kilidi (açılıp kapatılabilir)
- Hava savunma (SAM) tehditleri, flare, hasar; pist çevresi hava savunma korumalı
- Menü akışı: Başla → uçak seçimi (Silah yükü / Oyuna başla) → başlangıç penceresi (mod + hangar/pist/hava)
- Telefon (yatay) için sade dokunmatik düzen: silah kutucuklarına dokunarak seçim, tek ATEŞ tuşu, sağda dümen
- Bakım hangarı: iniş sonrası onarım ve silah yükleme
- Yapay zekâ: düşman savaş uçakları (Kırmızı Kuvvet), kanat adamı, İt dalaşı görevi, zorluk seçimi
- Çevrimiçi (P2P): oda kodu ile 4 oyuncuya kadar İşbirliği / Takım savaşı / Herkes herkese; boş yerler botla dolar
- Fotoğraf modu, rekorlar, ayarlar

## Çalıştırma
1. `index.html` dosyasını tarayıcıda aç (internet gerekir: three.js ve yazı tipi CDN'den yüklenir).
2. Ya da yerelde sunucu ile: `python3 -m http.server 8000` → http://localhost:8000

## GitHub Pages ile yayınlama
1. Depo: `astakyon/Turkiye_Hava_Simulasyonu`, dal: `main`.
2. Bu klasörün içeriğini depo köküne koy (`index.html` kökte olmalı).
3. **Settings → Pages → Source: GitHub Actions** seç. `.github/workflows/pages.yml` her `main` push'unda testleri çalıştırıp yayınlar.
   (Actions kullanmak istemezsen Source: *Deploy from a branch → main / (root)* de çalışır; `.nojekyll` dosyası hazır.)
4. Adres: https://astakyon.github.io/Turkiye_Hava_Simulasyonu/

## Çevrimiçi oynama
- Oyunu **GitHub Pages adresinden** aç (claude.ai önizlemesi dış bağlantıları engelleyebilir).
- Bir kişi *Çok oyunculu → Oda kur* der, çıkan 5 harfli kodu paylaşır; diğerleri *Odaya katıl*a kodu yazar. Bağlantı adresi ile de katılabilirsin: `.../?oda=KOD`.
- Eşleştirme için ücretsiz PeerJS sunucusu kullanılır; oyun verisi doğrudan oyuncular arasında akar. Bazı kurumsal/okul ağları WebRTC’yi engelleyebilir.

## Sürüm verme
Her güncellemede: `python3 bump_version.py V1.01 "Ne değişti"` → sonra CHANGELOG notunu düzenle, commit + etiket:
```
git add -A && git commit -m "V1.01: ..." && git tag V1.01 && git push && git push --tags
```
Sürüm numarası oyunda ana menüde ve Ayarlar'da görünür. `VERSION` dosyası değişip `main`e gönderilince **Releases** kaydı otomatik oluşur (`.github/workflows/release.yml`); notlar CHANGELOG'dan alınır.

## Testler
`sh tests/run.sh` (Node.js 18+). Tarayıcısız, sahte THREE/DOM ortamında silah tuşları, kilit, hava savunma, hangar girişi ve taksi akışını kontrol eder.

## Yol haritası
Online çok oyunculu plan ve sonraki özellikler: [ROADMAP.md](ROADMAP.md)

## Yasal not
Bu bir hayran/eğitim projesidir. TUSAŞ, Baykar veya başka bir kurumla bağlantısı, onayı ya da sponsorluğu yoktur. Uçak adları yalnızca tanıtım amaçlı kullanılır; modeller stilize, uçuş değerleri yaklaşıktır ve gerçek verileri yansıtmaz. Üçüncü taraf bileşenler: [THIRD_PARTY.md](THIRD_PARTY.md).
Lisans: henüz seçilmedi (bkz. aşağıdaki not).

> **Lisans notu:** Lisans eklenmezse kod varsayılan olarak "tüm hakları saklıdır" sayılır ve başkaları kullanamaz/fork'layıp değiştiremez. Açık kaynak istiyorsan `LICENSE` ekle (ör. MIT).
