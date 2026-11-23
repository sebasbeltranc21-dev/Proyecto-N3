import {oval,poly,rect} from './art.js';
import {diveFlight} from './battle-plus.js';

const ink='#1b1526',shadow='#292c43',scale='#345767',light='#5e8b8c';
const horn='#bd926f',bone='#f1d4a1',ember='#ff9659',coal='#a84a49';

function tail(g,sway,hot){
 poly(g,ink,[[-29,-35],[-50,-34],[-66,-24],[-83,-18],[-100,-19+sway],[-115,-31+sway],[-120,-43+sway],[-110,-41+sway],[-103,-46+sway],[-101,-35+sway],[-106,-30+sway],[-96,-25+sway],[-82,-25],[-65,-35],[-48,-43],[-27,-48]]);
 poly(g,shadow,[[-29,-36],[-49,-36],[-66,-26],[-83,-20],[-99,-21+sway],[-113,-32+sway],[-116,-40+sway],[-110,-38+sway],[-104,-43+sway],[-104,-35+sway],[-108,-30+sway],[-97,-24+sway],[-81,-27],[-64,-37],[-49,-41],[-29,-46]]);
 poly(g,scale,[[-36,-42],[-51,-41],[-65,-35],[-80,-28],[-98,-25+sway],[-112,-31+sway],[-115,-38+sway],[-107,-35+sway],[-108,-31+sway],[-97,-23+sway],[-80,-26],[-65,-31],[-49,-37],[-36,-38]]);
 for(const [x,y] of [[-51,-41],[-65,-36],[-79,-28],[-92,-26+sway],[-105,-31+sway]]){
  rect(g,light,x,y,4,2);
 }
 poly(g,hot,[[-116,-41+sway],[-110,-39+sway],[-105,-43+sway],[-106,-36+sway],[-110,-34+sway]]);
}

function farWing(g,beat,hot){
 const top=-106+beat;
 poly(g,ink,[[-11,-37],[-28,-53],[-14,-74],[3,top+7],[32,top],[54,top+9],[61,top+26],[43,top+17],[35,-70],[29,-55],[20,-64],[9,-50],[6,-39]]);
 poly(g,'#573044',[[-8,-43],[-23,-53],[-10,-74],[6,top+10],[32,top+3],[51,top+11],[57,top+22],[42,top+14],[33,-70],[28,-59],[20,-68],[7,-52],[4,-42]]);
 poly(g,'#87434e',[[-13,-61],[1,-89+beat],[15,top+7],[32,top+3],[47,top+10],[24,top+10],[10,-79+beat],[-3,-56]]);
 rect(g,hot,31,top+3,5,2);
}

function nearWing(g,beat,spread,hot){
 const top=-104+beat,tip=-111-spread;
 poly(g,ink,[[-5,-32],[-19,-58],[-44,top+7],[-65,top],[tip+17,top+4],[tip,top+19],[tip+3,top+38],[tip+16,top+28],[tip+29,-48],[tip+34,-37],[tip+42,-56],[tip+54,-43],[-36,-35],[-34,-52],[-18,-35]]);
 poly(g,'#663448',[[-8,-37],[-22,-59],[-45,top+11],[-64,top+4],[tip+18,top+7],[tip+3,top+20],[tip+5,top+34],[tip+16,top+24],[tip+30,-49],[tip+35,-41],[tip+42,-60],[tip+55,-47],[-39,-39],[-35,-57],[-20,-39]]);
 poly(g,'#994a55',[[tip+8,top+29],[tip+18,top+13],[tip+39,top+9],[-53,top+13],[tip+34,top+16],[tip+20,top+24],[tip+29,-54]]);
 poly(g,'#b8625d',[[tip+22,top+18],[tip+46,top+12],[-48,top+17],[tip+43,top+19],[tip+34,-52],[tip+41,-60]]);
 poly(g,'#793749',[[-57,top+11],[-40,top+23],[-23,-52],[-33,-49],[-54,-61]]);
 poly(g,scale,[[-8,-35],[-22,-59],[-46,top+9],[-64,top+2],[tip+19,top+6],[tip+6,top+17],[tip+23,top+14],[-64,top+9],[-49,top+16],[-27,-53],[-14,-34]]);
 poly(g,light,[[-63,top+3],[-45,top+10],[-32,top+27],[-46,top+15],[-65,top+8],[tip+22,top+10]]);
 rect(g,hot,-66,top+4,5,2);
}

