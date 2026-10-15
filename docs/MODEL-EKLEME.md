# Yeni araç / model ekleme (V2.10)

Oyuna yeni bir uçak eklemek tek bir çağrıdır. Hangar, model kütüphanesi, görev panosu, yürürken binme, çarpışma kutuları ve envanter kartı bu listelerden okunduğu için başka bir yere dokunmak gerekmez.

## 1. Kodla tanım (`src/js/modeller/` içinde yeni bir dosya; `src/js/SIRA.txt` listesine `modeller/model-kaydi-api.js`'den sonra ekleyin)

```js
defineAircraft('hurjet2', {
  name: 'TUSAŞ Hürjet Blok 2', short: 'HÜRJET-2', kind: 'Hafif taarruz',
  like: 'hurjet',                 // uçuş değerleri bu uçaktan kopyalanır
  flight: { airV: 200, vTop: 330 }, // istediğin değerleri değiştir
  len: '13,3 m', span: '9,8 m',     // gerçek ölçüler (ölçü denetimi bunlarla karşılaştırır)
  grp: 'hava', cls: 'egitim', maker: 'TUSAŞ',
  lic: 'jet',                     // kariyerde gereken belge
  rank: 4,                        // kariyerde açılan rütbe (isteğe bağlı)
  env: 'HÜRJET',                  // Defence Turk envanterindeki kayıt adı (veri kartı)
  build: AIRCRAFT.hurjet.build,     // kod modeli (burada Hürjet'inki); ya da:
  // glb: 'assets/models/hurjet2.glb', rotation: [0, 0, 0]
});
```

- **`like`**: uçuş fiziği, silahlar, ses ve kamera bu uçaktan alınır; `flight` ile tek tek değiştirilir.
- **`glb`**: kod modeli yerine dosya kullanılır. Model gerçek uzunluğa göre ölçeklenir. Yön ve parça görevleri için `docs/MODELLER.md`'ye bak.
- Tanımlanan uçak hemen hangarda, kütüphanede ve "Gerçek veriler" kartında görünür. Dünyada park hâlinde bir kopyası varsa yürüyerek binilebilir ve çarpışır.

## 2. Ölçü denetimi

**Ayarlar → Grafik → Model ölçü denetimi** her modelin uzunluğunu ve kanat açıklığını ölçer, gerçek değerlerle karşılaştırır. ±%8 dışındakiler ⚠ ile işaretlenir. Yeni bir model eklendikten sonra buradan kontrol et.

## 3. Kod yazmadan model (.glb, .fbx, .obj …)

Model Kütüphanesi → Model → İçe aktar. Dosya otomatik .glb'ye çevrilir ve **gerçek uzunluğa** ölçeklenir. Ardından yön, yükseklik ve parçalar (iniş takımı, pervane, dümenler) ayarlanır. Yönetim → İçerik → Yayınla ile bütün oyunculara gönderilir. Ayrıntı: `docs/MODELLER.md`.

## 4. Kontrol listesi (her yeni model için)

1. Gerçek ölçüler (uzunluk, açıklık) ve kaynak (Defence Turk veri kartı) girildi mi?
2. Ölçü denetiminde ✓ çıkıyor mu?
3. Kütüphanede iniş takımı, motor, silah ve kumanda yüzeyi testleri çalışıyor mu?
4. Hangarda doğru grup ve sınıfta mı, kariyer belgesi ve rütbesi doğru mu?
5. Bir test uçuşu: kalkış, iniş, silah.
