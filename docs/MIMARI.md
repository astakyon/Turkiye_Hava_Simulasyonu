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

## Modüller (konu klasörleri, V2.25)
`src/js/` konu klasörlerine ayrılmıştır; birleştirme sırası `src/js/SIRA.txt` dosyasındadır (`tools/build.py` her `.js` dosyasının listede tam bir kez olduğunu denetler).

| Klasör | İçerik |
|---|---|
| `cekirdek/` | açılış ve yükleme ekranı (`acilis`), kanca kaydı (`kanca`), sürüm ve yardımcılar (`temel`), görüntüleyici (`cizici`), ayarlar ve kayıt (`ayarlar`), Android kurulumu, ana döngü (`ana-dongu`, en sonda) |
| `dunya/` | gökyüzü/ışık, arazi (`PADS`, `DECKS`, `groundH`, arazi parçaları `TER`) ve ayrıntı kademeleri, havalimanı, üs çevresi, deniz/kara/İHA üsleri, Hilalkent, marina, kırsal, hava savunma, güney ada, Kızıl Bölge, simge yapılar, hangarlar, taksi yolu, bakım hangarı, gün saati, hava durumu, canlı üs, kapalı alanlar |
| `modeller/` | model kiti, KAAN ve diğer uçak modelleri, uçak kaydı (`AIRCRAFT`), varlıklar (GLB), gemi/kara aracı/araba/helikopter modelleri, model kayıt API'si, model kütüphanesi |
| `ucus/` | uçuş durumu (`S`), halkalar, iniş alanları ve fizik, kamera, kanat buharı, konfor, gerçek performans, kokpit, akrobasi, iniş yardımı |
| `savas/` | hedefler/mermiler/patlamalar, yer hedefleri, tehditler (SAM, füze, flare), hasar ve yakıt, füzeden kaçma, kanat adamı |
| `gorev/` | görevler, görev panosu, dinamik görevler, uçuş okulu, yarışlar, görev editörü, kampanya, kara/deniz görevleri, görev ekranı |
| `ekran/` | HUD, harita, giriş ve menü, ayar ekranı ve gözden geçirme, grafik ayarları, ana menü sürümleri, envanter, tekrar, sürüm notları |
| `kontrol/` | kontrol şemaları, gamepad, dokunmatik (1 ve 2), fare/klavye, telefon (eğerek uçuş) |
| `ses/` | ses motoru, ses sistemi ve kütüphanesi, müzik, telsiz |
| `yuruyus/` | yaya ve araç kullanma, helikopterler ve helikopter operasyonları, bütün araçlar, tekneler, araç çağırma, her araca binme, çarpışmalar |
| `ag/` | yapay zekâ uçakları ve P2P çevrimiçi oyun, hesap ve bulut kaydı, kariyer ve ilerleme, yönetici, lisanslar, giriş/oyuncu kartı, karma çok oyunculu, takım iletişimi |
| `performans/` | uzaklığa göre ayıklama, efekt zinciri ve kalitesi, birleştirme/dondurma, model pişirme, gölgeler, efekt geçişleri, doku belleği, shader ısıtma, performans testi ve modül maliyeti, görüntü testi |
| `veri/` | üretilen veriler: envanter (`tools/dt_import.py`), sürüm notları (`tools/relnotes.py`) — elle düzenlenmez |

Yeni özellik → konusuna uygun klasörde yeni dosya; `SIRA.txt`'de kullandığı modüllerden sonraya yazın. Başka bir modülün işlevini genişletmek için `HOOK.wrap` kullanın (aşağıda). Bütün dosyalar aynı kapsamda (tek IIFE) birleşir;
başka bir dosyanın `const` değişkenine **yükleme anında** erişme (sadece fonksiyon içinden, çalışma anında eriş) —
aksi halde "before initialization" hatası olur.

## Durum makinesi
`state`: `menu` · `play` · `paused` · `service` · `photo` · `walk` · `library`
`menuMode` (menüdeyken): `title` · `hangar` · `loadout` · `start` · `missions`
Ana döngü (`cekirdek/ana-dongu.js`): giriş → `update` (uçuş) / `walkUpdate` (yaya) → yapay zekâ ve ağ → modeller → kamera → `renderFrame` → HUD.

