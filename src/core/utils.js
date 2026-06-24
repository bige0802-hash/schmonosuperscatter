export const $ = (id) => document.getElementById(id);
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export const fmt = (n) => Math.floor(n).toLocaleString();

export async function countUp(el, from, to, ms = 800) {
  const start = performance.now();
  return new Promise(resolve => {
    function step(t) {
      const p = Math.min(1, (t - start) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(from + (to - from) * eased);
      if (p < 1) requestAnimationFrame(step);
      else resolve();
    }
    requestAnimationFrame(step);
  });
}
