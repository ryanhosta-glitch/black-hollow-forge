// Viewer-only furniture craftsmanship. Does not alter source plans or collision.
export function enhanceLibraryFurniture(THREE,root){
 const wood=new THREE.MeshStandardMaterial({color:0x493027,roughness:.61,metalness:0});
 const shelfWood=new THREE.MeshStandardMaterial({color:0x654331,roughness:.56});
 const gold=new THREE.MeshStandardMaterial({color:0x967144,metalness:.65,roughness:.35});
 const ink=[0x63352e,0x273c43,0x524251,0x65553e,0x264b40,0x452d39,0x79604a].map(color=>new THREE.MeshStandardMaterial({color,roughness:.82}));
 const box=new THREE.BoxGeometry(1,1,1);let count=0;
 const make=(group,material,x,y,z,w,h,d)=>{const m=new THREE.Mesh(box,material);m.position.set(x,y,z);m.scale.set(w,h,d);group.add(m);return m;};
 root.traverse(o=>{if(!o.isMesh||!o.name.endsWith('_bookcase'))return;
   const g=o.geometry;if(!g)return;g.computeBoundingBox();const b=g.boundingBox;if(!b)return;
   // Furnishing GLBs use room-local meter coordinates. Append carved shelves without moving geometry.
   const w=b.max.x-b.min.x,h=b.max.y-b.min.y,d=b.max.z-b.min.z;
   if(w<.6||h<.7)return;
   const cx=(b.min.x+b.max.x)/2, back=b.max.z;
   const trim=new THREE.Group();trim.name=o.name+'_crafted_contents';o.parent.add(trim);
   // Dark walnut face inside the existing bookcase proxy; visible spines mounted forward of the front face.
   for(let row=0;row<3;row++){
     const yy=b.min.y+.16+(row+.5)*(h-.22)/3;
     make(trim,shelfWood,cx,yy-.16,back+.082,w*.93,.045,.17);
     const usable=w*.83,slots=Math.max(10,Math.floor(usable/.06));
     for(let j=0;j<slots;j++){
       const seed=(j*13+row*17)%29;
       const bw=usable/slots*(seed%3===0?.88:.69);
       const bh=Math.min(.35,.20+(seed%7)*.015);
       const z=back+.16+(j%5)*.001;
       const x=cx-usable/2+(j+.5)*usable/slots;
       const bk=make(trim,ink[(j+row*3)%ink.length],x,yy+.006,z,bw,bh,.085);
       if(seed%4===0){make(trim,gold,x,yy-bh*.27,z+.046,bw*.84,.007,.002)}
     }
   }
   // Carved stiles and upper cornice, preserving existing shelf envelope in horizontal dimensions.
   for(const sign of [-1,1])make(trim,wood,cx+sign*(w*.47),b.min.y+h*.53,back+.14,.09,h*.93,.16);
   make(trim,wood,cx,b.max.y-.025,back+.14,w*.99,.11,.21);
   count++;
 });return count;
}
