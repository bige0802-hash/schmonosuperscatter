export class Particles{
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.resize();addEventListener('resize',()=>this.resize())}
  resize(){let r=this.canvas.getBoundingClientRect();this.canvas.width=r.width*devicePixelRatio;this.canvas.height=r.height*devicePixelRatio}
  burst(n=60, emoji='mix'){let ctx=this.ctx,w=this.canvas.width,h=this.canvas.height;let ps=Array.from({length:n},()=>({x:w/2,y:h/2,vx:(Math.random()-.5)*18*devicePixelRatio,vy:(Math.random()-.8)*16*devicePixelRatio,l:70+Math.random()*35,e:emoji==='mix'?(Math.random()<.5?'🍌':'✦'):emoji}));let f=0;let anim=()=>{f++;ctx.clearRect(0,0,w,h);ctx.font=`${25*devicePixelRatio}px Arial`;for(let p of ps){p.x+=p.vx;p.y+=p.vy;p.vy+=.45*devicePixelRatio;p.l--;ctx.globalAlpha=Math.max(0,p.l/95);ctx.fillText(p.e,p.x,p.y)}ctx.globalAlpha=1;if(f<95)requestAnimationFrame(anim);else ctx.clearRect(0,0,w,h)};anim()}
}
