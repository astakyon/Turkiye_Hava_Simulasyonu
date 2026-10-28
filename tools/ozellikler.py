#!/usr/bin/env python3
"""Özellik envanteri (V2.36): oyundaki her özelliğin kartı tek yerde.
Bu dosyadan iki çıktı üretilir:
  docs/OZELLIKLER.md            — geliştirici ve karar listesi
  src/js/veri/rehber-veri.js    — oyundaki "Rehber" ekranının verisi
Kullanım: python3 tools/ozellikler.py   (yayın betiği de çalıştırır)
Durum: iyi · iyileştirilmeli · birleştirilmeli · kaldırılmalı · denenmeli (gerçek oyunda/cihazda doğrulanmadı)
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(__file__), '..')
T = lambda *a: list(a)
# kat, ad, ne yapar, nereden açılır, tuş/düğme, ilk sürüm, testler, durum, not (durum gerekçesi / öneri)
F = [
 # ---- Uçuş
 ('Uçuş','Uçak seçimi ve hangar','On Türk uçağı ve İHA arasından seçim; hangarda 3B inceleme, boya, performans çubukları ve karşılaştırma.','Hızlı Oyun → Serbest Uçuş / Sürüş · Kariyer → Hangar','—','V1.24',T('picker','menu3'),'iyi',''),
 ('Uçuş','Uçuş modeli','Gaz, art yakıcı, fren, iniş takımı; uçağa göre gerçek hız, tırmanma ve servis tavanı.','Her uçuşta','W/S/A/D · Q/E · R/F · Shift · B · G','V1.02',T('features','realperf'),'iyi',''),
 ('Uçuş','Taksi ve kalkış','Hangardan piste taksi, otomatik taksi ve taksiyi atlama; kule izni.','Başlangıç yeri: Hangardan','T otomatik taksi · L taksiyi atla','V1.00',T('taxi','hangar_taxi','airport'),'iyi',''),
 ('Uçuş','İniş yardımı','Piste yaklaşırken süzülüş ve merkez hattı göstergesi, istenirse otomatik iniş.','Ayarlar → Uçuş → Uçuş yardımı','—','V1.96',T('assist'),'iyi',''),
 ('Uçuş','Uçuş konforu','Otomatik denge, türbülans ayarı, kare süresi yumuşatma.','Ayarlar → Uçuş','—','V1.84',T('comfort'),'iyi',''),
 ('Uçuş','3B kokpit','Çalışan çok işlevli ekranlar, kafa hareketi.','Uçuşta kamera değiştir','C','V1.89',T('cockpit'),'iyi','Tıklanabilir kokpit düğmeleri yol haritasının sonundaki fikirlerde.'),
 ('Uçuş','Akrobasi','Akrobasi dumanı, figür tanıyıcı ve akrobasi gösterisi görevi.','Görevler · uçuşta duman','F6 duman','V2.07',T('acro'),'iyi',''),
 ('Uçuş','Hasar, yakıt ve fırlatma koltuğu','Parça hasarı, yakıt tüketimi, ikmal-onarım, fırlatma koltuğu.','Her uçuşta','J (iki kez) fırlatma','V1.73',T('damage','service'),'iyi',''),
 ('Uçuş','Bakım hangarı','Yerde bakım hangarına girince silah yükleme ve onarım.','Üste bakım hangarı','—','V1.00',T('service'),'iyi',''),
 ('Uçuş','İHA uçuş bilgisayarı','İHA\'larda irtifa ve rota tutan uçuş bilgisayarı.','İHA ile uçarken','—','V1.96',T('uav','assist'),'iyi',''),
 # ---- Silah ve savaş
 ('Silah ve savaş','Silahlar ve yük ekranı','Top, 2 bomba ve 3 füze tipi; uçağa göre yük, hazır yük grupları.','Hangar → Yük · Bakım hangarı','Space top · X silah · N sıradaki · 1–5','V1.02',T('setup','features','v230'),'iyileştirilmeli','Mühimmat hâlâ yer tutucu (Füze-1, GP-82…). KARAR (29 Ekim): gerçek Türk mühimmatı model serisiyle birlikte, her uçağın modeliyle aynı sürümde.'),
 ('Silah ve savaş','Hedef kilidi','Füzeler için hedef kilidi, kilit uyarısı açılıp kapatılabilir.','Uçuşta','K kilit · Tab hedef değiştir','V1.02',T('features'),'iyi',''),
 ('Silah ve savaş','Düşman uçakları ve kanat adamı','Kırmızı Kuvvet savaş uçakları, yapay zekâ kanat adamı (Kılıç 2) ve ona emir verme.','Görev ekranı → düşman / kanat adamı','F8 kanat adamı emirleri','V1.10',T('ai','wing','enemy'),'iyi',''),
 ('Silah ve savaş','Hava savunma ve füzeden kaçış','SAM bataryaları, füze uyarısı, gerçekçi füze modeli, flare ve kaçış yardımı.','Görev ekranı → SAM','Z flare · F7 kaçış','V1.51',T('evade','enemy'),'iyi',''),
 ('Silah ve savaş','Gece görüş ve termal kamera','NVG ve FLIR görünümleri.','Uçuşta','` (Backquote)','V1.74',T('weather'),'iyi',''),
 # ---- Araçlar
 ('Kara ve deniz araçları','Yürüyüş','Birinci şahıs yürüme, koşma, zıplama, araçlara ve uçaklara binme.','Hızlı Oyun → Üssü Gez','WASD · Shift · Space · E bin','V1.34',T('walk','indoor'),'iyi',''),
 ('Kara ve deniz araçları','Kara araçları','Arabalar, tanklar, zırhlılar, itfaiye, uçak çekici; her birinin kendi sürüşü, turbo, park etmiş araçlara binme.','Yürürken araca bin · Araç çağır','W/S/A/D · Shift turbo · T araç değiştir','V1.54',T('vehicles','land','collide'),'iyi',''),
 ('Kara ve deniz araçları','Deniz araçları','Hücumbot, korvet, TCG Anadolu; makine telgrafı, dümen, gemi topları, helikopter güvertesi, kıyıya yanaşma.','Marina ve deniz üssü · Araç çağır','W/S hız · A/D dümen · Space top','V1.70',T('boats','naval','groundsea'),'iyi',''),
 ('Kara ve deniz araçları','Araç çağırma','Kara, hava ve deniz aracını bulunduğun yere teslim ettirme (lojistik telsizi).','Yürürken','G araç çağır','V1.71',T('call'),'iyi',''),
 ('Kara ve deniz araçları','Helikopterler','T129 ATAK ve T625 Gökbey: askı yükü, asker taşıma, kapı silahı, askı yardımı.','Hangar · üslerdeki helikopterler','R/F kolektif · B kanca · J askı yardımı','V1.55',T('heli','heliops'),'iyi',''),
 # ---- Dünya
 ('Dünya','Ada ve üsler','30 km\'lik ada: hava üssü, deniz üssü, kara üssü, İHA adası, marina, köyler, Hilalkent ve Anadolukent, Kızıl Bölge, simge yapılar.','Harita','M harita','V1.31',T('airport','naval','land','uav','marina','town','rural','south','military','landmarks'),'iyi',''),
 ('Dünya','Canlı dünya','Trafik, yayalar, yer personeli, hava trafiği, martılar, ortam sesleri.','Her yerde','—','V1.42',T('airlife','town'),'iyi',''),
 ('Dünya','Gün saati ve hava durumu','Gün/gece, sabah sisi, yağmur, kar, fırtına, rüzgâr ve türbülans.','Ayarlar → Dünya · görev ekranı','—','V1.46',T('daynight','weather'),'iyi',''),
 ('Dünya','Harita ve ışınlanma','Tam ekran harita, köşe haritası, yerler listesine ışınlanma, haritaya işaret ve işaret çarkı.','Uçuşta ve yürürken','M harita · F4 işaret','V1.53',T('map','comms'),'iyi',''),
 # ---- Görev ve modlar
 ('Görevler ve modlar','Hızlı Oyun','Kariyerden bağımsız: hemen başla, serbest uçuş/sürüş, hızlı görev, üssü gez. Her şey açık, puan kazandırmaz.','Ana menü → Hızlı Oyun','—','V1.82',T('menu2','menu3','v229'),'iyi',''),
 ('Görevler ve modlar','Hızlı Savaş','Botlara karşı havada başlayan dört mod: İt Dalaşı, Serbest Çatışma, Yer Taarruzu, Hava Hedefleri.','Ana menü → Hızlı Oyun → Hızlı Savaş','—','V2.29',T('v229'),'iyi',''),
 ('Görevler ve modlar','Görev panosu','Bütün görevler tek ekranda: uçak, helikopter, kara, deniz, yarış; brifing, hedef takibi, görev günlüğü, görev sonu raporu.','Kariyer → Görevler · Hızlı Oyun → Hızlı Görev','F2 görev günlüğü','V1.76',T('board','misui'),'iyi',''),
 ('Görevler ve modlar','Dinamik görevler','Her seferinde farklı, çok aşamalı görevler ve görev ortası olaylar; günlük ve haftalık görevler.','Görev panosu','—','V1.77',T('dynamic','progress'),'iyi',''),
 ('Görevler ve modlar','Harekât: Kızıl Elma','Sekiz bölümlük hikâyeli harekât; bölümler sırayla açılır, final madalya verir.','Kariyer → Harekât','—','V1.98',T('campaign'),'iyi',''),
 ('Görevler ve modlar','Yarışlar','Kapılı yarışlar, süre, hayalet ve sıralama tablosu.','Görev panosu → Yarışlar','—','V1.80',T('races'),'iyi',''),
 ('Görevler ve modlar','Görev editörü','Kendi görevini kur: aşamalar, tetikleyiciler, dene, kaydet ve paylaş.','Görev panosu → Editör','—','V1.81',T('editor'),'iyileştirilmeli','29 Ekim denemesi (telefon boyutu, dokunarak): hedef ve düşman yerleştirme, Dene çalışıyor. Ama editör zor bulunuyor (Görevler → Özel → en alttaki "＋ Yeni görev oluştur") ve Dene / Kaydet düğmeleri sağ panelin altında, kaydırmadan görünmüyor. V2.37\'de düzeltilecek.'),
 ('Görevler ve modlar','Kara ve deniz görevleri','Tank, araç ve gemi ile görevler.','Görev panosu','—','V1.99',T('groundsea'),'iyi',''),
 # ---- Kariyer
 ('Kariyer ve ilerleme','Rütbe ve tecrübe puanı','Er\'den Orgeneral\'e rütbeler, terfi töreni; rütbeyle açılan uçaklar, araçlar, görevler ve boyalar.','Ana menü → Kariyer','—','V1.67',T('career','progress'),'iyi',''),
 ('Kariyer ve ilerleme','Uçuş okulu','Adım adım dersler: kalkış, iniş, rüzgârlı iniş, helikopter, askı yükü, silah, gemiye iniş.','Kariyer → Eğitim','—','V1.78',T('school'),'iyi',''),
 ('Kariyer ve ilerleme','Ehliyet ve sertifikalar','İHA pilotu, pilot, tank sürücüsü, araç sürücüsü, kaptan belgeleri ve sınavları; belgesiz kullanım engeli.','Kariyer → Ehliyet ve Sertifikalar','—','V1.92',T('licenses'),'iyi',''),
 ('Kariyer ve ilerleme','Başarımlar, madalyalar, istatistikler','Başarımlar, madalyalar, uçuş istatistikleri, rekorlar.','Kariyer · üstteki kupa düğmesi','—','V1.79',T('progress'),'iyi',''),
 # ---- Çok oyunculu
 ('Çok oyunculu','Çevrimiçi oda','Sunucusuz P2P oda (en çok 4 kişi): işbirliği, takım savaşı, herkes herkese; boş yerleri botlar doldurur.','Ana menü → Çok Oyunculu','—','V1.24',T('net','net_ffa'),'denenmeli','29 Ekim denemesi: aynı bilgisayarda iki ayrı oyun sayfası (telefon boyutu) oda kurdu, katıldı, maç başladı, konumlar eşleşti (fark < 5 m), yazılı sohbet iki yönde çalıştı, hata yok. Bağlantı katmanı burada taklit edildi (PeerJS sunucusuna bu ortamdan erişilemiyor); internet üzerinden iki gerçek cihaz hâlâ denenmeli.'),
 ('Çok oyunculu','Karma çok oyunculu ve üs ele geçirme','Uçak, araç ve gemiler aynı maçta; üs ele geçirme modu; kule görevlisi rolü.','Çok Oyunculu → mod','—','V1.83',T('net_mix'),'denenmeli','Oda ve sohbet katmanı 29 Ekim\'de iki sayfayla doğrulandı; karma mod ve üs ele geçirme iki gerçek cihazla denenmeli.'),
 ('Çok oyunculu','Sesli ve yazılı sohbet','Bas-konuş sesli sohbet, yazılı sohbet, oyuncu çıkarma.','Çok oyunculu maçta','I bas-konuş · / sohbet','V1.62',T('net','comms'),'denenmeli','Yazılı sohbet 29 Ekim\'de doğrulandı. Sesli sohbet mikrofon ve gerçek bağlantı istiyor; yalnız iki gerçek cihazla denenebilir.'),
 # ---- Ses ve telsiz
 ('Ses ve telsiz','Müzik','Oyunun kendi bestesi: menü, sakin uçuş, çatışma, zafer, yenilgi; ara ara çalar.','Ayarlar → Ses → Müzik / Müzik sıklığı','U sesi kapat','V1.61',T('sound','v228'),'iyi',''),
 ('Ses ve telsiz','Telsiz','Kule, AWACS (Kartal Gözü), kanat adamı ve eğitmen konuşmaları; hazır mesaj menüsü, altyazı.','Uçuşta','O telsiz menüsü','V1.62',T('radio'),'iyi',''),
 # ---- Kontroller
 ('Kontroller','Dokunmatik kontroller','Serbest çubuk, gaz, ATEŞ, FLARE, TEKER, dümen; düzen düzenleyici ve hazır düzenler (Klasik, Sol el, Eğerek uç).','Telefonda kendiliğinden · Ayarlar → Kontroller → Dokunmatik','—','V1.52',T('phone','touch2','controls'),'iyi',''),
 ('Kontroller','Oyun kolu ve klavye','Tam oyun kolu desteği, tuş atama, kontrol şemaları; kısayol çakışma denetimi.','Ayarlar → Kontroller','—','V1.52',T('controls','input'),'iyi',''),
 ('Kontroller','Titreşim ve eğerek uçuş','Telefon titreşimi ve telefonu eğerek yönlendirme.','Ayarlar → Kontroller','—','V1.90',T('phone'),'iyi',''),
 # ---- Medya
 ('Fotoğraf ve tekrar','Tekrar izleme','Son uçuşu kameralar ve zaman çubuğuyla yeniden izleme.','Uçuşta','F3','V1.87',T('replay'),'iyi',''),
 ('Fotoğraf ve tekrar','Fotoğraf modu','Arayüzsüz serbest kamera ile fotoğraf.','Uçuşta','H','V1.87',T('replay'),'iyi',''),
 # ---- Grafik ve performans
 ('Grafik ve performans','Grafik ayarları','Otomatik / hazır ayarlar, ayrıntılı ayarlar, maliyet etiketleri, canlı fark, arama, varsayılana dön.','Ayarlar → Grafik','—','V1.57',T('gfx2','settings2','quality','settings'),'iyi',''),
 ('Grafik ve performans','Akıllı performans','Otomatik çözünürlük, kalite basamakları, eşit aralıklı 30 FPS, ısınmaya karşı sabit kalite.','Ayarlar → Grafik → Otomatik','—','V1.94',T('perf','perf2','quality'),'iyi',''),
 ('Grafik ve performans','Performans testi','2 dakikalık sabit rota, özellik maliyetleri, darboğaz, önerilen ayarlar, anonim rapor.','Ayarlar → Grafik → Performans testi','—','V2.12',T('perftest','v234'),'iyi',''),
 ('Grafik ve performans','Görüntü sorunu testi','Katmanları tek tek kapatıp görüntü hatasının kaynağını bulma.','Ayarlar → Grafik → Grafik sorun giderme','—','V1.97',T('gfxtest'),'birleştirilmeli','KARAR (29 Ekim): Performans testi ve Grafik tanılama ile tek "Sorun giderme" ekranında birleşecek (V2.37).'),
 ('Grafik ve performans','Grafik tanılama','Cihaz bilgisi, derinlik, efekt durumu gibi tanılama satırları.','Ayarlar → Grafik','—','V1.59',T('gfxtest'),'birleştirilmeli','KARAR (29 Ekim): "Sorun giderme" ekranına katılacak (V2.37).'),
 ('Grafik ve performans','Yükleme ekranı','Dönen 3B ay yıldız, uçak biçimli ilerleme çubuğu, aşamalı açılış.','Açılışta','—','V2.20',T('boot'),'iyileştirilmeli','KARAR (29 Ekim): dördü de yapılacak: ipucu kartları, oyun dilinde aşama adları, ikinci açılışın hızlanması, hafif yükleme sesi (V2.38).'),
 # ---- Hesap
 ('Hesap ve kayıt','Hesap ve profil','Misafir ya da bulut hesabı, oyuncu kartı, birden çok profil, bulut eşitleme.','Ana menü → sağ üstteki profil','—','V1.66',T('account','pcard'),'iyi',''),
 ('Hesap ve kayıt','Kayıt ve yedek','Bütün ilerleme tek kayıtta, her oturum yedekleniyor; grafik ayarları cihaza özel.','Kendiliğinden','—','V2.26',T('depo'),'iyi',''),
 ('Hesap ve kayıt','Uygulama olarak yükleme','Ana ekrana ekleme, kısayollar, Android (Play Store) hazırlığı.','Ana menü → Uygulamayı yükle','—','V2.01',T('install'),'iyileştirilmeli','KARAR (29 Ekim): Play Store yayını model serisinden sonra (docs/ANDROID.md).'),
 ('Hesap ve kayıt','Duyurular ve sürüm notları','Yönetici duyuruları, güncellemeden sonra yenilikler şeridi, Yenilikler ekranı.','Ana menü → Yenilikler','—','V1.66',T('notes'),'iyi',''),
 # ---- Yönetici
 ('Yönetici araçları','Yönetim paneli','Duyuru yayını, görev yayını, kütüphanelere giriş (yalnız yönetici).','Ana menü → kalkan düğmesi','—','V1.68',T('account'),'iyi',''),
 ('Yönetici araçları','Model kütüphanesi','Bütün modelleri 3B inceleme, test, boya, kendi modelini yükleme (.glb .gltf .fbx .obj .stl .dae), ölçü denetimi.','Yönetim paneli → Kütüphaneler','—','V1.37',T('library','modelreg'),'iyi',''),
 ('Yönetici araçları','Ses kütüphanesi','Her sesi dinleme, kendi ses dosyasıyla değiştirme, kanal karışımı.','Yönetim paneli → Kütüphaneler','—','V1.60',T('sound'),'iyi',''),
 ('Yönetici araçları','Sistem envanteri','Gerçek Türk sistemlerinin verileri (Defence Turk kaynaklı, atıflı).','Hangar → Gerçek veriler','—','V1.86',T('envanter'),'iyi',''),
 # ---- Modeller
 ('Modeller','Uçak, helikopter, araç ve gemi modelleri','Kodla üretilmiş stilize modeller; parça birleştirme ile az çizim.','Her yerde','—','V1.37',T('modelreg','bake'),'iyileştirilmeli','Gerçeğe benzerlik zayıf; ANKA-3 +%37, Kızılelma +%18, Hürjet +%17 ölçü sapması. KARAR: model serisi V2.41\'den itibaren, her model onaya sunulur.'),
]
KEYS = ['kat','ad','ne','nereden','tus','surum','testler','durum','not']
items = [dict(zip(KEYS, f)) for f in F]
have = set(re.sub(r'\.test\.js$','',x) for x in os.listdir(os.path.join(ROOT,'tests')) if x.endswith('.test.js'))
for it in items:
    it['testler'] = [t for t in it['testler'] if t in have]
DUR = {'iyi':'✅ iyi','iyileştirilmeli':'🔧 iyileştirilmeli','birleştirilmeli':'🔀 birleştirilmeli','kaldırılmalı':'🗑 kaldırılmalı','denenmeli':'🧪 denenmeli'}
cats = []
for it in items:
    if it['kat'] not in cats: cats.append(it['kat'])
# ---- docs/OZELLIKLER.md
L = ['# Özellik envanteri', '', 'Üretildi: `python3 tools/ozellikler.py` (kaynak: aynı dosyadaki liste). Oyundaki **Rehber** ekranı da bu listeden üretilir.', '',
     '**Durum:** ✅ iyi · 🔧 iyileştirilmeli · 🔀 birleştirilmeli · 🗑 kaldırılmalı · 🧪 denenmeli (gerçek cihazda doğrulanmalı)', '']
cnt = {}
for it in items: cnt[it['durum']] = cnt.get(it['durum'],0)+1
L.append('**Özet:** %d özellik · ' % len(items) + ' · '.join('%s %d' % (DUR[k], v) for k, v in cnt.items()) + ' · testi olmayan: %d' % sum(1 for i in items if not i['testler']))
L += ['', '## Karar listesi', '', 'Aşağıdakiler senin kararını bekliyor. "iyi" durumundaki özellikler olduğu gibi kalır.', '']
n = 0
for it in items:
    if it['durum'] != 'iyi':
        n += 1; L.append('%d. **%s** (%s) — %s' % (n, it['ad'], DUR[it['durum']], it['not']))
for c in cats:
    L += ['', '## ' + c, '', '| Özellik | Ne yapar | Nereden | Tuş | Sürüm | Test | Durum |', '|---|---|---|---|---|---|---|']
    for it in items:
        if it['kat'] != c: continue
        L.append('| **%s** | %s | %s | %s | %s | %s | %s |' % (it['ad'], it['ne'], it['nereden'], it['tus'], it['surum'], ', '.join(it['testler']) or '—', DUR[it['durum']]))
open(os.path.join(ROOT,'docs','OZELLIKLER.md'),'w').write('\n'.join(L)+'\n')
# ---- in-game data
pub = [{k: it[k] for k in ('kat','ad','ne','nereden','tus','surum')} for it in items if it['kat'] != 'Yönetici araçları']
open(os.path.join(ROOT,'src','js','veri','rehber-veri.js'),'w').write('/* Generated by tools/ozellikler.py — do not edit by hand. The in-game guide (ekran/rehber.js). */\nconst REHBER='+json.dumps(pub, ensure_ascii=False, separators=(',',':'))+';\n')
print('özellik:', len(items), cnt)
