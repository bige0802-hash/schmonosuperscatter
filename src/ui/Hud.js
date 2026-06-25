import {fmt} from '../core/dom.js';
export class Hud{
  update(s){coinsTop.textContent=creditsText.textContent=mCredits.textContent=fmt(s.coins);betText.textContent=fmt(s.bet);freeText.textContent=s.free;mSpins.textContent=s.free+' / 15';winText.textContent=mWin.textContent=fmt(s.total);multiText.textContent=mMulti.textContent=s.mult+'×';meterFill.style.width=Math.min(100,s.meter)+'%';statSpins.textContent=fmt(s.spins);statBiggest.textContent=fmt(s.biggest);statLifetime.textContent=fmt(s.lifetime);statFreeTriggers.textContent=fmt(s.freeTriggers)}
  msg(html){message.innerHTML=html}
  combo(combo, scatter, superCount){comboText.textContent='COMBO '+combo;scatterText.textContent=`SCATTERS ${scatter} • SUPER ${superCount}`}
}
