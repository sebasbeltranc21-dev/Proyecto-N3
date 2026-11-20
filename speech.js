import {worlds,townsperson,WORLD} from './world.js';

export function cameraPosition(hero,inside){
 if(inside)return {x:0,y:0};
 return {x:Math.round(Math.max(0,Math.min(WORLD.width-640,hero.x-307))),
         y:Math.round(Math.max(0,Math.min(WORLD.height-336,hero.y-181)))};
}
export function conversation(game,words){
 const {zone,inside}=game.data;
 const index=inside?-1:worlds[zone].people.findIndex(n=>n.name===words.name);
 return {...words,zone,inside,index,until:game.time+Math.max(10,words.line.length*.14)};
}
export function speakerPosition(game,speech){
 if(!speech||game.mode!=='map'||speech.zone!==game.data.zone||speech.inside!==game.data.inside||game.time>=speech.until)return null;
 const n=speech.inside?{x:335,y:151}:worlds[speech.zone].people[speech.index];
 if(!n)return null;
 const location=speech.inside?n:townsperson(n,game.time,speech.index);
 if(Math.hypot(location.x-game.hero.x,location.y-game.hero.y)>92)return null;
 const camera=cameraPosition(game.hero,speech.inside);
 return {x:location.x-camera.x,y:location.y-camera.y-44};
}
export function placeBubble(element,position){
 const stage=element.parentElement;
 const anchorX=position.x*stage.clientWidth/640,anchorY=position.y*stage.clientHeight/336;
 const width=element.offsetWidth,height=element.offsetHeight;
 const left=Math.max(5,Math.min(stage.clientWidth-width-5,anchorX-width/2));
 const above=anchorY-height-11>=5;
 element.classList.toggle('below',!above);
 element.style.left=Math.round(left)+'px';
 element.style.top=Math.round(above?anchorY-height-9:Math.min(stage.clientHeight-height-5,anchorY+8))+'px';
 element.style.setProperty('--pointer',Math.round(Math.max(8,Math.min(width-15,anchorX-left)))+'px');
}

