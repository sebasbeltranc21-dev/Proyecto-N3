const tracks = {
  map:[64,67,71,74,71,67,69,0,62,66,69,72,69,66,67,0,60,64,67,72,71,67,64,0,62,66,69,74,72,69,67,0],
  arena:[57,64,0,67,64,60,64,69,57,64,67,0,69,67,64,60,55,62,65,69,65,62,0,65,59,66,68,71,68,66,62,0],
  king:[45,0,52,57,58,57,52,0,46,53,58,62,61,58,53,0,43,50,55,58,62,58,55,50,44,51,56,59,63,59,56,51],
  cinematic:[57,0,60,0,64,0,69,67,64,0,60,0,59,0,64,0,55,0,59,0,62,0,67,64,62,0,59,0,57,0,0,0],
  dragon:[45,45,52,0,45,55,53,52,46,46,53,0,46,57,55,53,41,41,48,0,41,52,50,48,43,43,50,0,43,55,52,50]
};
const sounds = {
  step:[130,99],click:[68,76],enter:[69,66,63,54],hit:[48,36],roll:[61,67],
  heal:[64,68,71,76],item:[62,74,70],loot:[67,71,74,79],adapt:[81,75,82],
  win:[60,64,67,72,76],hurt:[51,43,36],
  sword:[60,64,67,72,76,79,84],
  rumble:[36,34,33,31],
  voice:[74],
  diamond:[77,89],
  dragon_roar:[33,38,31,26],
  dragon_fire:[53,46,40]
};
export class ChipAudio {
  constructor() { this.level = 1; this.mode='map'; this.beat=0; this.samples={}; }
  async start() {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    if (!this.ctx) {
      this.ctx = new Context();
      this.master = this.ctx.createGain();
      this.master.connect(this.ctx.destination);
      this.volume(this.level);
    }
    await this.ctx.resume().catch(()=>{});
    this.next = this.ctx.currentTime;
  }
  volume(n){ this.level=n; if(this.master) this.master.gain.value=[0,0.14,0.27][n]; }
  track(mode){if(this.mode!==mode){this.mode=mode;this.beat=0;}}
  tone(note,start,duration,type,gain) {
    if (!this.ctx || !note) return;
    const osc=this.ctx.createOscillator(), env=this.ctx.createGain();
    osc.type=type; osc.frequency.value=440*2**((note-69)/12);
    env.gain.setValueAtTime(0.001,start);
    env.gain.exponentialRampToValueAtTime(gain,start+0.008);
    env.gain.exponentialRampToValueAtTime(0.001,start+duration);
    osc.connect(env);env.connect(this.master);osc.start(start);osc.stop(start+duration+0.01);
  }
  tick(){
    if (!this.ctx || this.ctx.state!=='running' || !this.level) return;
    const now=this.ctx.currentTime, beatLength={map:0.19,arena:0.14,king:0.16,cinematic:0.25,dragon:0.13}[this.mode]||0.19;
    if(this.next<now) this.next=now;
    while(this.next < now+0.08){
      const i=this.beat%32;
      const wave=['king','dragon'].includes(this.mode)?'sawtooth':this.mode==='cinematic'?'triangle':'square';
      const leadGain=this.mode==='cinematic'?0.18:0.13;
      this.tone(tracks[this.mode][i],this.next,beatLength*0.93,wave,leadGain);
      if(i%2===0){
        const bass=tracks[this.mode][i-i%8];
        if(bass)this.tone(bass-12+(i%4?7:0),this.next,beatLength*1.6,'triangle',this.mode==='cinematic'?0.28:0.42);
      }
      this.next+=beatLength;this.beat++;
    }
  }
  async loadSample(key,url){
    if(!this.ctx) await this.start();
    const response=await fetch(url);
    if(!response.ok) throw new Error('No se pudo cargar '+url);
    this.samples[key]=await this.ctx.decodeAudioData(await response.arrayBuffer());
  }
  play(key, weapon=0){
    if(!this.ctx || !this.level)return;
    if(this.samples[key]){
      const src=this.ctx.createBufferSource();src.buffer=this.samples[key];src.connect(this.master);src.start();return;
    }
    if(key==='step'){this.tone(38,this.ctx.currentTime,.038,'triangle',.12);return;}
    if(key==='voice'){this.tone(68+(weapon%5)*3,this.ctx.currentTime,.035,'triangle',.09);return;}
    if(key==='rumble'){
      sounds.rumble.forEach((n,i)=>this.tone(n,this.ctx.currentTime+i*.09,.22,'sawtooth',.16));
      return;
    }
    if(key==='sword'){
      sounds.sword.forEach((n,i)=>this.tone(n,this.ctx.currentTime+i*.065,.22,'triangle',.24));
      return;
    }
    if(key==='diamond'||key.startsWith('dragon_')){
      const diamond=key==='diamond';
      sounds[key].forEach((n,i)=>this.tone(n,this.ctx.currentTime+i*(diamond?.035:.08),diamond?.10:.24,diamond?'triangle':'sawtooth',diamond?.14:.20));
      return;
    }
    const notes=key==='attack'?[[71,60],[69,53],[84,75,84],[46,32],[78,83,68]][weapon]:sounds[key];
    notes?.forEach((n,i)=>this.tone(n,this.ctx.currentTime+i*.052,.105,key==='hurt'||key==='attack'?'sawtooth':'square',.22));
  }
}
