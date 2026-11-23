import {rect,poly,oval} from './art.js';
import {moves} from './arsenal.js';
function stroke(g,color,x,y,u,v,size=1){
 const n=Math.max(1,Math.ceil(Math.hypot(u-x,v-y)));
 for(let i=0;i<=n;i++)rect(g,color,x+(u-x)*i/n,y+(v-y)*i/n,size,size);
}
function marker(g,x,y,color,w=3){
 rect(g,'#4a3049',x-1,y-1,w+2,4);rect(g,color,x,y,w,2);
}
function ring(g,x,y,r,color,skip=1){
 for(let j=0;j<100;j+=skip){const a=j*Math.PI/50;marker(g,x+Math.cos(a)*r,y+Math.sin(a)*r,color,2);}
}
function blade(g,kind,x,y,size,angle){
 const c=Math.cos(angle)*size,s=Math.sin(angle)*size;
 const pt=(u,v)=>[Math.round(x+u*c-v*s),Math.round(y+u*s+v*c)];
 const shape=(color,points)=>poly(g,color,points.map(p=>pt(...p)));
 shape('#514439',[[-8,-2],[23,-2],[23,2],[-8,2]]);
 if(kind==='hook'){
 shape('#6f4660',[[0,0],[12,-9],[27,-6],[15,-3],[6,4]]);shape('#ffda81',[[1,0],[12,-8],[26,-6],[13,-5]]);
 }else if(kind==='bloom'){
 shape('#57874c',[[8,1],[18,-7],[20,-3],[30,-8],[24,1],[14,4]]);
 }else if(kind==='lance'){
 shape('#564b43',[[-14,-2],[24,-2],[24,2],[-14,2]]);shape('#e1ad70',[[-14,-1],[25,-1],[25,1],[-14,1]]);
 shape('#43575d',[[18,-5],[34,0],[19,5],[22,0]]);shape('#cdf0d7',[[19,-3],[32,0],[21,1]]);
 shape('#c96658',[[16,0],[20,1],[16,8],[11,10]]);
 }else if(kind==='slam'){
 shape('#53616a',[[12,-11],[25,-12],[30,-7],[30,7],[25,11],[12,10]]);
 shape('#9caeb4',[[14,-10],[25,-10],[28,-6],[26,5],[15,6]]);
 shape('#ebc17c',[[17,-11],[21,-11],[21,9],[17,9]]);
 }else if(kind==='fan'){
 for(const k of [-1,0,1])shape(k?'#90cee0':'#e4efdd',[[1,-2],[21,9*k-3],[26,11*k],[17,9*k+3],[1,2]]);
 }else{
 shape('#546477',[[0,-2],[22,-3],[34,-8],[30,0],[18,5],[0,3]]);
 shape(kind==='dash'?'#9ae2d2':'#e0e0c5',[[2,-1],[23,-2],[31,-6],[27,0],[14,3],[2,2]]);
 shape('#dfac60',[[-2,-6],[2,-6],[3,7],[-1,7]]);
 }
}
const heroArms=[
 [ // Traveler: narrow straight steel, with a brass crossguard.
  ['#302b34',[[1,-4],[23,-4],[30,0],[23,4],[1,4]]],
  ['#8c9da8',[[3,-3],[23,-3],[28,0],[23,3],[3,3]]],
  ['#fff2ce',[[3,-2],[23,-2],[28,0],[3,0]]]
 ],
 [ // Knight: a broad blue blade with visibly angled shoulders.
  ['#242739',[[2,-5],[8,-8],[30,-7],[38,0],[30,7],[8,8],[2,5]]],
  ['#466a99',[[3,-4],[9,-7],[29,-6],[36,0],[29,6],[9,7],[3,4]]],
  ['#81b9e1',[[4,-4],[10,-6],[29,-5],[36,0],[29,3],[9,4],[4,3]]],
  ['#e1f7ff',[[5,-4],[10,-6],[29,-5],[36,0],[29,-2],[10,-3]]]
 ],
 [ // Wind dagger: hooked, short and jade-edged.
  ['#25333d',[[1,-4],[11,-6],[20,-4],[17,2],[9,5],[1,3]]],
  ['#528a88',[[2,-3],[11,-5],[18,-3],[16,1],[9,4],[2,2]]],
  ['#d4fff1',[[2,-3],[11,-5],[18,-3],[12,-2],[2,0]]]
 ],
 [ // Dusk hammer: square iron head banded in brass.
  ['#292639',[[12,-12],[24,-12],[29,-7],[29,8],[24,12],[12,11]]],
  ['#66627d',[[13,-11],[24,-11],[28,-7],[28,7],[23,10],[13,10]]],
  ['#b9c3cc',[[13,-10],[24,-10],[27,-7],[27,-2],[14,-2]]],
  ['#e8b56a',[[17,-11],[21,-11],[21,10],[17,10]]]
 ],
 [ // Runic sword: a stepped edge and bright inlaid runes.
  ['#26343b',[[1,-4],[12,-5],[16,-8],[23,-4],[30,-6],[39,0],[30,6],[23,4],[16,8],[12,5],[1,4]]],
  ['#448778',[[3,-3],[12,-4],[16,-7],[23,-3],[30,-5],[37,0],[30,5],[23,3],[16,7],[12,4],[3,3]]],
  ['#9ef1b9',[[3,-2],[12,-3],[16,-6],[23,-2],[30,-4],[37,0],[30,0],[23,1],[16,4],[12,1],[3,1]]],
  ['#eaffb2',[[14,-1],[18,-1],[18,1],[14,1]]],
  ['#eaffb2',[[25,-1],[29,-1],[29,1],[25,1]]]
 ]
];
const heroGuards=['#dea653','#82c1ee','#d4b179','#e8b56a','#a9eeb4'];
function playerSteel(g,weapon,x,y,scale,angle,face){
 const c=Math.cos(angle)*scale,s=Math.sin(angle)*scale;
 const shape=(color,points)=>poly(g,color,points.map(([u,v])=>[
   Math.round(x+face*(u*c-v*s)),Math.round(y+u*s+v*c)
 ]));
 const haft=weapon===3?18:3;
 shape('#322635',[[-8,-3],[haft,-3],[haft,3],[-8,3]]);
 shape('#b87d51',[[-7,-1],[haft,-1],[haft,1],[-7,2]]);
 for(const [color,points] of heroArms[weapon])shape(color,points);
 if(weapon===3)return;
 const guard=weapon===1?8:weapon===2?4:5;
 shape('#322635',[[-3,-guard],[3,-guard],[4,guard],[-2,guard]]);
 shape(heroGuards[weapon],[[-2,-guard+1],[2,-guard+1],[3,guard-1],[0,guard-1]]);
}

