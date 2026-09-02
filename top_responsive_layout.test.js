const assert = require('assert');
const fs = require('fs');
const css = fs.readFileSync('assets/ui_v24.css','utf8');
assert.match(css,/\.home-v24 \.home-game-grid\{display:grid;grid-template-columns:repeat\(5,1fr\);gap:11px\}/,'desktop game grid must use 5 columns');
assert.match(css,/@media\(max-width:1100px\)\{[^}]*\.home-v24 \.home-game-grid\{grid-template-columns:repeat\(4,1fr\)\}/s,'medium/tablet landscape grid must use 4 columns');
assert.match(css,/@media\(max-width:900px\)\{[\s\S]*?\.home-v24 \.home-game-grid\{grid-template-columns:repeat\(4,1fr\)\}/,'tablet grid must remain 4 columns');
assert.match(css,/@media\(max-width:620px\)\{[\s\S]*?\.home-v24 \.home-game-grid\{grid-template-columns:repeat\(2,1fr\)\}/,'phone grid must use 2 columns');
console.log('PASS unified responsive game grid');
