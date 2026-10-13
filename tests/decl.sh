#!/bin/sh
# top-level function names must be unique across src/js (a later declaration silently replaces the earlier one)
cd "$(dirname "$0")/.."
D=$(grep -ohE "^function [A-Za-z_\$][A-Za-z0-9_\$]*\(" src/js/*.js | sed -E 's/^function //; s/\($//' | sort | uniq -d)
if [ -n "$D" ]; then echo "FAIL duplicate top-level functions: $D"; else echo "pass 1 fail 0"; fi
