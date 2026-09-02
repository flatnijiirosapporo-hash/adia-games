'use strict';
const VERSION='2026-09-02-q500-v1';
const TARGET_IDS=['colorquiz','shapequiz','hiraarrange','kataarrange','hirasearch','katasearch','idiomarrange','continents','prefecture','dicetalk','traffic','words','moraread','kanjipuzzle','bushu','palindrome','idiomsearch'];
const diff=i=>i<200?'easy':i<400?'normal':'challenge';
const uniq=a=>[...new Set(a)];
function choiceSet(answer,pool,n=3){const out=[answer];for(const x of pool){if(String(x)!==String(answer)&&!out.includes(x))out.push(x);if(out.length>=n+1)break}return out;}
function finalize(id,rows,all=false){if(rows.length<500)throw new Error(`${id}: ${rows.length}`);return rows.slice(0,500).map((q,i)=>({...q,id:`${id}-${String(i+1).padStart(3,'0')}`,difficulty:all?'all':diff(i),category:q.category||id,tags:q.tags||[id]}));}

function colorBank(){
 const defs=[
  ['あか',0],['オレンジ',28],['きいろ',55],['きみどり',85],['みどり',120],['みずいろ',190],['あお',220],['むらさき',275],['ピンク',330],['ちゃいろ',25],
  ['しろ',0],['くろ',0],['はいいろ',0],['こんいろ',230],['ベージュ',42],['きんいろ',48],['ぎんいろ',0],['えんじ',345],['ラベンダー',265],['ターコイズ',175]
 ];
 const names=defs.map(x=>x[0]);const rows=[];
 for(let round=0;round<25;round++)for(let j=0;j<defs.length;j++){
   const [name,h]=defs[j];let swatch;
   if(name==='しろ')swatch=`hsl(0 0% ${99-round*0.35}%)`;else if(name==='くろ')swatch=`hsl(0 0% ${5+round*0.55}%)`;else if(name==='はいいろ')swatch=`hsl(0 0% ${34+round*1.15}%)`;else if(name==='ぎんいろ')swatch=`hsl(${205+(round%5)} ${6+(round%4)}% ${64+round*0.65}%)`;else swatch=`hsl(${(h+(round%7)-3+360)%360} ${name==='ベージュ'?32+(round%6):58+(round%8)*4}% ${name==='ちゃいろ'||name==='えんじ'||name==='こんいろ'?26+round*0.7:40+round*0.8}%)`;
   const distract=names.slice(j+1).concat(names.slice(0,j));rows.push({prompt:'表示された色に、いちばん近い色の名前を選びます。',answer:name,choices:choiceSet(name,distract,3),explanation:'色そのものを見て、名前と結びつけます。',payload:{swatch},stimulusKey:swatch,category:'color'});
 }
 return finalize('colorquiz',rows);
}
function shapeBank(){
 const defs=[
  {name:'円',symbol:'○',sides:0,corners:0},{name:'三角形',symbol:'△',sides:3,corners:3},{name:'正方形',symbol:'□',sides:4,corners:4},{name:'長方形',symbol:'▭',sides:4,corners:4},{name:'ひし形',symbol:'◇',sides:4,corners:4},{name:'五角形',symbol:'⬟',sides:5,corners:5},{name:'六角形',symbol:'⬢',sides:6,corners:6},{name:'八角形',symbol:'🛑',sides:8,corners:8},{name:'星形',symbol:'☆',sides:10,corners:10},{name:'半円',symbol:'◐',sides:2,corners:2}
 ];
 const names=defs.map(x=>x.name),rows=[];
 const tasks=['name','name2','sides','corners','desc'];
 for(let rep=0;rep<10;rep++)for(const d of defs)for(const task of tasks){
   let prompt,answer,choices;
   if(task==='name'||task==='name2'){prompt=task==='name'?'この図形の名前はどれですか？':'向きが変わっても同じ図形です。名前を選びます。';answer=d.name;choices=choiceSet(answer,names.filter(x=>x!==answer).slice(rep).concat(names),3);}
   else if(task==='sides'){prompt=`この図形の「まっすぐな辺」は何本ですか？`;answer=String(d.sides);choices=choiceSet(answer,['0','2','3','4','5','6','8','10'],3);}
   else if(task==='corners'){prompt='この図形の角はいくつありますか？';answer=String(d.corners);choices=choiceSet(answer,['0','2','3','4','5','6','8','10'],3);}
   else{prompt=`「辺 ${d.sides}・角 ${d.corners}」の特徴に合う名前を選びます。`;answer=d.name;choices=choiceSet(answer,names.slice(rep).concat(names),3);}
   rows.push({prompt,answer,choices,explanation:'形の名前だけでなく、辺や角などの特徴にも注目します。',payload:{symbol:d.symbol,name:d.name,rotation:(rep*18)%180},stimulusKey:`${d.symbol}|${(rep*18)%180}|${task}`,category:'shape'});
 }
 return finalize('shapequiz',rows);
}
const HIRA_COLORS=['あかい','あおい','きいろい','みどりの','しろい','くろい','むらさきの','おれんじの','ぴんくの','みずいろの'];
const HIRA_NOUNS=['くるま','かさ','ぼうし','かばん','くつ','ふく','こっぷ','さら','はこ','えんぴつ','けしごむ','のーと','つくえ','いす','じてんしゃ','ぼーる','ふうせん','はな','いえ','どあ','まど','かみ','たおる','びん','すいとう','ほん','つみき','おもちゃ','りぼん','はんかち','てぶくろ','ながぐつ','じょうろ','ばけつ','べんち','ぶらんこ','すべりだい','とけい','でんわ','らいと','ふでばこ','ものさし','はさみ','くれよん','えのぐ','せんぷうき','かーてん','まくら','もうふ','ぬいぐるみ'];
function hiraWords(){const a=[];for(const c of HIRA_COLORS)for(const n of HIRA_NOUNS)a.push((c+n).replace(/ー/g,'う'));return a.slice(0,500)}
const KATA_COLORS=['レッド','ブルー','イエロー','グリーン','ホワイト','ブラック','パープル','オレンジ','ピンク','ライトブルー'];
const KATA_NOUNS=['カー','バッグ','キャップ','シューズ','シャツ','カップ','プレート','ボックス','ペン','ノート','デスク','チェア','サイクル','ボール','バルーン','フラワー','ハウス','ドア','ウィンドウ','ペーパー','タオル','ボトル','ブック','ブロック','トイ','リボン','ハンカチ','グローブ','ブーツ','ポット','バケツ','ベンチ','ブランコ','スライダー','クロック','フォン','ライト','ケース','ルーラー','ハサミ','クレヨン','カラー','ファン','カーテン','ピロー','ブランケット','ドール','カメラ','ラジオ','テーブル'];
function kataWords(){const a=[];for(const c of KATA_COLORS)for(const n of KATA_NOUNS)a.push(c+n);return a.slice(0,500)}
function wordBank(id,words,kind){
 const rows=words.map((w,i)=>{const wrong=[words[(i+7)%words.length],words[(i+19)%words.length],words[(i+41)%words.length]];return {prompt:kind==='arrange'?`文字を正しい順番に並べて「${w}」を作ります。`:`文字の中から「${w}」を順番に見つけます。`,answer:w,choices:[w,...wrong],explanation:'文字の順番とまとまりを見て取り組みます。',payload:{word:w},category:kind};});return finalize(id,rows);
}

