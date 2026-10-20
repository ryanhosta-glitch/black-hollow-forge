import pathlib, shutil, json, math, hashlib, zipfile, subprocess, html
src=pathlib.Path('/mnt/data/Black_Hollow_Forge_Pass_7_Blueprint_Repair'); dst=pathlib.Path('/mnt/data/Black_Hollow_Forge_Pass_8_Interactive_Placement')
if dst.exists(): shutil.rmtree(dst)
shutil.copytree(src,dst)
nav=dst/'houses/ferres-estate/navigation'
lib=json.loads((nav/'furniture_library.json').read_text()); plans=json.loads((nav/'furnishing_plan.json').read_text()); dw=json.loads((nav/'door_window_workshop.json').read_text()); collision=json.loads((nav/'collision.json').read_text())
rooms={r['id']:r for r in collision['rooms']}
lookup={a['id']:a for a in lib['assets']}
# Only local room placement geometry is used for within-room calculations.
# Conservative 2D envelopes; rotation/direction not known, so not certification.
def overlap(a,b):
 dx=max(0,min(a[2],b[2])-max(a[0],b[0])); dz=max(0,min(a[3],b[3])-max(a[1],b[1]));return round(dx*dz,4)
def rect(x,z,w,d):return [round(x-w/2,3),round(z-d/2,3),round(x+w/2,3),round(z+d/2,3)]
byroom={}; records=[]; issues=[]
for room in plans['rooms']:
 rid=room['id']; bb=rooms[rid]['boundsFeet']; x0=bb['x']*.3048; z0=bb['y']*.3048; xmax=x0+bb['l']*.3048; zmax=z0+bb['w']*.3048
 byroom[rid]=[]
 for i,p in enumerate(room.get('placements',[])):
  aid=f'{rid}-furn-{i}'; a=lookup.get(aid,{})
  x=float(p['x']);z=float(p['z']);w=float(p['width']);d=float(p['depth']); base=rect(x,z,w,d)
  actions=a.get('actions',[]); typ='none'; ext=None
  if any('drawer' in v or 'open' in v for v in actions) or any(k in p['name'] for k in ('desk','chest','cabinet','wardrobe','cupboard','hutch')):
   typ='open';ext=rect(x,z+d/2+0.38,w,0.76)
  if a.get('sittable') or any(k in p['name'] for k in ('chair','sofa','stool','bench')):
   typ='sit';ext=rect(x,z+d/2+0.38,w,0.76)
  boundary=min(x-base[0],xmax-base[2],z-base[1],zmax-base[3]); inside=base[0]>=x0 and base[2]<=xmax and base[1]>=z0 and base[3]<=zmax
  rec={'id':aid,'roomId':rid,'floor':room['floor'],'name':p['name'],'boundsMeters':base,'interactionEnvelopeMeters':ext,'interactionKind':typ,'boundaryInsideRoom':inside,'clearanceMeters':round(boundary,3),'warnings':[],'verifiedGameplay':False}
  if not inside: rec['warnings'].append('FOOTPRINT_OUTSIDE_ROOM')
  if ext and not (ext[0]>=x0 and ext[2]<=xmax and ext[1]>=z0 and ext[3]<=zmax): rec['warnings'].append('INTERACTION_EXITS_ROOM')
  byroom[rid].append(rec);records.append(rec)
for rid,objs in byroom.items():
 for i,a in enumerate(objs):
  for b in objs[i+1:]:
   if overlap(a['boundsMeters'],b['boundsMeters'])>0.005:
    a['warnings'].append('FURNITURE_OVERLAP:'+b['id']);b['warnings'].append('FURNITURE_OVERLAP:'+a['id'])
   if a['interactionEnvelopeMeters'] and overlap(a['interactionEnvelopeMeters'],b['boundsMeters'])>0.005:a['warnings'].append('INTERACTION_BLOCKED_BY:'+b['id'])
   if b['interactionEnvelopeMeters'] and overlap(b['interactionEnvelopeMeters'],a['boundsMeters'])>0.005:b['warnings'].append('INTERACTION_BLOCKED_BY:'+a['id'])
# Door positions are world coordinates. A hinge sweep is a conservative circle around the hinge.
doors=[]
for d in dw['interactiveComponents']:
 if d['kind']!='hinged-door':continue
 h=d['hingeMeters'];rad=float(d['leafWidthMeters']); door={'id':d['id'],'roomId':d['roomId'],'floor':d['floor'],'hingeMeters':h,'leafWidthMeters':rad,'swingEnvelopeMeters':rect(h[0],h[2],rad*2,rad*2),'nearbyFurnitureIds':[],'swingCollisionCertified':False}
 for item in byroom.get(d['roomId'],[]):
  bb=item['boundsMeters']; cx=max(bb[0],min(h[0],bb[2]));cz=max(bb[1],min(h[2],bb[3]));
  if math.hypot(cx-h[0],cz-h[2])<rad+0.12:
   door['nearbyFurnitureIds'].append(item['id']);item['warnings'].append('POSSIBLE_DOOR_SWING:'+d['id'])
 doors.append(door)
