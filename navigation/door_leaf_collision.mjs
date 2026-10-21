// Circle against an oriented door: caller transforms the center to leaf-local space.
// Keep the same footprint while closed, moving, or fully open.
export function circleTouchesRectangle(x,z,minX,maxX,minZ,maxZ,radius){
 const cx=Math.max(minX,Math.min(maxX,x));
 const cz=Math.max(minZ,Math.min(maxZ,z));
 return (x-cx)**2+(z-cz)**2 < radius**2;
}