const IDIOMS=[
'一石二鳥','一期一会','温故知新','十人十色','以心伝心','試行錯誤','切磋琢磨','臨機応変','有言実行','初志貫徹','七転八起','日進月歩','一生懸命','全力投球','一致団結','協力一致','適材適所','公明正大','正々堂々','勇気凛々','前途洋々','意気投合','一喜一憂','喜怒哀楽','自業自得','因果応報','自給自足','一長一短','長所短所','大器晩成','電光石火','疾風迅雷','百発百中','千載一遇','危機一髪','九死一生','起死回生','絶体絶命','一触即発','油断大敵','用意周到','準備万端','周知徹底','整理整頓','質実剛健','文武両道','才色兼備','品行方正','温厚篤実','誠心誠意','真剣勝負','完全燃焼','不言実行','言行一致','創意工夫','独立独歩','自由自在','縦横無尽','変幻自在','神出鬼没','東奔西走','右往左往','四苦八苦','悪戦苦闘','暗中模索','五里霧中','疑心暗鬼','半信半疑','興味津々','津々浦々','老若男女','古今東西','森羅万象','天地無用','天真爛漫','純真無垢','無我夢中','我武者羅','猪突猛進','勇猛果敢','大胆不敵','冷静沈着','泰然自若','平穏無事','無病息災','家内安全','交通安全','健康第一','一日千秋','一朝一夕','朝令暮改','三日坊主','二人三脚','三位一体','一心同体','一網打尽','一目瞭然','単刀直入','言語道断','異口同音','満場一致'
];
function idiomBank(id,kind){
 const clues=['文字を並べ替えます','四文字を順番に確認します','最初と最後の漢字に注目します','中央の二文字にも注目します','四文字を一つのまとまりとして見ます'];const rows=[];
 for(let v=0;v<5;v++)for(let i=0;i<IDIOMS.length;i++){const w=IDIOMS[i],wrong=[IDIOMS[(i+11)%IDIOMS.length],IDIOMS[(i+27)%IDIOMS.length],IDIOMS[(i+43)%IDIOMS.length]];rows.push({prompt:`${clues[v]}。目標は「${w}」です。`,answer:w,choices:[w,...wrong],explanation:'四文字の並びを一文字ずつ確かめます。',payload:{word:w,variant:v},category:'idiom'});}
 return finalize(id,rows);
}

