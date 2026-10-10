#!/usr/bin/env python3
"""Sürüm numarasını tek komutla günceller:  python3 bump_version.py V1.01 "Kısa not"
src/js/01-core.js, src/index.html, VERSION, version.json, sw.js ve CHANGELOG.md dosyalarını günceller, sonra index.html'i yeniden derler."""
import re, sys, json, datetime, pathlib
if len(sys.argv) < 2 or not re.fullmatch(r'V\d+\.\d{2}', sys.argv[1]):
    sys.exit('Kullanım: python3 bump_version.py V1.01 "Not"')
v = sys.argv[1]; note = sys.argv[2] if len(sys.argv) > 2 else 'Güncelleme'
d = datetime.date.today().isoformat(); p = pathlib.Path(__file__).parent
core = p/'src'/'js'/'01-core.js'; tpl = p/'src'/'index.html'
h = core.read_text(encoding='utf-8')
h, n1 = re.subn(r"const GAME_VERSION='V[\d.]+', GAME_DATE='[\d-]+';", f"const GAME_VERSION='{v}', GAME_DATE='{d}';", h)
core.write_text(h, encoding='utf-8')
t = tpl.read_text(encoding='utf-8')
t, n2 = re.subn(r'(<meta name="game-version" content=")V[\d.]+(")', rf'\g<1>{v}\2', t)
tpl.write_text(t, encoding='utf-8')
assert n1 == 1 and n2 == 1, 'sürüm satırı bulunamadı'
sw = p/'sw.js'; sw.write_text(re.sub(r"ayyildiz-V[\d.]+", 'ayyildiz-'+v, sw.read_text(encoding='utf-8')), encoding='utf-8')
(p/'VERSION').write_text(v + '\n')
(p/'version.json').write_text(json.dumps({'name': 'Ay Yıldız: Hedef Kızıl Elma', 'version': v, 'date': d}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
c = (p/'CHANGELOG.md').read_text(encoding='utf-8')
entry = f'## {v} — {d}\n- {note}\n\n'
c = c.replace('\n## ', '\n' + entry + '## ', 1) if '\n## ' in c else c + entry
(p/'CHANGELOG.md').write_text(c, encoding='utf-8')
import subprocess; subprocess.run([sys.executable, str(p/'tools'/'build.py')], check=True)
print(f'{v} yazıldı. Şimdi CHANGELOG.md içindeki notu düzenle, sonra:\n  git add -A && git commit -m "{v}: {note}" && git tag {v} && git push && git push --tags')
