const assert=require('assert');const {load}=require('./train_test_loader');const {T}=load();
assert.deepEqual(T.NOTCHES,['P5','P4','P3','P2','P1','N','B1','B2','B3','B4','B5','B6','B7','EB']);assert.equal(T.notchFromRatio(0),'P5');assert.equal(T.notchFromRatio(.99),'EB');assert.equal(T.canApplyPower({doorsClosed:false,stoppedAtStation:true}),false);assert.equal(T.canApplyPower({doorsClosed:true,stoppedAtStation:true}),true);
assert.equal(T.shouldDepartExpert({awaitDeparture:true,doorsClosed:true,notch:'P1'}),true);assert.equal(T.shouldDepartExpert({awaitDeparture:true,doorsClosed:false,notch:'P5'}),false);assert.equal(T.shouldDepartExpert({awaitDeparture:false,doorsClosed:true,notch:'P3'}),false);
assert.equal(T.viewModeFor(201,false),'forward');assert.equal(T.viewModeFor(200,false),'platform');assert.equal(T.viewModeFor(35,false),'platform');assert.equal(T.viewModeFor(0,true),'forward');
for(const c of Object.values(T.COURSES)){const d=T.makeDisruption(c,123);if(c.difficulty==='challenge')assert(d===null||['leadDelay','extendedSignal','passingChange','slowOrder','weatherWorsen'].includes(d.type));else assert.equal(d,null,c.id);}assert.equal(T.adjustedScheduleTime(600,35),635);
assert(T.recoveryGain(90,100,10,20)>0);assert.equal(T.recoveryGain(110,100,10,20),0);assert.notEqual(T.trafficSignalOverride(.47,[{type:'lead',at:.46}],'G'),'G');
const traffic=T.makeTrafficPlan(T.COURSES['kanto-easy-yamanote'],7);assert(Array.isArray(traffic));assert(traffic.length>=2);
console.log('train_runtime: PASS');
