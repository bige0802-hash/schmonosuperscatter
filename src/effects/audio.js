export class AudioEngine {
  constructor() { this.enabled = true; }
  toggle() { this.enabled = !this.enabled; return this.enabled; }
  tone(freq = 440, dur = .06, type = 'sine', vol = .035) {
    if (!this.enabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type; o.frequency.value = freq; g.gain.value = vol;
      o.connect(g); g.connect(ctx.destination); o.start();
      setTimeout(() => { o.stop(); ctx.close(); }, dur * 1000);
    } catch {}
  }
  spin() { this.tone(300, .04, 'triangle'); }
  win(i = 0) { this.tone(520 + i * 65, .07, 'triangle'); }
  big() { this.tone(180, .18, 'sawtooth', .055); }
  bad() { this.tone(120, .12, 'square'); }
}
