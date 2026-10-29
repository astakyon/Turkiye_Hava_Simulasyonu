#!/usr/bin/env python3
"""Metin ve terim denetimi (V2.39).
Oyuncunun gördüğü metinleri (src/js içindeki Türkçe dizgiler + src/html/body.html) toplar, terim sözlüğüne ve sık yazım
hatalarına göre tarar. docs/TERIMLER.md'yi yazar.  Kullanım:
  python3 tools/metinler.py           → raporu yazar, aykırılıkları listeler
  python3 tools/metinler.py --check   → aykırılık varsa "FAIL" yazar (testler bunu çalıştırır)
"""
import os, re, sys, html as H
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SKIP = {'veri/envanter-veri.js', 'veri/surum-notlari-veri.js', 'veri/rehber-veri.js'}   # dış kaynaklı veri; sürüm notları geçmişi olduğu gibi anlatır; rehber tools/ozellikler.py'den üretilir
TR = re.compile(r'[çğıöşüÇĞİÖŞÜ]')
# --- terim sözlüğü: (yanlış/eş anlamlı biçim, doğru biçim, açıklama). Desenler kelime sınırıyla aranır.
SOZLUK = [
 (r'\bXP\b', 'TP', 'Tecrübe puanının kısaltması her yerde TP.'),
 (r'\b[Mm]isyon(lar)?\b', 'görev', 'Oyunda "misyon" değil "görev".'),
 (r'\b[Kk]anatçı\b', 'kanat adamı', 'Yapay zekâ eşi "kanat adamı" (Kılıç 2).'),
 (r'\b[Ss]kor\b', 'puan', 'Oyun içi sayı "puan".'),
 (r'\b[Ll]isans(lar|lı|ını|ı)?\b', 'belge (ehliyet / sertifika)', 'Genel ad "belge"; kara ve deniz için "ehliyet", hava için "sertifika". Ekranın adı "Ehliyet ve Sertifikalar".'),
 (r'\bTaksiyi atla\b', 'Piste geç', 'Dokunmatik düğme ve tuş aynı adı taşır: "Piste geç".'),
 (r'\b[Aa]rtyakıcı\b', 'art yakıcı', 'İki kelime.'),
 (r'\b[İi]şaret fişeği\b', 'flare', 'Oyunda "flare".'),
 (r'\b[Ww]ingman\b', 'kanat adamı', 'İngilizce ad kullanılmaz.'),
]
YAZIM = [
 (r'\b[Hh]erşey', 'her şey'), (r'\b[Bb]irşey', 'bir şey'), (r'\b[Hh]içbir şey\b(?!)', None), (r'\b[Hh]iç bir\b', 'hiçbir'), (r'\b[Yy]anlız', 'yalnız'),
 (r'\b[Mm]alesef', 'maalesef'), (r'\b[Yy]alnış', 'yanlış'), (r'\b[Oo]rjinal', 'orijinal'), (r'\b[Hh]erkez\b', 'herkes'), (r'\b[Ss]öför', 'şoför'),
 (r'\b[Pp]ekçok\b', 'pek çok'), (r'\b[Şş]uanda\b|\b[Şş]uan\b', 'şu an'), (r'\b[Ee]ylül\b', None), (r'\b[Ss]anki de\b', None), (r'\b[Yy]alnızca\b', None),
 (r'\b[Kk]arşılaşdır', 'karşılaştır'), (r'\b[İi]nternete bağlan\b', None), (r'\b[Dd]eyil\b', 'değil'), (r'\b[Kk]ılavuz\b', None), (r'\b[Tt]raş\b', None),
 (r'\b[Aa]ma\b', None), (r'\b[Bb]irtek\b', 'bir tek'), (r'\b[Hh]erhangibir\b', 'herhangi bir'), (r'\b[Ss]eviyor\b', None), (r'\b[Yy]anlızca\b', 'yalnızca'),
 (r'\b[Ee]ksi̇k\b', 'eksik'), (r'\b[Kk]atagori', 'kategori'), (r'\b[Ss]üpriz', 'sürpriz'), (r'\b[Mm]ütiş', 'müthiş'), (r'\b[Pp]oğaça', None),
]
YAZIM = [(p, d) for p, d in YAZIM if d]
STR = re.compile(r"'((?:[^'\\\n]|\\.)*)'|\"((?:[^\"\\\n]|\\.)*)\"|`((?:[^`\\]|\\.)*)`")
def texts():
    out = []
    js = os.path.join(ROOT, 'src', 'js')
    for d, _, fs in os.walk(js):
        for f in fs:
            if not f.endswith('.js'): continue
            rel = os.path.relpath(os.path.join(d, f), js)
            if rel in SKIP: continue
            src = open(os.path.join(d, f), encoding='utf-8').read()
            src = re.sub(r'/\*.*?\*/', lambda m: '\n' * m.group(0).count('\n'), src, flags=re.S)   # comments are English notes
            src = re.sub(r'(^|[^:\\])//[^\n]*', r'\1', src)
            for i, line in enumerate(src.split('\n'), 1):
                for m in STR.finditer(line):
                    s = next(g for g in m.groups() if g is not None)
                    s2 = re.sub(r'<[^>]*>', ' ', s)
                    if TR.search(s2) or re.search(r'\bXP\b', s2) or (' ' in s2.strip() and re.search(r'[a-zA-Z]{3}', s2) and not re.search(r'[{};=]|function|\.\w+\(', s2)):
                        out.append(('src/js/' + rel, i, s2))
    body = open(os.path.join(ROOT, 'src', 'html', 'body.html'), encoding='utf-8').read()
    for i, line in enumerate(body.split('\n'), 1):
        t = re.sub(r'<[^>]+>', '\n', line)
        for part in t.split('\n'):
            part = H.unescape(part).strip()
            if part and re.search(r'[A-Za-zçğıöşüÇĞİÖŞÜ]{2}', part): out.append(('src/html/body.html', i, part))
        for a in re.findall(r'(?:placeholder|title|aria-label)="([^"]+)"', line): out.append(('src/html/body.html', i, a))
    return out
