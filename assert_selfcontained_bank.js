'use strict';
const fs=require('fs');
const path=require('path');

function stripComments(src){
  return src
    .replace(/<!--[\s\S]*?-->/g,'')
    .replace(/\/\*[\s\S]*?\*\//g,'')
    .replace(/^\s*\/\/.*$/gm,'');
}

function inspectSelfContained(root,targets){
  const failures=[];
  for(const rel of targets){
    const file=path.resolve(root,rel);
    if(!fs.existsSync(file)){failures.push(`${rel}: missing file`);continue;}
    const src=fs.readFileSync(file,'utf8');
    if(!src.includes('NIJI_QUESTION_BANK_VERSION')) failures.push(`${rel}: missing NIJI_QUESTION_BANK_VERSION`);
    if(!src.includes('function createQuestionBag')&&!src.includes('const createQuestionBag')) failures.push(`${rel}: missing createQuestionBag source`);
    const clean=stripComments(src);
    if(/fetch\s*\([^)]*(?:question|questions|bank)[^)]*\.json/i.test(clean)) failures.push(`${rel}: external question JSON fetch`);
    if(/<script[^>]+src=["'][^"']*(?:question|questions|bank)[^"']*\.json/i.test(clean)) failures.push(`${rel}: external question JSON script`);
  }
  return failures;
}

if(require.main===module){
  const root=process.cwd();
  const targets=(process.env.PHASE_TARGETS||process.argv.slice(2).join(',')).split(',').map(s=>s.trim()).filter(Boolean);
  if(!targets.length){console.error('No targets supplied');process.exit(2);}
  const failures=inspectSelfContained(root,targets);
  if(failures.length){console.error(failures.join('\n'));process.exit(1);}
  console.log(`PASS self-contained bank hosts: ${targets.length}`);
}

module.exports={stripComments,inspectSelfContained};
