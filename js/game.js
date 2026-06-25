const CFG={
  cols:6,rows:5,start:100000,daily:10000,minBet:100,maxBet:3000,step:100,freeAward:15,target:100,
  symbols:[
    {id:'p1',img:'assets/symbols/premium-1.jpeg',w:6,p:12},
    {id:'p2',img:'assets/symbols/premium-2.jpeg',w:6,p:10},
    {id:'p3',img:'assets/symbols/premium-3.jpeg',w:7,p:9},
    {id:'p4',img:'assets/symbols/premium-4.jpeg',w:7,p:8},
    {id:'p5',img:'assets/symbols/premium-5.jpeg',w:7,p:7},
    {id:'banana',txt:'🍌',w:10,p:5,cls:'gem'},
    {id:'ring',txt:'💍',w:10,p:4,cls:'gem'},
    {id:'diamond',txt:'💎',w:10,p:5,cls:'gem'},
    {id:'A',txt:'A',w:13,p:4,cls:'letter red'},
    {id:'K',txt:'K',w:13,p:4,cls:'letter gold'},
    {id:'Q',txt:'Q',w:13,p:3,cls:'letter green'},
    {id:'J',txt:'J',w:13,p:3,cls:'letter blue'},
    {id:'10',txt:'10',w:13,p:2,cls:'letter purple'},
    {id:'scatter',img:'assets/symbols/schmono-main.jpeg',w:3,p:0,cls:'scatter'},
    {id:'super',img:'assets/symbols/banana-super.jpeg',w:1,p:0,cls:'super'}
  ]
};
const $=id=>document.getElementById(id);
const fmt=n=>Math.floor(n).toLocaleString();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let state={coins:CFG.start,bet:100,meter:0,free:0,total:0,mult:1,lastDaily:0,spinning:false,auto:false,turbo:false};
try{Object.assign(state,JSON.parse(localStorage.schmonoUltimate||'{}'))}catch{}
let board=[],audio=true,ctx,canvas;

