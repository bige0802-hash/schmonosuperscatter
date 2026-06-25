import {CONFIG} from '../core/config.js';
import {sleep} from '../core/dom.js';

export class ReelEngine{
  constructor(grid,audio){
    this.grid=grid;
    this.audio=audio;
    this.board=[];
  }

  pick(){
    let t=CONFIG.symbols.reduce((a,s)=>a+s.w,0),r=Math.random()*t;
    for(const s of CONFIG.symbols){r-=s.w;if(r<=0)return {...s}}
    return {...CONFIG.symbols[0]};
  }

  newBoard(){
    this.board=Array.from({length:CONFIG.cols*CONFIG.rows},()=>this.pick());
  }

  render(wins=[],blur=false,stoppingCol=-1,explode=false){
    let set=new Set(wins);
    this.grid.innerHTML='';
    this.board.forEach((s,i)=>{
      let c=i%CONFIG.cols;
      let d=document.createElement('div');
      d.className='cell drop '+(s.cls||'');
      d.style.animationDelay = `${(i%CONFIG.cols)*18 + Math.floor(i/CONFIG.cols)*12}ms`;
      if(blur)d.classList.add('spinBlur');
      if(c===stoppingCol)d.classList.add('reelStopping');
      if(explode&&set.has(i))d.classList.add('explode');
      if(s.id==='scatter')d.classList.add('scatter');
      if(s.id==='super')d.classList.add('super');
      if(set.has(i)&&!explode)d.classList.add('win');
      d.innerHTML=s.img?`<img src="${s.img}">`:s.txt;
      this.grid.appendChild(d);
    });
  }

  async spinVisual(turbo=false){
    this.newBoard();
    this.render([],true);
    for(let c=0;c<CONFIG.cols;c++){
      await sleep(turbo?45:120);
      this.render([],true,c);
      this.audio.stop(c);
    }
    await sleep(turbo?60:150);
    this.render();
  }

  specials(){
    return{
      scatter:this.board.filter(s=>s.id==='scatter').length,
      super:this.board.filter(s=>s.id==='super').length
    };
  }

  findWins(bet){
    let g={},idx={};
    this.board.forEach((s,i)=>{
      if(s.id==='scatter'||s.id==='super')return;
      g[s.id]=(g[s.id]||0)+1;
      (idx[s.id]??=[]).push(i);
    });
    let pay=0,w=[],labels=[];
    for(let id in g){
      if(g[id]>=8){
        let sym=CONFIG.symbols.find(x=>x.id===id),count=g[id],scale=count>=15?3:count>=12?2:1;
        pay+=bet*sym.p*scale;
        w.push(...idx[id]);
        labels.push(`${count} ${id}`);
      }
    }
    return{pay,w:[...new Set(w)],labels};
  }

  tumble(wins){
    let rem=new Set(wins);
    for(let c=0;c<CONFIG.cols;c++){
      let col=[];
      for(let r=CONFIG.rows-1;r>=0;r--){
        let i=r*CONFIG.cols+c;
        if(!rem.has(i))col.push(this.board[i]);
      }
      while(col.length<CONFIG.rows)col.push(this.pick());
      for(let r=CONFIG.rows-1;r>=0;r--){
        this.board[r*CONFIG.cols+c]=col[CONFIG.rows-1-r];
      }
    }
  }

  async animateCascade(wins, particleFx, audio, combo, turbo=false){
    this.grid.classList.add('cascading');
    this.render(wins,false,-1,false);
    particleFx.burst(28 + combo*12, combo>=3?'✦':'mix');
    audio.win(combo);
    await sleep(turbo?135:360);

    this.render(wins,false,-1,true);
    particleFx.burst(32 + combo*14, '✦');
    await sleep(turbo?100:230);

    this.tumble(wins);
    this.render();
    await sleep(turbo?120:300);
    this.grid.classList.remove('cascading');
  }
}
