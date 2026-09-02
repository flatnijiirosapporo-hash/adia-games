const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname,'..','number_highlow.html'),'utf8');
function need(re,msg){ if(!re.test(html)){ console.error('FAIL:',msg); process.exit(1); } }
function forbid(re,msg){ if(re.test(html)){ console.error('FAIL:',msg); process.exit(1); } }
need(/class="top"/, '共通 top ヘッダーを使用する');
need(/class="[^"]*\bnav\b[^"]*"/, '共通 nav を使用する');
need(/class="[^"]*\bwrap\b[^"]*"/, '共通 wrap を使用する');
need(/class="panel"/, '共通 panel を使用する');
need(/class="badge"/, '共通 badge を使用する');
need(/class="primary"/, '共通 primary ボタンを使用する');
need(/class="light"/, '共通 light ボタンを使用する');
need(/@media\s*\(min-width:768px\)\s*and\s*\(max-width:1366px\)\s*and\s*\(orientation:landscape\)/, 'iPad横向き共通レイアウトを持つ');
forbid(/class="topbar"/, '独自 topbar は使用しない');
forbid(/class="hero-card"/, '独自 hero-card は使用しない');
forbid(/class="main-btn"/, '独自 main-btn は使用しない');
forbid(/class="ghost-btn"/, '独自 ghost-btn は使用しない');
console.log('PASS number_highlow common UI markers');
