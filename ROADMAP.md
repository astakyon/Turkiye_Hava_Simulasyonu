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

## Kalite, ses, görev ve arayüz yol haritası (V1.57–V1.70) — modellemelerden önce
| Sürüm | İçerik | Durum |
|---|---|---|
| V1.57 | Telefonda siyah dalgalanma düzeltmesi: cihaz profili (Telefon/PC), mobilde logaritmik derinlik yerine güvenli derinlik, gölge sapması ve hassasiyet ayarı, sorunlu efektleri mobilde kapatma; Ayarlar'da "Grafik tanılama" (GPU, çözünürlük, FPS, etkin özellikler) | |
| V1.58 | PC görüntü kalitesi: pikselleşmeye yol açan otomatik çözünürlük düşürmenin yerine akıllı ölçek (PC'de alt sınır, kademeli), kenar yumuşatma iyileştirmesi, doku filtreleme (anizotropik + mipmap), titremeyen gölge (sabitlenmiş gölge kamerası), ince parçalarda (çit, tel, anten) saçaklanma azaltma | |
| V1.59 | Performans: uzak üs ve şehirlerde ayrıntı seviyesi (LOD) ve görüş mesafesi, örnekleme (instancing), gölgeyi yalnız yakına, hazır ayarlar Düşük / Orta / Yüksek / Ultra; hedef PC'de 60, telefonda 50+ FPS | |
| V1.60 | Ses altyapısı + **Ses Kütüphanesi**: kanallar (Ana, Müzik, Efekt, Arayüz, Telsiz, Ortam) ayrı ses düzeyleri; duruma göre karışım (menüde motor/rüzgâr sesi susar); kategoriler: Motor, Silah, Çevre, Arayüz, Müzik, Telsiz; dinle, değiştir, kendi ses dosyanı yükle (cihazda saklanır) | |
| V1.61 | Müzik ve arayüz sesleri: ana menü müziği, oyunda duruma göre değişen müzik (sakin / çatışma / zafer), düğme, geçiş, bildirim sesleri | |
| V1.62 | Telsiz: kule konuşmaları (kalkış/iniş izni, rüzgâr, pist), kanat adamı ve AWACS anonsları, telsiz filtresi; çok oyunculu bas-konuş sesli sohbet ve hazır telsiz mesajları | |
| V1.63 | Tüm araçlara binme: askerî kamyon, itfaiye (su topu), otobüs, yakıt tankeri, uçak çekici (uçağı çekebilme), Altay/Pars/Kirpi/Fırtına (taret döndürme ve atış), hücumbot ve gemiler (deniz şeması); her araca özgü sürüş, kamera ve HUD | |
| V1.64 | Araç çağırma: "Araç çağır" menüsünden (klavye, gamepad, dokunmatik) istenen aracı bulunduğun yere ya da haritadaki bir noktaya getir; suda bot, havalimanında uçak çekici gibi yere uygun öneriler | |
| V1.65 | Helikopterler hangarda: T129 ve T625 hangarda seçilebilir; görevlerde ve serbest uçuşta helikopterle oynama, T129 silahları (20 mm top, roket, UMTAS), T625 ile yük ve asker taşıma | |
| V1.66 | **Görev ekranı**: görev panosu (liste, brifing, harita, hedefler, ödül, zorluk), oyun içi hedef takibi ve görev günlüğü (J) | |
| V1.67 | Dinamik görevler: yerlere göre üretilen görevler (devriye, önleme, yakın hava desteği, refakat, keşif İHA, T625 ile arama-kurtarma/yük, deniz devriyesi); görev ortasında olaylar, çok aşamalı hedefler, yıldız/puan, kariyer ilerlemesi | |
| V1.68 | Arayüz tasarım sistemi + **yeni ana menü**: tek görsel dil (renk, yazı, düğme, kart, ikon), büyük ana ekran (Kariyer / Görevler / Serbest Uçuş / Çok Oyunculu / Hangar / Kütüphaneler / Ayarlar), gamepad ve klavyeyle gezinme, geçiş animasyonları | |
| V1.69 | Hangar ve mühimmat yükleme: uçak seçimi kart/karusel, performans çubukları, karşılaştırma; silah istasyonlarını gösteren yükleme ekranı, hazır yükler (Hava-hava / Kara taarruz / Keşif), ağırlık ve uyum göstergesi | |
| V1.70 | Ayarlar menüsü: sekmeler (Grafik, Ses, Kontroller, Oynanış, Arayüz, Erişilebilirlik), arama, açıklama ve önizleme, uygula / geri al, hazır ayarlar | |
| sonra | Uçak modellerini yenileme serisi (KAAN → ANKA-3 → …), her modelden sonra onay | |

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
