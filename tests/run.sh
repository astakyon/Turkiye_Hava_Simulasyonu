#!/bin/sh
# Başsız (tarayıcısız) testler. Gerekli: Node.js 18+
set -e
cd "$(dirname "$0")"
node -e "const h=require('fs').readFileSync('../index.html','utf8');const m=[...h.matchAll(/<script>([\s\S]*?)<\/script>/g)];require('fs').writeFileSync('/tmp/sim.js',m[m.length-1][1])"
node harness.js /tmp/sim.js features.test.js
node harness.js /tmp/sim.js taxi.test.js
node harness.js /tmp/sim.js setup.test.js
node harness.js /tmp/sim.js ai.test.js
node harness.js /tmp/sim.js service.test.js
node net_harness.js /tmp/sim.js net.test.js
node net_harness.js /tmp/sim.js net_ffa.test.js
