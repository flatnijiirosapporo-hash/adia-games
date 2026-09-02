const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const targets=(process.env.PHASE_TARGETS||'number_highlow.html').split(',').map(s=>s.trim()).filter(Boolean);
let failures=[];
for(const rel of targets){
  const p=path.join(root,rel);
  if(!fs.existsSync(p)){failures.push(`${rel}: missing file`);continue;}
  const src=fs.readFileSync(p,'utf8');
  if(!src.includes('NIJI_QUESTION_BANK_VERSION')) failures.push(`${rel}: missing NIJI_QUESTION_BANK_VERSION`);
  if(!src.includes('function createQuestionBag') && !src.includes('const createQuestionBag')) failures.push(`${rel}: missing createQuestionBag source`);
  const noComments=src.replace(/<!--[\s\S]*?-->/g,'').replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
  if(/(?:fetch\s*\(|src\s*=|href\s*=)[^\n>]*(?:question|questions|bank)[^\n>]*\.json/i.test(noComments)) failures.push(`${rel}: external question JSON dependency`);
}
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log(`PASS self-contained question hosts: ${targets.length}`);
