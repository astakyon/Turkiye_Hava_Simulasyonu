#!/bin/bash
# Release (V2.31): one documented path from source to a pushed version.
# Usage: tools/release.sh Vx.yy "short title" changelog_body.md "commit message"
#   1. bump_version.py: VERSION, version.json, service worker, version label; CHANGELOG gets the body under "## Vx.yy — date · title"
#   2. tools/relnotes.py + ozellikler.py + metinler.py + surumler.py + build.py: in-game release notes and guide, one-file index.html
#   3. tools/browser-check.js: real browser — vanishing objects, budgets (draw calls, triangles, textures), crowded-battle stress
#   4. tests/paralel.js: every headless test on all cores
#   5. commit + push (only if 3 and 4 passed)
# Optional environment: RELEASE_AUTHOR_NAME / RELEASE_AUTHOR_EMAIL (commit author), RELEASE_TRAILER (file appended to the
# commit message). Nothing personal is stored in this file.
set -e
cd "$(dirname "$0")/.."
[ $# -ge 4 ] || { echo "kullanım: tools/release.sh Vx.yy \"başlık\" notlar.md \"commit mesajı\""; exit 2; }
V="$1"; TITLE="$2"; BODY="$3"; MSG="$4"
python3 bump_version.py "$V" "$TITLE" >/dev/null
python3 - "$V" "$TITLE" "$BODY" <<'P'
import sys,re
v,n,f=sys.argv[1],sys.argv[2],sys.argv[3]
c=open('CHANGELOG.md').read(); body=open(f).read().rstrip()+"\n"
c=re.sub(r"## "+re.escape(v)+r" — (\S+)\n- "+re.escape(n)+r"\n", lambda m:"## "+v+" — "+m.group(1)+" · "+n+"\n"+body, c, count=1)
open('CHANGELOG.md','w').write(c)
P
python3 tools/relnotes.py
python3 tools/ozellikler.py >/dev/null
python3 tools/metinler.py >/dev/null
python3 tools/surumler.py >/dev/null
python3 tools/build.py >/dev/null
BC=$(timeout 900 node tools/browser-check.js 2>&1 | grep -v agent-proxy | tail -9); echo "$BC"
if echo "$BC" | grep -q "FAIL"; then echo "TARAYICI DENETİMİ BAŞARISIZ — yayın durduruldu"; exit 1; fi
TR=$(timeout 1800 node tests/paralel.js 2>&1 | grep -E "FAIL|pass [0-9]+ fail|Error|paralel:" | tr '\n' ' '); echo "$TR"
if echo "$TR" | grep -qE "FAIL|Error"; then echo "TESTLER BAŞARISIZ — yayın durduruldu"; exit 1; fi
git add -A
M="$V: $MSG"; if [ -n "$RELEASE_TRAILER" ] && [ -f "$RELEASE_TRAILER" ]; then M="$M

$(cat "$RELEASE_TRAILER")"; fi
A=(); if [ -n "$RELEASE_AUTHOR_NAME" ]; then A+=(-c "user.name=$RELEASE_AUTHOR_NAME"); fi; if [ -n "$RELEASE_AUTHOR_EMAIL" ]; then A+=(-c "user.email=$RELEASE_AUTHOR_EMAIL"); fi
git "${A[@]}" commit -q -m "$M"
git push -q origin HEAD 2>&1 | grep -v "moved\|new location" || true
git status -sb | head -1
echo "released $V"
