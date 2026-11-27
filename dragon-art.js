import {oval,poly,rect} from './art.js';
import {diveFlight} from './battle-plus.js';

const ink='#302639';
const deep='#374552',jade='#45645f',fern='#62877a',sage='#8ba992';
const membrane=['#633747','#874b58','#ae6665','#d08b73'];
const horn=['#925b53','#c68a65','#f1c88e'];

function tail(g,sway){
 poly(g,ink,[[-31,-38],[-54,-35],[-69,-24],[-84,-20],[-96,-24+sway],[-104,-38+sway],[-95,-37+sway],[-88,-43+sway],[-88,-30+sway],[-80,-25],[-66,-31],[-54,-43],[-31,-48]]);
 poly(g,deep,[[-32,-39],[-53,-37],[-68,-26],[-84,-22],[-94,-26+sway],[-101,-36+sway],[-95,-35+sway],[-90,-39+sway],[-90,-30+sway],[-80,-27],[-65,-33],[-53,-44],[-32,-46]]);
 poly(g,fern,[[-35,-44],[-52,-42],[-64,-34],[-79,-27],[-86,-26],[-80,-24],[-68,-28],[-54,-38],[-35,-41]]);
 for(const [x,y] of [[-46,-42],[-56,-38],[-65,-32],[-74,-27],[-86,-25]])rect(g,sage,x,y,3,1);
 poly(g,horn[1],[[-100,-36+sway],[-94,-34+sway],[-90,-39+sway],[-91,-31+sway],[-95,-29+sway]]);
}

function wing(g,beat,spread,far){
 const lift=Math.round(beat),jointX=far?10:-13,jointY=-42,elbowX=far?37:-47;
 const elbowY=(far?-81:-90)+lift;
 const tipX=far?67+spread:-86-spread,tipY=(far?-72:-80)+lift;
 const edgeX=far?49:-60,edgeY=-46+Math.round(lift*.45);
 poly(g,ink,[[jointX,jointY+9],[jointX-8,jointY-5],[elbowX,elbowY-4],[tipX,tipY-4],[tipX+(far?5:-4),tipY+8],[tipX+(far?-10:9),tipY+5],[edgeX,edgeY],[edgeX+(far?-12:11),edgeY-7],[jointX+(far?18:-18),jointY-2],[jointX+(far?9:-10),jointY-7]]);
 poly(g,membrane[0],[[jointX,jointY+5],[jointX-5,jointY-5],[elbowX,elbowY-1],[tipX,tipY-1],[tipX+(far?2:-2),tipY+4],[tipX+(far?-11:11),tipY+2],[edgeX,edgeY-3],[edgeX+(far?-12:11),edgeY-10],[jointX+(far?17:-17),jointY-4],[jointX+(far?9:-10),jointY-10]]);
 poly(g,membrane[1],[[jointX,jointY-3],[elbowX,elbowY+1],[tipX,tipY],[edgeX,edgeY-5],[edgeX+(far?-12:11),edgeY-12],[jointX+(far?17:-17),jointY-7]]);
 poly(g,far?membrane[1]:membrane[2],[[elbowX,elbowY+2],[tipX,tipY],[tipX+(far?-17:17),tipY+7],[edgeX,edgeY-7],[edgeX+(far?-9:9),edgeY-12]]);
 if(!far){
  poly(g,membrane[3],[[elbowX-3,elbowY+2],[tipX+4,tipY],[tipX+13,tipY+3],[elbowX-10,elbowY+6]]);
  poly(g,membrane[2],[[elbowX+3,elbowY+7],[jointX-7,jointY-9],[jointX-4,jointY-3],[elbowX-1,elbowY+13]]);
 }
 poly(g,far?jade:fern,[[jointX,jointY+1],[elbowX,elbowY-3],[tipX,tipY-3],[tipX,tipY-1],[elbowX,elbowY+1],[jointX,jointY+4]]);
 rect(g,far?fern:sage,elbowX-2,elbowY-2,5,2);
 if(!far){
  poly(g,membrane[0],[[elbowX,elbowY+4],[elbowX+2,elbowY+4],[edgeX+2,edgeY-6],[edgeX,edgeY-5]]);
  poly(g,membrane[1],[[elbowX+5,elbowY+7],[elbowX+7,elbowY+10],[jointX-12,jointY-9],[jointX-15,jointY-14]]);
  rect(g,horn[2],tipX+4,tipY-1,3,1);
  rect(g,membrane[3],tipX+17,tipY+7,5,1);
  rect(g,membrane[3],tipX+21,tipY+8,3,1);
 }
}

