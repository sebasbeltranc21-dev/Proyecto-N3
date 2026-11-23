import {oval,poly,rect} from './art.js';

const ink='#191526',steel='#323145',plate='#596078',sheen='#8d9db5';
const bronze='#a97041',gold='#e1ad65',ivory='#ffe3aa';
const phases=[
 {light:'#ffd987',mid:'#b8814e',dark:'#74424c',cloak:'#842e4d',fold:'#b44661'},
 {light:'#c1fff0',mid:'#6ec7be',dark:'#376275',cloak:'#55486e',fold:'#806993'},
 {light:'#ffd5f1',mid:'#e28bbd',dark:'#8a4f84',cloak:'#6d2b6d',fold:'#a14a8d'}
];

function royalWeapon(g,x,y,angle,kind,p){
 const c=Math.cos(angle),s=Math.sin(angle);
 const shape=(color,points)=>poly(g,color,points.map(([u,v])=>[
  Math.round(x+u*c-v*s),Math.round(y+u*s+v*c)
 ]));
 shape(ink,[[-11,-3],[15,-3],[15,3],[-11,3]]);
 shape(gold,[[-9,-1],[9,-1],[9,1],[-9,1]]);
 shape(ivory,[[-11,-3],[-7,-3],[-7,3],[-11,3]]);
 if(kind==='slam'){
  shape(ink,[[24,-11],[36,-15],[50,-11],[54,-4],[54,7],[48,12],[33,14],[23,9]]);
  shape(plate,[[26,-9],[36,-13],[48,-9],[51,-4],[50,8],[45,10],[33,12],[25,7]]);
  shape(gold,[[28,-8],[35,-11],[39,-9],[37,10],[31,10],[29,6]]);
  shape(p.light,[[41,-7],[49,-5],[48,1],[40,3]]);
  return;
 }
 const point=kind==='lance'?62:48;
 shape(ink,[[4,-6],[14,-9],[32,-7],[point,0],[34,8],[14,10],[4,7]]);
 shape(p.dark,[[6,-5],[15,-7],[32,-5],[point-3,0],[33,6],[15,8],[6,5]]);
 shape(p.mid,[[8,-4],[16,-6],[31,-4],[point-3,0],[31,2],[16,3],[8,3]]);
 shape(p.light,[[15,-5],[31,-4],[point-4,0],[30,-1],[16,-1],[12,1]]);
 shape(ink,[[0,-9],[5,-10],[9,-5],[9,6],[5,9],[0,7],[3,3],[3,-4]]);
 shape(gold,[[2,-8],[5,-8],[7,-4],[7,6],[4,7],[5,3],[5,-4]]);
 shape(ivory,[[12,4],[20,4],[17,6],[12,6]]);
}

function mantle(g,drift,p){
 poly(g,ink,[[-21,-69],[11,-72],[23,-63],[28,-40],[33+drift,-14],[36+drift,2],[12,-3],[-1,-8],[-15,0],[-34+drift,2],[-29+drift,-21],[-27,-48]]);
 poly(g,p.dark,[[-19,-67],[10,-69],[21,-60],[25,-37],[31+drift,-13],[32+drift,-1],[12,-6],[-2,-11],[-19,-3],[-31+drift,0],[-26+drift,-22],[-25,-48]]);
 poly(g,p.cloak,[[-14,-65],[4,-68],[13,-58],[12,-35],[26+drift,-4],[9,-9],[-2,-18],[-16,-6],[-26+drift,-3],[-20,-34]]);
 poly(g,p.fold,[[-18,-59],[-13,-60],[-15,-34],[-22+drift,-8],[-25+drift,-7],[-20,-31]]);
 poly(g,p.fold,[[12,-50],[16,-47],[22,-26],[28+drift,-10],[25+drift,-9],[18,-29]]);
}

function sabaton(g,x,y){
 poly(g,ink,[[x-8,y-23],[x+6,y-23],[x+8,y-7],[x+16,y-3],[x+16,y+2],[x-11,y+2],[x-11,y-3],[x-7,y-9]]);
 poly(g,steel,[[x-6,y-22],[x+4,y-22],[x+6,y-6],[x+13,y-2],[x+13,y],[x-9,y],[x-6,y-5]]);
 poly(g,plate,[[x-5,y-21],[x+4,y-21],[x+3,y-10],[x-5,y-8]]);
 rect(g,gold,x-5,y-10,8,2);
 rect(g,sheen,x+4,y-4,5,2);
}

