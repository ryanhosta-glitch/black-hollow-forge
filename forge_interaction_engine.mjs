// Black Hollow Forge: shared proximity and state-machine prototype. No external dependencies.
export const MAX_REACH=1.5;
export function distance(a,b){return Math.hypot(a.x-b.x,a.z-b.z)}
export function canInteract(player,entity,reach=MAX_REACH){return player.floor===entity.floor && distance(player,entity)<=reach && (entity.roomId===player.roomId || (entity.kind==='door'&&entity.adjacentRoomIds?.includes(player.roomId)))}
export function interact(entity,player,inventory=new Set()){
 if(!canInteract(player,entity))return {ok:false,reason:'out-of-reach-or-wrong-room'};
 if(entity.kind==='door'){
  if(entity.locked&&!inventory.has(entity.requiresKey))return {ok:false,reason:'locked'};
  entity.state=entity.state==='open'?'closed':'open';entity.angleDegrees=entity.state==='open'?90:0;
  return {ok:true,action:entity.state};
 }
 if(entity.kind==='cabinet'||entity.kind==='drawer'){
  if(entity.locked&&!inventory.has(entity.requiresKey))return {ok:false,reason:'locked'};
  entity.state=entity.state==='open'?'closed':'open';
  return {ok:true,action:entity.state,contents:entity.state==='open'?entity.contents:[]};
 }
 if(entity.kind==='pickup'){
  if(entity.collected)return {ok:false,reason:'already-collected'};
  entity.collected=true; inventory.add(entity.itemId||entity.id);return {ok:true,action:'collected'};
 }
 if(entity.kind==='chair')return {ok:true,action:'inspect-seat-unverified'};
 return {ok:true,action:'inspected'};
}
export function takeContent(entity,item,inventory){
 if(entity.state!=='open'||!entity.contents?.includes(item))return {ok:false,reason:'item-unavailable'};
 entity.contents=entity.contents.filter(x=>x!==item);inventory.add(item);return {ok:true,action:'collected',item};
}
