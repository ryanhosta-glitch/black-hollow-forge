/** Locations and proximity checks for the game. Story, asset selection, unlock flags and saves remain game-owned. */
const roles=['founder','seer','porcelain-doll','spellbook','crystal-ball','exit'];
export function planGameplaySlots(source,access,playability){
 const issues=[],safe=playability.rooms.filter(r=>r.reachable&&r.standingPointMeters&&!access.stops.some(s=>s.floor===r.floor&&s.requiresUnlock)),authored=Array.isArray(source.gameplay?.anchors)?source.gameplay.anchors:[],slots=[],primary=safe.find(r=>r.roomId===source.gameEntry?.roomId)||safe[0];
 for(const [i,role]of roles.entries()){
  const existing=authored.find(a=>a.role===role),fallback=(role==='founder'||role==='exit')?primary:safe[i%safe.length];
  if(existing){const room=playability.rooms.find(r=>r.roomId===existing.roomId);slots.push({...structuredClone(existing),id:existing.id||'game:'+role,role,authored:true,validated:playability.interactions.some(i=>i.objectId===(existing.id||'game:'+role)&&i.passed),requiresBinding:true});if(!slots.at(-1).validated)issues.push({severity:'BLOCK_GAME_READY',code:'AUTHORED_GAMEPLAY_ANCHOR_UNVERIFIED',role,objectId:existing.id||'game:'+role});if(!room?.reachable)issues.push({severity:'BLOCK_GAME_READY',code:'GAMEPLAY_ROOM_UNREACHABLE',role,roomId:existing.roomId});}
  else if(fallback)slots.push({id:'game:'+role,role,roomId:fallback.roomId,floor:fallback.floor,approachMeters:[...fallback.standingPointMeters],authored:false,asset:null,validated:true,requiresBinding:true});
  else issues.push({severity:'BLOCK_GAME_READY',code:'GAMEPLAY_SLOT_NO_SAFE_LOCATION',role});
 }
 for(const role of roles)if(authored.filter(a=>a.role===role).length>1)issues.push({severity:'BLOCK_GAME_READY',code:'DUPLICATE_GAMEPLAY_ROLE',role});if(new Set(slots.map(s=>s.id)).size!==slots.length)issues.push({severity:'BLOCK_GAME_READY',code:'DUPLICATE_GAMEPLAY_OBJECT_ID'});
 const groups=new Map();for(const slot of slots){const key=JSON.stringify([slot.roomId,slot.approachMeters]);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(slot.id);}for(const group of groups.values())if(group.length>1)for(const id of group)slots.find(s=>s.id===id).presentation='staged-single-interaction-point';
 return {version:1,units:'meters',roles,slots,issues,gameplayCertified:false,storyOwner:'game',floor13UnlockOwner:'game',oneRoomPolicy:'reuse one safe interaction point with stage-specific presentation; do not stack physical quest objects',unbound:slots.filter(s=>s.requiresBinding).map(s=>s.id)};
}
export function createGameplayBindings(contract,{canStand=()=>true,onInteract=()=>{},isEnabled=()=>true}={}){
 const slots=new Map(contract.slots.map(s=>[s.id,s]));
 return {interact(id,{roomId,scene,positionMeters}={}){const s=slots.get(id);if(!s)return {ok:false,reason:'unknown-object'};if(scene!=='house'||roomId!==s.roomId)return {ok:false,reason:'wrong-room-or-scene'};if(!Array.isArray(positionMeters)||positionMeters.length!==3||!positionMeters.every(Number.isFinite)||!Array.isArray(s.approachMeters)||s.approachMeters.length!==3)return {ok:false,reason:'invalid-position'};if(Math.abs(positionMeters[1]-s.approachMeters[1])>.35||Math.hypot(positionMeters[0]-s.approachMeters[0],positionMeters[2]-s.approachMeters[2])>.85||!canStand(roomId,positionMeters))return {ok:false,reason:'out-of-reach'};if(!isEnabled(s))return {ok:false,reason:'disabled'};const event={objectId:s.id,role:s.role,roomId:s.roomId,positionMeters:[...positionMeters]};onInteract(event);return {ok:true,event};},get:id=>slots.get(id)||null};
}