function leg(g,x,y,far){
 const shape=(color,points)=>poly(g,color,points.map(([u,v])=>[x+u,y+v]));
 shape(ink,[[-11,-19],[-8,-23],[3,-25],[11,-19],[11,-13],[5,-6],[5,-3],[11,-3],[15,0],[15,3],[10,5],[-8,5],[-10,2],[-7,-7],[-8,-12]]);
 shape(far?deep:jade,[[-9,-18],[-6,-22],[2,-23],[9,-18],[9,-13],[3,-6],[3,-1],[10,-1],[13,2],[10,3],[-7,3],[-8,1],[-5,-7],[-6,-12]]);
 shape(far?jade:fern,[[-7,-17],[-4,-21],[2,-22],[7,-18],[8,-15],[2,-13],[-3,-16],[-4,-8],[-6,-12]]);
 for(const claw of [6,10,13])rect(g,far?horn[1]:horn[2],x+claw,y+1,2,2);
}

function body(g,hurt){
 for(const [x,y] of [[-41,-40],[-31,-50],[-21,-56],[-10,-58],[2,-56],[12,-52]]){
  poly(g,ink,[[x-5,y+5],[x-2,y-5],[x+3,y-7],[x+4,y],[x+6,y+5]]);
  poly(g,horn[1],[[x-4,y+4],[x-1,y-4],[x+2,y-5],[x+2,y+1],[x+5,y+4]]);
  rect(g,horn[2],x,y-3,2,2);
 }
 poly(g,ink,[[-47,-28],[-45,-40],[-37,-48],[-27,-53],[-10,-58],[9,-55],[26,-47],[38,-35],[38,-26],[31,-17],[19,-11],[-16,-10],[-36,-15],[-44,-21]]);
 poly(g,deep,[[-45,-28],[-43,-39],[-36,-47],[-26,-51],[-10,-56],[8,-53],[25,-45],[36,-34],[36,-27],[30,-19],[18,-13],[-16,-12],[-35,-17],[-42,-22]]);
 poly(g,hurt?sage:jade,[[-43,-29],[-39,-40],[-28,-47],[-12,-53],[7,-51],[23,-43],[32,-35],[28,-28],[19,-23],[4,-25],[-12,-22],[-26,-27],[-39,-23]]);
 poly(g,fern,[[-38,-36],[-33,-42],[-22,-48],[-10,-52],[2,-50],[12,-47],[3,-45],[-9,-47],[-18,-43],[-26,-42],[-34,-34]]);
 for(const [x,y] of [[-33,-36],[-27,-31],[-23,-42],[-17,-35],[-11,-45],[-7,-39],[-4,-31],[5,-43],[11,-36],[17,-31]]){
  rect(g,fern,x,y,4,2);
  rect(g,sage,x+1,y,2,1);
  rect(g,deep,x+2,y+2,4,1);
 }
 poly(g,horn[0],[[0,-25],[20,-26],[30,-31],[33,-26],[27,-19],[18,-15],[0,-16]]);
 for(const [x,y,w] of [[6,-24,12],[8,-21,17],[11,-18,11]]){
  rect(g,horn[1],x,y,w,1);
  rect(g,horn[2],x+2,y,3,1);
 }
 for(const [x,y] of [[-30,-26],[-22,-22],[-12,-26],[-4,-20],[18,-28],[24,-32]]){
  rect(g,deep,x,y+1,5,2);
  rect(g,fern,x+1,y,3,1);
 }
}

