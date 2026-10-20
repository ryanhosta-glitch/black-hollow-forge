/** Universal 3D Victorian frame geometry — Black Hollow Forge 2.4.
 * Generates reusable frame meshes only. Does not hang images or alter .haunt architecture.
 * Local frame lies in XY plane, front faces +Z. Units are meters.
 */
import {FRAME_STYLE_PRESETS,FRAME_COLLECTION_POLICY,mayAutomaticallyPlaceFrames} from './black_hollow_frame_manifest_seed.js';
const palette={
 'aged-gilt':{base:0x987b3a,highlight:0xc7ac60,metalness:.72,roughness:.46},
 mahogany:{base:0x392115,highlight:0x765039,metalness:.05,roughness:.71},
 'ebonized-wood':{base:0x211a18,highlight:0x7a684b,metalness:.14,roughness:.68},
 'tarnished-brass':{base:0x76683a,highlight:0xb5a375,metalness:.79,roughness:.52}
};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function frameDimensions(styleId='mahogany_library',width=.85,height=1.12){
 const style=FRAME_STYLE_PRESETS[styleId];if(!style)throw Error('Unknown frame: '+styleId);
 if(!(width>.3&&height>.35&&width<4&&height<5))throw Error('Frame dimensions outside safe design range');
 const border=clamp(style.borderMeters,.035,Math.min(width,height)*.22);
 return {outerWidth:width,outerHeight:height,insideWidth:width-2*border,insideHeight:height-2*border,border,depth:style.depthMeters,oval:style.shape==='oval'};
}
export function buildVictorianFrame(THREE,{styleId='mahogany_library',width=.85,height=1.12,age=.25,glass=true,artTexture=null}={}){
 const s=FRAME_STYLE_PRESETS[styleId];const d=frameDimensions(styleId,width,height);
 const p=palette[s.material];const ageLevel=clamp(age,0,1);
 const mat=(color,metalness,roughness)=>new THREE.MeshStandardMaterial({color,metalness:clamp(metalness,0,1),roughness:clamp(roughness,0,1)});
 const wood=mat(p.base,p.metalness*(1-.12*ageLevel),p.roughness+.16*ageLevel);
 const gilt=mat(p.highlight,clamp(p.metalness+.06,0,1),clamp(p.roughness+.12*ageLevel,0,1));
 const black=mat(0x201918,.02,.93), matte=mat(0x877866,.01,.93);
 const group=new THREE.Group();group.name='bh-frame-'+styleId;
 const add=(geo,material,x=0,y=0,z=0,name='frame-component')=>{const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.name=name;group.add(m);return m};
 const depth=d.depth;
 // Actual rectangular frames are four side moldings, hollow in their center.
 if(!d.oval){
  const rail=(w,h,x,y,z,material,name)=>add(new THREE.BoxGeometry(w,h,depth),material,x,y,z,name);
  const b=d.border,W=width,H=height;
  rail(W,b,0,H/2-b/2,0,wood,'outer-top');rail(W,b,0,-H/2+b/2,0,wood,'outer-bottom');
  rail(b,H-2*b,-W/2+b/2,0,0,wood,'outer-left');rail(b,H-2*b,W/2-b/2,0,0,wood,'outer-right');
  const bead=Math.min(.013,b*.23);
  for(const sign of [-1,1]){
   rail(d.insideWidth,bead,0,sign*(H/2-b),depth*.58,gilt,'inner-gilt-horizontal');
   rail(bead,d.insideHeight,sign*(W/2-b),0,depth*.58,gilt,'inner-gilt-vertical');
   // outer molded edge to catch highlights
   rail(W,bead,0,sign*(H/2-.008),depth*.48,gilt,'outer-bead-horizontal');
   rail(bead,H,sign*(W/2-.008),0,depth*.48,gilt,'outer-bead-vertical');
  }
  if(s.ornament==='crest'){
   add(new THREE.SphereGeometry(width*.092,12,8),gilt,0,H/2+b*.20,depth*.18,'crest-medallion');
   for(const sign of [-1,1]){
    const fin=add(new THREE.BoxGeometry(width*.17,.026,depth*.65),gilt,sign*width*.11,H/2+.018,depth*.15,'crest-scroll');fin.rotation.z=sign*.30;
   }
  }
  if(s.ornament==='subtle-beading')for(const sign of [-1,1]){
   for(let i=0;i<5;i++)add(new THREE.SphereGeometry(.009,6,5),gilt,sign*(W/2-b/2),-H*.24+i*H*.12,depth*.55,'mahogany-bead');
  }
 } else {
  // Two nested ellipses form a true empty oval ring (not a rectangular plane masquerading as oval).
  const shape=new THREE.Shape();shape.absellipse(0,0,width/2,height/2,0,Math.PI*2,false,0);
  const hole=new THREE.Path();hole.absellipse(0,0,d.insideWidth/2,d.insideHeight/2,0,Math.PI*2,true,0);shape.holes.push(hole);
  const geo=new THREE.ExtrudeGeometry(shape,{depth,steps:1,curveSegments:64,bevelEnabled:true,bevelThickness:.008,bevelSize:.006,bevelSegments:1});
  add(geo,wood,0,0,-depth*.5,'mourning-oval-carved-ring');
  for(const scale of [.97,.81]){
   const curve=[];for(let k=0;k<=96;k++){let a=k*Math.PI*2/96;curve.push(new THREE.Vector3(Math.cos(a)*width*.5*scale,Math.sin(a)*height*.5*scale,depth*.58));}
   add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curve,true),96,.008,5,true),gilt,0,0,0,'oval-metal-beading');
  }
  add(new THREE.SphereGeometry(width*.065,12,7),gilt,0,height*.53,depth*.25,'mourning-finial');
 }
 // Deep backing and neutral monochrome placeholder. Actual photographs are provided later.
 const planeShape=()=>{
  if(!d.oval)return new THREE.PlaneGeometry(d.insideWidth*.99,d.insideHeight*.99);
  const shp=new THREE.Shape();shp.absellipse(0,0,d.insideWidth*.5,d.insideHeight*.5,0,Math.PI*2,false,0);
  return new THREE.ShapeGeometry(shp,48);
 };
 add(planeShape(),matte,0,0,-depth*.16,'unfilled-mat-board');
 const artMaterial=artTexture?new THREE.MeshStandardMaterial({map:artTexture,roughness:.95,metalness:0,side:THREE.DoubleSide}):black;
 if(artTexture&&'colorSpace'in artTexture)artTexture.colorSpace=THREE.SRGBColorSpace;
 add(planeShape(),artMaterial,0,0,depth*.12,artTexture?'art-texture':'empty-black-mat');
 if(glass){
  const gl=new THREE.MeshPhysicalMaterial({color:0xc4cbd0,metalness:0,roughness:.27+ageLevel*.09,transparent:true,opacity:.065,depthWrite:false,side:THREE.DoubleSide,clearcoat:.6,clearcoatRoughness:.24});
  add(planeShape(),gl,0,0,depth*.65,'antique-glass');
 }
 group.userData={type:'black-hollow.victorian-frame',styleId,age:ageLevel,artId:null,unplaced:true};
 return group;
}
/** Preview frames only, with fixed stage layout. This is not mansion wall placement. */
export function buildFrameShowcase(THREE,{age=.3}={}){
 const group=new THREE.Group();
 const styles=Object.keys(FRAME_STYLE_PRESETS);
 for(let i=0;i<styles.length;i++){
  const styleId=styles[i];let frame=buildVictorianFrame(THREE,{styleId,age,width:styleId==='brass_botanical'?.75:1.0,height:styleId==='mourning_oval'?1.18:1.28});
  frame.position.set((i-1.5)*1.68,1.7,0);frame.rotation.y=0;group.add(frame);
 }
 return group;
}
export const FRAME_AUTO_PLACEMENT_ENABLED=FRAME_COLLECTION_POLICY.enableAutoPlacement;
export const canDressHouse=mayAutomaticallyPlaceFrames;
