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
| 4 | V1.24 | Ada/çevre: arazi dokuları, köy/yol/sahil, deniz yansıması, ağaç çeşitliliği, mesafeye göre detay | |
| 5 | V1.25 | Uçak detayları: fotoğraflara yüksek benzerlik, panel çizgileri, çıkartmalar, ışıklar, takım ve kumanda yüzeyi animasyonu | |
| 6 | V1.3x | Gerçek silah envanteri, yeni hava araçları; sonra Mavi Kanatlar (deniz) ve kara sistemleri | |

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
