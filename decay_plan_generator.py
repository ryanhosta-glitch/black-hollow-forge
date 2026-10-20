from pathlib import Path
import hashlib,json,random,zipfile,html
root=Path(__file__).resolve().parent
p=root/'houses/ferres-estate/navigation/room_identity_v2.json'; source=root/'houses/ferres-estate/source.haunt'; doc=json.loads(p.read_text());assert hashlib.sha256(source.read_bytes()).hexdigest()==doc['sourceHauntSha256']
profiles={'burial':(0.94,'cold, mineral-rich dampness'),'laboratory':(0.62,'localized chemical wear'),'conservatory':(0.78,'humidity, growth and oxidization'),'nursery':(0.69,'dust and fabric fading'),'library':(0.45,'gentle fading and settled dust'),'ballroom':(0.28,'polished grandeur with neglected edges'),'kitchen':(0.59,'smoke, grease and moisture'),'corridor':(0.57,'foot traffic and uneven upkeep'),'cellar':(0.86,'rising damp and mineral stains'),'bedroom':(0.45,'sun-faded fabric and tarnish')}
styles={'stone':['moss in joints','mineral efflorescence','hairline cracks'],'wood':['rubbed varnish','fine scratches','darkened grain'],'brass':['tarnish around recesses','green oxidation at edges'],'plaster':['hairline plaster fissures','peeling finish'],'glass':['streaks and grime','soft cloudy patches'],'fabric':['faded patches','thin dust accumulation']}
plan={'schema':'black-hollow.decay-plan.v1','sourceHauntSha256':doc['sourceHauntSha256'],'generationPolicy':'Deterministic per room; treatment metadata only; student materials and geometry unchanged','rooms':[],'limitations':['No mesh damage, collision changes or baked textures','Authored finishes supersede recommendations','Effects require verified surface mapping before production use']}
for room in doc['rooms']:
 key=room['roomId'];pro=room.get('profile','generic');nm=room['roomName'].lower();base,note=profiles.get(pro,(0.56,'variable neglect'))
 for word,val in [('crypt',.94),('conservatory',.82),('ballroom',.25),('nursery',.72),('cellar',.87),('library',.42),('laboratory',.68),('gallery',.43),('grand hall',.3)]:
  if word in nm: base=val;break
 seed=int(hashlib.sha256((doc['sourceHauntSha256']+key).encode()).hexdigest()[:12],16); rng=random.Random(seed)
 intensity=round(max(.08,min(.98,base+rng.uniform(-.12,.12))),3)
 selected=[]
 for mat,ops in styles.items():
  n=2 if intensity>.68 else 1
  selected.append({'material':mat,'treatments':rng.sample(ops,min(n,len(ops))),'strength':round(intensity * (.5+rng.random()*.45),3),'coverage':'edges-and-recesses; leave readable surfaces intact'})
 plan['rooms'].append({'roomId':key,'roomName':room['roomName'],'floor':room['floor'],'profile':pro,'theme':room['visualIdentity']['agingTheme'],'decayIntensity':intensity,'condition':('preserved' if intensity<.35 else 'neglected' if intensity<.7 else 'derelict'),'notes':note,'seed':seed,'materialTreatments':selected,'studentAuthoredGeometryPreserved':True,'gameplayCollisionCertified':False})
out=root/'houses/ferres-estate/navigation/century_of_decay.json';out.write_text(json.dumps(plan,indent=2,ensure_ascii=False)+'\n')
