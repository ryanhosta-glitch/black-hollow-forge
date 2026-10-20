// Black Hollow Forge furniture interaction primitives — client runtime contract.
// Emits state changes and keeps physics/collision integration explicit, not implied.
export const FURNITURE_ACTIONS=Object.freeze({drawer:'slide',cabinet:'hinge',chair:'sit',table:'inspect',shelf:'inspect'});
export function createFurnitureState(id,type,{sittable=true,locked=false}={}){
 const state={id,type,open:false,occupied:false,sittable:!!sittable,locked:!!locked};
 return {state,interact(action){
  if(action==='open'||action==='close'||action==='toggle'){
   if(!['drawer','cabinet'].includes(type))return {ok:false,reason:'Not openable'};
   if(state.locked)return {ok:false,reason:'Locked'};
   state.open=action==='open'||(action==='toggle'&&!state.open);return {ok:true,event:state.open?'furniture.open':'furniture.close',state:{...state}};
  }
  if(action==='sit'||action==='stand'){
   if(type!=='chair'||!state.sittable)return {ok:false,reason:'Not sittable'};
   if(action==='sit'&&state.occupied)return {ok:false,reason:'Occupied'};
   state.occupied=action==='sit';return {ok:true,event:state.occupied?'furniture.sit':'furniture.stand',state:{...state}};
  }
  return {ok:false,reason:'Unsupported interaction'};
 }};
}
export function furnitureExportRecord({id,roomId,floor,type,position,sittable=true,locked=false}){
 return {schema:'black-hollow.furniture-interaction.v1',id,roomId,floor,type,position,actions:type==='drawer'||type==='cabinet'?['toggle']:type==='chair'&&sittable?['sit','stand']:['inspect'],collision:{certified:false,interactionReachMeters:1.5},gameplay:{implementedInOriginalGame:false},sittable: type==='chair'?sittable:null,locked};
}
