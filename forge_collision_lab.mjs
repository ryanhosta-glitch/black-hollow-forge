// Black Hollow Forge: collision laboratory, prototype-only. Feet in blueprint, meters in scene.
export const FT=0.3048;
export const BODY={radius:0.32,height:1.74,eye:1.57,speed:2.0};
export function edges(rooms){
 const result=[];
 for(const r of rooms){const b=r.boundsFeet,x=b.x*FT,z=b.y*FT,L=b.l*FT,W=b.w*FT;
  for(const [side,ax,az,bx,bz,len] of [['top',x,z,x+L,z,L],['bottom',x,z+W,x+L,z+W,L],['left',x,z,x,z+W,W],['right',x+L,z,x+L,z+W,W]]){
   const openings=(r.openings||[]).filter(o=>o.wall===side&&o.type==='door').map(o=>({center:Math.max(0,Math.min(1,+o.pos||0))*len, half:0.61}));
   let ranges=[[0,len]];
   for(const o of openings){const next=[];for(const [a,b] of ranges){if(o.center-o.half>a+0.001)next.push([a,Math.min(b,o.center-o.half)]);if(o.center+o.half<b-0.001)next.push([Math.max(a,o.center+o.half),b]);}ranges=next;}
   for(const [a,b] of ranges)if(b>a+0.005){const t=a/len,u=b/len;result.push({a:[ax+(bx-ax)*t,az+(bz-az)*t],b:[ax+(bx-ax)*u,az+(bz-az)*u],room:r.id,side});}
  }
 }
 return result;
}
export function nearest(x,z,e){const dx=e.b[0]-e.a[0],dz=e.b[1]-e.a[1],den=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((x-e.a[0])*dx+(z-e.a[1])*dz)/den));return [e.a[0]+dx*t,e.a[1]+dz*t];}
export function resolve(x,z,walls,radius=BODY.radius){
 let hits=0;
 for(let iteration=0;iteration<5;iteration++){
  let changed=false;
  for(const w of walls){const p=nearest(x,z,w),dx=x-p[0],dz=z-p[1],d=Math.hypot(dx,dz);if(d<radius-1e-6){let nx=dx/(d||1),nz=dz/(d||1);if(d<1e-7){nx=w.a[1]-w.b[1];nz=w.b[0]-w.a[0];const mag=Math.hypot(nx,nz)||1;nx/=mag;nz/=mag;}x+=nx*(radius-d);z+=nz*(radius-d);changed=true;hits++;}}
  if(!changed)break;
 }
 return {x,z,hits};
}
export function move(state,dx,dz,walls){const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/0.08));let p={x:state.x,z:state.z,hits:0};for(let i=0;i<steps;i++){p=resolve(p.x+dx/steps,p.z+dz/steps,walls);}return p;}
export function validatePath(points,walls){let p={x:points[0][0],z:points[0][1]};let hits=0;for(let j=1;j<points.length;j++){const target=points[j],steps=Math.ceil(Math.hypot(target[0]-p.x,target[1]-p.z)/0.05);for(let k=0;k<steps;k++){const next=move(p,(target[0]-p.x)/(steps-k),(target[1]-p.z)/(steps-k),walls);hits+=next.hits;p=next;}}return {end:p,hits};}
