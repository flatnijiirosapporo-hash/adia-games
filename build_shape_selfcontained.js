'use strict';
const fs=require('fs');const path=require('path');
const ROOT=path.join(__dirname,'..'),out=path.resolve(process.argv[2]||path.join(ROOT,'shape_puzzle.html'));
let html=fs.readFileSync(path.join(ROOT,'shape_puzzle.html'),'utf8');
function safe(src){return String(src).replace(/<\/script/gi,'<\\/script')}
function embed(label,src){return `<script data-embedded-source="${label}">\n${safe(src)}\n</script>`}
function replaceEmbedded(label,file){const re=new RegExp(`<script data-embedded-source="${label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}">[\\s\\S]*?<\\/script>`,'g'),src=fs.readFileSync(path.join(ROOT,file),'utf8'),tag=embed(label,src);if(re.test(html))html=html.replace(re,tag);else throw new Error(`embedded block missing: ${label}`)}
replaceEmbedded('assets/shape_puzzle_core.js','assets/shape_puzzle_core.js');
replaceEmbedded('assets/shape_puzzle_data/puzzles_easy.js','assets/shape_puzzle_data/puzzles_easy.js');
replaceEmbedded('assets/shape_puzzle_data/puzzles_normal.js','assets/shape_puzzle_data/puzzles_normal.js');
replaceEmbedded('assets/shape_puzzle_data/puzzles_challenge.js','assets/shape_puzzle_data/puzzles_challenge.js');
const qLabel='tools/question_bag_runtime.js',qTag=embed(qLabel,fs.readFileSync(path.join(ROOT,'tools/question_bag_runtime.js'),'utf8')),qRe=new RegExp(`<script data-embedded-source="${qLabel}">[\\s\\S]*?<\\/script>`,'g');
if(qRe.test(html))html=html.replace(qRe,qTag);else html=html.replace('<script data-embedded-source="assets/shape_puzzle_app.js">',qTag+'\n<script data-embedded-source="assets/shape_puzzle_app.js">');
replaceEmbedded('assets/shape_puzzle_app.js','assets/shape_puzzle_app.js');
fs.writeFileSync(out,html);console.log(out);
