// Black Hollow Forge — lightweight geometric fixture library, preview overlay only.
// Authored floor mesh and .haunt data are never modified.
export function createVictorianFixtures(THREE,scene,{mobile=false}={}){
 const group=new THREE.Group();group.name='forge_victorian_fixture_preview';scene.add(group);
 const material=(color,metalness=0,roughness=.6,emissive=0)=>new THREE.MeshStandardMaterial({color,metalness,roughness,emissive,emissiveIntensity:emissive?.4:0});
 const brass=material(0x977343,.78,.28), dark=material(0x241b1a,.28,.55),ivory=material(0xf2ce9a,.05,.68),glass=material(0xf8c47c,.08,.35,0xd66a1a);
 const sphere=new THREE.SphereGeometry(1,8,6),cylinder=new THREE.CylinderGeometry(1,1,1,8),box=new THREE.BoxGeometry(1,1,1);
 const add=(parent,g,m,x,y,z,sx,sy,sz)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);parent.add(o);return o;};
 const rod=(p,a,b,r,m)=>{const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));const mesh=add(p,cylinder,m,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,r,v.length(),r);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return mesh};
 function chandelier(p,x,z,h,rad){
  const g=new THREE.Group();g.position.set(x,h,z);p.add(g);
  rod(g,[0,0,0],[0,-.78,0],.023,dark);add(g,sphere,brass,0,-.78,0,.14,.10,.14);
  for(let ring=0;ring<2;ring++){const n=ring?5:8,R=rad*(ring?.58:1),y=ring?-1.00:-.64;
   for(let i=0;i<n;i++){const a=i*Math.PI*2/n,xx=Math.cos(a)*R,zz=Math.sin(a)*R;
    rod(g,[0,-.75,0],[xx,y,zz],.017,brass);add(g,sphere,brass,xx,y,zz,.075,.05,.075);
    rod(g,[xx,y,zz],[xx,y+.23,zz],.015,brass);{const flame=add(g,sphere,glass,xx,y+.29,zz,.055,.10,.055);flame.userData.forgeFlameTip=true;}
   }
  }
  add(g,sphere,ivory,0,-1.05,0,.045,.15,.045);return g;
 }
 function sconce(p,x,y,z,dir=1){const g=new THREE.Group();g.position.set(x,y,z);p.add(g);add(g,box,brass,0,0,0,.045,.22,.12);rod(g,[0,0,0],[dir*.27,-.04,0],.019,brass);rod(g,[dir*.27,-.04,0],[dir*.27,.19,0],.02,brass);{const flame=add(g,sphere,glass,dir*.27,.25,0,.052,.09,.052);flame.userData.forgeFlameTip=true;}return g}
 function candelabrum(p,x,y,z){const g=new THREE.Group();g.position.set(x,y,z);p.add(g);rod(g,[0,0,0],[0,.42,0],.03,brass);add(g,cylinder,brass,0,.01,0,.15,.04,.15);for(let i=-1;i<=1;i++){const xx=i*.20;rod(g,[0,.30,0],[xx,.42,0],.016,brass);add(g,cylinder,ivory,xx,.48,0,.025,.13,.025);{const flame=add(g,sphere,glass,xx,.57,0,.025,.055,.025);flame.userData.forgeFlameTip=true;}}return g}
 function fireplace(p,x,y,z){const g=new THREE.Group();g.position.set(x,y,z);p.add(g);add(g,box,dark,0,.65,0,1.25,1.3,.25);add(g,box,brass,0,1.39,0,1.46,.10,.38);add(g,box,dark,0,.42,.14,.75,.72,.06);add(g,box,glass,0,.20,.18,.48,.22,.04);return g}
 let count=0;
 function populate(rooms,levels=[]){group.clear();count=0;const c=rooms||[];for(const r of c){const b=r.boundsFeet;if(!b)continue;const w=b.l*.3048,d=b.w*.3048,h=b.h*.3048; if(w<2.3||d<2.3||h<2.45)continue;
 const floor=Number(r.floor)||0,ox=b.x*.3048,oz=b.y*.3048,fy=levels[floor]??floor*3.048;
 const name=String(r.name||'').toLowerCase(),type=String(r.roomType||r.type||'').toLowerCase(),s=name+' '+type;
 if(/stair|elevator|shaft|corridor|hallway|passage|landing/.test(s)&&!/grand.*hall|entrance.*hall/.test(s))continue;
 const wrapper=new THREE.Group();wrapper.name='forge_fixture_'+r.id;group.add(wrapper);
 const grand=/ballroom|grand|entrance|parlor|gallery|dining|banquet|chapel/.test(s);
 const haunted=/crypt|vault|dungeon|laboratory|alchem|cellar|archive/.test(s);
 if(grand||w*d>35)chandelier(wrapper,ox+w/2,oz+d/2,fy+h-.12,grand?.65:.43);
 else if(haunted){candelabrum(wrapper,ox+.40,fy+.65,oz+.40);if(w>4.1)sconce(wrapper,ox+.10,fy+1.72,oz+d/2,1)}
 else {sconce(wrapper,ox+.10,fy+1.8,oz+d*.30,1);if(w>4.8)sconce(wrapper,ox+w-.10,fy+1.8,oz+d*.7,-1)}
 if(/drawing room|parlor|hearth|lounge/.test(s)&&w>4.5)fireplace(wrapper,ox+w/2,fy,oz+.15);
 count++;
 }return count}
 function flamePositions(roomId,max=8){const wrapper=group.getObjectByName('forge_fixture_'+roomId);if(!wrapper||!group.visible)return [];wrapper.updateWorldMatrix(true,true);const points=[];wrapper.traverse(o=>{if(o.userData?.forgeFlameTip&&points.length<max){const v=o.getWorldPosition(new THREE.Vector3());points.push({x:v.x,y:v.y+.05,z:v.z});}});return points;}
 function setVisible(v){group.visible=!!v}
 return {populate,setVisible,flamePositions,group,get count(){return count}};
}
