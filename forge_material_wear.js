// Reversible viewer-only wear. The student-authored mesh/blueprint is never changed.
// Each matching surface gets a deterministic, restrained PBR roughness variation.
export function createLocalizedMaterialWear(){
 const originals=new Map();let enabled=true;
 function score(name){let h=2166136261;for(const c of name){h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;}return (h%1000)/1000;}
 function apply(root){if(!root)return 0;let count=0;root.traverse(o=>{if(!o.isMesh||!o.material)return;const name=String(o.name||'').toLowerCase();if(!/trim|wood|panel|wallpaper|damask|plaster|brass|stone|parquet|marble|molding|moulding/.test(name))return;
 if(!originals.has(o)){const mats=Array.isArray(o.material)?o.material:[o.material];originals.set(o,{original:o.material,aged:mats.map((m,i)=>{const clone=m.clone();const v=score(name+':'+i);if(Number.isFinite(clone.roughness))clone.roughness=Math.min(1,Math.max(.08,clone.roughness+(.025+v*.085)));if(Number.isFinite(clone.metalness)&&/brass/.test(name))clone.metalness=Math.max(0,clone.metalness-.03*v);clone.name=(clone.name||'')+'_forge_subtle_wear';return clone;})});}
 const rec=originals.get(o);o.material=enabled?(Array.isArray(rec.original)?rec.aged:rec.aged[0]):rec.original;count++;});return count;}
 function setEnabled(v){enabled=!!v;for(const [mesh,rec] of originals)mesh.material=enabled?(Array.isArray(rec.original)?rec.aged:rec.aged[0]):rec.original;}
 function dispose(){for(const [mesh,rec] of originals){mesh.material=rec.original;rec.aged.forEach(m=>m.dispose());}originals.clear();}
 return {apply,setEnabled,dispose,get count(){return originals.size}};
}
