import {oval,poly,rect} from './art.js';

const outline='#2d2234';
const metal=['#3c374b','#555366','#75758a','#a59e9e'];
const trim=['#75463f','#b4774c','#e0aa65','#ffe4a8'];
const colors=[
 {cloth:['#603349','#94425a','#bf5a60'],light:'#ffdc91',gem:'#c47555'},
 {cloth:['#2c4b57','#426e74','#6ba79a'],light:'#d9ffdf',gem:'#7bc4b4'},
 {cloth:['#593449','#7f3b63','#aa537b'],light:'#ffd5e8',gem:'#db87a5'}
];

function boot(g,x,y){
 poly(g,outline,[[x-7,y-18],[x+6,y-18],[x+8,y-6],[x+12,y-4],[x+13,y+2],[x-8,y+2]]);
 poly(g,metal[1],[[x-5,y-16],[x+4,y-16],[x+6,y-5],[x+11,y-3],[x+11,y],[x-6,y]]);
 rect(g,metal[2],x-5,y-12,9,3);
 rect(g,trim[1],x-5,y-7,10,2);
 rect(g,metal[2],x+4,y-3,6,1);
 rect(g,metal[3],x-4,y-12,4,1);
 rect(g,outline,x-3,y-5,2,3);
}

function mantle(g,drift,p,drop){
 const [shade,base,light]=p.cloth;
 poly(g,outline,[[-17,-56],[11,-56],[19,-47],[16,-29],[22+drift,-13],[22+drift,1],[8,-3],[-4,1],[-13+drift,2],[-30+drift,drop-2],[-25,-20],[-24,-41]]);
 poly(g,shade,[[-16,-54],[10,-54],[17,-46],[14,-29],[20+drift,-12],[20+drift,-1],[7,-5],[-5,-1],[-14+drift,0],[-28+drift,drop-3],[-23,-21],[-22,-40]]);
 poly(g,base,[[-20,-43],[-13,-52],[-6,-47],[-10,-30],[-15+drift,-4],[-24+drift,drop-6],[-22,-19]]);
 poly(g,light,[[-19,-43],[-15,-48],[-13,-45],[-16,-25],[-21+drift,-11],[-21+drift,-17]]);
 poly(g,base,[[9,-38],[13,-30],[19+drift,-10],[18+drift,-6],[13,-13]]);
 const hem=-26+drift;
 rect(g,trim[1],hem,drop-7,4,2);
 rect(g,trim[1],hem+4,drop-6,5,2);
 rect(g,trim[2],hem+1,drop-7,4,1);
 rect(g,light,-19+drift,-16,2,6);
 rect(g,base,16+drift,-12,2,6);
}

function armor(g,p){
 poly(g,outline,[[-20,-55],[-10,-60],[12,-59],[25,-52],[26,-43],[18,-38],[12,-34],[16,-22],[4,-17],[-10,-18],[-17,-23],[-15,-37],[-22,-43]]);
 poly(g,metal[0],[[-18,-54],[-10,-58],[12,-57],[22,-51],[24,-44],[16,-40],[10,-35],[14,-23],[3,-19],[-9,-20],[-15,-24],[-13,-37],[-20,-44]]);
 poly(g,metal[1],[[-13,-53],[-5,-56],[11,-55],[17,-51],[15,-44],[7,-40],[-6,-42],[-13,-46]]);
 poly(g,metal[2],[[-11,-51],[-5,-54],[8,-54],[14,-51],[8,-48],[-4,-48],[-9,-46]]);
 rect(g,metal[3],-8,-51,6,2);
 rect(g,metal[2],-11,-46,4,2);
 rect(g,trim[2],-12,-44,2,2);
 rect(g,metal[2],9,-47,3,2);
 rect(g,metal[3],12,-45,2,1);
 poly(g,trim[1],[[-10,-47],[-5,-43],[5,-42],[13,-46],[11,-42],[4,-40],[-6,-41]]);
 poly(g,outline,[[0,-49],[4,-53],[9,-49],[8,-45],[4,-43],[0,-46]]);
 poly(g,p.gem,[[1,-49],[4,-51],[7,-49],[7,-46],[4,-44],[1,-46]]);
 rect(g,p.light,3,-49,3,2);
 rect(g,trim[1],-12,-34,24,3);
 rect(g,trim[2],-2,-35,6,4);
 poly(g,p.cloth[1],[[-5,-30],[7,-30],[9,-21],[2,-16],[-6,-20]]);
 rect(g,p.cloth[2],-3,-29,3,8);
 rect(g,trim[2],-2,-24,6,2);
 for(const [x,y] of [[-12,-28],[-10,-24],[9,-28],[10,-24]])rect(g,metal[2],x,y,4,2);
}

