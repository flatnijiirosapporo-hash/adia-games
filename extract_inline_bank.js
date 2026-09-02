'use strict';
const fs=require('fs');
function extractInlineBank(file,marker){
  const src=fs.readFileSync(file,'utf8');
  const start=`/* NIJI_BANK:${marker}:START */`;
  const end=`/* NIJI_BANK:${marker}:END */`;
  const a=src.indexOf(start), b=src.indexOf(end);
  if(a<0||b<0||b<=a) throw new Error(`${file}: bank marker ${marker} not found`);
  const raw=src.slice(a+start.length,b).trim();
  try{return JSON.parse(raw);}catch(e){throw new Error(`${file}: bank ${marker} JSON parse failed: ${e.message}`);}
}
module.exports={extractInlineBank};
