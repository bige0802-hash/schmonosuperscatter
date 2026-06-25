import {CONFIG} from '../core/config.js';
import {sleep} from '../core/dom.js';

export function superPay(state, specials){
  if(specials.super>=4)return{pay:state.bet*50000,fs:true,label:'4 SUPER = 50,000×',level:'max'};
  if(specials.super>=3&&specials.scatter>=1)return{pay:state.bet*5000,fs:true,label:'3 SUPER + 1 REGULAR = 5,000×',level:'epic'};
  if(specials.super>=2&&specials.scatter>=2)return{pay:state.bet*500,fs:true,label:'2 SUPER + 2 REGULAR = 500×',level:'mega'};
  if(specials.super>=1&&specials.scatter>=3)return{pay:state.bet*100,fs:true,label:'1 SUPER + 3 REGULAR = 100×',level:'big'};
  return{pay:0,fs:false,label:'',level:''}
}

export async function preBonusWarning(audio, particles){
  document.body.classList.add('flashWin');
  document.getElementById('templeFrame')?.classList.add('bonus-warning');
  audio.big();
  particles?.burst(120,'🍌');
  await sleep(450);
  document.body.classList.remove('flashWin');
  await sleep(250);
  document.getElementById('templeFrame')?.classList.remove('bonus-warning');
}

export async function cutscene(audio, particles){
  let skip=false;
  bonusScene.classList.remove('hidden');
  skipBonus.onclick=()=>skip=true;
  document.body.classList.add('heavyShake');
  audio.big();
  particles?.burst(180,'🍌');

  for(let i=0;i<42&&!skip;i++){
    if(i===8 || i===20 || i===32){
      audio.big();
      document.body.classList.add('flashWin');
      setTimeout(()=>document.body.classList.remove('flashWin'),400);
    }
    await sleep(100);
  }

  document.body.classList.remove('heavyShake');
  bonusScene.classList.add('hidden');
}
