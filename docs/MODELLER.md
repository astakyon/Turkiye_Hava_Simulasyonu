# 3B modeller (.glb / .gltf)

Oyundaki her araç önce **kodla** çizilir. İstersen bir aracı gerçek bir 3B modelle "giydirebilirsin": model yüklenince
oyuncunun uçağı, hangardaki kopyası ve yapay zekâ uçakları otomatik olarak yeni modeli kullanır. Model yüklenemezse
(dosya yok, internet yok, hata) oyun hiçbir şey olmamış gibi kod modeliyle devam eder.

## 1. Hızlı deneme (kod yazmadan)
1. Oyunda uçağı seç.
2. **Ayarlar → Grafik → 3B model dene → Dosya seç** (ya da .glb dosyasını oyun sayfasına sürükle-bırak).
3. Model ters veya yan duruyorsa **Döndür 90°** ile düzelt.
4. Ayarlar satırında, `models.json`'a yazman gereken satır hazır olarak görünür.

Bu deneme yalnızca o oturum içindir; sayfa yenilenince kalkar.

## 2. Kalıcı ekleme
1. Dosyayı `assets/models/` klasörüne koy (ör. `assets/models/kaan.glb`).
2. `assets/models.json` içinde `models` altına aracın kimliğiyle bir kayıt ekle:

```json
{
  "models": {
    "kaan": { "file": "assets/models/kaan.glb", "rotation": [0, 0, 0] }
  }
}
```

Araç kimlikleri: `kaan`, `anka3`, `hurjet`, `hurkus`, `anka`, `aksungur`, `kizilelma`, `tb2`, `tb3`, `akinci`.
`_` ile başlayan kayıtlar (ör. `_ornek_kaan`) yok sayılır, örnek olarak duruyor.

3. `python3 bump_version.py V1.xx "KAAN modeli"` → commit → push. (Önbellek sürümle yenilendiği için oyuncular yeni modeli alır.)

> Modeller yalnızca sunucudan açıldığında yüklenir (GitHub Pages, `python3 -m http.server`, Android uygulaması).
> `index.html` dosyasını çift tıklayıp açınca (`file://`) tarayıcı güvenlik nedeniyle modeli okumaz.

## Alanlar
| Alan | Anlamı | Varsayılan |
|---|---|---|
| `file` | .glb/.gltf yolu (zorunlu) | — |
| `rotation` | Derece cinsinden [x, y, z] döndürme; modelin burnu **−Z**'ye, üstü **+Y**'ye bakmalı | `[0,0,0]` |
| `length` | Uçağın gerçek boyu (m). Model bu boya ölçeklenir | kod modelinin boyu |
| `scale` | Ölçeği elle vermek istersen (`length` yerine) | otomatik |
| `offset` | [x, y, z] metre kaydırma (tekerlek yerden yüksek/alçaksa) | `[0,0,0]` |
| `gearNodes` | İniş takımı parça adları; takım toplanınca gizlenir. Verilmezse kodun iniş takımı kullanılır | — |
| `propNodes` | Pervane parça adları; motorla kendi Z ekseni (uçuş yönü) etrafında döner. Verilmezse kodun pervanesi kalır | — |
| `surfaces` | Hareketli yüzeyler: `{"node":"aileron_L","axis":"x","input":"roll","max":18,"sign":-1}`; `input`: `pitch`, `roll`, `yaw` | — |
| `flames` | Motor alevlerinin konumları [[x,y,z], …] (model koordinatında, ölçek sonrası metre) | kod modelindeki yerler |

Seyir ışıkları, flaşör, motor alevi ve asılı silahlar kod modelinden gelmeye devam eder.

## Modeli hazırlama (Blender)
- **Birim:** metre. **Yön:** oyunda burun −Z, üst +Y olmalı. Blender'da burnu **+Y** yönüne, üstü +Z'ye çevir ve dışa aktarırken "+Y Up" seçili kalsın; glTF'de burun −Z olur. Yine de ters çıkarsa `rotation` ile düzelt.
- **Orijin:** gövdenin ortası; ölçek ve konum yine otomatik ayarlanır, kabaca doğru olması yeter.
- **Malzemeler:** Principled BSDF (glTF'de MeshStandardMaterial). Gökyüzü yansıması otomatik eklenir.
- **Parça adları:** hareket edecek parçaları ayrı nesne yap ve adlandır (`gear_nose`, `gear_main_L`, `prop`, `aileron_L`, `elevator_L`, `rudder_L` …).
  Döndürme ekseni parçanın kendi orijininden geçer — menteşe çizgisine yerleştir.
- **Boyut (telefon için):** model başına ~20–50 bin üçgen, dokular en çok 2048 px, dosya 1–3 MB.
- **Sıkıştırma:** Draco destekleniyor. Örnek: `npx gltf-transform optimize kaan.glb kaan-opt.glb --compress draco --texture-compress webp`.

## Lisans
Kullanacağın her modelin lisansı ticari kullanıma ve değiştirmeye izin vermeli (oyun Android'de yayınlanacak).
CC-BY modellerde yazar adı gerekir. Her dosyayı kaynağı ve lisansıyla `THIRD_PARTY.md` tablosuna ekle.
