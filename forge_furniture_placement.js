/** Forge 2.6 — Conservative, deterministic, reusable furniture layout.
 * Non-destructive overlay. Coordinates in meters; authored room bounds are feet.
 * Door and window openings, existing stair rooms, and furniture footprints protected.
 */
import {FURNITURE_CATALOG,createVictorianFurniture} from './victorian_furniture_library.js';
import {dressVictorianFurniture} from './forge_furniture_dressing_3_3.js';
const FT=.3048;
const stableHash=str=>{let h=2166136261;for(const c of String(str)){h=Math.imul(h^c.charCodeAt(0),16777619)}return h>>>0};
const randFor=str=>{let s=stableHash(str);return()=>((s=(Math.imul(1664525,s)+1013904223)>>>0)/4294967296)};
const intersect=(a,b,pad=0)=>Math.abs(a.x-b.x)<(a.w+b.w)/2+pad&&Math.abs(a.z-b.z)<(a.d+b.d)/2+pad;
const bnds=r=>{let b=r.boundsFeet;return b?{x:b.x*FT,z:b.y*FT,w:b.l*FT,d:b.w*FT,h:b.h*FT}:null};
function openingObstacles(room,b){const result=[];for(const o of room.openings||[]){
 if(!/door|window|secret|opening/i.test(o.type||''))continue;
 const t=Math.max(0,Math.min(1,Number(o.pos??.5)));
 const wall=String(o.wall||'').toLowerCase(); const door=/door|secret|opening/i.test(o.type||'');
 const width=Number(o.widthFeet||o.width|| (door?3:4))*FT;
 // Opening approaches: allow access from both directions, protect at least 1.15 m into room.
 if(wall==='left'||wall==='right')result.push({x:wall==='left'?b.x:b.x+b.w,z:b.z+b.d*t,w:door?2.25:1.00,d:Math.max(width+.50,door?1.45:1.05)});
 if(wall==='top'||wall==='bottom')result.push({x:b.x+b.w*t,z:wall==='top'?b.z:b.z+b.d,w:Math.max(width+.5,door?1.45:1.05),d:door?2.25:1.00});
 }return result}
export function planReusableFurniture(rooms=[],{seed='black-hollow',maxPerRoom=6,legacyPlacements=[]}={}){
 const records=[],summary={rooms:rooms.length,placed:0,skipped:0,protectedRooms:0,doorZones:0,dressed:0};
 const already=new Map((legacyPlacements||[]).map(x=>[x.roomId||x.id,x.placements||[]]));
 for(const room of rooms){const b=bnds(room);if(!b)continue;
 const roomName=String(room.name||'').toLowerCase();
 if(/stair|corridor|hallway|landing|shaft|elevator|passage/.test(roomName)||room.embeddedStair){summary.protectedRooms++;continue;}
 const type=/library|archive/.test(roomName)?'library':/study|office/.test(roomName)?'study':/parlor|drawing|lounge/.test(roomName)?'parlor':/ballroom|gallery/.test(roomName)?'gallery':/dining|banquet/.test(roomName)?'dining':/bedroom|chamber|suite/.test(roomName)?'bedroom':/nursery/.test(roomName)?'nursery':/crypt|cellar|vault|laboratory|conservatory|greenhouse|workshop|observatory/.test(roomName)?'special':'hall';
 const random=randFor(seed+'|'+room.id);
 const doors=openingObstacles(room,b);summary.doorZones+=doors.length;
 const candidates=Object.entries(FURNITURE_CATALOG).filter(([,data])=>data.rooms.includes(type));
 if(!candidates.length)continue;
 // Pre-existing overlay plans are obstacles: new furniture never deliberately covers old furniture.
 const occupied=(already.get(room.id)||[]).map(p=>({x:+p.x,z:+p.z,w:+p.width||.9,d:+p.depth||.7}));
 const fit=Math.min(b.w,b.d);const target=Math.min(maxPerRoom,Math.max(0,Math.floor((b.w*b.d)/7.5))); // still bounded by protected routes and authored placements
 const placements=[];
 for(let i=0;i<target;i++){
  const [furnitureType,def]=candidates[Math.floor(random()*candidates.length)];const [w,d]=def.footprint;
  if(b.w<w+1.15||b.d<d+1.15||b.h<def.height+.13){summary.skipped++;continue}
  let chosen=null;
  for(let a=0;a<48;a++){
   const side=Math.floor(random()*4),u=.15+.7*random(),margin=.25;
   let x=b.x+b.w*u,z=b.z+b.d*u,angle=0;
   if(side===0){x=b.x+margin+w/2;angle=Math.PI/2}
   if(side===1){x=b.x+b.w-margin-w/2;angle=-Math.PI/2}
   if(side===2){z=b.z+margin+d/2;angle=0}
   if(side===3){z=b.z+b.d-margin-d/2;angle=Math.PI}
   const rotated=Math.abs(Math.sin(angle))>.5;
   const rect={x,z,w:rotated?d:w,d:rotated?w:d};
   if(x-rect.w/2<b.x+.18||x+rect.w/2>b.x+b.w-.18||z-rect.d/2<b.z+.18||z+rect.d/2>b.z+b.d-.18)continue;
   if(doors.some(ob=>intersect(rect,ob,.22))||occupied.some(ob=>intersect(rect,ob,.24)))continue;
   const centerZone={x:b.x+b.w/2,z:b.z+b.d/2,w:Math.min(1.15,b.w*.20),d:Math.min(1.15,b.d*.20)};
   if(intersect(rect,centerZone,.12)&&fit<5.8)continue;
   chosen={roomId:room.id,floor:room.floor,type:furnitureType,x:+x.toFixed(4),z:+z.toFixed(4),rotationY:angle,w:rect.w,d:rect.d,age:+(.2+random()*.4).toFixed(2),roomName:room.name||'',variant:Math.floor(random()*6)};break;
  }
  if(chosen){placements.push(chosen);occupied.push({x:chosen.x,z:chosen.z,w:chosen.w,d:chosen.d});summary.placed++}
  else summary.skipped++;
 }
 records.push(...placements);
 }
 return {records,summary,policy:{architectureUnmodified:true,existingFurnitureProtected:true,artUniquenessUnaffected:true,certification:'footprint-clearance-only'}};
}
export function buildFurnitureFloors(THREE,rooms,options={}){
 const plan=planReusableFurniture(rooms,options),floors=[];
 const total=Math.max(0,...rooms.map(r=>+r.floor||0));
 for(let f=0;f<=total;f++){const g=new THREE.Group();g.name='forge-procedural-furniture-floor-'+f;floors.push(g)}
 for(const p of plan.records){const obj=createVictorianFurniture(THREE,{type:p.type,age:p.age,variant:p.variant,quality:options.quality||'standard'});obj.position.set(p.x,0,p.z);obj.rotation.y=p.rotationY;obj.userData.roomId=p.roomId;plan.summary.dressed+=dressVictorianFurniture(THREE,obj,{quality:options.quality||'standard',roomName:p.roomName,variant:p.variant});obj.userData.placementPolicy='footprint-clearance-reviewed';floors[p.floor].add(obj)}
 return {...plan,floors};
}
