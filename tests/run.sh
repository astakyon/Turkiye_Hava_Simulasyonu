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
node harness.js /tmp/sim.js picker.test.js
node harness.js /tmp/sim.js menu.test.js
node net_harness.js /tmp/sim.js net.test.js
node net_harness.js /tmp/sim.js net_ffa.test.js
node harness.js /tmp/sim.js airport.test.js
node harness.js /tmp/sim.js hangar_taxi.test.js
node harness.js /tmp/sim.js walk.test.js
node harness.js /tmp/sim.js library.test.js
node harness.js /tmp/sim.js naval.test.js
node harness.js /tmp/sim.js land.test.js
node harness.js /tmp/sim.js town.test.js
node harness.js /tmp/sim.js marina.test.js
node harness.js /tmp/sim.js rural.test.js
node harness.js /tmp/sim.js military.test.js
node harness.js /tmp/sim.js daynight.test.js
node harness.js /tmp/sim.js south.test.js
node harness.js /tmp/sim.js uav.test.js
node harness.js /tmp/sim.js enemy.test.js
node harness.js /tmp/sim.js landmarks.test.js
node harness.js /tmp/sim.js v151.test.js
node harness.js /tmp/sim.js controls.test.js