## Araç (uçak) ekleme
Ayrıntılı rehber: [docs/MODEL-EKLEME.md](MODEL-EKLEME.md) — `defineAircraft('id',{...})` tek çağrıyla hangar, kütüphane, görev panosu, binme ve çarpışma listelerine ekler; Ayarlar → Arayüz → Araçlar → **Model ölçü denetimi** ölçüleri gerçek değerlerle karşılaştırır.
1. `modeller/ucak-modelleri.js` içine kodla model fonksiyonu yaz (`build…()`): `{group, flames, strobe, gear, spinners}` döndürür.
   Eksenler: **−Z ileri, +Y yukarı, birim metre**, orijin yaklaşık ağırlık merkezi.
2. `modeller/ucak-kaydi.js` içinde `AIRCRAFT` (uçuş değerleri) ve `REG` (grup, sınıf, üretici, silahlar) kaydı ekle.
3. Hangar, seçim ekranı, yapay zekâ ve çevrimiçi kendiliğinden yeni aracı kullanır.
4. Hazır .glb modelin varsa ayrıca `assets/models.json`'a ekle (aşağıya bak) — kod modeli yedek olarak kalır.

Gruplar `GROUPS` içinde: `hava` (Hilal Kanatlar), `deniz` (Mavi Kanatlar), `kara`. Deniz ve kara araçları için
aynı kayıt yapısı kullanılacak; fizik ve kamera modu gruba göre seçilecek (planlı).

## 3B modeller (GLB)
Her araç önce kodla çizilir (indirme yok, her zaman çalışır). `assets/models.json` bir .glb listeliyorsa model arka planda
yüklenir ve aracın **bütün kopyalarını** (oyuncu, hangar, yapay zekâ) "giydirir". Ayrıntı: [MODELLER.md](MODELLER.md).
Kod yazmadan: ana menü → **Model Kütüphanesi** (içe aktarma, boya, test). Kütüphane açıkken oyun dünyası çizilmez; kendi küçük stüdyo sahnesi (`LIB.scene`) çizilir.
Boya (`LIV`, modeller/model-kutuphanesi.js) kod modelinde en geniş alanı kaplayan boyayı bulur ve aracın bütün kopyalarında onu değiştirir; kamuflaj gölgelendiriciye eklenen desenle çizilir.