function leg(g,x,y,front){
 const shape=(color,points)=>poly(g,color,points.map(([u,v])=>[x+u,y+v]));
 shape(ink,[[-11,-23],[3,-28],[13,-20],[12,-12],[5,-4],[13,-4],[19,1],[16,5],[-9,4],[-10,-4],[-5,-12]]);
 shape(front?scale:shadow,[[-9,-22],[3,-26],[11,-19],[10,-13],[3,-5],[3,-2],[11,-2],[15,2],[-7,2],[-8,-3],[-2,-13]]);
 shape(front?light:scale,[[0,-23],[4,-24],[9,-20],[7,-14],[2,-9],[3,-16]]);
 for(const claw of [6,10,14])rect(g,front?bone:horn,x+claw,y+1,3,2);
}

function body(g,hot,hurt){
 poly(g,ink,[[-51,-23],[-51,-38],[-30,-55],[-9,-61],[13,-56],[33,-46],[45,-28],[36,-16],[21,-9],[-22,-9],[-40,-13]]);
 poly(g,shadow,[[-49,-25],[-49,-37],[-29,-53],[-9,-59],[12,-54],[31,-44],[43,-28],[34,-18],[19,-11],[-21,-11],[-38,-15]]);
 poly(g,hurt?'#70a4a5':scale,[[-46,-28],[-44,-39],[-26,-52],[-10,-55],[11,-51],[28,-42],[36,-31],[22,-24],[3,-23],[-17,-24],[-34,-20]]);
 poly(g,light,[[-39,-39],[-25,-50],[-9,-54],[9,-50],[22,-43],[10,-44],[-9,-48],[-26,-44],[-37,-34]]);
 for(const [x,y] of [[-35,-36],[-26,-44],[-25,-30],[-16,-38],[-15,-27],[-7,-44],[-5,-32],[4,-38],[6,-29],[14,-35],[22,-31]]){
  poly(g,shadow,[[x-4,y],[x,y-2],[x+5,y],[x+2,y+3],[x-1,y+3]]);
  rect(g,light,x-2,y,4,1);
 }
 poly(g,coal,[[3,-20],[17,-22],[31,-28],[35,-25],[27,-19],[15,-16],[4,-16]]);
 rect(g,hot,13,-20,5,2);
 rect(g,hot,25,-24,5,2);
}

