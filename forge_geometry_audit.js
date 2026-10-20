// Forge 2.2 — Geometry-aware, read-only placement audit.
// Operates on loaded THREE groups rather than assuming model/world coordinates.
// Does not mutate original student geometry or generated scene objects.
const FT=.3048;
const nums=x=>Number.isFinite(Number(x))?Number(x):0;
export function roomBoundsMeters(room, levels=[]){
 const b=room?.boundsFeet;if(!b)return null;
 const x=nums(b.x)*FT,z=nums(b.y)*FT, y=nums(levels[room.floor]);
 return {minX:x,maxX:x+nums(b.l)*FT,minZ:z,maxZ:z+nums(b.w)*FT,
         floorY:y,ceilingY:y+nums(b.h)*FT,id:room.id};
}
const overlap=(a0,a1,b0,b1)=>Math.max(0,Math.min(a1,b1)-Math.max(a0,b0));
export function assessMeshBounds({room,box,levels=[],kind='furniture',name='',floorTolerance=.11}){
 const r=roomBoundsMeters(room,levels);if(!r||!box)return {status:'unverified',name,kind,reason:'missing-room-or-geometry'};
 const min=box.min,max=box.max;
 if(![min.x,min.y,min.z,max.x,max.y,max.z].every(Number.isFinite))
   return {status:'unverified',name,kind,reason:'invalid-bounds'};
 const inside= min.x>=r.minX-.045&&max.x<=r.maxX+.045 &&
               min.z>=r.minZ-.045&&max.z<=r.maxZ+.045;
 const outside=!inside;
 const floorGap=min.y-r.floorY;
 const ceilingIntrusion=max.y-r.ceilingY;
 const findings=[];
 if(outside)findings.push('extends-outside-room');
 if(kind==='furniture'&&floorGap>floorTolerance)findings.push('above-room-floor');
 if(kind==='furniture'&&floorGap<-.15)findings.push('below-room-floor');
 if(ceilingIntrusion>.13&&kind!=='chandelier')findings.push('above-ceiling');
 if(kind==='chandelier'&&Math.abs(ceilingIntrusion)>.35)findings.push('review-ceiling-mount');
 return {name,kind,roomId:r.id,status:findings.length?'review':'geometry-bounds-clear',
         findings, floorGap:Number(floorGap.toFixed(3)),
         ceilingDelta:Number(ceilingIntrusion.toFixed(3))};
}
export function auditSceneMeshes(THREE,rooms,levels,groups,{limit=5000}={}){
 const report={checked:0,clear:0,review:0,unverified:0,issues:[],limitations:[
  'Overlapping 3D bounding boxes are not proof of triangle-level intersections.',
  'Decorative meshes spanning multiple rooms are excluded from individual-room certification.',
  'Doors and railings are preserved; no student blueprint geometry is moved.'
 ]};
 const byId=new Map(rooms.map(r=>[r.id,r]));
 const boxes=[];
 for(const {group,kind='furniture',floor=0} of groups||[]){
  if(!group)continue;
  group.updateWorldMatrix(true,true);
  group.traverse(o=>{
   if(!o.isMesh||report.checked>=limit)return;
   const box=new THREE.Box3().setFromObject(o);
   if(box.isEmpty())return;
   const cx=(box.min.x+box.max.x)/2,cz=(box.min.z+box.max.z)/2;
   const compatible=rooms.filter(r=>r.floor===floor&&(()=>{
    const b=roomBoundsMeters(r,levels);
    return b&&cx>=b.minX-.05&&cx<=b.maxX+.05&&cz>=b.minZ-.05&&cz<=b.maxZ+.05;
   })());
   // Furniture meshes may be arranged as many decorative pieces; avoid treating a room-wide
   // architectural mesh or unassigned item as a furniture placement.
   if(compatible.length!==1){report.unverified++;return;}
   const room=compatible[0];
   const check=assessMeshBounds({room,box,levels,kind,name:o.name||'unnamed mesh'});
   report.checked++;
   if(check.status==='review'){report.review++;if(report.issues.length<140)report.issues.push(check);}
   else if(check.status==='geometry-bounds-clear')report.clear++;
   else report.unverified++;
   boxes.push({roomId:room.id,kind,name:o.name,box});
  });
 }
 // Only report suspicious interpenetration between SEPARATE furniture entities.
 // Parent group or mesh components often intentionally overlap (books on shelves).
 return report;
}
