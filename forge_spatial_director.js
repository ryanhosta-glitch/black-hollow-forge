// Black Hollow Forge 2.1: universal, non-destructive room spatial planner.
// Coordinates: exported room bounds in feet; generated furniture in metres.
const M=.3048;
const finite=n=>Number.isFinite(Number(n))?Number(n):0;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function roomEnvelope(room,levels=[]){
 const b=room?.boundsFeet;
 if(!b)return null;
 const x=finite(b.x)*M,z=finite(b.y)*M,w=Math.max(0,finite(b.l)*M),d=Math.max(0,finite(b.w)*M),h=Math.max(0,finite(b.h)*M);
 return {id:room.id,floor:room.floor,x,z,w,d,h,y:finite(levels[room.floor]??(room.floor-1)*3.048),get cx(){return x+w/2},get cz(){return z+d/2}};
}
function furnitureForRoom(room,records){
 const result=[];
 for(const r of records||[]){
  if(r.roomId!==room.id&&r.id!==room.id)continue;
  for(const f of r.placements||[]){
   const x=finite(f.x??f.position?.[0]),z=finite(f.z??f.position?.[2]);
   const width=Math.max(0,finite(f.width??f.dimensions?.width??.8)),depth=Math.max(0,finite(f.depth??f.dimensions?.depth??.65));
   // Furnishing plans are in metres in this compiler. Unknown units cannot be certified.
   result.push({x,z,width,depth,name:f.name||f.type||'furniture'});
  }
 }
 return result;
}
function edgeClearance(x,z,b){return Math.min(x-b.x,b.x+b.w-x,z-b.z,b.z+b.d-z)}
function furnitureClearance(x,z,f,r=.31){const dx=Math.max(Math.abs(x-f.x)-f.width/2,0),dz=Math.max(Math.abs(z-f.z)-f.depth/2,0);return Math.hypot(dx,dz)-r}
function segmentIntersectsAABB(x1,z1,x2,z2,o,margin=.13){
 let t0=0,t1=1;const dx=x2-x1,dz=z2-z1;
 const minX=o.x-o.width/2-margin,maxX=o.x+o.width/2+margin,minZ=o.z-o.depth/2-margin,maxZ=o.z+o.depth/2+margin;
 for(const [p,q] of [[-dx,x1-minX],[dx,maxX-x1],[-dz,z1-minZ],[dz,maxZ-z1]]){
  if(Math.abs(p)<1e-9){if(q<0)return false;continue;}
  const r=q/p;if(p<0)t0=Math.max(t0,r);else t1=Math.min(t1,r);if(t0>t1)return false;
 }return true;
}
export function planInteriorView(room,levels=[],records=[]){
 const b=roomEnvelope(room,levels);if(!b||b.w<.2||b.d<.2||b.h<.5)return null;
 const objects=furnitureForRoom(room,records),margin=Math.min(.48,Math.max(.12,Math.min(b.w,b.d)*.10));
 const eye=b.y+clamp(b.h*.54,.67,1.63);
 let best=null;
 // Grid sweep finds the safest available place rather than guessing the room center.
 for(let i=0;i<7;i++)for(let j=0;j<7;j++){
  const x=b.x+margin+(b.w-2*margin)*i/6,z=b.z+margin+(b.d-2*margin)*j/6;
  const edge=edgeClearance(x,z,b);
  const furniture=objects.length?Math.min(...objects.map(f=>furnitureClearance(x,z,f))):99;
  const free=Math.min(edge-.28,furniture);
  const central=1-Math.hypot((x-b.cx)/Math.max(b.w,.1),(z-b.cz)/Math.max(b.d,.1));
  const score=free*4+central*.75;
  if(!best||score>best.score)best={x,z,score,free};
 }
 // Favor a useful clear line of sight toward the far interior, never point through known furnishings.
 const directions=[[1,0],[0,1],[-1,0],[0,-1],[.707,.707],[-.707,.707],[.707,-.707],[-.707,-.707]];
 let target=null;
 for(const [dx,dz] of directions){
  const t=Math.min(2.5,Math.max(.45,Math.min(b.w,b.d)*.46));
  const tx=clamp(best.x+dx*t,b.x+.12,b.x+b.w-.12),tz=clamp(best.z+dz*t,b.z+.12,b.z+b.d-.12);
  const collisions=objects.filter(f=>segmentIntersectsAABB(best.x,best.z,tx,tz,f)).length;
  const distance=Math.hypot(tx-best.x,tz-best.z);
  const score=distance-collisions*9;
  if(!target||score>target.score)target={x:tx,z:tz,score};
 }
 return {position:{x:best.x,y:eye,z:best.z},target:{x:target.x,y:eye-.07,z:target.z},clearance:best.free,confidence:objects.length?'planned-furnishing-clearance':'footprint-only',roomId:room.id};
}
export function auditGeneratedPlacements(rooms=[],records=[],levels=[]){
 const issues=[],summary={rooms:0,furnishings:0,outside:0,nearWall:0,uncertified:0};
 for(const room of rooms){const b=roomEnvelope(room,levels);if(!b)continue;summary.rooms++;
  for(const f of furnitureForRoom(room,records)){
   summary.furnishings++;const dx=Math.abs(f.x-b.cx)+f.width/2, dz=Math.abs(f.z-b.cz)+f.depth/2;
   if(dx>b.w/2+.015||dz>b.d/2+.015){summary.outside++;issues.push({roomId:room.id,object:f.name,severity:'warning',type:'outside-authored-room-footprint'})}
   else if(dx>b.w/2-.05||dz>b.d/2-.05){summary.nearWall++;issues.push({roomId:room.id,object:f.name,severity:'review',type:'near-wall'});}
  }
 }
 return {summary,issues,limits:['Floor contact, doors, rotated furniture, and 3D mesh intersections require geometry-aware certification.','Student-authored architecture is not changed.']};
}
