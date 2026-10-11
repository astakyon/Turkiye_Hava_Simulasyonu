# Değişiklik Günlüğü — Ay Yıldız: Hedef Kızıl Elma
Biçim: `## Vx.xx — tarih`. Her güncellemede sürüm numarası artırılır (`bump_version.py`).

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
