import { CONFIG } from '../core/config.js';
import { $, sleep, fmt, countUp } from '../core/utils.js';
import { loadState, saveState, resetState } from '../core/storage.js';
import { AudioEngine } from '../effects/audio.js';
import { ParticleEngine } from '../effects/particles.js';
import { UI } from '../ui/ui.js';
import { Reels } from './reels.js';

const defaults = {
  coins: CONFIG.startCoins, bet: CONFIG.minBet, meter: 0, freeSpins: 0,
  totalWin: 0, biggest: 0, lifetime: 0, freeTriggers: 0, spins: 0,
  lastDaily: 0, mult: 1, turbo: false, auto: false, spinning: false
};

export class Game {
  init() {
    this.state = loadState(CONFIG.saveKey, defaults);
    this.audio = new AudioEngine();
    this.ui = new UI();
    this.reels = new Reels($('grid'));
    this.fx = new ParticleEngine($('particles'));
    this.reels.newBoard();
    this.reels.render();
    this.bind();
    this.ui.update(this.state);
  }

  bind() {
    $('spinBtn').onclick = () => this.spin();
    $('betUp').onclick = () => this.changeBet(CONFIG.betStep);
    $('betDown').onclick = () => this.changeBet(-CONFIG.betStep);
    $('maxBetBtn').onclick = () => { this.state.bet = CONFIG.maxBet; this.persist(); };
    $('turboBtn').onclick = () => { this.state.turbo = !this.state.turbo; $('turboBtn').classList.toggle('active', this.state.turbo); this.persist(); };
    $('autoBtn').onclick = () => { this.state.auto = !this.state.auto; $('autoBtn').textContent = this.state.auto ? 'STOP' : 'AUTO'; if (this.state.auto) this.spin(); };
    $('dailyBtn').onclick = () => this.daily();
    $('soundBtn').onclick = () => { $('soundBtn').textContent = this.audio.toggle() ? '🔊' : '🔇'; };
    ['openRules','infoBtn','menuBtn'].forEach(id => $(id).onclick = () => $('rulesModal').classList.remove('hidden'));
    $('openStats').onclick = () => $('statsModal').classList.remove('hidden');
    $('resetSave').onclick = () => { if (confirm('Reset local save?')) { resetState(CONFIG.saveKey); location.reload(); } };
    document.querySelectorAll('.close').forEach(b => b.onclick = () => document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden')));
  }

  persist() { this.ui.update(this.state); saveState(CONFIG.saveKey, this.state); }

  changeBet(delta) {
    this.state.bet = Math.max(CONFIG.minBet, Math.min(CONFIG.maxBet, this.state.bet + delta));
    this.persist();
  }

  superPay() {
    const s = this.reels.specials();
    if (s.super >= 4) return { pay: this.state.bet * 50000, trigger: true, label: '4 SUPER = 50,000×' };
    if (s.super >= 3 && s.scatter >= 1) return { pay: this.state.bet * 5000, trigger: true, label: '3 SUPER + 1 REGULAR = 5,000×' };
    if (s.super >= 2 && s.scatter >= 2) return { pay: this.state.bet * 500, trigger: true, label: '2 SUPER + 2 REGULAR = 500×' };
    if (s.super >= 1 && s.scatter >= 3) return { pay: this.state.bet * 100, trigger: true, label: '1 SUPER + 3 REGULAR = 100×' };
    return { pay: 0, trigger: false, label: '' };
  }

  async spin() {
    if (this.state.spinning) return;
    if (this.state.freeSpins <= 0 && this.state.coins < this.state.bet) {
      this.ui.msg('NOT ENOUGH COINS');
      this.audio.bad();
      return;
    }

    this.state.spinning = true;
    this.state.spins++;
    this.state.totalWin = 0;
    this.state.mult = 1;

    if (this.state.freeSpins > 0) {
      this.state.freeSpins--;
      this.ui.msg(`FREE SPIN! ${this.state.freeSpins} LEFT`);
    } else {
      this.state.coins -= this.state.bet;
      this.ui.msg('SPINNING...');
    }

    this.persist();
    this.audio.spin();

    this.reels.newBoard();
    this.reels.render([], true);
    await sleep(this.state.turbo ? 115 : 500);
    this.reels.render();
    await sleep(this.state.turbo ? 80 : 160);

    const sp = this.superPay();
    let total = sp.pay;
    let notes = [];
    let triggerFS = sp.trigger;

    if (sp.pay) {
      notes.push(sp.label);
      this.fx.burst(90);
      this.audio.big();
    }

    let had8 = false;
    for (let t = 0; t < 8; t++) {
      const w = this.reels.findWins(this.state.bet);
      if (!w.w.length) break;
      had8 = true;
      total += w.pay;
      notes.push(`TUMBLE ${t + 1}: ${fmt(w.pay)}`);
      this.reels.render(w.w);
      this.fx.burst(30);
      this.audio.win(t);
      await sleep(this.state.turbo ? 170 : 460);
      this.reels.tumble(w.w);
      this.reels.render();
      await sleep(this.state.turbo ? 125 : 300);
    }

    const special = this.reels.specials();
    if (special.scatter === 2 && had8) {
      this.state.meter = Math.min(CONFIG.hiddenTarget, this.state.meter + 20);
      notes.push('SECRET BONUS METER UP');
    }
    if (this.state.meter >= CONFIG.hiddenTarget) {
      this.state.meter = 0;
      triggerFS = true;
      notes.push('SECRET BONUS COMPLETE');
    }
    if (total > 0 && Math.random() < .24) {
      this.state.mult = [2,3,5,10,25,50,100][Math.floor(Math.random() * 7)];
      total *= this.state.mult;
      notes.push(`${this.state.mult}× MULTIPLIER`);
    }

    if (triggerFS) {
      await this.cutscene();
      this.state.freeSpins += CONFIG.freeSpinsAward;
      this.state.freeTriggers++;
      notes.push('15 FREE SPINS');
    }

    if (total > 0) {
      this.state.coins += total;
      this.state.lifetime += total;
      this.state.biggest = Math.max(this.state.biggest, total);
      this.ui.update(this.state);
      await countUp($('totalWinText'), 0, total, this.state.turbo ? 350 : 850);
      this.state.totalWin = total;
      this.ui.msg(`WIN ${fmt(total)}<br><small>${notes.join(' • ')}</small>`);
      await this.bigWin(total);
    } else {
      this.ui.msg(notes.length ? notes.join(' • ') : 'GOOD LUCK!');
    }

    this.state.spinning = false;
    this.persist();

    if (this.state.auto && (this.state.freeSpins > 0 || this.state.coins >= this.state.bet)) {
      await sleep(this.state.turbo ? 180 : 650);
      this.spin();
    }
  }

  async cutscene() {
    let skip = false;
    $('bonusScene').classList.remove('hidden');
    $('skipBonus').onclick = () => skip = true;
    document.body.classList.add('screenShake');
    this.audio.big();
    for (let i = 0; i < 30 && !skip; i++) await sleep(100);
    document.body.classList.remove('screenShake');
    $('bonusScene').classList.add('hidden');
  }

  async bigWin(amount) {
    if (amount < this.state.bet * 25) return;
    $('winTitle').textContent = amount >= this.state.bet * 200 ? 'MEGA WIN' : 'BIG WIN';
    $('winAmount').textContent = '0';
    $('winOverlay').classList.remove('hidden');
    this.audio.big();
    await countUp($('winAmount'), 0, amount, this.state.turbo ? 650 : 1400);
    await sleep(this.state.turbo ? 300 : 850);
    $('winOverlay').classList.add('hidden');
  }

  daily() {
    const now = Date.now();
    if (now - this.state.lastDaily >= 86400000) {
      this.state.coins += CONFIG.dailyCoins;
      this.state.lastDaily = now;
      this.ui.msg('DAILY +10,000 CLAIMED');
      this.audio.win();
    } else {
      this.ui.msg(`DAILY READY IN ABOUT ${Math.ceil((86400000 - (now - this.state.lastDaily)) / 3600000)} HOUR(S)`);
      this.audio.bad();
    }
    this.persist();
  }
}
