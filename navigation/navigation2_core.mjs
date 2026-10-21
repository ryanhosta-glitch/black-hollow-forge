/* Black Hollow Navigation 2 — shared tested room/door collision core.
   The view, camera dip, quest logic, and scene composition remain host-owned.
   Compatible with Forge wall colliders and animated, hinged door leaves. */
export function makeNavigation2Core({THREE,getBlockers,getDoors,getStage,getPlayer,radius=.27}){
 function blocked(x,z){
  for(const m of getBlockers()){
   m.updateMatrixWorld(true);
   const bounds=new THREE.Box3().setFromObject(m);
   if(bounds.max.y<.65||bounds.min.y>1.45)continue;
   if(x>bounds.min.x-radius&&x<bounds.max.x+radius&&z>bounds.min.z-radius&&z<bounds.max.z+radius)return true;
  }
  if(getStage()==='estate'){
   const p=new THREE.Vector2(x,z);
   for(const door of getDoors()){
    if(door.kind!=='estate'||door.openness>.90)continue;
    door.pivot.updateMatrixWorld(true);
    const start=door.pivot.localToWorld(new THREE.Vector3(0,1.1,0));
    const end=door.pivot.localToWorld(new THREE.Vector3(door.side==='left'||door.side==='right'?0:door.width,1.1,door.side==='left'||door.side==='right'?door.width:0));
    const u=new THREE.Vector2(start.x,start.z),v=new THREE.Vector2(end.x,end.z),d=v.clone().sub(u);
    const t=Math.max(0,Math.min(1,p.clone().sub(u).dot(d)/Math.max(1e-8,d.lengthSq())));
    if(p.distanceTo(u.addScaledVector(d,t))<radius+.045)return true;
   }
  }
  return false;
 }
 function travel(dx,dz){
  const player=getPlayer(),steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.06));
  for(let i=0;i<steps;i++){
   const x=player.x+dx/steps,z=player.z+dz/steps;
   if(!blocked(x,player.z))player.x=x;
   if(!blocked(player.x,z))player.z=z;
  }
 }
 function updateDoors(dt,camera){
  const p=getPlayer();
  for(const door of getDoors()){
   const nearPlayer=Math.hypot(p.x-door.x,p.z-door.z)<(door.openOnApproachMeters??2.6);
   const nearCamera=Math.hypot(camera.position.x-door.x,camera.position.z-door.z)<1.75;
   if(nearPlayer||nearCamera)door.hold=2.6;
   else door.hold=Math.max(0,(door.hold||0)-dt);
   door.openness+=(Number(nearPlayer||nearCamera||door.hold>0)-door.openness)*Math.min(1,dt*6);
   door.pivot.rotation.y=door.openness*(door.sign??1)*(door.openAngleRadians??1.57);
  }
 }
 return {blocked,travel,updateDoors};
}