const GEO=[
 {name:'アジア',kind:'大陸',clue:'日本を含む、世界で最も広い大陸地域です'}, {name:'ヨーロッパ',kind:'大陸',clue:'アジアの西側に続く大陸地域です'}, {name:'アフリカ',kind:'大陸',clue:'赤道が通り、地中海の南に広がる大陸です'}, {name:'北アメリカ',kind:'大陸',clue:'北半球の西側に広がる大陸です'}, {name:'南アメリカ',kind:'大陸',clue:'北アメリカの南側に続く大陸です'}, {name:'オーストラリア',kind:'大陸',clue:'南半球にある、最も小さい大陸です'}, {name:'太平洋',kind:'海洋',clue:'日本の東側に広がる大きな海洋です'}, {name:'大西洋',kind:'海洋',clue:'アメリカ大陸とヨーロッパ・アフリカの間の海洋です'}, {name:'インド洋',kind:'海洋',clue:'アフリカ・アジア・オーストラリアの間に広がる海洋です'}
];
function continentsBank(){
 const rows=[], names=GEO.map(x=>x.name), counts=['0','1','2','3','4'];
 const choose=(arr,k)=>{const out=[];const go=(start,pick)=>{if(pick.length===k){out.push(pick.slice());return;}for(let i=start;i<arr.length;i++){pick.push(arr[i]);go(i+1,pick);pick.pop();}};go(0,[]);return out;};
 for(const g of GEO){
   rows.push({prompt:g.clue+'。この名前はどれですか？',answer:g.name,choices:choiceSet(g.name,names.filter(x=>x!==g.name),3),explanation:g.clue+'。',payload:{names:[g.name],task:'clue-name'},category:'world'});
   rows.push({prompt:`「${g.name}」は大陸と海洋のどちらですか？`,answer:g.kind,choices:['大陸','海洋'],explanation:g.clue+'。',payload:{names:[g.name],task:'kind'},category:'world'});
   rows.push({prompt:`「${g.name}」について正しい種類と名前の組み合わせを選びます。`,answer:`${g.kind}・${g.name}`,choices:choiceSet(`${g.kind}・${g.name}`,GEO.filter(x=>x.name!==g.name).map(x=>`${x.kind}・${x.name}`),3),explanation:g.clue+'。',payload:{names:[g.name],task:'kind-name'},category:'world'});
 }
 for(const pair of choose(GEO,2)){
   const label=pair.map(x=>x.name).join('・'); const ocean=pair.filter(x=>x.kind==='海洋').length; const continent=2-ocean;
   rows.push({prompt:`「${label}」の2つのうち、海洋はいくつありますか？`,answer:String(ocean),choices:['0','1','2'],explanation:pair.map(x=>`${x.name}は${x.kind}`).join('、')+'。',payload:{names:pair.map(x=>x.name),task:'pair-ocean-count'},category:'world'});
   rows.push({prompt:`「${label}」の2つのうち、大陸はいくつありますか？`,answer:String(continent),choices:['0','1','2'],explanation:pair.map(x=>`${x.name}は${x.kind}`).join('、')+'。',payload:{names:pair.map(x=>x.name),task:'pair-continent-count'},category:'world'});
   const same=pair[0].kind===pair[1].kind?'はい':'いいえ';
   rows.push({prompt:`「${label}」は、どちらも同じ種類（大陸どうし／海洋どうし）ですか？`,answer:same,choices:['はい','いいえ'],explanation:pair.map(x=>`${x.name}は${x.kind}`).join('、')+'。',payload:{names:pair.map(x=>x.name),task:'pair-same-kind'},category:'world'});
 }
 for(const group of choose(GEO,3)){
   const label=group.map(x=>x.name).join('・');const ocean=group.filter(x=>x.kind==='海洋').length;const continent=3-ocean;
   rows.push({prompt:`「${label}」の3つのうち、海洋はいくつありますか？`,answer:String(ocean),choices:['0','1','2','3'],explanation:group.map(x=>`${x.name}は${x.kind}`).join('、')+'。',payload:{names:group.map(x=>x.name),task:'triple-ocean-count'},category:'world'});
   rows.push({prompt:`「${label}」の3つのうち、大陸はいくつありますか？`,answer:String(continent),choices:['0','1','2','3'],explanation:group.map(x=>`${x.name}は${x.kind}`).join('、')+'。',payload:{names:group.map(x=>x.name),task:'triple-continent-count'},category:'world'});
   rows.push({prompt:`「${label}」の中には、大陸と海洋の両方が入っていますか？`,answer:ocean>0&&continent>0?'はい':'いいえ',choices:['はい','いいえ'],explanation:group.map(x=>`${x.name}は${x.kind}`).join('、')+'。',payload:{names:group.map(x=>x.name),task:'triple-mixed'},category:'world'});
 }
 for(const group of choose(GEO,4)){
   if(rows.length>=500)break;const label=group.map(x=>x.name).join('・');const ocean=group.filter(x=>x.kind==='海洋').length;
   rows.push({prompt:`「${label}」の4つのうち、海洋はいくつありますか？`,answer:String(ocean),choices:counts,explanation:group.map(x=>`${x.name}は${x.kind}`).join('、')+'。',payload:{names:group.map(x=>x.name),task:'quad-ocean-count'},category:'world'});
 }
 return finalize('continents',rows);
}

