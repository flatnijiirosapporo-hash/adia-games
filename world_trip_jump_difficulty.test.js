const fs = require('fs');
const html = fs.readFileSync('/mnt/data/train_work/world_trip_jump.html','utf8');
function assert(cond,msg){ if(!cond){ throw new Error(msg); } }
assert(/let\s+W=.*lives=3/.test(html) || /lives\s*=\s*3/.test(html), 'lives should start at 3');
assert(!/stagger-three|mixed-three/.test(html), 'three-part obstacle patterns must be removed');
assert(/Math\.max\(1\.4,/.test(html), 'minimum obstacle group gap should be 1.4s');
assert(/speed:\(154\+p\*0\.45\)/.test(html), 'obstacle base speed should be reduced to easier tuning');
assert(/invincibleUntil/.test(html), 'collision should use temporary invincibility');
assert(/ライフ3/.test(html) || /❤❤❤/.test(html), 'instructions should explain three lives');
console.log('world_trip_jump difficulty regression checks passed');
