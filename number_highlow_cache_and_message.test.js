const fs=require('fs');
const path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','number_highlow.html'),'utf8');
const index=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const catalog=fs.readFileSync(path.join(__dirname,'..','assets','game_catalog.js'),'utf8');
function need(src,re,msg){if(!re.test(src)){console.error('FAIL:',msg);process.exit(1)}}
need(html,/\.message-title\s*\{/, '結果判定で使う message-title の共通表示CSSが必要');
need(html,/\.message-detail\s*\{/, '結果判定で使う message-detail の表示CSSが必要');
need(catalog,/number_highlow\.html\?v=20260902-2/, '数字ハイアンドローのキャッシュ更新番号を2にする');
need(index,/assets\/game_catalog\.js\?v=20260902-84/, 'TOPのカタログも新しい更新番号を読む');
console.log('PASS number highlow cache/message markers');
