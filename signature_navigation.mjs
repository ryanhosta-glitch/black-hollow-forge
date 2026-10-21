/** Explicit pocket-space routes. Not a claim of free-form estate stair certification. */
export const SIGNATURE_ROOMS={hall:{id:'signature-main-hall',name:'Grand Main Hall',floor:-1,boundsFeet:{x:-12/.3048,y:-15.5/.3048,l:24/.3048,w:31/.3048,h:15/.3048},openings:[]},floor13:{id:'signature-conservatory',name:'Nocturne Conservatory',floor:-2,boundsFeet:{x:-14/.3048,y:-17/.3048,l:28/.3048,w:34/.3048,h:16/.3048},openings:[]}};
export function signatureSurface(kind,x,z,previousY=0){
 if(kind!=='hall')return 0;
 // No sudden floor snapping: a player may only step onto a nearby surface.
 const flights=Math.abs(Math.abs(x)-4.5)<=1.82&&z>=3.8&&z<=11.1;
 const landing=Math.abs(x)<=7.8&&z>=10.9&&z<=14.15;
 const cabin=Math.abs(x)<1.65&&z>=12.4&&z<=15.1;
 if(flights){const ramp=Math.max(0,Math.min(5.25,(z-4)/7*5.25));return Math.abs(ramp-previousY)<.29?ramp:null;}
 const candidates=[0];if(landing||cabin)candidates.push(5.25);
 const supported=candidates.filter(y=>Math.abs(y-previousY)<.29).sort((a,b)=>Math.abs(a-previousY)-Math.abs(b-previousY));
 // The solid stair flights cannot be entered through their sides underneath.
 if(flights&&Math.max(...candidates)>.28&&previousY<.1&&Math.max(...candidates)-previousY>.29)return null;
 if((landing||cabin)&&previousY>4.9)return 5.25;
 return supported[0]??null;
}
export function signatureBlocked(kind,x,z,y,blockers,radius=.21){
 const room=SIGNATURE_ROOMS[kind];if(!room)return true;const b=room.boundsFeet;
 if(x<b.x*.3048+radius||x>(b.x+b.l)*.3048-radius||z<b.y*.3048+radius||z>(b.y+b.w)*.3048-radius)return true;
 return blockers.some(b=>y+1.6>b.minY&&y<b.maxY&&x>b.minX-radius&&x<b.maxX+radius&&z>b.minZ-radius&&z<b.maxZ+radius);
}
export function signatureActions(kind,p){
 const near=(x,y,z,r)=>Math.hypot(p[0]-x,p[2]-z)<=r&&Math.abs(p[1]-y)<.45;
 if(kind==='hall')return {returnHouse:near(0,0,-14.2,1.65),boardElevator:near(0,5.25,14,1.25)};
 if(kind==='floor13')return {returnElevator:near(0,0,-15.6,1.15)};
 return {};
}
export function signatureLinks(entry){return {version:1,units:'meters',mode:'explicit-pocket-portals',estateEntryRoom:entry,connections:[{id:'estate-hall',from:{scene:'estate',roomId:entry},to:{scene:'hall',position:[0,0,-13.5]},type:'door-portal',bidirectional:true},{id:'hall-elevator',from:{scene:'hall',position:[0,5.25,14],radius:1.25},to:{scene:'floor13',position:[0,0,-14.8]},type:'elevator',requiresCabinEntry:true,bidirectional:true}],gameOwned:['quest-floor13-unlock','elevator-animation','save-state'],runtime:'forge-inspection-only',gameplayCertified:false};}
