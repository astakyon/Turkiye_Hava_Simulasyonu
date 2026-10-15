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
| 01–05 | çekirdek (sürüm, yardımcılar), görüntüleyici, gökyüzü/ışık, arazi (`PADS` düzleştirilmiş üs alanları, `DECKS` rıhtım/iskele, `groundH`), havalimanı |
| 06–08 | üs çevresi (çit, nizamiye, köy, orman, fener), **deniz üssü** (`NAVAL`), **kara üssü** (`LAND`: kışla, motorlu birlik, sürüş parkuru, atış poligonu), **Hilalkent** (`TOWN`), **yol trafiği** (`TRAFFIC`, örnekli arabalar), **Hilal Marina**, kumsal, gemi trafiği ve martılar (`MARINA`; döndürülmüş çerçeveli alan: `PADS[].fr`, `frWorld`); kırsal (`RURAL`), askeri tesisler (`MIL`), köprü ve Anadolukent (`SOUTH`), İHA merkezi (`UAV`), Kızıl Bölge (`KZB`), simge yapılar (`LMK`); ortak yapı araçları `bldg`, `shed`, `baseGate`, `fenceLine` (07) |
| 09–15 | modelleme araçları (`MK`), araç modelleri (kodla), kayıt (`REG`, `AIRCRAFT`), **varlıklar** (GLB yükleme, `buildModel`), **gemi modelleri** (fırkateyn, korvet, TCG Anadolu, denizaltı, karakol botu, römorkör), **kara aracı modelleri** (Altay, Fırtına, Pars, MRAP, askerî kamyon) |
| 20–23 | hangar bekleme alanı, hangar içleri, taksi, bakım hangarı |
| 30–35 | uçuş durumu, halkalar, muharebe, yer hedefleri, görevler, tehditler |
| 40–47 | ayarlar, iz, ses, fizik, kamera, HUD, **görsel efektler**, **gün saati** (`TOD`: güneş/ay, gökyüzü, sis, gece ışıkları `NIGHTMATS`; ortam sesleri `AMBS`) |
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
Ayrıntılı rehber: [docs/MODEL-EKLEME.md](MODEL-EKLEME.md) — `defineAircraft('id',{...})` tek çağrıyla hangar, kütüphane, görev panosu, binme ve çarpışma listelerine ekler; Ayarlar → Arayüz → Araçlar → **Model ölçü denetimi** ölçüleri gerçek değerlerle karşılaştırır.
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
güncellenir ve `index.html` yeniden derlenir. CHANGELOG başlığı `## Vx.xx — tarih · başlık` biçimindedir; `python3 tools/relnotes.py` son 8 sürümü `src/js/98w-relnotes-data.js` dosyasına yazar (oyundaki "Yenilikler" ve sürüm duyurusu buradan okur). `VERSION` değişip `main`'e gidince Releases kaydı otomatik açılır.

## Performans (V2.09) ve teknik borç

Hedef: her telefon, tablet ve bilgisayarda akıcı oyun. Telefonlarda darboğaz çoğunlukla **çizim çağrısı** sayısıdır (yaygın kılavuz: mobilde kare başına ~100–300). Ölçüm `node tools/browser-check.js` ile yapılır (`Q=0` Düşük kademe). V2.09 değerleri:

| Görünüm | Düşük (telefon) | Yüksek (PC) |
|---|---|---|
| Uçuş | ~250 çizim · 550k üçgen | ~400 çizim · 660k üçgen |
| Şehir (yürüyüş) | ~300 · 570k | ~480 · 740k |
| Orman (yürüyüş) | ~280 · 610k | ~400 · 790k |

