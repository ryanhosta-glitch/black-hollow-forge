// Additive interaction state machine for Forge furniture-library records. No engine-specific collision promises.
export function createLibraryRuntime(library,{onEvent=()=>{}}={}) {
 const objects=new Map((library.assets||[]).map(a=>[a.id,{...a,state:{open:false,occupied:false}}]));
 function interact(id,action,{distanceMeters=0,actorId='player'}={}) {
  const a=objects.get(id); if(!a)return {ok:false,reason:'Unknown item'};
  if(!Number.isFinite(distanceMeters)||distanceMeters>1.5||distanceMeters<0)return {ok:false,reason:'Out of reach'};
  if(!a.actions.includes(action))return {ok:false,reason:'Action unavailable'};
  const s=a.state;
  if(a.behavior==='drawer'||a.behavior==='cabinet') {if(action==='toggle')s.open=!s.open;else s.open=action==='open';}
  else if(a.behavior==='chair') {if(action==='sit'&&(!a.sittable||s.occupied))return {ok:false,reason:'Chair unavailable'};if(action==='stand'&&!s.occupied)return {ok:false,reason:'Chair not occupied'};s.occupied=action==='sit';}
  const event={schema:'black-hollow.furniture-event.v1',objectId:id,roomId:a.roomId,action,actorId,state:{...s}};onEvent(event);return {ok:true,event};
 }
 return {objects,interact,get:(id)=>objects.get(id)};
}
