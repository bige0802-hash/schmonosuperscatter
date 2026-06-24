export class ParticleEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    this.resize();
  }
  resize() {
    const r = this.canvas.getBoundingClientRect();
    this.canvas.width = r.width * devicePixelRatio;
    this.canvas.height = r.height * devicePixelRatio;
  }
  burst(count = 60) {
    const ctx = this.ctx, w = this.canvas.width, h = this.canvas.height;
    const ps = Array.from({ length: count }, () => ({
      x: w / 2, y: h / 2,
      vx: (Math.random() - .5) * 18 * devicePixelRatio,
      vy: (Math.random() - .8) * 16 * devicePixelRatio,
      life: 60 + Math.random() * 35,
      emoji: Math.random() < .48 ? '🍌' : '✦'
    }));
    let frame = 0;
    const anim = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);
      ctx.font = `${24 * devicePixelRatio}px Arial`;
      for (const p of ps) {
        p.x += p.vx; p.y += p.vy; p.vy += .45 * devicePixelRatio; p.life--;
        ctx.globalAlpha = Math.max(0, p.life / 90);
        ctx.fillText(p.emoji, p.x, p.y);
      }
      ctx.globalAlpha = 1;
      if (frame < 90) requestAnimationFrame(anim);
      else ctx.clearRect(0, 0, w, h);
    };
    anim();
  }
}
