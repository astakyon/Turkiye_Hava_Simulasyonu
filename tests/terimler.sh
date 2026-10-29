#!/bin/sh
# V2.39: terim sözlüğü ve yazım denetimi (docs/TERIMLER.md)
cd "$(dirname "$0")/.."
python3 tools/metinler.py --check
