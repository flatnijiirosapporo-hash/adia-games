const assert=require('assert'); const {load}=require('./train_test_loader'); const {T,html}=load();
assert(T,'test api missing'); assert.equal(Object.keys(T.COURSES).length,24);
const byRegion={}; for(const c of Object.values(T.COURSES))(byRegion[c.region]??=[]).push(c);
for(const r of ['北海道','東北','関東','中部','関西','中国','四国','九州']){assert.equal(byRegion[r].length,3,r);assert.deepEqual([...new Set(byRegion[r].map(c=>c.difficulty))].sort(),['challenge','easy','normal']);}
for(const c of Object.values(T.COURSES)){const expected={easy:3,normal:4,challenge:5}[c.difficulty];assert.equal(c.stations.length,expected,c.id);assert(c.schedule.length===expected,c.id+' schedule');}
assert(html.includes('実在の運行ダイヤを再現するものではありません')); assert(html.includes('COURSE_SOURCE_NOTES'));
console.log('train_course_data: PASS');