Katmanlar:
1. **Boyut ayıklaması** (46-cull): ekranda eşik pikselden küçük kalan nesne render katmanından çıkar (`.visible` oyun mantığına kalır). Liste 4 sn'de bir yenilenir (Set ile; eskiden O(n²) idi).
2. **Örnekli gruplar** (98d-perf): ağaç, kaya, park etmiş araç gibi InstancedMesh'ler 4 km karolara bölünür. Her karo kendi sınır küresini taşır. **Tuzak:** three r128'de `computeBoundingSphere()` mevcut küreyi yerinde değiştirir; karo küresi `userData.bs0` kopyasıyla korunur, `instStep` her adımda denetler. (V1.94–V2.08'de ekran ortasındaki ağaçların kaybolma nedeni buydu.)
3. **Sabit birleştirme** (98u-perf2): küçük sabit nesneler malzeme + boyut sınıfı (S < 3 m, M < 20 m, L < 150 m: 800 m hücre; B: 4 km hücre) başına tek ağa birleşir. Rengi farklı dokusuz malzemeler köşe rengiyle tek ağa girer. Hücre, en büyük üyesinin ekrandaki boyutuna göre gizlenir. Bekçi 2 sn'de bir asılları denetler; biri hareket eder, gizlenir ya da silinirse hücre çözülür. Kapatmak için `SETTINGS.merge=false`. V2.14: hücrede eş bulamayanlar 4× büyük hücrede yeniden denenir; saydam parçalar da birleşir; ağ başına ≤ 65 535 köşe; dokusuz hücreler tek malzeme paylaşır; hareket eden parça hücreden çıkarılıp hücre yeniden kurulur.
3b. **Donmuş matrisler** (98u-perf2, V2.14): birleştirmeden sonra 1,5 sn hareketsiz kalan nesnelerde `matrixAutoUpdate=false`; bekçi her ~15 karede konum/dönüş/ölçeği karşılaştırır, değişeni çözer (`userData.noFreeze` ile hariç tutulabilir, `SETTINGS.freeze=false` ile kapanır).
3c. **Model pişirme** (98z-bake, V2.15): uçak, helikopter, araç ve hedef gruplarının hareketsiz parçaları grup uzayında malzeme + boyut sınıfı başına birleştirilip grubun çocuğu olarak eklenir (model taşınabilir). Bekçi her parçanın gruba göre konumunu, görünürlüğünü ve malzemesini izler: hareket eden/görünürlüğü değişen parça `noBake` olur ve model yeniden kurulur; malzeme değişince yalnız yeniden kurulur. Oyuncu uçağı her kare (çizimden önce), diğerleri ~12 karede bir denetlenir. Pişmiş ağlar en büyük parçalarının boyutuna göre ayıklanır. `SETTINGS.bake=false` ile kapanır. Not: ayıklama listesi yenilenirken `merged`/`baked` asıllar yeniden açılmaz (46-cull).
3d. **Gölge 2.0** (98za-shadow, V2.16): `shadowLevel()` 0–3 (harita 1024/2048/4096, yumuşak kenar yalnız 3'te bilgisayarda). `renderer.shadowMap.autoUpdate=false`; `shNeed()` yürürken, yere <300 m ve güneş değişince her kare, aksi halde 4 karede bir `needsUpdate` verir; ışık da yalnız o karelerde taşınır (kayma olmasın). <1,5 m parçalar gölge düşürmez (oyuncu uçağı hariç), 5 sn'de bir denetlenir. Her kare çizim için `SETTINGS.shadowEvery=true`.
3e. **Efekt geçişleri ve menüler** (98zb-passes, V2.17): renk düzeltme + FXAA tek ShaderPass (`fxGradeAAShader()` GRADE_SHADER'dan türetir; `SETTINGS.fxMerge=false` ile ayrı geçişler). `menuCovered()` iken `renderFrame` çizmez (mantık 98u'da 10 FPS). Otomatik kalite 5 dk'da 3 kez düşerse `PERF2.lock` (menüye dönünce sıfırlanır).
3f. **Doku belleği** (98zc-tex, V2.18): `txsShare()` aynı resim + aynı örnekleme ayarlı tuval dokularını tek dokuya bağlar (8×8 imza, sonra piksel karşılaştırma), kopyaları serbest bırakır. `txsShrink()` telefonda ≥1024, bilgisayarda Düşük/Orta'da ≥2048 dokuları yarıya indirir. `txsWatch()` saniyede bir `texture.version` karşılaştırır: oyun bir dokuyu yeniden çizerse kendi tam boy kopyasına döner (`userData.txsOwn`). 2,2 s (birleştirmeden önce) ve 9 s'de çalışır; `SETTINGS.texShare=false` ile kapanır. Anizotropi telefonda en çok 2×.
3g. **Açılış** (00-boot, 99-main, V2.19): modüller tek betikte çalışır; ardından `BOOT_STEPS` (17 kurulum adımı) `bootRun()` ile MessageChannel görevlerine bölünür, aralarda `#boot` yükleme ekranı ve çubuğu güncellenir; son adımdan sonra kare döngüsü başlar; ardından `BOOT_POST` (doku paylaşımı, birleştirme, pişirme, shader ısıtma, hesap) yükleme ekranının altında kareler arasında çalışır (adım `true` dönerse sonraki karede tekrar, söz/promise dönerse en çok 3 sn beklenir; toplam en çok 6 sn), ekran kareler düzene girince (`bootWhenSmooth`) kapanır ve bekletilen zamanlayıcılar o zaman bırakılır (V2.20). Açılış sürerken kurulan `setTimeout` çağrıları dünya bitince sırasıyla çalışır, `setInterval` geri çağrıları atlanır, tuş ve dokunuşlar yutulur. Tarayıcısız testlerde (MessageChannel yok) hepsi eşzamanlı çalışır. Süreler `BOOT.marks` / `BOOT.stepMs`, performans raporunda `boot`. Yeni modül kurulum gerektiriyorsa adımı `BOOT_STEPS`'e ekleyin; modül üst düzeyinde dünyanın kurulmuş olduğunu varsaymayın, zamanlayıcı kullanın.
3h. **Shader ısıtma** (98zd-warm, V2.19): ana menüde (`state==="menu"`) sahnedeki her malzeme + nesne türü bir kez `renderer.compile` ile derlenir; sahnenin ışıkları/sisi kullanılsın diye `Object.create(scene)` vekili tek nesneyi gezer. Karede ~8 ms. `SETTINGS.warm=false` ile kapanır.
3i. **Arazi kademeleri** (04-terrain, 98ze-terrain-lod, V2.21): `TER` 301×301 yükseklik ızgarası (100 m) bir kez `terrainH` ile örneklenir; normal ve renkler ızgaradan. 36 parça × 4 sürüm (ızgaranın her 1/2/5/10. noktası), kenarlarda etek (skirt) ile yarık kapanır. `terLodStep()` 0,25 sn'de bir mesafeye göre sürüm seçer (%10 bekleme payı, dağlık parça bir kademe ince); tam ayrıntılı olmayan parçalar `terFar()` ile tek ağda birleşir. Fizik hep `terrainH`/`groundH` kullanır. `SETTINGS.terrainLod=false` ile kapanır.
3j. **Grafik ayarları 2.0** (98zf-gfx2, V2.22): `SETTINGS.gd={view,detail,trees,clouds,tex,fx}` (0–3, yoksa hazır ayar); `gq(k)` kullanılan kademe. Grup başına okuyan işlevler: `terLodDist`/`trafficRadius` (view), `CULL.px` (detail), `treeDensity` (trees), `perfLvlApply` bulutlar (clouds), `txsLimit` + `gdTexApply` (tex, küçültülen dokular geri alınıp yeni sınıra göre yeniden küçültülür), `explode` parçacık sayısı (fx). `SETTINGS.tierAuto` = Otomatik hazır ayar. Yeni grafik ayarı eklerken `gq()` kullanın ve satırı uygun gruba koyun.
3k. **Ayarlar** (51-settings-ui, 98zf, 98zg, V2.23): yeni satır eklerken açıklama yazın; varsayılandan farkı olabilecek satırı `RD` listesine ekleyin (`[kontrol id, seg:<data adı> | chk | range | fn, varsayılan, (istenirse) şu anki değer]`) — ↺ düğmesi satırın varsayılan seçeneğine basar. Aynı ayarı iki yerde göstermeyin. Kayıt anahtarları: arayüzlü olanlar Grafik/Uçuş/Dünya/Kontroller/Ses/Arayüz/Erişilebilirlik satırlarında; arayüzsüz geliştirici anahtarları `bake, merge, freeze, fxMerge, texShare, warm, terrainLod, shadowEvery, gyroDz` (false/ sayı ile özellik kapanır ya da ayarlanır); iç kayıtlar `notesSeen, accPrompted, igpuTold, tierAuto, tchTut, rankLocks, startPlace, ai, voiceOpen, advUi`; `vol` kanal karışımı, `pad`/`tch` kumanda ve dokunmatik alt ayarları, `gd` grafik grupları.
4. **Cihaz kademesi**: ilk açılışta GPU adı, bellek ve çekirdek sayısından hazır ayar seçilir (Ayarlar → Grafik → Cihaza göre ayarla).
5. **Uyarlanır kalite** (98d): FPS düşünce çözünürlük ve kalite basamak basamak iner.
6. **Menüde 10 FPS**: tam ekran menü sahneyi örterken.

**Gerçek cihaz ölçümü (V2.12):** Ayarlar → Grafik → Performans testi (`98x-perftest.js`). Oyun sabit rotaları kendisi oynar: 6 sahne, özellik maliyetleri (gölge, efekt, yarı çözünürlük, ağaç, iki katmanlı derinlik, logaritmik derinlik), stres sahnesi, ilk efekt takılması, isteğe bağlı 5 dk ısınma. Kare süresi rAF aralığından, işlemci süresi kare fonksiyonunun içinden, GPU süresi `EXT_disjoint_timer_query_webgl2` varsa ölçülür. Sonuç ortalama/P90/P99 FPS, 20 FPS altı kare oranı ve darboğaz (ekran yenileme · işlemci · ekran kartı) olarak raporlanır. Rapor anonimdir; `perf_reports` tablosuna (supabase/perf_reports.sql) yalnız oyuncu "Gönder" deyince gider, cihazda son 5 rapor saklanır, Yönetim → Performans sekmesinde listelenir. Logaritmik derinlik çalışırken kapatılamadığı için ölçüm sırasında malzemelere `onBeforeCompile` ile `#undef USE_LOGDEPTHBUF` eklenip programlar yeniden derlenir.

Yayın kapısı: `release.sh`, `tools/browser-check.js` FAIL verirse yayını durdurur. Denetlenenler: görüş alanındaki örnekli grubun ayıklanması, birleştirilmiş hücre ile asıllarının birlikte çizilmesi, sayfa hataları.

Açık teknik borç:
- Park etmiş uçak ve gemi modelleri model başına 30–70 çizim. Model altyapısıyla (V2.11) uzak LOD ve birleştirilmiş gövde gelecek.
- Modüller sarmalama (`const _x=fn; fn=function…`) zinciriyle genişliyor. `tests/decl.sh` aynı adlı üst düzey tanımları yakalar; yeni modülde benzersiz önek kullanın.
- Başsız testlerde THREE sahte (stub); gerçek grafik davranışı yalnızca tarayıcı denetiminde sınanır.

## Android (planlı)
`index.html` + `vendor/` + `assets/` bir Capacitor (veya TWA) projesine kopyalanır; her şey yerelden yüklendiği için
internet gerekmez (çevrimiçi oyun hariç). Ekran yatay kilitlenir, dokunmatik düzen hazırdır.