function head(g,p,y,exposed){
 const shape=(color,points)=>poly(g,color,points.map(([x,v])=>[x,y+v]));
 shape(outline,[[-12,-3],[-9,-7],[9,-8],[14,-4],[16,3],[14,10],[9,15],[0,16],[-7,13],[-11,8]]);
 shape('#514052',[[-10,-1],[-7,-5],[8,-6],[12,-3],[14,4],[12,10],[8,13],[0,14],[-7,11],[-9,7]]);
 shape('#b97f64',[[-4,-2],[8,-4],[12,0],[12,5],[15,6],[13,9],[9,9],[9,12],[3,14],[-3,11],[-6,7]]);
 shape('#e5ab78',[[-2,-1],[8,-3],[11,1],[10,5],[13,7],[9,8],[6,11],[0,11],[-3,7]]);
 shape('#ffe1a0',[[1,0],[9,-2],[10,1],[7,3],[1,3]]);
 rect(g,outline,7,y+3,3,3);
 rect(g,exposed?'#fff0bc':p.light,8,y+3,1,1);
 rect(g,'#744758',6,y+9,5,1);
 shape(outline,[[-12,0],[-16,-15],[-11,-14],[-6,-8],[-5,-13],[-2,-10],[3,-19],[7,-17],[9,-9],[14,-15],[18,-15],[16,-3],[11,0]]);
 shape(trim[1],[[-11,-2],[-14,-13],[-11,-12],[-5,-6],[-4,-11],[-1,-7],[4,-17],[6,-16],[9,-6],[15,-13],[16,-13],[14,-4],[10,-2]]);
 shape(trim[2],[[-12,-12],[-8,-9],[-4,-6],[0,-8],[4,-16],[6,-14],[7,-8],[10,-5],[15,-12],[13,-6],[10,-4],[-9,-4]]);
 rect(g,trim[3],-9,y-5,7,1);
 rect(g,trim[3],3,y-15,2,2);
 rect(g,trim[3],-12,y-11,2,2);
 rect(g,trim[0],-2,y-4,3,2);
 rect(g,trim[2],10,y-3,2,2);
 rect(g,p.gem,4,y-10,4,5);
 rect(g,p.light,5,y-10,2,2);
}

function weapon(g,x,y,angle,move,p){
 const c=Math.cos(angle),s=Math.sin(angle);
 const shape=(color,points)=>poly(g,color,points.map(([u,v])=>[
   Math.round(x+u*c-v*s),Math.round(y+u*s+v*c)
 ]));
 const length=move==='lance'?46:35;
 shape(outline,[[-8,-2],[17,-2],[17,3],[-8,3]]);
 shape(trim[1],[[-7,-1],[17,-1],[17,1],[-7,1]]);
 if(move==='slam'){
  shape(outline,[[14,-10],[28,-11],[33,-7],[33,7],[29,10],[14,10]]);
  shape(metal[1],[[16,-9],[27,-9],[31,-6],[31,6],[28,8],[16,8]]);
  shape(metal[2],[[17,-8],[26,-8],[30,-5],[28,-2],[17,-2]]);
  shape(trim[2],[[20,-9],[23,-9],[23,8],[20,8]]);
 }else{
  shape(outline,[[3,-5],[10,-7],[length-7,-5],[length,0],[length-7,5],[10,6],[3,4]]);
  shape(metal[2],[[7,-4],[11,-6],[length-8,-4],[length-2,0],[length-8,4],[11,4],[7,3]]);
  shape(p.light,[[8,-3],[12,-5],[length-8,-3],[length-2,0],[13,-1],[8,1]]);
  shape(trim[2],[[1,-5],[4,-6],[6,0],[4,5],[1,5],[2,0]]);
 }
}

