#!/usr/bin/env python3
"""Sürüm geçmişi (V2.40): CHANGELOG.md'deki bütün sürümleri dönemlere ayırır, her dönemin kısa özetiyle
docs/SURUM-GECMISI.md'yi yazar. Dönem sınırları ve özetler bu dosyada; yeni sürümler son döneme kendiliğinden eklenir.
Kullanım: python3 tools/surumler.py   (yayın betiği de çalıştırır)"""
import os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
# (ilk sürüm, son sürüm, ad, özet)
DONEM = [
 ('V1.00', 'V1.11', 'Temel', 'KAAN ile ilk uçuş; uçak seçimi, art yakıcı, silah yükü, bakım hangarı, kanat adamı (Kılıç 2) ve Kırmızı Kuvvet düşman uçakları.'),
 ('V1.20', 'V1.24', 'Menü ve ayarlar', 'Ana menü, uçak seçimi, ayarlar ekranı ve çok oyunculu oyunun ilk adımları.'),
 ('V1.30', 'V1.38', 'Grafik ve ilk dünya', 'Gökyüzü, güneş gölgeleri, gerçekçi malzemeler; havalimanı, bakım ve bekleme hangarları; birinci şahıs yürüyüş, 3B model altyapısı ve Model Kütüphanesi; ayrıntılı KAAN.'),
 ('V1.39', 'V1.50', 'Ada büyüyor', 'Deniz ve kara üsleri, Hilalkent, Hilal Marina, köyler ve santraller, hava savunma mevzileri, Anadolukent ve Hilal Köprüsü, İHA ve test merkezi, Kızıl Bölge, simge yapılar.'),
 ('V1.51', 'V1.56', 'Oynanış ve kontroller', 'SAM, serbest modda düşmanlar; kontrol şemaları, tuş atama, oyun kolu, dokunmatik; harita ve ışınlanma; kara araçları ve helikopterler.'),
 ('V1.57', 'V1.65', 'Grafik ayarları, ses, arayüz', 'Grafik ayarları ve hazır kalite seviyeleri, ses kütüphanesi, oyunun kendi müziği, telsiz (kule, AWACS, kanat adamı), sesli sohbet, yeni tasarım sistemi ve erişilebilirlik.'),
 ('V1.66', 'V1.75', 'Hesap, kariyer, canlı dünya', 'Bulut hesabı ve profiller, rütbe ve tecrübe puanı, yönetim paneli; bütün kara ve deniz araçlarına binme, araç çağırma, helikopter görevleri; hasar, yakıt, hava durumu, hava trafiği ve yayalar.'),
 ('V1.76', 'V1.83', 'Görevler ve modlar', 'Görev panosu ve brifing, dinamik görevler, uçuş okulu, başarımlar ve günlük görevler, yarışlar, görev editörü, karma çok oyunculu ve üs ele geçirme.'),
 ('V1.84', 'V1.92', 'Konfor, kokpit, telefon', 'Uçuş konforu, Sistem Envanteri, tekrar izleme ve fotoğraf, gerçekçi performans, 3B kokpit, Android hazırlığı, eğerek uçuş, yeni hangar ve menüler, ehliyet ve sertifikalar.'),
 ('V1.93', 'V2.01', 'Bulut, Harekât, paketleme', 'Bulut hesapları, akıllı performans ve FPS sınırı, oyuncu kartı, İHA sınavları, görüntü sorunu testi, Harekât: Kızıl Elma, kara ve deniz görevleri, haritaya işaret, uygulama olarak yükleme.'),
 ('V2.02', 'V2.11', 'Ekranlar ve uçuş', 'Dokunmatik 2.0 ve düzen düzenleyici, yeni görev ekranı, park etmiş her araca binme, akrobasi, füzeden kaçış, Optimizasyon 2.0, oyunda sürüm notları, kanat adamına emir, model altyapısı.'),
 ('V2.12', 'V2.27', 'Düzen: ölçüm ve optimizasyon', 'Gerçek cihazda performans testi; parça birleştirme, Gölge 2.0, doku belleği, açılış hızı ve yükleme ekranı 2.0, arazi ayrıntı kademeleri, Grafik ayarları 2.0, ayarların gözden geçirmesi, kanca sistemi, kod düzeni, tek kayıt ve yedek, girdi yöneticisi.'),
 ('V2.28', 'V2.35', 'Oyuncu istekleri ve telefonda 60 FPS', 'Gölge titremesi, MSAA, müzik ara ara, TEKER düğmesi; Hızlı Oyun ve Kariyer menüsü, Hızlı Savaş; mühimmat yerleşimi ve zemine gömülme; testler 13 → 2 dakika ve bütçe kapısı; telefon raporlarıyla uçuşta 60 FPS.'),
 ('V2.36', 'V2.40', 'Envanter, sadeleştirme, belgeler', 'Özellik envanteri ve oyunda Rehber, tek Sorun giderme ekranı, 23 ekranın 4 boyutta denetimi, Yükleme ekranı 3.0, TP dengesi ve terim sözlüğü, belgelerin birleştirilmesi.'),
 ('V2.41', 'V9.99', 'Model yenileme serisi', 'Uçak, helikopter, kara ve deniz araçlarının gerçek ölçülerle yeniden yapılması; her uçağın gerçek Türk mühimmatı.'),
]
def vnum(v): a, b = v[1:].split('.'); return int(a) * 100 + int(b)
c = open(os.path.join(ROOT, 'CHANGELOG.md'), encoding='utf-8').read()
V = [(m.group(1), m.group(2), (m.group(3) or '').strip()) for m in re.finditer(r'^## (V\d+\.\d+) — (\S+)(?: · ([^\n]+))?$', c, re.M)]
V.sort(key=lambda x: vnum(x[0]))
L = ['# Sürüm geçmişi', '', 'Bütün sürümler dönemlere ayrılmış hâlde. Her sürümün ayrıntısı [CHANGELOG.md](../CHANGELOG.md) dosyasında; bu sayfa `python3 tools/surumler.py` ile üretilir.', '',
     '**%d sürüm** · %s → %s · ilk sürüm %s, son sürüm %s' % (len(V), V[0][0], V[-1][0], V[0][1], V[-1][1]), '', '## Dönemler', '', '| Dönem | Sürümler | Sayı | Özet |', '|---|---|---|---|']
groups = []
for a, b, n, oz in DONEM:
    G = [v for v in V if vnum(a) <= vnum(v[0]) <= vnum(b)]
    groups.append((n, G, oz))
    if G: L.append('| **%s** | %s–%s | %d | %s |' % (n, G[0][0], G[-1][0], len(G), oz))
left = [v for v in V if not any(v in g[1] for g in groups)]
assert not left, 'dönemi olmayan sürüm: %s' % [v[0] for v in left]
for n, G, oz in reversed(groups):
    if not G: continue
    L += ['', '## %s (%s–%s)' % (n, G[0][0], G[-1][0]), '', oz, '']
    for v, d, t in reversed(G): L.append('- **%s** · %s%s' % (v, d, (' · ' + t) if t else ''))
open(os.path.join(ROOT, 'docs', 'SURUM-GECMISI.md'), 'w', encoding='utf-8').write('\n'.join(L) + '\n')
print('sürüm:', len(V), 'dönem:', sum(1 for g in groups if g[1]))
