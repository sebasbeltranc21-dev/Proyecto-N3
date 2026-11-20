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
 if(kind==='lance'){
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
export function heroWeapon(g,weapon,x,y,face,arena,frame){
 const attack=frame>=4&&frame<=7;
 const gripX=attack?[3,12,17,10][frame-4]:7;
 const gripY=attack?[24,24,20,19][frame-4]:20;
 const factor=arena?1.25:1;
 const kind=weapon===3?'slam':weapon===4?'dash':'sweep';
 const angle=attack?[-1.7,-.85,.16,.55][frame-4]:-.87;
 blade(g,kind,x+face*gripX*factor,y-gripY*factor,(weapon===2?.48:.68)*factor,face<0?Math.PI-angle:angle);
 if(weapon===2&&attack)blade(g,'sweep',x-4*face,y-15*factor,.36,face<0?Math.PI+.5:-.5);
}
export function armedEnemy(g,e,z,t,pose){
 const kind=e.move||['lance','fan','slam','dash'][z],face=e.face||1,active=e.wind>0;
 let angle=active?(kind==='slam'?-1.55:kind==='sweep'?-1.22:-.50):e.release>0?.1:-.93;
 if(face<0)angle=Math.PI-angle;
 const grip=(e.scout?10:z===3?17:14)+(pose.frame===3?6:pose.frame===2?-4:0);
 blade(g,kind,pose.x+face*grip,pose.y-(e.scout?20:z===3?33:26)+(active?Math.sin(t*20):0),e.scout?.73:z===3?1.12:.89,angle);
}
export function paintThreats(g,game){
 const e=game.enemy;if(!e)return;
 if(e.wind>0&&e.target){
 const c=Math.floor(game.time*6)%2?'#fff2a8':'#ffac75',a=Math.atan2(e.target.y-e.y,e.target.x-e.x),kind=e.move;
 if(kind==='slam'){ring(g,e.x,e.y,32,c,3);ring(g,e.x,e.y,62,c,4);}
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
 if(h.kind==='slam'){
 ring(g,h.x,h.y,h.radius,'#b77f60',2);ring(g,h.x,h.y,Math.max(0,h.radius-3),'#ffe5a0',1);
 }else if(h.kind==='sweep'){
 for(let i=-9;i<10;i++){const a=h.angle+i*.13;stroke(g,'#ffda8b',h.x+Math.cos(a)*52,h.y+Math.sin(a)*52,h.x+Math.cos(a)*66,h.y+Math.sin(a)*66);}
 }else if(h.kind==='lance'){oval(g,'#32404855',h.x|0,h.y|0,5,2);blade(g,'lance',h.x,h.y-5,.62,h.angle);}
 else{const a=h.angle+h.age*14;for(let j=0;j<3;j++){const b=a+j*2.094;poly(g,j?'#99c7d2':'#f4e1a8',[[h.x,h.y-5],[h.x+Math.cos(b)*9,h.y-5+Math.sin(b)*9],[h.x+Math.cos(b+.8)*5,h.y-5+Math.sin(b+.8)*5]].map(p=>p.map(Math.round)));}}
 }
}
export function attackCaption(e){return e?.wind>0?moves[e.move]?.name||'Estocada':'';}

