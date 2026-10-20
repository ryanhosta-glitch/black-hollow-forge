/** Black Hollow 3.3: curated furniture-top dressing. Decorations attach only to
 * existing procedural furniture, not floors, walls, openings or student-authored objects.
 * The host furniture's footprint does not change, so existing clearance remains valid.
 */
export function dressVictorianFurniture(THREE, object, {quality='standard', roomName='', variant=0}={}) {
 if (!object?.userData || object.userData.type !== 'black-hollow.furniture') return 0;
 const type=object.userData.furnitureType;
 const mobile=quality==='mobile';
 const root=new THREE.Group();root.name='forge-3-3-victorian-accessories';
 const wood=new THREE.MeshStandardMaterial({color:0x39251e,roughness:.72});
 const paper=new THREE.MeshStandardMaterial({color:0xb6a88c,roughness:.94});
 const brass=new THREE.MeshStandardMaterial({color:0x90764b,metalness:.6,roughness:.48});
 const wax=new THREE.MeshStandardMaterial({color:0xd2c5a9,roughness:.9});
 const glass=new THREE.MeshPhysicalMaterial({color:0x8a9b88,transparent:true,opacity:.52,metalness:.05,roughness:.19,depthWrite:false});
 const textile=new THREE.MeshStandardMaterial({color:variant%2?0x3b4b44:0x5a3d42,roughness:.94});
 const add=(g,m,n,x,y,z)=>{const o=new THREE.Mesh(g,m);o.name='bh33-'+n;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;root.add(o);return o};
 const box=(n,x,y,z,w,h,d,m)=>add(new THREE.BoxGeometry(w,h,d),m,n,x,y,z);
 const cylinder=(n,x,y,z,rt,rb,h,m)=>add(new THREE.CylinderGeometry(rt,rb,h,mobile?7:12),m,n,x,y,z);
 const sphere=(n,x,y,z,r,m)=>add(new THREE.SphereGeometry(r,mobile?6:10,mobile?5:8),m,n,x,y,z);
 const book=(x,z,angle=0)=>{const g=new THREE.Group();g.position.set(x,.834,z);g.rotation.y=angle;
  const cover=new THREE.Mesh(new THREE.BoxGeometry(.24,.034,.17),wood);g.add(cover);
  const pages=new THREE.Mesh(new THREE.BoxGeometry(.22,.022,.155),paper);pages.position.y=.014;g.add(pages);root.add(g)};
 const candle=(x,z,height)=>{cylinder('candleholder',x,height+.023,z,.045,.060,.046,brass);
  cylinder('candle-wax',x,height+.105,z,.024,.025,.12,wax);
  // Flame deliberately omitted: no fake light or performance-heavy emitter without fixture integration.
 };
 if(type==='writing_desk'){
  book(-.34,.02,.12);candle(.54,-.23,.82);
  cylinder('inkwell',.35,.87,.18,.045,.052,.071,glass);
  box('paper-sheet',.10,.825,.04,.21,.003,.15,paper);
  if(!mobile){cylinder('inkwell-lid',.35,.908,.18,.05,.05,.009,brass);box('quill',.41,.853,.16,.18,.007,.008,paper)}
 } else if(type==='dining_table') {
  const y=.786;box('table-runner',0,y+.004,0,1.22,.008,.38,textile);
  cylinder('serving-tray',0,y+.027,0,.23,.23,.034,brass);
  for(const x of [-.72,.72]){cylinder('dinner-plate',x,y+.012,0,.135,.135,.009,paper);}
  if(!mobile){for(const z of [-.13,.13])cylinder('candlestick',0,y+.11,z,.018,.045,.16,brass)}
 } else if(type==='bookcase') {
  if(!mobile){const z=.15;box('bookend-left',-.57,1.98,z,.035,.16,.11,brass);box('bookend-right',.54,1.98,z,.035,.16,.11,brass)}
  sphere('dusty-bust',0,2.37,-.06,.082,paper);cylinder('bust-plinth',0,2.29,-.06,.105,.105,.075,wood);
 } else if(type==='wardrobe'){
  // Only external handle/keyhole details; never add objects beyond physical wardrobe bounds.
  cylinder('brass-lock-plate',.06,1.13,.428,.018,.018,.005,brass).rotation.x=Math.PI/2;
 } else if(type==='armchair'||type==='settee') {
  const width=type==='settee'?1.84:.86;
  box('loose-cushion',Math.min(.24,width*.19),.643,.055,Math.min(.38,width*.44),.12,.35,textile);
  if(!mobile&&type==='settee')box('second-cushion',-.41,.646,.02,.35,.13,.35,textile);
 }
 if(root.children.length){object.add(root);object.userData.decorated33=true;object.userData.decorFamily=String(roomName||'').slice(0,48)}
 return root.children.length;
}