for item in records:
 item['warnings']=sorted(set(item['warnings']))
 for w in item['warnings']:issues.append({'objectId':item['id'],'roomId':item['roomId'],'code':w,'severity':'review-required','recommendation':'Inspect orientation and clearance in the rendered estate; adjust only generated furnishing placement, never source blueprint.'})
for d in doors:
 if d['nearbyFurnitureIds']:issues.append({'objectId':d['id'],'roomId':d['roomId'],'code':'DOOR_SWING_NEAR_FURNITURE','severity':'review-required','recommendation':'Inspect hinge side, swing side and floor clearance; approximate radial envelope is not a swept collision test.'})
report={'schema':'black-hollow.interactive-placement.v1','sourceSha256':hashlib.sha256((dst/'houses/ferres-estate/source.haunt').read_bytes()).hexdigest(),'method':'static-conservative-2d-envelope','units':'meters','assumptions':['Existing furnishing placements are proposals and may lack rotation/orientation.','Door swing tested with conservative hinge-radius circle rather than exact swept arc.','Room x/y are treated as global horizontal x/z in feet, according to collision manifest.','Player body, walkable corridors, drawers under furniture, furniture rotations and freebody collision are NOT certified.'],'furnitureCount':len(records),'doorCount':len(doors),'warningCount':len(issues),'furniture':records,'doors':doors,'issues':issues,'certifiedPlayable':False,'authoredBlueprintModified':False}
(nav/'interactive_placement_audit.json').write_text(json.dumps(report,indent=2))
(dst/'interactive_placement_intelligence.py').write_text('''"""Pass 8 audit data lives in houses/<estate>/navigation/interactive_placement_audit.json.
The build script for this checkpoint is included as pass_8_build_source.py.
Do not infer gameplay certification from static 2D envelopes."""\n''')
shutil.copy2('/mnt/data/build_pass8.py',dst/'pass_8_build_source.py')
rows=json.dumps(report,ensure_ascii=False).replace('</','<\\/')
page='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Black Hollow — Interactive Placement Audit</title><style>body{margin:0;background:#14111c;color:#f6e9d6;font:16px/1.45 system-ui,sans-serif}header{padding:18px;background:#25172d;position:sticky;top:0;z-index:2}h1{font:28px Georgia;margin:0}main{max-width:1050px;margin:auto;padding:18px}.controls{display:flex;gap:9px;flex-wrap:wrap;margin:15px 0}select,input,button{background:#2e2635;color:#fff2e2;border:1px solid #927a90;border-radius:8px;padding:10px;font-size:15px}input{flex:1;min-width:180px}.layout{display:grid;grid-template-columns:1fr 1fr;gap:16px}.panel{border:1px solid #685c68;border-radius:12px;background:#211b28;padding:15px}canvas{width:100%;background:#161720;border-radius:8px}li{margin:8px 0}small{color:#decab5}.warning{color:#ffc87a}a{color:#edbedd}@media(max-width:700px){.layout{grid-template-columns:1fr}}</style></head><body><header><h1>Interactive Placement Intelligence</h1><small>Pass 8 · Conservative geometry warnings, not gameplay certification</small></header><main><p>Room outlines and furniture envelopes are derived from Forge placement records. Amber extensions are projected interaction clearances, red markers identify static issues. Tap a furniture entry to highlight it.</p><div class="controls"><select id="room"></select><input id="search" type="search" placeholder="Find a furnishing or warning"><button id="export">Download JSON</button></div><div id="counts"></div><div class="layout"><section class="panel"><canvas id="map" width="640" height="440"></canvas><p><small>Outline: room · Brown: furniture footprint · Amber: proposed use space</small></p></section><section class="panel"><h2>Furnishings &amp; warnings</h2><div id="results"></div></section></div><h2>Validation limitations</h2><ul><li>Not verified: furniture orientation, walking corridors, stairs, collision, blocked exits or game interactions.</li><li>Door swing uses a conservative radius, not a directional physics sweep.</li><li>All original student room geometry remains unchanged.</li></ul><p><a href="index.html">← Estate Viewer</a></p></main><script id="data" type="application/json">__DATA__</script><script>const data=JSON.parse(document.getElementById('data').textContent);const room=document.querySelector('#room'),search=document.querySelector('#search'),results=document.querySelector('#results'),canvas=document.querySelector('#map'),ctx=canvas.getContext('2d');let chosen='';const byRoom=[...new Set(data.furniture.map(x=>x.roomId))];byRoom.forEach(id=>{const o=document.createElement('option');o.value=id;o.textContent=id;room.append(o)});function render(){const id=room.value;const items=data.furniture.filter(x=>x.roomId===id);const doors=data.doors.filter(x=>x.roomId===id);const boxes=items.map(x=>x.boundsMeters).concat(doors.map(d=>d.swingEnvelopeMeters));if(!boxes.length)return;const x0=Math.min(...boxes.map(b=>b[0]))-1,z0=Math.min(...boxes.map(b=>b[1]))-1,x1=Math.max(...boxes.map(b=>b[2]))+1,z1=Math.max(...boxes.map(b=>b[3]))+1;const sc=Math.min(580/(x1-x0),380/(z1-z0));function draw(b,color,fill){ctx.strokeStyle=color;ctx.fillStyle=fill;ctx.lineWidth=2;const x=30+(b[0]-x0)*sc,y=25+(b[1]-z0)*sc,w=(b[2]-b[0])*sc,h=(b[3]-b[1])*sc;ctx.fillRect(x,y,w,h);ctx.strokeRect(x,y,w,h)}ctx.clearRect(0,0,640,440);doors.forEach(d=>draw(d.swingEnvelopeMeters,'#8f8db9','#38334b'));items.forEach(o=>{if(o.interactionEnvelopeMeters)draw(o.interactionEnvelopeMeters,'#c99845','#57442950')});items.forEach(o=>draw(o.boundsMeters,o.id===chosen?'#ffffff':o.warnings.length?'#ff7777':'#a47a50','#684d39'));const q=search.value.toLowerCase();results.replaceChildren();items.filter(o=>(o.name+' '+o.id+' '+o.warnings.join(' ')).toLowerCase().includes(q)).forEach(o=>{const b=document.createElement('button');b.style.cssText='display:block;width:100%;margin:9px 0;text-align:left';b.textContent=o.name+' — '+o.interactionKind+(o.warnings.length?' ⚠ '+o.warnings.length:'');b.onclick=()=>{chosen=o.id;render()};results.append(b);if(chosen===o.id){const p=document.createElement('p');p.className='warning';p.textContent=o.warnings.join(' · ')||'No flagged overlaps in static approximations (NOT collision certified).';results.append(p)}});counts.textContent=data.furnitureCount+' placements · '+data.doorCount+' door hinges · '+data.warningCount+' static findings (not independent certified collisions)'}room.onchange=render;search.oninput=render;document.querySelector('#export').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download='interactive_placement_audit.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),3000)};render();</script></body></html>'''.replace('__DATA__',rows)
(dst/'interactive_placement.html').write_text(page)
# Add easy link without modifying complex estate JS
index=dst/'index.html'; s=index.read_text();needle='</body>';s=s.replace(needle,'<div style="position:fixed;bottom:10px;left:10px;z-index:99999"><a href="interactive_placement.html" style="display:block;background:#302039;color:#ffe8bc;border:1px solid #d5a971;border-radius:10px;padding:9px 12px;font:14px system-ui">Pass 8: Placement Audit</a></div>\n'+needle);index.write_text(s)
(dst/'PASS_8_INTERACTIVE_PLACEMENT.md').write_text(f'''# Pass 8: Interactive Placement Intelligence\n\nStatic conservative audit of {len(records)} proposed furnishings and {len(doors)} hinged door definitions.\n\nFound {len(issues)} warning entries. They are **review flags**, not proven collisions.\n\nOpen `interactive_placement.html` for mobile-friendly per-room visualization; machine-readable data is `houses/ferres-estate/navigation/interactive_placement_audit.json`.\n\n**Limits**: approximate opening and sitting envelope assumed toward +Z when furniture rotation is unspecified; direction may be incorrect. Door swing represented by a conservative full radius. No pathfinding, player collision, stair certification, or geometry repositioning. Student `.haunt` source preserved.\n''')
road=dst/'NINE_PASS_ROADMAP.md'; t=road.read_text(); t+='\n## Pass 8 checkpoint\nInteractive Placement Intelligence: furniture use-envelope and door-radius review audit; not gameplay certification. Next Pass 9: one-click production pipeline.\n';road.write_text(t)
# validate files and hashes
assert report['sourceSha256']==hashlib.sha256((src/'houses/ferres-estate/source.haunt').read_bytes()).hexdigest()
assert len(records)==len(lib['assets'])
assert all('id' in f and 'roomId' in f for f in records)
assert '<script id="data"' in page
out=pathlib.Path('/mnt/data/Black_Hollow_Forge_Pass_8_Interactive_Placement_GitHub.zip')
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=7) as z:
 for p in dst.rglob('*'):
  if p.is_file(): z.write(p,p.relative_to(dst))
with zipfile.ZipFile(out) as z: assert z.testzip() is None; n=len(z.namelist())
print(json.dumps({'zip':str(out),'files':n,'bytes':out.stat().st_size,'furniture':len(records),'doors':len(doors),'warnings':len(issues),'sourceUnchanged':True},indent=2))