def check(T):
    bad = []
    for f, i, s in T:
        clean = re.sub(r'\$\{[^}]*\}', ' ', s)
        for p, d, why in SOZLUK:
            for m in re.finditer(p, clean):
                bad.append((f, i, m.group(0), d, s[:90]))
        for p, d in YAZIM:
            for m in re.finditer(p, clean):
                bad.append((f, i, m.group(0), d, s[:90]))
    return bad
if __name__ == '__main__':
    T = texts(); B = check(T)
    L = ['# Terim sözlüğü ve metin denetimi', '', 'Üretildi: `python3 tools/metinler.py` · oyuncunun gördüğü %d metin parçası tarandı (envanter verisi hariç). Testler `--check` ile çalıştırır; aykırı metin kalırsa yayın durur.' % len(T), '',
         '## Terim sözlüğü', '', '| Kullanılmaz | Kullanılır | Not |', '|---|---|---|']
    for p, d, why in SOZLUK:
        L.append('| `%s` | **%s** | %s |' % (p.replace('\\b', '').replace('|', '\\|'), d, why))
    L += ['', '**Diğer sabit terimler:** iniş takımı (dokunmatik düğmede kısaca TEKER) · art yakıcı · hava savunma (SAM) · İHA / SİHA (silahlı İHA) · Kartal Gözü (AWACS) · Kılıç 2 (kanat adamı) · Hilal Kanatlar / Mavi Kanatlar / Bozkurtlar (gruplar) · Hızlı Oyun · Kariyer · Harekât · Hızlı Savaş · Sorun giderme · Rehber.',
          '', '## Yazım denetimi', '', 'Aranan sık hatalar: ' + ', '.join('%s → %s' % (re.sub(r'\\b|\[(.)(.)\]', lambda m: m.group(2) if m.group(2) else '', p), d) for p, d in YAZIM) + '.', '',
          '## Sonuç', '', ('Aykırı metin: **0**' if not B else 'Aykırı metin: **%d**' % len(B))]
    for f, i, w, d, s in B[:200]: L.append('- `%s:%d` «%s» → %s · %s' % (f, i, w, d, s))
    open(os.path.join(ROOT, 'docs', 'TERIMLER.md'), 'w', encoding='utf-8').write('\n'.join(L) + '\n')
    if '--check' in sys.argv:
        print(('FAIL terim/yazım aykırılığı: %d (docs/TERIMLER.md)' % len(B)) if B else 'pass %d fail 0' % len(T))
    else:
        print('metin:', len(T), 'aykırı:', len(B))
        for f, i, w, d, s in B: print('%s:%d «%s» → %s | %s' % (f, i, w, d, s))
