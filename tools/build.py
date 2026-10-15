#!/usr/bin/env python3
"""Ay Yıldız: Hedef Kızıl Elma — derleyici.
src/ altındaki parçaları tek dosyalık index.html'e birleştirir (oyun tek dosya olarak çalışır: GitHub Pages, claude.ai, Android sarmalayıcı).
Kullanım:  python3 tools/build.py          → index.html yazar
           python3 tools/build.py --check  → index.html güncel değilse hata verir (CI)"""
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
if __name__ == '__main__':
    html = build(); target = ROOT / 'index.html'
    if '--check' in sys.argv:
        if target.read_text(encoding='utf-8') != html:
            sys.exit('index.html src/ ile uyumsuz: python3 tools/build.py çalıştır')
        print('index.html güncel'); sys.exit(0)
    target.write_text(html, encoding='utf-8'); print('index.html yazıldı (%d KB, %d JS modülü)' % (len(html.encode())//1024, len(modules())))
