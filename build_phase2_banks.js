'use strict';
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.resolve(__dirname,'..');
const VERSION='2026-09-02-q500-v1';

const CATS=[
 ['school','学校',['授業中','休み時間','給食の時間','体育の時間','図書室','帰りの会','校庭']],
 ['nijifla','にじいろクラスフラット札幌',['学習時間','フラトレ','運動あそび','おやつ','自由時間','掃除','送迎の準備']],
 ['home','家',['朝の支度','夕食の前','宿題','入浴の前','家族との会話','ゲームの時間','寝る前']],
 ['park','公園',['鬼ごっこ','遊具あそび','ボールあそび','砂場','ベンチの近く','水あそび','帰る時間']],
 ['transport','移動中',['バス停','バスの車内','地下鉄のホーム','地下鉄の車内','送迎車','横断歩道','駐車場']],
 ['public','公共の場所',['お店','図書館','病院','児童館','スーパー','エレベーター','イベント会場']],
 ['friends','友だちとの場面',['二人で遊ぶ時','ゲーム中','物の貸し借り','約束を決める時','会話中','スポーツ中','作品を見せ合う時']],
 ['group','集団活動',['チーム活動','係活動','集団ゲーム','話し合い','列に並ぶ時','片づけ','発表']],
 ['study','学習',['算数','国語','プリント','読書','宿題','タブレット学習','テスト直し']],
 ['rules','ルールのある場面',['順番を守る時','時間を守る時','道具を使う時','安全の約束','友だちとの約束','片づけの約束','声の大きさの約束']],
 ['emotion','気持ちが動く場面',['負けた時','褒められた時','失敗した時','予定が変わった時','待っている時','大きな音がした時','初めてのことをする時']],
 ['help','助けが必要な場面',['忘れ物をした時','分からない時','重い荷物がある時','体調が悪い時','道が分からない時','物が壊れた時','友だちも困っている時']]
];
const MODS=[
 '近くに大人がいて、落ち着いて話せる状況です。',
 '少し急いでいて、早く終わらせたい気持ちがあります。',
 '友だちもそばにいて、同じ場面を見ています。',
 '予定が変わって、いつもと違う流れになっています。',
 '気持ちが強くなって、少し焦っています。',
 '一度行動したあと、もう一度どうするか考える場面です。'
];
function diffByIndex(i){return i<200?'easy':i<400?'normal':'challenge'}
function label(cat){return CATS.find(x=>x[0]===cat)?.[1]||cat}
function categoryForText(s){
 const t=String(s);
 const rules=[
  ['nijifla',/フラトレ|にじいろ|おやつ|送迎|事業所/],['transport',/バス|電車|地下鉄|ホーム|車|道路|横断|駐車|自転車/],['park',/公園|遊具|ブランコ|すべり台|砂|池|川|プール|海/],
  ['school',/学校|教室|給食|体育|廊下|先生|授業/],['study',/宿題|課題|勉強|プリント|文字|計算|読書/],['home',/家|家族|キッチン|お風呂|寝る|夕食/],
  ['public',/店|図書館|病院|児童館|スーパー|エレベーター|公共|知らない人/],['friends',/友だち|相手|仲間/],['group',/みんな|チーム|集団|列|発表/],
  ['emotion',/気持ち|悔|悲|うれ|不安|怖|怒|緊張|寂/],['help',/困|助け|分から|迷子|体調|具合/],['rules',/ルール|順番|約束|時間|安全/]
 ];
 for(const [c,re] of rules) if(re.test(t)) return c;
 return 'rules';
}
function extractConstExpression(file,name){
 const src=fs.readFileSync(file,'utf8');
 const m=new RegExp(`const\\s+${name}\\s*=`).exec(src); if(!m) return null;
 let i=m.index+m[0].length; while(/\s/.test(src[i])) i++;
 const open=src[i]; const close=open==='['?']':open==='{'?'}':null; if(!close) return null;
 let depth=0,inStr=false,quote='',esc=false;
 for(let j=i;j<src.length;j++){
   const ch=src[j];
   if(inStr){if(esc){esc=false;continue} if(ch==='\\'){esc=true;continue} if(ch===quote)inStr=false;continue}
   if(ch==='"'||ch==="'"||ch==='`'){inStr=true;quote=ch;continue}
   if(ch===open)depth++; else if(ch===close){depth--;if(depth===0){return {src,start:m.index,end:j+1,expr:src.slice(i,j+1)}}}
 }
 return null;
}
function evaluateExpr(expr){return vm.runInNewContext('('+expr+')',Object.create(null),{timeout:1000})}
function uniqueBySemantic(records){
 const seen=new Set(),out=[];
 for(const r of records){
   const choices=(r.choices||[]).map(String).map(x=>x.replace(/\s/g,'')).sort().join('|');
   const key=[String(r.prompt||'').replace(/\s/g,''),String(r.answer||'').replace(/\s/g,''),choices].join('::');
   if(!seen.has(key)){seen.add(key);out.push(r)}
 }
 return out;
}
function standardObjective(prefix,old){
 return uniqueBySemantic(old).map((q,i)=>({...q,id:`${prefix}-legacy-${String(i+1).padStart(3,'0')}`}));
}
function finalize(prefix,existing,generated,count=500,roleplay=false){
 const merged=uniqueBySemantic([...existing,...generated]).slice(0,count);
 if(merged.length<count) throw new Error(`${prefix}: only ${merged.length}`);
 return merged.map((q,i)=>({
   ...q,
   id:q.id||`${prefix}-${String(i+1).padStart(3,'0')}`,
   difficulty:roleplay?'all':diffByIndex(i),
   category:q.category||categoryForText(q.prompt),
   tags:Array.isArray(q.tags)?q.tags:[q.category||categoryForText(q.prompt)]
 }));
}
function settings(){
 const out=[];
 for(let round=0;round<42;round++){
   for(const [cat,catLabel,places] of CATS){
     const p=places[round%7],mod=MODS[Math.floor(round/7)%6];
     out.push({cat,catLabel,place:p,mod,round,variant:round%7});
   }
 }
 return out.slice(0,500);
}
const BASE=settings();
const genericIssues=['やり方が分からなくなりました','必要な物が見つかりません','一人では難しいことがあります','次に何をするか分からなくなりました','少し具合が悪くなりました','予定やルールを確認したくなりました','困っていることを自分だけでは解決できません'];
const refusalRequests=['危ないことも一緒にやろう','今使っている物をすぐ貸して','約束を破って内緒にしよう','嫌だと思うことを我慢してやって','宿題の答えをそのまま見せて','自分の大切な物を勝手に使わせて','今すぐ遊びに参加して'];
const feelEvents=[
 ['順番を抜かれて嫌でした','「先に並んでいたよ。後ろに並んでほしい」と伝える'],['予定が急に変わって困りました','「急に変わって困っている。次の予定を教えて」と伝える'],['大きな音がしてつらくなりました','「音が大きいとつらいので、少し離れたい」と伝える'],['負けて悔しくなりました','「悔しい。少し休んでからまたやる」と伝える'],['話を途中で何度もさえぎられました','「最後まで話を聞いてほしい」と伝える'],['大切な物を勝手に触られて心配です','「大切だから、触る前に聞いてほしい」と伝える'],['うまくできて褒められ、うれしくなりました','「ありがとう。うれしい」と伝える']
];
const listenEvents=[
 ['説明の途中が分からなくなりました','「ここからもう一度お願いします」と確認する'],['友だちが出来事を話しています','最後まで聞いてから内容について質問する'],['言葉の意味が二通りに聞こえました','「こういう意味で合ってる？」と確認する'],['相手の声が小さくて聞こえません','「もう少し大きな声でお願いします」と伝える'],['自分も話したいことがあります','相手の話が区切れてから「次に話していい？」と聞く'],['予定を忘れそうです','メモしてから復唱して確認する'],['自分と違う意見を聞きました','最後まで聞いてから自分の考えを伝える']
];
const repairEvents=[
 ['ぶつかって相手の物を落としました','「ごめんね。大丈夫？一緒に拾うね」と伝える'],['言い方が強くなって相手を傷つけました','「言い方が強かった。ごめん」と伝える'],['約束の時間に遅れました','「遅れてごめん。次は時間を確認する」と伝える'],['勘違いして相手を責めました','「勘違いだった。責めてごめん」と訂正する'],['遊びのルールを守れませんでした','「ルールを守れなかった。次は確認する」と伝える'],['相手も悪かったと思い、謝りたくない気持ちがあります','自分がよくなかった部分については自分から謝る'],['謝ったあと、相手がまだ怒っています','相手が落ち着く時間を待ち、必要なら後で話す']
];
const perspectiveEvents=[
 ['友だちが今日は参加せず見学したいと言っています','体調や気分は人によって違うと考え、無理に誘わない'],['返事がすぐ返ってきません','聞こえなかった・考え中など複数の理由を考える'],['自分には簡単なことを友だちが難しそうにしています','得意不得意は人によって違うと考え、必要なら手伝うか聞く'],['友だちが急に一人になりました','疲れた・静かにしたいなどの可能性も考えて距離を尊重する'],['先生が別の子を先に手伝っています','その子にも今必要な理由があると考えて待つ'],['自分の冗談で相手が笑いませんでした','感じ方は人によって違うと考え、続けず様子を確認する'],['自分は平気な音で友だちが耳をふさいでいます','感覚の感じ方は違うと考え、音量を下げられるか確認する']
];
function makeSkillBank(mode,prefix){
 const generated=BASE.map((s,i)=>{
   const k=s.variant;
   let prompt,answer,choices,explanation;
   if(mode==='help'){
     const issue=genericIssues[k]; prompt=`${s.catLabel}の「${s.place}」で、${issue}。${s.mod} どう助けを求めますか？`;
     answer='困っていることと、してほしいことを具体的に伝える';
     choices=[answer,'何も言わずにその場を離れる','怒った声で相手を責める','全部を相手にやってもらうまで待つ']; explanation='「何に困っているか」と「何を手伝ってほしいか」を言葉にすると、助けてもらいやすくなります。';
   }else if(mode==='refuse'){
     const req=refusalRequests[k]; prompt=`${s.catLabel}の「${s.place}」で、「${req}」と誘われました。${s.mod} どう断りますか？`;
     answer='「それはしないよ」と落ち着いて断り、必要なら理由や代わりの案を伝える';
     choices=[answer,'嫌でも黙って従う','相手をばかにして追い払う','物を投げて断る']; explanation='嫌なことや危ないことは、短くはっきり断って大丈夫です。必要なら大人に相談します。';
   }else if(mode==='feel'){
     const [ev,a]=feelEvents[k]; prompt=`${s.catLabel}の「${s.place}」で、${ev}。${s.mod} どう気持ちを伝えますか？`;answer=a;
     choices=[answer,'相手の人格を悪く言う','何も言わずに物へ当たる','別の人に悪口だけを話す'];explanation='事実と自分の気持ち、してほしいことを分けて伝えると、相手に伝わりやすくなります。';
   }else if(mode==='listen'){
     const [ev,a]=listenEvents[k];prompt=`${s.catLabel}の「${s.place}」で、${ev}。${s.mod} どうすると会話を続けやすいですか？`;answer=a;
     choices=[answer,'分かったふりをして適当に返事する','相手が話している途中で話題を変える','聞こえなくても相手を責める'];explanation='聞く・確認する・順番を待つことを組み合わせると、すれ違いを減らせます。';
   }else if(mode==='repair'){
     const [ev,a]=repairEvents[k];prompt=`${s.catLabel}の「${s.place}」で、${ev}。${s.mod} どうやり直しますか？`;answer=a;
     choices=[answer,'なかったことにして話を終える','全部相手のせいにする','別の人へ相手の悪口を言う'];explanation='自分の行動を認め、必要な謝罪や修復行動を具体的にすると関係を戻しやすくなります。';
   }else{
     const [ev,a]=perspectiveEvents[k];prompt=`${s.catLabel}の「${s.place}」で、${ev}。${s.mod} 相手の立場を考えると、どうするとよいですか？`;answer=a;
     choices=[answer,'自分と同じ感じ方のはずだと決める','理由を聞かずに相手を責める','自分のやり方を無理に続けさせる'];explanation='同じ場面でも感じ方や理由は人によって違います。決めつけず、必要なら確認します。';
   }
   return {prompt,answer,choices,category:s.cat,tags:[s.cat,mode],explanation};
 });
 return finalize(prefix,[],generated,500,false);
}
function makeSstQuizGenerated(){
 const modes=['help','refuse','feel','listen','repair','perspective'];
 const banks=Object.fromEntries(modes.map(m=>[m,makeSkillBank(m,`tmp-${m}`)]));
 return BASE.map((s,i)=>{
   const m=modes[i%modes.length],q=banks[m][i];
   return {prompt:q.prompt,answer:q.answer,choices:q.choices,category:s.cat,tags:['SST',m],explanation:q.explanation};
 });
}
const hazardEvents=[
 ['通り道に物が出ていて、つまずきそうです','いったん止まり、物を安全な場所へ移すか大人に知らせる'],
 ['周りを見ずに急いで動きたくなりました','立ち止まって周囲を確認してからゆっくり動く'],
 ['高い場所や段差の近くでふざけたくなりました','端から離れ、手すりや安全な場所を使う'],
 ['熱い物・尖った物・壊れた物が近くにあります','触らず距離を取り、大人に知らせる'],
 ['知らない人や知らない場所へ誘われました','ついて行かず、信頼できる大人に知らせる'],
 ['雨・雪・強風などで足元や周囲の状況が変わっています','急がず、安全な場所と歩き方を選ぶ'],
 ['友だちが危ない行動を始めようとしています','自分は一緒にせず、安全な場所から大人に知らせる']
];
function makeDangerGenerated(){return BASE.map((s,i)=>{const [haz,safe]=hazardEvents[s.variant];const prompt=`${s.catLabel}の「${s.place}」で、${haz}。${s.mod} どうすると安全ですか？`;return {prompt,answer:safe,choices:[safe,'そのまま急いで続ける','友だちにも同じ行動をすすめる','危険な物や場所へもっと近づいて確かめる'],category:s.cat,tags:['安全',s.cat],explanation:'危険に気づいたら、まず止まり、距離を取り、周りを確認し、必要なら大人へ知らせます。'};});}
function makeFeelingGenerated(){
 const feelings=[['うれしい','😄'],['かなしい','😢'],['おこっている','😡'],['こわい','😨'],['こまっている','😕'],['あんしん','😌'],['はずかしい','😳'],['びっくり','😮'],['くやしい','😣'],['たのしい','😊']];
 const events=['できなかったことができました','大切にしていた物が壊れました','順番を抜かれました','急に大きな音がしました','やり方が分からなくなりました','心配していたことを先生が一緒に確認してくれました','みんなの前で自分の話をすることになりました','予想していなかった出来事が起きました','ゲームや勝負で負けました','友だちと好きな遊びができました'];
 return BASE.map((s,i)=>{const f=feelings[i%feelings.length],ev=events[i%events.length]; const prompt=`${s.catLabel}の「${s.place}」で、${ev}。${s.mod} いちばん近い気持ちはどれですか？`;const answer=`${f[1]} ${f[0]}`;const distract=feelings.filter(x=>x[0]!==f[0]).slice((i+2)%6,(i+2)%6+3);while(distract.length<3)distract.push(feelings[(i+distract.length+1)%feelings.length]);return {prompt,answer,choices:[answer,...distract.slice(0,3).map(x=>`${x[1]} ${x[0]}`)],category:s.cat,tags:['気持ち',s.cat],explanation:'場面と自分の体の感じを手がかりに、気持ちに名前をつけます。',cat:'気持ち',illust:f[1]+' 🧒',scene:prompt,tip:'気持ちに名前をつける練習です。'};});
}
const waitEvents=[
 ['自分の前に一人使っている人がいます','「終わったら教えてね」と伝えて、少し離れて待つ'],['列に並んでいて、自分の番はまだ先です','前の人との間を空け、列の順番を守って待つ'],['先生が別の人と話しています','近くで待ち、話が区切れたら「今いいですか」と声をかける'],['友だちが使っている道具を使いたくなりました','勝手に取らず「次に使っていい？」と確認する'],['ゲームで自分の手番ではありません','今の人の手番を見ながら、自分の番まで待つ'],['おやつや配布物が順番に配られています','自分の場所で待ち、順番が来たら受け取る'],['移動の合図がまだ出ていません','先に走り出さず、合図を聞いてから動く']
];
function makeWaitGenerated(){return BASE.map((s,i)=>{const [ev,a]=waitEvents[s.variant];const prompt=`${s.catLabel}の「${s.place}」で、${ev}。${s.mod} どう待つとよいですか？`;return {prompt,answer:a,choices:[a,'待てないので割り込む','相手の物を勝手に取る','大声で何度も急かす'],category:s.cat,tags:['順番','待つ',s.cat],explanation:'順番・相手との距離・次に声をかけるタイミングを確認すると待ちやすくなります。',cat:'順番・待つ',illust:'⏳',scene:prompt,tip:'順番と待つ場所を確認します。'};});}
const troubleEvents=[
 ['使いたい物が同じで言い合いになりました','いったん手を止め、順番や交代方法を話し合う'],['遊びのルールについて意見が分かれました','ルールを一緒に確認し、必要なら大人にも確認する'],['相手の言い方が嫌で腹が立ちました','手を出さず「その言い方は嫌」と伝え、離れる選択もする'],['自分の物を勝手に使われました','「使う前に聞いてほしい」と伝え、返してもらう方法を相談する'],['ぶつかったことをきっかけにお互い怒っています','まず距離を取り、落ち着いてから起きたことを順番に話す'],['仲間に入れてもらえず寂しくなりました','「一緒にやってもいい？」と聞き、難しければ別の遊びも選ぶ'],['約束した内容を相手が覚えていませんでした','決めつけて責めず、約束を確認して次の方法を一緒に決める']
];
function makeTroubleGenerated(){return BASE.map((s,i)=>{const [ev,a]=troubleEvents[s.variant];const prompt=`${s.catLabel}の「${s.place}」で、${ev}。${s.mod} まずどうしますか？`;return {prompt,answer:a,choices:[a,'相手を押したり物を投げたりする','みんなの前で悪口を言い続ける','何があったか確認せず仕返しする'],category:s.cat,tags:['トラブル',s.cat],explanation:'まず安全を確保して落ち着き、事実・気持ち・希望を順番に伝えます。',cat:'トラブル対応',illust:'🤝',scene:prompt,tip:'手を出す前に止まり、言葉や大人への相談で解決方法を探します。'};});}
function makeRoleplayGenerated(){
 const skills=['助けを求める','上手に断る','気持ちを伝える','聞き返す','仲直り','相手の立場'];
 const banks=[makeSkillBank('help','rp-h'),makeSkillBank('refuse','rp-r'),makeSkillBank('feel','rp-f'),makeSkillBank('listen','rp-l'),makeSkillBank('repair','rp-x'),makeSkillBank('perspective','rp-p')];
 return BASE.map((s,i)=>{const m=i%6,q=banks[m][i];return {prompt:q.prompt,answer:q.answer,goal:`${skills[m]}を自分の言葉で練習する`,model:q.answer,category:s.cat,tags:['ロールプレイ',skills[m]]};});
}
function makeCognitive(){
 const out=[];
 const symbols=['★','○','△','□','◇','♡','♣','♠','♪','☀'];
 const colors=['あか','あお','きいろ','みどり','むらさき','オレンジ','しろ','くろ','みずいろ','ピンク'];
 function push(family,n,q){out.push({...q,id:`cog-${family}-${String(n+1).padStart(3,'0')}`,category:family,tags:[family]});}
 for(let n=0;n<100;n++){
   const s=symbols[n%10],c=colors[Math.floor(n/10)%10],target=symbols[(n+3)%10];
   const answer=`${c}の${s}`;push('visual',n,{prompt:`「${answer}」と同じ色と形を選びます。目印は ${target} です。`,answer,choices:[answer,`${colors[(n+1)%10]}の${s}`,`${c}の${symbols[(n+1)%10]}`,`${colors[(n+2)%10]}の${symbols[(n+2)%10]}`],scene:`👀 ${answer} をさがそう`,illust:`${s} ${target}`,explanation:'色と形の両方を見て照合します。',tip:'色と形の二つの手がかりを確認します。'});
 }
 for(let n=0;n<100;n++){
   const seq=[symbols[n%10],symbols[Math.floor(n/10)%10],symbols[(n*3+1)%10],symbols[(n*7+2)%10]];const pos=n%4,ans=seq[pos];
   const dist=symbols.filter(x=>x!==ans).slice(0,3);push('memory',n,{prompt:`${seq.join(' ')} を覚えてください。左から ${pos+1} ばんめは何でしたか？`,answer:ans,choices:[ans,...dist],scene:`🧠 ${seq.join('  ')}`,illust:'🧠',explanation:'短い並びを覚えて、位置を思い出します。',tip:'最初に並び全体を見てから、聞かれた位置を思い出します。'});
 }
 for(let n=0;n<100;n++){
   const start=1+(n%20),step=1+(Math.floor(n/20)%5),ans=start+step*4;const seq=[0,1,2,3].map(k=>start+step*k);
   push('sequence',n,{prompt:`${seq.join('、')} の次にくる数字はどれですか？`,answer:String(ans),choices:[String(ans),String(ans+step),String(Math.max(0,ans-step)),String(ans+1)],scene:`🔢 ${seq.join(' → ')} → ?`,illust:'🔢',explanation:`${step}ずつ増える並びです。`,tip:'となり合う数字がいくつずつ変わっているか見ます。'});
 }
 for(let n=0;n<100;n++){
   const target=symbols[Math.floor(n/10)%10],shown=symbols[n%10],rule=`${target}のときだけ押す`,ans=shown===target?'押す':'押さない';
   push('inhibition',n,{prompt:`ルールは「${rule}」。いま「${shown}」が出ました。どうしますか？`,answer:ans,choices:[ans,ans==='押す'?'押さない':'押す','ルールを変える','何度も連打する'],scene:`✋ ルール：${rule}\n表示：${shown}`,illust:shown,explanation:'先にルールを確認してから反応します。',tip:'見えたものだけでなく、最初のルールを思い出します。'});
 }
 for(let n=0;n<100;n++){
   const a=2+(n%20),b=a+1+(Math.floor(n/20)%5),c=b+1+(n%4);const ans=String(c);push('reasoning',n,{prompt:`${a}、${b}、${c} の3つでは、いちばん大きい数字はどれですか？`,answer:ans,choices:[ans,String(a),String(b),String(Math.max(1,c-2))],scene:`🧩 ${a}・${b}・${c} をくらべよう`,illust:'🧩',explanation:'三つの情報を比べて、一番大きいものを選びます。',tip:'一つずつ比べて、条件に合うものを残します。'});
 }
 // Per-family difficulty 40/40/20 -> global 200/200/100.
 const familySeen={};for(const q of out){const k=q.category;const idx=familySeen[k]||0;q.difficulty=idx<40?'easy':idx<80?'normal':'challenge';familySeen[k]=idx+1;q.choices=[...new Set(q.choices)];while(q.choices.length<4)q.choices.push(`ほかの答え ${q.choices.length+1}`);}
 return out;
}
function getOldDanger(file){const x=extractConstExpression(path.join(root,file),'DATA');if(!x)return[];const arr=evaluateExpr(x.expr);return standardObjective(file.startsWith('danger')?'danger':'sstq',arr.map(q=>({prompt:q[0],answer:q[1],choices:[q[1],...(q[2]||[])],category:categoryForText(q[0]),tags:['既存'],explanation:q[3]||''})));}
function getOldObject(file){const x=extractConstExpression(path.join(root,file),'DATA');if(!x)return[];const arr=evaluateExpr(x.expr);return standardObjective(file.replace(/\.html$/,''),arr.map(q=>{const good=(q.choices||[]).find(c=>c.ok);return {prompt:q.scene||'',answer:good?.text||'',choices:(q.choices||[]).map(c=>c.text),category:categoryForText(q.scene||''),tags:['既存'],explanation:q.tip||'',cat:q.cat||'',illust:q.illust||'🌈',scene:q.scene||'',tip:q.tip||''};}));}
function getOldRoleplay(){const x=extractConstExpression(path.join(root,'sst_roleplay.html'),'SCENES');if(!x)return[];const arr=evaluateExpr(x.expr);return uniqueBySemantic(arr.map((q,i)=>({id:`roleplay-legacy-${String(i+1).padStart(3,'0')}`,prompt:q[1],answer:q[2],goal:q[0],model:q[2],category:categoryForText(q[1]),tags:['既存',q[0]]})));}
function getOldSkills(){const x=extractConstExpression(path.join(root,'sst_skills.html'),'DB');if(!x)return{};const db=evaluateExpr(x.expr),out={};for(const [mode,v] of Object.entries(db)){out[mode]=uniqueBySemantic((v.q||[]).map((q,i)=>({id:`${mode}-legacy-${String(i+1).padStart(3,'0')}`,prompt:q[0],answer:q[1][q[2]],choices:q[1],category:categoryForText(q[0]),tags:['既存',mode],explanation:q[3]})));}return out;}

