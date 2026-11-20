// World positions are the characters' feet. The same footprints drive drawing and collision.
export const WORLD={width:1344,height:608,road:314,bridgeX:655};
export const footbridges=[158,454,184,446];
export const roomNames=['Posada del Trébol','Botica del Sauco','Archivo de la Marea','Armería de la Corona'];
export const chamberNames=['Aldea del Trébol','Aldea entre raíces','Campamento de las Tablillas','Barrio de las almenas'];
export const guardianPlaces=['Era del Molino','Claro de las Luciérnagas','Anfiteatro de Talos','Patio del Trono'];
export const discoveries=[
 [{x:327,y:101,name:'Miel del apiario',item:0},{x:978,y:505,name:'Resina del molino',item:3}],
 [{x:347,y:110,name:'Bayas de luz',item:0},{x:975,y:495,name:'Esporas de niebla',item:4}],
 [{x:293,y:100,name:'Ánfora sellada',item:2},{x:950,y:510,name:'Vidrio de la marea',item:1}],
 [{x:300,y:106,name:'Sello de la guardia',item:1},{x:981,y:501,name:'Pólvora de eco',item:2}]
];
const locals=[
 [['Inés','El molino gira incluso cuando el viento para. Bramble tiene su sello al otro lado del río.'],['Teo','La posada huele a pan. Acércate a la puerta azul y pulsa J para descansar.'],['Mara','El guardabrotes guarda una jabalina bajo las hojas. Sal de su línea cuando la levante.']],
 [['Lía','Cultivo hongos con luz propia. En la botica guardamos fruta para el camino.'],['Jun','Mira las alas de Lumbre. Cuando se abren, vienen tres cuchillas.'],['Tilo','Las motas doradas vuelven al claro cada anochecer. Lumbre las sigue.']],
 [['Uma','Encontramos un mapa bajo el mosaico. El archivo conserva las notas de los primeros viajeros.'],['Oriel','Los canteros dejaban agua junto al puente. Así encontraban la cantera al regresar.'],['Sira','Cuando Talos planta los pies, levanta el martillo. Rueda al atravesar la onda.']],
 [['Ada','Antes de la corona yo hacía hebillas. Ahora reparo los escudos de la guardia.'],['Nilo','El rey cambia de arma al perder media vida. Mira su mano antes de acercarte.'],['Sol','A mis espaldas está el patio. Recupera el aliento antes de entrar.']]
];
const layouts=[
 [[160,258,'inn'],[374,205,'house'],[503,337,'stall'],[934,223,'mill'],[1103,446,'barn']],
 [[158,246,'herbal'],[383,210,'hut'],[535,398,'stall'],[903,243,'hut'],[1171,439,'shrine']],
 [[160,247,'archive'],[381,205,'tent'],[504,384,'stall'],[925,232,'arch'],[1154,443,'tent']],
 [[164,240,'armory'],[380,208,'tower'],[505,385,'stall'],[928,232,'gate'],[1158,444,'tower']]
];
const decorations=[
 [['well',288,287],['cart',420,358],['hay',858,419],['fence',80,377],['garden',350,435],['barrels',218,252],['garden',1033,274],['lantern',585,293]],
 [['mushrooms',282,287],['cart',395,356],['garden',850,423],['mushrooms',98,380],['shrine',352,443],['barrels',220,248],['lantern',1000,267],['lantern',586,291]],
 [['obelisk',283,284],['cart',416,359],['obelisk',857,419],['pillar',77,381],['mosaic',360,443],['barrels',223,245],['pillar',1008,272],['lantern',581,292]],
 [['fountain',288,287],['rack',408,368],['rack',849,413],['fence',84,384],['banners',359,450],['barrels',223,246],['banners',1019,275],['lantern',582,292]]
];
const sizes={inn:90,house:76,stall:59,mill:80,barn:84,herbal:87,hut:73,archive:92,armory:90,shrine:43,tent:66,arch:78,tower:61,gate:93};
const sideStreets=[
 [[70,151,'barn'],[486,512,'house'],[1240,227,'tent']],
 [[85,166,'hut'],[403,526,'herbal'],[1060,132,'shrine']],
 [[80,171,'tent'],[481,513,'arch'],[1150,160,'archive']],
 [[86,165,'tower'],[476,511,'armory'],[1141,155,'gate']]
];
export const worlds=layouts.map((buildings,z)=>{
 const houses=[...buildings,...sideStreets[z]].map(([x,y,type],i)=>({x,y,type,width:sizes[type],solid:true,door:i===0}));
 const props=decorations[z].map(([type,x,y])=>({type,x,y,width:({fence:65,garden:58,cart:27,rack:29,well:26,fountain:37,mosaic:0})[type]??19,solid:type!=='mosaic'}));
 const people=locals[z].map(([name,line],i)=>({type:'npc',name,line,style:z*3+i,x:[246,470,996][i],y:[310,254,351][i]}));
 return {houses,props,people,guardian:{x:1084,y:312},scout:{x:838,y:421},chest:{x:431,y:433}};
});
export function riverX(y){return Math.round(655+24*Math.sin((y-314)/95));}
export function canWalk(z,x,y){
 if(Math.abs(x-riverX(y))<30&&Math.abs(y-WORLD.road)>24&&Math.abs(y-footbridges[z])>13)return false;
 for(const o of [...worlds[z].houses,...worlds[z].props]){
  if(o.solid&&Math.abs(x-o.x)<o.width/2+3&&y>o.y-(o.door||o.width>60?26:12)&&y<o.y+3)return false;
 }
 return true;
}
export function safePosition(z,x,y){
 if(canWalk(z,x,y))return {x,y};
 for(let offset=4;offset<150;offset+=4)for(const [dx,dy] of [[0,offset],[0,-offset],[offset,0],[-offset,0]]){
  const a=Math.min(WORLD.width-30,Math.max(30,x+dx)),b=Math.min(WORLD.height-20,Math.max(70,y+dy));
  if(canWalk(z,a,b))return {x:a,y:b};
 }
 return {x:100,y:WORLD.road};
}
export function townsperson(n,t,i){return {...n,x:n.x+Math.sin(t*.49+i*2)*10,y:n.y+Math.sin(t*.46+i)*4};}
export function interaction(game){
 const {data:d,hero:h}=game;
 if(d.inside){
  if(Math.hypot(h.x-319,h.y-273)<42)return {type:'leave',title:'SALIR'};
  if(Math.hypot(h.x-335,h.y-166)<56)return {type:'service',title:['DESCANSAR','RECOGER FRUTA','ESTUDIAR','REPARAR ESCUDO'][d.zone]};
  return null;
 }
 const w=worlds[d.zone];
 const candidates=[{...w.houses[0],y:w.houses[0].y+6,type:'door',title:'ENTRAR'},...w.people.map((n,i)=>({...townsperson(n,game.time,i),title:'HABLAR'}))];
 if(!d.opened.includes(d.zone))candidates.push({...w.chest,type:'chest',title:'ABRIR'});
 for(const [i,o] of discoveries[d.zone].entries())if(!d.found.includes(d.zone*2+i))candidates.push({...o,id:d.zone*2+i,type:'find',title:'EXAMINAR'});
 return candidates.map(o=>({...o,distance:Math.hypot(h.x-o.x,h.y-o.y)})).filter(o=>o.distance<35).sort((a,b)=>a.distance-b.distance)[0];
}