function head(g,lift,jaw,hot,hurt){
 const raised=(color,points)=>poly(g,color,points.map(([x,y])=>[x,y+lift]));
 poly(g,ink,[[12,-26],[18,-44],[27,-65+lift],[29,-80+lift],[47,-86+lift],[60,-79+lift],[66,-66+lift],[60,-56+lift],[49,-47+lift],[39,-39],[34,-26],[24,-17]]);
 poly(g,shadow,[[14,-26],[21,-43],[30,-65+lift],[31,-78+lift],[47,-83+lift],[57,-77+lift],[63,-67+lift],[58,-57+lift],[47,-49+lift],[37,-41],[33,-28],[24,-20]]);
 poly(g,hurt?'#70a4a5':scale,[[19,-29],[25,-46],[34,-65+lift],[37,-78+lift],[47,-80+lift],[56,-74+lift],[58,-66+lift],[48,-58+lift],[40,-47+lift],[32,-40],[28,-28]]);
 poly(g,coal,[[28,-27],[34,-38],[43,-49+lift],[49,-60+lift],[56,-64+lift],[53,-53+lift],[45,-41],[38,-30]]);
 for(const [x,y] of [[32,-33],[37,-41],[42,-49],[47,-57]]){
  rect(g,hot,x,y+Math.round(lift*(1+(y+57)/36)),6,2);
 }
 raised(ink,[[36,-78],[26,-86],[19,-100],[22,-107],[29,-96],[41,-91],[46,-83],[43,-78]]);
 raised(horn,[[37,-80],[28,-88],[21,-100],[22,-104],[28,-95],[40,-89],[44,-83]]);
 raised(bone,[[22,-104],[27,-96],[36,-90],[31,-91],[25,-95]]);
 raised(ink,[[50,-83],[47,-97],[50,-111],[55,-112],[54,-100],[61,-89],[60,-81]]);
 raised(horn,[[52,-83],[49,-97],[51,-109],[54,-110],[52,-100],[58,-89],[58,-83]]);
 raised(bone,[[51,-109],[54,-110],[52,-100],[54,-94],[51,-97]]);
 raised(ink,[[40,-70],[42,-61],[53,-54],[65,-53+jaw],[80,-49+jaw],[87,-55+jaw],[84,-62+jaw],[67,-65+jaw],[55,-64]]);
 raised(horn,[[44,-65],[54,-57],[65,-56+jaw],[80,-52+jaw],[85,-56+jaw],[81,-59+jaw],[67,-60+jaw],[57,-61]]);
 if(jaw>0){
  raised('#6e303e',[[48,-65],[66,-60],[83,-61],[83,-55+jaw],[70,-55+jaw],[58,-57]]);
  for(const [x,y] of [[67,-59],[73,-58],[79,-58]])rect(g,bone,x,y+jaw+lift,2,3);
 }
 raised(ink,[[39,-74],[46,-84],[59,-82],[68,-75],[76,-72],[88,-73],[93,-69],[92,-61],[83,-58],[64,-61],[50,-63],[43,-67]]);
 raised(scale,[[42,-73],[47,-82],[58,-80],[66,-73],[76,-70],[87,-71],[90,-68],[89,-63],[83,-60],[64,-63],[51,-65],[46,-68]]);
 raised(light,[[45,-75],[49,-80],[58,-79],[64,-74],[77,-70],[88,-70],[87,-67],[73,-67],[62,-70],[55,-73],[48,-72]]);
 raised(ink,[[50,-75],[60,-76],[64,-72],[58,-68],[51,-69]]);
 raised(hot,[[52,-74],[61,-74],[60,-71],[54,-70]]);
 rect(g,'#4e2334',57,-74+lift,2,3);
 rect(g,ink,84,-68+lift,4,2);
 rect(g,bone,70,-62+lift,3,4);
 rect(g,bone,81,-62+lift,2,3);
}

function mouthFlame(g,t,headLift,blasting){
 for(let i=0;i<(blasting?19:6);i++){
  const shift=(t*(blasting?153:57)+i*19)%(blasting?54:17);
  const x=80+shift,y=-60+headLift+shift*.47+Math.sin(t*14+i*8)*4;
  rect(g,i%3?'#f77549':'#ffd285',x,y,blasting?5+i%5:2,2+i%3);
  if(blasting&&shift<24)rect(g,'#fff0af',x+2,y+1,3,2);
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
 const beat=Math.round(Math.sin(t*(lift>0?15:6))*(lift>0?10:4))+(recover?15:0);
 const charging=d.move!=='dive'&&d.phase==='wind';
 const fire=d.move!=='dive'&&d.phase==='attack';
 const headLift=recover?10:charging?-5:Math.round(Math.sin(t*5)*2);
 const jaw=fire?11:charging?4:0;
 const hot=d.fast||charging||fire?'#ffc27a':ember;
 const sway=Math.round(Math.sin(t*6)*5);
 oval(g,'#140c2288',d.x,d.y,Math.round(54-lift*.24),7);
 g.save();
 g.translate(Math.round(d.x),Math.round(d.y-lift+(recover?4:0)));
 g.scale(d.face,1);
 farWing(g,beat,hot);
 tail(g,sway,hot);
 leg(g,-30,-7,false);
 leg(g,14,-7,false);
 body(g,hot,d.hurt>0);
 nearWing(g,beat,spread,hot);
 leg(g,-23,diving?-9:0,true);
 leg(g,26,diving?-10:1,true);
 head(g,headLift,jaw,hot,d.hurt>0);
 if(charging||fire)mouthFlame(g,t,headLift,fire&&d.move==='breath');
 if(recover){
  for(let i=0;i<5;i++){
   const x=32+i*9,y=-70-(t*22+i*9)%20;
   rect(g,'#eac9af80',x,y,2+i%2,2);
  }
 }
 g.restore();
}
