# Mimari — Ay Yıldız: Hedef Kızıl Elma

Oyun **tek bir `index.html`** olarak çalışır (GitHub Pages, claude.ai önizlemesi, ileride Android sarmalayıcı).
Ama kaynak kod parçalara bölünmüştür; `index.html` her zaman `src/` klasöründen **üretilir**.

```
src/
  index.html        şablon: <head>, kitaplıklar, @include yer tutucuları
  css/main.css      bütün stiller
  html/body.html    menüler, ayarlar, dokunmatik düğmeler (DOM arayüz)
  js/NN-ad.js       oyun kodu; dosyalar numara sırasıyla birleştirilir
tools/build.py      src/ → index.html  (--check: CI'da güncellik kontrolü)
vendor/three-r128/  three.js ve eklentileri, Draco çözücü (çevrimdışı/Android için yerel kopya)
assets/models.json  isteğe bağlı 3B model listesi (.glb), assets/models/ altında dosyalar
tests/              tarayıcısız testler (sahte THREE/DOM): sh tests/run.sh
docs/               bu belgeler
```

**Kural:** `index.html` doğrudan düzenlenmez. `src/` içinde değiştir → `python3 tools/build.py` → test → commit.
CI (`pages.yml`) önce `tools/build.py --check`, sonra testleri çalıştırır; ikisi de geçerse yayınlar.

## Modüller (yükleme sırası)
| Aralık | İçerik |
|---|---|
| 01–05 | çekirdek (sürüm, yardımcılar), görüntüleyici, gökyüzü/ışık, arazi, havalimanı |
| 10–14 | araç modelleri (kodla), kayıt (`REG`, `AIRCRAFT`), **varlıklar** (GLB yükleme, `buildModel`) |
| 20–23 | hangar bekleme alanı, hangar içleri, taksi, bakım hangarı |
| 30–35 | uçuş durumu, halkalar, muharebe, yer hedefleri, görevler, tehditler |
| 40–46 | ayarlar, iz, ses, fizik, kamera, HUD, **görsel efektler** |
| 50–54 | menü/giriş, ayarlar arayüzü, gamepad, dokunmatik, fare/klavye |
| 60 | yapay zekâ ve çevrimiçi (P2P) |
| 70 | üssü gezme (yaya + araç) |
| 72 | **model kütüphanesi**: 3B önizleme stüdyosu, testler, boya/kamuflaj, içe/dışa aktarma |
| 99 | başlatma ve ana döngü |

Yeni özellik → uygun numarayla yeni dosya (ör. `36-weather.js`). Bütün dosyalar aynı kapsamda (tek IIFE) birleşir;
başka bir dosyanın `const` değişkenine **yükleme anında** erişme (sadece fonksiyon içinden, çalışma anında eriş) —
aksi halde "before initialization" hatası olur.

## Durum makinesi
`state`: `menu` · `play` · `paused` · `service` · `photo` · `walk` · `library`
`menuMode` (menüdeyken): `title` · `hangar` · `loadout` · `start` · `missions`
Ana döngü (`99-main.js`): giriş → `update` (uçuş) / `walkUpdate` (yaya) → yapay zekâ ve ağ → modeller → kamera → `renderFrame` → HUD.

## Araç (uçak) ekleme
1. `12-models.js` içine kodla model fonksiyonu yaz (`build…()`): `{group, flames, strobe, gear, spinners}` döndürür.
   Eksenler: **−Z ileri, +Y yukarı, birim metre**, orijin yaklaşık ağırlık merkezi.
2. `13-registry.js` içinde `AIRCRAFT` (uçuş değerleri) ve `REG` (grup, sınıf, üretici, silahlar) kaydı ekle.
3. Hangar, seçim ekranı, yapay zekâ ve çevrimiçi kendiliğinden yeni aracı kullanır.
4. Hazır .glb modelin varsa ayrıca `assets/models.json`'a ekle (aşağıya bak) — kod modeli yedek olarak kalır.

Gruplar `GROUPS` içinde: `hava` (Hilal Kanatlar), `deniz` (Mavi Kanatlar), `kara`. Deniz ve kara araçları için
aynı kayıt yapısı kullanılacak; fizik ve kamera modu gruba göre seçilecek (planlı).

## 3B modeller (GLB)
Her araç önce kodla çizilir (indirme yok, her zaman çalışır). `assets/models.json` bir .glb listeliyorsa model arka planda
yüklenir ve aracın **bütün kopyalarını** (oyuncu, hangar, yapay zekâ) "giydirir". Ayrıntı: [MODELLER.md](MODELLER.md).
Kod yazmadan: ana menü → **Model Kütüphanesi** (içe aktarma, boya, test). Kütüphane açıkken oyun dünyası çizilmez; kendi küçük stüdyo sahnesi (`LIB.scene`) çizilir.
Boya (`LIV`, 72-library.js) kod modelinde en geniş alanı kaplayan boyayı bulur ve aracın bütün kopyalarında onu değiştirir; kamuflaj gölgelendiriciye eklenen desenle çizilir.

## Görsel efektler (post-processing)
`46-postfx.js` — three.js `EffectComposer`. Ayarlar → Grafik → **Görsel efektler**:
- **Kapalı:** doğrudan çizim (telefonda varsayılan).
- **Düşük:** renk düzeltme + vinyet + yüksek hızda kenar bulanıklığı, kenar yumuşatma (WebGL2'de MSAA, yoksa FXAA).
- **Yüksek:** + seçici ışık parlaması (bloom). Sahne yarı-kayan noktalı tamponda çizilir; yalnızca ışıklar, alevler,
  izli mermiler ve güneş eşik üstüne çıkarılır (malzemede `userData.glow`), beyaz boya ve bulutlar parlamaz.
Kitaplıklar ilk ihtiyaçta `vendor/`'dan, yoksa jsDelivr'den yüklenir; yüklenemezse oyun efektsiz devam eder.

## Kitaplıklar ve çevrimdışı
`needLibs([...])` (14-assets.js) three.js eklentilerini istek üzerine yükler: önce `vendor/three-r128/`, olmazsa CDN.
`three.min.js` önce cdnjs'ten, yüklenemezse `vendor/`'dan gelir. `sw.js` (PWA) oyun dosyalarını ve kitaplıkları önbelleğe alır;
önbellek adı sürümle değişir (`bump_version.py` günceller).

## Sürüm verme
`python3 bump_version.py V1.xx "not"` → `src/js/01-core.js`, şablon, `VERSION`, `version.json`, `sw.js`, CHANGELOG
güncellenir ve `index.html` yeniden derlenir. `VERSION` değişip `main`'e gidince Releases kaydı otomatik açılır.

## Android (planlı)
`index.html` + `vendor/` + `assets/` bir Capacitor (veya TWA) projesine kopyalanır; her şey yerelden yüklendiği için
internet gerekmez (çevrimiçi oyun hariç). Ekran yatay kilitlenir, dokunmatik düzen hazırdır.