function cuirass(g,p,glint){
 poly(g,ink,[[-22,-69],[-11,-75],[16,-75],[29,-67],[28,-50],[18,-44],[15,-35],[21,-21],[15,-15],[5,-19],[-2,-13],[-16,-17],[-20,-26],[-16,-45],[-23,-49]]);
 poly(g,steel,[[-20,-68],[-10,-73],[14,-73],[25,-66],[23,-52],[16,-47],[13,-35],[18,-23],[15,-18],[5,-22],[-2,-16],[-15,-20],[-18,-27],[-13,-45],[-20,-51]]);
 poly(g,plate,[[-18,-67],[-9,-71],[12,-71],[22,-65],[19,-55],[11,-49],[-2,-50],[-13,-54]]);
 poly(g,sheen,[[-16,-67],[-8,-70],[11,-70],[20,-65],[12,-62],[1,-65],[-9,-63]]);
 poly(g,bronze,[[-14,-59],[-1,-56],[10,-57],[19,-63],[17,-57],[8,-52],[-3,-51],[-12,-54]]);
 poly(g,ink,[[-1,-66],[7,-71],[15,-65],[12,-58],[6,-54],[-1,-59]]);
 poly(g,p.dark,[[1,-65],[7,-68],[13,-64],[11,-59],[6,-56],[1,-60]]);
 poly(g,glint,[[3,-65],[7,-67],[11,-64],[6,-60]]);
 rect(g,bronze,-12,-39,25,4);
 rect(g,gold,-10,-39,20,1);
 rect(g,ink,-2,-39,7,6);
 rect(g,p.mid,-1,-38,5,4);
 for(const [x,y,w] of [[-15,-32,9],[-14,-27,9],[7,-31,8],[8,-26,8]]){
  rect(g,plate,x,y,w,3);
  rect(g,bronze,x+1,y+2,w-2,1);
 }
 poly(g,p.cloak,[[-5,-34],[5,-34],[7,-21],[1,-14],[-6,-18]]);
 rect(g,gold,-2,-31,4,2);
 rect(g,p.light,-1,-29,2,5);
}

function pauldron(g,x,y,p,front){
 poly(g,ink,[[x-14,y-5],[x-12,y-12],[x-6,y-15],[x-1,y-21],[x+5,y-14],[x+12,y-12],[x+16,y-5],[x+11,y+5],[x-3,y+7],[x-11,y+3]]);
 poly(g,steel,[[x-12,y-5],[x-10,y-11],[x-4,y-13],[x-1,y-17],[x+4,y-12],[x+10,y-11],[x+13,y-5],[x+9,y+3],[x-2,y+5],[x-9,y+1]]);
 poly(g,front?sheen:plate,[[x-10,y-7],[x-7,y-11],[x+2,y-13],[x+9,y-10],[x+12,y-5],[x+3,y-7],[x-4,y-4]]);
 poly(g,gold,[[x-10,y-5],[x-5,y-2],[x+3,y-1],[x+12,y-5],[x+10,y-1],[x+3,y+2],[x-7,y+1]]);
 rect(g,p.light,x+2,y-10,3,2);
}

