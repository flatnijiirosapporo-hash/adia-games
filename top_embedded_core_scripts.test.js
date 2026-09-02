const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
if(/<script[^>]+src="assets\/game_catalog\.js/i.test(html)) throw new Error('index still depends on external game_catalog.js');
if(/<script[^>]+src="assets\/home_v24\.js/i.test(html)) throw new Error('index still depends on external home_v24.js');
if(!html.includes('id="embeddedGameCatalog"')) throw new Error('embeddedGameCatalog marker missing');
if(!html.includes('id="embeddedHomeV24"')) throw new Error('embeddedHomeV24 marker missing');
console.log('PASS: TOP catalog/render core scripts are embedded');
