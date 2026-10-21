import {createVictorianFurniture} from './victorian_furniture_library.js';
import {decorationBoxes} from './forge_decoration_plan.mjs';
export function decorationBlocked(plan,floor,x,z,y,radius=.24){return plan.colliders.some(c=>c.floor===floor&&y<c.maxY&&y+1.7>c.minY&&x+radius>c.bounds.minX&&x-radius<c.bounds.maxX&&z+radius>c.bounds.minZ&&z-radius<c.bounds.maxZ);}
/** Inspection rendering uses the same catalog, placements and geometry as the compiler. */
export function createDecorationGroup(THREE,plan,floor){
 const root=new THREE.Group();root.name='Forge decorations';
 const palette=[0x60452f,0x766273,0x302d38,0xb3a083,0x202637,0x39251b,0x50253a,0x686b68,0xad8950,0x556b75];
 const subset={...plan,lights:plan.lights.filter(l=>l.floor===floor),grounds:floor===plan.groundFloor?plan.grounds:[],paths:floor===plan.groundFloor?plan.paths:[],artwork:plan.artwork.filter(a=>a.floor===floor)};
 const batches=new Map();for(const part of decorationBoxes(subset)){if(!batches.has(part.mat))batches.set(part.mat,[]);batches.get(part.mat).push(part);}
 for(const [mat,parts]of batches){const mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:palette[mat],roughness:mat===8?.4:.85,metalness:mat===8?.65:0}),parts.length),dummy=new THREE.Object3D();parts.forEach((p,i)=>{dummy.position.fromArray(p.c);dummy.scale.fromArray(p.s);dummy.rotation.set(0,0,0);dummy.rotation[p.rotAxis||'z']=p.rot||0;dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});root.add(mesh);}
 for(const o of plan.furniture.filter(o=>o.floor===floor)){const g=createVictorianFurniture(THREE,{type:o.type,quality:'mobile'});g.position.fromArray(o.positionMeters);g.rotation.y=o.rotationY;g.userData.objectId=o.id;root.add(g);}
 const textures=new THREE.TextureLoader();for(const a of subset.artwork){const tex=textures.load('./'+a.asset);tex.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(...a.sizeMeters),new THREE.MeshStandardMaterial({map:tex,roughness:.95,side:THREE.DoubleSide}));m.position.fromArray(a.positionMeters);m.position.add(new THREE.Vector3(...a.normal).multiplyScalar(.04));m.rotation.y=Math.atan2(a.normal[0],a.normal[2]);m.userData.objectId=a.id;root.add(m);}
 // Keep actual dynamic light count bounded; the complete static fixture plan is still exported.
 for(const spec of plan.lights.filter(l=>l.floor===floor).slice(0,3)){const l=new THREE.PointLight(spec.color,spec.intensity,spec.rangeMeters,2);l.position.fromArray(spec.positionMeters);root.add(l);}
 return root;
}
