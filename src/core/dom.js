export const $ = id => document.getElementById(id);
export const fmt = n => Math.floor(n).toLocaleString();
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export async function countUp(el, from, to, ms=750){
  const start=performance.now();
  return new Promise(resolve=>{
    function step(t){
      const p=Math.min(1,(t-start)/ms);
      const e=1-Math.pow(1-p,3);
      el.textContent=fmt(from+(to-from)*e);
      if(p<1)requestAnimationFrame(step); else resolve();
    }
    requestAnimationFrame(step);
  });
}
