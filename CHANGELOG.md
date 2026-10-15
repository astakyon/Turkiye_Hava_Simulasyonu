# Değişiklik Günlüğü — Ay Yıldız: Hedef Kızıl Elma
Biçim: `## Vx.xx — tarih`. Her güncellemede sürüm numarası artırılır (`bump_version.py`).

## V2.29 — 2026-10-15 · Ana menü: Hızlı Oyun ve Kariyer
- **BAŞLA kalktı:** ana menünün ilk sırasında artık **Hızlı Oyun**, **Kariyer** ve **Çok Oyunculu** var. Kariyer'e ulaşmak için ara bir menüden geçmek gerekmiyor.
- **Hızlı Oyun:** BAŞLA'nın içindeki her şey Kariyer hariç buraya taşındı: Hemen Başla (en son aracınla tek tıkla), Serbest Uçuş / Sürüş, Hızlı Görev ve Üssü Gez. Kariyerden bağımsız: her şey açık, tecrübe puanı ya da rütbe ilerlemesi kariyere işlemiyor.
- **Hızlı Savaş (yeni):** botlara karşı, havada başlayan dört hızlı mod. Uçak en son kullandığın uçak; it dalaşı modlarında yavaş bir İHA seçiliyse yerine KAAN geliyor.
  - **İt Dalaşı:** üç dalga düşman savaş uçağı, kanat adamın yanında.
  - **Serbest Çatışma:** süre ve hedef yok, dört düşman uçağı ve hava savunması.
  - **Yer Taarruzu:** hava savunmalı yer hedefleri; önlemeye iki düşman uçağı kalkıyor.
  - **Hava Hedefleri:** 8 hedef, 7 dakika.

  Bu modların düşman ve SAM ayarları yalnız o savaş için geçerli; kayıtlı yapay zekâ ayarların değişmiyor.
- **Harekât yalnız Kariyer'de:** "Harekât: Kızıl Elma" Hızlı Oyun'dan çıkarıldı. Hikâye bonusu ve kayıtlı ilerlemesiyle Kariyer'in ilk sırasında duruyor.
- **Geri ve Esc:** Hızlı Savaş'tan Hızlı Oyun'a, Hızlı Oyun'dan ya da Kariyer'den ana menüye dönüyor.

## V2.28 — 2026-10-15 · Görüntü, ses ve dokunmatik düzeltmeleri
- **Uçaktaki gölge titremesi giderildi:** 300 m'nin üstünde gölge haritası her 4 karede bir çiziliyordu. Uçak o arada 10–15 m ilerlediği için kanadın gövdeye, kuyruğun kanada düşen gölgesi saniyede 15 kez yanıp sönüyordu. Artık yüksekte gölge kutusu yalnızca uçağı kapsıyor (150 m yerine birkaç metre), her karede çiziliyor ve uçağın üzerine ortalanıyor. Gölge ayrıntısı yaklaşık 3 kat incelikte (KAAN'da 7 cm yerine 2 cm). Gölge sapması da bu ölçüye göre ayarlandı, gövdedeki koyu bantlar kalktı. Menüdeki uçuş görüntüsü için de aynısı geçerli.
- **Telefonda daha net görüntü:**
  - Yüksek ve Ultra kalitede kenarlar artık 4× MSAA ile yumuşatılıyor. Eskiden FXAA kullanılıyordu; kenarları bulanıklaştırıyor ve tırtıklı bırakıyordu.
  - Otomatik çözünürlük telefonda en çok %80'e iniyor (eskiden %70). 2,8× ekranda görüntü 1,2× çizilmişti, pikselleşme buradan geliyordu.
  - FPS yine düşerse önce efektler ve gölgeler kısılıyor, 60 FPS hedefi korunuyor.
- **Gökyüzünde renk bantları yok:** gökyüzü geçişi ve renk düzeltmesi, gözle görülmeyen ince bir gürültüyle (dither) çiziliyor. Ufuk üstündeki basamak basamak renk şeritleri kayboldu.
- **Müzik ara ara çalıyor:** menü ve uçuş teması yaklaşık bir dakika çalıyor, sonra 1,5–3,5 dakika sessizlik oluyor (motor, rüzgâr ve telsiz duyuluyor). Her yeni bölüm başka bir tonda ve bazen daha sade bir düzenlemeyle başlıyor. Çatışma müziği tehlike anında hemen giriyor; uzun çatışmalarda tonu değişiyor. Müzik sesinin varsayılanı %60'tan %45'e indi. Ayarlar → Ses → Müzik sıklığı: Ara ara · Sürekli · Yalnız çatışma.
- **Telefonda iniş takımı düğmesi:** FLARE'in yanına her zaman görünen yuvarlak bir TEKER düğmesi geldi. Düğme takımın durumunu gösteriyor (▼ AÇIK / ▲ KAPALI). Eskiden üst çubuğun sonunda yalnızca havadayken çıkan, kolay gözden kaçan bir "TAKIM" yazısıydı.
- **Yol haritası:** senin istediğin üç sürüm araya girdi:
  - V2.28 bu düzeltmeler;
  - V2.29 ana menüde Hızlı oyun ve Kariyer;
  - V2.30 mühimmat yerleşimi ve zemine gömülme.

  Test ve yayın hattı V2.31'e, model serisi V2.36'ya kaydı.

## V2.27 — 2026-10-15 · Girdi yöneticisi
- **Tek girdi yöneticisi:** 23 modülün pencereye ayrı ayrı bağladığı klavye dinleyicileri tek bir girdi yöneticisinde toplandı. Tuşlar aynı sırayla ve aynı şekilde çalışıyor; bir modülde hata çıkarsa diğer tuşlar çalışmaya devam ediyor. Her kısayolun hangi modüle ve hangi bağlama (uçuş, yürüyüş, araç, menü, harita…) ait olduğu kayıtlı.
- **Kısayol çakışması yok:** bütün şemalar tarandı; F2 (görev günlüğü), F3 (tekrar), F4 (işaret), F6 (duman), F7 (füzeden kaçış), F8 (kanat adamı) birbirine ya da başka tuşa çakışmıyor. Araç ve tekne kamerasının C tuşu genel kamerayla bilerek aynı. Yeni bir çakışmayı test kendiliğinden yakalıyor.
- **Yardım ekranı:** kontroller yardımı artık helikopter ve deniz aracı dahil bütün şemaları, sonradan eklenen F tuşlarını ve sabit tuşları (1–5, menü okları) kendiliğinden listeliyor. Bütün kısayollar Ayarlar → Kontroller'de değiştirilebiliyor.
- **Eski görev listesi silindi:** V1.76'da görev panosu gelince hiç çalışmayan ilk görev listesinin kodu kaldırıldı (görev ekranının görünüşü ve çalışması aynı).

## V2.26 — 2026-10-15 · Kayıt ve depolama düzeni
- **Tek kayıt:** oyunun tarayıcıya yazdığı 28 ayrı kayıt (ayarlar, profiller, rekorlar, boyalar, yarış ve okul ilerlemesi…) artık tek, sürüm numaralı bir kayıtta duruyor. Güncellemeden sonraki ilk açılışta eski kayıtlar kendiliğinden taşınıyor, doğrulanıyor ve eskileri siliniyor; hiçbir ilerleme kaybolmuyor.
- **Yedek:** her oturumda son sağlam kayıt yedekleniyor. Kayıt bozulursa oyun yedekten açılıyor ve bunu söylüyor; ikisi de bozuksa yeni kayıtla açılıyor (bozuk kayıt silinmeden ayrı saklanıyor).
- **Bulut senkronu:** grafik ayarlarının yeni ayrıntılı grupları ve "Otomatik" seçimi de artık cihaza özel kalıyor (bilgisayarın ayarı telefona geçmiyor).
- **Ana menü:** isteğin üzerine yalnız yeni ana menü kaldı; eski "Komuta" ve "Sinematik" tasarımları ve Arayüz'deki seçim satırı kaldırıldı.
- **Telefon raporundaki sorunlar:** açılış telefonda 12 sn sürmüştü; bunun 7,3 sn'si yükleme ekranındaki doku paylaşımıydı. Bu iş artık yükleme ekranından çıkarıldı, küçük parmak iziyle arka planda birkaç ms'lik dilimlerle yapılıyor. Uçuşta görülen takılmaların şüphelisi olan uzak arazi ağı, her değişimde yeniden kurulmak yerine yerinde güncelleniyor. Performans testi raporu artık her modülün "en uzun tek çağrısını" da gösteriyor, böylece kalan takılmaların kaynağı görülebilecek.

## V2.25 — 2026-10-15 · Kod düzeni
- **Kod düzeni:** 124 modül konu klasörlerine taşındı: çekirdek, dünya, modeller, uçuş, savaş, görev, ekran, kontrol, ses, yürüyüş, ağ, performans ve veri. "98b", "98zf" gibi numaralı yama modülleri kalmadı; her dosyanın adı ne yaptığını söylüyor. Yükleme sırası tek bir listede (`src/js/SIRA.txt`) tutuluyor. Taşımadan sonra oyunun kodu bayt bayt aynıydı.
- **Büyük modüller bölündü:** yapay zekâ ve çevrimiçi oyun (4 parça), model kütüphanesi (3 parça), ana menü (3 parça).
- **Daha küçük dosya:** oyun dosyası 2 011 KB'tan 1 798 KB'a indi (−%10,6). Kod yorumları ve girintiler artık yalnız yayınlanan dosyadan çıkarılıyor (kaynak kodda duruyorlar); envanter verisindeki tekrar eden metinler tek listede toplandı (406 → 329 KB).
- **Temizlik:** kullanılmayan 7 işlev silindi; her açılışta konsola düşen 9 "flatShading" uyarısı ve 35 Canvas uyarısı giderildi.

## V2.24 — 2026-10-15 · Kanca sistemi ve kare başına çöp
- **Kanca kaydı:** modüllerin birbirini genişletme biçimi baştan düzenlendi. 284 "sarmalama"nın 279'u tek bir kanca kaydına taşındı. Artık bir modülde hata çıkarsa yalnız o modül atlanıyor, oyunun geri kalanı çalışmaya devam ediyor (eskiden aynı zincirdeki diğer modüller de duruyordu). Davranış değişmedi; bütün testler aynı.
- **Performans testinde modül maliyeti:** test sonucunda "En pahalı modüller" satırı var: hangi modülün kare başına kaç ms harcadığı görünüyor.
- **Daha az çöp:** uçuşta kare başına üretilen geçici bellek ~%26 azaldı (çöp toplayıcı daha seyrek çalışır, telefonda ani takılma riski azalır). Yapay zekâ uçaklarının parça birleştirmesi artık her hareketli parça için ayrı ayrı değil, bir kerede yeniden kuruluyor (yeniden kurulum 32 → 9); akrobasi algılayıcısı, martılar, koyunlar, trafik, simge yapılar ve HUD yazıları her karede yeni nesne üretmiyor.
- **Ses:** motor sesi sustuğunda 1,5 saniye sonra ses işlemcisinden çıkarılıyor (menüde, yürürken boşa hesaplanmıyor); ses ayarları yalnız değiştiğinde yazılıyor.

## V2.23 — 2026-10-15 · Bütün ayarların gözden geçirmesi
- **Tekrar eden ayarlar kaldırıldı:** "Telsiz altyazıları" artık yalnız Erişilebilirlik'te, "Kumanda titreşimi" yalnız Kontroller → Gamepad'de. İki ayrı "Çubuk hassasiyeti" satırı "Kumanda çubuk hassasiyeti" ve "Dokunmatik çubuk hassasiyeti" oldu.
- **Her satırın açıklaması var:** yalnız yüzde gösteren satırlar (duyarlılık, ölü bölge, düğme boyutu, saydamlık, ses seviyesi…) artık neyi değiştirdiklerini de yazıyor.
- **Varsayılana dön (↺):** bir ayar varsayılandan farklıysa adının yanında küçük ↺ düğmesi çıkıyor; basınca yalnız o ayar varsayılana dönüyor (47 satırda).
- **Arama her yerde:** ayar araması bütün sekmelerde, Kontroller'in Klavye/Gamepad/Dokunmatik panellerinde ve Grafik'in açılır gruplarında buluyor; eşleşen grup kendiliğinden açılıyor.

## V2.22 — 2026-10-15 · Grafik ayarları 2.0
- **Daha sade grafik sekmesi:** temel ayarlar 7 satır: Grafik kalitesi, Gölgeler, Görsel efektler, Çözünürlük, FPS sınırı, Performans testi, Tam ekran. Geri kalanı iki açılır grupta: "Ayrıntılı ayarlar" ve "Grafik sorun giderme" (derinlik, iki katmanlı derinlik, güvenli mod, görüntü testi, tanılama).
- **Otomatik hazır ayar:** Grafik kalitesi satırında Otomatik seçeneği var: cihazına göre kademe seçer ve FPS düşerse ayarları kendiliğinden hafifletir. Aynı işi yapan "Cihaza göre ayarla" ve "Performans modu" satırları kaldırıldı. Hazır ayarın üstüne kendi seçimini yaparsan "Özel" yazıyor; bir hazır ayara dokununca sıfırlanıyor.
- **Ayrıntılı ayarlar:** görüş mesafesi, nesne ayrıntısı, bitki örtüsü, bulutlar, doku kalitesi ve efekt kalitesi artık ayrı ayrı ayarlanabiliyor (her biri "Hazır" ya da Düşük–Ultra). Ayrıca kenar yumuşatma, akıllı performans ve FPS göstergesi burada.
- **Maliyet etiketleri:** her ayarın yanında az · orta · çok etki etiketi var.
- **Canlı fark:** bir grafik ayarını değiştirince hemen altında çizim ve üçgen sayısının nasıl değiştiği görünüyor (ör. "çizim 201 → 200 · üçgen 375 bin → 355 bin"). Hiçbir ayar yeniden başlatma istemiyor (derinlik hassasiyeti hariç).

## V2.21 — 2026-10-15 · Arazi ayrıntı kademeleri
- **Arazi parçalara bölündü:** 30 km'lik tek parça arazi (her karede 180 bin üçgen, kameranın arkası dahil) 5 km'lik 36 parçaya bölündü. Yakındaki parçalar eskisi gibi 100 m ayrıntıda, uzaktakiler 200, 500 ve 1000 m'de çiziliyor; kameranın görmediği parçalar hiç çizilmiyor. Uzak parçalar tek ağda birleştiği için çizim sayısı neredeyse aynı kaldı.
- **Ölçüm (Yüksek kalite):** çizilen üçgen bilgisayarda uçuşta 397 bin → 276 bin, alçak uçuşta 574 bin → 438 bin; telefonda %26–40 daha az (ör. şehirde 1,02 milyon → 754 bin). Çizim sayısı +2–12.
- **Görüntü korunuyor:** yakın arazi eskisiyle aynı noktalardan oluşuyor; dağlık parçalar silüet bozulmasın diye bir kademe daha ayrıntılı kalıyor. Kademe değişiminde titreme olmasın diye bekleme payı var, parça kenarlarındaki yarıklar eteklerle kapanıyor. Önce/sonra ekran görüntüleri neredeyse aynı.
- Uçak ve araçların yer teması etkilenmiyor: yükseklik hesabı çizilen araziden değil, arazi formülünden geliyor.

## V2.20 — 2026-10-14 · Yükleme ekranı 2.0
- **Menü artık hazır açılıyor:** yükleme ekranı kapandıktan sonra menüde süren hazırlık (doku paylaşımı, nesne ve model birleştirme, shader ön derleme, hesap kontrolü) artık yükleme ekranının altında yapılıyor. Profil ve yönetici düğmesi menüyle birlikte geliyor; arkadaki sinematik uçuş görüntüsü takılmadan, baştan başlıyor. Yükleme ekranı kareler düzene girince kapanıyor (en çok 6 sn hazırlık, hesap için en çok 3 sn bekleme).
- **3B ay yıldız:** yükleme ekranında kendi ekseninde dönen, kalınlığı olan bir ay yıldız var. Dönüş tarayıcının ayrı iş parçacığında çalıştığı için oyun kurulurken de akıcı dönüyor.
- **Uçaklı ilerleme çubuğu:** düz çubuk yerine KAAN, HÜRJET, KIZILELMA, AKINCI ve TB2 siluetleri kuyruktan buruna sırayla kırmızıyla doluyor.

