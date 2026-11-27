export const millShortcutY=225;
export const questTitles=['El molino detenido','Luces entre las raíces','La cámara de las tablillas','El desafío de la guardia'];
export const trialNames=['Custodio del Claro','Estatua de la Guardia'];
export const guardRounds=[
 {name:'La embestida',moves:['dash','sweep'],hp:50},
 {name:'La onda',moves:['slam','lance'],hp:67},
 {name:'El reflejo',moves:['edict','dash','sweep'],hp:80}
];

const point=(id,x,y,title,kind)=>({id,x,y,title,kind,type:'quest'});
const millOrder=['retorno','entrada','molino'];
const runeOrder=['agua','raiz','corona'];
const valves=[
 point('entrada',593,273,'ABRIR ENTRADA','valve'),
 point('molino',738,265,'ABRIR MOLINO','valve'),
 point('retorno',566,377,'ABRIR RETORNO','valve')
];
const fireflies=[
 point('luz1',419,378,'SEGUIR LUCIÉRNAGA','firefly'),
 point('luz2',762,383,'ACERCARSE DESPACIO','firefly'),
 point('luz3',971,468,'SEGUIR LUCIÉRNAGA','firefly')
];
const tablets=[
 point('agua',547,220,'CALCAR AGUA','tablet'),
 point('raiz',785,447,'CALCAR RAÍZ','tablet'),
 point('corona',1062,194,'CALCAR CORONA','tablet')
];
const sockets=[
 point('agua',328,465,'COLOCAR AGUA','socket'),
 point('raiz',382,476,'COLOCAR RAÍZ','socket'),
 point('corona',440,463,'COLOCAR CORONA','socket')
];
const cave=point('cave',1106,486,'ENTRAR A LA GRUTA','portal');
const chamber=point('chamber',380,418,'ENTRAR A LA CÁMARA','portal');
const statue=point('statue',805,278,'RETAR A LA ESTATUA','statue');

export function questState(saved={}){
 return {
  mill:{started:false,clue:false,done:false,...saved.mill,sequence:[...(saved.mill?.sequence??[])]},
  forest:{started:false,cleared:false,done:false,...saved.forest,lights:[...(saved.forest?.lights??[])]},
  ruins:{started:false,unsealed:false,done:false,...saved.ruins,marks:[...(saved.ruins?.marks??[])],sequence:[...(saved.ruins?.sequence??[])]},
  guard:{done:false,best:null,...saved.guard}
 };
}

export function questPoints(game){
 const {zone,quests,sideRoom}=game.data;
 if(!quests)return [];
 const {mill,forest,ruins,guard}=quests;
 if(sideRoom){
  const points=[point('leave',320,284,'VOLVER AL CAMINO','exit')];
  if(sideRoom==='forest'){
   if(!forest.cleared)points.push(point('guardian',422,192,'RETAR AL CUSTODIO','statue'));
   if(forest.cleared&&!forest.done)points.push(point('forest-cache',440,213,'ABRIR COFRE','cache'));
  }else if(!ruins.done)points.push(point('ruins-cache',414,190,'RECOGER RELIQUIA','cache'));
  return points;
 }
 if(zone===0&&mill.started&&!mill.done){
  return [point('inscription',589,203,'LEER INSCRIPCIÓN','tablet'),...valves.map(p=>({...p,active:mill.sequence.includes(p.id)}))];
 }
 if(zone===1&&forest.started&&!forest.done){
  const next=fireflies[forest.lights.length];
  return next?[next]:[cave];
 }
 if(zone===1&&forest.done)return [cave];
 if(zone===2&&ruins.started){
  if(ruins.unsealed)return [chamber];
  return [...tablets.filter(p=>!ruins.marks.includes(p.id)),...sockets.map(p=>({...p,active:ruins.sequence.includes(p.id)}))];
 }
 if(zone===3)return [guard.done?{...statue,title:'REPETIR DESAFÍO'}:statue];
 return [];
}

const questGivers={
 'Inés':{key:'mill',line:'El molino se detuvo. Busca la inscripción en la orilla, al norte del puente grande. Dice en qué orden abrir las tres compuertas.'},
 'Lía':{key:'forest',line:'La primera luciérnaga brilla en el bosque al suroeste del puente principal. Síguela. La segunda se esconde si ruedas al acercarte.'},
 'Tilo':{key:'forest',line:'Lía vio la primera luciérnaga al suroeste del puente. Sigue las tres luces para encontrar la gruta.'},
 'Uma':{key:'ruins',line:'Calca las tres tablillas: una al norte del camino, otra al sur del río y otra detrás del arco oriental. El mosaico está al sur del campamento.'}
};
export function offersQuest(data,name){
 const entry=questGivers[name];
 return Boolean(entry&&data.quests&&!data.quests[entry.key].started);
}
export function visitQuestGiver(game,name){
 const entry=questGivers[name];
 if(!entry)return null;
 const state=game.data.quests[entry.key];
 if(state.done)return {mill:'Ya se oye el molino. Puedes tomar el puente nuevo al norte del camino.',forest:'Las luces vuelven a salir de la gruta.',ruins:'El archivo ya guarda la historia de la reliquia.'}[entry.key];
 if(!state.started){
  state.started=true;
  game.notice('Misión iniciada · '+questTitles[game.data.zone]);
  game.emit('save');
 }
 return entry.line;
}

