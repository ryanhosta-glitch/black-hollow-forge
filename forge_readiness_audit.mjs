/** Source-only gate: never upgrades a package to gameplay certified. */
export function floorElevationsFeet(floors){let y=0;return floors.map(f=>{const result=y;const heights=(f.rooms||[]).map(r=>Number(r.h)).filter(n=>Number.isFinite(n)&&n>0);y+=Math.max(0,...heights);return result;});}
export function auditHaunt(source){
 const issues=[],rooms=[],ids=new Set(),shaft=new Map(),portals=new Map(),levels=floorElevationsFeet(source.floors||[]);
 const issue=(code,data={},severity='BLOCK_GAME_READY')=>issues.push({severity,code,...data});
 for(const [floor,f] of (source.floors||[]).entries())for(const r of f.rooms||[]){
  if(!r.id||ids.has(r.id))issue('ROOM_ID_NOT_UNIQUE',{roomId:r.id});ids.add(r.id);
  if(!['x','y','l','w','h'].every(k=>Number.isFinite(Number(r[k])))||['l','w','h'].some(k=>Number(r[k])<=0))issue('INVALID_ROOM_BOUNDS',{roomId:r.id});
  if(r.openPlanWith?.length&&!r.openPlanWith.every(id=>(r.openings||[]).some(o=>o.forgeRemovedPartition&&o.shared==='forge-open-'+[r.id,id].sort().join('-'))))issue('OPEN_PLAN_PARTITION_REMOVAL_UNVERIFIED',{roomId:r.id,neighbors:r.openPlanWith});
  if(r.embeddedStair)issue(r.stairAccessFallback==='elevator'?'EMBEDDED_STAIR_BYPASSED':'EMBEDDED_STAIR_PHYSICS_UNVERIFIED',{roomId:r.id},r.stairAccessFallback==='elevator'?'ADVISORY':'BLOCK_GAME_READY');
  if(r.elevatorShaftId){if(!shaft.has(r.elevatorShaftId))shaft.set(r.elevatorShaftId,[]);shaft.get(r.elevatorShaftId).push({...r,floor});}
  for(const o of r.openings||[]){if(!Number.isFinite(Number(o.pos??.5))||Number(o.pos??.5)<0||Number(o.pos??.5)>1)issue('OPENING_POSITION_INVALID',{roomId:r.id,openingId:o.id});if(o.shared){if(!portals.has(o.shared))portals.set(o.shared,[]);portals.get(o.shared).push({roomId:r.id,floor,type:o.type});}}
  rooms.push({...r,floor});
 }
 for(const [shared,ends] of portals){if(ends.length!==2)issue('SHARED_OPENING_PAIR_INVALID',{shared,count:ends.length});if(ends.length===2&&ends[0].floor!==ends[1].floor)issue('SHARED_OPENING_CROSSES_FLOORS',{shared});}
 const elevators=[];for(const [id,stops] of shaft){const first=stops[0];if(stops.length<2)issue('ELEVATOR_SHAFT_SINGLE_STOP',{shaftId:id});if(new Set(stops.map(r=>r.floor)).size!==stops.length)issue('ELEVATOR_SHAFT_DUPLICATE_FLOOR',{shaftId:id});for(const r of stops)if(Math.abs(Number(r.x)-Number(first.x))>.1||Math.abs(Number(r.y)-Number(first.y))>.1)issue('ELEVATOR_SHAFT_MISALIGNED',{shaftId:id,roomId:r.id});elevators.push({id,requiresCabinEntry:true,stops:stops.map(r=>({roomId:r.id,floor:r.floor,elevationMeters:levels[r.floor]*.3048})),runtimeBound:false});}

 if(rooms.length>512)issue('SOURCE_ROOM_BUDGET_EXCEEDED',{rooms:rooms.length});
 for(let i=0;i<Math.min(rooms.length,512);i++)for(let j=i+1;j<Math.min(rooms.length,512);j++){const a=rooms[i],b=rooms[j];if(a.floor!==b.floor)continue;const dx=Math.min(+a.x+ +a.l,+b.x+ +b.l)-Math.max(+a.x,+b.x),dz=Math.min(+a.y+ +a.w,+b.y+ +b.w)-Math.max(+a.y,+b.y);if(dx>.033&&dz>.033)issue('ROOM_INTERIOR_OVERLAP',{rooms:[a.id,b.id],overlapFeet:[dx,dz]});}
 const entry=source.gameEntry,room=rooms.find(r=>r.id===entry?.roomId);if(!room||!(room.openings||[]).some(o=>o.id===entry.openingId&&o.type==='door'))issue('AUTHORED_GAME_ENTRY_INVALID');
 const runtimeRequirements=['physical-door-leaves','furniture-collision','mesh-camera-collision','continuous-stair-support','game-loader-integration'];
 return {version:1,sourceRoomCount:rooms.length,sourceUnchanged:true,gameReady:false,certification:'SOURCE_AUDIT_ONLY',floorElevationsMeters:levels.map(y=>y*.3048),elevators,issues,runtimeRequirements};
}
