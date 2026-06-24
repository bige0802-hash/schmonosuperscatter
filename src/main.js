import { Game } from './game/game.js';

window.addEventListener('load', async () => {
  const game = new Game();
  game.init();
  await new Promise(r => setTimeout(r, 500));
  document.getElementById('preloader')?.classList.add('done');
});