export function trackFirefly(game){
 const {zone,quests}=game.data,h=game.hero;
 const shy=fireflies[1];
 if(zone===1&&quests.forest.lights.length===1&&h.roll>0&&Math.hypot(h.x-shy.x,h.y-shy.y)<67){
  game.scaredUntil=game.time+1.2;
 }
}

function changed(game,text,sound='click'){
 game.notice(text);
 game.emit('sound',sound);
 game.emit('save');
}

function selectInOrder(game,state,order,id,done,wrong){
 if(id!==order[state.sequence.length]){
  state.sequence=[];
  changed(game,wrong);
  return;
 }
 state.sequence.push(id);
 if(state.sequence.length===order.length)done();
 else changed(game,state.sequence.length+' / '+order.length+' en su sitio');
}

function moveToRoom(game,room){
 const d=game.data;
 d.sideRoom=room;
 const exit=room?{x:292,y:251}:d.zone===1?{x:cave.x,y:cave.y+20}:{x:chamber.x,y:chamber.y+17};
 Object.assign(d,exit);
 game.spawnHero();
 game.grace=1;
 changed(game,room==='forest'?'Gruta de las Luciérnagas':room==='ruins'?'Cámara de las Tablillas':'De vuelta al sendero');
}

export function interactQuest(game,point){
 const id=point.id,d=game.data,{mill,forest,ruins}=d.quests;
 if(point.kind==='portal'){moveToRoom(game,id==='cave'?'forest':'ruins');return;}
 if(id==='leave'){moveToRoom(game,null);return;}
 if(id==='guardian'||id==='statue'){game.startSideTrial(id==='guardian'?'forest':'guard');return;}
 if(id==='inscription'){
  mill.clue=true;
  changed(game,'Inscripción · Retorno → Entrada → Molino');
 }else if(point.kind==='valve'){
  if(!mill.clue){game.notice('Lee primero la inscripción de la orilla norte');return;}
  selectInOrder(game,mill,millOrder,id,()=>{
   mill.done=true;
   d.bag[0]+=2;
   changed(game,'Molino en marcha · Nuevo puente al norte · Fruta ×2','loot');
  },'Las compuertas se cerraron. Retorno → Entrada → Molino');
 }else if(point.kind==='firefly'){
  if(id==='luz2'&&(game.time<(game.scaredUntil??0)||game.hero.roll>0)){
   game.notice('La luciérnaga se escondió. Detente un momento y acércate caminando');
   return;
  }
  forest.lights.push(id);
  const hints=['La siguiente está al sureste del puente principal','Busca la última cerca del santuario oriental','Las luces revelaron una gruta al este'];
  changed(game,forest.lights.length+' / 3 · '+hints[forest.lights.length-1]);
 }else if(point.kind==='tablet'){
  ruins.marks.push(id);
  changed(game,'Calco guardado · '+ruins.marks.length+' / 3');
 }else if(point.kind==='socket'){
  if(ruins.marks.length<3){game.notice('Primero calca las tres tablillas dispersas');return;}
  selectInOrder(game,ruins,runeOrder,id,()=>{
   ruins.unsealed=true;
   changed(game,'El mosaico se ilumina. La cámara quedó abierta','loot');
  },'El mosaico se reinició. Lee el orden en el diario');
 }else if(id==='forest-cache'&&!forest.done){
  forest.done=true;d.bag[0]+=3;d.bag[3]++;
  changed(game,'Luces entre las raíces completada · Fruta ×3 y Elixir','loot');
 }else if(id==='ruins-cache'&&!ruins.done){
  ruins.done=true;d.bag[4]+=2;
  changed(game,'Reliquia del Espejo · El Rey aprendió observando rutinas. Humo ×2','loot');
 }
}

export function questJournal(data){
 const {mill,forest,ruins,guard}=data.quests;
 return [
  mill.done?'Completada. El puente nuevo cruza el canal al norte del camino.':
   !mill.started?'Habla con Inés en la Aldea del Trébol.':
   !mill.clue?'Busca la inscripción en la orilla al norte del puente principal.':
   'Abre las compuertas en orden: Retorno, Entrada, Molino. '+mill.sequence.length+' / 3.',
  forest.done?'Completada. Puedes volver a la gruta.':
   !forest.started?'Habla con Lía cerca de la botica o con Tilo al este del bosque.':
   forest.cleared?'Abre el cofre de la gruta.':
   ['Sigue la luz al suroeste del puente principal.',
    'Busca la luz al sureste del puente. Acércate sin rodar.',
    'Busca la última luz junto al santuario oriental.',
    'Entra a la gruta y vence al custodio.'][forest.lights.length],
  ruins.done?'Completada. La Reliquia del Espejo revela que el Rey aprendió observando las rutinas de quienes custodiaban la isla.':
   !ruins.started?'Habla con Uma en el Campamento de las Tablillas.':
   ruins.unsealed?'Entra a la cámara y recoge la reliquia.':
   ruins.marks.length<3?'Tablillas: '+ruins.marks.length+' / 3. Busca al norte del puente, al sur del río y detrás del arco oriental.':
   'En el mosaico, coloca Agua, Raíz y Corona. '+ruins.sequence.length+' / 3.',
  guard.done?'Completada. Mejor tiempo: '+guard.best.toFixed(1)+' s. Vuelve a la estatua para intentarlo de nuevo.':
   'Reta a la estatua situada al oeste del portón del castillo.'
 ];
}
