const assert=require('assert');
const {load}=require('./train_test_loader');
const {T}=load();
const c=T.COURSES['hokkaido-easy-hakodate'];
assert(c,'函館本線コースがありません');
assert.equal(c.line,'函館本線');
assert.deepEqual(c.stations,['函館','五稜郭','桔梗']);
console.log('train_hakodate_start: PASS');
