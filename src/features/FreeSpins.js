import {CONFIG} from '../core/config.js';
import {sleep} from '../core/dom.js';

export class FreeSpinsFeature {
  constructor(state, audio, particles) {
    this.state = state;
    this.audio = audio;
    this.particles = particles;
  }

  isActive() {
    return this.state.free > 0;
  }

  updateOverlay() {
    const overlay = document.getElementById('freeModeOverlay');
    const count = document.getElementById('freeModeCount');
    if (!overlay || !count) return;

    count.textContent = this.state.free;
    if (this.state.free > 0) {
      overlay.classList.remove('hidden');
      document.body.classList.add('free-mode-active');
    } else {
      overlay.classList.add('hidden');
      document.body.classList.remove('free-mode-active');
    }
  }

  async enter(amount = CONFIG.freeAward) {
    const wasActive = this.state.free > 0;
    this.state.free += amount;

    const overlay = document.getElementById('freeModeOverlay');
    overlay?.classList.remove('hidden');
    overlay?.classList.add('free-entry');
    document.body.classList.add('free-mode-active');

    if (wasActive) {
      overlay?.classList.add('retriggerFlash');
      this.particles?.burst(180, '🍌');
      this.audio?.big();
      await sleep(1000);
      overlay?.classList.remove('retriggerFlash');
    } else {
      this.particles?.burst(160, '✦');
      this.audio?.big();
      await sleep(850);
    }

    overlay?.classList.remove('free-entry');
    this.updateOverlay();
  }

  consumeOne() {
    if (this.state.free > 0) this.state.free--;
    this.updateOverlay();
  }

  multiplierBoost(currentMult, combo) {
    if (!this.isActive()) return currentMult;
    if (combo >= 4) return Math.max(currentMult, 5);
    if (combo >= 3) return Math.max(currentMult, 3);
    if (combo >= 2) return Math.max(currentMult, 2);
    return currentMult;
  }

  async exitIfDone(hud) {
    if (this.state.free > 0) return;
    this.updateOverlay();
    hud?.msg('FREE SPINS COMPLETE');
    this.audio?.win(2);
    await sleep(700);
  }
}
