#!/usr/bin/env python3
"""Ay Yıldız: Hedef Kızıl Elma — derleyici.
src/ altındaki parçaları tek dosyalık index.html'e birleştirir (oyun tek dosya olarak çalışır: GitHub Pages, claude.ai, Android sarmalayıcı).
Kullanım:  python3 tools/build.py          → index.html yazar
           python3 tools/build.py --check  → index.html güncel değilse hata verir (CI)"""
import sys, pathlib, re
ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'
def read(p): return (SRC / p).read_text(encoding='utf-8')
def build():
    out = read('index.html')
    out = out.replace('/*@include css/main.css*/\n', read('css/main.css'))
    out = out.replace('<!--@include html/body.html-->\n', read('html/body.html'))
    js = ''.join((SRC / 'js' / f.name).read_text(encoding='utf-8') for f in sorted((SRC / 'js').glob('*.js')))
    out = out.replace('/*@include js/*/\n', js)
    assert '@include' not in out, 'çözülmemiş @include var'
    return out
if __name__ == '__main__':
    html = build(); target = ROOT / 'index.html'
    if '--check' in sys.argv:
        if target.read_text(encoding='utf-8') != html:
            sys.exit('index.html src/ ile uyumsuz: python3 tools/build.py çalıştır')
        print('index.html güncel'); sys.exit(0)
    target.write_text(html, encoding='utf-8'); print('index.html yazıldı (%d KB, %d JS modülü)' % (len(html.encode())//1024, len(list((SRC/'js').glob('*.js')))))
