'use strict';
const assert=require('assert');
const fs=require('fs');
const src=fs.readFileSync(require('path').join(__dirname,'../assets/tkk_games.js'),'utf8');
const ids=['colorquiz','shapequiz','hiraarrange','kataarrange','hirasearch','katasearch','idiomarrange','continents','prefecture','dicetalk','traffic','words','moraread','kanjipuzzle','bushu','palindrome','idiomsearch'];
assert.ok(src.includes('function fixedDeck('),'fixedDeck helper is required');
assert.ok(src.includes('NIJI_QUESTION_BAG_RUNTIME.createQuestionBag'),'persistent shuffle bag must be used');
for(const id of ids){
  const used=src.includes(`fixedDeck('${id}'`)||src.includes(`runFixedChoice('${id}'`);
  assert.ok(used,`${id}: fixed 500 bank must be used at runtime`);
}
console.log('PASS TKK fixed runtime usage: '+ids.length);