const swingAngles=[
 [-1.54,-.77,.22,.74],
 [-1.9,-1.12,.12,.9],
 [-1.18,-.13,-.88,.24],
 [-2.13,-1.45,-.33,.72],
 [-1.67,-.51,.05,.63]
];
const readyAngles=[-.95,-.65,-.28,-.88,-.80];
export function heroWeapon(g,weapon,x,y,face,arena,frame){
 const attack=frame>=4&&frame<=7,phase=frame-4;
 const gripX=attack?[4,14,17,10][phase]:10;
 const gripY=attack?[21,22,18,16][phase]:17;
 const size=arena?1.25:1;
 const angle=attack?swingAngles[weapon][phase]:readyAngles[weapon];
 if(weapon===2){
  const offAngle=attack?[.55,1.15,.32,.83][phase]:.21;
  const offX=attack?[-6,-9,-13,-10][phase]:-8;
  playerSteel(g,weapon,x+face*offX*size,y-16*size,.70*size,offAngle,-face);
 }
 playerSteel(g,weapon,x+face*gripX*size,y-gripY*size,.75*size,angle,face);
}

export function heroStrike(g,weapon,x,y,face,reach,remaining){
 const phase=1-remaining/.23;
 if(phase<.22||phase>.90)return;
 if(weapon===3){
  if(phase<.52)return;
  const progress=(phase-.52)/.38;
  const ringX=x+face*reach*.56,radius=5+progress*17;
  for(let i=0;i<18;i++){
   const a=i*Math.PI/9;
   rect(g,i%3?'#d7a568':'#fff0b5',ringX+Math.cos(a)*radius,y-4+Math.sin(a)*radius*.32,3,2);
  }
  return;
 }
 const twin=weapon===2;
 const color=['#f2d8a1','#8dd4f5','#86e9c7','#f0cd92','#9cf6a6'][weapon];
 if(twin){
  for(let i=0;i<9;i++){
   const dx=(i-4)*2,dy=(i-4)*2;
   rect(g,color,x+(reach*.61+dx)*face,y-22+dy,3,2);
   if(phase>.34)rect(g,'#defbf1',x+(reach*.71+dx)*face,y-20-dy,3,2);
  }
  return;
 }
 const start=phase*1.5-1.66;
 for(let i=0;i<15;i++){
  const a=start+i*.105;
  const px=x+Math.cos(a)*reach*.75*face,py=y-23+Math.sin(a)*21;
  rect(g,i<9?color:'#fff6de',px,py,weapon===1?4:2,3);
  if(weapon===4&&i%3===0)rect(g,color,px+face*4,py-4,2,2);
 }
}
export function armedEnemy(g,e,z,t,pose){
 const kind=e.move||['lance','fan','slam','dash'][z],face=e.face||1,active=e.wind>0;
 let angle=active?(kind==='slam'?-1.55:kind==='sweep'?-1.22:-.50):e.release>0?.1:-.93;
 const progress=active?1-e.wind/e.windDuration:0;
 if(active)angle-=progress*(kind==='slam'?1.15:.78);
 if(e.release>0)angle+=(1-e.release/.25)*1.25-.45;
 if(face<0)angle=Math.PI-angle;
 const grip=(e.scout?10:z===3?17:14)+(pose.frame===3?6:pose.frame===2?-4:0);
 blade(g,kind,pose.x+face*grip,pose.y-(e.scout?20:z===3?33:26)+(active?Math.sin(t*20):0),e.scout?.73:z===3?1.12:.89,angle);
}
export function paintThreats(g,game){
 const e=game.enemy;if(!e)return;
 if(e.wind>0&&e.target){
 const c=Math.floor(game.time*6)%2?'#fff2a8':'#ffac75',a=Math.atan2(e.target.y-e.y,e.target.x-e.x),kind=e.move;
 if(kind==='bloom'){ring(g,e.target.x,e.target.y,23,c,3);}
 else if(kind==='hook'){for(let j=12;j<151;j+=10)marker(g,e.x+Math.cos(a)*j,e.y+Math.sin(a)*j,c);}
 else if(kind==='slam'){ring(g,e.x,e.y,32,c,3);ring(g,e.x,e.y,62,c,4);}
 else if(kind==='sweep'){
 for(let i=-11;i<=11;i++){const theta=a+i*.11;marker(g,e.x+Math.cos(theta)*65,e.y+Math.sin(theta)*65,c);}
 }else{
 for(const offset of kind==='fan'?[-.32,0,.32]:[0]){
 const reach=kind==='dash'?99:190;
 for(let j=14;j<reach;j+=9)marker(g,e.x+Math.cos(a+offset)*j,e.y+Math.sin(a+offset)*j,c);
 }
 }
 }
 for(const h of game.hazards){
 if(h.kind==='bloom'){
 const height=Math.round(23*Math.sin(Math.min(1,h.age/.38)*Math.PI));
 for(const dx of [-16,-8,0,8,16])poly(g,'#537544',[[h.x+dx-3,h.y+3],[h.x+dx+3,h.y-height],[h.x+dx+4,h.y+3]]);
 }else if(h.kind==='hook'){blade(g,'hook',h.x,h.y-4,.85,h.age*18);}
 else if(h.kind==='slam'){
 ring(g,h.x,h.y,h.radius,'#b77f60',2);ring(g,h.x,h.y,Math.max(0,h.radius-3),'#ffe5a0',1);
 }else if(h.kind==='sweep'){
 for(let i=-9;i<10;i++){const a=h.angle+i*.13;stroke(g,'#ffda8b',h.x+Math.cos(a)*52,h.y+Math.sin(a)*52,h.x+Math.cos(a)*66,h.y+Math.sin(a)*66);}
 }else if(h.kind==='lance'){oval(g,'#32404855',h.x|0,h.y|0,5,2);blade(g,'lance',h.x,h.y-5,.62,h.angle);}
 else{const a=h.angle+h.age*14;for(let j=0;j<3;j++){const b=a+j*2.094;poly(g,j?'#99c7d2':'#f4e1a8',[[h.x,h.y-5],[h.x+Math.cos(b)*9,h.y-5+Math.sin(b)*9],[h.x+Math.cos(b+.8)*5,h.y-5+Math.sin(b+.8)*5]].map(p=>p.map(Math.round)));}}
 }
}
export function attackCaption(e){return e?.wind>0?moves[e.move]?.name||'Estocada':'';}