## Görsel efektler (post-processing)
`performans/efektler.js` — three.js `EffectComposer`. Ayarlar → Grafik → **Görsel efektler**:
- **Kapalı:** doğrudan çizim (telefonda varsayılan).
- **Düşük:** renk düzeltme + vinyet + yüksek hızda kenar bulanıklığı, kenar yumuşatma (WebGL2'de MSAA, yoksa FXAA).
- **Yüksek:** + seçici ışık parlaması (bloom). Sahne yarı-kayan noktalı tamponda çizilir; yalnızca ışıklar, alevler,
  izli mermiler ve güneş eşik üstüne çıkarılır (malzemede `userData.glow`), beyaz boya ve bulutlar parlamaz.
Kitaplıklar ilk ihtiyaçta `vendor/`'dan, yoksa jsDelivr'den yüklenir; yüklenemezse oyun efektsiz devam eder.

## Kitaplıklar ve çevrimdışı
`needLibs([...])` (modeller/varliklar.js) three.js eklentilerini istek üzerine yükler: önce `vendor/three-r128/`, olmazsa CDN.
`three.min.js` önce cdnjs'ten, yüklenemezse `vendor/`'dan gelir. `sw.js` (PWA) oyun dosyalarını ve kitaplıkları önbelleğe alır;
önbellek adı sürümle değişir (`bump_version.py` günceller).

## Sürüm verme
`python3 bump_version.py V1.xx "not"` → `src/js/cekirdek/temel.js`, şablon, `VERSION`, `version.json`, `sw.js`, CHANGELOG
güncellenir ve `index.html` yeniden derlenir. CHANGELOG başlığı `## Vx.xx — tarih · başlık` biçimindedir; `python3 tools/relnotes.py` son 8 sürümü `src/js/veri/surum-notlari-veri.js` dosyasına yazar (oyundaki "Yenilikler" ve sürüm duyurusu buradan okur). `VERSION` değişip `main`'e gidince Releases kaydı otomatik açılır.

**Yayın hattı (V2.31):** `tools/release.sh Vx.yy "başlık" notlar.md "commit mesajı"` bütün adımları sırayla yapar: sürüm numarası ve CHANGELOG, oyun içi notlar, derleme, tarayıcı denetimi, testler, commit ve push. Denetim ya da testlerden biri geçmezse commit atılmaz. Yazar ve commit eki dışarıdan ortam değişkeniyle verilir (`RELEASE_AUTHOR_NAME`, `RELEASE_AUTHOR_EMAIL`, `RELEASE_TRAILER`); betikte kişisel bilgi yok.
- **Testler:** `node tests/paralel.js` bütün testleri bütün çekirdeklerde çalıştırır, en yavaş beş testi yazar. `sh tests/run.sh` tek tek çalıştırmanın basit yolu olarak duruyor. Test ortamı (harness) oyunun sık kullandığı yerleşik adları (Math, Float32Array, THREE…) oyunun kendi kapsamına bağlıyor. Node'un vm bağlamında her global arama yavaş bir ara katmandan geçiyordu; arazi gürültüsü yüzünden dünya kurulumu 15 kat yavaştı. Sonuç: 2 çekirdekte 13 dk → 2 dk 15 sn (tek çekirdekte 3 dk 45 sn).
- **Bütçe kapısı** (`tools/browser-check.js`, `BUDGET`):
  - her görünüm için çizim ve üçgen tavanı (V2.30 değerlerinin yaklaşık %25 üstü);
  - doku belleği tavanı;
  - kalabalık savaş stres testi: 4 düşman, kanat adamı, SAM, füze ve patlamalarla 12 sn; JS yığını en çok 40 MB büyüyebilir.

  İçerik eklenip bütçe bilerek yükseltilecekse değer bu dosyada değiştirilir, değişiklik commit'te görünür.
- **three.js sürümü:** karar raporu `docs/KARAR-THREEJS.md`.

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
3l. **Kayıt** (cekirdek/depo, V2.26): oyunun tarayıcıya yazdığı her şey tek kayıtta: `localStorage['ayy-kayit']={v:1,t,d:{anahtar:metin}}`, yedeği `ayy-kayit-yedek`. Kod `localStorage` yerine `stGet(k)` / `stSet(k,v)` / `stDel(k)` / `stKeys()` kullanır (değerler eskisi gibi metin). Yazmalar 250 ms toplanır; `depoFlush()` hemen yazar (sayfa yenilemeden önce çağırın). Yeni bir şey kaydederken `ayy-` önekli bir anahtar seçin; kayıt yedekleme dosyası (Ayarlar → Arayüz → Kayıt yedeği) ve bulut senkronu bu anahtarları tanır.
3m. **Girdi** (cekirdek/girdi, V2.27): pencereye klavye dinleyicisi eklemeyin; `INPUT.on('keydown'|'keyup', fn, yakalama, 'klasor/modul', 'bağlam')` kullanın. Yeni kısayolu `CTRL_DEF` içine eylem olarak ekleyin (Kontroller'de değiştirilebilir, yardımda kendiliğinden görünür) ve `isKey(e, şema, eylem)` ile okuyun; `INPUT.conflicts()` boş kalmalı.
4. **Cihaz kademesi**: ilk açılışta GPU adı, bellek ve çekirdek sayısından hazır ayar seçilir (Ayarlar → Grafik → Cihaza göre ayarla).
5. **Uyarlanır kalite** (98d): FPS düşünce çözünürlük ve kalite basamak basamak iner.
6. **Menüde 10 FPS**: tam ekran menü sahneyi örterken.

**Gerçek cihaz ölçümü (V2.12):** Ayarlar → Grafik → Performans testi (`performans/performans-testi.js`). Oyun sabit rotaları kendisi oynar: 6 sahne, özellik maliyetleri (gölge, efekt, yarı çözünürlük, ağaç, iki katmanlı derinlik, logaritmik derinlik), stres sahnesi, ilk efekt takılması, isteğe bağlı 5 dk ısınma. Kare süresi rAF aralığından, işlemci süresi kare fonksiyonunun içinden, GPU süresi `EXT_disjoint_timer_query_webgl2` varsa ölçülür. Sonuç ortalama/P90/P99 FPS, 20 FPS altı kare oranı ve darboğaz (ekran yenileme · işlemci · ekran kartı) olarak raporlanır. Rapor anonimdir; `perf_reports` tablosuna (supabase/perf_reports.sql) yalnız oyuncu "Gönder" deyince gider, cihazda son 5 rapor saklanır, Yönetim → Performans sekmesinde listelenir. Logaritmik derinlik çalışırken kapatılamadığı için ölçüm sırasında malzemelere `onBeforeCompile` ile `#undef USE_LOGDEPTHBUF` eklenip programlar yeniden derlenir.

Yayın kapısı: `release.sh`, `tools/browser-check.js` FAIL verirse yayını durdurur. Denetlenenler: görüş alanındaki örnekli grubun ayıklanması, birleştirilmiş hücre ile asıllarının birlikte çizilmesi, sayfa hataları.

Açık teknik borç:
- Park etmiş uçak ve gemi modelleri model başına 30–70 çizim. Model altyapısıyla (V2.11) uzak LOD ve birleştirilmiş gövde gelecek.
- **Kanca kaydı (V2.24, 00-hook):** bir modül başka bir modülün işlevini genişletirken `fn=HOOK.wrap('fn','dosya#ad',function(next){ return function(a,b){ … next(a,b) … }; },fn);` kullanır (eski `const _x=fn; fn=function…` biçimi 284 yerden bu biçime çevrildi; 5 eski biçim kaldı, onlar da zincirle uyumlu). `HOOK.list('drawHUD')` katmanları sırayla gösterir; tarayıcıda hata veren katman bir kez raporlanır ve altındaki katmanlar çalışmaya devam eder (başsız testlerde hata eskisi gibi çağırana gider); `HOOK.prof=true` iken her katmanın kendi süresi `HOOK.ms`'de toplanır (performans testi raporunda "En pahalı modüller"). Hooklanan işlevler en çok 4 parametre alır. Yeni kod için olaylar: `HOOK.on(ad,fn)` / `HOOK.emit(ad,…)`. `tests/decl.sh` aynı adlı üst düzey tanımları yine yakalar.
- **Kare başına çöp (V2.24):** her karede çalışan kodda `new THREE.Vector3()` / `.clone()` / dizi ya da metin üretmeyin; modül düzeyinde bir kez oluşturulan geçici nesneleri kullanın (ör. `GULL_T`, `LMK_T`, `RUR_T`, `TRF_T`, `ACRO_W`, `FR_L`). Füze, mermi, patlama parçacığı, flare ve dumanlar zaten havuzda. three r128'in kendi çizim kodu kare başına ~50–100 KB üretiyor; bu bizim elimizde değil.
- Başsız testlerde THREE sahte (stub); gerçek grafik davranışı yalnızca tarayıcı denetiminde sınanır.

## V2.28–V2.40 eklemeleri

- **Uçak gölgesi kipi** (`performans/golgeler`):
  - Yüksekte gölge kutusu yalnız uçağı kapsar ve her karede çizilir.
  - Gölge geçişi sırasında diğer üst düzey nesneler kapatılır.
  - Normal kutuda, kutunun dışındaki nesneler sınır küresine göre atlanır (`shBoxPass`).
- **Zemin yüksekliği** (`dunya/arazi`): `terrainH()` çizilen üçgenin yüksekliğini verir. Formül `terrainHA()` olarak duruyor.
- **Mühimmat istasyonları** (`savas/yer-hedefleri` `storeLayout`): kanat ve gövde altı ışınla ölçülür, iniş takımından uzak tutulur, sonuç uçak başına önbelleğe alınır.
- **Doku işi** (`performans/doku-bellegi`): yalnız menü, duraklatma ve haritada çalışır. Performans testi başlamadan önce bitirilir.
- **Menü** (`ekran/ana-menu-2`, `ekran/menu-duzeltmeleri`):
  - Ana menü: Hızlı Oyun · Kariyer · Çok Oyunculu.
  - Hızlı Savaş (`QB_MODES`): yapay zekâ ayarı yalnız o savaş için `aiCfg` kancasıyla değişir.
- **Rehber ve envanter** (`ekran/rehber`, `veri/rehber-veri`): `tools/ozellikler.py`'den üretilir. `docs/OZELLIKLER.md` ve `docs/OYUNCU-REHBERI.md` de aynı listeden çıkar.
- **Sorun giderme** (`ekran/sorun-giderme`): Performans testi, Görüntü testi ve Tanılama tek ekranda.
  - Kapatma kuralı: tam ekranlarda sol üstte "← Geri", açılır kartlarda sağ üstte ✕.
  - Görev editörü Görevler ekranındaki "＋ Görev editörü" düğmesiyle açılır.
- **TP dengesi** (`gorev/tp-dengesi`):
  - Görev ödülleri süre × zorluk oranının %80–125'i içinde tutulur.
  - Silahsız uçakla silahlı görev başlatılamaz.
- **Metin denetimi** (`tools/metinler.py`, `tests/terimler.sh`): oyuncunun gördüğü metinler terim sözlüğüne ve sık yazım hatalarına göre taranır; aykırılık yayını durdurur.
- **Yükleme ekranı 3.0** (`cekirdek/acilis`): `BOOT_TIPS` ipucu kartları, oyun dilinde aşama adları, ilk dokunuşta ses (`bootSndStart`), menü daha erken açılır.
- **Gerçek mühimmat** (`savas/muhimmat`, V2.41): beş silah rolü (gp, bnk, m1, m2, m3) her yerde aynı kalır; model serisinden geçen uçakta her rol gerçek bir mühimmata bağlanır (`AC_MUNI`).
  - `wOf(id,k)` menülerde o uçağın silahını verir; `munApply(id)` uçuşta `WEAPONS`'ı etkin uçağa göre doldurur.
  - Mühimmat modelleri gerçek boyutta, tek geometri ve köşe renkleriyle yapılır (`munGeo`).
  - İç silah yuvası: `MUN_BAY[id]`'deki roller yuvada taşınır, atışta kapaklar açılır (`BAY`, `munBayStep`); model `bay` alanını verir.
- **Bayraktar TB2 modeli** (`modeller/tb2`, V2.42): ayrı yapıcı `buildTB2`; eski ortak TB2/TB3 modeli `buildOld` olarak kütüphane karşılaştırmasında. `stnMinX` kanat istasyonlarını bomların dışına alır; `REG.tb2.wpn` silah rollerini sınırlar (hava-hava yok), `defaultLoadout` ve `applyLoadout` buna uyar.
- **Bayraktar TB3** (V2.43): `buildTB3` = `buildTB2(o)` seçenekleriyle (`k` boyut iç grupta, böylece mühimmat gerçek boyda kalır; `fold` kanat kökünden katlanma, `stnX` istasyonları orta kanatla sınırlar). `tbFold(m,f)` kanatları katlar; hangarda "Kanatları katla" düğmesi (`FOLD`, `foldSet`), uçuş her zaman açık kanatla başlar.
- **Bayraktar Akıncı** (`modeller/akinci`, V2.44): `buildAkinciV2`, oyuncunun fotoğraflarına göre (tek dikey kuyruk, alçak yatay kuyruklar, kıvrık kanatçıklar, kanat altındaki motor gövdeleri, arka gövde altında kamera); eski model `buildOld`.
- **Belgeler:** tek yol haritası `ROADMAP.md` (eski planlar `docs/arsiv/`). Sürüm geçmişi `tools/surumler.py` → `docs/SURUM-GECMISI.md`.

## Android (planlı)
`index.html` + `vendor/` + `assets/` bir Capacitor (veya TWA) projesine kopyalanır; her şey yerelden yüklendiği için
internet gerekmez (çevrimiçi oyun hariç). Ekran yatay kilitlenir, dokunmatik düzen hazırdır.
