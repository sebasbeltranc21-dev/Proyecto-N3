import {rect,poly,oval} from './art.js';
import {moves} from './arsenal.js';
import {diamondIndex} from './engine.js';
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
 if(kind==='edict'){
 shape('#473044',[[-8,-3],[25,-4],[37,0],[25,4],[-8,3]]);
 shape('#e0ab7a',[[3,-2],[27,-3],[35,0],[24,2],[3,1]]);
 shape('#e087da',[[1,-7],[7,-5],[9,0],[7,5],[1,7],[3,0]]);
 }else if(kind==='hook'){
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
  ['#808b9b',[[3,-3],[23,-3],[28,0],[23,3],[3,3]]],
  ['#b7c1bd',[[3,-2],[23,-2],[28,0],[3,1]]],
  ['#f8e8bf',[[7,-2],[23,-2],[27,0],[14,-1]]]
 ],
 [ // Knight: a broad blue blade with visibly angled shoulders.
  ['#292738',[[2,-4],[8,-7],[28,-6],[36,0],[28,6],[8,7],[2,4]]],
  ['#4d627f',[[4,-4],[9,-6],[27,-5],[34,0],[27,5],[9,6],[4,3]]],
  ['#7d9ab6',[[4,-3],[10,-5],[27,-4],[34,0],[27,2],[9,2],[4,1]]],
  ['#c9d5d5',[[8,-3],[11,-5],[27,-4],[33,0],[16,-2]]]
 ],
 [ // Wind dagger: hooked, short and jade-edged.
  ['#292e38',[[4,-3],[10,-4],[16,-6],[22,-6],[19,-2],[15,2],[10,4],[4,4]]],
  ['#496461',[[5,-2],[10,-3],[16,-5],[20,-5],[17,-1],[14,1],[10,3],[5,3]]],
  ['#8bad9b',[[5,-2],[10,-3],[16,-5],[20,-5],[16,-2],[10,0],[5,1]]],
  ['#dbdcc0',[[11,-3],[16,-5],[20,-5],[16,-3]]]
 ],
 [ // Dusk hammer: square iron head banded in brass.
  ['#292639',[[12,-12],[24,-12],[29,-7],[29,8],[24,12],[12,11]]],
  ['#665b6b',[[13,-11],[24,-11],[28,-7],[28,7],[23,10],[13,10]]],
  ['#a9a0a6',[[13,-10],[24,-10],[27,-7],[27,-2],[14,-2]]],
  ['#8d634b',[[17,-11],[22,-11],[22,10],[17,10]]],
  ['#dcb478',[[17,-10],[20,-10],[20,5],[17,7]]],
  ['#d9ccc0',[[22,-9],[24,-9],[26,-7],[25,-6],[22,-7]]]
 ],
 [ // Runic sword: a stepped edge and bright inlaid runes.
  ['#26343b',[[1,-4],[12,-5],[16,-8],[23,-4],[30,-6],[39,0],[30,6],[23,4],[16,8],[12,5],[1,4]]],
  ['#946242',[[3,-3],[12,-4],[16,-7],[23,-3],[30,-5],[37,0],[30,5],[23,3],[16,7],[12,4],[3,3]]],
  ['#edc682',[[3,-2],[12,-3],[16,-6],[23,-2],[30,-4],[37,0],[30,0],[23,1],[16,4],[12,1],[3,1]]],
  ['#fff1b4',[[14,-1],[18,-1],[18,1],[14,1]]],
  ['#fff1b4',[[25,-1],[29,-1],[29,1],[25,1]]]
 ],
 [
  ['#4df3ef36',[[1,-9],[12,-12],[34,-10],[53,0],[34,10],[12,12],[1,9]]],
  ['#123943',[[1,-5],[12,-8],[35,-7],[48,0],[35,7],[12,8],[1,5]]],
  ['#2399a7',[[3,-4],[13,-7],[34,-6],[46,0],[34,6],[13,7],[3,4]]],
  ['#61e7e7',[[4,-3],[13,-6],[34,-5],[46,0],[33,3],[12,2],[4,2]]],
  ['#e5ffff',[[9,-3],[15,-5],[34,-4],[45,0],[33,-1],[14,0]]],
  ['#b0ffff',[[13,2],[20,1],[18,4],[13,5]]]
 ]
];
const heroGuards=['#dea653','#82c1ee','#d4b179','#e8b56a','#e7aa62','#9ff7f1'];
function playerSteel(g,weapon,x,y,scale,angle,face){
 const c=Math.cos(angle)*scale,s=Math.sin(angle)*scale;
 const shape=(color,points)=>poly(g,color,points.map(([u,v])=>[
   Math.round(x+face*(u*c-v*s)),Math.round(y+u*s+v*c)
 ]));
 const haft=weapon===3?18:3;
 const gripEnd=weapon===2?-5:-7;
 shape('#30252d',[[gripEnd-1,-2],[haft,-2],[haft,3],[gripEnd-1,3]]);
 shape('#90684c',[[gripEnd,-1],[haft,-1],[haft,1],[gripEnd,2]]);
 shape('#d9a86e',[[gripEnd-1,-2],[gripEnd+1,-2],[gripEnd+1,2],[gripEnd-1,2]]);
 for(const [color,points] of heroArms[weapon])shape(color,points);
 if(weapon===3)return;
 const guard=weapon===1?7:weapon===2?4:5;
 shape('#322635',[[1,-guard],[5,-guard],[5,guard],[2,guard]]);
 shape(heroGuards[weapon],[[2,-guard+1],[4,-guard+1],[4,guard-1],[2,guard-1]]);
}