const PREF=[
['北海道','北海道','札幌市'],['青森県','東北','青森市'],['岩手県','東北','盛岡市'],['宮城県','東北','仙台市'],['秋田県','東北','秋田市'],['山形県','東北','山形市'],['福島県','東北','福島市'],['茨城県','関東','水戸市'],['栃木県','関東','宇都宮市'],['群馬県','関東','前橋市'],['埼玉県','関東','さいたま市'],['千葉県','関東','千葉市'],['東京都','関東','新宿区'],['神奈川県','関東','横浜市'],['新潟県','中部','新潟市'],['富山県','中部','富山市'],['石川県','中部','金沢市'],['福井県','中部','福井市'],['山梨県','中部','甲府市'],['長野県','中部','長野市'],['岐阜県','中部','岐阜市'],['静岡県','中部','静岡市'],['愛知県','中部','名古屋市'],['三重県','近畿','津市'],['滋賀県','近畿','大津市'],['京都府','近畿','京都市'],['大阪府','近畿','大阪市'],['兵庫県','近畿','神戸市'],['奈良県','近畿','奈良市'],['和歌山県','近畿','和歌山市'],['鳥取県','中国','鳥取市'],['島根県','中国','松江市'],['岡山県','中国','岡山市'],['広島県','中国','広島市'],['山口県','中国','山口市'],['徳島県','四国','徳島市'],['香川県','四国','高松市'],['愛媛県','四国','松山市'],['高知県','四国','高知市'],['福岡県','九州','福岡市'],['佐賀県','九州','佐賀市'],['長崎県','九州','長崎市'],['熊本県','九州','熊本市'],['大分県','九州','大分市'],['宮崎県','九州','宮崎市'],['鹿児島県','九州','鹿児島市'],['沖縄県','沖縄','那覇市']
];
function prefectureBank(){
 const rows=[],names=PREF.map(x=>x[0]),caps=PREF.map(x=>x[2]),regions=uniq(PREF.map(x=>x[1]));
 for(let i=0;i<PREF.length;i++){
   const [name,region,capital]=PREF[i];
   rows.push({prompt:`${region}地方にあり、県庁所在地が「${capital}」の都道府県は？`,answer:name,choices:choiceSet(name,names.slice(i+1).concat(names),3),explanation:`${name}は${region}地方で、県庁所在地は${capital}です。`,payload:{prefecture:name,region,capital,task:'identify'},category:'japan'});
   rows.push({prompt:`「${name}」の県庁所在地はどこですか？`,answer:capital,choices:choiceSet(capital,caps.slice(i+1).concat(caps),3),explanation:`${name}の県庁所在地は${capital}です。`,payload:{prefecture:name,region,capital,task:'capital'},category:'japan'});
   rows.push({prompt:`「${name}」が属する地方区分を選びます。`,answer:region,choices:choiceSet(region,regions.filter(x=>x!==region),3),explanation:`${name}は${region}地方です。`,payload:{prefecture:name,region,capital,task:'region'},category:'japan'});
 }
 outer:for(let a=0;a<PREF.length;a++)for(let b=a+1;b<PREF.length;b++){
   if(rows.length>=500)break outer;
   const A=PREF[a],B=PREF[b],mode=(a+b)%3;
   if(mode===0){const ans=A[1]===B[1]?'はい':'いいえ';rows.push({prompt:`「${A[0]}」と「${B[0]}」は同じ地方区分ですか？`,answer:ans,choices:['はい','いいえ'],explanation:`${A[0]}は${A[1]}地方、${B[0]}は${B[1]}地方です。`,payload:{prefectures:[A[0],B[0]],task:'same-region'},category:'japan'});}
   else if(mode===1){const ans=`${A[2]}・${B[2]}`;const wrong=[`${B[2]}・${A[2]}`,`${PREF[(a+7)%PREF.length][2]}・${B[2]}`,`${A[2]}・${PREF[(b+11)%PREF.length][2]}`];rows.push({prompt:`「${A[0]}・${B[0]}」の県庁所在地の組み合わせとして正しいものは？`,answer:ans,choices:choiceSet(ans,wrong,3),explanation:`${A[0]}は${A[2]}、${B[0]}は${B[2]}です。`,payload:{prefectures:[A[0],B[0]],task:'capital-pair'},category:'japan'});}
   else {const ans=`${A[1]}・${B[1]}`;const wrong=[`${B[1]}・${A[1]}`,`${regions[(regions.indexOf(A[1])+1)%regions.length]}・${B[1]}`,`${A[1]}・${regions[(regions.indexOf(B[1])+2)%regions.length]}`];rows.push({prompt:`「${A[0]}・${B[0]}」の地方区分の組み合わせとして正しいものは？`,answer:ans,choices:choiceSet(ans,wrong,3),explanation:`${A[0]}は${A[1]}地方、${B[0]}は${B[1]}地方です。`,payload:{prefectures:[A[0],B[0]],task:'region-pair'},category:'japan'});}
 }
 return finalize('prefecture',rows);
}

