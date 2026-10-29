# Özellik envanteri

Üretildi: `python3 tools/ozellikler.py` (kaynak: aynı dosyadaki liste). Oyundaki **Rehber** ekranı da bu listeden üretilir.

**Durum:** ✅ iyi · 🔧 iyileştirilmeli · 🔀 birleştirilmeli · 🗑 kaldırılmalı · 🧪 denenmeli (gerçek cihazda doğrulanmalı)

**Özet:** 62 özellik · ✅ iyi 56 · 🔧 iyileştirilmeli 3 · 🧪 denenmeli 3 · testi olmayan: 0

## Karar listesi

Aşağıdakiler senin kararını bekliyor. "iyi" durumundaki özellikler olduğu gibi kalır.

1. **Silahlar ve yük ekranı** (🔧 iyileştirilmeli) — KAAN (V2.41), TB2 (V2.42) ve TB3 (V2.43) gerçek mühimmatla; diğer uçaklar model serisinde sırayla geçecek, o zamana kadar yer tutucu (Füze-1, GP-82…)
2. **Çevrimiçi oda** (🧪 denenmeli) — 29 Ekim denemesi: aynı bilgisayarda iki ayrı oyun sayfası (telefon boyutu) oda kurdu, katıldı, maç başladı, konumlar eşleşti (fark < 5 m), yazılı sohbet iki yönde çalıştı, hata yok. Bağlantı katmanı burada taklit edildi (PeerJS sunucusuna bu ortamdan erişilemiyor); internet üzerinden iki gerçek cihaz hâlâ denenmeli.
3. **Karma çok oyunculu ve üs ele geçirme** (🧪 denenmeli) — Oda ve sohbet katmanı 29 Ekim'de iki sayfayla doğrulandı; karma mod ve üs ele geçirme iki gerçek cihazla denenmeli.
4. **Sesli ve yazılı sohbet** (🧪 denenmeli) — Yazılı sohbet 29 Ekim'de doğrulandı. Sesli sohbet mikrofon ve gerçek bağlantı istiyor; yalnız iki gerçek cihazla denenebilir.
5. **Uygulama olarak yükleme** (🔧 iyileştirilmeli) — KARAR (29 Ekim): Play Store yayını model serisinden sonra (docs/ANDROID.md).
6. **Uçak, helikopter, araç ve gemi modelleri** (🔧 iyileştirilmeli) — Gerçeğe benzerlik zayıf; ANKA-3 +%37, Kızılelma +%18, Hürjet +%17 ölçü sapması. KARAR: model serisi V2.41'den itibaren, her model onaya sunulur.

## Uçuş

| Özellik | Ne yapar | Nereden | Tuş | Sürüm | Test | Durum |
|---|---|---|---|---|---|---|
| **Uçak seçimi ve hangar** | On Türk uçağı ve İHA arasından seçim; hangarda 3B inceleme, boya, performans çubukları ve karşılaştırma. | Hızlı Oyun → Serbest Uçuş / Sürüş · Kariyer → Hangar | — | V1.24 | picker, menu3 | ✅ iyi |
| **Uçuş modeli** | Gaz, art yakıcı, fren, iniş takımı; uçağa göre gerçek hız, tırmanma ve servis tavanı. | Her uçuşta | W/S/A/D · Q/E · R/F · Shift · B · G | V1.02 | features, realperf | ✅ iyi |
| **Taksi ve kalkış** | Hangardan piste taksi, otomatik taksi ve taksiyi atlama; kule izni. | Başlangıç yeri: Hangardan | T otomatik taksi · L taksiyi atla | V1.00 | taxi, hangar_taxi, airport | ✅ iyi |
| **İniş yardımı** | Piste yaklaşırken süzülüş ve merkez hattı göstergesi, istenirse otomatik iniş. | Ayarlar → Uçuş → Uçuş yardımı | — | V1.96 | assist | ✅ iyi |
| **Uçuş konforu** | Otomatik denge, türbülans ayarı, kare süresi yumuşatma. | Ayarlar → Uçuş | — | V1.84 | comfort | ✅ iyi |
| **3B kokpit** | Çalışan çok işlevli ekranlar, kafa hareketi. | Uçuşta kamera değiştir | C | V1.89 | cockpit | ✅ iyi |
| **Akrobasi** | Akrobasi dumanı, figür tanıyıcı ve akrobasi gösterisi görevi. | Görevler · uçuşta duman | F6 duman | V2.07 | acro | ✅ iyi |
| **Hasar, yakıt ve fırlatma koltuğu** | Parça hasarı, yakıt tüketimi, ikmal-onarım, fırlatma koltuğu. | Her uçuşta | J (iki kez) fırlatma | V1.73 | damage, service | ✅ iyi |
| **Bakım hangarı** | Yerde bakım hangarına girince silah yükleme ve onarım. | Üste bakım hangarı | — | V1.00 | service | ✅ iyi |
| **İHA uçuş bilgisayarı** | İHA'larda irtifa ve rota tutan uçuş bilgisayarı. | İHA ile uçarken | — | V1.96 | uav, assist | ✅ iyi |

