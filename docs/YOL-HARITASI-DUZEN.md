# Ay Yıldız: Hedef Kızıl Elma — Düzen yol haritası V2.12 → V2.30

Son güncelleme: 14 Ekim 2026 (Android oyun performansı rehberiyle güncellendi) · Yayındaki sürüm: V2.11

Model yenileme serisi bu yol haritası bitene kadar bekliyor. Sıra: **önce ölçüm**, sonra **optimizasyon**, sonra **grafik ayarları**, sonra **teknik borç**, en son **genel gözden geçirme**.

Bu sıranın gerekçesi:
- Optimizasyon gerçek cihaz verisi olmadan körlemesine yapılıyordu. Bu yüzden ilk iş, senin bilgisayarından ve telefonundan gerçek ölçüm almak.
- Grafik ayarları optimizasyondan sonra geliyor, çünkü ayarların açıp kapatacağı katmanlar (gölge kalitesi, görüş mesafesi, dinamik çözünürlük, doku kalitesi) optimizasyon sürümlerinde yapılıyor.
- Teknik borç ve genel gözden geçirme en sonda; bu aşamada oyunun davranışı değişmeden kod ve ekranlar derleniyor.

Her sürümün yanında **başarı ölçütü** var. Ölçüt tutmazsa sürüm "bitti" sayılmıyor.

---

## Bugünkü durum (14 Ekim 2026 ölçümü)

