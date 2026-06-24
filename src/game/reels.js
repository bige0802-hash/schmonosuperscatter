import { CONFIG } from '../core/config.js';

export class Reels {
  constructor(grid) {
    this.grid = grid;
    this.board = [];
  }
  pick() {
    const total = CONFIG.symbols.reduce((a, s) => a + s.weight, 0);
    let r = Math.random() * total;
    for (const s of CONFIG.symbols) {
      r -= s.weight;
      if (r <= 0) return { ...s };
    }
    return { ...CONFIG.symbols[0] };
  }
  newBoard() {
    this.board = Array.from({ length: CONFIG.cols * CONFIG.rows }, () => this.pick());
  }
  render(wins = [], blur = false) {
    const set = new Set(wins);
    this.grid.innerHTML = '';
    this.board.forEach((s, i) => {
      const d = document.createElement('div');
      d.className = 'cell drop ' + (s.cls || '');
      if (blur) d.classList.add('spinBlur');
      if (s.id === 'scatter') d.classList.add('scatter');
      if (s.id === 'super') d.classList.add('super');
      if (set.has(i)) d.classList.add('win');
      d.innerHTML = s.image
        ? `<img src="${s.image}" alt="${s.id}" onerror="this.replaceWith(document.createTextNode('${s.id === 'super' ? '🍌' : '🐵'}'))">`
        : s.text;
      this.grid.appendChild(d);
    });
  }
  specials() {
    return {
      scatter: this.board.filter(s => s.id === 'scatter').length,
      super: this.board.filter(s => s.id === 'super').length
    };
  }
  findWins(bet) {
    const groups = {}, idx = {};
    this.board.forEach((s, i) => {
      if (s.id === 'scatter' || s.id === 'super') return;
      groups[s.id] = (groups[s.id] || 0) + 1;
      (idx[s.id] ??= []).push(i);
    });
    let pay = 0, w = [];
    for (const id in groups) {
      if (groups[id] >= 8) {
        const sym = CONFIG.symbols.find(x => x.id === id);
        const c = groups[id];
        const scale = c >= 15 ? 3 : c >= 12 ? 2 : 1;
        pay += bet * sym.pay * scale;
        w.push(...idx[id]);
      }
    }
    return { pay, w: [...new Set(w)] };
  }
  tumble(wins) {
    const rem = new Set(wins);
    for (let c = 0; c < CONFIG.cols; c++) {
      const col = [];
      for (let r = CONFIG.rows - 1; r >= 0; r--) {
        const i = r * CONFIG.cols + c;
        if (!rem.has(i)) col.push(this.board[i]);
      }
      while (col.length < CONFIG.rows) col.push(this.pick());
      for (let r = CONFIG.rows - 1; r >= 0; r--) {
        this.board[r * CONFIG.cols + c] = col[CONFIG.rows - 1 - r];
      }
    }
  }
}
