import { $, fmt } from '../core/utils.js';

export class UI {
  update(state) {
    $('coinsTop').textContent = fmt(state.coins);
    $('creditText').textContent = fmt(state.coins);
    $('betText').textContent = fmt(state.bet);
    $('freeSpinsText').textContent = state.freeSpins;
    $('totalWinText').textContent = fmt(state.totalWin);
    $('multiplierText').textContent = state.mult + '×';
    $('meterFill').style.width = Math.min(100, state.meter) + '%';

    $('mMulti').textContent = state.mult + '×';
    $('mSpins').textContent = state.freeSpins + ' / 15';
    $('mWin').textContent = fmt(state.totalWin);
    $('mCredits').textContent = fmt(state.coins);

    $('statSpins').textContent = fmt(state.spins);
    $('statBiggest').textContent = fmt(state.biggest);
    $('statLifetime').textContent = fmt(state.lifetime);
    $('statFreeTriggers').textContent = fmt(state.freeTriggers);
  }
  msg(html) { $('message').innerHTML = html; }
}
