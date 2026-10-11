# Yol Haritası

## Durum (V1.10)
- ✅ Yapay zekâ düşman uçakları + kanat adamı + İt dalaşı görevi
- ✅ P2P çevrimiçi: lobi, oda kodu, 4 oyuncu, İşbirliği / Takım / Herkes herkese, bot doldurma, skor
- ⏳ Sonraki: gerçek ağ koşullarında test (gecikme/kopma), yeniden bağlanma, sohbet, kendi sunucu seçeneği (8+ oyuncu), mobil veri optimizasyonu

## Grafik ve içerik planı (karar: cilalı stilize, telefon öncelikli, ileride Android)
| Aşama | Sürüm | İçerik | Durum |
|---|---|---|---|
| 0 | V1.20–V1.24 | İsim/marka, yeni menüler, gruplar (Hilal Kanatlar / Mavi Kanatlar / Kara), sınıf filtresi, araç kayıt sistemi, silah uyumu altyapısı, otomatik performans + FPS, PWA | ✅ |
| 1 | V1.30 | Işık ve atmosfer: PBR malzeme, güneş gölgeleri, gökyüzü/güneş, mesafe pusu, kanopi yansıması | ✅ |
| 2 | V1.31 | Havalimanı: pist işaretleri, kenar/yaklaşma ışıkları, PAPI, kule, terminal, radar, itfaiye, yakıt, yer araçları, tabelalar | ✅ |
| 3 | V1.32 | Hangar iç tasarımı: kapalı bekleme hangarı (çelik makaslar, tavan lambaları, epoksi zemin, bayrak ve pankartlar, tezgâh, takım dolabı, raf, silah arabaları), bakım hangarı iç donanımı | ✅ |
| 4 | V1.39 | Üs çevresi: çit, nizamiye, köy, tarlalar, orman, kıyı köpüğü, deniz feneri | ✅ |
| 4a | V1.40 | Deniz üssü (Mavi Kanatlar): iskeleler, dalgakıran, TCG Anadolu, fırkateyn/korvetler, denizaltı barınağı, yüzer havuz, vinçler | ✅ |
| 4b | V1.41 | Kara üssü (Bozkurtlar): kışla, garajlar, araç parkı, atış poligonu | ✅ |
| 4c | V1.42 | Yol ağı ve trafik, Hilalkent kasabası | ✅ |
| 4d | V1.43 | Hilal Marina, deniz otobüsü ve gemi trafiği, kumsal, martılar | ✅ |
| 4e | V1.44 | Kırsal: rüzgâr türbinleri, GES, seralar, zeytinlik, gölet, köye canlılık | ✅ |
| 4f | V1.45 | Askeri tesisler: dağda radar, hava savunma mevzisi, mühimmat deposu | ✅ |
| 4g | V1.46 | Atmosfer: gün saati/döngü, gece ışıkları, sabah sisi, ortam sesleri | ✅ |
| 4h | V1.47 | Hilal Köprüsü ve Anadolukent (güney ada) | ✅ |
| 4i | V1.48 | Güneydoğu ada: İHA ve test merkezi | ✅ |
| 4j | V1.49 | Kızıl Bölge (düşman üssü ve hedefler, güney adanın batısı) | ✅ |
| 4k | V1.50 | Baraj, kayak merkezi, antik kent, kale, petrol platformu, deniz RES, rasathane | ✅ |
| 5 | V1.25 | Uçak detayları: fotoğraflara yüksek benzerlik, panel çizgileri, çıkartmalar, ışıklar, takım ve kumanda yüzeyi animasyonu | |
| 6 | V1.3x | Gerçek silah envanteri, yeni hava araçları; sonra Mavi Kanatlar (deniz) ve kara sistemleri | |

