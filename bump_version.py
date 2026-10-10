#!/usr/bin/env python3
"""Sürüm numarasını tek komutla günceller:  python3 bump_version.py V1.01 "Kısa not"
index.html, VERSION, version.json ve CHANGELOG.md dosyalarını birlikte günceller."""
import re, sys, json, datetime, pathlib
if len(sys.argv) < 2 or not re.fullmatch(r'V\d+\.\d{2}', sys.argv[1]):
    sys.exit('Kullanım: python3 bump_version.py V1.01 "Not"')
v = sys.argv[1]; note = sys.argv[2] if len(sys.argv) > 2 else 'Güncelleme'
d = datetime.date.today().isoformat(); p = pathlib.Path(__file__).parent
h = (p/'index.html').read_text(encoding='utf-8')
h, n1 = re.subn(r"const GAME_VERSION='V[\d.]+', GAME_DATE='[\d-]+';", f"const GAME_VERSION='{v}', GAME_DATE='{d}';", h)
h, n2 = re.subn(r'(<meta name="game-version" content=")V[\d.]+(")', rf'\g<1>{v}\2', h)
assert n1 == 1 and n2 == 1, 'index.html içinde sürüm satırı bulunamadı'
(p/'index.html').write_text(h, encoding='utf-8')
(p/'VERSION').write_text(v + '\n')
(p/'version.json').write_text(json.dumps({'name': 'Ay Yıldız: Hedef Kızıl Elma', 'version': v, 'date': d}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
c = (p/'CHANGELOG.md').read_text(encoding='utf-8')
entry = f'## {v} — {d}\n- {note}\n\n'
c = c.replace('\n## ', '\n' + entry + '## ', 1) if '\n## ' in c else c + entry
(p/'CHANGELOG.md').write_text(c, encoding='utf-8')
print(f'{v} yazıldı. Şimdi CHANGELOG.md içindeki notu düzenle, sonra:\n  git add -A && git commit -m "{v}: {note}" && git tag {v} && git push && git push --tags')
