# Değişiklik Günlüğü — Ay Yıldız: Hedef Kızıl Elma
Biçim: `## Vx.xx — tarih`. Her güncellemede sürüm numarası artırılır (`bump_version.py`).

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