function save(){localStorage.schmonoUltimate=JSON.stringify(state)}
function hud(){
  coinTop.textContent=creditsText.textContent=fmt(state.coins);
  betText.textContent=fmt(state.bet);
  freeText.textContent=state.free;
  freeBannerCount.textContent=state.free;
  winText.textContent=fmt(state.total);
  multiText.textContent=state.mult+'x';
  meterFill.style.width=Math.min(100,state.meter)+'%';
  freeBanner.classList.toggle('hidden',state.free<=0);
}
function tone(f=440,d=.06,type='sine',v=.04){
  if(!audio)return;
  try{let ac=new(window.AudioContext||window.webkitAudioContext)(),o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;g.gain.value=v;o.connect(g);g.connect(ac.destination);o.start();setTimeout(()=>{o.stop();ac.close()},d*1000)}catch{}
}
function pick(){
  let t=CFG.symbols.reduce((a,s)=>a+s.w,0),r=Math.random()*t;
  for(const s of CFG.symbols){r-=s.w;if(r<=0)return {...s}}
  return {...CFG.symbols[0]}
}
function newBoard(){board=Array.from({length:CFG.cols*CFG.rows},pick)}
function render(wins=[],mode=''){
  const set=new Set(wins);grid.innerHTML='';
  board.forEach((s,i)=>{
    const d=document.createElement('div');
    d.className='cell '+(s.cls||'')+' '+mode;
    if(set.has(i))d.classList.add(mode==='pop'?'pop':'win');
    d.innerHTML=s.img?`<img src="${s.img}" onerror="this.replaceWith(document.createTextNode('${s.id==='super'?'🍌':'🐵'}'))">`:s.txt;
    grid.appendChild(d);
  })
}
async function spinVisual(){
  newBoard();render([], 'spin');tone(260,.05,'triangle');
  for(let c=0;c<CFG.cols;c++){await sleep(state.turbo?45:120);render([], 'spin');tone(180+c*35,.04,'square',.025)}
  await sleep(state.turbo?60:160);render([], 'stop')
}
function specials(){return{scatter:board.filter(s=>s.id==='scatter').length,super:board.filter(s=>s.id==='super').length}}
function superPay(){
  const s=specials();
  if(s.super>=4)return{pay:state.bet*50000,fs:true,label:'4 SUPER = 50,000x'};
  if(s.super>=3&&s.scatter>=1)return{pay:state.bet*5000,fs:true,label:'3 SUPER + 1 REGULAR = 5,000x'};
  if(s.super>=2&&s.scatter>=2)return{pay:state.bet*500,fs:true,label:'2 SUPER + 2 REGULAR = 500x'};
  if(s.super>=1&&s.scatter>=3)return{pay:state.bet*100,fs:true,label:'1 SUPER + 3 REGULAR = 100x'};
  return{pay:0,fs:false,label:''}
}
function wins(){
  let g={},idx={};
  board.forEach((s,i)=>{if(s.id==='scatter'||s.id==='super')return;g[s.id]=(g[s.id]||0)+1;(idx[s.id]??=[]).push(i)});
  let pay=0,w=[];
  for(let id in g)if(g[id]>=8){let sym=CFG.symbols.find(x=>x.id===id),c=g[id],scale=c>=15?3:c>=12?2:1;pay+=state.bet*sym.p*scale;w.push(...idx[id])}
  return{pay,w:[...new Set(w)]}
}
function tumble(w){
  const rem=new Set(w);
  for(let c=0;c<CFG.cols;c++){
    let col=[];
    for(let r=CFG.rows-1;r>=0;r--){let i=r*CFG.cols+c;if(!rem.has(i))col.push(board[i])}
    while(col.length<CFG.rows)col.push(pick());
    for(let r=CFG.rows-1;r>=0;r--)board[r*CFG.cols+c]=col[CFG.rows-1-r];
  }
}
function setupCanvas(){
  canvas=particles;ctx=canvas.getContext('2d');
  function resize(){const r=canvas.getBoundingClientRect();canvas.width=r.width*devicePixelRatio;canvas.height=r.height*devicePixelRatio}
  resize();addEventListener('resize',resize);
}
function burst(n=70,emoji='mix'){
  if(!ctx)return;
  const w=canvas.width,h=canvas.height;
  const ps=Array.from({length:n},()=>({x:w/2,y:h/2,vx:(Math.random()-.5)*18*devicePixelRatio,vy:(Math.random()-.8)*16*devicePixelRatio,l:70+Math.random()*35,e:emoji==='mix'?(Math.random()<.5?'🍌':'✦'):emoji}));
  let f=0;(function anim(){f++;ctx.clearRect(0,0,w,h);ctx.font=`${25*devicePixelRatio}px Arial`;for(const p of ps){p.x+=p.vx;p.y+=p.vy;p.vy+=.45*devicePixelRatio;p.l--;ctx.globalAlpha=Math.max(0,p.l/95);ctx.fillText(p.e,p.x,p.y)}ctx.globalAlpha=1;if(f<95)requestAnimationFrame(anim);else ctx.clearRect(0,0,w,h)})();
}
async function countUp(el,to,ms=850){
  const start=performance.now();return new Promise(res=>{function step(t){let p=Math.min(1,(t-start)/ms),e=1-Math.pow(1-p,3);el.textContent=fmt(to*e);if(p<1)requestAnimationFrame(step);else res()}requestAnimationFrame(step)})
}
async function bigWinShow(amount){
  if(amount<state.bet*25)return;
  bigWinTitle.textContent=amount>=state.bet*500?'LEGENDARY WIN':amount>=state.bet*200?'MEGA WIN':'BIG WIN';
  bigWin.classList.remove('hidden');bigWinAmount.textContent='0';tone(180,.2,'sawtooth',.055);document.body.classList.add('screen-shake');
  await countUp(bigWinAmount,amount,state.turbo?650:1400);
  await sleep(state.turbo?300:900);bigWin.classList.add('hidden');document.body.classList.remove('screen-shake');
}
async function bonusCutscene(){
  bonusScene.classList.remove('hidden');let skip=false;skipBonus.onclick=()=>skip=true;burst(160,'🍌');tone(180,.2,'sawtooth',.055);document.body.classList.add('screen-shake');
  for(let i=0;i<35&&!skip;i++){if(i%10===0){burst(80,'🍌');tone(220+i*8,.08,'sawtooth')}}await sleep(70);
  document.body.classList.remove('screen-shake');bonusScene.classList.add('hidden');
}
async function spin(){
  if(state.spinning)return;
  if(state.free<=0&&state.coins<state.bet){ticker.textContent='NOT ENOUGH COINS';tone(120,.12,'square');return}
  state.spinning=true;state.total=0;state.mult=1;
  if(state.free>0){state.free--;ticker.textContent=`FREE SPIN! ${state.free} LEFT`}else{state.coins-=state.bet;ticker.textContent='SPINNING...'}
  hud();save();await spinVisual();
  let sp=superPay(),total=sp.pay,notes=[],fs=sp.fs,combo=0,had=false;
  if(sp.pay){notes.push(sp.label);burst(130,'🍌');document.body.classList.add('screen-shake');setTimeout(()=>document.body.classList.remove('screen-shake'),600)}
  for(let t=0;t<10;t++){
    const w=wins();if(!w.w.length)break;
    had=true;combo++;total+=w.pay;notes.push(`COMBO ${combo}: ${fmt(w.pay)}`);
    render(w.w,'');burst(40+combo*12,'✦');tone(520+t*65,.07,'triangle');await sleep(state.turbo?140:360);
    render(w.w,'pop');await sleep(state.turbo?90:220);
    tumble(w.w);render([], 'stop');await sleep(state.turbo?120:280);
  }
  const s=specials();
  if(s.scatter===2&&had){state.meter=Math.min(CFG.target,state.meter+20);notes.push('SECRET BONUS METER UP')}
  if(state.meter>=CFG.target){state.meter=0;fs=true;notes.push('SECRET BONUS COMPLETE')}
  if(total>0&&Math.random()<.25){state.mult=[2,3,5,10,25,50,100][Math.floor(Math.random()*7)];total*=state.mult;notes.push(`${state.mult}x MULTIPLIER`);burst(100,'✦')}
  if(fs){await bonusCutscene();state.free+=CFG.freeAward;notes.push('15 FREE SPINS')}
  if(total>0){state.coins+=total;state.total=total;ticker.innerHTML=`WIN ${fmt(total)}<br><small>${notes.join(' • ')}</small>`;burst(total>=state.bet*25?160:85);await bigWinShow(total)}
  else ticker.textContent='TUMBLING WINS WITH RANDOM MULTIPLIERS!';
  state.spinning=false;hud();save();
  if(state.auto&&(state.free>0||state.coins>=state.bet)){await sleep(state.turbo?180:650);spin()}
}
spinBtn.onclick=spin;
betUp.onclick=()=>{state.bet=Math.min(CFG.maxBet,state.bet+CFG.step);hud();save()};
betDown.onclick=()=>{state.bet=Math.max(CFG.minBet,state.bet-CFG.step);hud();save()};
maxBetBtn.onclick=()=>{state.bet=CFG.maxBet;hud();save()};
turboBtn.onclick=()=>{state.turbo=!state.turbo;turboBtn.classList.toggle('active',state.turbo);save()};
autoBtn.onclick=()=>{state.auto=!state.auto;autoBtn.textContent=state.auto?'STOP':'AUTO';if(state.auto)spin()};
dailyBtn.onclick=()=>{const now=Date.now();if(now-state.lastDaily>=86400000){state.coins+=CFG.daily;state.lastDaily=now;ticker.textContent='DAILY +10,000 CLAIMED';tone(600,.08)}else ticker.textContent='DAILY READY LATER';hud();save()};
soundBtn.onclick=()=>{audio=!audio;soundBtn.textContent=audio?'🔊':'🔇'};
howBtn.onclick=()=>rulesModal.classList.remove('hidden');closeRules.onclick=()=>rulesModal.classList.add('hidden');
setupCanvas();newBoard();render();hud();
setTimeout(()=>boot.classList.add('done'),650);