## Oynanış ve kontrol yol haritası (V1.51+)
| Sürüm | İçerik | Durum |
|---|---|---|
| V1.51 | Uzak titreşim düzeltmesi, serbest modda düşman/SAM varsayılan kapalı, genel pist sistemi (İHA üssüne iniş/kalkış), yürürken zıplama, ses N tuşuna | ✅ |
| V1.52 | Kontrol sistemi: Klavye/Fare, Gamepad, Dokunmatik sekmeleri; Hava, Helikopter, Kara, Deniz, Yaya, Genel şemaları; tuş atama, çakışma uyarısı, varsayılana dön | ✅ |
| V1.53 | Harita modu (M), köşe haritası, ışınlanma, başlangıç yeri seçimi (İHA üssü, Kızıl Bölge, her yer) | ✅ |
| V1.54 | Yeni araç modeli, daha hızlı ve gerçekçi sürüş | ✅ |
| V1.55 | Helikopterler (T129 ATAK, T625 GÖKBEY) | ✅ |
| V1.56 | Model havuzu: gemiler, kara araçları, helikopterler, sivil araçlar | ✅ |

## Büyük yol haritası V1.57–V1.86 (modellemelerden önce)

Kararlar: hesaplar bulutta (Supabase: giriş, veritabanı, dosya deposu; ücretsiz katman), yönetici yetkisi sunucu tarafında; müzik hem oyunun ürettiği telifsiz parçalar hem kullanıcı dosyası; telsiz hem tarayıcının Türkçe seslendirmesi hem kullanıcı kaydı.
Sıra mantığı: önce görüntü bozuklukları, sonra ses, sonra arayüz tasarım sistemi (sonraki tüm yeni ekranlar bu sistemle yapılsın diye), ardından hesap/profil/yönetici, araçlar, görevler, dünya, çok oyunculu ve paylaşım.
Her sürüm: kod + test + GitHub + yayın; telefon ve PC ekran görüntüsüyle kontrol.

### Faz 1 — Grafik ve performans
| Sürüm | İçerik | Kabul ölçütü | Durum |
|---|---|---|---|
| V1.57 | **Telefon görüntü düzeltmesi.** Cihaz profili (Telefon / Tablet / PC) otomatik seçilir. Mobilde logaritmik derinlik kapanır, yerine yakın düzlem ve polygonOffset ile güvenli derinlik kullanılır. Gölge sapması ve hassasiyeti (highp) ayarlanır; telefonda HDR ve çok örnekli tampon kapanır. **Grafik tanılama** ekranı: GPU adı, WebGL sürümü, çözünürlük ölçeği, FPS grafiği, açık özellikler; tek dokunuşla "güvenli mod". | Telefonda siyah dalga yok; tanılama ekranı bilgileri doğru gösteriyor. | |
| V1.58 | **PC görüntü kalitesi.** Otomatik çözünürlük düşürme akıllanır: PC'de alt sınır %85, kademeli ve geri dönüşlü. Kenar yumuşatma iyileşir (MSAA + gerekirse FXAA). Dokularda anizotropik filtre ve mipmap. Gölge kamerası texel'e sabitlenir, böylece kaymaz ve titremez. Çit, tel ve anten gibi ince parçalar uzakta sadeleşir. Uzak ışık noktalarında boyut sınırı uygulanır. | PC'de pikselleşme ve uzak titreşim yok; önce/sonra ekran görüntüleri. | |
| V1.59 | **Performans.** Uzak üs ve şehirlerde ayrıntı seviyesi (LOD) ve görüş mesafesi; çizim çağrısı azaltma (birleştirme, instancing). Gölge yalnızca yakına uygulanır. Ağaç ve bulut yoğunluğu ölçeklenir. Hazır ayarlar **Düşük / Orta / Yüksek / Ultra** ve **Özel**. | PC'de 60, orta telefonda 50+ FPS. | |