export function drawMimicKing(g,king,time){
 const phase=king.phase??1,p=colors[phase-1];
 const exposed=king.exposed>0;
 const walking=king.walk||king.lunge;
 const stride=walking?Math.round(Math.sin(time*17)*4):0;
 const wind=king.wind>0?1-king.wind/king.windDuration:0;
 const swing=king.release>0?1-king.release/.25:0;
 const bob=exposed?5:Math.round(Math.cos(time*5)+Math.abs(stride)*.35);
 const lean=exposed?-3:Math.round((king.lunge?6:0)+Math.sin(Math.PI*swing)*6-wind*4-(king.hurt>0?3:0));
 const drift=Math.round(Math.sin(time*5)*3)-Math.abs(stride);
 const handX=19+Math.round(swing*10-wind*4),handY=-35+Math.round(swing*7-wind*10)+(exposed?11:0);
 const angle=exposed?.63:king.wind>0?-.74-wind*(king.move==='slam'?1.25:.7):
   king.release>0?-1.30+swing*2.1:king.lunge?.04:-.74;
 oval(g,'#23203970',king.x,king.y,23,5);
 g.save();
 g.translate(Math.round(king.x),Math.round(king.y));
 g.scale(king.face??-1,1);
 mantle(g,drift,p,exposed?3:0);
 boot(g,-10-stride,-3-Math.max(0,stride));
 boot(g,8+stride,Math.min(0,stride));
 g.translate(lean,bob);
 poly(g,outline,[[-19,-57],[-12,-60],[-7,-55],[-9,-45],[-14,-42],[-15,-36],[-21,-35],[-25,-42],[-24,-48]]);
 poly(g,metal[1],[[-18,-55],[-12,-58],[-9,-54],[-11,-46],[-16,-43],[-16,-38],[-20,-37],[-23,-42],[-22,-49]]);
 rect(g,metal[2],-21,-50,6,2);
 rect(g,trim[1],-20,-42,4,2);
 armor(g,p);
 const shoulderY=exposed?-44:-49;
 poly(g,outline,[[12,shoulderY-8],[21,shoulderY-10],[27,shoulderY-5],[28,shoulderY+1],[24,shoulderY+5],[handX+5,handY+4],[handX-4,handY+3],[15,shoulderY+5],[10,shoulderY]]);
 poly(g,metal[1],[[13,shoulderY-7],[21,shoulderY-8],[25,shoulderY-4],[26,shoulderY+1],[22,shoulderY+4],[handX+3,handY+2],[handX-2,handY+1],[15,shoulderY+2]]);
 poly(g,metal[2],[[15,shoulderY-6],[21,shoulderY-7],[24,shoulderY-4],[19,shoulderY-3],[14,shoulderY-1]]);
 rect(g,trim[2],19,shoulderY,6,2);
 weapon(g,handX,handY,angle,king.move,p);
 rect(g,outline,handX-4,handY-4,7,7);
 rect(g,trim[1],handX-3,handY-3,5,5);
 rect(g,trim[2],handX-2,handY-3,4,2);
 head(g,p,-59+(exposed?3:0),exposed);
 if(phase>1||exposed){
  const count=exposed?3:phase;
  for(let i=0;i<count;i++){
   const a=time*3+i*2.1,px=Math.round(Math.cos(a)*(exposed?19:32)),py=Math.round((exposed?-76:-48)+Math.sin(a)*12);
   rect(g,p.gem,px-1,py-1,4,4);
   rect(g,exposed?trim[3]:p.light,px,py,2,2);
  }
 }
 g.restore();
}