## Silah ve savaş

| Özellik | Ne yapar | Nereden | Tuş | Sürüm | Test | Durum |
|---|---|---|---|---|---|---|
| **Silahlar ve yük ekranı** | Top, 2 bomba ve 3 füze tipi; uçağa göre yük, hazır yük grupları. | Hangar → Yük · Bakım hangarı | Space top · X silah · N sıradaki · 1–5 | V1.02 | setup, features, v230 | 🔧 iyileştirilmeli |
| **Gerçek Türk mühimmatı** | Model serisinden geçen uçaklar gerçek mühimmat taşır: KAAN'da GÖKDOĞAN, BOZDOĞAN, SOM-J (iç silah yuvasında, kapaklar atışta açılır), HGK-82 ve NEB-84 (kanat altında). TB2 (V2.42) ve TB3'te (V2.43) MAM-L, MAM-C ve MAM-T. Veriler Defence Turk Sistem Envanteri'nden. | Hangar → Yük · Model Kütüphanesi → Mühimmat | X silah · 1–5 silah seç | V2.41 | v241, v242, v243, setup | ✅ iyi |
| **Hedef kilidi** | Füzeler için hedef kilidi, kilit uyarısı açılıp kapatılabilir. | Uçuşta | K kilit · Tab hedef değiştir | V1.02 | features | ✅ iyi |
| **Düşman uçakları ve kanat adamı** | Kırmızı Kuvvet savaş uçakları, yapay zekâ kanat adamı (Kılıç 2) ve ona emir verme. | Görev ekranı → düşman / kanat adamı | F8 kanat adamı emirleri | V1.10 | ai, wing, enemy | ✅ iyi |
| **Hava savunma ve füzeden kaçış** | SAM bataryaları, füze uyarısı, gerçekçi füze modeli, flare ve kaçış yardımı. | Görev ekranı → SAM | Z flare · F7 kaçış | V1.51 | evade, enemy | ✅ iyi |
| **Gece görüş ve termal kamera** | NVG ve FLIR görünümleri. | Uçuşta | ` (Backquote) | V1.74 | weather | ✅ iyi |

## Kara ve deniz araçları

| Özellik | Ne yapar | Nereden | Tuş | Sürüm | Test | Durum |
|---|---|---|---|---|---|---|
| **Yürüyüş** | Birinci şahıs yürüme, koşma, zıplama, araçlara ve uçaklara binme. | Hızlı Oyun → Üssü Gez | WASD · Shift · Space · E bin | V1.34 | walk, indoor | ✅ iyi |
| **Kara araçları** | Arabalar, tanklar, zırhlılar, itfaiye, uçak çekici; her birinin kendi sürüşü, turbo, park etmiş araçlara binme. | Yürürken araca bin · Araç çağır | W/S/A/D · Shift turbo · T araç değiştir | V1.54 | vehicles, land, collide | ✅ iyi |
| **Deniz araçları** | Hücumbot, korvet, TCG Anadolu; makine telgrafı, dümen, gemi topları, helikopter güvertesi, kıyıya yanaşma. | Marina ve deniz üssü · Araç çağır | W/S hız · A/D dümen · Space top | V1.70 | boats, naval, groundsea | ✅ iyi |
| **Araç çağırma** | Kara, hava ve deniz aracını bulunduğun yere teslim ettirme (lojistik telsizi). | Yürürken | G araç çağır | V1.71 | call | ✅ iyi |
| **Helikopterler** | T129 ATAK ve T625 Gökbey: askı yükü, asker taşıma, kapı silahı, askı yardımı. | Hangar · üslerdeki helikopterler | R/F kolektif · B kanca · J askı yardımı | V1.55 | heli, heliops | ✅ iyi |

## Dünya

| Özellik | Ne yapar | Nereden | Tuş | Sürüm | Test | Durum |
|---|---|---|---|---|---|---|
| **Ada ve üsler** | 30 km'lik ada: hava üssü, deniz üssü, kara üssü, İHA adası, marina, köyler, Hilalkent ve Anadolukent, Kızıl Bölge, simge yapılar. | Harita | M harita | V1.31 | airport, naval, land, uav, marina, town, rural, south, military, landmarks | ✅ iyi |
| **Canlı dünya** | Trafik, yayalar, yer personeli, hava trafiği, martılar, ortam sesleri. | Her yerde | — | V1.42 | airlife, town | ✅ iyi |
| **Gün saati ve hava durumu** | Gün/gece, sabah sisi, yağmur, kar, fırtına, rüzgâr ve türbülans. | Ayarlar → Dünya · görev ekranı | — | V1.46 | daynight, weather | ✅ iyi |
| **Harita ve ışınlanma** | Tam ekran harita, köşe haritası, yerler listesine ışınlanma, haritaya işaret ve işaret çarkı. | Uçuşta ve yürürken | M harita · F4 işaret | V1.53 | map, comms | ✅ iyi |

## Görevler ve modlar

| Özellik | Ne yapar | Nereden | Tuş | Sürüm | Test | Durum |
|---|---|---|---|---|---|---|
| **Hızlı Oyun** | Kariyerden bağımsız: hemen başla, serbest uçuş/sürüş, hızlı görev, üssü gez. Her şey açık, puan kazandırmaz. | Ana menü → Hızlı Oyun | — | V1.82 | menu2, menu3, v229 | ✅ iyi |
| **Hızlı Savaş** | Botlara karşı havada başlayan dört mod: İt Dalaşı, Serbest Çatışma, Yer Taarruzu, Hava Hedefleri. | Ana menü → Hızlı Oyun → Hızlı Savaş | — | V2.29 | v229 | ✅ iyi |
| **Görev panosu** | Bütün görevler tek ekranda: uçak, helikopter, kara, deniz, yarış; brifing, hedef takibi, görev günlüğü, görev sonu raporu. | Kariyer → Görevler · Hızlı Oyun → Hızlı Görev | F2 görev günlüğü | V1.76 | board, misui | ✅ iyi |
| **Dinamik görevler** | Her seferinde farklı, çok aşamalı görevler ve görev ortası olaylar; günlük ve haftalık görevler. | Görev panosu | — | V1.77 | dynamic, progress | ✅ iyi |
| **Harekât: Kızıl Elma** | Sekiz bölümlük hikâyeli harekât; bölümler sırayla açılır, final madalya verir. | Kariyer → Harekât | — | V1.98 | campaign | ✅ iyi |
| **Yarışlar** | Kapılı yarışlar, süre, hayalet ve sıralama tablosu. | Görev panosu → Yarışlar | — | V1.80 | races | ✅ iyi |
| **Görev editörü** | Kendi görevini kur: aşamalar, tetikleyiciler, dene, kaydet ve paylaş. | Görevler → ＋ Görev editörü | — | V1.81 | editor, v237 | ✅ iyi |
| **Kara ve deniz görevleri** | Tank, araç ve gemi ile görevler. | Görev panosu | — | V1.99 | groundsea | ✅ iyi |

## Kariyer ve ilerleme

| Özellik | Ne yapar | Nereden | Tuş | Sürüm | Test | Durum |
|---|---|---|---|---|---|---|
| **Rütbe ve tecrübe puanı** | Er'den Orgeneral'e rütbeler, terfi töreni; rütbeyle açılan uçaklar, araçlar, görevler ve boyalar. | Ana menü → Kariyer | — | V1.67 | career, progress | ✅ iyi |
| **Uçuş okulu** | Adım adım dersler: kalkış, iniş, rüzgârlı iniş, helikopter, askı yükü, silah, gemiye iniş. | Kariyer → Eğitim | — | V1.78 | school | ✅ iyi |
| **Ehliyet ve sertifikalar** | İHA pilotu, pilot, tank sürücüsü, araç sürücüsü, kaptan belgeleri ve sınavları; belgesiz kullanım engeli. | Kariyer → Ehliyet ve Sertifikalar | — | V1.92 | licenses | ✅ iyi |
| **Başarımlar, madalyalar, istatistikler** | Başarımlar, madalyalar, uçuş istatistikleri, rekorlar. | Kariyer · üstteki kupa düğmesi | — | V1.79 | progress | ✅ iyi |

## Çok oyunculu

| Özellik | Ne yapar | Nereden | Tuş | Sürüm | Test | Durum |
|---|---|---|---|---|---|---|
| **Çevrimiçi oda** | Sunucusuz P2P oda (en çok 4 kişi): işbirliği, takım savaşı, herkes herkese; boş yerleri botlar doldurur. | Ana menü → Çok Oyunculu | — | V1.24 | net, net_ffa | 🧪 denenmeli |
| **Karma çok oyunculu ve üs ele geçirme** | Uçak, araç ve gemiler aynı maçta; üs ele geçirme modu; kule görevlisi rolü. | Çok Oyunculu → mod | — | V1.83 | net_mix | 🧪 denenmeli |
| **Sesli ve yazılı sohbet** | Bas-konuş sesli sohbet, yazılı sohbet, oyuncu çıkarma. | Çok oyunculu maçta | I bas-konuş · / sohbet | V1.62 | net, comms | 🧪 denenmeli |

## Ses ve telsiz

| Özellik | Ne yapar | Nereden | Tuş | Sürüm | Test | Durum |
|---|---|---|---|---|---|---|
| **Müzik** | Oyunun kendi bestesi: menü, sakin uçuş, çatışma, zafer, yenilgi; ara ara çalar. | Ayarlar → Ses → Müzik / Müzik sıklığı | U sesi kapat | V1.61 | sound, v228 | ✅ iyi |
| **Telsiz** | Kule, AWACS (Kartal Gözü), kanat adamı ve eğitmen konuşmaları; hazır mesaj menüsü, altyazı. | Uçuşta | O telsiz menüsü | V1.62 | radio | ✅ iyi |

## Kontroller

| Özellik | Ne yapar | Nereden | Tuş | Sürüm | Test | Durum |
|---|---|---|---|---|---|---|
| **Dokunmatik kontroller** | Serbest çubuk, gaz, ATEŞ, FLARE, TEKER, dümen; düzen düzenleyici ve hazır düzenler (Klasik, Sol el, Eğerek uç). | Telefonda kendiliğinden · Ayarlar → Kontroller → Dokunmatik | — | V1.52 | phone, touch2, controls | ✅ iyi |
| **Oyun kolu ve klavye** | Tam oyun kolu desteği, tuş atama, kontrol şemaları; kısayol çakışma denetimi. | Ayarlar → Kontroller | — | V1.52 | controls, input | ✅ iyi |
| **Titreşim ve eğerek uçuş** | Telefon titreşimi ve telefonu eğerek yönlendirme. | Ayarlar → Kontroller | — | V1.90 | phone | ✅ iyi |

## Fotoğraf ve tekrar

| Özellik | Ne yapar | Nereden | Tuş | Sürüm | Test | Durum |
|---|---|---|---|---|---|---|
| **Tekrar izleme** | Son uçuşu kameralar ve zaman çubuğuyla yeniden izleme. | Uçuşta | F3 | V1.87 | replay | ✅ iyi |
| **Fotoğraf modu** | Arayüzsüz serbest kamera ile fotoğraf. | Uçuşta | H | V1.87 | replay | ✅ iyi |

## Grafik ve performans

| Özellik | Ne yapar | Nereden | Tuş | Sürüm | Test | Durum |
|---|---|---|---|---|---|---|
| **Grafik ayarları** | Otomatik / hazır ayarlar, ayrıntılı ayarlar, maliyet etiketleri, canlı fark, arama, varsayılana dön. | Ayarlar → Grafik | — | V1.57 | gfx2, settings2, quality, settings | ✅ iyi |
| **Akıllı performans** | Otomatik çözünürlük, kalite basamakları, eşit aralıklı 30 FPS, ısınmaya karşı sabit kalite. | Ayarlar → Grafik → Otomatik | — | V1.94 | perf, perf2, quality | ✅ iyi |
| **Performans testi** | 2 dakikalık sabit rota, özellik maliyetleri, darboğaz, önerilen ayarlar, anonim rapor. | Ayarlar → Grafik → Sorun giderme → Performans testi | — | V2.12 | perftest, v234 | ✅ iyi |
| **Görüntü sorunu testi** | Katmanları tek tek kapatıp görüntü hatasının kaynağını bulma. | Ayarlar → Grafik → Sorun giderme → Görüntü testi | — | V1.97 | gfxtest, v237 | ✅ iyi |
| **Grafik tanılama** | Cihaz bilgisi, derinlik, efekt durumu gibi tanılama satırları. | Ayarlar → Grafik → Sorun giderme → Tanılama | — | V1.59 | gfxtest, v237 | ✅ iyi |
| **Yükleme ekranı** | Dönen 3B ay yıldız, uçak biçimli ilerleme çubuğu, ipucu kartları, oyun dilinde aşama adları, hafif yükleme sesi. | Açılışta | — | V2.20 | boot, v238 | ✅ iyi |

## Hesap ve kayıt

| Özellik | Ne yapar | Nereden | Tuş | Sürüm | Test | Durum |
|---|---|---|---|---|---|---|
| **Hesap ve profil** | Misafir ya da bulut hesabı, oyuncu kartı, birden çok profil, bulut eşitleme. | Ana menü → sağ üstteki profil | — | V1.66 | account, pcard | ✅ iyi |
| **Kayıt ve yedek** | Bütün ilerleme tek kayıtta, her oturum yedekleniyor; grafik ayarları cihaza özel. | Kendiliğinden | — | V2.26 | depo | ✅ iyi |
| **Uygulama olarak yükleme** | Ana ekrana ekleme, kısayollar, Android (Play Store) hazırlığı. | Ana menü → Uygulamayı yükle | — | V2.01 | install | 🔧 iyileştirilmeli |
| **Duyurular ve sürüm notları** | Yönetici duyuruları, güncellemeden sonra yenilikler şeridi, Yenilikler ekranı. | Ana menü → Yenilikler | — | V1.66 | notes | ✅ iyi |

## Yönetici araçları

| Özellik | Ne yapar | Nereden | Tuş | Sürüm | Test | Durum |
|---|---|---|---|---|---|---|
| **Yönetim paneli** | Duyuru yayını, görev yayını, kütüphanelere giriş (yalnız yönetici). | Ana menü → kalkan düğmesi | — | V1.68 | account | ✅ iyi |
| **Model kütüphanesi** | Bütün modelleri 3B inceleme, test, boya, kendi modelini yükleme (.glb .gltf .fbx .obj .stl .dae), ölçü denetimi. | Yönetim paneli → Kütüphaneler | — | V1.37 | library, modelreg | ✅ iyi |
| **Ses kütüphanesi** | Her sesi dinleme, kendi ses dosyasıyla değiştirme, kanal karışımı. | Yönetim paneli → Kütüphaneler | — | V1.60 | sound | ✅ iyi |
| **Sistem envanteri** | Gerçek Türk sistemlerinin verileri (Defence Turk kaynaklı, atıflı). | Hangar → Gerçek veriler | — | V1.86 | envanter | ✅ iyi |

## Modeller

| Özellik | Ne yapar | Nereden | Tuş | Sürüm | Test | Durum |
|---|---|---|---|---|---|---|
| **Uçak, helikopter, araç ve gemi modelleri** | Kodla üretilmiş stilize modeller; parça birleştirme ile az çizim. | Her yerde | — | V1.37 | modelreg, bake | 🔧 iyileştirilmeli |