### Faz 2 — Ses
| Sürüm | İçerik | Kabul ölçütü | Durum |
|---|---|---|---|
| V1.60 | **Ses altyapısı ve Ses Kütüphanesi.** Kanallar: Ana, Müzik, Efekt, Arayüz, Telsiz, Ortam; her birinin ayrı ses düzeyi var. Duruma göre karışım: menüde motor ve rüzgâr susar; duraklatınca efektler kısılır. Ses Kütüphanesi ekranı (model kütüphanesi gibi) şu kategorileri içerir: Motor (jet, pervane, rotor, araç), Silah, Patlama, Çevre, Arayüz, Müzik, Telsiz. Her ses dinlenebilir, ses düzeyi ve tonu ayarlanabilir. Kendi dosyanı yükleyebilirsin (mp3/ogg/wav, cihazda IndexedDB'de saklanır) ve varsayılana dönebilirsin. | Menüde motor sesi yok; yüklenen ses oyunda hemen çalıyor. | |
| V1.61 | **Müzik ve arayüz sesleri.** Oyunun ürettiği telifsiz müzik: ana menü teması, sakin uçuş, çatışma, zafer ve yenilgi. Duruma göre yumuşak geçiş yapılır. Yönetici çalma listesini yönetir; oyuncu yalnız ses düzeyini ve müziği açıp kapamayı seçer. Düğme, sekme, geçiş, bildirim ve uyarı sesleri. | Menü ve oyun müziği durumla değişiyor. | |
| V1.62 | **Telsiz.** Kule konuşmaları: kalkış ve iniş izni, pist, rüzgâr, trafik uyarısı. Kanat adamı, AWACS ve düşman tespiti anonsları. Telsiz filtresi ve cızırtı. Tarayıcının Türkçe seslendirmesi; her cümle Ses Kütüphanesi'nden kendi kaydınla değiştirilebilir. **Telsiz altyazıları.** Çok oyunculuda **bas-konuş sesli sohbet** (WebRTC) ve hazır telsiz mesajları (radyal menü). | Kalkışta kule izin veriyor; çok oyunculuda ses iletiliyor. | |

### Faz 3 — Arayüz (AAA görünüm)
| Sürüm | İçerik | Kabul ölçütü | Durum |
|---|---|---|---|
| V1.63 | **Tasarım sistemi ve yeni ana menü.** Tek görsel dil: renk, yazı ölçeği, düğme, kart, sekme, ikon ve animasyon kuralları. Ana menüde arka planda sinematik hangar kamerası; solda Kariyer, Görevler, Serbest Uçuş, Çok Oyunculu, Hangar, Kütüphaneler (Model / Ses), Ayarlar. Gamepad ve klavyeyle tam gezinme, odak çerçevesi. Ekran geçiş animasyonları ve yükleme ekranı ipuçları. | Tüm menü gamepad ile kullanılabiliyor; tek tip görünüm. | |
| V1.64 | **Hangar ve mühimmat yükleme.** Araç seçimi karusel kartlarla; sekmeler Uçak, İHA ve **Helikopter**. Hız, manevra, menzil ve yük çubukları; iki aracı karşılaştırma. Mühimmat ekranında uçağın üstten görünümünde istasyonlar; istasyona dokununca uyumlu silahlar listelenir. Hazır yükler: Hava-hava / Kara taarruzu / Keşif / Deniz. Ağırlık, sürükleme ve uyum göstergesi. | Helikopter seçilebiliyor; yükleme üç dokunuşta tamamlanıyor. | |
| V1.65 | **Ayarlar menüsü.** Sekmeler: Grafik, Ses, Kontroller, Oynanış, Arayüz, Erişilebilirlik. Basit ve Gelişmiş görünüm, ayar arama, her ayar için açıklama ve önizleme, Uygula / Geri al. Erişilebilirlik: yazı boyutu, renk körlüğü modları, altyazı, titreşim, hareket azaltma. | Her ayarın açıklaması var; geri al çalışıyor. | |

### Faz 4 — Hesap, profil, rütbe ve yönetici
| Sürüm | İçerik | Kabul ölçütü | Durum |
|---|---|---|---|
| V1.66 | **Bulut altyapısı ve giriş.** Supabase projesi (adım adım kurulum rehberi; anahtarlar oyuna eklenir). Giriş ekranı: Google ya da e-posta ile giriş, şifre sıfırlama, **misafir olarak oyna** (internetsiz de çalışır). İlk girişte profil oluşturma: çağrı adı, birlik (Hilal Kanatlar / Mavi Kanatlar / Bozkurtlar), arma ve avatar. Bu cihazdaki eski kayıtları profile aktarma. Bulut eşitleme: ayarlar, kontroller, boyalar, ilerleme; internetsizken önbellekten oynayıp bağlanınca eşitleme. Profil değiştirme (aynı cihazda birden çok oyuncu). | İki farklı cihazda aynı hesapla aynı kayıt görünüyor. | |
| V1.67 | **Profil ekranı ve rütbeler.** Profil sayfası: rütbe ve arma, toplam uçuş süresi, iniş ve kalkış, tamamlanan görevler, düşürülen hedefler, kullanılan araçlar, en iyi dereceler, madalya ve başarımlar, son uçuşlar. Rütbe sırası: Er → Onbaşı → Çavuş → Uzman Çavuş → Astsubay → Asteğmen → Teğmen → Üsteğmen → Yüzbaşı → Binbaşı → Yarbay → Albay → Tuğgeneral → Tümgeneral → Korgeneral → Orgeneral. Terfi tecrübe puanıyla olur, terfi töreni ekranı çıkar. Bazı uçak ve araçlar rütbeyle açılır (ör. KAAN için Yüzbaşı). Çok oyunculuda isim yanında rütbe arması görünür. | Puan kazanınca terfi oluyor; profil kaydı bulutta. | |
| V1.68 | **Yönetici modu.** Yönetici yetkisi yalnız sunucuda tanımlı (veritabanı güvenlik kuralları), ilk yönetici senin hesabın. **Yönetim paneli:** oyuncu listesi ve arama, rütbe verme ve geri alma, uyarı, uzaklaştırma, duyuru yayınlama (oyun açılışında görünür), etkinlik ve görev yayınlama, oyun ayarlarını uzaktan değiştirme. **Model Kütüphanesi, Ses Kütüphanesi ve müzikler yalnız yöneticiye görünür.** Yöneticinin yüklediği model, boya, ses ve müzik bulut deposuna gider ve tüm oyunculara otomatik dağıtılır. Değişiklik kaydı tutulur (kim, neyi, ne zaman). | Normal oyuncuda kütüphaneler görünmüyor; yöneticinin yüklediği müzik tüm oyuncularda çalıyor. | |

### Faz 5 — Araçlar
| Sürüm | İçerik | Kabul ölçütü | Durum |
|---|---|---|---|
| V1.69 | **Tüm kara araçlarına binme.** Askerî kamyon, otobüs, yakıt tankeri, uçak çekici (uçağı bağlayıp çekme), itfaiye (yangın söndüren su topu), Altay, Pars, Kirpi, Fırtına, Hisar, Korkut. Tank ve zırhlılarda taret döndürme, nişan ve atış. Her araca özgü hız, ağırlık, kamera ve HUD. Kasabadaki sivil arabalara da binilebilir. | Her araca binilip sürülebiliyor; tank ateş ediyor. | |
| V1.70 | **Deniz araçları ve gemi operasyonları.** Hücumbot, römorkör, balıkçı teknesi, yelkenli ve fırkateyn sürme (deniz kontrol şeması). Dalga ve iz efekti. Helikopterle TCG Anadolu ve fırkateyn güvertesine iniş ve kalkış (hareket eden güverte). | Gemiye iniş yapılabiliyor. | |
| V1.71 | **Araç çağırma.** Radyal "Araç çağır" menüsü (klavye, gamepad, dokunmatik). Araç bulunduğun yere ya da haritadan seçilen noktaya gelir. Yere uygun öneriler: suda bot, havalimanında çekici, düz alanda helikopter. Teslimat animasyonu (yolda sürerek gelir ya da T625 ile askıda bırakılır). | Her yerde araç çağrılabiliyor. | |
| V1.72 | **Helikopterler tam oyunda.** Görev ve serbest uçuşta helikopter. T129: 20 mm top, CİRİT roketi, UMTAS (kilit, atış). T625: asker ve yük taşıma, **askı halatıyla araç taşıma**, kapı silahı. Helikopter HUD'u ve otomatik havada asılı kalma (hover) yardımı. | Görevlerde helikopterle hedef vurulabiliyor. | |
| V1.73 | **Fırlatma koltuğu, paraşüt ve hasar.** Uçaktan fırlama, paraşütle süzülme, yere inince yürüme veya araç çağırma. Yakıt tüketimi ve uyarısı. Hasar modeli: duman, alev, parça kopması, motor arızası. Üste ikmal ve tamir (servis hangarı ile bağlantılı). | Vurulunca atlanabiliyor; yakıt bitiyor ve ikmal yapılıyor. | |

### Faz 6 — Dünya ve atmosfer
| Sürüm | İçerik | Kabul ölçütü | Durum |
|---|---|---|---|
| V1.74 | **Hava durumu.** Açık, bulutlu, yağmur, kar, sis, fırtına (şimşek); rüzgâr yönü ve şiddeti uçuşu etkiler, türbülans var. Bulutun içinden uçarken görüş düşer; pistte ıslak zemin yansıması. Haritada hava durumu seçimi ve rastgele değişim. Gece için **gece görüş (NVG)** ve **termal kamera (FLIR)**. | Her hava tipi seçilebiliyor; rüzgâr inişi etkiliyor. | |
| V1.75 | **Canlı havalimanı.** Sivil ve askerî yapay zekâ trafiği iner, kalkar, taksi yapar ve kuleyle konuşur. Yerde yürüyen personel, bakımcılar ve nöbetçiler. Kasabada yaya NPC'ler. | Trafik kuleyle eşgüdümlü çalışıyor. | |

### Faz 7 — Görevler ve oyun modları
| Sürüm | İçerik | Kabul ölçütü | Durum |
|---|---|---|---|
| V1.76 | **Görev ekranı.** Görev panosunda kategori, zorluk, süre ve ödül filtreleri. Brifing ekranı: harita, hedefler, tehditler, önerilen yük. Oyun içinde hedef takibi (HUD işaretleri, mesafe) ve görev günlüğü (**J**). Görev sonu raporunda yıldız, puan ve istatistik. | Görev panodan seçilip brifingle başlıyor. | |
| V1.77 | **Dinamik görevler.** Yerlere göre üretilen görevler: devriye, önleme, yakın hava desteği, refakat, İHA keşfi, deniz devriyesi, T625 ile arama-kurtarma ve yük taşıma, kara araçlarıyla konvoy. Görev ortasında olaylar (yeni tehdit, hava değişimi, arıza). Çok aşamalı hedefler, süre sınırı, isteğe bağlı ek hedefler. | Her girişte farklı görev seti. | |
| V1.78 | **Uçuş okulu.** Dersler: kalkış, tur, iniş, rüzgârlı iniş, helikopterde havada asılı kalma, sapan yükü, silah kullanımı, gemiye iniş. Eğitmen telsiz anlatımı. Lisans ve madalya. | Dersler adım adım tamamlanıyor. | |
| V1.79 | **Kariyer ve başarımlar.** Rütbe sistemine (V1.67) bağlı kariyer: görevlerden tecrübe puanı, puanla yeni uçak, araç ve boya açma. Başarımlar, günlük ve haftalık görevler, istatistik sayfası. | İlerleme kaydediliyor. | |
| V1.80 | **Yarışlar.** Halkalardan geçmeli uçak yarışı, helikopter slalomu, adada araba rallisi, botla deniz yarışı. Hayalet (en iyi derece) ve sıralama tablosu (cihazda). | Yarışlar süre kaydediyor. | |
| V1.81 | **Görev editörü.** Haritaya hedef, düşman, nokta ve tetikleyici koyma. Görevi kod veya dosyayla paylaşma; yönetici beğendiği görevi herkese yayınlar. | Kendi görevi yapılıp oynanabiliyor. | |

### Faz 8 — Çok oyunculu
| Sürüm | İçerik | Kabul ölçütü | Durum |
|---|---|---|---|
| V1.82 | **Karma çok oyunculu.** Yaya, araç, helikopter ve uçak aynı oyunda. **Üs ele geçirme** modu (takımlar). **Kule görevlisi** rolü: bir oyuncu kuleden izin verir ve haritayı yönetir. Oyun içi yazılı sohbet. Odalarda profil adı ve rütbe; yönetici odadan çıkarabilir. | 4 oyuncu farklı araçlarda aynı oyunda. | |

### Faz 9 — Kokpit, paylaşım, telefon
| Sürüm | İçerik | Kabul ölçütü | Durum |
|---|---|---|---|
| V1.83 | **Tekrar izleme.** Son uçuşun kaydı, sinematik kameralar, zaman çubuğu ve yavaş çekim. Fotoğraf ve kısa video kaydı (WebM). | Tekrar izleme ve video indirme çalışıyor. | |
| V1.84 | **3B kokpit.** KAAN, Hürjet ve T129 için iç görünüm, çok işlevli ekranlar, HUD camı, kafa hareketi. | Kokpitten uçulabiliyor. | |
| V1.85 | **Telefon ve kayıt.** Eğerek uçma (jiroskop) ve kalibrasyon, titreşim geri bildirimi. Misafir kaydını dosyayla yedekleme (hesaplılar zaten bulutta). Android paketi hazırlığı (TWA/Capacitor). | Telefon eğilerek uçuyor; yedek başka cihazda açılıyor. | |

### Faz 10 — Model yenileme
| Sürüm | İçerik | Durum |
|---|---|---|
| V1.86+ | Uçak modellerini fotoğraf benzerliğinde yenileme serisi: KAAN → ANKA-3 → Akıncı → TB3 → Hürjet → diğerleri; her modelden sonra onay | |

### Android yolu
1. PWA (V1.20 ✅) → 2. Play Store için TWA paketi (Bubblewrap) veya Capacitor → 3. imzalama, mağaza görselleri, gizlilik politikası.

## A. Online çok oyunculu (lobi, LAN / internet, arkadaşlarla)

### Hedef
Lobi kurulur, arkadaşlar oda koduyla katılır; LAN'da ya da internetten, sınırlı oyuncu sayısıyla (öneri: **2–8**) aynı haritada uçulur.

### Temel karar: mimari
| Seçenek | Artı | Eksi | Öneri |
|---|---|---|---|
| **WebRTC P2P** (eşler arası, küçük sinyal sunucusu) | Sunucu maliyeti çok düşük, LAN'da hızlı | Ev sahibi (host) uçarken oyunu da yönetir; NAT sorunları (TURN gerekebilir); hile kolay | Prototip / arkadaş oyunu |
| **Yetkili sunucu (Node.js + WebSocket, ör. Colyseus)** | Adil, hile zor, sağlam; LAN ve internet aynı kod | Sunucu barındırma gerekir (Fly.io / Render / VPS) | **Asıl hedef** |

GitHub Pages yalnızca statik dosya sunar; oyun sunucusu ayrı barınmalıdır. İstemci (bu oyun) Pages'te kalır, sunucu adresine WebSocket ile bağlanır.

**LAN:** Tarayıcı ağı tarayamaz. Çözüm: aynı sunucu programı bilgisayarda çalışır (`node server.js`), ekranda `192.168.x.x:port` ve 4 haneli oda kodu gösterir; arkadaşlar bu adresi/kodu girer. İsteğe bağlı: masaüstü paket (Tauri/Electron) ile tek tık "Oda aç".

### Aşamalar (göreli efor: S ≈ günler, M ≈ 1–2 hafta, L ≈ haftalar)
| # | Aşama | İçerik | Efor |
|---|---|---|---|
| M0 | **Hazırlık / refactor** | Tek dosyayı modüllere böl (derleme: Vite). Simülasyonu çizimden ayır; sabit adımlı (60 Hz) güncelleme; tohumlu rastgele sayı (mulberry32 zaten var) — tüm `Math.random` oyun mantığından çıkar | M |
| M1 | **Ağ çekirdeği** | Sunucu iskeleti, bağlan/ayrıl, oda kodu, lobi (isim, uçak seçimi, hazır), sürüm uyumu kontrolü (`VERSION` eşleşmezse reddet) | M |
| M2 | **Uçak senkronu** | Oyuncu girdisi → sunucu, durum (konum, yön, hız, gaz) 20 Hz yayın; istemci tahmini + enterpolasyon; hayalet uçak modelleri | M–L |
| M3 | **Savaş senkronu** | Top mermisi, bomba, füze, flare, hasar/can, yerdeki hedefler ve SAM'lar sunucuda; vuruş doğrulaması sunucuda | L |
| M4 | **Oyun modları** | İşbirlikçi görev (birlikte hedef vur), halka yarışı, takım DM; skor tablosu, yeniden doğma | M |
| M5 | **Cilalama** | Gecikme/kayıp testi, yeniden bağlanma, sohbet/ping, ses, mobil dokunmatik uyumu, hile önlemleri (hız/konum sınırı, istek sınırlama) | M |
| M6 | **Yayın** | Sunucu barındırma, alan adı, izleme, kötüye kullanım koruması, isteğe bağlı hesap/lider tablosu | S–M |

### Oyun tasarımı notları
- Önce **işbirlikçi (PvE)**: yapay zekâ düşmanı olmadan bile yer hedefleri/SAM herkes için ortak; hile ve adalet sorunu en az.
- PvP için hasar/füze kilidi sunucuda hesaplanmalı; flare ve savunma batarya mantığı (V1.00'daki güvenli bölge) sunucuya taşınır.
- Oyuncu sayısı 8'in üstüne çıkarsa ilgi alanı filtresi (yakındaki nesneleri gönder) gerekir.
- Bant genişliği tahmini: oyuncu başına ~30 bayt × 20 Hz ≈ 1 KB/sn; 8 oyuncu rahat.

### Riskler
- Mevcut kod tek dosya ve küresel durum (`S`, `INV`) kullanıyor → M0 yapılmadan çok oyunculu eklemek zor.
- Fizik tarayıcıda `dt`'ye bağlı; sabit adıma geçilmezse sunucu/istemci sapar.
- Barındırma maliyeti ve kötüye kullanım; kayıt/hesap eklenirse gizlilik (KVKK) gereği.

### Karar gerekenler
1. Azami oyuncu sayısı? (öneri 8)  2. Önce işbirliği mi, PvP mi?  3. Hesap/giriş gerekli mi, yoksa sadece takma ad + oda kodu mu?  4. Sunucu bütçesi (ücretsiz katman / aylık VPS)?  5. Masaüstü "LAN sunucusu" paketi istiyor musun?

## B. Oyun içi yol haritası (sıra: küçük → orta → büyük)
**Orta (sıradaki):** gün/saat ve hava durumu · iniş rehberi · eğitim görevi · kanat adamı yapay zekâsı
**Büyük:** düşman uçaklar (hava savaşı) · gemiden kalkış · kokpit içi görünüm · daha büyük harita
**Envanter:** yer tutucu silahlar, gerçek envanter listesi verilince değiştirilecek.

## Sürümleme kuralı
Her güncelleme → yeni sürüm (V1.01, V1.02 …; büyük kilometre taşı V2.00). Online çalışma başlayınca istemci–sunucu sürümü eşleşmek zorunda.
