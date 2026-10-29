#!/usr/bin/env python3
"""Ay Yıldız: Hedef Kızıl Elma — derleyici.
src/ altındaki parçaları birleştirir (V2.51):
  index.html      — sayfa + <script src="oyun.js?v=SÜRÜM">: oyun kodu ayrı dosyada, tarayıcı derlenmiş kodu önbellekte tutar → ikinci açılış hızlı
  oyun.js         — bütün oyun kodu (tek IIFE)
  tek-dosya.html  — her şey tek dosyada (indirme, claude.ai, testler, tarayıcı denetimi)
Kullanım:  python3 tools/build.py          → üç dosyayı yazar, sw.js çekirdek listesini günceller
           python3 tools/build.py --check  → dosyalar güncel değilse hata verir (CI)"""
import sys, pathlib, re
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from jsstrip import strip_js
ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'
def read(p): return (SRC / p).read_text(encoding='utf-8')
def modules():
    """JS modules in load order, from src/js/SIRA.txt; every .js under src/js must be listed exactly once."""
    order = [l.strip() for l in (SRC / 'js' / 'SIRA.txt').read_text(encoding='utf-8').splitlines() if l.strip() and not l.startswith('#')]
    found = sorted(str(f.relative_to(SRC / 'js')) for f in (SRC / 'js').rglob('*.js'))
    missing = [f for f in found if f not in order]; ghost = [f for f in order if f not in found]
    assert not missing and not ghost and len(set(order)) == len(order), 'SIRA.txt uyumsuz — listede yok: %s · dosyası yok: %s' % (missing, ghost)
    return [SRC / 'js' / f for f in order]
def build():
    out = read('index.html')
    out = out.replace('/*@include css/main.css*/\n', read('css/main.css'))
    out = out.replace('<!--@include html/body.html-->\n', read('html/body.html'))
    js = ''.join(f.read_text(encoding='utf-8') for f in modules())
    if '--raw' not in sys.argv: js = strip_js(js)   # V2.25: comments and indentation stay in src/, not in the shipped file
    out = out.replace('/*@include js/*/\n', js)
    assert '@include' not in out, 'çözülmemiş @include var'
    return out
GAME_OPEN = "<script>\n(function(){\n'use strict';\n"; GAME_CLOSE = "\n})();\n</script>"
def split(single):
    """V2.51: the game script moves to oyun.js; the page loads it with a version query (fresh after every release) and preloads it."""
    a = single.rindex(GAME_OPEN); b = single.index(GAME_CLOSE, a) + len(GAME_CLOSE)
    v = (ROOT / 'VERSION').read_text(encoding='utf-8').strip(); src = 'oyun.js?v=' + v
    game = single[a + len('<script>\n'):b - len('\n</script>')] + '\n'
    page = single[:a] + '<script src="' + src + '"></script>' + single[b:]
    page = page.replace('</head>', '<link rel="preload" href="' + src + '" as="script">\n</head>', 1)
    return page, game, src
def sw_core(text, src):
    """keep the service worker's core list pointing at this version's oyun.js (so it is cached on install, offline play works)"""
    if re.search(r"'oyun\.js\?v=[^']*'", text): return re.sub(r"'oyun\.js\?v=[^']*'", "'" + src + "'", text)
    return text.replace("'index.html',", "'index.html','" + src + "',", 1)
if __name__ == '__main__':
    single = build(); page, game, src = split(single)
    outs = {ROOT / 'tek-dosya.html': single, ROOT / 'index.html': page, ROOT / 'oyun.js': game}
    swp = ROOT / 'sw.js'; outs[swp] = sw_core(swp.read_text(encoding='utf-8'), src)
    if '--check' in sys.argv:
        bad = [f.name for f, t in outs.items() if not f.exists() or f.read_text(encoding='utf-8') != t]
        if bad: sys.exit('src/ ile uyumsuz: %s — python3 tools/build.py çalıştır' % ', '.join(bad))
        print('index.html, oyun.js, tek-dosya.html güncel'); sys.exit(0)
    for f, t in outs.items(): f.write_text(t, encoding='utf-8')
    print('index.html + oyun.js (%d KB) + tek-dosya.html yazıldı (%d JS modülü)' % (len(game.encode())//1024, len(modules())))