function diceTalkBank(){const themes=[['好きなもの',['食べ物','遊び','本','音楽','動物']],['活動',['公園','運動','工作','読書','ゲーム']],['想像',['空を飛ぶ','動物と話す','未来へ行く','小さくなる','透明になる']],['協力',['片づけ','チーム活動','係','料理','共同制作']],['感謝',['手伝ってもらう','教えてもらう','待ってもらう','応援してもらう','貸してもらう']],['目標',['練習したいこと','覚えたいこと','できるようになりたいこと','挑戦したいこと','続けたいこと']],['選ぶ',['朝と夜','海と山','犬と猫','夏と冬','本と映画']],['ことば',['うれしい言葉','元気になる言葉','やさしい言葉','面白い言葉','応援の言葉']],['日常',['朝','昼','放課後','休日','雨の日']],['発見',['最近見つけたこと','不思議だと思うこと','きれいだと思うもの','便利だと思うもの','面白い形']]];const endings=['を一つ教えて','について短く話して','なら何を選ぶ？','の好きなところは？','でやってみたいことは？','を絵にするとしたら？','を友だちに紹介するなら？','で大切にしたいことは？','を別の方法で楽しむなら？','について質問を一つ作って'];const rows=[];for(const [theme,topics] of themes)for(const topic of topics)for(const e of endings)rows.push({prompt:`${topic}${e}`,answer:'自由回答',choices:[],explanation:'答えに正解・不正解はありません。話せる範囲で伝えます。',payload:{theme,topic},category:theme});return finalize('dicetalk',rows,true);}
function trafficBank(){const places=['横断歩道','学校の廊下','バス停','地下鉄ホーム','駐車場','公園の出入口','店の通路','階段','送迎車の乗り降り','自転車で曲がり角'];const situations=['急いでいます','友だちと話しています','前が見えにくいです','人が多くいます','床や道がぬれています','荷物を持っています','合図がまだ出ていません','車や人が近づいています','予定より遅れています','友だちが先に進みました'];const correct=['立ち止まって周囲を確認し、安全を確かめてから動く','決められた場所で待ち、合図や安全確認をしてから進む'];const focus=['まず最初にする安全な行動は？','安全を確かめるために、いちばんよい行動は？','友だちと一緒にいるときも安全にするには？','急いでいるときでも優先する行動は？','周囲の人や車の動きにも注意するとき、どうしますか？'];const rows=[];for(let p=0;p<places.length;p++)for(let s=0;s<situations.length;s++)for(let v=0;v<focus.length;v++){const a=correct[(p+s+v)%2];rows.push({prompt:`${places[p]}で${situations[s]}。${focus[v]}`,answer:a,choices:[a,'急いで走って先に進む','周りを見ず友だちだけについて行く','危ない場所で立ち止まってふざける'],explanation:'止まる・見る・聞く・待つを使って安全を確認します。',payload:{place:places[p],focus:focus[v]},category:'rules'});}return finalize('traffic',rows);}
function wordsBank(){const contexts=['順番を代わってほしい','今は一人で休みたい','貸してほしい物がある','相手の話を聞き取れなかった','遊びに入りたい','やめてほしいことがある','手伝ってほしい','意見が違う','失敗して謝りたい','応援したい'];const good=['「終わったら交代してもらえる？」','「今は一人で休むね」','「使い終わったら貸してもらえる？」','「もう一度お願いします」','「一緒にやってもいい？」','「それは嫌だからやめて」','「ここを手伝ってもらえますか？」','「私はこう思うよ。あなたはどう？」','「ごめんね。次は気をつける」','「がんばっているね。応援してるよ」'];const places=['学校','にじいろクラスフラット札幌','家','公園','お店'];const conditions=['相手も自分も落ち着いています','自分は少し急いでいます','相手が別のことをしています','周りにほかの人もいます','遊びや活動の途中です','一度気持ちを整えてから話します','相手の返事を待つ必要があります','声の大きさにも気をつけます','相手の気持ちも確かめながら話します','自分の希望を短く具体的に伝えたい場面です'];const rows=[];for(let c=0;c<contexts.length;c++)for(let p=0;p<places.length;p++)for(let v=0;v<conditions.length;v++){const a=good[c];rows.push({prompt:`${places[p]}で「${contexts[c]}」場面です。${conditions[v]}。伝え方としてよいものは？`,answer:a,choices:[a,'相手をばかにする言い方をする','何も言わずに物へ当たる','大声で命令だけをする'],explanation:'自分の希望や境界を、相手を傷つけにくい具体的な言葉で伝えます。',payload:{context:contexts[c],place:places[p],condition:conditions[v]},category:'language'});}return finalize('words',rows);}