function crown(g,p,y,flash){
 poly(g,ink,[[-12,y+1],[-15,y-8],[-13,y-16],[-8,y-15],[-7,y-20],[0,y-16],[6,y-22],[11,y-16],[18,y-20],[19,y-10],[22,y-6],[20,y+7],[13,y+15],[-4,y+15],[-12,y+8]]);
 poly(g,plate,[[-10,y+1],[-12,y-7],[-7,y-11],[15,y-11],[20,y-5],[18,y+7],[12,y+13],[-3,y+13],[-10,y+7]]);
 poly(g,ink,[[-9,y-1],[-3,y-5],[17,y-6],[19,y-1],[16,y+5],[1,y+7],[-6,y+4]]);
 poly(g,sheen,[[-7,y+7],[-3,y+8],[1,y+7],[10,y+8],[15,y+5],[13,y+10],[3,y+12],[-4,y+11]]);
 rect(g,flash?ivory:p.light,8,y-2,8,2);
 rect(g,p.mid,-3,y,5,1);
 const peak=p===phases[2]?27:23;
 poly(g,ink,[[-14,y-7],[-19,y-23],[-12,y-20],[-7,y-14],[-6,y-23],[-1,y-18],[6,y-peak],[12,y-17],[16,y-22],[16,y-14],[23,y-21],[21,y-9],[16,y-5],[-8,y-5]]);
 poly(g,bronze,[[-13,y-8],[-17,y-21],[-12,y-18],[-6,y-12],[-5,y-20],[-1,y-16],[6,y-peak+3],[12,y-15],[15,y-19],[15,y-12],[21,y-18],[19,y-10],[15,y-7],[-8,y-7]]);
 poly(g,gold,[[-16,y-19],[-11,y-16],[-6,y-10],[-2,y-12],[6,y-peak+4],[10,y-15],[7,y-10],[14,y-9],[19,y-15],[17,y-9],[14,y-8],[-8,y-8]]);
 poly(g,p.light,[[3,y-13],[6,y-18],[9,y-13],[6,y-9]]);
 rect(g,ivory,5,y-14,2,3);
}

export function drawMimicKing(g,king,time){
 const phase=king.phase??1,p=phases[phase-1];
 const moving=king.walk||king.lunge;
 const stride=moving?Math.round(Math.sin(time*17)*5):0;
 const wind=king.wind>0?1-king.wind/king.windDuration:0;
 const swing=king.release>0?1-king.release/.25:0;
 const shifting=king.phaseDelay>0;
 const hurt=king.hurt>0;
 const bob=Math.round(Math.cos(time*5))+Math.round(Math.abs(stride)*.32);
 const lean=Math.round((king.lunge?8:0)+Math.sin(Math.PI*swing)*8-wind*5-(hurt?3:0));
 const drift=Math.round(Math.sin(time*6)*3)-Math.abs(stride)-Math.abs(lean);
 const weaponAngle=king.wind>0 ? -.82-wind*(king.move==='slam'?1.12:.65) :
   king.release>0 ? -1.38+swing*2.14 : king.lunge ? .05 : -.92;
 const handX=23+Math.round((king.lunge?6:0)+swing*10-wind*4);
 const handY=-40-Math.round(wind*13)+Math.round(swing*10);
 oval(g,'#130e2188',king.x,king.y,33,8);
 g.save();
 g.translate(Math.round(king.x),Math.round(king.y));
 g.scale(king.face??-1,1);
 if(phase>1||shifting){
  for(let i=0;i<(phase===3?7:4);i++){
   const angle=time*(shifting?4.8:1.32)+i*1.9;
   const x=Math.round(Math.cos(angle)*(36+i%2*6)),y=Math.round(-54+Math.sin(angle*1.6)*25);
   poly(g,ink,[[x-4,y],[x,y-8],[x+5,y-2],[x+3,y+5],[x-1,y+9]]);
   poly(g,p.mid,[[x-2,y],[x,y-6],[x+3,y-2],[x+1,y+5]]);
   rect(g,p.light,x,y-3,1,4);
  }
 }
 mantle(g,drift,p);
 sabaton(g,-13-stride,-Math.max(0,stride));
 sabaton(g,9+stride,Math.min(0,stride));
 g.translate(lean,bob);
 pauldron(g,-18,-59,p,false);
 cuirass(g,p,hurt||shifting?ivory:p.light);
 poly(g,ink,[[10,-64],[20,-62],[26,-50],[handX+8,handY-6],[handX+8,handY+4],[handX-2,handY+8],[14,-45],[8,-54]]);
 poly(g,plate,[[12,-62],[18,-59],[22,-48],[handX+6,handY-4],[handX+6,handY+3],[handX,handY+5],[16,-46],[10,-54]]);
 pauldron(g,19,-61,p,true);
 royalWeapon(g,handX+2,handY,weaponAngle,king.move,p);
 rect(g,bronze,handX-2,handY-4,8,8);
 rect(g,gold,handX-1,handY-4,6,3);
 crown(g,p,-78,hurt||shifting);
 g.restore();
}
