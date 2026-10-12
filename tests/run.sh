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
node harness.js /tmp/sim.js map.test.js
node harness.js /tmp/sim.js heli.test.js
node harness.js /tmp/sim.js v157.test.js
node harness.js /tmp/sim.js sound.test.js
node harness.js /tmp/sim.js radio.test.js
node harness.js /tmp/sim.js settings.test.js
node harness.js /tmp/sim.js account.test.js
node harness.js /tmp/sim.js career.test.js
node harness.js /tmp/sim.js vehicles.test.js
node harness.js /tmp/sim.js boats.test.js
node harness.js /tmp/sim.js call.test.js
node harness.js /tmp/sim.js heliops.test.js
node harness.js /tmp/sim.js damage.test.js
node harness.js /tmp/sim.js weather.test.js
node harness.js /tmp/sim.js airlife.test.js
node harness.js /tmp/sim.js board.test.js
node harness.js /tmp/sim.js dynamic.test.js
node harness.js /tmp/sim.js school.test.js
node harness.js /tmp/sim.js progress.test.js
node harness.js /tmp/sim.js races.test.js
node harness.js /tmp/sim.js editor.test.js
node harness.js /tmp/sim.js menu2.test.js
node net_harness.js /tmp/sim.js net_mix.test.js
node harness.js /tmp/sim.js comfort.test.js
node harness.js /tmp/sim.js indoor.test.js
node harness.js /tmp/sim.js envanter.test.js
node harness.js /tmp/sim.js replay.test.js