const KANJI=[
['休','亻','木','にんべん'],['体','亻','本','にんべん'],['何','亻','可','にんべん'],['住','亻','主','にんべん'],['作','亻','乍','にんべん'],['位','亻','立','にんべん'],['信','亻','言','にんべん'],['明','日','月','ひへん'],['時','日','寺','ひへん'],['晴','日','青','ひへん'],['映','日','央','ひへん'],['語','言','吾','ごんべん'],['話','言','舌','ごんべん'],['記','言','己','ごんべん'],['読','言','売','ごんべん'],['計','言','十','ごんべん'],['校','木','交','きへん'],['村','木','寸','きへん'],['板','木','反','きへん'],['相','木','目','きへん'],['植','木','直','きへん'],['海','氵','毎','さんずい'],['池','氵','也','さんずい'],['泳','氵','永','さんずい'],['洋','氵','羊','さんずい'],['河','氵','可','さんずい'],['持','扌','寺','てへん'],['打','扌','丁','てへん'],['投','扌','殳','てへん'],['拾','扌','合','てへん'],['指','扌','旨','てへん'],['花','艹','化','くさかんむり'],['草','艹','早','くさかんむり'],['荷','艹','何','くさかんむり'],['茶','艹','余','くさかんむり'],['男','田','力','た'],['思','田','心','こころ'],['細','糸','田','いとへん'],['組','糸','且','いとへん'],['絵','糸','会','いとへん'],['好','女','子','おんなへん'],['姉','女','市','おんなへん'],['妹','女','未','おんなへん'],['安','宀','女','うかんむり'],['室','宀','至','うかんむり'],['店','广','占','まだれ'],['広','广','厶','まだれ'],['岩','山','石','やま'],['音','立','日','おと'],['意','音','心','こころ']
];
function kanjiPuzzleBank(){const rows=[];for(let v=0;v<10;v++)for(let i=0;i<KANJI.length;i++){const [k,a,b]=KANJI[i],answer=`${a}＋${b}`;const d1=KANJI[(i+7)%KANJI.length],d2=KANJI[(i+13)%KANJI.length],d3=KANJI[(i+23)%KANJI.length];rows.push({prompt:`漢字「${k}」を作る二つのパーツを選びます。${['形を左右に分けて見ます','上と下のまとまりも確認します','部品の形に注目します','似た形と比べます','一画ずつ見ます','へんとつくりの位置を見ます','二つの部品の大きさを比べます','外側と内側のまとまりを見ます','重なる部分がないか確かめます','完成した形を頭の中で組み立てます'][v]}`,answer,choices:[answer,`${d1[1]}＋${d1[2]}`,`${d2[1]}＋${d2[2]}`,`${d3[1]}＋${d3[2]}`],explanation:`${k} は ${a} と ${b} の形を手がかりに見ます。`,payload:{kanji:k,parts:[a,b]},category:'kanji'});}return finalize('kanjipuzzle',rows);}
function bushuBank(){
 const radicalSymbol=(row)=>{const [k,a,b,name]=row;if(name==='こころ'&&b==='心')return '心';if(name==='おと'&&k==='音')return '音';return a;};
 const names=uniq(KANJI.map(x=>x[3])),symbols=uniq(KANJI.map(radicalSymbol)),rows=[];
 const other=(i,offset)=>KANJI[(i+offset)%KANJI.length];
 for(let i=0;i<KANJI.length;i++)for(let mode=0;mode<10;mode++){
   const row=KANJI[i],k=row[0],a=row[1],b=row[2],name=row[3],rad=radicalSymbol(row);let prompt,answer,choices;
   if(mode===0){prompt=`漢字「${k}」の部首の名前は？`;answer=name;choices=choiceSet(answer,names.filter(x=>x!==answer),3);}
   else if(mode===1){prompt=`部首「${rad}」の名前はどれですか？`;answer=name;choices=choiceSet(answer,names.filter(x=>x!==answer),3);}
   else if(mode===2){prompt=`漢字「${k}」で部首として見る形はどれですか？`;answer=rad;choices=choiceSet(answer,symbols.filter(x=>x!==answer),3);}
   else if(mode===3){prompt=`「${a}」と「${b}」に分けて見たとき、「${k}」の部首はどちらですか？`;answer=rad;choices=choiceSet(answer,[a,b,...symbols],3);}
   else if(mode===4){prompt=`部首名が「${name}」になる形を選びます。`;answer=rad;choices=choiceSet(answer,symbols.filter(x=>x!==answer),3);}
   else if(mode===5){prompt=`漢字「${k}」の部首「${rad}」は何と呼びますか？`;answer=name;choices=choiceSet(answer,names.filter(x=>x!==answer),3);}
   else if(mode===6){answer=`${rad}・${name}`;choices=choiceSet(answer,KANJI.filter((_,j)=>j!==i).map(x=>`${radicalSymbol(x)}・${x[3]}`),3);prompt=`漢字「${k}」の部首の「形・名前」の正しい組み合わせは？`;}
   else if(mode===7){prompt=`「${k}」を「${a}＋${b}」と見たとき、部首として扱う部分を選びます。`;answer=rad;choices=choiceSet(answer,[a,b,...symbols],3);}
   else if(mode===8){prompt=`漢字「${k}」について、部首名を選んでください。手がかりは「${rad}」です。`;answer=name;choices=choiceSet(answer,names.filter(x=>x!==answer),3);}
   else {answer=`${k}・${name}`;choices=choiceSet(answer,[other(i,7),other(i,13),other(i,19)].map(x=>`${x[0]}・${x[3]}`),3);prompt=`「漢字・部首名」の組み合わせとして「${k}」に合うものは？`;}
   rows.push({prompt,answer,choices,explanation:`「${k}」の部首は「${rad}（${name}）」として確認します。`,payload:{kanji:k,radical:rad,radicalName:name,mode},stimulusKey:`${k}|${rad}|${mode}`,category:'kanji'});
 }
 return finalize('bushu',rows);
}
function moraBank(){return wordBank('moraread',hiraWords(),'read').map((q,i)=>({...q,prompt:`「${q.payload.word}」を左から一文字ずつ確かめて読みます。`,explanation:'文字のまとまりを順に追って読みます。'}));}

