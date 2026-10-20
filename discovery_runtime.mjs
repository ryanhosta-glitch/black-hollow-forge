// Pure, portable discovery state machine. Game runtime must validate distance/collision separately.
export function createDiscoveryRuntime(catalog,{onEvent=()=>{}}={}){
 const objects=new Map((catalog.objects||[]).map(obj=>[obj.objectId,{...obj,open:false,contents:obj.contents.map(c=>({...c,state:'undiscovered'}))}]));
 const inventory=new Map();
 function apply(objectId,action,itemId=null){
  const o=objects.get(objectId);if(!o)return {ok:false,reason:'Unknown furniture'};
  if(action==='open' && o.openRequired){o.open=true;return {ok:true,state:'open'};}
  if(action==='close' && o.openRequired){o.open=false;return {ok:true,state:'closed'};}
  if(action==='search'){
   if(o.openRequired && !o.open)return {ok:false,reason:'Open the furniture first'};
   o.contents.forEach(c=>{if(c.state==='undiscovered')c.state='revealed'});
   const event={schema:'black-hollow.discovery-event.v1',type:'searched',objectId,roomId:o.roomId};onEvent(event);
   return {ok:true,contents:o.contents.filter(c=>c.state!=='taken'),event};
  }
  const c=o.contents.find(x=>x.id===itemId);if(!c)return {ok:false,reason:'Unknown discovery'};
  if(c.state==='undiscovered')return {ok:false,reason:'Search first'};
  if(action==='take' && c.action==='take' && c.state==='revealed'){
   c.state='taken';inventory.set(c.id,{...c});
  }else if(action==='read' && c.action==='read' && c.state==='revealed')c.state='read';
  else return {ok:false,reason:'Action not available'};
  const event={schema:'black-hollow.discovery-event.v1',type:action,objectId,roomId:o.roomId,itemId:c.id,kind:c.kind};onEvent(event);
  return {ok:true,event};
 }
 function save(){return {schema:'black-hollow.discovery-save.v1',objects:[...objects.values()].map(o=>({id:o.objectId,open:o.open,contents:o.contents.map(c=>({id:c.id,state:c.state}))})),inventory:[...inventory.keys()]};}
 function load(data){if(data?.schema!=='black-hollow.discovery-save.v1')return false;for(const row of data.objects||[]){const o=objects.get(row.id);if(!o)continue;o.open=!!row.open;for(const c of row.contents||[]){const target=o.contents.find(x=>x.id===c.id);if(target&&['undiscovered','revealed','read','taken'].includes(c.state))target.state=c.state;}}inventory.clear();for(const o of objects.values())for(const c of o.contents)if(c.state==='taken')inventory.set(c.id,{...c});return true;}
 return {objects,inventory,apply,save,load};
}
