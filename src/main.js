import {CONFIG} from './core/config.js';
import {fmt,sleep,countUp} from './core/dom.js';
import {load,save,reset} from './core/save.js';
import {AudioEngine} from './effects/audio.js';
import {Particles} from './effects/particles.js';
import {ReelEngine} from './reels/ReelEngine.js';
import {Hud} from './ui/Hud.js';
import {superPay,preBonusWarning,cutscene} from './features/Bonus.js';
import {FreeSpinsFeature} from './features/FreeSpins.js';

const defaults={coins:CONFIG.start,bet:100,meter:0,free:0,total:0,mult:1,lastDaily:0,spinning:false,auto:false,turbo:false,spins:0,biggest:0,lifetime:0,freeTriggers:0};
const state=load(CONFIG.save,defaults);
const audio=new AudioEngine();
const hud=new Hud();
let reels,particleFx,freeFeature;

function persist(){hud.update(state);freeFeature?.updateOverlay();save(CONFIG.save,state)}

function flash(){
  document.body.classList.add('flashWin');
  setTimeout(()=>document.body.classList.remove('flashWin'),600);
}
function shake(big=false){
  document.body.classList.add(big?'heavyShake':'screenShake');
  setTimeout(()=>document.body.classList.remove(big?'heavyShake':'screenShake'),800);
}

async function bigWin(total){
  if(total<state.bet*25)return;
  winTitle.textContent=total>=state.bet*500?'LEGENDARY WIN':total>=state.bet*200?'MEGA WIN':'BIG WIN';
  winAmount.textContent='0';
  winOverlay.classList.remove('hidden');
  audio.big();
  flash();
  shake(total>=state.bet*200);
  await countUp(winAmount,0,total,state.turbo?650:1500);
  await sleep(state.turbo?300:900);
  winOverlay.classList.add('hidden');
}

async function spin(){
  if(state.spinning)return;
  if(state.free<=0&&state.coins<state.bet){hud.msg('NOT ENOUGH COINS');audio.bad();return}

  state.spinning=true;
  state.spins++;
  state.total=0;
  state.mult=1;
  hud.combo(0,0,0);

  if(state.free>0){
    state.free--;
    hud.msg(`FREE SPIN! ${state.free} LEFT`);
  }else{
    state.coins-=state.bet;
    hud.msg('SPINNING...');
  }

  persist();
  audio.spin();
  await reels.spinVisual(state.turbo);

  let sp=superPay(state,reels.specials());
  let total=sp.pay,notes=[],fs=sp.fs,combo=0,had=false;

  if(sp.pay){
    notes.push(sp.label);
    particleFx.burst(120,'🍌');
    audio.big();
    flash();
    shake(true);
  }

  let spec=reels.specials();
  hud.combo(combo,spec.scatter,spec.super);

  for(let t=0;t<10;t++){
    let w=reels.findWins(state.bet);
    if(!w.w.length)break;

    had=true;
    combo++;
    total+=w.pay;
    notes.push(`COMBO ${combo}: ${fmt(w.pay)}`);

    await reels.animateCascade(w.w, particleFx, audio, combo, state.turbo);
    spec=reels.specials();
    hud.combo(combo,spec.scatter,spec.super);

    if(combo>=3) flash();
    if(combo>=4) shake(false);
  }

  spec=reels.specials();
  if(spec.scatter===2&&had){
    state.meter=Math.min(CONFIG.target,state.meter+20);
    notes.push('SECRET BONUS METER UP');
  }

  if(state.meter>=CONFIG.target){
    state.meter=0;
    fs=true;
    notes.push('SECRET BONUS COMPLETE');
  }

  if(total>0&&Math.random()<.24){
    state.mult=[2,3,5,10,25,50,100][Math.floor(Math.random()*7)];
    total*=state.mult;
    notes.push(`${state.mult}× MULTIPLIER`);
    particleFx.burst(90,'✦');
    flash();
  }

  if(fs){
    await cutscene(audio, particleFx);
    state.free+=CONFIG.freeAward;
    state.freeTriggers++;
    notes.push('15 FREE SPINS');
  }

  if(total>0){
    state.coins+=total;
    state.total=total;
    state.lifetime+=total;
    state.biggest=Math.max(state.biggest,total);
    hud.msg(`WIN ${fmt(total)}<br><small>${notes.join(' • ')}</small>`);
    particleFx.burst(total>=state.bet*25?160:80);
    await bigWin(total);
  }else{
    hud.msg(notes.length?notes.join(' • '):'GOOD LUCK!');
  }

  if(state.free===0 && document.body.classList.contains('free-mode-active')){
    await freeFeature.exitIfDone(hud);
  }

  state.spinning=false;
  persist();

  if(state.auto&&(state.free>0||state.coins>=state.bet)){
    await sleep(state.turbo?180:650);
    spin();
  }
}

function bind(){
  spinBtn.onclick=spin;
  betUp.onclick=()=>{state.bet=Math.min(CONFIG.maxBet,state.bet+CONFIG.step);persist()};
  betDown.onclick=()=>{state.bet=Math.max(CONFIG.minBet,state.bet-CONFIG.step);persist()};
  maxBtn.onclick=()=>{state.bet=CONFIG.maxBet;persist()};
  turboBtn.onclick=()=>{state.turbo=!state.turbo;turboBtn.classList.toggle('active',state.turbo);persist()};
  autoBtn.onclick=()=>{state.auto=!state.auto;autoBtn.textContent=state.auto?'STOP':'AUTO';if(state.auto)spin()};
  dailyBtn.onclick=()=>{let now=Date.now();if(now-state.lastDaily>=86400000){state.coins+=CONFIG.daily;state.lastDaily=now;hud.msg('DAILY +10,000 CLAIMED');audio.win()}else{hud.msg('DAILY READY LATER');audio.bad()}persist()};
  soundBtn.onclick=()=>{soundBtn.textContent=audio.toggle()?'🔊':'🔇'};
  rulesBtn.onclick=()=>rulesModal.classList.remove('hidden');
  statsBtn.onclick=()=>statsModal.classList.remove('hidden');
  resetBtn.onclick=()=>{if(confirm('Reset save?')){reset(CONFIG.save);location.reload()}};
  document.querySelectorAll('.modalClose').forEach(b=>b.onclick=()=>document.querySelectorAll('.modal').forEach(m=>m.classList.add('hidden')));
}

window.addEventListener('load',async()=>{
  reels = new ReelEngine(document.getElementById('grid'), audio);
  particleFx = new Particles(document.getElementById('particles'));
  freeFeature = new FreeSpinsFeature(state, audio, particleFx);
  reels.newBoard();
  reels.render();
  bind();
  persist();
  await sleep(500);
  loader.classList.add('done');
});