const PAL_BASE=['しんぶんし','たけやぶやけた','とまと','きつつき','こねこ','やおや','たいやきやいた','だんすがすんだ','わたしまけましたわ','まさかさかさま','るすになにする','いかたべたかい','みなみ','しきいし','よるくるよ','かるいきいるか','すいかいす','たしかにかした','わるいきいるわ','よくきくよ','なくすなすくな','たまがまた','かみがみか','きいろいき','ねるとるね'];
function palindromeBank(){const validSeeds=PAL_BASE.filter(x=>x===[...x].reverse().join(''));const non=hiraWords().filter(w=>w!==[...w].reverse().join('')).slice(0,250),rows=[];const digitKana=['あ','い','う','え','お','か','き','く','け','こ'];for(let i=0;i<250;i++){const seed=validSeeds[i%validSeeds.length],code=String(Math.floor(i/validSeeds.length)+1),prefix=[...code].map(d=>digitKana[Number(d)]).join('');const text=prefix+seed+[...prefix].reverse().join('');rows.push({prompt:`「${text}」は前から読んでも後ろから読んでも同じですか？`,answer:'回文',choices:['回文','回文ではない'],explanation:'前と後ろから一文字ずつ比べます。',payload:{text,isPalindrome:true},category:'palindrome'});}for(let i=0;i<250;i++){const text=non[i];rows.push({prompt:`「${text}」は前から読んでも後ろから読んでも同じですか？`,answer:'回文ではない',choices:['回文','回文ではない'],explanation:'前と後ろから一文字ずつ比べます。',payload:{text,isPalindrome:false},category:'palindrome'});}return finalize('palindrome',rows);}