Ölçüm gerçek tarayıcıda (Chromium, yazılım GPU'su) yapıldı. Çizim, üçgen, doku ve bellek sayıları cihazdan bağımsız ve güvenilir. Süre ölçümleri yazılım GPU'su yüzünden yalnızca karşılaştırma amaçlı.

| Ölçü | Uçuş (Yüksek) | Şehirde yürüyüş (Yüksek) | Uçuş (Düşük) |
|---|---|---|---|
| Çizim çağrısı (gölge dahil) | 460 | 499 | 251 |
| Gölge geçişinin eklediği çizim | +100 | +160 | gölge kapalı |
| Üçgen | 662 bin | 747 bin | 551 bin |
| Sahnedeki ağ (mesh) | 3 232 | 3 449 | — |
| Gölge düşüren ağ | 2 052 | 1 949 | — |
| Doku | 476 adet · ~111 MB | | |
| Malzeme | 1 342 | | |
| Geometri | 846 | 1 068 | |
| JS belleği | ~130–145 MB | | |
| Açılış (sayfa hazır) | 8–10 sn (yazılım GPU'suyla 25–30 sn) | | |
| Oyun mantığı (JS) | kare başına < 1 ms | | |

Bulgular:
1. **Darboğaz GPU ve çizim tarafında.** Oyun mantığı kare başına 1 ms'nin altında. FPS'i düşüren şeyler çizim sayısı, gölge geçişi, çözünürlük (doluluk) ve efektler.
2. **Çizimlerin çoğu birleştirilmemiş tekil nesnelerden geliyor:** uçuşta görüş alanında 527 tekil nesne var. Birleştirme 1 178 adaydan yalnızca 493'ünü kapsıyor (%42) ve bekçi bunların bir kısmını sonradan çözüyor (493'ten 441'e). Yani bazı nesneler sürekli değişiyor ve hücreleri bozuyor.
3. **Uçak modelleri çok parçalı.** Oyuncunun KAAN'ı 126 parça. İHA üssündeki sergi uçakları yürürken 275 çizim tutuyor.
4. **Gölgede her şey var:** 2 052 ağ gölge düşürüyor, küçük süs eşyaları da dahil.
5. **Doku belleği zayıf telefon için fazla:** ~111 MB. Tabela dokuları tek başına 2048×256 boyutunda, her biri 2,7 MB.
6. **Malzeme sayısı yüksek (1 342).** Bu hem birleştirmeyi zorlaştırıyor hem shader geçişlerini artırıyor.
7. **Arazi tek parça:** her kalitede ~180 bin üçgen.
8. **Bilgisayarda 25 fps, telefonda 45 fps.** En güçlü aday **logaritmik derinlik**. Bilgisayarda varsayılan olarak açık, telefonda kapalı. Bu yöntem her pikselde derinliği shader içinden yazıyor (`gl_FragDepth`); Android rehberine göre bu, GPU'nun gizli pikselleri baştan elemesini (erken derinlik testi, Early-Z) kapatıyor. Sonuçta binaların, ağaçların ve arazinin arkasında kalan her piksel de tam maliyetle boyanıyor. Diğer adaylar: yüksek ekran çözünürlüğü, Ultra gölge haritası (4096) ve 3–4 tam ekran efekt geçişi (parlama, renk düzeltme, FXAA). V2.12 testi derinlik modunu da açıp kapatarak bunu doğrulayacak.
9. **Çift yüzlü malzeme:** 73 yerde arka yüzler de çiziliyor (`DoubleSide`). Rehber, katı nesnelerde arka yüz elemesinin açık olmasını istiyor.
10. **Doku süzme:** dokularda 8× anizotropik süzme var. Rehbere göre mobilde 2×'in üstü çok pahalı; doku süzme GPU enerjisinin yarısına kadarını tüketebiliyor.
11. **Birleştirilmiş hücreler 65 535 köşeyi aşabiliyor.** Rehber bu sınırın altında kalmayı öneriyor; bazı eski GPU'larda büyük ağlar eksik ya da hiç çizilmeyebiliyor.

## Hedef bütçeler

| Kademe | Çizim çağrısı | Üçgen | Doku belleği | FPS hedefi | Açılış |
|---|---|---|---|---|---|
| Düşük (eski / ucuz telefon) | ≤ 180 | ≤ 250 bin | ≤ 50 MB | 30 sabit | ≤ 6 sn |
| Orta (çoğu telefon, tablet) | ≤ 250 | ≤ 500 bin | ≤ 70 MB | 45–60 | ≤ 5 sn |
| Yüksek (bilgisayar) | ≤ 350 | ≤ 800 bin | ≤ 120 MB | 60 sabit | ≤ 4 sn |
| Ultra (güçlü bilgisayar) | ≤ 450 | ≤ 1,2 milyon | ≤ 200 MB | 60+ | ≤ 4 sn |

FPS hedefleri ortalamaya göre değil, **P90 ve P99'a** göre ölçülür. P90, karelerin %90'ının bu değerin üstünde olduğu FPS; P99 ise takılmaları gösterir. Ortalama 60 olup P99'u 15 olan oyun takılıyor demektir. Google Play'in "yavaş oturum" ölçütü de eklenir: karelerin %25'inden fazlası 20 fps'in altındaysa oturum yavaş sayılır. Düşük kademe için üçgen bütçesi Android rehberindeki örneğe göre düşürüldü: telefonda 30 fps'te ~210 bin üçgen.

Bu bütçeler V2.26'da yayın kapısına eklenecek: bütçe aşılırsa yayın durur.

## Android oyun performansı rehberinden çıkanlar

Google'ın [oyun performansı rehberi](https://developer.android.com/games/optimize/gameperformance?hl=tr) ve alt sayfaları incelendi. Rehberin önerdiği yöntem altı adımlık bir döngü: sahne sahne ölç → darboğaz CPU'da mı GPU'da mı bul → CPU'yu iyileştir → GPU'yu iyileştir → önce/sonra (A/B) karşılaştır → hedefe ulaşana kadar tekrarla. Bu yol haritası aynı döngüyü izliyor: V2.12 ölçüm, V2.13–V2.19 iyileştirme, her sürümde önce/sonra karşılaştırması.

| Rehberin önerisi | Bizdeki durum | Nereye eklendi |
|---|---|---|
| Sahne sahne ölç; ortalama, P90, P99 FPS | Yalnızca anlık FPS göstergesi var | V2.12 |
| CPU mu GPU mu, önce bunu belirle | Ölçüm: JS kare başına < 1 ms, yani GPU tarafı | V2.12 (cihazda doğrulanır) |
| Erken derinlik testini (Early-Z) bozma: `gl_FragDepth`, gereksiz `discard` yok | Bilgisayarda logaritmik derinlik açık; ağaç ve çitlerde alfa testi (`discard`) var | V2.16 |
| Gereksiz render geçişlerini kaldır, geçişleri birleştir | Parlama + renk düzeltme + FXAA ayrı tam ekran geçişler | V2.16 |
| Efekt tamponlarında yarım hassasiyetli (half-float) biçim | Yalnızca HDR'de kullanılıyor | V2.16 |
| Katı nesnelerde arka yüz elemesi | 73 çift yüzlü malzeme | V2.15 |
| Uzak ve küçük nesnede az üçgen; her LOD kademesinde ~%50 azaltma; 10 pikselden küçük üçgenden kaçın | Uzak nesneler tam ayrıntılı | V2.14, V2.19 |
| Ağ başına en çok 65 535 köşe | Birleştirilmiş hücreler aşabiliyor | V2.13 |
| Sabit nesneleri topla (batch) | Birleştirme %42 kapsamda | V2.13 |
| Doku sıkıştırma (ASTC, ETC2) bellekte 8 kata kadar kazanç | Dokular sıkıştırılmamış | V2.17 |
| Sabit mesafede görülen dokuda mipmap yok (+%33 bellek) | Bütün dokularda mipmap var | V2.17 |
| Anizotropik süzme mobilde en çok 2× | 8× | V2.17 |
| Tek renkli yüzeyde gri doku + köşe rengi | Kısmen (birleştirmede köşe rengi var) | V2.17 |
| Opak malzemeyi tercih et, üst üste saydamlığı azalt | 16–21 saydam nesne görüşte | V2.13 |
| Renk ve UV için düşük hassasiyet (mediump) | Her yerde highp | V2.16 (Düşük kademede deneme) |
| Ekranı kaplayan arayüzün arkasında dünyayı çizme | Menüde 10 fps çiziliyor | V2.16 (tamamen durur) |
| Ekran yenileme hızını hedef FPS'e eşle | 120 Hz telefonda oyun 120 fps'e çıkmaya çalışıyor | V2.16 |
| Isınmayı izle, sürdürülebilir kaliteye in | İzlenmiyor | V2.12 (ölçüm), V2.16 (tepki) |

Web oyununa uymayan öneriler:
- **Vulkan, Swappy kare düzenleyicisi, ADPF ısı API'si ve Oyun Modu API'si** yalnızca Android'in yerel uygulamaları içindir. Tarayıcı oyunu bunlara erişemez.
- Bunların yerine şunlar kullanılacak: ısınmayı kare süresinin zaman içindeki eğiliminden çıkarmak, FPS sınırını ekran yenileme hızına göre seçmek, kaliteyi kendiliğinden ayarlamak.
- Vulkan'ın tarayıcıdaki karşılığı **WebGPU**. Android'de WebGPU, Vulkan üzerinden çalışıyor. Bu, three.js sürüm yükseltme kararına bağlı uzun vadeli bir seçenek (V2.26 karar raporu).

---

## 1. Optimizasyon yol haritası

| Sürüm | Başlık | İçerik | Başarı ölçütü |
|---|---|---|---|
| V2.12 | **Performans ölçer ve cihaz raporu** | **Oyun içi ölçüm:** Ayarlar → Grafik → "Performans testi". 60 saniyelik sabit uçuş rotası ve 30 saniyelik şehir yürüyüşü kendiliğinden oynar. Sahneler: uçuş, alçak uçuş, şehir, İHA üssü, liman, orman. Ölçülenler: ortalama, P90 ve P99 FPS, "yavaş oturum" oranı (20 fps altı kare yüzdesi), kare süresi grafiği, takılma sayısı (50 ms üstü kareler), JS süresi ile toplam kare süresi karşılaştırması (CPU mu GPU mu; tarayıcı destekliyorsa GPU zaman sorgusu da), isteğe bağlı 5–10 dakikalık ısınma testi, çizim, üçgen, doku belleği, GPU adı, ekran çözünürlüğü, piksel oranı. Her özelliğin (gölge, efekt, çözünürlük, ağaç, **derinlik modu**) maliyeti tek tek kapatılıp ölçülür. **Rapor gönderme:** senin onayınla Supabase'e anonim rapor olarak gider; yönetim panelinde cihaz cihaz listelenir. Böylece senin bilgisayarının ve telefonunun gerçek darboğazı görülür. **Ekranda canlı gösterge:** FPS göstergesi kare süresi çizgisi ve çizim sayısıyla genişler. | Senin bilgisayarından ve telefonundan birer rapor gelmiş olması; her özelliğin ms cinsinden maliyeti bilinmesi |
| V2.13 | **Birleştirme 2.0** | Kapsam %42'den %85+'ya çıkar: hücre başına en az nesne sınırı 3'ten 2'ye iner; küçük ve orta nesnelerde hücre 800 m'den 1,6 km'ye büyür; çok malzemeli ağlar malzeme başına parçalanıp birleştirilir. **Bozulma nedeni bulunur:** hücreleri sürekli çözen nesneler (gece-gündüz ışıkları, LOD geçişleri, animasyonlu tabelalar) tespit edilip birleştirmeden çıkarılır, böylece hücreler kalıcı olur. Saydam nesneler (cam, su kenarı) kendi aralarında birleşir; mümkün olanlar opak olur. **Her birleştirilmiş ağ 65 535 köşenin altında tutulur** (16 bitlik indeks, eski GPU'larla uyum). **Malzeme önbelleği:** aynı ayarlı malzemeler tek malzemeye iner (1 342'den ~300'e). | Uçuşta Yüksek'te 460 → ≤ 300 çizim; hücre çözülmesi 0; görsel fark yok (önce/sonra ekran görüntüsü) |
| V2.14 | **Araç ve uçak modellerinde parça birleştirme** | **Oyuncu uçağı:** hareketli yüzeyler (dümen, flap, iniş takımı, kanopi) ayrı kalır, gövdenin geri kalanı renk başına tek parça olur: KAAN'da 126'dan ~15 parçaya. **Park ve sergi uçakları:** tek parça. Uzakta sade sürüm, çok uzakta düz resim (impostor) gösterilir. Her ayrıntı kademesinde üçgen sayısı ~%50 azalır, siluet korunur. Ekranda 10 pikselden küçük üçgen kalmaz. **Yapay zekâ ve trafik uçakları, araçlar, gemiler:** aynı yöntem. Binince parçalı hale döner, inince yine birleşir. | İHA üssünde yürürken 499 → ≤ 300 çizim; oyuncu uçağı ≤ 20 çizim |
| V2.15 | **Gölge 2.0** | Gölgeyi yalnızca büyük ve yakın nesneler düşürür (bina, uçak, araç, ağaç kümesi); bank, tabela, lamba gibi küçük nesneler düşürmez. Gölge haritası her karede değil, kamera ya da güneş belirgin hareket edince güncellenir. Gölge kalitesi 4 kademe olur: Kapalı · Düşük (1024) · Orta (2048) · Yüksek (4096, yalnız bilgisayar). Telefonda yumuşak gölge kapalıdır. **Arka yüz elemesi:** 73 çift yüzlü malzeme taranır; yalnızca gerçekten ince yüzeylerde (bayrak, yaprak, tabela) çift yüz kalır. | Gölge geçişinin eklediği çizim +100–160 → ≤ +40; gölge açıkken FPS kaybı ≤ %15 |
| V2.16 | **Derinlik, çözünürlük ve efekt geçişleri** | Bilgisayardaki 25 fps sorunu için. **Derinlik:** logaritmik derinlik kaldırılır. Uzak pist titremesi telefonlardaki gibi hareketli yakın düzlem ve iki katmanlı derinlikle çözülür; böylece erken derinlik testi (Early-Z) bilgisayarda da çalışır. Ağaç ve çitlerdeki alfa testi (`discard`) yalnızca gereken yerde kalır. **Efekt geçişleri:** renk düzeltme ve FXAA tek geçişte birleşir; parlama çeyrek çözünürlükte ve daha az kademeyle çizilir; efekt tamponları yarım hassasiyetli olur. **Piksel oranı sınırı:** telefonda kademeye göre 1,0–1,5, bilgisayarda en çok 1,5 (4K ekranda her pikseli çizmek yerine). **Dinamik çözünürlük:** kare süresi hedefi aşınca iç çözünürlük %100'den adım adım %50'ye iner, düzelince geri çıkar; titremesin diye bekleme payı var. **Efektler:** parlama (bloom) yarı çözünürlükte çizilir, FXAA yerine telefonda kenar yumuşatma kapalı. Menü, harita ve duraklatma ekranında 3B sahne tamamen durur. **FPS sınırı ekran yenileme hızına göre:** 120 Hz'de 60/40/30, 90 Hz'de 45/30, 60 Hz'de 60/30; böylece kareler eşit aralıklı gelir ve pil boşa harcanmaz. **Sürdürülebilir kalite:** kare süresi birkaç dakika boyunca yükselirse (ısınma) kalite bir kademe iner ve orada kalır; ileri-geri zıplamaz. **Hassasiyet:** Düşük kademede renk hesapları için mediump denenir (büyük haritada konum hatası yoksa kalır). | Bilgisayarında P90 ≥ 55 fps (V2.12 raporuyla doğrulanır); telefonda kademesinin FPS hedefi 10 dakika boyunca sabit |
| V2.17 | **Bellek ve dokular** | Tabela ve yazı dokuları tek doku atlasında toplanır. Telefonda doku boyutları yarıya iner (2048×256 → 1024×128). Sabit mesafeden görülen dokularda (arayüz, gösterge, yakın tabela) mipmap kaldırılır (her biri %33 tasarruf). Anizotropik süzme telefonda 2×, bilgisayarda 4–8× olur. Doku boyutları ikinin kuvveti yapılır. Dışarıdan yüklenen modellerin dokuları sıkıştırılmış biçimde (KTX2/Basis; telefonda ASTC ya da ETC2'ye dönüşür) yüklenir. Tek renkli yüzeylerde renkli doku yerine gri doku ve köşe rengi kullanılır. Kademeye bağlı "Doku kalitesi" gelir. **Geometri paylaşımı:** aynı şekiller tek geometriyi kullanır (846 geometri hedefi ≤ 400). **Sızıntı denetimi:** 10 görev art arda açılıp kapatılınca bellek artmamalı; artarsa test yakalar. | Doku belleği Düşük'te ≤ 50 MB, Yüksek'te ≤ 120 MB; 10 görev sonunda bellek artışı ≤ %5 |
| V2.18 | **Açılış hızı** | **Aşamalı kurulum:** önce ada, üs ve oyuncu uçağı kurulur, oyun açılır; uzak köyler, şehirler ve süs nesneleri arka planda parça parça eklenir. **Shader ön derleme:** malzemeler yükleme ekranında tarayıcının paralel derleme özelliğiyle (KHR_parallel_shader_compile) takılmadan derlenir. Böylece ilk kez görülen nesnede donma olmaz. **Envanter verisi** (416 KB) yalnızca kütüphane açılınca yüklenir. Yükleme çubuğu gerçek ilerlemeyi gösterir. İkinci açılış service worker önbelleğinden gelir. | Açılış ≤ 5 sn (orta telefon); oyun içinde ilk görüşte donma (50 ms+) sayısı 0 |
| V2.19 | **Arazi ayrıntı kademeleri** | Tek parça arazi (180 bin üçgen) parçalara bölünür. Yakın parça ayrıntılı, uzak parça sade çizilir (3 kademe), parça kenarlarında yarık kalmaz. Yükseklik hesabı çizilen ağdan ayrılır (yükseklik haritası), yani arazi sadeleşince uçak ve araçlar yere gömülmez. Deniz yüzeyi de kademeli olur. | Arazi üçgeni ≤ 60 bin (Düşük) / ≤ 120 bin (Yüksek); yer teması testleri geçer |

## 2. Grafik ayarları yol haritası

| Sürüm | Başlık | İçerik | Başarı ölçütü |
|---|---|---|---|
| V2.20 | **Grafik ayarları 2.0** | **Tek hazır ayar satırı:** Otomatik (cihaza göre) · Düşük · Orta · Yüksek · Ultra · Özel. Bugün aynı işi yapan üç ayrı satır ("Cihaza göre ayarla", "Performans modu", "Akıllı performans") bunun içine toplanır. **Ayrıntılı ayarlar** (Gelişmiş açıkken; değişince hazır ayar "Özel" olur): Çözünürlük ölçeği (kaydırıcı %50–100 + Dinamik), Görüş mesafesi, Nesne ayrıntısı (küçük nesnelerin görünme mesafesi), Ağaç yoğunluğu, Gölge kalitesi (4 kademe), Doku kalitesi, Efektler tek tek (parlama, hız bulanıklığı, renk düzeltme), Kenar yumuşatma türü, Su ve bulut kalitesi, FPS sınırı (30 · 60 · Sınırsız). **Maliyet etiketi:** her ayarın yanında etki düzeyi (az · orta · çok), V2.12 ölçümlerinden. **Canlı fark:** bir ayar değişince 3 saniye boyunca FPS ve çizim farkı gösterilir. **Sorun giderme penceresi:** Derinlik hassasiyeti, İki katmanlı derinlik, Güvenli grafik modu, Görüntü sorunu testi ve Grafik tanılama Grafik sekmesinden çıkıp "Grafik sorun giderme" penceresine taşınır. | Grafik sekmesi ≤ 8 temel satır; her kademe hedef bütçede; ayar değişimi yeniden başlatma istemez |
| V2.21 | **Bütün ayarların gözden geçirmesi** | **Tekrarlar kaldırılır:** "Telsiz altyazıları" hem Ses hem Erişilebilirlik'te, "Kumanda titreşimi" hem Kontroller hem Erişilebilirlik'te, "Çubuk hassasiyeti" Kontroller'de iki kez (kumanda ve dokunmatik; adları ayrışır). **Kontroller sekmesi** (15 satır ve tuş atama tablosu) Klavye-fare · Kumanda · Dokunmatik alt gruplarına ayrılır. **Arama** bütün sekmelerde çalışır. Her ayarın açıklaması ve "Varsayılana dön" düğmesi olur. **Eski kayıt anahtarları** birleşir (vol/volume gibi); arayüzü olmayan ayarlar ya arayüze çıkar ya kaldırılır (58 anahtar taranır). | Tekrar eden satır 0; her satırın açıklaması var; telefon yatay ekranda bütün sekmeler kaydırmadan okunur ya da düzgün kayar |

## 3. Teknik borç yol haritası

| Sürüm | Başlık | İçerik | Başarı ölçütü |
|---|---|---|---|
| V2.22 | **Kanca (olay) sistemi** | Bugün modüller birbirini fonksiyon sarmalayarak genişletiyor: 250 sarmalama zinciri var (drawHUD 10 kat, ayar senkronu 10, update 8, görev kurulumu 7…). Bu zincirler sıranın belirsiz olmasına ve bir modülün hatasının diğerlerini durdurmasına yol açıyor; ad çakışmalarını da bu yüzden yaşadık. Yerine **kanca kaydı** gelir: `HOOK.on('update', fn)`, `HOOK.on('hud', fn)`, `HOOK.on('settings', fn)`, `HOOK.on('missionSetup', fn)`. Sıra açık yazılır, her kanca hata yalıtımlıdır, her kancanın süresi ölçülür (V2.12 ölçerine bağlanır). | Sarmalama zinciri 250 → ≤ 30; davranış değişmez (bütün testler geçer) |
| V2.23 | **Kod düzeni** | 23 adet "98x" yama modülü (98b-menu3 … 98w) ait oldukları ana modüllere taşınır ya da konu klasörlerine ayrılır (ekran, uçuş, dünya, ağ, performans). Ölü kod taraması yapılır: kullanılmayan fonksiyonlar, eski ana menü tasarımları ("Ana menü tasarımı" ayarındaki 3 tasarımın gerçekten kullanılıp kullanılmadığı sana sorulur), eski görev ekranı kalıntıları. Büyük modüller (ai-net 41 KB, library 40 KB, input-menu 33 KB) anlamlı parçalara ayrılır. | 98x modülü 0; modül adları konusunu söylüyor; derlenmiş dosya ≥ %10 küçük |
| V2.24 | **Kayıt ve depolama düzeni** | 28 ayrı tarayıcı kaydı iki farklı önekle tutuluyor (`kaan-sim-*` ve `ayy-*`). Hepsi tek, sürüm numaralı bir kayıt şemasına taşınır; eski kayıtlar otomatik dönüştürülür. Bozuk kayıtta oyun açılmaya devam eder ve yedekten döner. Hesap senkronu tek yerden yapılır. Grafik ayarları cihaza özel kalır (siyah dalgalanma dersi). | Kayıt anahtarı 28 → 1 (+ yedek); eski kayıtla açılış testi geçer |
| V2.25 | **Girdi yöneticisi** | 28 ayrı klavye dinleyicisi tek girdi yöneticisinde toplanır. Bağlama göre çalışır: uçuş, yürüyüş, araç, menü, harita. F tuşlarının çakışma tablosu çıkar (F2–F8 farklı modüllere dağılmış durumda). Bütün kısayollar Kontroller'de düzenlenebilir olur ve yardım ekranında kendiliğinden listelenir. | Klavye dinleyicisi 28 → 1; çakışan kısayol 0 |
| V2.26 | **Test ve yayın hattı** | **Hız:** testler 13 dakikadan paralel çalıştırmayla ~3 dakikaya iner. **Bütçe kapısı:** tarayıcı denetimi çizim, üçgen ve doku bütçesini aşan sürümü durdurur. **Görsel regresyon:** her ana ekranın telefon (yatay) ve bilgisayar ekran görüntüsü önceki sürümle karşılaştırılır. **Yayın betiği depoya alınır** (tools/release.sh), böylece her adım belgeli olur. **three.js sürümü:** r128 (2021) ile güncel sürüm karşılaştırması ayrı bir karar raporu olarak yazılır. Güncel sürümde BatchedMesh ve asenkron shader derleme var, ama geçiş modül paketleme gerektiriyor; karar sana bırakılır. | Test süresi ≤ 4 dk; bütçe ve görsel kapı yayında çalışıyor |

## 4. Genel gözden geçirme ve derleme yol haritası

Amaç: şimdiye kadar yapılan 90'dan fazla sürümün derli toplu, tutarlı ve belgeli hale gelmesi. Bu aşamada yeni özellik eklenmez.

| Sürüm | Başlık | İçerik | Başarı ölçütü |
|---|---|---|---|
| V2.27 | **Özellik envanteri** | Oyundaki her özellik için bir kart çıkar: ne yapar, nereden açılır, hangi tuş, hangi sürümde geldi, testi var mı, belgesi var mı, durumu (iyi · iyileştirilmeli · birleştirilmeli · kaldırılmalı). Çıktı docs/OZELLIKLER.md ve sana sunulan karar listesi olur. Kaldırma ve birleştirme kararlarını sen verirsin. Oyunda "Rehber" bölümü bu envanterden üretilir. | Her özelliğin kartı var; karar listesi senin onayından geçmiş |
| V2.28 | **Ekran ve akış sadeleştirme** | Ana menü, hızlı oyun ve kariyer ayrımı, görev ekranı, harekât, hangar, okul ve ehliyet, kütüphaneler, yönetim paneli tek tek gözden geçirilir. Tekrar eden girişler ve aynı yere giden iki yol birleşir. Bütün ekranlarda geri ve kapat davranışı aynı olur (✕ her zaman sağ üstte, Esc ve geri tuşu aynı işi yapar). Her ekran telefon yatay, telefon dikey, tablet ve bilgisayarda denetlenir. | Her ekran 4 cihaz boyutunda taşmasız; aynı işe giden ikinci yol 0 |
| V2.29 | **Oynanış ve metin tutarlılığı** | Araçlar arası kontrol mantığı aynı olur (ateş, gaz, kamera, bin-in). Görev ödülleri ve TP dengesi gözden geçirilir. Ehliyet görevleri araç sınırlarına uygunluk açısından taranır (İHA'ya 300 m irtifa vermek gibi mantık hataları). Telsiz konuşmaları ve arayüz metinlerinde Türkçe yazım denetimi yapılır, terim sözlüğü çıkarılır (aynı şeye iki farklı ad verilmez). | Mantık hatası taraması temiz; terim sözlüğüne aykırı metin 0 |
| V2.30 | **Belgeler ve sürüm geçmişi** | CHANGELOG (92 sürüm) dönem özetleriyle gruplanır (V1.0–V1.5 temel, V1.6–V1.9 kariyer ve çok oyunculu …). README, MIMARI ve oyuncu rehberi güncellenir. Bütün yol haritaları tek belgede birleşir. Model yenileme serisi bu sürümden sonra kaldığı yerden devam eder. | Belgeler güncel; yeni katkıcı yalnız belgelerle model ekleyebilir |

---

## Sonrası

- **V2.31+ Model yenileme serisi:** KAAN, TB2, TB3, Akıncı, Kızılelma, ANKA ve ANKA-3, Aksungur, Hürjet ve Hürkuş, helikopterler, kara araçları, gemiler. Ölçü denetiminde sapan modeller (ANKA-3 +%37, Kızılelma +%18, Hürjet +%17) öncelikli. Her model onayına sunulur. V2.14'teki parça birleştirme sayesinde yeni modeller baştan az çizimle yapılır.
- Önceki öneriler listesi (sezon etkinlikleri, liderlik tabloları, filo sistemi, gerçekçi uçuş modu, video paylaşma, gece görevleri, tıklanabilir kokpit) model serisinden sonra sıralanır.

## Kaynaklar

- [100 Three.js performance tips (Utsubo)](https://www.utsubo.com/blog/threejs-best-practices-100-tips): mobilde çizim bütçesi, piksel oranı sınırı, birleştirme ve örnekleme
- [three.js forum: LOD, birleştirme ve BatchedMesh](https://discourse.threejs.org/t/when-is-it-actually-beneficial-to-use-lod-in-three-js-for-performance/87697/11): tek parça birleştirme ile BatchedMesh arasındaki farklar
- [MDN: KHR_parallel_shader_compile](https://developer.mozilla.org/docs/Web/API/KHR_parallel_shader_compile): takılmasız shader derleme
- [Khronos: KHR_parallel_shader_compile](https://registry.khronos.org/webgl/extensions/KHR_parallel_shader_compile/)
- [three.js forum: doku performansı](https://discourse.threejs.org/t/texture-performance/24297)
- [three.js forum: uygulamayı otomatik ölçekleme](https://discourse.threejs.org/t/how-do-you-automatically-scale-your-webgl-applications/3592): dinamik çözünürlük
- [detect-gpu (pmndrs)](https://github.com/pmndrs/detect-gpu): GPU'ya göre kademe seçimi
- [Android: Oyun performansı iş akışı](https://developer.android.com/games/optimize/gameperformance?hl=tr)
- [Android: CPU ve GPU optimizasyon ipuçları](https://developer.android.com/games/optimize/optimization-tips?hl=tr): Early-Z, render geçişleri, ASTC, hassasiyet, arka yüz elemesi
- [Android: Kare hızı](https://developer.android.com/games/optimize/framerate?hl=tr): P90/P99, yavaş oturum
- [Android: Geometri](https://developer.android.com/games/optimize/geometry?hl=tr): 65 535 köşe, küçük üçgen, LOD
- [Android: Dokular](https://developer.android.com/games/optimize/textures?hl=tr): sıkıştırma, mipmap, anizotropi
- [Android: Malzemeler](https://developer.android.com/games/optimize/materials?hl=tr): opaklık, aşırı çizim, shader maliyeti
- [Android: Isı (ADPF)](https://developer.android.com/games/optimize/adpf/thermal?hl=tr)
- [Android: Güç verimliliği](https://developer.android.com/games/optimize/power?hl=tr)
