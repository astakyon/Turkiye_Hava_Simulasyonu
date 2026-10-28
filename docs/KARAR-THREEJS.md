# Karar raporu: three.js sürümü (V2.31)

**Durum:** oyun three.js **r128** (Mart 2021) ile çalışıyor; dosyalar `vendor/three-r128` içinde, tek dosyalık yapı (`three.min.js` + ek betikler).
**Soru:** güncel sürüme geçelim mi?
**Karar senin.** Bu rapor seçenekleri ve maliyetlerini anlatıyor.

## Güncel sürümün getirdikleri
| Özellik | Bize faydası |
|---|---|
| **BatchedMesh** (r159+) | Farklı şekilli ama aynı malzemeli parçalar tek çizimde. Şehirler ve üsler için şu anki birleştirme ve pişirme işinin büyük kısmı kendiliğinden çözülür. Çizim sayısı tahminen %30–50 azalır. |
| **Paralel / asenkron shader derleme** (`compileAsync`, KHR_parallel_shader_compile) | Açılıştaki shader ısıtma ana iş parçacığını kilitlemez. Telefonda yükleme ekranındaki takılmalar azalır. |
| **WebGPU oluşturucu** (deneysel → olgunlaşıyor) | Android'de Vulkan üzerinden daha düşük CPU maliyeti. Uzun vadeli seçenek. |
| Renk yönetimi, fiziksel ışık birimleri | Daha doğru renkler. Ama bizim için bu bir **maliyet** (aşağıda). |
| Hata düzeltmeleri, daha iyi GLTF yükleyici | Model kütüphanesinde daha çok dosya sorunsuz açılır. |

## Geçişin maliyeti
1. **Modül yapısı:** r160'tan beri tek dosyalık `three.min.js` yok, yalnız ES modülleri var. Bizim tek HTML dosyalık yayınımız için bir paketleyici (esbuild gibi) gerekir. `tools/build.py` bunu çağıracak şekilde değişir. Çevrimdışı çalışma ve `sw.js` önbelleği yeniden denenir.
2. **Işık ve renk:**
   - r152'den itibaren renkler sRGB olarak yönetiliyor, r155'ten itibaren ışık şiddetleri fiziksel birimlerde.
   - Oyunun bütün renkleri, güneş, gökyüzü ve boya paleti bugünkü görünümü tutturmak için yeniden ayarlanmalı.
   - Bu, en çok emek isteyen ve en çok gözle denetlenecek kısım.
3. **Kaldırılan API'ler:**
   - `WebGLMultisampleRenderTarget` artık yok (yerine `samples`).
   - EffectComposer ve geçişler yeni yollarında.
   - Bazı malzeme ve doku alanları değişti.
   - Oyunda bunlara dokunan yaklaşık 15–20 modül var.
4. **Test ortamı:** sahte THREE ortamı (`tests/harness.js`) yeni API'ye göre güncellenir.

**Tahmini iş:** 2–3 sürüm. Önce yalnızca derleme ve paketleme; sonra ışık ve renk ayarı (ekran görüntüleriyle karşılaştırarak); en son BatchedMesh ve asenkron derlemeyi kullanmaya başlamak.

## Seçenekler
- **A — Şimdilik r128'de kal (önerim).** Oyun bugün telefonda 60 FPS yakalıyor. Takılmaların kaynağı henüz ölçülüyor. Model serisi (V2.38+) r128 ile yapılabilir. Geçişi model serisinden sonraya, ayrı bir "Motor yenileme" dönemine bırakırız.
- **B — Model serisinden önce geç.** Yeni modeller baştan BatchedMesh'e uygun yapılır. Ama model serisi 2–3 sürüm gecikir ve ışık ve renk ayarı modellerle aynı anda değişir (karşılaştırması zor).
- **C — Doğrudan WebGPU'ya hazırlan.** En büyük kazanç, en büyük risk. Tarayıcı desteği ve three.js'in WebGPU oluşturucusu olgunlaştıkça yeniden değerlendirilir.

Not: bu rapordaki sürüm numaraları Haziran 2026 bilgisine dayanıyor. Geçiş kararı verilirse önce güncel sürüm notları yeniden okunur.
