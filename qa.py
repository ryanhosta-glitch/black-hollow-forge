"""Offline pack validation: checks files, scene readability, and navigation reachability."""
import json,sys,collections
from pathlib import Path
import trimesh

def check(pack):
 root=Path(pack);m=json.loads((root/'manifest.json').read_text());nav=json.loads((root/m['navigation']).read_text());magic=json.loads((root/m['magic']).read_text());issues=[];models={}
 files=[(x['model'],x['name']) for x in m['floors']]+[(m['roof'],'roof')]+[(x,k) for k,x in m['specialRooms'].items()]
 for path,label in files:
  f=root/path
  if not f.exists():issues.append({'severity':'error','description':f'Missing {path}'});continue
  try:
   sc=trimesh.load(f,force='scene');bounds=sc.bounds.tolist() if sc.bounds is not None else None
   if not len(sc.geometry):issues.append({'severity':'error','description':f'{path} has no geometry'})
   models[label]={'sizeKB':round(f.stat().st_size/1024,1),'meshes':len(sc.geometry),'triangles':sum(len(g.faces) for g in sc.geometry.values()),'bounds':bounds}
  except Exception as e:issues.append({'severity':'error','description':f'Unopened {path}: {e}'})
 rooms={r['id'] for r in nav['rooms']}
 adj=collections.defaultdict(set)
 for c in magic['connections']:
  if c['a'] not in rooms or c['b'] not in rooms:issues.append({'severity':'error','description':'Connection refers to missing room'})
  adj[c['a']].add(c['b']);adj[c['b']].add(c['a'])
 start=magic['entryRoomId'];seen=set();stack=[start]
 while stack:
  i=stack.pop()
  if i in seen:continue
  seen.add(i);stack.extend(adj[i]-seen)
 unreachable=rooms-seen
 if unreachable:issues.append({'severity':'error','description':f'{len(unreachable)} unreachable rooms: {sorted(unreachable)}'})
 for r in nav['rooms']:
  d=r['boundsFeet']
  if d['l']<=0 or d['w']<=0 or d['h']<=0:issues.append({'severity':'error','description':r['name']+' has nonpositive dimensions'})
 if m.get('roofBuild',{}).get('limits'):issues.append({'severity':'warning','description':m['roofBuild']['limits']})
 issues += [{'severity':'warning','description':'Special models are static blockouts; not wired into v8.5.19 gameplay or collisions.'}]
 report={'version':'forge-0.6','status':'pass' if not any(x['severity']=='error' for x in issues) else 'fail','estate':m['name'],'rooms':len(rooms),'floors':len(m['floors']),'routes':len(magic['connections']),'spectralRepairs':len(magic['repairs']),'reachableRooms':len(seen),'unreachableRoomIds':sorted(unreachable),'models':models,'issues':issues,'limitations':['Static prototype GLBs, not screenshot-verified in browser','Blueprint finishes are geometry/color approximations, not exact game materials','Normal doors remain open for navigation; player physics integration pending','Actual roof valleys/recessed wings not yet modeled']}
 (root/'quality_report.json').write_text(json.dumps(report,indent=2));print(json.dumps({k:report[k] for k in ('status','rooms','floors','routes','spectralRepairs','reachableRooms','issues')},indent=2));return report
if __name__=='__main__':
 if check(sys.argv[1])['status']!='pass':sys.exit(1)
