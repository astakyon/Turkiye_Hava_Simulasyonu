# Gözden geçirme raporu — V2.06 (13 Ekim 2026)

Bütün ana ekranlar telefon (Pixel 7, yatay) ve bilgisayar (1280×720) boyutunda açılıp tek tek kontrol edildi. Ayrıca otomatik testlerin hepsi çalıştırıldı.

## Bulunan ve düzeltilen sorunlar

| Ekran | Sorun | Çözüm |
|---|---|---|
| Hangar (telefon) | Uçak adı ve bilgi bloğu, sınıf filtreleriyle (Tümü, Savaş uçağı…) üst üste biniyordu | Kısa ekranlarda sınıf filtreleri "Ana menü" düğmesinin yanına, tek satıra alındı (kaydırılabilir); boya seçimi yalnız renk noktalarıyla gösteriliyor; başlık küçültüldü |
| Duraklatma menüsü (telefon) | Düğmeler ekrana sığmıyor, en alttakiler görünmüyordu | Telefonda iki sütunlu düzen; "Devam et" tam genişlikte en üstte |
| Harita | Yer adları sağdaki liste panelinin üstüne taşıyordu | Panel öne alındı ve opaklaştırıldı |
| Görev ekranı | Filtreler listeyle üst üste biniyordu | V2.03'te yeniden tasarlandı |
| Kanat adamı | Hedef olarak oyuncuyu seçebiliyordu (V2.00 hazırlığında, yayından önce testte yakalandı) | Ad çakışması giderildi; testlere aynı adlı iki üst düzey tanımı yakalayan denetim eklendi |
| Kariyer TP'si | V1.98'de madalya tanımı eksikti, puan kazanılınca hata oluşuyordu | V1.99'da düzeltildi; yayın betiği artık testlerden biri başarısız olursa yayını durduruyor |
| Telefon siyah dalgaları | Bilgisayardaki grafik ayarları (gölge/efekt) buluttan telefona geliyordu | V1.97'den beri grafik ayarları her cihazda ayrı |

## Eklenenler

- **Sesli sohbet:** açık mikrofon seçeneği (tuşa basmadan konuşma) ve sesli sohbet ses düzeyi (çok oyunculu pencerede).

## Kontrol edilip sorunsuz bulunanlar

Ana menü (Başla, Hızlı oyun, Kariyer), giriş ekranı, oyuncu kartı ve sekmeleri, ehliyet ekranı, harekât ekranı, yürüme ve araç arayüzü, dokunmatik kumandalar ve düzenleyici, işaret çarkı, iniş göstergesi, duyuru şeridi.

## Ölçümler

- Uçuşta çizilen üçgen sayısı: V1.93'te 1,57 milyon → V1.94'ten beri yaklaşık 0,8 milyon. Yürürken 1,0 milyon → 0,4 milyon.
- Otomatik testler: 70'ten fazla test dosyası, hepsi geçiyor.

## Sonraki adımlar

Akrobasi (V2.07), füzeden kaçış (V2.08), kanat adamı komutları (V2.09), model altyapısı (V2.10–2.11) ve model yenileme serisi (V2.12–2.20).