function head(g,lift,jaw,heat){
 const shape=(color,points)=>poly(g,color,points.map(([x,y])=>[x,y+lift]));
 poly(g,ink,[[13,-37],[23,-57+lift],[24,-69+lift],[32,-81+lift],[50,-85+lift],[66,-77+lift],[64,-61+lift],[53,-48+lift],[41,-37],[33,-21],[24,-16],[14,-22]]);
 poly(g,deep,[[15,-36],[25,-56+lift],[26,-68+lift],[34,-79+lift],[50,-83+lift],[63,-76+lift],[62,-62+lift],[51,-49+lift],[39,-38],[31,-22],[24,-18],[16,-23]]);
 poly(g,fern,[[20,-34],[31,-57+lift],[35,-73+lift],[49,-80+lift],[59,-73+lift],[55,-64+lift],[43,-52+lift],[33,-38],[27,-29]]);
 poly(g,horn[0],[[26,-23],[31,-37],[42,-51+lift],[53,-64+lift],[58,-63+lift],[51,-50+lift],[40,-37],[33,-24]]);
 for(const [x,y] of [[30,-29],[34,-36],[38,-43],[43,-50]])rect(g,horn[1],x,y+Math.round(lift*(y+25)/-30),5,2);
 shape(ink,[[32,-76],[22,-84],[17,-98],[21,-101],[29,-91],[40,-87],[45,-80],[40,-75]]);
 shape(horn[1],[[34,-78],[24,-86],[19,-98],[21,-98],[27,-90],[39,-85],[42,-80]]);
 shape(horn[2],[[20,-98],[24,-93],[27,-90],[34,-87],[30,-87],[23,-91]]);
 shape(ink,[[47,-83],[43,-92],[45,-103],[51,-108],[53,-100],[50,-94],[57,-85]]);
 shape(horn[1],[[49,-84],[45,-92],[47,-102],[51,-106],[51,-100],[48,-93],[55,-85]]);
 shape(horn[2],[[48,-101],[51,-105],[51,-101],[48,-95],[47,-95]]);
 shape(ink,[[40,-68],[46,-56],[59,-50+jaw],[73,-49+jaw],[82,-52+jaw],[83,-58+jaw],[76,-62+jaw],[58,-62],[49,-69]]);
 shape(horn[0],[[43,-65],[48,-57],[60,-52+jaw],[73,-51+jaw],[80,-54+jaw],[80,-58+jaw],[74,-60+jaw],[62,-60],[50,-66]]);
 shape(jaw?'#633747':horn[1],[[47,-63],[53,-59],[64,-57+jaw],[75,-56+jaw],[79,-57+jaw],[74,-59+jaw],[62,-60],[53,-64]]);
 shape(ink,[[38,-72],[43,-79],[52,-83],[62,-80],[68,-74],[73,-71],[83,-72],[87,-68],[88,-62],[83,-58],[73,-57],[62,-61],[54,-60],[46,-64]]);
 shape(jade,[[40,-72],[44,-77],[53,-81],[61,-78],[66,-73],[73,-69],[82,-70],[85,-67],[86,-63],[82,-60],[73,-59],[62,-63],[54,-62],[47,-66]]);
 shape(fern,[[44,-74],[48,-77],[54,-79],[60,-76],[65,-72],[74,-68],[83,-68],[84,-65],[75,-64],[66,-67],[61,-68],[55,-70],[47,-69]]);
 rect(g,sage,48,-76+lift,6,2);
 rect(g,sage,73,-68+lift,5,1);
 rect(g,fern,61,-66+lift,4,1);
 rect(g,sage,46,-68+lift,4,2);
 rect(g,jade,45,-70+lift,3,2);
 rect(g,fern,65,-63+lift,3,1);
 rect(g,fern,76,-62+lift,4,1);
 shape(ink,[[50,-73],[55,-76],[62,-74],[64,-71],[58,-67],[52,-68]]);
 shape(heat,[[52,-73],[56,-74],[61,-73],[59,-70],[53,-69]]);
 rect(g,ink,56,-73+lift,2,3);
 rect(g,'#fff0ad',53,-73+lift,2,1);
 rect(g,ink,81,-66+lift,3,2);
 rect(g,horn[2],70,-61+lift,2,3);
 rect(g,horn[2],80,-61+lift,2,2);
}

function embers(g,t,lift,fire){
 for(let i=0;i<(fire?16:5);i++){
  const shift=(t*(fire?147:53)+i*18)%(fire?52:15);
  const x=77+shift,y=-59+lift+shift*.36+Math.sin(t*14+i*8)*4;
  rect(g,i%3?'#dc6c4f':'#ffd48d',x,y,fire?5+i%5:2,2+i%3);
  if(fire&&shift<20)rect(g,'#fff0ae',x+2,y+1,3,2);
 }
}

export function drawDragon(g,d,t){
 const diving=d.move==='dive'&&d.phase==='attack'&&d.age<diveFlight;
 const lifting=d.move==='dive'&&d.phase==='wind';
 const recover=d.phase==='recover';
 const lift=d.phase==='land'?Math.max(0,1-d.age/1.15)*106:
   diving?Math.sin(Math.PI*d.age/diveFlight)*62+12*(1-d.age/diveFlight):
   lifting?d.age/d.duration*14:0;
 const spread=lift>0?8:0;
 const beat=Math.round(Math.sin(t*(lift>0?15:6))*(lift>0?10:3))+(recover?15:0);
 const charging=d.move!=='dive'&&d.phase==='wind';
 const fire=d.move!=='dive'&&d.phase==='attack';
 const headLift=recover?11:charging?-5:Math.round(Math.sin(t*5)*2);
 const jaw=fire?10:charging?4:0;
 const heat=d.fast||charging||fire?'#ffd080':'#eaa368';
 oval(g,'#21182b80',d.x,d.y,Math.round(48-lift*.20),6);
 g.save();
 g.translate(Math.round(d.x),Math.round(d.y-lift+(recover?3:0)));
 g.scale(d.face,1);
 wing(g,beat,spread,true);
 tail(g,Math.round(Math.sin(t*6)*4));
 leg(g,-25,-7,true);
 leg(g,17,-7,true);
 body(g,d.hurt>0);
 wing(g,beat,spread,false);
 leg(g,-22,diving?-9:0,false);
 leg(g,23,diving?-10:1,false);
 head(g,headLift,jaw,heat);
 if(charging||fire)embers(g,t,headLift,fire&&d.move==='breath');
 if(recover){
  for(let i=0;i<4;i++)rect(g,'#eac9af99',37+i*10,-60-(t*20+i*9)%15,2+i%2,2);
 }
 g.restore();
}
