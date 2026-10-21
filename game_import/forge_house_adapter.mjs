/* Black Hollow Forge game-import adapter, v1.0. No engine globals and no source mutations. */
const REQUIRED=['manifest.json','navigation/collision.json','navigation/integrity.json'];
const METERS_PER_FOOT=.3048;
function urlFor(root,path){if(!path||path.includes('..')||path.startsWith('/'))throw Error('Invalid Forge path: '+path);return root.replace(/\/$/,'')+'/'+path;}
async function jsonAt(url){const r=await fetch(url);if(!r.ok)throw Error(`${r.status}: ${url}`);return r.json();}
export async function loadForgeContract(root){
  const manifest=await jsonAt(urlFor(root,'manifest.json'));
  if(manifest.format!=='black-hollow-house')throw Error('Not a Black Hollow Forge house');
  const [navigation,integrity,collision,doorways,stairNavigation]=await Promise.all([
    jsonAt(urlFor(root,manifest.navigation)),
    manifest.integrity?jsonAt(urlFor(root,manifest.integrity)):Promise.resolve({status:'not-included-in-new-qa-casa'}),
    manifest.collision?jsonAt(urlFor(root,manifest.collision)):Promise.resolve(null),
    manifest.doorways?jsonAt(urlFor(root,manifest.doorways)):Promise.resolve(null),
    manifest.stairNavigation?jsonAt(urlFor(root,manifest.stairNavigation)):Promise.resolve(null)
  ]);
  // Older estate packages use boundsFeet; new CASA compilation uses bounds.
  const standardRooms=navigation.rooms.map(room=>({...room,boundsFeet:room.boundsFeet||room.bounds}));
  if(standardRooms.some(room=>!room.boundsFeet))throw Error('Room lacks navigation dimensions');
  const normalizedNavigation={...navigation,rooms:standardRooms};
  const rooms=new Map(standardRooms.map(room=>[room.id,room]));
  if(rooms.size!==standardRooms.length)throw Error('Duplicate room IDs');
  if(!rooms.has(manifest.entry.roomId))throw Error('Game entry room not found');
  for(const floor of manifest.floors)for(const id of floor.roomIds)if(!rooms.has(id))throw Error('Floor references unknown room '+id);
  return Object.freeze({root,manifest,navigation:normalizedNavigation,integrity,collision,doorways,stairNavigation,rooms,entry:manifest.entry,
    getRoom:id=>rooms.get(id)||null,
    getFloorRooms:i=>standardRooms.filter(r=>r.floor===i),
    roomCenterMeters:id=>{const r=rooms.get(id);if(!r)return null;const b=r.boundsFeet;return {x:(b.x+b.l/2)*METERS_PER_FOOT,z:(b.y+b.w/2)*METERS_PER_FOOT,floor:r.floor};},
    url:path=>urlFor(root,path)
  });
}
/* Explicit placement policy: exported floors are floor-local. Height is derived from
   maximum AUTHORED room height for each floor, not hard-coded to 10 feet. */
export function getFloorElevations(contract){
  let y=0;return contract.manifest.floors.map((floor,i)=>{
    const heights=contract.getFloorRooms(i).map(r=>Number(r.boundsFeet.h)||10);
    const rise=(Math.max(...heights,10))*METERS_PER_FOOT;
    const out={index:i,id:floor.id,yMeters:y,riseMeters:rise};y+=rise;return out;
  });
}
export async function addForgeGeometry(contract,{THREE,GLTFLoader,scene,includeRoof=true}={}){
  if(!scene||!GLTFLoader||!THREE)throw Error('THREE, GLTFLoader and scene are required');
  const loader=new GLTFLoader(),group=new THREE.Group();group.name='Forge Estate '+contract.manifest.name;
  const getGltf=url=>new Promise((resolve,reject)=>loader.load(url,resolve,undefined,reject));
  const elevations=getFloorElevations(contract),floorGroups=[];
  for(const position of elevations){
    const floor=contract.manifest.floors[position.index];const gltf=await getGltf(contract.url(floor.model));
    gltf.scene.position.y=position.yMeters;gltf.scene.name=floor.name;gltf.scene.userData.forgeFloor=position.index;
    group.add(gltf.scene);floorGroups.push(gltf.scene);
  }
  if(includeRoof&&contract.manifest.roof){const gltf=await getGltf(contract.url(contract.manifest.roof));gltf.scene.position.y=elevations.at(-1).yMeters+elevations.at(-1).riseMeters;gltf.scene.name='Forge roof';group.add(gltf.scene)}
  scene.add(group);return {group,floorGroups,elevations,dispose(){scene.remove(group);group.traverse(o=>{if(o.isMesh)o.geometry?.dispose()})}};
}
export function gameReadiness(contract){
  const warnings=[];const hard=[];
  if(!contract.manifest.floors.length)hard.push('No floors');
  if(!contract.entry?.roomId)hard.push('No entry');
  // Door safety, stair headroom and mesh collision need real tests. Do not overclaim.
  warnings.push('No certified mesh-based physics collision or continuous staircase navigation');
  warnings.push('Game quest and Impossible Elevator bindings not integrated');
  warnings.push('Runtime material appearance may differ from original Black Hollow');
  return {canLoadGeometry:hard.length===0,gameplayCertified:false,hard,warnings};
}