const swingAngles=[
 [-1.54,-.77,.22,.74],
 [-1.9,-1.12,.12,.9],
 [-1.18,-.13,-.88,.24],
 [-2.13,-1.45,-.33,.72],
 [-1.67,-.51,.05,.63],
 [-1.72,-.52,.18,.84]
];
const readyAngles=[-.86,-.72,-.58,-.92,-.76,-.83];
// Hand anchors follow the walking, attack and idle frames in the hero atlas.
const frontHand=[[11,21],[8,18],[9,17],[7,17],[11,17],[20,24],[17,6],[11,17]];
const rearHand=[[-8,17],[-6,15],[-7,19],[-7,15],[-12,28],[-16,15],[-15,17],[-9,20]];
export function heroWeapon(g,weapon,x,y,face,arena,frame){
 const attack=frame>=4&&frame<=7,phase=frame-4;
 const [gripX,gripY]=frontHand[frame]??[9,13];
 const size=arena?1.25:1;
 const angle=attack?swingAngles[weapon][phase]:readyAngles[weapon];
 if(weapon===2){
  const offAngle=attack?[-.24,.78,.42,.65][phase]:.54;
  const [offX,offY]=rearHand[frame]??[-7,15];
  playerSteel(g,weapon,x+face*offX*size,y-offY*size,.60*size,offAngle,-face);
 }
 playerSteel(g,weapon,x+face*gripX*size,y-gripY*size,.69*size,angle,face);
}

export function heroStrike(g,weapon,x,y,face,reach,remaining){
 const phase=1-remaining/.23;
 if(weapon===diamondIndex){
  const radius=reach*(.64+.36*phase);
  for(let i=0;i<34;i++){
   const a=i*Math.PI/17+phase*.52;
   const px=x+Math.cos(a)*radius,py=y+Math.sin(a)*radius*.52;
   rect(g,i%3?'#69fff1':'#efffff',px,py-4,i%3?4:7,3);
   if(i%4===0)rect(g,'#43bee5',px-2,py+3,3,2);
  }
  return;
 }
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
 const color=['#f2d8a1','#8dd4f5','#86e9c7','#f0cd92','#ffd28a'][weapon];
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
export function drawDiamondBlade(g,x,y,scale){
 playerSteel(g,diamondIndex,x,y,scale,-Math.PI/2,1);
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
function drawRune(g,x,y,color,radius){
 ring(g,x,y,radius,color,3);
 stroke(g,color,x-7,y,x+7,y);
 stroke(g,color,x,y-7,x,y+7);
}
export function paintThreats(g,game){
 const e=game.enemy;if(!e)return;
 if(e.wind>0&&e.target){
 const c=Math.floor(game.time*6)%2?'#fff2a8':'#ffac75',a=Math.atan2(e.target.y-e.y,e.target.x-e.x),kind=e.move;
 if(kind==='edict'){
   for(const rune of e.runes)drawRune(g,rune.x,rune.y,c,20);
 }else if(kind==='bloom'){ring(g,e.target.x,e.target.y,23,c,3);}
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
 if(h.kind==='edict'){
  const age=h.age-h.delay;
  drawRune(g,h.x,h.y,age<0?'#df9dd7':'#ffcca4',20);
  if(age>=0)for(let i=-2;i<=2;i++){
   const height=Math.max(1,Math.round((1-age/.43)*(24-Math.abs(i)*5)));
   rect(g,i%2?'#eda1d9':'#fff1bb',h.x+i*6,h.y-height,3,height);
  }
 }else if(h.kind==='bloom'){
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