const RUNTIME=`\nconst NIJI_QUESTION_BANK_VERSION='${VERSION}';\nfunction nijiShuffleIds(values){const a=values.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}\nfunction createQuestionBag(opts){const ids=[...new Set(opts.ids.map(String))],key='nijifla_qbag_v1:'+opts.gameId+':'+(opts.difficulty||'all');let state=null;try{state=JSON.parse(localStorage.getItem(key)||'null')}catch(e){};const valid=state&&state.bankVersion===opts.bankVersion&&Array.isArray(state.order)&&state.order.length===ids.length&&state.order.every(x=>ids.includes(String(x)))&&Number.isInteger(state.cursor);if(!valid)state={bankVersion:opts.bankVersion,order:nijiShuffleIds(ids),cursor:0};function save(){try{localStorage.setItem(key,JSON.stringify(state))}catch(e){}}function draw(n){const out=[],used=new Set();while(out.length<n){if(state.cursor>=state.order.length)state={bankVersion:opts.bankVersion,order:nijiShuffleIds(ids),cursor:0};const id=String(state.order[state.cursor++]);if(used.has(id))continue;used.add(id);out.push(id);save()}return out}return{draw}}\nfunction nijiDrawBalanced(bank,gameId,count){const ratio=count===10?{easy:4,normal:4,challenge:2}:null,byId=new Map(bank.map(q=>[q.id,q]));if(!ratio){const ids=bank.map(q=>q.id),bag=createQuestionBag({gameId,difficulty:'all',bankVersion:NIJI_QUESTION_BANK_VERSION,ids});return bag.draw(count).map(id=>byId.get(id))}let out=[];for(const d of ['easy','normal','challenge']){const ids=bank.filter(q=>q.difficulty===d).map(q=>q.id),bag=createQuestionBag({gameId,difficulty:d,bankVersion:NIJI_QUESTION_BANK_VERSION,ids});out.push(...bag.draw(ratio[d]).map(id=>byId.get(id)))}return nijiShuffleIds(out)}\n`;
function markerConst(name,marker,bank){return `const ${name}=\n/* NIJI_BANK:${marker}:START */\n${JSON.stringify(bank)}\n/* NIJI_BANK:${marker}:END */\n;\n`;}
function replaceConst(file,name,replacement){const p=path.join(root,file),x=extractConstExpression(p,name);if(!x)throw new Error(`${file}: const ${name} not found`);let src=x.src;src=src.slice(0,x.start)+replacement+src.slice(x.end);fs.writeFileSync(p,src);}
function ensureRuntime(file){const p=path.join(root,file);let src=fs.readFileSync(p,'utf8');if(src.includes("const NIJI_QUESTION_BANK_VERSION='"))return;const idx=src.indexOf('<script>',src.indexOf('</main>'));if(idx<0)throw new Error(`${file}: main script not found`);src=src.slice(0,idx+8)+RUNTIME+src.slice(idx+8);fs.writeFileSync(p,src);}
function replaceText(file,from,to){const p=path.join(root,file);let src=fs.readFileSync(p,'utf8');if(!src.includes(from))throw new Error(`${file}: replacement source missing`);src=src.replace(from,to);fs.writeFileSync(p,src);}

