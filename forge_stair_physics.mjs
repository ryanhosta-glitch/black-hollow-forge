// Black Hollow Forge — Stair Collision Laboratory. SI units; foot-position player state.
// Independent calibration surfaces, NOT permission to modify student stair geometry.
export const PLAYER={radius:0.32,height:1.74,stepUp:0.23,stepDown:0.32,slopeLimit:0.65,gravity:9.81,speed:2};
export function calibrationCourse(){
 const rise=0.18,run=0.32,count=12,width=1.6;
 const steps=Array.from({length:count},(_,i)=>({id:`tread-${i+1}`,x0:i*run,x1:(i+1)*run,z0:-width/2,z1:width/2,y:(i+1)*rise}));
 return {steps,rise,run,count,width,landing:{x0:count*run,x1:count*run+1.8,z0:-width/2,z1:width/2,y:count*rise},floor:{x0:-2,x1:0,z0:-2,z1:2,y:0},headroomBeams:[],connections:{start:[0,0,0],end:[count*run+0.6,count*rise,0]}};
}
function within(x,z,s,r=PLAYER.radius){return x>=s.x0+r-1e-6&&x<=s.x1-r+1e-6&&z>=s.z0+r-1e-6&&z<=s.z1-r+1e-6;}
export function supportAt(x,z,course,r=PLAYER.radius){
 let support=-Infinity,id=null;
 for(const s of [course.floor,...course.steps,course.landing])if(x>=s.x0-1e-6&&x<s.x1-1e-6&&z>=s.z0+r&&z<=s.z1-r&&s.y>support){support=s.y;id=s.id|| (s===course.floor?'ground':'landing');}
 return Number.isFinite(support)?{y:support,id}:null;
}
export function clearanceAt(x,z,feet,course,height=PLAYER.height,r=PLAYER.radius){
 for(const b of course.headroomBeams||[])if(x+r>b.x0&&x-r<b.x1&&z+r>b.z0&&z-r<b.z1&&feet+height>b.bottom-1e-6)return {clear:false,beam:b,available:b.bottom-feet};
 return {clear:true,available:Infinity};
}
export function stepMotion(state,dx,dz,course,opts={}){
 const p={...PLAYER,...opts};let s={...state},reasons=[];
 const segments=Math.max(1,Math.ceil(Math.hypot(dx,dz)/0.035));
 for(let i=0;i<segments;i++){
  const x=s.x+dx/segments,z=s.z+dz/segments;const floor=supportAt(x,z,course,p.radius);
  if(!floor){reasons.push('NO_SUPPORT');continue;}
  const delta=floor.y-s.y;
  if(delta>p.stepUp+1e-6){reasons.push('STEP_TOO_HIGH');continue;}
  if(delta< -p.stepDown-1e-6){reasons.push('DROP_TOO_DEEP');continue;}
  if(!clearanceAt(x,z,floor.y,course,p.height,p.radius).clear){reasons.push('LOW_HEADROOM');continue;}
  s={...s,x,z,y:floor.y,support:floor.id};
 }
 return {...s,blocked:reasons.length>0,reasons:[...new Set(reasons)]};
}
export function validateStairCourse(course=calibrationCourse(),opts={}){
 const results=[];let s={x:-.6,z:0,y:0};
 // Stop at every tread midpoint, then at landing interior.
 for(let i=0;i<course.count;i++){
  const target=(i+.5)*course.run;
  const r=stepMotion(s,target-s.x,0,course,opts);results.push({direction:'up',tread:i+1,passed:!r.blocked&&Math.abs(r.y-(i+1)*course.rise)<1e-5,reason:r.reasons});s=r;
 }
 let r=stepMotion(s,course.landing.x0+.65-s.x,0,course,opts);
 results.push({direction:'landing',passed:!r.blocked&&Math.abs(r.y-course.landing.y)<1e-5,reason:r.reasons});s=r;
 for(let i=course.count-1;i>=0;i--){
  const target=(i+.5)*course.run;r=stepMotion(s,target-s.x,0,course,opts);
  results.push({direction:'down',tread:i+1,passed:!r.blocked&&Math.abs(r.y-(i+1)*course.rise)<1e-5,reason:r.reasons});s=r;
 }
 r=stepMotion(s,-.6-s.x,0,course,opts);results.push({direction:'ground',passed:!r.blocked&&Math.abs(r.y)<1e-5,reason:r.reasons});
 return {passes:results.filter(x=>x.passed).length,total:results.length,certified:results.every(x=>x.passed),results};
}