## V2.19 — 2026-10-14 · Açılış hızı
- **Yükleme ekranı:** oyun açılırken donmuş menü yerine yükleme ekranı ve gerçek ilerlemeyi gösteren bir çubuk çıkıyor ("Deniz üssü kuruluyor", "Hangar kuruluyor"…). Dünya 17 adımda kuruluyor; tarayıcı arada ekranı çizebiliyor, telefonda "sayfa yanıt vermiyor" uyarısı riski azaldı. Yükleme bitmeden basılan tuşlar ve dokunuşlar yok sayılıyor.
- **Shader ön derleme:** ana menüdeyken sahnedeki bütün malzemeler (gizli patlama parçacıkları, flare'ler, henüz görülmemiş bölgeler dahil) karede ~8 ms ayrılarak önceden derleniyor. Böylece uçarken yeni bir bölgeye ilk girişte shader derleme takılması olmuyor. Menüden hızlı çıkılırsa kalanlar eskisi gibi ilk görüldüğünde derleniyor.
- **Performans testinde açılış süresi:** rapora açılış süreleri (betik, modüller, dünya kurulumu, ilk kare), en uzun kurulum adımı ve önceden derlenen shader sayısı eklendi.
- Envanterin arama metni artık açılışta değil, ilk aramada hazırlanıyor.
- Ölçülen ama değiştirilmeyen: ilk patlama ve flare'de yeni shader derlenmiyor; telefondaki tek 33 ms'lik kare büyük olasılıkla ekran kartı yükü (yeni raporla bakılacak). Envanter verisinin ayrıştırılması 1,6 ms, ertelemeye değmez.

## V2.18 — 2026-10-14 · Bellek ve dokular
- **Doku belleği azaldı:** bilgisayarda ~111 MB'tan ~87 MB'a, telefonda ~111 MB'tan ~44 MB'a. Açılışta tuvalde çizilen 476 dokunun yalnız 321'i farklı resimdi; aynı pencere/tabela resmi her bina için yeniden çiziliyordu. Aynı resim ve aynı ayarlara sahip 145 kopya artık tek dokuyu paylaşıyor, kopyalar bellekten siliniyor.
- **Telefonda büyük dokular yarıya iniyor:** 1024 piksel ve üstü 45 doku (ör. 2048×256 tabelalar) telefonda yarı boyutta. Bilgisayarda Düşük/Orta kalitede yalnız 2048 ve üstü yarıya iniyor; Yüksek/Ultra'da dokunulmuyor. Önce/sonra ekran görüntüleri aynı.
- **Telefonda anizotropik süzme 2×** (Android rehberi: mobilde daha fazlası çok pahalı); bilgisayarda 16×'e kadar kalıyor.
- **Güvenlik bekçisi:** oyun paylaşılan ya da küçültülen bir dokuyu sonradan yeniden çizerse (değişen tabela, ekran) o doku hemen kendi tam boy kopyasına dönüyor. Ölçümde geri dönme olmadı. `SETTINGS.texShare=false` ile tamamen kapanabiliyor.
- Çizim sayısı değişmedi: üsteki binaların dokuları gerçekten farklı resimler; birleşmeleri için doku atlası gerekiyor (sonraya bırakıldı). Doku sıkıştırma (ASTC/ETC2) tuvalde çizilen dokulara uygulanamıyor.

## V2.17 — 2026-10-14 · Derinlik, çözünürlük ve efekt geçişleri
- **Renk düzeltme ve kenar yumuşatma tek geçişte:** bu iki işlem art arda iki ayrı tam ekran geçişti; her biri bütün ekranı okuyup yeniden yazıyordu. Artık tek geçişte yapılıyor: görsel efektler açıkken tam ekran geçiş sayısı 4'ten 3'e indi. Görüntü aynı (önce/sonra karşılaştırması). Birleşik shader mevcut renk düzeltme kodundan otomatik türetiliyor; türetilemezse eski iki geçişli yol kullanılıyor.
- **Tam ekran menülerde 3B sahne çizilmiyor:** ayarlar, görevler, kariyer gibi ekranlar açıkken arkadaki sahne saniyede 10 kare çiziliyordu; artık hiç çizilmiyor, ekran kartı boşta kalıyor. Oyun mantığı (çok oyunculu lobi, sesli sohbet, bulut) çalışmaya devam ediyor. Pencere boyutu değişirse bir kare çiziliyor.
- **Isınmaya karşı sabit kalite:** otomatik kalite 5 dakika içinde 3 kez düşerse (ısınan telefonun kaliteyi sürekli indirip kaldırması), o oturumda o kademede kalıyor; menüye dönünce sıfırlanıyor.
- **Derinlik kararı:** logaritmik derinlik bilgisayarda kalıyor. İlk bilgisayar raporunda maliyeti 1,5 ms (%3) ölçüldü; alternatifi olan iki katmanlı derinlik sahneyi iki kez çizdiği için işlemciye daha pahalı.
- Ölçülüp yapılmayan: kameranın uzak görüş sınırını sise göre kısaltmak. Gökyüzü kubbesi 20 km, sis 26 km'de bitiyor; kısaltmak ufukta deniz ile gökyüzü arasında renk bandı riski taşıyor, kazancı küçük.

## V2.16 — 2026-10-14 · Gölge 2.0
- **Gölge kalitesi 4 kademe:** Ayarlar → Grafik → Gölgeler artık Kapalı · Düşük (1024) · Orta (2048) · Yüksek (4096 ve yumuşak kenar; telefonda en çok 2048). Varsayılan, grafik kalitesine göre seçiliyor. Eski açık/kapalı ayarı kendi kademesine çevrilir.
- **Gölge haritası gerektikçe çiziliyor:** önceden her karede (Ultra'da 4096×4096) yeniden çiziliyordu. Artık yürürken ve yere 300 m'den yakınken her karede, daha yüksekte, menüde ve haritada 4 karede bir çiziliyor. Ölçümde 700 m'de uçarken 5 karenin 4'ünde gölge çizimi atlandı. Güneşin yönü değişince hemen yeniden çiziliyor.
- **Küçük parçalar gölge düşürmüyor:** 1,5 m'den küçük parçalar (lamba, tabela, cıvata, uzaktaki aracın tekeri) artık gölge düşürmüyor; oyuncunun uçağı bütün gölgelerini koruyor. Ölçümde bu, bakılan sahnelerde gölge çizimini azaltmadı (o parçalar zaten gölge alanı dışındaydı), ama yakına gelen nesnelerde yükü sınırlıyor.
- **Ölçülüp bırakılanlar:** V2.14–V2.15 birleştirmelerinden sonra gölge geçişi uçuşta 15–20, şehirde ~45 çizime inmişti (önceden 100–160). Çift yüzlü malzemelerde arka yüz elemesi de ölçüldü: bütün adada 67 bin üçgen; kazanç çok küçük ve içeriden görülen odaları bozma riski olduğu için yapılmadı.

## V2.15 — 2026-10-14 · Araç ve uçak modellerinde parça birleştirme
- **Araç ve uçak modellerinde parça birleştirme:** uçaklar, helikopterler, araçlar ve hedefler ~1 280 küçük parçadan oluşuyordu ve her parça ayrı çiziliyordu (oyuncunun KAAN'ı 126 parça). Artık her modelin hareket etmeyen parçaları malzemelerine göre birkaç ağda toplanıyor. Model yine taksi yapabiliyor, uçabiliyor, binilebiliyor.
  - Hareket eden parçalar (dümenler, iniş takımı, pervaneler, rotorlar) ve görünürlüğü değişenler (füzeler, alevler) ilk hareketlerinde birleşikten ayrılıyor; model kalan parçalarla anında yeniden kuruluyor.
  - Oyuncunun uçağı her karede, çizimden önce denetleniyor: atılan füze kanadın altında asılı kalmaz.
  - Malzeme değişince (boya, hasar) model yeniden kuruluyor. Sürekli değişen bir model 10 saniyede 6'dan fazla yeniden kurulursa birleştirmeden çıkarılıyor.
  - Birleşik ağlar parça boyutuna göre ayrılıyor; uzaktaki uçağın küçük parçaları (anten, cıvata, lamba) kendi boyutlarına göre gizleniyor.
- **Ölçüm (Yüksek kalite):** hangarda 249 → 149 çizim (−%40), uçuşta 382 → 289 (−%24), iniş takımı ve flare sonrası 419 → 330. Oyuncu uçağında görünür parça 93 → 37–42. Görüntü değişmedi (önce/sonra karşılaştırması).
- **Düzeltme:** uzak nesne ayıklamasının liste yenilemesi, birleştirilmiş ya da birleşikten çıkarılmış asıl parçaları 4 saniyede bir yeniden açabiliyordu; artık açmıyor.
- **Not:** İHA üssündeki çizimlerin çoğunu kendi dokusunu kullanan binalar tutuyor (her bina ayrı doku, bu yüzden birleşemiyor). Bunlar doku atlasıyla (V2.18) birleşebilecek.

## V2.14 — 2026-10-14 · Birleştirme 2.0
- **Birleştirme 2.0:**
  - Kapsam: birleşen sabit parça oranı %45'ten %61'e çıktı (1 210 adaydan 741'i). Hücresinde eş bulamayan parçalar 4 kat büyük hücrelerde ikinci kez deneniyor. Camlar ve ışık kapakları gibi saydam parçalar da aynı malzemeli eşleriyle birleşiyor.
  - Kalıcı hücreler: bir parça hareket ettiğinde (kapı, dönen anten) artık bütün hücre dağılmıyor; yalnız o parça ayrılıyor, hücre kalanlarla anında yeniden kuruluyor. Önceki sürümde kısa bir uçuştan sonra birleşik parça sayısı 586'dan 494'e düşüyordu; şimdi 741'den 714'e.
  - Her birleşik parça en çok 65 535 köşe içeriyor; Android rehberine göre bazı ekran kartları daha büyüklerini çizmiyor.
  - Aynı türden dokusuz hücreler tek bir malzemeyi paylaşıyor (daha az shader ve durum geçişi).
  - Şehirde ve ormanda çizilen üçgen sayısı ~%14 azaldı. Çizim çağrısı sayısı bu sürümde değişmedi: birleşen parçaların çoğu zaten uzakta gizlenen küçük nesnelerdi. Çizimlerin asıl kaynağı park uçakları ve araçlar; onlar V2.15'te.
- **Sabit nesnelerin konum hesabı donduruldu:** hiç hareket etmeyen ~3 300 nesnenin konum matrisi artık her karede yeniden hesaplanmıyor (her karede güncellenen nesne 4 098 → 778). Ölçümde bu iş kare başına ~%45 kısaldı; işlemcisi sınırda olan telefonlarda kazanç daha büyük. Oyun bir nesneyi hareket ettirirse bekçi onu en geç çeyrek saniyede çözer.
- **Görüş alanı ayıklaması denetlendi:** ayıklaması kapalı kalan 28 nesnenin hepsi adaya yayılan hareketli gruplar (yayalar, trafik, martılar, bulutlar) ve hava efektleri; bunlar için doğru seçim.

## V2.13 — 2026-10-13 · Efekt zinciri ve akıllı kalite
- **İlk gerçek ölçüme göre efekt zinciri yenilendi.** Bilgisayar raporunda (Intel UHD, Ultra) karenin %61'ini görsel efektler alıyordu: sahne 8 kat kenar yumuşatmalı, yüksek hassasiyetli bir ara görüntüye çiziliyor, üstüne tam çözünürlükte parlama ekleniyordu.
  - **Tümleşik ekran kartlarında** (Intel, AMD tümleşik): yüksek hassasiyetli ara görüntü ve otomatik 8× kenar yumuşatma yok, yerine FXAA. Elle 8× seçilirse 4×'e iner. Parlama çeyrek çözünürlükten hesaplanır ve yalnız Ultra'da açılır.
  - Diğer ekran kartlarında da parlama yarım çözünürlükten başlıyor. Ultra ve ayrı ekran kartında tam çözünürlük korunuyor.
- **Kare zamanlaması:** FPS sınırına **Otomatik** seçeneği eklendi (varsayılan). 60 Hz ekranda 60'ı tutamayan cihaz, 33 ve 50 ms arasında gidip gelen titrek kareler yerine eşit aralıklı 30 FPS'e sabitlenir. 20 saniyede bir sınırsız dener; 60 tutarsa sınır kalkar.
- **Performans testi sonucunda "Önerilen ayarları uygula":** ölçülen maliyetlere göre hedef FPS'e ulaştıran ayar seti tek dokunuşla uygulanır. Darboğaz işlemcideyse bunu söyler ve ayarlarla çözülemediğini belirtir.
- **Tümleşik ekran kartı uyarısı:** oyun güçlü bir dizüstünde tümleşik kartla çalışıyorsa test sonucu ve ilk açılış, tarayıcının NVIDIA/AMD karta nasıl geçirileceğini anlatır (Windows Ayarlar → Sistem → Ekran → Grafik → Yüksek performans).
- Düzeltme: telefonda zaten düşük çözünürlükte çizilirken öneri çözünürlüğü yükseltebiliyordu.
- Yol haritası: ilk iki gerçek cihaz raporu (MSI Katana 15 ve Exynos 2200'lü Samsung telefon) belgeye eklendi; efekt zinciri öne alındı.

## V2.12 — 2026-10-13 · Performans testi ve cihaz raporu
- **Performans testi:** Ayarlar → Grafik → **Performans testi**. Oyun yaklaşık 2 dakika boyunca kendi kendine sabit bir rota oynar; her cihaz aynı sahneyi çizdiği için sonuçlar karşılaştırılabilir:
  - ekranın yenileme hızı (60 / 90 / 120 Hz),
  - ilk patlama ve ilk flare anındaki takılma,
  - 6 sahne: yüksek uçuş, şehir üstünde alçak uçuş, şehirde yürüyüş, İHA üssü, deniz üssü, orman,
  - aynı uçuş rotasında gölge, görsel efekt, çözünürlük, ağaç, iki katmanlı derinlik ve logaritmik derinlik tek tek kapatılarak her birinin maliyeti,
  - kalabalık savaş (8 uçak ve sürekli patlama),
  - isteğe bağlı 5 dakikalık ısınma testi (telefon ısınınca yavaşlıyor mu?).
- **Sonuç ekranı:** ortalama, P90 ve P99 FPS, 20 FPS altındaki kare oranı (Google Play "yavaş oturum" ölçütü), işlemci ve (tarayıcı izin veriyorsa) ekran kartı süresi, çizim ve üçgen sayısı, darboğazın ne olduğu (ekranın yenileme hızı · işlemci · ekran kartı), kare süresi grafiği ve öneriler.
- **Rapor gönderme:** "Raporu gönder" ile sonuç anonim olarak sunucuya gider (cihaz, ekran kartı, grafik ayarları ve ölçümler; ad, e-posta ya da hesap bilgisi yok). Son 5 test cihazda saklanır, "Kopyala" ile paylaşılabilir. Yönetim panelinde yeni **Performans** sekmesi raporları listeler. Sunucu tablosu için supabase/perf_reports.sql bir kez çalıştırılmalı (supabase/KURULUM.md, bölüm 5).
- **Canlı FPS göstergesi:** artık P90 FPS, kare süresi, çizim ve üçgen sayısı ile son 2 saniyenin kare süresi çizgisini gösteriyor (50 ms'yi aşan kareler kırmızı).
- Teknik: test süresince otomatik kalite ve FPS sınırı kapanır, sonunda (ya da Esc ile durdurulunca) bütün ayarlar geri yüklenir.

## V2.11 — 2026-10-13 · Model altyapısı
- **Tek çağrıyla yeni uçak:** `defineAircraft('id',{...})` yeni bir aracı benzer bir uçaktan kopyalayıp üzerine yazar. Uçuş verisi, sınıf, üretici, ehliyet, rütbe kilidi, envanter kartı ve gerçek performans bu tek çağrıdan gelir. Araç kendiliğinden hangara, model kütüphanesine, görev panosuna, binme listesine ve çarpışma kutularına girer.
- **.glb modeller:** kod yerine bir .glb dosyası verilebilir; model gerçek boyuna ölçeklenerek yüklenir. Dışarıdan yüklenen modeller de artık uçağın gerçek uzunluğuna göre boyutlanıyor.
- **Model ölçü denetimi:** Ayarlar → Arayüz → Araçlar → **Model ölçü denetimi**. Her modelin boyu ve kanat açıklığı gerçek değerlerle karşılaştırılır; %8'den fazla fark işaretlenir. İlk ölçümde ANKA-3 (boy +%37), Hürjet (+%17) ve Kızılelma (+%18) çıktı; bunlar model yenileme serisinde düzeltilecek.
- **Rehber:** docs/MODEL-EKLEME.md (yeni model nasıl eklenir, veri kaynakları ve atıf kuralları).

## V2.10 — 2026-10-13 · Kanat adamı komutları
- **Kanat adamına emir:** uçuşta **F8** (dokunmatikte TELSİZ menüsünün altındaki KANAT ADAMI bölümü) ile Kılıç 2'ye emir verilir:
  - **Saldır:** kilitli hedefine (kilit yoksa sana en yakın düşmana) saldırır, hedef düşünce yanına döner.
  - **Kolla:** varsayılan; düzende kalır, sana yaklaşan tehditlerle çatışır.
  - **Düzene gir:** sağ kanadına sıkı kol düzeninde girer, hedeflerle uğraşmaz (akrobasi ve alçak geçişler için).
  - **Üsse dön:** ayrılır, üsse gidip iner.
- Emir telsizden karşılıklı konuşmayla onaylanır; geçerli emir kanat adamının işaretinin üstünde yazar (SALDIRIYOR · DÜZENDE · ÜSSE DÖNÜYOR).
- F8 tuşu Ayarlar → Kontroller'den değiştirilebilir; menüde 1–4 ile seçilir.
- Telsiz menüsü kısa (yatay) telefon ekranlarında artık kayıyor, taşmıyor.

## V2.09 — 2026-10-13 · Optimizasyon 2.0, ayarlar düzeni, sürüm notları
- **Kaybolan ağaçlar ve nesneler düzeltildi:** ekranın ortasındaki ağaç, kaya ve park etmiş araç grupları artık kaybolmuyor. Grupların görünürlük küresi her karede yeniden hesaplanıp küçülüyordu; asıl küre korunuyor ve her adımda denetleniyor.
- **Optimizasyon 2.0:**
  - Sabit nesne birleştirme: küçük sabit nesneler (bank, lamba, tabela, çit, bina parçaları) malzeme ve boyut sınıfına göre tek parçada çiziliyor. Yüksek kalitede çizim çağrısı %10–20 azaldı.
  - Uzaktaki birleştirilmiş hücreler ekranda birkaç pikselden küçük kalınca gizleniyor.
  - Hareket eden, gizlenen ya da yok edilen nesnenin hücresi kendiliğinden çözülüyor; kapılar, ışıklar ve hedefler eskisi gibi çalışıyor.
  - Uzak nesne listesindeki 4 saniyede bir takılma giderildi.
  - Tam ekran menüler açıkken sahne 10 FPS çiziliyor (pil, ısınma).
  - Ölçüm (Düşük kalite): uçuşta ~250, şehirde ~300 çizim çağrısı.
- **Cihaza göre ayar:** ilk açılışta ekran kartı, bellek ve işlemciye bakılarak telefon, tablet ya da bilgisayar için hazır ayar seçiliyor. Ayarlar → Grafik → **Cihaza göre ayarla** ile yeniden uygulanabilir.
- **Ayarlar yeniden düzenlendi:**
  - **Grafik** sekmesinde yalnız grafik ayarları var; hata ayıklama ayarları **Sorun giderme** grubunda.
  - Yeni **Uçuş** sekmesi: uçuş yardımı, otomatik denge, türbülans, gerçek servis tavanı, kafa hareketi, yakıt, bomba yardımı, hedef kilidi ve **Telefon: eğerek uç** grubu.
  - Yeni **Dünya** sekmesi: günün saati, hava durumu, yaşam (trafik, insanlar).
  - **Arayüz** sekmesinde Sürüm notları, Yenilikler ve Araçlar (Model kütüphanesi).
- **Sürüm notları oyunda:**
  - Yeni sürümden sonraki ilk açılışta yenilikler duyuru şeridinde gösteriliyor ("Tümünü gör" ile tamamı açılır).
  - Süresi Ayarlar → Arayüz → **Sürüm notları** ile seçiliyor: Kapalı · 10 sn · 30 sn · Kapatana kadar.
  - Ana menüde **Yenilikler**: son 8 sürümün notları.
- **Teknik:** gerçek tarayıcıda yayın denetimi (tools/browser-check.js) eklendi; kaybolan nesne ya da sayfa hatası varsa yayın durur. docs/MIMARI.md'ye performans ve teknik borç bölümü eklendi.

## V2.08 — 2026-10-13
- **Gerçekçi füze modeli:**
  - Roket motoru 8 saniye yanar, sonra sürtünme füzeyi yavaşlatır; ~200 m/s altında füze enerjisini yitirir.
  - Arayıcı başlık yalnız burnun ±55° çevresini görür: doğru anda sert dönüş füzenin kilidi kaybetmesini sağlar.
  - Radar güdümlü SAM füzeleri alçakta (500 m altında) füzenin görüş hattına dik uçan hedefi *çentikte* kaybedebilir.
  - Füze ile aranda arazi kalırsa kilit kopar.
  - Sert dönüş sırasında (4 G üstü) 400–1 800 m'de atılan flare'ler çok daha etkili.
- **Füze uyarısı:**
  - Ekranda kırmızı halka üzerinde füzenin geldiği yön ok olarak görünür; üstünde "FÜZE · SAAT 4 · 1,2 km" yazar.
  - Altındaki öneri satırı: "SAĞA KIR + FLARE + ALÇAL".
  - Kartal Gözü telsizden "Füze! Saat 4, 2,3 kilometre!" der. Füze kaçırılınca nedeni söylenir (kilidi kaybetti / enerjisini yitirdi / çentikte kaybetti / arazinin arkasında kaldın).
- **Kaçış yardımı:** F7 (dokunmatikte füze gelirken yanıp sönen *KAÇ!*). Uçuş yardımı açıkken 5 saniye boyunca füzeyi yana alan sert dönüşü uçar, gazı tam açar ve uygun anda flare atar.
- **Yeni görev, Füzeden kaçış** (Eğitim): iki SAM bataryasının attığı üç füzeden kurtul; yıldız kalan cana göre.

## V2.07 — 2026-10-13
- **Akrobasi tanıyıcı:** uçuş saniyede 10 kez izlenir (gövde eksenlerindeki dönüş, yön, burun, yatış, irtifa, hız). Bir figür tamamlanınca ekranın üstünde adı, kalitesi (Mükemmel / İyi / Geçer) ve puanı çıkar.
  - Tanınan figürler: **Tonoz**, **Fıçı tonoz**, **Looping**, **Immelmann**, **Split-S**, **Cuban 8**, **Hammerhead**, **Sırtüstü uçuş**, **Bıçak sırtı**.
  - Kalite irtifa ve yön tutarlılığından hesaplanır.
- **Akrobasi dumanı:** F6 (dokunmatikte üst çubukta *DUMAN*) ile kırmızı/beyaz yumuşak duman izi; 25 saniyede söner.
- **Yeni görev, Akrobasi gösterisi** (Eğitim): Türk Yıldızları tarzında tonoz → looping → Immelmann → Split-S → fıçı tonoz sırasıyla uçulur.
  - Her figür için ipucu görünür; hakemler puan verir, yıldız puana göre belirlenir.
  - Görev 900 m'de dumanı açık başlar.
- Altyapı genel yazıldı: kol uçuşu ve kanat adamı düzeni (V2.09) aynı tanıyıcıyı kullanabilir.

## V2.06 — 2026-10-13
- **Gözden geçirme:** bütün ana ekranlar telefonda (yatay) ve bilgisayarda tek tek kontrol edildi. Rapor `docs/GOZDEN-GECIRME.md` dosyasında.
- **Hangar (telefon):** uçak adı artık sınıf filtreleriyle üst üste binmiyor.
  - Filtreler "Ana menü" düğmesinin yanında tek satırda, kaydırılabilir.
  - Boya seçimi renk noktalarıyla gösteriliyor; başlık küçüldü.
- **Duraklatma menüsü (telefon):** iki sütunlu düzen; bütün düğmeler ekrana sığıyor.
- **Harita:** yer adları artık sağdaki liste panelinin üstüne taşmıyor.
- **Sesli sohbet:** çok oyunculu pencerede *Açık mikrofon* (tuşa basmadan konuş) ve *Ses düzeyi* ayarı. Açık mikrofonda da konuşan göstergesi çalışır.

## V2.05 — 2026-10-13
- **Çarpışmalar:** yaya ve araçlar için artık şunlar katı:
  - Park hâlindeki bütün uçaklar (gövde boyunca, uçağın yönüne göre). Örneğin İHA üssünde uçakların içinden geçilmiyor.
  - Apronda taksi yapan yapay zekâ uçakları.
  - Trafik arabaları.
  - Kasabalardaki ve marinadaki park etmiş arabalar.
  - İskeledeki tekneler ve gemiler.
- **Trafik:** önünde araban ya da sen varsan araba frenleyip durur, bir süre bekleyince korna çalar.
- **Araç kazaları:** sert çarpmada çarpışma sesi, titreşim ve "Çarpışma! (hız)" uyarısı; araç geri itilir ve yavaşlar.
- **Taksi:** yerdeki uçak park hâlindeki bir uçağa ya da araca değerse durur; 9 m/s (~32 km/s) üstünde kaza olur.
- **Park etmiş arabalara binme:** kasabadaki ve marinadaki park hâlindeki bir arabanın yanına gidince araba gerçek, sürülebilir bir araca dönüşür ve "E — araca bin" çıkar.
- Performans: yalnız oyuncunun 160 m çevresindeki nesneler denetlenir; park etmiş arabalar bölge ızgarasında tutulur.

## V2.04 — 2026-10-13
- **Park hâlindeki her uçağa binme:** İHA ve Test Merkezi'ndeki TB2, TB3, Akıncı, Kızılelma ve ANKA, apronda çekiciye bağlı Hürjet ve dünyada duran diğer uçak modelleri artık binilebilir.
  - Yanına yürüyünce "E — … ile uç" (dokunmatikte *UÇAĞA BİN*) çıkar.
  - Uçuş tam o noktadan ve uçağın baktığı yönden başlar; park hâlindeki model sen uçarken gizlenir, inip çıkınca yerine döner.
  - Binilebilir uçak listesi oyunun model kaydından okunur: ileride eklenen her uçak modeli kendiliğinden binilebilir olur.
  - Gökyüzünde dolaşan İHA ve hareket hâlindeki hava trafiği hariç.
  - Kariyerde belge kuralı geçerli: belgesi olmayan uçağa binilemez.

## V2.03 — 2026-10-13
- **Görev ekranı yenilendi**: tek ekran, iki sütun, üst üste binme yok.
  - Üstte tek satırlık kategori sekmeleri: Tümü · ★ Harekât · Eğitim · Hava · Taarruz · Keşif · Helikopter · Dinamik · Okul · Yarış · Kara · Deniz. Satır kaydırılabilir.
  - Zorluk, süre ve sıralama **⚙ Filtre** düğmesinin altında; düğmede kaç filtre seçili olduğu yazar.
  - Görevler kart olarak listelenir. Her kategorinin kendi rengi var (hava kırmızı, eğitim turkuaz, kara yeşil, deniz mavi…); süre, zorluk ve ödül kartın altında renkli yazar.
  - Sağ panelde harita, hedefler, tehditler ve araç bulunur. *Başla* düğmesi hep altta görünür.
  - Düşman, kanat adamı, zorluk ve başlangıç yeri ayarları *Gelişmiş ayarlar* başlığının altına katlandı.
  - ★ Harekât sekmesi Kızıl Elma kampanyasını açar.
  - Telefonda yatay ekrana sığacak şekilde sıkışır.

## V2.02 — 2026-10-13
- **Serbest çubuk:** uçuşta ve yürürken/sürerken, ekranın sol tarafında nereye dokunursan yön çubuğu orada açılır; parmağını kaldırınca yerine döner. Ayarlar → Kontroller → Dokunmatik → *Serbest çubuk* ile kapatılabilir.
- **Düzen düzenleyici** (Ayarlar → Kontroller → Dokunmatik → *Düzenle*):
  - Yön çubuğu, gaz, ateş/flare/dümen kümesi, üst düğmeler, işaret düğmesi ve yürüme düzeni sürüklenip istenen yere taşınır.
  - Konumlar cihaza kaydedilir; *Sıfırla* ile varsayılana dönülür.
- **Hazır düzenler:** Klasik · Sol el (çubuk sağda, düğmeler solda) · Eğerek uç (telefonu eğerek yönlendirme, çubuk gizli).
- **Dokunmatik rehberi:** dokunmatik kumanda ilk açıldığında yön çubuğu, gaz, ateş ve flare için dört kısa ipucu çıkar; ayarlardan tekrar gösterilebilir.
- Her dokunmatik düğmede kısa bir titreşim (Android).
- İşaret (📍) düğmesi üst düğme çubuğuna taşındı; mini haritanın üstüne binmiyor.

## V2.01 — 2026-10-13
- **Yeni uygulama simgesi:** kırmızı zemin üzerinde ay yıldız ve iz bırakan beyaz savaş uçağı.
  - Android'in yuvarlak, damla ve kare maskelerine uyan *maskelenebilir* sürüm, Android 13+ temalı simgeler için tek renkli sürüm, 48–512 piksel boyutlar ve SVG kaynak.
  - Bildirim çubuğu rengi artık kırmızı.
- **Ana ekran kısayolları:** uygulama simgesine uzun basınca *Hızlı Oyun*, *Harekât* ve *Görevler* ile doğrudan açılır.
- **Uygulamayı yükle düğmesi:** tarayıcı izin verdiğinde ana menünün sağ üstünde yeşil ⬇ düğmesi çıkar (Android Chrome, bilgisayarda Chrome/Edge). iPhone'da "Paylaş → Ana Ekrana Ekle" yolunu gösterir. Uygulama olarak açıkken gizlenir.
- **Play Store hazırlığı:**
  - `twa-manifest.json`: paket adı, yatay tam ekran, simgeler, kısayollar ve renkler hazır; `bubblewrap update` ile .aab üretilir.
  - `privacy.html`: Play Store için gizlilik politikası.
  - `docs/ANDROID.md` adım adım güncellendi.
- Testlere, aynı adlı iki üst düzey işlevi yakalayan bir denetim eklendi (V2.00 hazırlığında kanat adamının hedef seçimini bozan bir ad çakışmasını bu tür bir hata yakalamıştı).

## V2.00 — 2026-10-13
- **İşaret çarkı** (F4 ya da orta fare tuşu; dokunmatikte sağdaki 📍 düğmesi):
  - Kısa basınca baktığın yere (kilitli hedef varsa hedefin üstüne) **🎯 Hedef burada** işareti konur.
  - Basılı tutunca çark açılır: Hedef burada · ⚠ Tehlike · ➜ Buraya git · 🆘 Yardım lazım · 🛡 Savunuyorum · ✓ Anlaşıldı. Fareyle ya da 1–6 tuşlarıyla seçilir.
  - İşaretler ekranda simge, mesafe ve koyan oyuncunun adıyla, haritada ve mini haritada renkli nokta olarak görünür. Her oyuncunun tek işareti olur; 25 saniyede söner.
  - Çok oyunculuda takım arkadaşlarına anında gider; takım modunda karşı takım görmez.
- **Haritaya işaret:** haritada sağ tıkla ya da uzun bas → "Buraya git".
- **Tek oyunculu:** kanat adamı işaretlenen hava hedefine yönelir ve telsizden yanıt verir; yardım ya da tehlike işaretine "Geliyorum" der.
- **Sesli sohbet:** bas-konuş kullanan oyuncunun adı sol üstte 🎙 ile görünür.
- İniş göstergesi artık yalnız gerçekten yaklaşırken çıkar (takım açık ya da alçak ve yavaş).
- Yol haritası V2.20'ye kadar genişletildi (ROADMAP.md).

## V1.99 — 2026-10-13
- **Kara ve deniz görevleri:** görev panosuna **Kara** ve **Deniz** sekmeleri eklendi.
  - *Konvoy savunması* (Altay): Kara Üssü'nden Güneş santralindeki konvoya git, saldıran araçları topla imha et.
  - *Kirpi ile keşif*: Gölet, Güneş santrali ve Köy kontrol noktaları.
  - *Pars ile atış tatbikatı*: poligondaki beş hedef.
  - *Kaçakçı takibi* (hücumbot): açıkta dolaşan kaçakçı teknesine yetiş ve batır.
  - *Liman devriyesi* (hücumbot): üç deniz devriye noktası.
  - *Korvet topçu atışı* (Ada sınıfı): üç hedef dubası.
  - *TCG Anadolu ile çıkarma*: dev gemiyi toplanma ve çıkarma noktalarına götür.
  - Görevler hedef, süre, işaret, bitiş ekranı ve *Tekrar* ile çalışır. Gemide de hedef paneli görünür.
  - Tank ve gemi mermileri artık görev hedeflerine hasar verir.
  - Kariyerde ilgili belge gerekir (tank sürücülüğü, araç ehliyeti, kaptanlık).
- **Düzeltme:** V1.98'deki Kızıl Elma madalyası eksik tanımlıydı; TP kazanıldığında hata çıkıp kariyer puanı yazılmıyordu.

## V1.98 — 2026-10-13
- **Harekât: Kızıl Elma**: sekiz bölümlük hikâyeli kampanya. Ana menüde hem Hızlı Oyun'da hem Kariyer'de yer alıyor.
  - Bölümler: 1 *Uyanış* (İHA ile üç noktayı tara) · 2 *Sessiz Sürü* (kamikaze İHA sürüsünü önle) · 3 *Kalkan* (Anadolukent'e yakın hava desteği, görev ortasında yeni SAM) · 4 *Enkaz Altında* (T625 ile Hilal Barajı'ndan yaralı kurtarma) · 5 *Mavi Hat* (batı açıklarında deniz devriyesi ve gemi tanımlama, hava bozar) · 6 *Gölge Avı* (T129 ile Antik kentteki birliği temizle) · 7 *Hava Köprüsü* (nakliye uçağına refakat) · 8 *Kızıl Elma* (Kızıl Bölge'ye final taarruzu).
  - Her bölümde hikâye metni, görev listesi ve araç bilgisi var. Başlarken Karargâh, Kartal Gözü ve Kule telsizden brifing verir, bitince değerlendirme yapar.
  - Bölümler sırayla açılır; 1–3 yıldız alınır. İlerleme profilde (hesaplıysan bulutta) saklanır. Bölüm bitince ana menüde harekât ekranı sıradaki bölüm seçili açılır.
  - Kariyerde ilk tamamlamada görev TP'sine ek olarak hikâye bonusu verilir (150–600 TP). Finali bitiren *Kızıl Elma* madalyasını alır.
  - Uygun araç kendiliğinden seçilir (bölüm 1'de İHA, bölüm 2'de avcı…). Kariyerde gereken belge yoksa hangisinin gerektiği söylenir.

## V1.97 — 2026-10-12
- **Görüntü sorunu testi** (Ayarlar → Grafik → *Görüntü sorunu testi* → Testi aç): oyun sürerken sol üstte bir panel açılır.
  - Kapatılabilen katmanlar: deniz, gökyüzü, bulutlar, gölgeler, efektler, ağaçlar, arazi, iki katmanlı derinlik ve çözünürlük. Hangisi kapanınca sorun kayboluyorsa kaynağı odur.
  - Panelin altında cihaz, ekran kartı, hassasiyet, derinlik bitleri ve sürüm yazar.
  - Hiçbir şey kaydedilmez; *Kapat* her şeyi geri açar.
- **Grafik ayarları artık cihaza özel:** hesapla girişte buluttaki kayıt kalite, gölge, efekt, çözünürlük, kenar yumuşatma, FPS sınırı ve derinlik ayarlarını değiştirmez. Önceden bilgisayardaki gölge/efekt ayarları telefona da geliyordu; telefonda gölge ve efekt sorunlarının olası kaynaklarından biri buydu.

## V1.96 — 2026-10-12
- **Duyurular:**
  - Yönetim → Duyurular'da süre seçiliyor: **Anlık** (oyunda bir kez gösterilir), **10 dakika**, **1 saat**, **1 gün**, **Kalıcı**. Süresi dolan duyuru kendiliğinden kalkar.
  - Oyunculara en geç 20 saniyede ulaşır (veritabanı canlı yayın açıksa anında). Ekranın üstünde ✕ ile kapatılabilen bir şerit olarak bir kez çıkar.
  - Yönetim listesinde her duyurunun kalan süresi ve yayında olup olmadığı görünür.
  - Veritabanında değişiklik gerekmez.
- **Uçuş yardımı** (Ayarlar → Grafik → Uçuş yardımı):
  - **Yardımlı** (varsayılan):
    - Piste yaklaşırken sol tarafta iniş göstergesi: pist ve mesafe, süzülüş ve merkez hattı elmasları, hedef hız, alçalma hızı ve "burnu hafif indir / sola dön / gazı azalt" ipuçları.
    - Pistin üstünde son metrelerde otomatik burun kaldırma ve gaz kesme.
    - Daha hoşgörülü iniş sınırları (alçalma hızı, yatış ve burun açısı 1,5 kat).
    - Stol koruması.
  - **Otomatik iniş:** takım açık ve çubuk bırakılmışken asistan süzülüş açısını, merkez hattını ve hızı tutarak piste indirir. Çubuğa dokununca kontrol hemen sende. KAAN, Hürjet ve TB2 ile denendi.
  - Kalkıştan sonraki 20 saniye yaklaşma sayılmaz.
- **İHA'larda uçuş bilgisayarı:** hız stol sınırına yaklaşınca burun kaldırma kısılır; stolde burun hafifçe indirilir.
- **Görev günlüğü** köşesinde ✕ ile kapanır.
- **Belge sınavları:**
  - Düzeltildi: belgeler buluttaki profile kaydedilmiyordu; hesapla girişte yeniden yüklenince kayboluyordu. Artık profil istatistiklerinde saklanıyor.
  - Her aşama ayrı hatırlanır. Başarısız bir aşamayı *Tekrar* ile geçmek de sayılır; bütün aşamalar geçilince belge hemen verilir.
  - Sınava yeniden girince kaldığın aşamadan devam edilir; belge ekranında "Aşama 1 / 2 geçildi" görünür.
- **İHA sınavı:** TB2 için hedef irtifa 150 m oldu. Ders açıklaması da yavaş tırmanmayı ve hızı korumayı anlatıyor.

## V1.95 — 2026-10-12
- **Yeni giriş ekranı** (oyun istemcilerindeki gibi tek ve sade ekran):
  - Solda oyunun adı, sağda giriş paneli: *Giriş yap / Hesap oluştur* sekmesi, büyük **Google ile devam et** düğmesi.
  - E-posta ve şifre alanları yazınca yukarı kayan etiketli; şifreyi göster düğmesi var.
  - Tek büyük kırmızı ok düğmesi; Enter ile de devam edilir.
  - Altta **Misafir olarak oyna**.
  - Yanlış e-posta ya da kısa şifre anında uyarılır.
  - Giriş başarılı olunca ekran kendiliğinden kapanır; ilk girişte profil oluşturma açılır.
  - Telefonda yatay ekrana sığacak şekilde sıkışır.
- **Oyuncu kartı profili:**
  - Üstte birlik renginde (Hilal Kanatlar kırmızı, Mavi Kanatlar mavi, Bozkurtlar yeşil) bir afiş: rütbe rozeti, rütbe ve çağrı adı, seviye çubuğu, bulut durumu rozeti ve *Profili düzenle*.
  - Altında sekmeler: **Özet** (öne çıkan istatistikler, günlük/haftalık görevler, son uçuşlar) · **Kariyer** (belgeler kısayolu, rütbe basamakları, açılanlar) · **Madalyalar** (madalya ve başarımlar) · **İstatistik** · **Hesap** (giriş/çıkış, bu cihazdaki profiller, çağrı adı, birlik kartları, arma).
  - Son açılan sekme hatırlanır.
- Oyun ilk açıldığında hesap ekranı yerine yeni giriş ekranı gelir.

## V1.94 — 2026-10-12
- **FPS:** uçuşta kare başına çizilen üçgen sayısı 1,57 milyondan ~0,8 milyona, yürürken 1 milyondan 0,4 milyona indi.
  - Yol trafiği yalnız kameraya yakın arabaları ekran kartına gönderir; uzaktakiler hesapta sürmeye devam eder (arazi sorgusu yapılmaz).
  - Sabit nesne grupları (park etmiş arabalar, kayalar, çitler…) gerçek sınır küresi aldı: ekran dışındaysa çizilmez; tek bir parçası birkaç pikselden küçük kalan karolar gizlenir.
  - Uzak ormanlar mesafeyle seyrelir.
  - Telefonda çözünürlük çarpanı kaliteye göre sınırlandı (Orta: 1,25x).
- **Akıllı performans:** çözünürlük en alta indiği hâlde FPS düşük kalırsa önce gölge ve efektler geçici kapanır, sonra uzak ayrıntı ve trafik azalır, en sonda en hafif görüntüye geçilir. Akıcılaşınca adım adım geri gelir.
- **FPS sınırı** (Ayarlar → Grafik): 30 (pil tasarrufu) · 60 (telefonda varsayılan; 90–120 Hz ekranlarda telefon boşuna ısınmaz) · Sınırsız. **Performans modu** düğmesi en akıcı ayarları tek dokunuşla uygular.
- **Siyah dalgalar (telefon):** logaritmik derinlik kullanılmayan cihazlarda sahne iki derinlik katmanında çizilir (uzak, sonra derinlik temizlenip yakın). Her katman kendi yakın/uzak düzlemini kullandığı için derinlik hassasiyeti bantları ve titreme oluşmaz. Ayarlar → Grafik → *İki katmanlı derinlik*.
- Deniz yüzeyi bölümlendi ve sığ kıyılarda zeminin önünde kalacak şekilde hafifçe öne alındı; telefonda köşe başına ışıklandırma kullanır (düşük hassasiyetli ekran kartlarında parlama bantları olmaz).
- FPS göstergesi artık çizim çağrısı, üçgen sayısı, performans basamağı ve derinlik modunu da gösterir.

## V1.93 — 2026-10-12
- **Bulut hesapları açıldı.** Oyun, kendi Supabase projesine (Frankfurt) bağlandı. Artık herkes e-posta ile hesap açabiliyor; profil, kariyer, belgeler, rekorlar ve ayarlar buluta kaydediliyor ve başka cihazda da açılıyor.
- Misafir oynamak eskisi gibi mümkün. Misafir ilerlemesi giriş yapınca hesaba aktarılıyor.
- Yayımlanan anahtar yalnızca herkese açık "anon public" anahtarı; veriler veritabanı kurallarıyla (RLS) korunuyor.

## V1.92 — 2026-10-12
- **Hızlı oyun ve kariyer ayrıldı:** hızlı oyunda her araç ve her görev kısıtsız açık, puan kazanılmıyor. Kariyer sıfırdan bir ilerleme: puan kazanıyorsun ve her araç için belge gerekiyor.
- **Ehliyet ve Sertifikalar** (Kariyer menüsünde): 8 belge var, her biri uygulamalı sınavla alınıyor:
  - **Araç ehliyeti:** SUV ile kontrol noktalı sürüş sınavı, 4 dakika sınırlı. Açtığı araçlar: SUV, 4×4, kamyon, itfaiye, Kirpi.
  - **Tank sürücülüğü** (önce araç ehliyeti gerekiyor): Altay ile sürüş sınavı, 5 dakika. Açtığı araçlar: Altay, Fırtına, Pars, Korkut, Hisar.
  - **Kaptanlık:** Hücumbotla şamandıra turu, 5 dakika. Açtığı araçlar: bütün tekneler ve gemiler (TCG Anadolu dahil).
  - **İHA pilotluğu:** TB2 ile kalkış ve iniş. Açtığı araçlar: TB2, ANKA, AKSUNGUR, TB3, Akıncı, ANKA-3, KIZILELMA.
  - **Temel pilotluk:** Hürkuş ile kalkış, trafik turu ve iniş. Açtığı uçak: Hürkuş.
  - **Jet pilotluğu** (önce temel pilotluk gerekiyor): Hürjet kalkışı, silah kullanımı ve yan rüzgârda iniş. Açtığı uçak: HÜRJET.
  - **Savaş pilotluğu** (önce jet pilotluğu gerekiyor): KAAN ile atış ve iniş. Açtığı uçak: KAAN.
  - **Helikopter pilotluğu:** askıda kalma, askı yükü ve gemiye iniş. Açtığı helikopterler: T129, T625.
- **Belgesiz kullanım engelleniyor:** hangarda başlat düğmesinde ve araç kartlarında hangi belgenin gerektiği yazıyor. Görev panosunda helikopter görevleri, yarışlar ve konvoy görevleri ilgili belge olmadan kilitli. Yürürken belgesiz araca binilemiyor. Ağır sistemlerde rütbe şartı da sürüyor.
- **Sınav işleyişi:** sınavlar aşamalı ilerliyor. Bir aşamayı geçince sıradaki kendiliğinden başlıyor. Kaza yaparsan ya da süreyi aşarsan sınavdan kalıyorsun ve tekrar deneyebiliyorsun. Belgeyi alınca tecrübe puanı ve madalya kazanıyorsun.
- **Önceki dersler sayılıyor:** uçuş okulunun kalkış, tur ve iniş derslerini bitirenler temel pilotluğu; askıda kalma, askı yükü ve gemiye iniş derslerini bitirenler helikopter pilotluğunu kendiliğinden aldı.
- Testler yeni kurala uyarlandı: araç testleri hızlı oyunda çalışıyor, kariyer testi belge şartını da denetliyor.

## V1.91 — 2026-10-12
- **Hızlı oyun menüsü yenilendi:**
  - **Hızlı Oyun:** en son kullandığın araçla tek tıkla oyuna girersin. Bu araç uçak, helikopter, tank ya da gemi olabilir.
  - **Serbest Uçuş / Sürüş:** artık doğrudan başlatmıyor, hangara gidiyor.
  - **Hızlı Görev:** bütün görevler açık.
  - **Üssü Gez:** önce başlayacağın üssü seçiyorsun. Seçenekler: Hava, Deniz, Kara, İHA merkezi, Marina, Köy, Hilalkent, Anadolukent.
  - Hangar düğmesi kaldırıldı.
- **"Uçuşa hazır" penceresi kaldırıldı:**
  - Uçağı seçince her zaman silah yükü ekranı geliyor. Başlama yeri (Hangardan / Pistten / Havada) bu ekranın altında seçiliyor ve "▶ Uçuşa başla" ile doğrudan kalkıyorsun.
  - Düşman uçak, kanat adamı, hava savunma, zorluk ve başlangıç havaalanı ayarları görev ekranına taşındı (Görev ayarları).
- **Hızlı gruplar:** silah yükü ekranında "+ Bu yükü kaydet" ile kendi yük gruplarını oluşturabilirsin (uçak başına 6 tane).
  - Gruba tıklayınca o adetler uçağa yükleniyor.
  - Çift tıklayınca adını değiştirebilirsin, × ile silebilirsin.
- **Hangarda bütün araçlar:**
  - ‹ › okları artık uçaklardan sonra helikopterlere, kara araçlarına ve deniz araçlarına geçiyor.
  - Kara araçları (Bozkurtlar sekmesi): Altay, Fırtına, Pars, Kirpi, Korkut, Hisar, 4×4, kamyon, SUV ve itfaiye. Hangarın içinde sergileniyor.
  - Deniz araçları (Mavi Kanatlar sekmesi): Hücumbot, Ada sınıfı korvet, TCG Anadolu, römorkör, balıkçı teknesi ve yelkenli. Deniz üssünün önünde sergileniyor.
  - Hepsiyle "Sürmeye başla" ya da "Dümene geç" diyerek doğrudan oyuna giriyorsun. TCG Anadolu artık sürülebiliyor.
- **Hangar ekranı düzeltmeleri:**
  - Ana menü düğmesi, filtreler ve Hilal / Mavi / Bozkurtlar sekmeleri artık üst üste binmiyor.
  - "Gerçek veriler" ve boya düğmeleri yeniden tıklanabiliyor.
- **Duraklat menüsü:** "Ana menü" düğmesi eklendi.
- **Ana menü:** yönetim simgesi düzeltildi; artık diğer yuvarlak düğmelerle aynı görünüyor.

## V1.90 — 2026-10-12
- **Eğerek uç (telefon):** Ayarlar → Oynanış'tan açılıyor. Telefonu sağa-sola ve öne-arkaya eğerek uçağı yönlendirebilirsin.
  - Ekran yatay ya da dikey olsun, doğru çalışıyor.
  - "Sıfırla" düğmesi telefonu o anki tutuşunda düz uçuş kabul ediyor.
  - Duyarlılık Az / Orta / Çok olarak seçilebiliyor; öne-arka eğim için ters çevirme seçeneği var.
  - iPhone ilk açılışta hareket sensörü izni istiyor.
  - Ekrandaki çubuğa dokunurken eğim devre dışı kalıyor.
- **Titreşim:** gamepad titreşimi veren her olay (atış, isabet, iniş, düşüş, uyarılar) artık telefonu da titretiyor. Bu, Android'de çalışıyor; iPhone tarayıcıları titreşimi desteklemiyor. Ayarlar → Erişilebilirlik → Kumanda titreşimi ile açılıp kapanıyor.
- **Kayıt yedeği:** Ayarlar → Arayüz'den yapılıyor. Profil, kariyer, rekorlar, ayarlar, boyalar, görevler ve kontroller dosyaya ya da kopyalanabilir bir koda aktarılabiliyor. Bu yedek başka cihazda ya da tarayıcıda yüklenebiliyor.
  - Türkçe karakterler korunuyor ve diğer sitelerin verilerine dokunulmuyor.
  - Hesap açanların ilerlemesi zaten bulutta saklanıyor.
- **Android hazırlığı:** docs/ANDROID.md eklendi. İçinde iki yol anlatılıyor: TWA (Bubblewrap, önerilen) ve Capacitor. Digital Asset Links ve Play Console adımları da var.
- Yol haritası: V1.91 Menü ve hangar düzeltmeleri, V1.92 Kariyer (ehliyet ve sertifikalar) eklendi. Model yenileme V1.93'ten başlıyor.

## V1.89 — 2026-10-12
- **3B kokpit:** KAAN, HÜRJET ve Hürkuş'ta C tuşuyla kokpit görünümüne geçince artık gerçek bir iç mekân var. T129'da ön koltuk görünümünde de iç mekân görünüyor.
  - Gösterge paneli ve göz siperliği var. Kanopi çerçevesi ve kenar çubukları (pencere ve yan çerçeveler) ile yan konsollar ve düğmeler eklendi.
  - Uçaklarda HUD camı var.
  - Kumanda kolu ve gaz kolu girişlerine göre hareket ediyor.
- **Çalışan çok işlevli ekranlar** (saniyede 8 kez yenileniyor):
  - PFD: yapay ufuk, hız, irtifa ve yön.
  - TAKTİK: çevredeki uçaklar, hava ve yer hedefleri, üs.
  - SİSTEM: gaz, yakıt, motor, G, iniş takımı, mühimmat ve flare.
  - KAAN'da bunlar tek geniş ekranda, HÜRJET ve Hürkuş'ta üç ayrı ekranda gösteriliyor. T129'da üçüncü ekran SİLAH ekranı.
- **Kafa hareketi** (Ayarlar, varsayılan açık): G kuvveti başı aşağı itiyor, baş dönüş yönüne bakıyor, yüksek hızda ve türbülansta hafif titreşim oluyor. Fareyle ya da sürükleyerek etrafa bakmak eskisi gibi çalışıyor.
- **Işık:** kokpit dışarıdaki güneş, ay ve hava durumuna göre aydınlanıyor. Gece gösterge paneline sıcak renkli ışık geliyor.
- **Çizim:** iç mekân ayrı bir katmanda çiziliyor, bu yüzden dünyayla iç içe geçmiyor ve titremiyor. Eski düz çerçeve görüntüsü bu uçaklarda kaldırıldı. İHA'larda burun kamerası görünümü aynen duruyor.

## V1.88 — 2026-10-12
- **Gerçekçi performans:** Sistem Envanteri'ndeki gerçek değerler oyuna bağlandı.
- **Gerçek servis tavanı** (Ayarlar, varsayılan açık): uçak, envanterdeki tavanın son %15'inde motor gücünü yitirir ve tavana gelince düzleşir. Tavana yaklaşınca uyarı çıkar.
  - Tavanlar: Hürkuş 10.577 m, TB2 8.230 m, ANKA 9.144 m, AKSUNGUR ve Akıncı 12.192 m, KIZILELMA 10.668 m, TB3 10.058 m.
  - KAAN, HÜRJET ve ANKA-3'ün envanterde tavan verisi olmadığı için bu uçaklarda sınır yok.
- **Hangar:** performans çubuklarının altında "GERÇEK" satırı var. Satırda azami ve seyir hızı, tırmanma, servis tavanı, havada kalış süresi, menzil ve faydalı yük ile kaynak (Defence Turk) gösteriliyor. Verisi olmayan uçaklarda oyun değerlerinin kullanıldığı yazıyor.
- Oyundaki hız değerlerini envanterle karşılaştırdım. Hürkuş 574 km/sa, Akıncı 195 knot, T129 145 knot ve HÜRJET art yakıcıyla 1,2 Mach; değerler zaten uyumluydu, değiştirmedim.
- Yol haritası kaydı: 3B kokpit V1.89, Telefon ve kayıt V1.90, model yenileme V1.91+ oldu.

## V1.87 — 2026-10-12
- **Tekrar izleme:** her uçuşun son 5 dakikası saniyede 10 kez kaydediliyor. Kayda girenler: uçağın konumu, duruşu, hızı, gaz ayarı, iniş takımı, art yakıcı, silah atışı, düşüş anı ve çevredeki en fazla 12 uçak.
- **Açmak için:** Duraklat menüsünde ya da görev sonu ekranında "Tekrar izle" düğmesine bas veya F3'e bas.
- **Zaman çubuğu:** ileri-geri sarabilir, 5 saniye atlayabilir (← →, Shift ile 1 sn), oynatıp durdurabilirsin (Boşluk). Hızı ¼×, ½×, 1×, 2× ve 4× arasında değiştirebilirsin (- / + tuşları).
- **Kameralar** (1–4 tuşları):
  - Takip
  - Kokpit
  - Sinematik: 6 saniyede bir yandan, önden geçiş, kuleden, yukarıdan ve takip çekimleri arasında geçiyor.
  - Serbest: sürükleyerek etrafında dön, tekerlekle yaklaş.
- **Fotoğraf ve video:** yazısız ekran görüntüsü alabilirsin. Oyun ekranını WebM video olarak kaydedip izleyebilir ve indirebilirsin.
- **Çıkış:** tekrardan çıkınca oyun bıraktığın yere, yani duraklatma ekranına ya da görev sonu ekranına aynen döner.

## V1.86 — 2026-10-12
- **Yeni: Sistem Envanteri.** Ana menünün sağ üstündeki kitap simgesinden açılıyor ve 418 yerli savunma sistemini içeriyor. Kapsanan alanlar: hava ve uzay, kara, deniz, silah, radar ve elektronik harp, muhabere, güvenlik, simülatör.
  - Arama Türkçe harflere duyarsız çalışıyor ("kizilelma" yazınca KIZILELMA bulunuyor).
  - Kategori ve alt kategori filtresi var. "Oyunda olanlar" seçeneği oyundaki 21 sistemi gösteriyor.
  - Her sistemde şunlar yer alıyor: üretici, aktif/pasif durumu, kullanıcı ülkeler, konfigürasyonlar ve gruplanmış teknik özellikler.
- **Hangar:** seçili uçağın altına "📖 Gerçek veriler" düğmesi eklendi, envanterde o uçağın sayfasını açıyor.
- **Model kütüphanesi:** bilgi sekmesinde oyundaki sistemin gerçek değerleri (hız, irtifa, boyutlar, motor gibi) ve "Envanterde aç" düğmesi var.
- **Kaynak:** veriler Defence Turk Sistem Envanteri'nden (defenceturk.tr) alındı. Atıf her sayfada ve her sistem detayında görünüyor. Yalnızca olgusal bilgiler alındı; açıklama metinleri ve görseller alınmadı.
- Yol haritası kaydı: Tekrar izleme V1.87, 3B kokpit V1.88, Telefon ve kayıt V1.89, model yenileme V1.90+ oldu.

## V1.85 — 2026-10-12
- **Hangar lambaları uçakları aydınlatıyor:** gece ya da kapalı havada hangardaki uçakların üstü artık kararmıyor. Bekleme hangarına ve bakım hangarına gerçek lamba ışığı eklendi. Hangar ışığı uçak sırası boyunca kamerayı izliyor. Işığın menzili sınırlı olduğu için dışarısı gece karanlık kalıyor.
- **Hangarın içine yağmur yağmıyor:** bekleme hangarı ve bakım hangarının çatısı altında yağmur ve kar görünmüyor, kapıdan dışarı bakınca yağış sürüyor. İçerideyken yağmur sesi kısılıyor.
- Yol haritası kaydı: Tekrar izleme V1.86, 3B kokpit V1.87, Telefon ve kayıt V1.88, model yenileme V1.89+ oldu.

## V1.84 — 2026-10-12
- **Uçuş konforu:** uçakta ve helikopterde yaşanan yalpalama giderildi.
- **Türbülans ayarı** (Ayarlar → Hava durumu altında): Kapalı / **Hafif** (varsayılan) / Gerçekçi. Açık havada artık hiç sarsıntı yok. Sarsıntı yavaş ve yumuşak dalgalanmalara indirildi, titreme yapan hızlı bileşenler kaldırıldı. Fırtınada yatış salınımı 4,4°'den Hafif ayarda 1,6°'ye düştü.
- **Otomatik denge** (varsayılan açık): kumandayı bırakınca uçak kanatlarını yavaşça düzler (35°'ye kadar yatışta). Dik dönüşlere ve akrobasiye karışmaz. İstersen ayarlardan kapatabilirsin.
- **Helikopter:** rüzgâr artık askı yardımı (J) açıkken helikopteri sürüklemiyor. Askıda 10 saniyedeki kayma açık havada 25 m'den 4 m'ye, fırtınada 91 m'den 15 m'ye indi. Türbülans yatışı 5°'den 1,6°'ye düştü. Takip kamerası yön değişimlerini yumuşak izliyor.
- **Kare süresi yumuşatma:** tek bir yavaş kare artık görüntüyü sarsmıyor.
- Yol haritası kaydı: Tekrar izleme V1.85, 3B kokpit V1.86, Telefon ve kayıt V1.87, model yenileme V1.88+ oldu.

## V1.83 — 2026-10-12
- **Karma çok oyunculu:** maç sırasında uçaktan inip (Duraklat → Yürüyerek gez) yürüyebilir, araç, helikopter ya da tekne kullanabilirsin. Diğer oyuncular seni yaya, araç, helikopter veya tekne olarak görür. Bir uçağa binince yeniden uçarsın, maç sürer.
- **Yeni mod — Üs ele geçirme:** iki takım Hava, Deniz ve Kara üsleri için savaşır. Bölgede kalan takım üssü alır (uçaklar ancak 450 m altında sayılır). Her üs 5 sn'de 1 puan verir, 100 puana ulaşan kazanır. Üs halkaları sahnede ve haritada takım rengine boyanır, skor sağ üstte görünür.
- **Kule görevlisi rolü:** lobide "Rol: Kule görevlisi" seçen oyuncu uçak yerine radar ekranı görür. Bu ekranda tüm oyuncular yükseklik ve araç simgesiyle izlenir, hazır telsiz komutları (kalkış serbest, pas geç, üsse dön…) ve serbest mesaj gönderilir. Haritaya tıklanan nokta herkese 60 sn'lik işaret olarak düşer.
- **Yazılı sohbet:** / tuşu (dokunmatikte SOHBET) ile mesaj yazılır. Mesajlar herkese iletilir ve ekranın solunda görünür.
- **Oyuncu çıkarma:** ev sahibi lobide "Çıkar" düğmesiyle ya da sohbete "/at <ad>" yazarak bir oyuncuyu odadan çıkarabilir.
- Takımlar tek tarafta toplanmışsa Üs modunda otomatik dengelenir. Oyuncu listesinde rütbe ve ad görünür.
- Yeni test: 3 oyunculu karma maç (yürüme, üs ele geçirme, sohbet, kule işareti, çıkarma).

## V1.82 — 2026-10-12
- **Donma düzeltmesi:** Kar ya da yağmur seçiliyken uçarken oyun donuyordu. Sebep yağış kodundaki bir değişkenin tanımlanmadan önce kullanılmasıydı; düzeltildi. Hava durumu kodunda ileride bir hata olsa bile oyun artık durmuyor.
- **Yeni ana menü:** Solda yalnızca **Başla** ve **Çok Oyunculu** var. Başla'ya basınca **Hızlı oyun** (Serbest uçuş, Üssü gez, Hangar) ve **Kariyer** açılıyor; Esc ya da "Geri" ile üst menüye dönülüyor.
- **Hızlı oyun:** Puan kazandırmaz; bütün uçaklar, araçlar, boyalar ve görevler açık.
- **Kariyer:** Görevler, Eğitim, Serbest gezi ve Hangar. Tecrübe puanı burada kazanılıyor. Görevler rütbeye göre açılıyor (ör. İt dalaşı Astsubay, Yer hedefleri Uzman Çavuş); kilitli görevin yanında gereken rütbe yazıyor. Kariyer hangarında uçaklar, araçlar ve boyalar rütbeyle açılıyor.
- **Üst sağ:** Ayarlar, Rekorlar ve (yöneticiye) Yönetim artık profil düğmesinin yanında küçük simgeler. Ayrı Kariyer düğmesi kaldırıldı; profil düğmesi aynı sayfayı açıyor.
- **Kütüphaneler:** Model ve Ses kütüphanesi ana menüden kaldırıldı, Yönetim panelinin üstündeki "Kütüphaneler" satırından açılıyor.
- Yol haritası: Karma çok oyunculu V1.83'e, sonraki sürümler birer numara ileri kaydı.

## V1.81 — 2026-10-11
- **Görev editörü:** Görev panosunda "Özel" kategorisi ve "＋ Yeni görev oluştur" girişi var. Editörde ada haritasına yer hedefi (kamyon, radar, depo, sığınak, SAM), hava hedefi, düşman uçağı, geçiş noktası, keşif noktası ve başlangıç yeri (yön ve irtifa ile) yerleştirilebiliyor. Öğeler sürüklenip taşınıyor; özellikleri (tür, irtifa, yarıçap, yön) yandaki panelden ayarlanıyor.
- **Aşamalar (tetikleyiciler):** Her öğeye 1–5 arası bir aşama veriliyor. 1. aşama baştan var; bir aşamadaki her şey bitince sıradaki aşamanın öğeleri belirir (örneğin "radarı vur → düşman uçakları gelsin → keşif yap").
- **Görev ayarları:** Ad, brifing, uçak (sabit ya da oyuncunun seçtiği), süre sınırı, hava durumu ve gün saati. Görev bitince hava ve saat eski hâline dönüyor.
- **Dene ve kaydet:** "Dene" görevi kaydedip hemen başlatıyor; görev sonunda "Editöre dön" ile düzenlemeye devam ediliyor. Kaydedilen görevler panoda "Özel" altında listeleniyor ve "✎ Düzenle" ile açılıyor.
- **Paylaşma:** Görev kısa bir kodla (AYG1.…) kopyalanıp başkasına gönderilebiliyor ya da .json dosyası olarak kaydedilebiliyor. Kod veya dosya editörde içe aktarılıyor.
- **Yönetici yayını:** Yönetici hesabıyla "Herkese yayınla" seçilen görevi bütün oyunculara gönderiyor; bu görevler panoda ★ ile görünüyor. Bunun için Supabase şemasına 'mission' içerik türü eklendi (supabase/schema.sql).

## V1.80 — 2026-10-11
- **Yarışlar:** Görev panosuna "Yarış" kategorisi eklendi, dört yarış var: Ada halka yarışı (Hürjet, adanın çevresinde 12 halka), Helikopter slalomu (T129, pistin doğusunda 15 metrede 11 kapı), Ada rallisi (SUV, Kara Üssü'nden köye dağ yolu) ve Körfez tekne yarışı (Hücumbot, şamandıraların çevresinde iki tur).
- **Süre ve kapılar:** Süre ilk kapıdan geçince başlıyor. Sıradaki kapı yeşil, sonraki üç kapı turuncu görünüyor. HUD'da kapı sayısı, süre, en iyi derece, sıradaki kapının yönü, mesafesi ve yükseklik farkı yazıyor.
- **Hayalet:** En iyi koşun kaydediliyor. Sonraki denemelerde yarı saydam mavi bir kopya ("hayalet") o çizgide seninle birlikte uçuyor ya da sürüyor. Her kapıda en iyi dereceye göre önde (yeşil) ya da geride (kırmızı) olduğun saniye cinsinden gösteriliyor.
- **Sıralama tablosu:** Her yarışın ilk 5 derecesi çağrı adı ve tarihle cihazda saklanıyor; bitişte tablo gösteriliyor, panoda en iyi süre yazıyor.
- **Ödül:** Rekor kırınca 120, normal bitişte 40 tecrübe puanı.
- Yarışlarda ve uçuş okulu derslerinde kanat adamı ve düşman uçağı çıkmıyor.

## V1.79 — 2026-10-11
- **Boyalar:** Hangarda uçak bilgilerinin altında "Boya" seçimi var: Standart, Deniz grisi, Çöl kamuflajı, Orman kamuflajı, Dijital kamuflaj, Gece, Kızıl Elma ve Altın. Boyalar rütbeyle açılıyor (Onbaşı'dan Albay'a kadar). Seçim her uçak için ayrı kaydediliyor.
- **Başarımlar:** 16 başarım var: 10 saat uçuş, 100 iniş, 25 düşman uçağı, 100 yer hedefi, 25 görev, 10 dinamik görev, 30 yıldız, uçuş okulunu bitirmek, gemi inişleri, gece uçuşu, fırtınada iniş, 1000 km, 20 yer, fırlatıp sağ kurtulmak ve diğerleri. Her birinin ilerleme çubuğu ve tecrübe puanı ödülü var.
- **Günlük ve haftalık görevler:** Her gün 3, her hafta 2 görev tarihe göre seçiliyor (örneğin "2 iniş yap", "50 km uç"). İlerleme Kariyer sayfasında görünüyor; görev tamamlanınca ödül kendiliğinden veriliyor.
- **İstatistikler:** Uçulan mesafe, gece uçuşu, gemi güvertesine iniş, fırtınada iniş, fırlatmalar, toplam yıldız, dersler, başarımlar ve daha fazlası Kariyer → İstatistikler'de listeleniyor.
- **Rütbeyle açılanlar:** Kariyer sayfasında hangi uçağın, aracın ve boyanın hangi rütbede açıldığı listeleniyor. Kilitler bulut hesaplarda geçerli; bulut bağlanmadan önce her şey açık kalıyor.

## V1.78 — 2026-10-11
- **Uçuş okulu:** Ana menüye "Uçuş Okulu" eklendi; dersler görev panosunda "Okul" kategorisinde de var. Sekiz ders: Kalkış, Trafik turu, İniş, Rüzgârlı iniş (Hürkuş), Havada asılı kalma, Askı yükü (T625), Silah kullanımı (Hürjet), Gemiye iniş (T625: önce rıhtımdaki fırkateyn, sonra seyir hâlindeki korvet).
- **Adım adım ilerleme:** Her derste HUD'da bir kontrol listesi var; yapılan adımlar işaretleniyor, süre isteyen adımlarda (ör. 10 m'de 5 saniye sabit dur) sayaç görünüyor. Trafik turunda dönüş noktaları gökyüzünde halka olarak işaretli.
- **Eğitmen telsizi:** Eğitmen her adımı telsizden anlatıyor (sesli ve altyazılı), başarıları onaylıyor. Kaza olursa ders tekrar başlatılabiliyor.
- **Rüzgârlı iniş:** Ders sırasında doğudan 25 knotluk yan rüzgâr ve türbülans esiyor; ders bitince hava eski hâline dönüyor.
- **Lisanslar:** Uçak dersleri Pilot lisansı, helikopter dersleri Helikopter lisansı, silah dersi Silah sertifikası veriyor. Lisanslar kariyerde madalya olarak görünüyor. Tamamlanan dersler panoda ✓ ile işaretleniyor.

## V1.77 — 2026-10-11
- **Dinamik görevler:** Görev panosunda yeni "Dinamik" kategorisi var. Her oyun açılışında adadaki yerlere göre altı görev üretiliyor: üç uçak görevi, iki helikopter görevi ve bir kara konvoyu. "↻ Yeni görevler" ile istediğin an yeni set alabilirsin.
- **Uçak görevleri:** Devriye (sırayla yerlerin üzerinden geç), Önleme (üsse gelen kamikaze İHA'ları 2 km'den önce düşür), Yakın hava desteği (dost mevziye saldıran araçları imha et), Refakat (nakliye uçağını düşman avcılarından koru), İHA keşfi (İHA ile bölgeleri tara; insanlı uçak seçiliyse Aksungur verilir), Deniz devriyesi (deniz noktaları ve gemi tanımlama).
- **Helikopter görevleri:** T625 ile arama-kurtarma (yaralıları bul, bindir, hastane helipadine götür) ve askıda yük taşıma; T129 ile bölge temizliği.
- **Kara konvoyu:** Askerî kamyonla Kara Üssü'nden çıkıp kontrol noktalarından geçiyorsun.
- **Çok aşamalı hedefler:** Görevler adım adım ilerliyor. Süre sınırı var. Çoğu görevde bir de isteğe bağlı bonus hedef var (şüpheli konvoyu imha et, 4 dakikada bitir, hasar alma, yakıtın yarısı kalsın gibi). Bonusu tamamlamak yıldız ve ek XP getiriyor.
- **Görev ortası olaylar:** Görevin üçte biri geçince yeni bir SAM bataryası çıkabilir, hava fırtınaya ya da sise dönebilir (görev sonunda eski hâline gelir) ya da yakıt sızıntısı veya motor arızası olabilir.

## V1.76 — 2026-10-11
- **Görev panosu:** Uçak ve helikopter görevleri tek listede. Kategori (Eğitim, Hava, Taarruz, Keşif, Helikopter), zorluk ve süreye göre filtreleyebilir, ödüle göre sıralayabilirsin. Her görevin yanında zorluk, süre, XP ödülü ve kazandığın yıldızlar yazar.
- **Brifing:** Görev bölgesini gösteren harita, hedefler, tehditler ve önerilen yük listelenir. Önerilen yükü tek dokunuşla uygulayabilirsin. Serbest uçuşta uçak yerine T129 ya da T625 seçilebiliyor.
- **Oyun içi hedef takibi:** Pusulanın altında görev adı, ilerleme (örneğin 3/13 yer hedefi), kalan süre ve en yakın hedefe uzaklık görünür.
- **Görev günlüğü:** F2 tuşuyla ya da Duraklat → "Görev günlüğü" ile açılır; görev boyunca olanları zaman damgalı listeler.
- **Görev sonu raporu:** 1–3 yıldız (bitirmek, hızlı bitirmek, az hasar almak), süre, puan, vurulan hedef, atış sayısı, en düşük can ve XP ödülü. Zor görevler artık daha çok XP veriyor. Helikopter görevleri de yıldız alıyor.
- **T625 kapı silahı:** Boşluk ile sağ kapıdaki makineli tüfek ateşlenir; menzildeki hedefe kendiliğinden yönelir. Helipadde mühimmatı yenilenir.

## V1.75 — 2026-10-11
- **Hava trafiği:** Ana apronda park eden üç yapay zekâ uçağı (Hürjet "Şimşek 05", Hürkuş "Doğan 11", Aksungur "Kartal 21") var. Sırayla taksi yolundan pist başına gidip kalkıyor, sağ trafik turu atıp iniyor, pistin sonunda dönüp geri taksi ederek yerine park ediyor.
- **Pist kuralları:** Sen pistteyken, pist başında beklerken ya da son yaklaşmadayken yapay zekâ uçakları pist başında bekliyor; inişteki uçak pist doluysa pas geçip turu tekrarlıyor. Sen hangardan taksi ederken de yollarını kesmiyorlar. Kule bu uçaklarla telsizden konuşuyor (taksi, kalkış ve iniş izni, pas geç).
- **Yer personeli:** Park eden her uçağın yanında reflektif yelekli iki teknisyen var. Hangar çıkışındaki marşalcı, taksi eden bir uçak (seninki dahil) yaklaşınca ışıklı çubuklarını sallıyor.
- **Yayalar:** Üsteki, köylerdeki ve şehirlerdeki kaldırımlarda yürüyen insanlar var (telefonda daha az). Performansı etkilemesin diye toplu (instanced) çiziliyorlar.
- **Haritada** yapay zekâ uçakları beyaz noktalarla görünüyor.
- **Ayar:** Ayarlar → Grafik → "Canlı üs" ile hepsi kapatılabilir. Çok oyunculu oyunda trafik duruyor.

## V1.74 — 2026-10-11
- **Hava durumu:** Ayarlar → Grafik'te "Hava durumu" seçimi eklendi: Açık, Bulutlu, Yağmur, Fırtına, Kar, Sis ve Değişken. Değişken seçilirse hava 4–8 dakikada bir kendiliğinden değişir. Geçişler yumuşak olur.
- **Yağmur ve kar:** Kameranın çevresinde yağmur çizgileri ve kar taneleri yağar. Hızlı uçarken yağmur rüzgârla yatay çizgilere döner. Yağmur sesi de var.
- **Gökyüzü ve ışık:** Kötü havada gökyüzü griye döner, güneş ışığı zayıflar, bulutlar koyulaşır. Sis ve yağış görüş mesafesini kısaltır.
- **Fırtına:** Şimşek çakar, gök aydınlanır ve gök gürültüsü uzaklığa göre gecikmeli duyulur.
- **Rüzgâr ve türbülans:** Rüzgâr uçağı ve helikopteri sürükler, hamleler (gust) değişkendir. Türbülans alçakta ve hızlıyken daha çok sarsar. Rüzgâr yönü ve şiddeti HUD'da yazar, kule anonsları da gerçek rüzgârı söyler.
- **Gece görüş ve termal kamera:** " tuşuyla (telefonda GÖRÜŞ düğmesi) sırasıyla NVG yeşil gece görüşü, FLIR beyaz sıcak, FLIR siyah sıcak ve normal görüş arasında geçilir. Gece görüşü karanlıkta daha çok aydınlatır.
- Düzeltme: sapan halatı ve bazı ince çizgiler uzaktan bakınca kayboluyordu.

## V1.73 — 2026-10-11
- **Yakıt:** Gaz arttıkça yakıt daha hızlı biter; art yakıcı çok daha fazla yakar, İHA'lar çok daha uzun uçar. HUD'da yakıt göstergesi, %20'de "YAKIT AZ", %8'de "YAKIT KRİTİK" uyarısı ve kule anonsu var. Yakıt bitince motor durur ve süzülerek inmen gerekir.
- **İkmal ve onarım:** Herhangi bir pistte gazı kesip durursan yakıt dolar. Bakım hangarında hem tam onarım hem tam yakıt yapılır. Ayarlar → Oynanış'tan yakıt tüketimini Kapalı, Normal ya da Gerçekçi (2 kat hızlı) yapabilirsin.
- **Hasar modeli:** İsabetler motora (itki düşer, motor yangını çıkabilir, yangın sonunda motor durur), yakıt deposuna (sızıntı, beyaz iz) ya da kanada (uçak o yöne yatar, parçalar kopup düşer) gelebilir. HUD'da uyarı listesi ve uyarı sesi var.
- **Fırlatma koltuğu:** J tuşuna iki kez bas (telefonda hasar alınca beliren FIRLAT düğmesine iki kez dokun). Kanopi uçar, koltuk yükselir, paraşüt açılır. A/D ile dön, W ile hızlan, S ile yavaşla.
- **Yere iniş:** İndiğin yerde yürüyerek devam edersin; G ile araç çağırabilirsin. Denize düşersen kurtarma ekibi seni en yakın kıyıya bırakır. Pilotsuz kalan uçak bir süre uçup düşer. İHA'larda fırlatma koltuğu yoktur; görev sırasında fırlatırsan görev başarısız sayılır.

## V1.72 — 2026-10-11
- **Helikopter görevleri:** Hangarın Helikopter sekmesinde artık görev listesi var. T129 için "Poligon Atışı" ve "Konvoy Avı", T625 için "Asker İntikali" ve "Askı Yükü". Görev sırasında HUD'da hedef, kalan süre, yön oku ve mesafe görünür. Sonunda rekor süre ve XP veren sonuç ekranı açılır.
- **T129 silahları:** 20 mm top (Boşluk; nişangâhtaki hedefe kendiliğinden döner), CİRİT güdümlü roket ve UMTAS tanksavar füzesi (X ateşler, Tab değiştirir; UMTAS için hedefe kilitlenmek gerekir). HUD'da cephane, nişangâh ve hedef kutuları gösterilir. Helipada inince mühimmat yenilenir.
- **T625 asker taşıma:** Yerdeyken B'ye basınca yakındaki askerler biner ya da içerideki tim iner. Askerler kapıdan yürüyerek çıkar.
- **Askı yükü:** Havada, bir sandığın ya da hafif bir aracın üstünde asılı dururken B ile kancaya alırsın; yük halatla sallanarak taşınır. Yere değince B ile bırakılır, yüksekten bırakılan yük düşer ve hasar görebilir.
- **Askı yardımı (hover assist):** J ile açılıp kapanır. Açıkken cyclic bırakıldığında helikopter kendiliğinden yavaşlayıp havada asılı kalır.
- **Araç çağırma · Hava ve Deniz sekmesi:** T625 ya da T129 uçarak gelip yanına iner. Hücumbot en yakın denizden kıyıya yanaşır. Bozkurtlar 4×4'ü bir T625 askıda getirip bırakır.
- Yeni tuşlar (Ayarlar → Kontroller → Helikopter): Tab silah değiştir, B kanca/asker, J askı yardımı.

## V1.71 — 2026-10-11
- **Araç çağırma menüsü:** Yürürken **G** (kumandada Y, telefonda ÇAĞIR) ile dairesel menü açılır. İki sekme var: Sivil · Hizmet (SUV'lar, Bozkurtlar 4×4, kamyon, yakıt tankeri, itfaiye, otobüs, uçak çekici) ve Askerî (Kirpi, Pars, Korkut, Hisar, Fırtına, Altay).
- **Teslimat yeri:** "Yanıma" seçilirse araç önüne gelir. "Haritadan" seçilirse haritada istediğin noktayı işaretlersin; "Oraya gönder" ya da "Gönder ve oraya git" ile teslim edilir.
- **Teslimat animasyonu:** Sivil araçlar yaklaşık 110 m öteden kendileri sürüp gelir. Askerî araçlar paraşütle iner. Turuncu işaret ışığı teslimat noktasını gösterir, HUD'da kalan mesafe yazar.
- **Lojistik telsizi:** Yola çıkış ve teslim anonsları telsizden gelir.
- **Sınırlar:** Aynı anda en fazla 3 çağrılmış araç bulunur (en eskisi geri gider). Siparişler arasında kısa bekleme süresi var. Askerî araçlar bulut hesaplarda rütbe ister.
- Çağrılan araçlara normal araçlar gibi binilir, haritada turuncu kare olarak görünürler. "Araç çağır" tuşu Ayarlar → Kontroller → Yaya bölümünden değiştirilebilir.

## V1.70 — 2026-10-11
- **Deniz araçları:** Mendirek yanında sürülebilir Hücumbot, Römorkör ve Korvet; marinada balıkçı teknesi ve yelkenli. Binmek için yanaşıp E.
- **Makine telgrafı ve dümen:** W/S kademeli makine (TAM GERİ … TAM YOL), A/D dümen, knot göstergesi, dalga izi ve sprey.
- **Gemi topları:** Hücumbot ve korvette Boşluk/X ile top atışı.
- **Kıyıya yanaşma:** Kıyıya, iskeleye ya da güverteye yakınken E ile in.
- **Helikopter güverteleri:** İskeledeki fırkateynlerin helikopter platformlarına iniş yapılabilir.
- **Devriye korveti:** Körfezde devriye gezen korvetin hareketli güvertesine inen helikopter gemiyle birlikte taşınır.

## V1.69 — 2026-10-11
- **Tüm kara araçlarına binilebiliyor.** Gezintide araca yürüyüp E'ye basman yeterli.
  - Hava Üssü apronu: itfaiye, yakıt tankeri, personel otobüsü, uçak çekici.
  - Kara Üssü araç filosu (haritada "Kara Üssü · araç filosu"): Altay, Fırtına, Pars, Korkut, Hisar, Kirpi, askerî kamyon, Bozkurtlar 4×4.
  - Hilalkent: otobüs ve kırmızı SUV.
- **Her aracın kendi sürüşü:** azami hız, ivme, yol tutuşu ve yokuş davranışı araca göre değişiyor. Kamera büyük araçlarda uzaklaşıyor. Ağır araçların motor sesi daha kalın.
  - Altay, Fırtına, Korkut ve Hisar paletli: yerinde dönebiliyor.
- **Tank ve zırhlılar:** taret fareyle ya da sağ çubukla döndürülüyor, ekranda nişangâh var.
  - Altay ve Fırtına ağır top atıyor: balistik mermi, 2,4 sn dolum, geri tepme.
  - Pars ve Korkut otomatik top atıyor (X basılı tut).
  - Mermiler yer hedeflerine hasar veriyor ve onları yok edebiliyor.
- **İtfaiye:** X ile su topu; su kamera yönüne fışkırıyor.
- **Uçak çekici:** apronda park etmiş Hürjet'in burnuna yanaşıp X ile bağlanıyor, sonra uçağı çekip istediğin yere götürebiliyorsun. X ile bırakılıyor.
- Araçlar birbirine ve yürüyen oyuncuya çarpıyor.
- T ile değiştirme yalnız binek araçlarda (SUV, 4×4, Beni İzle).
- Yeni tuş: **Ateş / su topu / uçak çek:** X (gamepad LB, fareyle sol tık).

## V1.68 — 2026-10-11
- **Yönetici modu.** Yönetici yetkisi veritabanında tutuluyor ve oyuncular kendilerine veremiyor. Ana menüde yalnız yöneticiye görünen **Yönetim** bölümü var.
- **Yönetim paneli:**
  - **Oyuncular:** liste ve arama; rütbe verme veya geri alma; uzaklaştırma ve yasağı kaldırma.
  - **Duyurular:** yayınla, kaldır, yeniden yayınla. Ana menüde görünür.
  - **İçerik:** bu cihazdaki modelleri, ses ve müzik dosyalarını ve boyaları tek tuşla herkese yayınla; tek tek yayından kaldır.
  - **Oyun ayarları:** rütbe kilitlerini aç/kapa, tecrübe puanı çarpanı (1×–3×).
  - **İşlem kaydı:** kim, neyi, ne zaman yaptı.
- **Kütüphaneler yalnız yöneticiye görünüyor:** Model Kütüphanesi, Ses Kütüphanesi ve müzikler oyunculardan gizlendi. Yöneticinin yayınladığı içerik oyunculara kendiliğinden iniyor ve kullanılıyor: GLB modeller uçaklara uygulanıyor, ses ve müzik dosyaları çalınıyor, boyalar uçaklara giydiriliyor.
- Oyuncular ses kanallarını artık Ayarlar → Ses → **Kanal karışımı** bölümünden ayarlıyor.
- Bulut bağlantısı kurulmamış cihazda oyun geliştirici modunda çalışıyor: kütüphaneler ve yönetim bölümü açık, rütbe kilitleri kapalı.
- `supabase/schema.sql`'e uzaktan ayar için 'config' içerik türü eklendi. Daha önce kurduysan dosyayı yeniden çalıştırman yeterli.

## V1.67 — 2026-10-11
- **Rütbeler:** Er → Onbaşı → Çavuş → Uzman Çavuş → Astsubay → Asteğmen → Teğmen → Üsteğmen → Yüzbaşı → Binbaşı → Yarbay → Albay → Tuğgeneral → Tümgeneral → Korgeneral → Orgeneral.
  - Her rütbenin arması var: erbaşlarda şerit, astsubayda çubuk, subaylarda yıldız, üst subaylarda ay-yıldız, generallerde defne ve yıldızlar.
- **Tecrübe puanı (TP):** uçuşta kazanılan puanın dörtte biri (hedef, düşman, halka), havada geçen her dakika (+10), kalkış (+5), iniş (+30), tamamlanan görev (+150), haritada yeni bir yer (+15), helikopterle uçuş.
- **Terfi töreni:** rütbe atlayınca menüde büyük arma ve zafer müziğiyle gösteriliyor; açılan uçaklar listeleniyor.
- **Kariyer sayfası** (ana menü → Kariyer ya da profil kartı):
  - Rütbe ve sonraki rütbeye kalan TP çubuğu.
  - İstatistikler: uçuş süresi, kalkış, iniş, görev, düşürülen uçak, yer hedefi, helikopter, kaza.
  - 10 madalya.
  - Son 12 uçuşun kaydı: tarih, araç, görev, süre, sonuç, TP.
  - Rütbe basamakları.
- **Rütbeyle açılan uçaklar:** TB3 (Asteğmen), Akıncı (Teğmen), Kızılelma (Üsteğmen), KAAN (Yüzbaşı), ANKA-3 (Binbaşı). Hangarda kilit simgesi ve gerekli rütbe gösteriliyor.
  - Kilitler yalnız bulut hesabıyla oynayan normal oyuncular için geçerli. Yönetici her uçağı kullanabiliyor; bulut bağlantısı kurulmamış cihazda da kilit yok.
- Profil kartında rütbe kısaltması, çok oyunculuda isim yanında rütbe.

## V1.66 — 2026-10-11
- **Hesap ve profil ekranı:** ana menüdeki profil kartına dokununca açılıyor.
  - Google ya da e-posta/şifre ile giriş, kayıt, şifre yenileme.
  - "Misafir olarak devam et" seçeneği var; internetsiz de çalışıyor.
- **Profil:** çağrı adı, birlik (Hilal Kanatlar / Mavi Kanatlar / Bozkurtlar) ve arma (6 seçenek).
- **Aynı cihazda birden çok profil:** misafir profiller arasında geçiş ve yeni profil ekleme.
- **Bulut eşitleme:** ayarlar, kontrol tuşları, boyalar, mühimmat yükleri, rekorlar ve ses ayarları hesaba kaydediliyor.
  - Bir değişiklikten 4 saniye sonra gönderiliyor. Girişte en yeni kopya alınıyor, iki cihazda da aynı kayıt görünüyor.
  - İnternet yokken bu cihazda saklanıyor, bağlantı gelince gönderiliyor.
  - İlk girişte bu cihazdaki kayıtlar hesaba aktarılıyor.
- **Duyurular:** yöneticinin yayınladığı son duyuru ana menüde görünüyor.
- **Sunucu tarafı (Supabase):** `supabase/schema.sql` profil, kayıt, içerik, duyuru ve yönetici kaydı tablolarını kuruyor.
  - Güvenlik kuralları: oyuncu kendi rolünü ve uzaklaştırma durumunu değiştiremez, rütbesini düşüremez. İçerik ve duyuruyu yalnız yönetici yazar.
  - Kurulum adımları `supabase/KURULUM.md` dosyasında.
- Bağlantı için anahtarlar ya `src/js/79-account-config.js` dosyasına yazılıyor (herkes için) ya da Ayarlar → Arayüz → Gelişmiş → **Bulut bağlantısı** satırından giriliyor (yalnız o cihaz için).
- Bulut bağlantısı kurulmadan önce oyun eskisi gibi misafir modunda çalışıyor.

## V1.65 — 2026-10-11
- **Ayarlar menüsü yenilendi.**
  - **Arama:** yazdıkça tüm sekmelerdeki uyan ayarlar gösteriliyor.
  - **Basit / Gelişmiş görünüm:** varsayılan basit. Çözünürlük, kenar yumuşatma, derinlik, güvenli mod, tanılama, FPS ve otomatik performans "Gelişmiş" altında.
  - **↶ Geri al:** pencere açıldığından beri yapılan tüm değişiklikleri geri alıyor.
  - **Varsayılanlar:** iki kez basınca tüm ayarları sıfırlıyor; kontrol tuşları, çağrı adı ve başlangıç yeri korunuyor.
- **Yeni sekme: Erişilebilirlik.**
  - **Yazı ve arayüz boyutu:** Küçük / Normal / Büyük / Çok büyük. Menüler, ayarlar, hangar, mühimmat, kütüphaneler ve telsiz yazıları büyüyor.
  - **Renk körlüğü düzeltmesi:** Protanopi / Döteranopi / Tritanopi. Oyun görüntüsü ve göstergelerin renkleri ayırt edilebilir biçimde kaydırılıyor (daltonizasyon).
  - **Yüksek karşıtlık:** daha koyu paneller, daha belirgin yazı ve çerçeveler.
  - **Hareketi azalt:** menü animasyonları, hız bulanıklığı ve kamera sarsıntısı kapanıyor.
  - Telsiz altyazıları ve kumanda titreşimi de buradan açılıp kapatılabiliyor.

## V1.64 — 2026-10-11
- **Hangarda helikopter:** sınıf filtresinde yeni **Helikopter** sekmesi (T129 ATAK, T625 GÖKBEY). Seçilen helikopter, kamera Hava Üssü helipadine giderek 3B gösteriliyor. Rotor çapı, azami hız, tırmanma ve mürettebat bilgisi var. **"Helikopterle uç"** ile doğrudan pilot koltuğunda başlıyorsun.
- **Performans çubukları:** her araç için hız (km/sa), manevra, itki ve silah yeri.
- **Karşılaştırma:** "⇄ Karşılaştır" ile bir aracı sabitleyip başka bir araç seçiyorsun. Sabitlenen aracın değerleri sarı çizgiyle yan yana görünüyor.
- **Mühimmat yükleme yenilendi:**
  - **Hazır yükler:** Hava-hava, Kara taarruzu, Sığınak / zırh, Keşif (hafif), Boşalt. Uçağın taşıyabildiği silahlara göre doluyor.
  - **İstasyon şeması:** uçağın üstten görünümünde silah istasyonları, silah türüne göre renkli.
  - **Toplam yük göstergesi:** kg ve sürükleme düzeyi; ağır yükte hız ve manevra uyarısı.
- Telefonda mühimmat paneli artık kaydırılabiliyor.

## V1.63 — 2026-10-11
- **Yeni ana menü.** Bölümler gruplandı:
  - **OYNA:** Serbest Uçuş, Görevler, Kariyer (yakında), Çok Oyunculu, Üssü Gez.
  - **ÜS:** Hangar, Model Kütüphanesi, Ses Kütüphanesi.
  - **SİSTEM:** Ayarlar, Rekorlar.
  - Her bölümün ikonu ve kısa açıklaması var.
- **Ayrıntı paneli:** seçili bölümün ne yaptığını, canlı bilgileri (uçak, başlangıç yeri, yük, kalite…) ve tek büyük "Başlat" düğmesini gösteriyor.
- Üstte **profil kartı** (çağrı adı, rütbe arması; tam profil V1.66–V1.67'de). Altta son kullanılan cihaza göre değişen tuş ipuçları: klavye, gamepad ya da dokunmatik.
- **Gamepad ve klavyeyle tam gezinme:** ana menüde ok tuşları ve Enter. Artık tüm pencerelerde (ayarlar, kütüphaneler, çok oyunculu…) gamepad yön tuşu veya çubukla en yakın düğmeye geçiliyor; A ile basılıyor, B ile geri dönülüyor.
- **Tasarım sistemi:** ortak renk, yazı ölçeği, köşe, boşluk ve hareket değerleri tanımlandı. Pencere açılışları yumuşak, düğmelerde basma tepkisi var. Odak çerçevesi tek tip. "Hareketi azalt" ayarı açık olan cihazlarda animasyonlar kapanıyor.
- Telefonda dokunulan bölüm önce ayrıntısını gösteriyor, ikinci dokunuşta ya da büyük düğmeyle açılıyor. Kısa ekranlarda menü sıkışık düzene geçiyor.
- Eski tasarımlar (Komuta, Sinematik) Ayarlar → Arayüz bölümünden hâlâ seçilebiliyor.

## V1.62 — 2026-10-11
- **Kule konuşmaları:** pistte başlarken kalkış izni (pist ve rüzgâr bilgisiyle), kalkış sonrası "kalkışınız görüldü", takım inik yaklaşırken iniş izni, inince "apronda park edin". Pist dışında çok alçak uçarken uyarı.
- **AWACS (Kartal Gözü):** yeni düşmanlar belirince sayısını, saat yönünü ve uzaklığını bildiriyor. Hava sahası temizlenince ve görev bitince haber veriyor.
- **Kanat adamı (Kılıç 2):** katılınca, füze uyarısında ("Füze! Kır!"), senin ya da kendi düşürdüğü düşmanlarda konuşuyor.
- Konuşmalar tarayıcının Türkçe sesiyle okunuyor: konuşanlara göre ton farkı, telsiz açılış ve kapanış sesi, arkada cızırtı. **Altyazılar** konuşanın adıyla renkli gösteriliyor.
- **Ses Kütüphanesi → Telsiz:** her cümle dinlenebiliyor ve **kendi kaydınla değiştirilebiliyor**. Kayıt telsiz filtresinden geçirilerek çalınıyor.
- **Telsiz menüsü (O):** 8 hazır mesaj, 1–8 tuşlarıyla seçiliyor. Tek oyunculuda kanat adamı cevap veriyor. Çok oyunculuda mesaj tüm oyunculara gidiyor; ekranda isimle görünüyor ve okunuyor. Dokunmatikte TELSİZ düğmesi var.
- **Sesli sohbet (çok oyunculu):** lobide "Sesli sohbet" kutusu ve bas-konuş (I; dokunmatikte 🎙). Her oyuncu odayı kurana bağlanıyor; oda kurucusu herkese kendi dışındaki oyuncuların sesini gönderiyor. Sesler telsiz filtresinden geçiyor, konuşurken "KONUŞUYORSUN" göstergesi çıkıyor.
- Ayarlar → Ses: telsiz konuşmaları ve altyazılar açılıp kapatılabiliyor, **çağrı adın** değiştirilebiliyor (varsayılan "Hilal 1").

## V1.61 — 2026-10-11
- **Oyunun kendi müziği.** Parçalar tarayıcıda canlı üretiliyor, telifsiz:
  - **Ana menü teması:** Re minör, savaş davulları, Hicaz havasında yaylı ezgi.
  - **Sakin uçuş:** yumuşak akorlar, arpej.
  - **Çatışma:** 132 vuruşluk ritim, ostinato bas, yaylı vuruşlar.
  - **Zafer** ve **yenilgi** kısa melodileri.
- **Duruma göre müzik:** menü ve hangarda tema çalıyor, uçuşta sakin müzik. Düşman 6,5 km'ye yaklaşınca, füze ya da radar uyarısı gelince çatışma müziğine geçiyor; tehlike bittikten 12 saniye sonra sakine dönüyor. Görev başarıyla bitince zafer, başarısızlıkta ya da kazada yenilgi melodisi çalıyor. Geçişler yumuşak.
- Ses Kütüphanesi'nde artık **Müzik** kategorisi var: her parça dinlenebiliyor, ses düzeyi ve hızı ayarlanabiliyor ya da kendi müzik dosyanla değiştirilebiliyor (dosya döngüde çalar).
- **Arayüz sesleri:** düğme, geri, onay ve üzerine gelme (fareyle). Bildirim ve uyarı mesajlarının kendi sesi var.
- Ayarlar → Ses: **Müzik** ve **Arayüz sesleri** açılıp kapatılabiliyor.

## V1.60 — 2026-10-11
- **Ses Kütüphanesi** (Ayarlar → Ses → Ses kütüphanesi): oyundaki 25 ses kategorilere ayrıldı.
  - Kategoriler: Motor, Silah, Patlama, Çevre, Arayüz, Telsiz, Müzik.
  - Her sesi dinleyebilir, ses düzeyini (%0–200) ve tonunu (%50–200) ayarlayabilirsin.
  - **Kendi ses dosyanı yükleyebilirsin** (mp3/ogg/wav/m4a, en fazla 12 MB; bu cihazda saklanır). "Varsayılan" ile eskiye dönülür.
  - Motor, rotor, araç, rüzgâr ve dalga gibi sürekli sesler için yüklenen dosya döngüde çalıyor. Hızı gaza, rotor devrine ya da vitese göre değişiyor.
- **Kanal karışımı:** Ana, Müzik, Efekt, Arayüz, Telsiz ve Ortam ses düzeyleri ayrı ayrı ayarlanabiliyor.
- **Duruma göre ses:** menüde ve kütüphanede uçuş efektleri susuyor. Duraklatınca, haritada ve serviste efektler kısılıyor. Sessize alma (U) tüm kanallara uygulanıyor.
- Yeni olay sesleri eklendi: füze ateşleme, bomba bırakma, iniş takımı, piste teker teması.
- Ses sistemi artık sayfada ilk dokunuşta açılıyor; menülerde de ses çalabiliyor (müzik ve düğme sesleri V1.61'de gelecek).

## V1.59 — 2026-10-11
- **Çizim çağrısı yarı yarıya azaldı.** Ölçümler (yüksek kalite, gölgeler açık):
  - Pist başında 1433 → ~725
  - 900 m irtifada 1730 → ~680
  - Kasabada 336 → ~310
- **Çizilen üçgen azaldı.** Örnek: Hilalkent'te 1,49 milyon → 0,79 milyon.
- **Ekrandaki boyuta göre gizleme:** ekranda birkaç pikselden küçük kalacak uzak nesneler çizilmiyor; bank, lamba, kulübe, tabela gibi ~2800 nesne bu kapsamda. Oyun mantığındaki görünürlük ayarları etkilenmiyor ve gölge de buna uyuyor. Eşik kaliteye göre: Düşük 6 px, Orta 4 px, Yüksek 2,5 px, Ultra 1,2 px.
- **Orman, kaya, çit direği ve park etmiş araçlar 4 km'lik karolara bölündü.** Kameranın görmediği karolar artık hiç çizilmiyor; önceden hepsi her karede çiziliyordu.
- **Hazır ayarlar Düşük / Orta / Yüksek / Ultra.** Her biri çözünürlüğü, ağaç ve bulut yoğunluğunu, gölgeyi, efektleri, kenar yumuşatmayı ve uzak ayrıntıyı birlikte ayarlıyor.
  - Ultra: 4096 gölge, MSAA 8x, en uzak ayrıntı.
  - Telefonda gölge yalnızca Ultra'da varsayılan olarak açık.
  - Hazır ayara dokununca ayrı ayrı yapılan seçimler sıfırlanıyor. Kendi seçimlerin kullanılıyorsa "Özel" olarak gösteriliyor.
- **Grafik tanılama** ekranı gizlenen uzak nesne sayısını da gösteriyor.

## V1.58 — 2026-10-11
- **PC'de pikselleşme düzeltildi.** Otomatik çözünürlük eskiden FPS 38'in altına inince görüntüyü %60'a kadar düşürüyordu. Artık bilgisayarda en fazla %85'e, telefonda %70'e iniyor. Düşüş %5'lik küçük adımlarla oluyor, akıcılık düzelince geri çıkıyor. Bu ayar artık yürüyüş ve sürüş modunda da çalışıyor.
- **Yeni ayar — Çözünürlük:** Otomatik / %75 / %100 / %125 / %150. %125 ve %150 güçlü bilgisayarda daha keskin görüntü verir. Bu değerlerden biri seçilince otomatik düşürme kapanır.
- **Yeni ayar — Kenar yumuşatma:** Otomatik / FXAA / MSAA 4x / MSAA 8x. Bilgisayarda varsayılan MSAA, telefonda FXAA. Ekran kartının desteklediği en yüksek değerle sınırlanır.
- **Titremeyen gölgeler:** gölge haritası, ışığın kendi ekseninde tam piksellere sabitleniyor. Kamera hareket ederken gölge kenarlarındaki kayma ve kıpırdama gidiyor.
- **Doku filtreleme:** tüm dokulara bilgisayarda 16x, telefonda 4x anizotropik filtre uygulanıyor. Pist çizgileri, tabelalar ve zemin dar açıdan bakınca keskin kalıyor, uzakta parlayıp kıpırdamıyor.
- Grafik tanılama ekranı artık MSAA örnek sayısını da gösteriyor.

## V1.57 — 2026-10-11
- **Telefondaki siyah dalgalanma düzeltildi.** Gökyüzü küresi kameranın görüş sınırına çok yakın duruyordu; derinlik hassasiyeti düşük telefon ekran kartlarında gökyüzü bant bant kırpılıyor ve arkadaki siyah ekran görünüyordu. Gökyüzü artık her zaman en arkada, derinlik testine girmeden çiziliyor. Boş kalan her piksel siyah yerine ufuk rengiyle doluyor.
- **Cihaz profili:** oyun Telefon / Tablet / Bilgisayar ayrımını kendisi yapıyor.
  - Telefon ve tablette logaritmik derinlik yerine standart derinlik kullanılıyor. Uzaktaki titremeyi önlemek için yakın görüş sınırı irtifaya ve takip edilen araca göre kendini ayarlıyor.
  - Telefonda HDR ve çok örnekli tampon kapalı, yerine FXAA kenar yumuşatma kullanılıyor.
- **Gölgeler:** gölge derinlik aralığı yaklaşık 4 kat daraltıldı, bu sayede hassasiyet yükseldi. Gölge sapma ayarları yenilendi, telefonda daha hafif gölge filtresi kullanılıyor. Kayan koyu bantlar (gölge lekesi) gidiyor.
- **Ayarlar → Grafik** bölümüne yeni seçenekler eklendi:
  - **Derinlik hassasiyeti:** Otomatik / Logaritmik / Standart.
  - **Güvenli grafik modu:** tek dokunuşla efektler, gölgeler ve kenar yumuşatma kapanır.
  - **Grafik tanılama:** cihaz, ekran kartı, WebGL, hassasiyet, derinlik bitleri, çizim ölçeği, FPS, çizim çağrısı, üçgen, açık özellikler.

## V1.56 — 2026-10-11
- **Model havuzu:** model kütüphanesinde artık **Hava / Helikopter / Deniz / Kara / Sivil** sekmeleri var.
  - **Helikopter:** T129 ATAK, T625 GÖKBEY. "Döndür" testinde rotorlar dönüyor.
  - **Deniz:** İstif fırkateyni, Ada korveti, TCG Anadolu, denizaltı, hücumbot, römorkör; feribot, konteyner gemisi, tanker, balıkçı teknesi, yelkenli.
  - **Kara:** Altay, Fırtına, Pars, Kirpi, Hisar, Korkut, radar aracı, askerî kamyon, Bozkurtlar 4×4, arazi kamyoneti.
  - **Sivil:** Ay Yıldız SUV (beyaz/kırmızı), Beni İzle aracı ve havalimanı hizmet araçları.
- Her model 3B olarak döndürülüp ölçülebiliyor (boyut, üçgen, parça sayısı) ve **.glb olarak indirilebiliyor**.

## V1.55 — 2026-10-11
- **Helikopterler:** **T129 ATAK** (dar gövde, kademeli tandem kokpit, burun sensörü, 20 mm top, roket ve füze kanatçıkları) ve **T625 GÖKBEY** (geniş kabin, sürgülü kapı pencereleri, sponsonlu tekerlekler) eklendi.
- Helikopterler yedi helipadde bekliyor: Hava Üssü (2), İHA Merkezi, Deniz Üssü, Kara Üssü, Anadolukent ve Hilalkent. Hilalkent'e yeni düz helipad alanı açıldı.
- Gezintide helikoptere yaklaşıp **E** ile bin. Motorlar birkaç saniyede ısınır.
  - **R/Shift** yüksel, **F/Ctrl** alçal
  - **WASD** ile cyclic ileri-geri ve yana
  - **Q/E** ile pedal
  - **C** ile kokpit veya takip kamerası
  - **G** ile yerdeyken in
- Uçuş modeli: rotor diski eğildikçe hızlanır (T129 ~275, T625 ~255 km/sa). Collective tırmanma hızını belirler, bırakınca havada asılı kalır. Yere yakın alçalış yumuşar ve binaların çatısına inilebilir.
- Sert iniş, suya düşme ve engele çarpma kaza sayılır. Kazada helikopter kendi pistine geri getirilir.
- HUD'da hız, irtifa, dikey hız ve rotor devri gösterilir; alçalma hızı yüksekse uyarı çıkar. Pal sesi rotor devrine göre değişir.
- Helikopterdeyken harita ile her yere (petrol platformu dahil) havadan ışınlanılabilir.
- Gamepad'de heli şeması kullanılır. Dokunmatikte YÜKSEL / ALÇAL / DÖN düğmeleri var; sol çubuk cyclic olarak çalışır.

## V1.54 — 2026-10-11
- **Yeni araçlar:** gezinti aracı baştan modellendi. Çıkarılmış gövde profili, eğimli cam evi, LED far/stop şeritleri, ızgara, ayna, tavan rayı, "TR AY YILDIZ" plakası ve 19" jantlarla modern **Ay Yıldız SUV** (beyaz/kırmızı); yüksek şasili, koruma demirli, stepneli, kamuflajlı **Bozkurtlar 4×4**; tepe lambalı **Beni İzle** aracı.
- **T tuşu (gamepad Y / dokunmatik ARAÇ):** aracı değiştir; seçim hatırlanır.
- **Sürüş:** azami hız ~180 km/sa, **Shift turbo** ile ~230 km/sa. Hıza göre azalan direksiyon, **el freniyle drift** (arka tutunma düşer), yokuşta yavaşlama (4×4 daha az etkilenir).
- Araç dört tekerlek temasına göre arazide eğilir; hızlanma/frende gövde öne-arkaya, virajda yana yatar. Tekerlekler döner, ön tekerlekler yön alır.
- Hıza göre uzaklaşan takip kamerası ve görüş açısı, yüksek hızda hafif sarsıntı; HUD'da vites, TURBO ve DRİFT göstergesi.
- Vitese göre devir yapan motor sesi; drift sırasında lastik sesi.

## V1.53 — 2026-10-11
### Yeni — Harita, ışınlanma ve başlangıç yeri
- **Harita (M tuşu, telefonda HARİTA düğmesi):**
  - Tam ekran ada haritası: arazi renkleri, yollar, pistler, Hilal Köprüsü, Kızıl Bölge sınırı.
  - Senin konumun ve yönün; düşman yer hedefleri (SAM'lar kırmızı), uçaklar ve gemiler.
  - Sürükle-kaydır, tekerlek / iki parmakla yakınlaştır, "◎" ile kendine dön.
  - Yan panelde bütün yerlerin listesi.
  - Tek oyunculu oyunda harita açıkken oyun durur.
- **Işınlanma:** haritada bir yere dokun → **Işınlan**.
  - Uçarken: o yerin üstünde, güvenli yükseklikte ve yere doğru uçarak devam edersin.
  - Yürürken ya da araçtayken: yerde.
  - Çevrimiçi oyunda kapalı.
- **Başlangıç yeri:** haritada **Buradan başla** ya da "Uçuşa hazır" ekranındaki **Başlangıç yeri** listesi.
  - **İHA ve Test Merkezi** ile **Kızıl Bölge hava üssü**: pistten (ya da havadan) başlarsın.
  - Diğer yerler: o yerin üstünde havada başlarsın. "Üssü gez" ile o yerde yürüyerek başlarsın.
  - Seçim hatırlanıyor.
- **Köşe haritası:** Ayarlar → Arayüz → Köşe haritası. Uçarken ve gezerken sağ üstte dönen küçük harita.

## V1.52 — 2026-10-11
### Yeni — Kontrol sistemi
- **Ayarlar → Kontroller** üç sekme oldu: **Klavye / Fare**, **Gamepad**, **Dokunmatik**.
- **Kontrol şemaları:** her araç türünün ayrı şeması var: **Hava aracı**, **Helikopter**, **Kara aracı**, **Deniz aracı**, **Yaya**, **Genel** (duraklat, harita, kamera, ses, fotoğraf). Helikopter ve deniz şemaları ilgili araçlar gelince kullanılacak, şimdiden ayarlanabiliyor.
- **Tuş atama:** bir atamaya tıkla, yeni tuşa ya da kumanda tuşuna bas (çubuk yönü de olur).
  - Eylem başına en çok 3 atama. **Esc** vazgeçer, **Geri sil** kaldırır.
  - Aynı tuşu kullanan eylemler kırmızıyla ve "Çakışma" notuyla gösteriliyor.
  - "Bu şemayı varsayılana döndür" ve "Tüm tuşları sıfırla" düğmeleri var.
- **Gamepad:** ölü bölge, çubuk hassasiyeti, dikey eksenleri ters çevirme, titreşim. Bağlı kumandanın adı gösteriliyor.
  - Gamepad artık **yürürken ve araçtayken** de çalışıyor: yürüme, bakma, zıplama, binme, gaz, fren ve direksiyon.
- **Dokunmatik:** düğme boyutu, saydamlık, çubuk hassasiyeti, **solak düzeni** (çubuk sağda, düğmeler solda).
- **Kontroller penceresi:** tuş listesi artık güncel atamalardan kendiliğinden oluşuyor.
- **Araçta turbo:** Shift.
### Değişti
- **Ses aç/kapat** artık **U** tuşu. V1.51'de N tuşu sıradaki silahla çakışıyordu.
- **M tuşu** harita için ayrıldı. Harita gelene kadar yürürken yerler listesini açıyor.

## V1.51 — 2026-10-11
### Düzeltildi
- **Uzaktan titreşen nesneler:** derinlik hesabı uzak mesafeler için hassaslaştırıldı. Havalimanı zemini, pist çizgileri, yollar, çatılar ve türbinler uzaktan bakınca artık titremiyor.
- **İHA üssüne iniş:** inişe artık yalnızca ana havalimanında izin verilmiyordu, bu düzeltildi. **Genel pist sistemi** geldi: İHA ve test merkezinin pistine (ve Kızıl Bölge'deki düşman pistine) inilebiliyor, orada yerde sürülebiliyor ve tekrar kalkılabiliyor. Pist alanının dışına çıkınca yine "Pist dışına çıktın" sayılıyor.
- **Serbest modda düşmanlar:** serbest uçuşta düşman uçak varsayılan olarak **Yok**.
- **Hava savunma (SAM):** "Uçuşa hazır" ekranına yeni bir **Hava savunma (SAM)** seçeneği geldi, serbest modda varsayılan olarak **Kapalı**. Kapalıyken yerdeki SAM'lar kilitlenmiyor ve füze atmıyor.
- **Uzak bölgelerde hareket:** yürürken ya da araçla haritanın uzak bölgelerinde (İHA adası gibi) hareket edilemiyordu, düzeltildi.
### Yeni
- **Zıplama:** yürürken **Boşluk** tuşu, telefonda **ZIPLA** düğmesi.
### Değişti
- **Ses aç/kapat** artık **N** tuşu. M tuşu harita için ayrıldı.

## V1.50 — 2026-10-11
### Yeni — Simge yapılar (Aşama 4 tamamlandı)
- **Hilal Barajı:** güney dağlarında kemer barajla kapatılmış bir vadi gölü.
- **Kayak merkezi:** doğu dağlarının karlı zirvesi (≈1860 m).
  - Etekte otel ve teleferik istasyonu, zirvede üst istasyon.
  - Direkler üzerinde 2,4 km'lik teleferik ve gidip gelen kabinler, kayak pistleri.
- **Antik kent:** güney adanın kıyısında amfitiyatro, yarı yıkık tapınak sütunları, devrik sütunlar ve sur kalıntıları.
- **Kale:** güneydoğudaki adacıkta mazgallı surlar, dört köşe kulesi ve bayraklı burç.
- **Petrol platformu:** batı denizinde.
  - Sarı ayaklar, modüller, sondaj kulesi, helikopter pisti.
  - Yanan bir alev bacası.
- **Denizde rüzgâr santrali:** adanın batısında, denize oturtulmuş 12 türbin.
- **Yıldıztepe Rasathanesi:** kuzeydoğu zirvesinde (≈900 m) yarıklı gözlem kubbeleri.
- **Hızlı geçiş (M / GİT ▸):** Hilal Barajı, Kayak merkezi, Kayak zirvesi, Antik kent, Kale, Rasathane eklendi.
- Bu sürümle adanın çevre planı (Aşama 4) tamamlandı.

## V1.49 — 2026-10-11
### Yeni — Kızıl Bölge (düşman bölgesi)
- **Konum:** güney adanın batı yarısı düşman toprağı. Sınırda kırmızı-beyaz direkler var.
- **Uyarı:** sınırı geçince "⚠ KIZIL BÖLGE — düşman hava sahasına girdin" uyarısı çıkıyor.
- **Düşman hava üssü:**
  - Pist, taksi yolu, 8 sertleştirilmiş uçak sığınağı.
  - Yakıt tankları, koğuşlar, kule, radar, flamalar.
- **Bölge geneli:** beton sığınaklar ve tank engelleri (ejder dişleri).
- **Oynanış:** görevlerdeki düşman yer hedefleri artık öncelikle Kızıl Bölge'de çıkıyor. SAM'lar, radarlar, depolar, sığınaklar ve konvoylar burada. Oyunun adındaki "Hedef Kızıl Elma" artık haritada bir yer.
### Test
- Yapay zekâ testi, rastgeleliğe bağlı ara sıra yaşanan başarısızlığa karşı sağlamlaştırıldı.

## V1.48 — 2026-10-11
### Yeni — AY YILDIZ İHA ve Test Merkezi (güneydoğu ada)
- **Pist:** 1,8 km'lik İHA pisti; orta hat, eşik çizgileri, 18/36 numaraları, kenar ve eşik ışıkları, emniyet şeritleri. Ada düzleştirildi, piste inilebilir.
- **Apron:** TB2, TB3, Akıncı, Kızılelma ve ANKA sergide.
- **Tesisler:** 4 İHA hangarı, kule, işletme binası ve tabelası.
- **Yer kontrol istasyonları:** dönen uydu çanaklarıyla, telemetri antenleri.
- **Füze test alanı** (adanın güney ucu):
  - Rampada denize doğru yönelmiş test füzesi.
  - Servis kulesi, sığınak, takip çanakları, uyarı tabelası.
- **Gökyüzü:** adanın üzerinde sürekli tur atan bir Akıncı.
- **Hızlı geçiş (M / GİT ▸):** İHA ve test merkezi, Füze test alanı eklendi.
### Düzeltildi
- Harita kenarına yakın düzleştirilmiş alanlar artık tam düz.

## V1.47 — 2026-10-11
### Yeni — Hilal Köprüsü ve Anadolukent
- **Hilal Köprüsü:** üs yarımadasını güney adaya bağlayan asma köprü.
  - Kırmızı kuleler (250 m), ≈1,85 km orta açıklık, denizden ≈62 m yükseklikte 6 şeritli tabliye.
  - Ana kablolar, askı halatları, yaklaşma ayakları, aydınlatma direkleri.
  - Kule tepelerinde yanıp sönen ikaz ışıkları.
  - **Köprünün altından uçabilirsin:** yalnızca tabliyeye ya da kulelere çarpmak kaza sayılıyor.
  - Köprüden araçlar geçiyor; arabayla da geçebilirsin.
- **Anadolukent** (güney adanın kuzey kıyısında, köprünün vardığı yer):
  - Gökdelenli şehir merkezi, ızgara caddeler ve apartman blokları.
  - Stadyum, göletli park, büyük cami.
  - Sahil yürüyüş yolu, park etmiş arabalar, cadde trafiği.
- **Yol:** marina yolundan köprüye uzanan yeni bağlantı yolu.
- **Hızlı geçiş (M / GİT ▸):** Hilal Köprüsü ve Anadolukent eklendi.
### Altyapı
- Yürünebilir yüzeyler eğimli olabiliyor (köprü rampaları). Engellerin alt yüksekliği tanımlanabiliyor (altından geçilebilen yapılar).
- Bina cephe dokuları küçültüldü (daha az bellek).

## V1.46 — 2026-10-11
### Yeni — Atmosfer: gün saati, gece ışıkları, sis, ortam sesleri
- **Gün saati** (Ayarlar → Grafik → Gün saati): **Sabah**, **Öğle**, **Akşam**, **Gece** ya da **Döngü**. Döngüde 20 dakikada bir tam gün geçiyor. Öğle eskisiyle aynı görünüm.
- **Gökyüzü ve ışık:** güneş saate göre hareket ediyor.
  - Sabah ve akşam: altın sarısı ışık ve turuncu gökyüzü, gün batımında renklenen bulutlar.
  - Gece: yıldızlar, ay ve ay ışığı.
  - Su, bulutlar ve sis rengi saate uyuyor.
- **Sabah sisi:** sabahları görüş mesafesi kısalıyor.
- **Gece ışıkları:**
  - Hilalkent, köy ve üslerdeki binaların pencereleri yanıyor.
  - Pist ve yaklaşma ışıkları, sokak lambaları, fenerler ve ikaz ışıkları geceleri asıl etkisini gösteriyor.
  - Deniz fenerinin huzmesi belirginleşiyor.
- **Ortam sesleri:**
  - Kıyıya yakınken dalga sesi, yükseklikle artan rüzgâr.
  - Martı sürülerinin yanında martı sesleri, gece yürürken cırcır böcekleri.

## V1.45 — 2026-10-11
### Yeni — Askeri tesisler
- **Hava savunma mevzileri:** havalimanının dört yanında toprak setli mevziler.
  - Her mevzide ya bir **HİSAR-O** fırlatıcısı (kızak yükselip dönüyor) ya da bir **KORKUT** 35 mm uçaksavar.
  - Dönen radarlı ateş kontrol aracı ve komuta kabini.
- **Mühimmat deposu:** havalimanının batısında, çitle çevrili sekiz toprak örtülü cephanelik, iki gözetleme kulesi, "YASAK BÖLGE" tabelası.
- **Erken ihbar radar istasyonu:** doğu dağlarının zirvesinde (≈1150 m).
  - Üç radar kubbesi, dönen arama radarı, işletme binası.
  - İkaz ışıklı anten direkleri, helikopter pisti, çit.
- Yeni modeller (yer tutucu): HİSAR-O fırlatıcı aracı, KORKUT, radar aracı.
- **Hızlı geçiş (M / GİT ▸):** Hava savunma mevzisi, Mühimmat deposu, Radar istasyonu eklendi.

## V1.44 — 2026-10-11
### Yeni — Kırsal alan
- **Rüzgâr santrali:** marinanın doğusundaki tepelerde dönen 11 rüzgâr türbini. Uçaklar çarpabilir.
- **Güneş enerjisi santrali (GES):** köy ile kara üssü yolu arasında, çitle çevrili 240 panel dizisi, invertör kabinleri ve tabela.
- **Köy seraları:** köyün güneybatısında 10 plastik sera.
- **Zeytinlik:** köyün batısındaki yamaçta sıra sıra zeytin ağaçları.
- **Gölet:** gölün yanında iskele, kayık ve banklar.
- **Köye canlılık:**
  - Caminin yanında çınar altında çay bahçesi.
  - Bayraklı köy ilkokulu ve futbol sahası.
  - Tarlayı süren kırmızı traktör, otlayan koyun sürüsü.
  - Evlerin bacalarından tüten duman.
- **Hızlı geçiş (M / GİT ▸):** Gölet ve Köy · çay bahçesi eklendi.

## V1.43 — 2026-10-11
### Yeni — Hilal Marina, deniz trafiği, kumsal ve martılar
- **Hilal Marina** (üs yarımadasının doğu kıyısı):
  - Rıhtım, babalar ve usturmaçalar; dört yüzer iskele ve parmak iskeleler.
  - Bağlı balıkçı tekneleri ve yelkenliler.
  - Dalgakıran, kırmızı/yeşil fenerler.
- **Kara tarafı:** liman başkanlığı ("HİLAL MARİNA"), şemsiyeli "BALIK EVİ" lokantası, deniz otobüsü iskelesi ve bekleme salonu, tekne bakım hangarı ve kızakta bir tekne, otopark.
- **Yol:** nizamiyeden çitin dışından marinaya inen yeni yol, trafikte de var.
- **Deniz otobüsü** "HİLAL-1": marina ile Hilalkent'teki yeni iskele arasında, adanın güneyinden ve batı koyundan dolaşarak sefer yapıyor. Her iskelede bekliyor.
- **Açık deniz:** adanın çevresinde dolaşan iki konteyner gemisi ve bir tanker, kıyıya yakın balıkçı tekneleri ve yelkenliler. Hepsinin arkasında dümen suyu var.
- **Kumsal** (fenerle marina arasında): şemsiyeler, şezlonglar, havlular, cankurtaran kulesi, büfe, plaj voleybolu filesi.
- **Martılar:** marina, deniz üssü, Hilalkent kıyısı, kumsal ve fenerin üzerinde kanat çırparak dönen martı sürüleri.
- **Hızlı geçiş (M / GİT ▸):** Hilal Marina ve Kumsal eklendi.
### Altyapı
- Arazi düzleştirme alanları ve yürünebilir yüzeyler artık döndürülmüş olabiliyor (`fr`); marina kıyıya paralel kuruldu.
- Kayalar hiçbir üs alanının üzerine düşmüyor.

## V1.42 — 2026-10-11
### Yeni — Hilalkent kasabası, yol ağı ve trafik
- **Hilalkent:** adanın kuzeybatı kıyısında, deniz üssünün karşısında.
  - Dört cadde, sokaklar ve kaldırımlar; renkli 4–7 katlı apartmanlar, alt katlarda tenteli dükkânlar.
  - Saat kulesi ve havuzlu meydan; iki minareli büyük cami.
  - Ortaokul ve sahası, park, sahil yürüyüş yolu ve banklar, akaryakıt istasyonu, giriş tabelası.
  - Yol kenarına park etmiş arabalar.
- **Yol ağı:** kara üssü yolundan ayrılıp tepelerin üzerinden Hilalkent'e uzanan yeni yol. Kenarlarında ağaçlar var.
- **Trafik:** köy, deniz üssü, kara üssü ve Hilalkent yollarında ve kasaba caddelerinde gidip gelen arabalar.
- **Hızlı geçiş (M / GİT ▸):** Hilalkent ve Hilalkent meydanı eklendi.

## V1.41 — 2026-10-11
### Yeni — Bozkurtlar kara üssü
Adanın kuzeyindeki düzlükte, koya bakan geniş bir kışla. Köyden kuzeye uzanan yeni yolla bağlı.
- **Giriş:** "AY YILDIZ KARA ÜSSÜ" nizamiyesi, köşelerde gözetleme kuleleri, çit.
- **Komutanlık:** "BOZKURTLAR KOMUTANLIĞI" binası, tören alanı, şeref tribünü, bayrak direği.
- **Yaşam alanı:** 6 koğuş, yemekhane, revir, futbol sahası, su kulesi.
- **Motorlu birlik:** 5 sundurma altında sıra sıra araçlar:
  - **Altay** tankları,
  - **T-155 Fırtına** obüsleri,
  - **Pars 8×8** zırhlı araçları,
  - mayına dayanıklı **4×4 araçlar** ve askerî kamyonlar.
- **Destek:** bakım atölyesi, akaryakıt istasyonu, toprak örtülü cephanelikler, helikopter pisti.
- **Sürüş parkuru:** rampalı toprak pistte sürekli tur atan bir Altay.
- **Atış poligonu (doğu):**
  - atış hattı sundurması ve kulvarlar,
  - 300/600/900 m hedefler ve hedef tümseği,
  - hurda tank hedefleri, kırmızı bayraklı kule.
- **Hızlı geçiş (M / GİT ▸):** Kara Üssü, Motorlu birlik, Atış poligonu eklendi.
### Değişti
- Düşman yer hedefleri artık üslerin içinde ya da yakınında çıkmıyor.
- Ada ağaçları yeni yolların üzerinden kaldırıldı.

## V1.40 — 2026-10-11
### Yeni — Deniz üssü (Mavi Kanatlar)
Köyün batısındaki korunaklı koyda, köyden yolla bağlı.
- **Liman:** rıhtım, kazıklar üzerinde 3 iskele, TCG Anadolu'nun yanaştığı mendirek, kaya dolgu dalgakıran, kırmızı/yeşil giriş fenerleri. Babalar, usturmaçalar, aydınlatma direkleri.
- **Gemiler** (yer tutucu modeller, Mavi Kanatlar aşamasında detaylanacak):
  - **TCG Anadolu (L-400):** kayakla atlama rampası, ada, uçuş güvertesi işaretleri, güvertede 3 TB3.
  - İstif sınıfı fırkateyn **F-515**, Ada sınıfı korvetler **F-511, F-512, F-513**.
  - Tuzla sınıfı karakol botları; koyda devriye gezen **P-1203** (dümen suyu iziyle).
  - Römorkör, denizaltı barınağında Reis sınıfı denizaltı.
- **Tersane:** yüzer havuz (içinde bakımda F-514 korveti), 3 liman vinci (yavaşça dönüyor), atölye, ambarlar, konteynerler.
- **Kara tarafı:**
  - Deniz Üssü Komutanlığı binası, bayrak ve çapa anıtı.
  - Koğuşlar, yemekhane, revir.
  - Yakıt tankları, helikopter pisti, dönen radarlı haberleşme kulesi, su kulesi.
  - Çit ve "AY YILDIZ DENİZ ÜSSÜ" nizamiyesi.
- **Gezme:** arabayla ya da yürüyerek rıhtım, iskele ve mendirek üzerinde dolaşılabiliyor.
  - Yeni **M** tuşu, dokunmatikte **GİT ▸** düğmesi: hangar, nizamiye, köy, deniz üssü ve rıhtım arasında hızlı geçiş.
- Kara grubunun adı **Bozkurtlar** oldu.
### Altyapı
- Arazide düzleştirilmiş üs alanları (`PADS`) ve yürünebilir yüzeyler (`DECKS`, `groundH`). Kara üssü ve diğer tesisler de bunu kullanacak.
- Gemi modelleme araçları (`15-model-ships.js`): gövde loft'u, gizli üst yapı blokları, gövde numarası dokusu.
- Binalara çarpma artık havalimanı dışında da geçerli.

## V1.39 — 2026-10-11
### Yeni — Aşama 4: üs çevresi
- **Çevre çiti:** üssü saran tel örgü çit (direkler, tel, üst dikenli tel). Çimler çit sınırına kadar biçilmiş.
- **Nizamiye:** kuzey girişte nöbetçi kulübesi, saçak, iki yönde "AY YILDIZ HAVA ÜSSÜ" tabelası, bariyerler, bayraklar, kasis.
- **Köy:** nizamiyeden çıkan yolun ucunda ~34 ev, cami (kubbe, minare, hilal), dükkânlar ve sokaklar.
- **Arazi:** arazinin şeklini izleyen tarlalar, üssü çevreleyen ~2600 ağaçlık orman kuşağı, yol kenarı ağaç sıraları, kayalar.
- **Kıyı:** hareket eden köpük şeridi; güney burnunda dönen ışıklı **deniz feneri**.
- **Havacılık ekipmanı:** ILS süzülüş vericisi direkleri, meteoroloji istasyonu.
- **Araba:** nizamiyeden çıkıp köye kadar gidebilirsin. Çit ve binalar artık katı.
### Düzeltildi
- Masaüstünde (yüksek grafik/efekt) havadan bakınca karada ve denizde görülen yatay çizgiler giderildi. Efekt katmanı 16 bit derinlik kullanıyordu, artık 24 bit.

## V1.38 — 2026-10-10
### Değişti — KAAN, fotoğraflara göre düzeltildi
Ölçüler fotoğraflardan alındı (üstten görünüş 14 m açıklığa, yandan görünüş 21 m boya ölçeklendi).
- **Gövde:** kokpitin hemen arkasında ±2 m genişliğe açılan "omuzlar". Kokpit kesiti elmas biçimli (düz eğimli yanlar). Chine çizgisi burundan kanada doğru yükseliyor. Gövde daha derin, arka gövde motorlara doğru incelip yükseliyor.
- **Hava alıkları:** daha büyük (≈1,3 m), omuzların altında, dış kenarı eğik; önden bakınca omuz ile burun arasındaki girinti belli.
- **Kanat:** daha yukarıda (chine hizasında), hafif anhedral. Kökü geride başlıyor, firar kenarı geriye açılı. İç flap sabit, dış flaperon hareketli.
- **Kuyruk:** dikey kuyruklar daha büyük ve daha önde (27° dışa yatık, tam boy dümen). Yatay kuyruklar kanadın hemen arkasında, lülelerin ötesine uzanıyor.
- **Motorlar:** lüleler birbirinden daha uzak (±1 m), arada merkez çıkıntı.
- **Kokpit:** kanopi öne alındı (−7,4 → −4,9 m), daha uzun ve yüksek; altın renkli arka çerçeve; burun önünde turuncu EOTS camı.
- **Boya:** üst yüzey mavi-gri; kokpit arkasında yay şeklinde başlayıp arkaya doğru seyrelen **açık renk** kesik çizgiler. Chine altı koyu gri, burun konisi açık gri. Yanlarda büyük siyah **KAAN** yazısı. Dikey kuyrukta bayrak ve "Türk Havacılık Uzay Sanayii" yazısı. Burunda test sondası.
- **İniş takımı:** burun takımı alıkların arkasına (−4,85 m), ana takımlar alıkların altına alındı.
- Kokpit kamerası ve top ağzı yeni yerlere taşındı.

## V1.37 — 2026-10-10
### Yeni — KAAN detaylı model (1/22 model yenileme)
- **Gövde:** keskin "chine" kenarlı gizli burun, yan kenarı kanat köküne kesintisiz birleşen gövde, motor çıkıntıları, burun konisi.
- **Hava alıkları:** yanlarda trapez kesitli, ağzı eğik kesilmiş, içi koyu kanallar.
- **Kanat:** gerçek profil kalınlığı, firar kenarı ileri açılı trapez kanat, hücum kenarında koyu radar emici şerit, sabit iç flap.
- **Hareketli yüzeyler:** flaperonlar (yatış), tam hareketli yatay kuyruklar (yunuslama) ve dikey kuyruklarda dümenler (sapma) uçuşta kumandayla oynuyor. Kokpit görünümünden de görülebilir.
- **Dikey kuyruk ve motor:** dışa yatık ikiz dikey kuyruk, bayrak, uç ışığı. Testereli lüleler, içte koyu kanal ve türbin.
- **Kokpit:** daha büyük, hafif altın renkli tek parça kanopi, pilot (kask ve vizör), koltuk, gösterge siperi, burun önünde EOTS camı.
- **Boya:** prototipteki koyu "kesik çizgi" deseni ile panel çizgileri, flap/flaperon menteşe çizgileri, KAAN yazısı. Altta silah yuvası, iniş takımı kapağı çizgileri.
- **İniş takımı:** amortisör, krom piston, makas bağlantısı, jant; kapaklar ve burun takımı lambası.
- Boyutlar resmî değerlere göre: 21 m boy, 14 m açıklık, ~6 m yükseklik.
- **Model Kütüphanesi:** Test sekmesinde **Eski modelle karşılaştır** ile eski ve yeni model arasında geçiş yapılıyor.
### Altyapı
- Ortak modelleme araçları (`09-model-kit.js`): profil kanat, chine'lı gövde, menteşeli kumanda yüzeyi, iniş takımı ayağı, üstten boya dokusu. Sonraki modeller de bununla yapılacak.

## V1.36 — 2026-10-10
### Yeni — Model Kütüphanesi
- Ana menüde yeni **Model Kütüphanesi** var (ayrıca Ayarlar → Grafik → Model kütüphanesi). Bütün modeller listede: 10 uçak, 7 yer aracı, 5 ekipman. Mavi Kanatlar ve kara sistemleri için yer hazır.
- **3B önizleme:** model kendi stüdyosunda döner. Parmakla ya da fareyle çevirip yakınlaştırırsın. Arka planlar: Hangar, Gündüz, Gün batımı, Stüdyo. **Kılavuz** açılınca ızgara, burun yönü oku ve sınır kutusu görünür.
- **Bilgi:** boyutlar, üçgen/parça/malzeme sayısı, kaynak. **.glb olarak indir** ile her model, Blender vb. programlarda açılabilecek şekilde indirilir.
- **Test:** iniş takımı, motor/art yakıcı, silahlar, pervane, seyir ışıkları, kumanda yüzeyleri, tel kafes.
- **Görünüm:** ana renk (hazır renkler ya da özel renk), kamuflaj (lekeli / dijital / çizgili, ikinci renk, desen boyu), mat ↔ parlak. Değişiklik oyunda o uçağın bütün kopyalarına (sen, hangar, yapay zekâ) hemen uygulanır.
- **Model içe aktarma:** .glb, .gltf, .fbx, .obj (+.mtl), .stl, .dae, dokularıyla birlikte. Gelen dosya otomatik .glb'ye çevrilir.
  - Yön, uzunluk ve yükseklik ayarlanabilir.
  - Adlandırılmış parçalara görev verilir: iniş takımı, pervane, kanatçık, irtifa ve istikamet dümeni.
  - **models.json satırını kopyala** ile kalıcı ekleme satırı hazırlanır.
- Boya ve içe aktarılan modeller bu cihazda saklanır, sayfa yenilense de kalır. .glb dosyasını sayfaya sürüklemek kütüphaneyi açar.
### Değişti
- Ayarlar'daki "3B model dene" satırı kütüphaneye taşındı.
- İçe aktarılan modellerde kodun seyir ışıkları gizlenir (`keepLights` ile korunur).

## V1.35 — 2026-10-10
Büyümeye hazır altyapı.
### Yeni
- **Görsel efektler** (Ayarlar → Grafik → Görsel efektler: Kapalı / Düşük / Yüksek). Bilgisayarda varsayılan Yüksek, telefonda Kapalı.
  - Düşük: sinematik renk düzeltme, hafif vinyet, yüksek hızda ekran kenarlarında hız bulanıklığı, kenar yumuşatma (MSAA veya FXAA).
  - Yüksek: + ışık parlaması (bloom). Yalnızca motor alevi, pist ışıkları, lambalar, izli mermiler ve güneş parlıyor; beyaz boya ve bulutlar parlamıyor.
  - Efekt kitaplıkları yüklenemezse oyun efektsiz devam eder.
- **3B model (GLB/glTF) altyapısı:** `assets/models.json` bir araç için .glb listelerse model arka planda yüklenir ve oyuncu, hangar ve yapay zekâ kopyalarının hepsini giydirir. Model, aracın gerçek boyuna otomatik ölçeklenir ve yerleştirilir. Draco sıkıştırma, iniş takımı/pervane/kumanda yüzeyi parçaları desteklenir. Model yoksa kodla çizilen model kullanılır.
- **3B model dene:** Ayarlar → Grafik'te ya da .glb dosyasını sayfaya sürükleyerek seçili uçağa model giydirip bakabilirsin. models.json için gereken satırı da gösterir.
### Altyapı
- Kaynak kod `src/` altında 35 modüle bölündü (`src/js`, `src/css`, `src/html`). `index.html` artık `tools/build.py` ile üretiliyor; oyun yine tek dosya olarak çalışıyor.
- three.js ve eklentileri ile Draco çözücü `vendor/` altında. İnternet yoksa ya da CDN erişilemezse yerel kopya kullanılıyor (Android uygulaması için de gerekli). Çevrimdışı önbellek kitaplıkları da saklıyor.
- CI: yayından önce `index.html`'in `src/` ile uyumlu olduğu kontrol ediliyor.
- Belgeler: `docs/MIMARI.md` (modüller, durum makinesi, yeni araç ekleme, efektler, Android planı) ve `docs/MODELLER.md` (model hazırlama, models.json alanları, Blender ayarları, lisans).

## V1.34 — 2026-10-10
### Yeni — Üssü gez (yaya ve araç)
- **Birinci şahıs yürüyüş:** başlangıç penceresinde yeni **Üssü gez** seçeneği var. Ayrıca uçuşta duraklatma menüsünde **Yürüyerek gez** düğmesi var. Seçtiğin uçağın yanında, hangarın içinde başlarsın.
  - Bilgisayarda: WASD ile yürü, fareyle bak (ekrana tıklayınca imleç kilitlenir), Shift ile koş.
  - Telefonda: sol çubukla yürü, ekranı sürükleyerek bak, KOŞ düğmesiyle koş.
  - Duvarlar, binalar, tezgâhlar, araçlar ve uçak gövdeleri seni durdurur; kanatların altından geçebilirsin.
- **Uçağa bin:** hangardaki herhangi bir uçağa yaklaşıp **E** tuşuna (telefonda UÇAĞA BİN) basınca o uçakla hangardan taksiye başlarsın.
- **Araç:** hangarın içinde sarı "BENİ İZLE" aracı park halinde duruyor.
  - Yaklaşıp **E** (telefonda BİN) ile binersin; W/S gaz-fren, A/D direksiyon, Space el freni.
  - **C** ile arkadan ya da sürücü koltuğundan bakabilirsin; fareyle veya sürükleyerek kamerayı çevirebilirsin.
  - Araç binalara ve duvarlara çarpınca durur. Hızı km/sa olarak ekranda görünür.
  - Araç bıraktığın yerde kalır.
- Kontroller ekranına "Üssü gez" bölümü eklendi.

## V1.33 — 2026-10-10
### Düzeltme
- **Hangar köşesinde görünmez duvar:** hangardan çıkıp taksi yolunun virajını dönerken uçak hangarın doğu duvarına takılıyordu. Duvar 10 m içeri alındı. Çarpışma artık uçağın gerçek şekline (burun, kuyruk, kanat uçları) göre hesaplanıyor; eskiden çapraz giderken uçağın çevresine büyük bir kutu çiziliyordu.
- **Bakım hangarına girerken ışınlanma:** kalkış izni alınmadan bakım hangarına gitmeye çalışınca uçak hangar köşesine ışınlanıyordu. Eski "hangar arkasına geçme" sınırı kaldırıldı; artık duvarlar fiziksel olarak durduruyor.
- **Hangar içi aydınlatma:** lambaların altındaki ışık öbekleri kaldırıldı. İç mekân tavandan gelen düzgün, homojen bir ışıkla aydınlanıyor. Güneş artık hangar içindeki zemine, duvarlara ve ekipmana düşmüyor. Uçakların altında yumuşak gölge var.
- **Eksik tabela yazıları:** uzun yazılar artık tabelaya sığacak şekilde otomatik küçülüyor ("FOD KONTROLÜ · YERDE YABANCI MADDE BIRAKMA" vb.).
### Test
- Yeni test: her uçak hangardan elle çıkıp taksi yolunu izleyerek bakım hangarına ışınlanmadan ulaşıyor.

## V1.32 — 2026-10-10
Aşama 3: hangar içleri.
### Yeni
- **Bekleme hangarı artık kapalı bir yapı:** uçaklar açık apronda değil, büyük hangarın içinde duruyor. Ön cephe açık; üstünde "HANGAR 1 · HİLAL KANATLAR" yazısı var.
- Hangarın içinde:
  - çelik tavan makasları ve tavan lambaları, lambaların altında zeminde ışık halkaları;
  - parlak epoksi zemin, kapı eşiğinde sarı-siyah tehlike şeridi, kırmızı yaya yolu çizgileri;
  - arka duvarda büyük Türk bayrağı, "HİLAL KANATLAR" ve "HEDEF KIZIL ELMA" pankartları; yan duvarlarda üst pencere bandı;
  - her uçağın arkasında iş tezgâhı, takım dolabı, raf ya da varil, yangın söndürücü;
  - silah taşıyan uçakların arkasında bomba veya füze arabası; yer güç ünitesi, çekici, bakım merdivenleri, trafik konileri;
  - "FOD KONTROLÜ" ve "SİGARA İÇMEK YASAKTIR" uyarı levhaları.
- **Bakım hangarının içi donatıldı:**
  - tavan makasları ve lambalar, epoksi zemin, bayrak;
  - "BAKIM · ONARIM · SİLAH YÜKLEME" yazısı ve silah yükleme alanı uyarısı;
  - silah arabaları, bakım merdivenleri, tezgâh, dolap, raf, varil, söndürücü.
### Değişti
- Menüde kamera hangarın dışına ya da çatının üstüne çıkınca o duvar ve çatı otomatik gizleniyor, uçak her açıdan görünüyor.
- Hangar duvarları katı: yerde uçak duvarda durur, havadan hangara girmek uçuşu bitirir.
- Otomatik taksi önce hangar kapısından düz çıkıyor, sonra taksi yoluna dönüyor (kanat duvara takılmıyor).

## V1.31 — 2026-10-10
Aşama 2: havalimanı.
### Yeni
- **Pist:** asfalt doku, kenar omuzları, iki uçta sarı oklu emniyet alanı; kenar ve orta çizgi, eşik şeritleri (piyano tuşları), 36/18 numaraları, konma bölgesi ve nişan noktası işaretleri, konma bölgesinde lastik izleri.
- **Işıklar:** pist kenar ışıkları, yeşil eşik ışıkları, iki uçta 360 m yaklaşma ışık dizisi ve piste doğru koşan flaş ("tavşan"). Işıklar uzaktan da görünür.
- **PAPI:** iki pist ucunda 4'lü süzülüş göstergesi; doğru açıda 2 kırmızı 2 beyaz, yüksekte hepsi beyaz, alçakta hepsi kırmızı.
- **Binalar:** yeni kontrol kulesi (cam kabin, anten, engel ışığı), Hilal Kanatlar harekât merkezi, 3 korunaklı uçak sığınağı, itfaiye binası, radar sahası (dönen anten + radom), akaryakıt tankları, apron aydınlatma direkleri, dalgalanan Türk bayrağı, rüzgâr tulumları.
- **Yollar ve araçlar:** apron, apron–pist ve apron–taksi yolu bağlantıları (bekleme çizgileriyle), çevre yolu; itfaiye araçları, yakıt tankerleri, çekici, güç ünitesi, otobüs; çevre yolunda dolaşan "BENİ İZLE" aracı, kamyonet ve tanker.
- **Tabelalar:** pist kenarında kalan mesafe levhaları (bin fit), "AY YILDIZ HAVA ÜSSÜ", "İTFAİYE", "AKARYAKIT".
- **Çarpışma:** binalar artık katı. Havada çarparsan uçuş biter ("Binaya çarptın"), yerde taksi yaparken uçak durur.
### Teknik
- Sabit binalar malzemeye göre tek parçada birleştiriliyor (telefonda az çizim çağrısı).

## V1.30 — 2026-10-10
Aşama 1: ışık ve atmosfer.
### Yeni
- **Güneş gölgeleri:** uçaklar, hangarlar ve binalar gölge düşürür; gölge kamera ile birlikte uçağı takip eder. Ayarlar → Grafik → **Gölgeler** (bilgisayarda varsayılan açık, telefonda kapalı; Yüksek kalitede daha keskin).
- **Gerçekçi uçak malzemeleri:** boya ve metal yüzeyler ışığa göre parlıyor, gökyüzünü ve yeri yansıtıyor; kanopiler cam gibi.
- **Gökyüzü ve atmosfer:** ufukta parlak pus bandı, güneşin etrafında sıcak hâle, ufuk rengine uyumlu mesafe sisi.
### Not
- Sinematik renk tonu (ACES) denendi; stilize renkleri soldurduğu için kapalı bırakıldı.

## V1.24 — 2026-10-10
### Değişti — ekranlar yeni tasarım dilinde
- **Uçak seçimi:** solda üretici · sınıf, büyük ad ve özellik sütunları (uzunluk, açıklık, silah yeri, flare, mürettebat); sağda ▶ Oyuna başla; altta üstten görünüş siluetli uçak kartları; sınıf filtresi sol üstte; durum çubuğunda sıra (1 / 10).
- **Çok oyunculu:** tam ekran, iki panel. Oda kur / Odaya katıl yan yana; lobide büyük oda kodu, **Kodu kopyala** ve **Bağlantıyı kopyala** (?oda= bağlantısı), oyuncu listesinde boş yerler ("yapay zekâ dolduracak").
- **Ayarlar:** sekmeli düzen (Grafik / Kontroller / Ses / Oynanış / Arayüz), her satırda açıklama, aç-kapa anahtarları.

## V1.23 — 2026-10-10
### Düzeltme
- Ana menüde kamera açısı değişirken artık sadece arka plandaki 3B görüntü kısa süre kararıyor; menü (yazılar, düğmeler, kartlar) hiç kararmıyor.

## V1.22 — 2026-10-10
### Değişti
- Uçak seçiminden **Silah yükü** düğmesi kaldırıldı. Silah yükü artık uçuş öncesi bir adım: uçağı seç → **Oyuna başla** → silah yükü (← Geri / Devam →) → başlangıç penceresi. Silah taşımayan uçaklarda (ANKA) bu adım atlanır. Görevler ekranındaki **Göreve başla** da aynı sırayı izler.
- Komuta menüsünde "Silah yükü" yerine **Ayarlar**; Sinematik menüde Hangar kartı "Uçağını seç".
- Ana menü arka planı: uçak artık **6 farklı kamera açısından** gösteriliyor (yan takip, önden 3/4, tepeden, yanından geçiş, alttan, arkadan), açılar kısa bir kararmayla değişiyor.

## V1.21 — 2026-10-10
### Yeni — ana menü
- İki ana menü tasarımı: **Komuta** (solda numaralı liste, büyük UÇ kartı) ve **Sinematik** (ortada başlık, altta dört büyük kart).
- Varsayılan cihaza göre: telefonda Sinematik, bilgisayarda Komuta. **Ayarlar → Arayüz** ile değiştirilebilir (Otomatik / Komuta / Sinematik).
- Ana menünün arka planında seçili uçak (yüklü silahlarıyla) adanın üzerinde uçuyor; kamera tasarıma göre konumlanıyor.
- **UÇ**: son seçilen uçak, görev ve başlangıç noktasıyla tek dokunuşla kalkış.
- Yeni **Görevler** ekranı: numaralı görev listesi, rekorlar, görev detayı ve **Göreve başla**.
- Durum çubuğu (uçak, silah yükü, internet durumu, sürüm); Ayarlar / Kontroller / Rekorlar simgeleri.
- Klavye (yön tuşları + Enter) ve kumanda (yön tuşları + A/B) ile menü gezinme.

## V1.20 — 2026-10-10
Aşama 0: yeni isim, büyüyebilir araç sistemi, telefon performansı, Android hazırlığı.
### Yeni
- Oyunun yeni adı **Ay Yıldız: Hedef Kızıl Elma**; ay-yıldız logosu, yeni başlık ekranı.
- Sistem grupları: **Hilal Kanatlar** (hava), **Mavi Kanatlar** (deniz, yakında), **Kara sistemleri** (yakında). Uçak seçiminde grup sekmeleri.
- Sınıf filtresi: Tümü / Savaş uçağı / İHA-SİHA / Eğitim-hafif taarruz; araç kartlarında üretici (TUSAŞ, Baykar).
- Araç kayıt sistemi (grup, sınıf, üretici, silah uyumu): yeni araç eklemek tek satır.
- Telefon performansı: **Otomatik performans** (FPS 38'in altına düşerse çözünürlük kademeli düşer, düzelince geri çıkar) ve **FPS göstergesi** (Ayarlar).
- Android/PWA hazırlığı: `manifest.webmanifest`, uygulama simgeleri, çevrimdışı önbellek (`sw.js`, sadece GitHub Pages'te). Telefonda "Ana ekrana ekle" ile tam ekran uygulama gibi açılır.

## V1.11 — 2026-10-10
### Düzeltme — bakım hangarı (özellikle telefonda)
- Hangara girince uçak **otomatik duruyor**: gaz kesilir, arka duvara varmadan frenlenir ve hangarın ortasına hizalanır; durunca bakım ekranı açılır. Hızlı girsen de duvara çarpmaz.
- Bakım bitince (veya vazgeçince) uçak **hangar kapısına dönük** konuma getirilir; gazı açıp düz çıkabilirsin.
- Test: 10 uçak × 3 giriş hızı (10/25/40 m/s) — duruş, yön ve hangardan çıkış.

## V1.10 — 2026-10-10
Büyük güncelleme: yapay zekâ uçakları ve çevrimiçi oyun.
### Yeni — yapay zekâ
- **Düşman savaş uçakları (Kırmızı Kuvvet):** takip eder, öncelemeli top atışı yapar, kilitlenip füze atar, kafa kafaya geçişte kaçar, gelen füzeye karşı manevra + flare kullanır; araziden ve sınırlardan kaçınır, üs hava savunma bölgesine girmez (girerse düşürülür).
- **Kanat adamı (Kılıç 2):** havalanınca sol arkanda kol düzenine girer, yakındaki düşmana saldırır, yer görevlerinde hedeflere füze atar; düşerse 20 sn sonra geri gelir.
- Yeni görev **İt dalaşı:** 3 dalga düşman uçağı (2–3–4).
- Başlangıç penceresinde **Düşman uçak (Yok/2/4)**, **Kanat adamı**, **Zorluk (Kolay/Orta/Zor)** seçimi.
- HUD: düşman (kırmızı üçgen) / dost (mavi daire) işaretleri, isim, mesafe, can çubuğu; radarda uçaklar; füzeyle düşman uçağına kilitlenme.
### Yeni — çevrimiçi (P2P, sunucusuz)
- Ana menüde **Çok oyunculu**: oda kur → 5 harfli kod → arkadaşlar kodla katılır. En fazla 4 oyuncu.
- Modlar: **İşbirliği** (birlikte 5 dalga kırmızı kuvvete karşı), **Takım savaşı** (2’ye 2, 10 düşüren kazanır), **Herkes herkese** (8 düşüren kazanır). Süre sınırı 10–15 dk.
- Boş yerler yapay zekâ botlarıyla dolar. Lobide uçak ve takım seçimi; skor tablosu HUD’da.
- Teknik: WebRTC veri kanalı (PeerJS, oda kuran oyuncu ev sahibi ve hakem). Bağlantı için internet gerekir (LAN’da da çalışır ama eşleştirme internetten yapılır). Sürümü farklı olan oyuncu odaya alınmaz.
### Düzeltme
- Makineli top mermileri çok geniş dağılıyordu (±60°); artık ±0,4° — top atışı isabetli.
### Test
- Yeni testler: yapay zekâ (it dalaşı, kanat adamı, füze/flare), çevrimiçi (3 oyunculu sahte ağ: lobi, eşitleme, isabet yönlendirme, skor, ayrılma, dalgalar).

## V1.02 — 2026-10-10
### Değişti — menü akışı (sadeleştirildi)
- Ana menü → **Uçak seçimi**: seçilen uçak ortada; yanlarda ‹ › okları, altta **Silah yükü** ve **Oyuna başla**.
- **Silah yükü**: sağda panel açılır, uçak solda dönerken bombalar/füzeler seçilir; takılan silahlar artık uçağın üzerinde gerçekten görünür.
- **Oyuna başla**: açılan pencerede oyun modu + başlangıç noktası (Hangardan / Pistten / Havada); karta dokununca oyun başlar.
- Duraklat / görev sonu "Hangara dön" yine uçak seçimine götürür.
### Değişti — dokunmatik kontroller (telefon yatay)
- Ayrı SİLAH ve silah değiştir tuşları kaldırıldı. Alt ortadaki silah kutucuklarına dokunarak seçim yapılır; ilk kutu **TOP** (makineli).
- Tek **ATEŞ** tuşu: TOP seçiliyken basılı tutunca ateş eder, bomba/füze seçiliyken her dokunuşta bir tane atar. Tuşta seçili silah ve kalan sayı yazar.
- Sağ tarafta: **ATEŞ**, altında **◀ ▶** dümen, üstünde **FLARE**; en sağda gaz çubuğu.
- **Art yakıcı** tuşu kaldırıldı: gaz çubuğunun en üstündeki turuncu bölgeye çekince açılır.
- KAMERA, TAKIM (havada) / FREN (yerde) üst sıradaki küçük tuşlarda; OTO TAKSİ ve PİSTE GEÇ ekranın üst ortasında.
- Silah kutucukları çubuk ile sağ tuşlar arasına sığacak şekilde otomatik küçülür; tuşlar birbirine binmez.

## V1.01 — 2026-10-10
### Değişti — menü akışı
- Ana menü → **Başla** → **Uçak seçimi** (yalnızca uçak listesi ve özellikleri: boyut, pilotlu/insansız, art yakıcı, silah yeri, flare).
- **Bu uçağı seç →** → **Oyun ayarları** ekranı: seçilen uçak arka planda dönerken oyun modu, başlangıç noktası (hangar / pist / hava) ve silah yükü seçilir; **Oyuna başla** ile uçuş başlar.
- Silah yükü artık ayrı pencerede değil, ayarlar ekranında; seçimler ve başlangıç noktası tarayıcıda saklanır, silahlar dönen uçağın üzerinde görünür.
- Duraklat menüsü ve görev sonu "Oyun ayarlarına dön" ile ayarlar ekranına döner (aynı uçakla tekrar oynamak için).
- Klavye: uçak seçiminde ← → / Enter; ayarlarda ← → mod, ↑ ↓ başlangıç, Enter başla, Esc geri. Kumanda: A ileri, B geri, LB/RB mod, X/Y başlangıç.

## V1.00 — 2026-10-10
İlk numaralı sürüm (öncesi numarasız geliştirme; özellikler aşağıda).
### Yeni
- Sürüm numarası: menüde ve Ayarlar'da gösterilir, `VERSION` / `version.json` dosyaları.
- Ana menüden **Silah yükü** ekranı (bomba/füze seçimi, tarayıcıda saklanır).
- Hedef kilidi aç/kapa: `K` tuşu ve Ayarlar.
- Pist çevresinde 4 hava savunma bataryası: üs güvenli bölgesinde (4,5 km) düşman füzelerini düşürür.
### Düzeltme
- Silah tuşları 1–5 artık HUD panelindeki sıraya uyuyor (yalnızca stoktaki silahlar numaralanır).
- Kilitlenme uyarı panosu küçültüldü.
- İniş sırasında SAM füzelerinin sürekli takip edip vurması engellendi; SAM menzili 4800 → 4200 m.
- **Bakım hangarına giriş hatası:** hangar bekleme alanının z sınırı bakım hangarı yolunu kesiyordu (duvara itme/takılma). Sınır sadece taksi sırasında geçerli; duvar çarpışması uçak boyutuna göre kayarak çözülüyor; hangar genişletildi.
### Önceki özellikler (numarasız dönem)
- 10 uçak, hangar seçimi, taksi/otomatik taksi, kalkış kontrol listesi, kontrol şemaları (klavye/fare/gamepad/dokunmatik), görevler, rekorlar, ayarlar, fotoğraf modu, yer hedefleri, bomba yardımı, SAM/flare/hasar, bakım hangarı, HUD yenilemesi.