function build(){
 // danger
 let danger=finalize('danger',getOldDanger('danger_game.html'),makeDangerGenerated(),500,false);
 replaceConst('danger_game.html','DATA',markerConst('DATA','danger',danger));ensureRuntime('danger_game.html');
 replaceText('danger_game.html','function start(){const seen=new Set();deck=[];shuffle(DATA).forEach(q=>{if(!seen.has(q[0])&&deck.length<10){seen.add(q[0]);deck.push(q)}});i=0;ok=0;records=[];document.getElementById("report").classList.add("hidden");show()}','function start(){deck=nijiDrawBalanced(DATA,"danger",10);i=0;ok=0;records=[];document.getElementById("report").classList.add("hidden");show()}');
 replaceText('danger_game.html','const q=deck[i];current=q[0];document.getElementById("num").textContent=i+1;document.getElementById("scene").innerHTML=R(q[0]);const box=document.getElementById("choices");box.innerHTML="";shuffle([q[1],...q[2]]).forEach(t=>{const b=document.createElement("button");b.type="button";b.className="choice";b.innerHTML=R(t);b.onclick=()=>answer(t===q[1],t,b,q);box.appendChild(b)})','const q=deck[i];current=q.prompt;document.getElementById("num").textContent=i+1;document.getElementById("scene").innerHTML=R(q.prompt);const box=document.getElementById("choices");box.innerHTML="";shuffle(q.choices).forEach(t=>{const b=document.createElement("button");b.type="button";b.className="choice";b.innerHTML=R(t);b.onclick=()=>answer(t===q.answer,t,b,q);box.appendChild(b)})');
 replaceText('danger_game.html','records.push({scene:q[0],selected,correct:q[1],ok:good,point:q[3]});document.getElementById("tip").classList.remove("hidden");document.getElementById("tip").innerHTML=\'<b>\'+R("ポイント")+\'</b><br>\'+R(q[3]);','records.push({id:q.id,scene:q.prompt,selected,correct:q.answer,ok:good,point:q.explanation});document.getElementById("tip").classList.remove("hidden");document.getElementById("tip").innerHTML=\'<b>\'+R("ポイント")+\'</b><br>\'+R(q.explanation);');
 // cognitive
 const cog=makeCognitive();replaceConst('cognitive_check_10min.html','DATA',markerConst('DATA','cognitive',cog));ensureRuntime('cognitive_check_10min.html');
 replaceText('cognitive_check_10min.html','function start(){clearInterval(timer);deck=shuffle(DATA).slice(0,10);idx=0;score=0;records=[];document.getElementById(\'score\').textContent=score;document.getElementById(\'total\').textContent=deck.length;document.getElementById(\'report\').classList.add(\'hidden\');document.getElementById(\'report\').innerHTML=\'\';showQuestion()}','function start(){clearInterval(timer);deck=nijiDrawBalanced(DATA,"cognitive",10);idx=0;score=0;records=[];document.getElementById(\'score\').textContent=score;document.getElementById(\'total\').textContent=deck.length;document.getElementById(\'report\').classList.add(\'hidden\');document.getElementById(\'report\').innerHTML=\'\';showQuestion()}');
 // sst quiz
 let sstq=finalize('sstq',getOldDanger('sst_quiz.html'),makeSstQuizGenerated(),500,false);replaceConst('sst_quiz.html','DATA',markerConst('DATA','sstQuiz',sstq));ensureRuntime('sst_quiz.html');
 replaceText('sst_quiz.html','function start(){const seen=new Set();deck=[];shuffle(DATA).forEach(q=>{if(!seen.has(q[0])&&deck.length<10){seen.add(q[0]);deck.push(q)}});i=0;ok=0;records=[];document.getElementById("report").classList.add("hidden");show()}','function start(){deck=nijiDrawBalanced(DATA,"sstQuiz",10);i=0;ok=0;records=[];document.getElementById("report").classList.add("hidden");show()}');
 replaceText('sst_quiz.html','const q=deck[i];current=q[0];document.getElementById("num").textContent=i+1;document.getElementById("scene").innerHTML=R(q[0]);const box=document.getElementById("choices");box.innerHTML="";shuffle([q[1],...q[2]]).forEach(t=>{const b=document.createElement("button");b.type="button";b.className="sstChoice";b.innerHTML=R(t);b.onclick=()=>answer(t===q[1],t,b,q);box.appendChild(b)})','const q=deck[i];current=q.prompt;document.getElementById("num").textContent=i+1;document.getElementById("scene").innerHTML=R(q.prompt);const box=document.getElementById("choices");box.innerHTML="";shuffle(q.choices).forEach(t=>{const b=document.createElement("button");b.type="button";b.className="sstChoice";b.innerHTML=R(t);b.onclick=()=>answer(t===q.answer,t,b,q);box.appendChild(b)})');
 replaceText('sst_quiz.html','records.push({scene:q[0],selected,correct:q[1],ok:good,point:q[3]});document.getElementById("tip").classList.remove("hidden");document.getElementById("tip").innerHTML=\'<b>\'+R("ポイント")+\'</b><br>\'+R(q[3]);','records.push({id:q.id,scene:q.prompt,selected,correct:q.answer,ok:good,point:q.explanation});document.getElementById("tip").classList.remove("hidden");document.getElementById("tip").innerHTML=\'<b>\'+R("ポイント")+\'</b><br>\'+R(q.explanation);');
 // roleplay
 const rp=finalize('roleplay',getOldRoleplay(),makeRoleplayGenerated(),500,true);replaceConst('sst_roleplay.html','SCENES',markerConst('SCENES','sstRoleplay',rp));ensureRuntime('sst_roleplay.html');
 replaceText('sst_roleplay.html','function sh(a){return [...a].sort(()=>Math.random()-.5)}function begin(){deck=sh(SCENES).slice(0,5);','function sh(a){return nijiShuffleIds(a)}function begin(){deck=nijiDrawBalanced(SCENES,"sstRoleplay",5);');
 replaceText('sst_roleplay.html','const s=deck[i];stage.innerHTML=`<div class="scene"><b>${s[0]}</b>\\n${s[1]}</div><div class="roleBox"><div class="small">① 職員が相手役として場面を提示　② 本人が自分の言葉で伝える　③ 必要なら下の見本を使う</div><div class="model">${s[2]}</div>','const s=deck[i];stage.innerHTML=`<div class="scene"><b>${s.goal}</b>\\n${s.prompt}</div><div class="roleBox"><div class="small">① 職員が相手役として場面を提示　② 本人が自分の言葉で伝える　③ 必要なら下の見本を使う</div><div class="model">${s.model}</div>');
 replaceText('sst_roleplay.html','function rate(r,s){if(r===\'independent\')independent++;ratings.push({skill:s[0],scene:s[1],model:s[2],rating:r});i++;show()}','function rate(r,s){if(r===\'independent\')independent++;ratings.push({id:s.id,skill:s.goal,scene:s.prompt,model:s.model,rating:r});i++;show()}');
 // skills
 const oldSkills=getOldSkills();const modes=['help','refuse','feel','listen','repair','perspective'];const prefixes={help:'help',refuse:'refuse',feel:'feel',listen:'listen',repair:'repair',perspective:'persp'};
 const banks={};for(const m of modes)banks[m]=finalize(prefixes[m],oldSkills[m]||[],makeSkillBank(m,prefixes[m]),500,false);
 const skillDecl=modes.map(m=>markerConst('BANK_'+m.toUpperCase(),m,banks[m])).join('\n');
 const p=path.join(root,'sst_skills.html');let src=fs.readFileSync(p,'utf8'),x=extractConstExpression(p,'DB');if(!x)throw new Error('sst_skills DB not found');
 const meta={help:['助けを求める','🆘','困ったときに、具体的に助けを頼む練習です。'],refuse:['上手に断る','✋','嫌なこと・できないことを、相手を傷つけにくい言葉で断ります。'],feel:['気持ちを伝える','💗','自分の気持ちと希望を言葉にします。'],listen:['聞く・会話を続ける','👂','相手の話を聞き、確認したり質問したりする練習です。'],repair:['仲直り・やり直し','🤝','失敗やトラブルのあとに、関係を戻す行動を考えます。'],perspective:['相手の立場を考える','🧠','自分とは違う気持ちや考えがあることを練習します。']};
 const db=`const DB={${modes.map(m=>`${m}:{title:${JSON.stringify(meta[m][0])},icon:${JSON.stringify(meta[m][1])},lead:${JSON.stringify(meta[m][2])},q:BANK_${m.toUpperCase()}}`).join(',')}}`;
 src=src.slice(0,x.start)+skillDecl+db+src.slice(x.end);fs.writeFileSync(p,src);ensureRuntime('sst_skills.html');
 replaceText('sst_skills.html','function startGame(){deck=sh(M.q).slice(0,10);','function startGame(){deck=nijiDrawBalanced(M.q,"sstSkill-"+mode,10);');
 replaceText('sst_skills.html','const q=deck[i], opts=sh(q[1].map((t,idx)=>({t,ok:idx===q[2]})));stage.innerHTML=`<div class="scene">${q[0]}</div><div class="choices">${opts.map((x,n)=>`<button class="choice" data-n="${n}">${x.t}</button>`).join(\'\')}</div><div class="feedback" id="fb">自分ならどうするか選んでみよう。</div>`;[...document.querySelectorAll(\'.choice\')].forEach((b,n)=>b.onclick=()=>answer(opts[n],b,q))','const q=deck[i], opts=sh(q.choices.map(t=>({t,ok:t===q.answer})));stage.innerHTML=`<div class="scene">${q.prompt}</div><div class="choices">${opts.map((x,n)=>`<button class="choice" data-n="${n}">${x.t}</button>`).join(\'\')}</div><div class="feedback" id="fb">自分ならどうするか選んでみよう。</div>`;[...document.querySelectorAll(\'.choice\')].forEach((b,n)=>b.onclick=()=>answer(opts[n],b,q))');
 replaceText('sst_skills.html','document.getElementById(\'fb\').innerHTML=`<b>${opt.ok?\'○ よい選び方です\':\'△ 一緒に確認しよう\'}</b><br>${q[3]}`;details.push({scene:q[0],selected:opt.t,ok:opt.ok,tip:q[3]});','document.getElementById(\'fb\').innerHTML=`<b>${opt.ok?\'○ よい選び方です\':\'△ 一緒に確認しよう\'}</b><br>${q.explanation}`;details.push({id:q.id,scene:q.prompt,selected:opt.t,correct:q.answer,ok:opt.ok,tip:q.explanation});');
 // object pages
 const objSpecs=[['feeling_choice.html','feelingChoice',makeFeelingGenerated()],['turn_waiting.html','turnWaiting',makeWaitGenerated()],['trouble_response.html','troubleResponse',makeTroubleGenerated()]];
 for(const [file,marker,gen] of objSpecs){let bank=finalize(marker,getOldObject(file),gen,500,false); // keep marker schema validator-friendly; adapt choices at render time
   bank=bank.map(q=>({...q,cat:q.cat||label(q.category),illust:q.illust||'🌈',scene:q.scene||q.prompt,tip:q.tip||q.explanation}));
   replaceConst(file,'DATA',markerConst('DATA',marker,bank));ensureRuntime(file);
   replaceText(file,'function start(){deck=shuffle(DATA).slice(0,10);','function start(){deck=nijiDrawBalanced(DATA,"'+marker+'",10);');
   replaceText(file,"shuffle(q.choices).forEach(c=>{let d=document.createElement('div');d.className='choice';d.textContent=c.text;d.onclick=()=>answer(c,d);box.appendChild(d)})","shuffle(q.choices).forEach(t=>{const c={text:t,ok:t===q.answer};let d=document.createElement('div');d.className='choice';d.textContent=c.text;d.onclick=()=>answer(c,d);box.appendChild(d)})");
   replaceText(file,"let good=q.choices.find(x=>x.ok);wrong.push({cat:q.cat,illust:q.illust,scene:q.scene,selected:c.text,correct:good?good.text:'',tip:q.tip});","wrong.push({cat:q.cat,illust:q.illust,scene:q.scene,selected:c.text,correct:q.answer,tip:q.tip});");
 }
 console.log('Built Phase 2 banks');
}
build();
