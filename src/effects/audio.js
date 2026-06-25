export class AudioEngine{
  constructor(){this.enabled=true}
  toggle(){this.enabled=!this.enabled;return this.enabled}
  tone(f=440,d=.06,type='sine',v=.04){if(!this.enabled)return;try{let ac=new(window.AudioContext||window.webkitAudioContext)(),o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;g.gain.value=v;o.connect(g);g.connect(ac.destination);o.start();setTimeout(()=>{o.stop();ac.close()},d*1000)}catch{}}
  spin(){this.tone(260,.05,'triangle');setTimeout(()=>this.tone(360,.05,'triangle'),80)}
  stop(i=0){this.tone(180+i*35,.04,'square',.025)}
  win(i=0){this.tone(520+i*65,.07,'triangle')}
  big(){this.tone(180,.2,'sawtooth',.055)}
  bad(){this.tone(120,.12,'square')}
}