const FIXED_BANKS={
 colorquiz:colorBank(),shapequiz:shapeBank(),
 hiraarrange:wordBank('hiraarrange',hiraWords(),'arrange'),kataarrange:wordBank('kataarrange',kataWords(),'arrange'),
 hirasearch:wordBank('hirasearch',hiraWords(),'search'),katasearch:wordBank('katasearch',kataWords(),'search'),
 idiomarrange:idiomBank('idiomarrange','arrange'),continents:continentsBank(),prefecture:prefectureBank(),dicetalk:diceTalkBank(),traffic:trafficBank(),words:wordsBank(),
 moraread:moraBank(),kanjipuzzle:kanjiPuzzleBank(),bushu:bushuBank(),palindrome:palindromeBank(),idiomsearch:idiomBank('idiomsearch','search')
};
function browserSource(){let s=`window.NIJI_QUESTION_BANK_VERSION=${JSON.stringify(VERSION)};\nwindow.NIJI_TKK_FIXED_BANKS={};\n`;for(const id of TARGET_IDS)s+=`window.NIJI_TKK_FIXED_BANKS[${JSON.stringify(id)}]=\n/* NIJI_BANK:${id}:START */\n${JSON.stringify(FIXED_BANKS[id])}\n/* NIJI_BANK:${id}:END */\n;\n`;return s;}
module.exports={VERSION,TARGET_IDS,FIXED_BANKS,browserSource,hiraWords,kataWords,IDIOMS,PREF,KANJI};
