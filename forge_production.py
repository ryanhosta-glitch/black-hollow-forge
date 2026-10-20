#!/usr/bin/env python3
"""Non-destructive Black Hollow Forge production orchestrator.
Usage:
  python forge_production.py houses/ferres-estate/source.haunt --reuse houses/ferres-estate --out builds/ferres --zip builds/ferres.zip
  python forge_production.py student.haunt --out builds/student --zip builds/student.zip
Requires trimesh/numpy to compile fresh geometry. Extra authored .haunt fields are preserved.
"""
import argparse,hashlib,json,shutil,sys,zipfile,subprocess,traceback
from pathlib import Path
ROOT=Path(__file__).resolve().parent
VALIDATION_FILES={'geometry':'manifest.json','navigation':'navigation/collision.json','magic':'navigation/magic.json','integrity':'navigation/integrity.json','doorWindow':'navigation/door_window_workshop.json'}
OPTIONAL={ 'roomIdentity':'navigation/room_identity_v2.json','furnitureLibrary':'navigation/furniture_library.json','discoveries':'navigation/searchable_discoveries.json','decay':'navigation/century_of_decay.json','repair':'blueprint_repair_report.json','placement':'navigation/interactive_placement_audit.json'}

def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def load(p):return json.loads(Path(p).read_text(encoding='utf8'))
def package(folder,dest):
 dest=Path(dest).resolve();dest.parent.mkdir(parents=True,exist_ok=True)
 with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED,compresslevel=7) as z:
  for p in sorted(folder.rglob('*')):
   if p.is_file():z.write(p,p.relative_to(folder).as_posix())
 with zipfile.ZipFile(dest) as z:assert z.testzip() is None
 return dest

def run(source,out,reuse=None):
 source=Path(source).resolve();out=Path(out).resolve();errors=[];warnings=[];checks=[]
 if not source.is_file():raise FileNotFoundError(source)
 data=load(source)
 if not isinstance(data,dict) or not isinstance(data.get('floors'),list) or not data['floors']:raise ValueError('No valid floors in source .haunt')
 if out.exists():
  if out==source.parent or source.is_relative_to(out):raise ValueError('Output overlaps source tree')
  shutil.rmtree(out)
 out.mkdir(parents=True)
 source_hash=sha(source)
 if reuse:
  reuse=Path(reuse).resolve(); old=load(reuse/'manifest.json')
  if old.get('sourceSha256')!=source_hash:raise ValueError('Refusing reuse: source SHA does not match compiled estate')
  shutil.copytree(reuse,out,dirs_exist_ok=True)
  mode='validated-existing-compile'
 else:
  from forge import main
  main(str(source),str(out))
  mode='fresh-geometry-compile'
 shutil.copy2(source,out/'source.haunt')
 manifest=load(out/'manifest.json')
 if manifest.get('sourceSha256')!=source_hash:errors.append('Compiled manifest fingerprint mismatch')
 if sha(out/'source.haunt')!=source_hash:errors.append('Copied source is not byte-identical')
 refs=[]
 for floor in manifest.get('floors',[]):refs.append(('floor model',floor.get('model')))
 for field in ('roof','navigation','magic','integrity','forgeWindowEnhancements','doorWindowWorkshop'):
  if manifest.get(field):refs.append((field,manifest[field]))
 for k,v in manifest.get('specialRooms',{}).items():refs.append((k,v))
 for label,relative in refs:
  if not relative or Path(relative).is_absolute() or '..' in Path(relative).parts:errors.append('Unsafe or missing path '+str(relative));continue
  p=out/relative
  if not p.is_file() or p.stat().st_size==0:errors.append('Missing or empty '+label+': '+relative)
  elif p.suffix.lower()=='.glb' and p.read_bytes()[:4]!=b'glTF':errors.append('Invalid GLB header: '+relative)
 checks.append({'name':'manifest-and-model-references','passed':not errors,'details':len(refs)})
 for name,relative in OPTIONAL.items():
  p=out/relative
  if p.exists():
   try:
    obj=load(p)
    if not isinstance(obj,(dict,list)):raise ValueError('Expected JSON object/array')
    checks.append({'name':name,'passed':True,'source':'export-present'})
   except Exception as e:errors.append(f'{name}: invalid JSON ({e})')
  else:
   warnings.append(f'{name}: not generated for this blueprint; optional enhancement absent')
   checks.append({'name':name,'passed':False,'source':'not-generated'})
 rooms=[r for fl in data['floors'] for r in fl.get('rooms',[])]
 try:
  nav=load(out/'navigation/collision.json');compiled={r.get('id') for r in nav.get('rooms',[])}
  authored={r.get('id') for r in rooms}
  if compiled!=authored:errors.append('Navigation room IDs do not equal authored room IDs')
 except Exception as e:errors.append('Navigation contract invalid: '+str(e))
 # Presence and basic data checks do not constitute game QA.
 uncertified=['No live browser/WebGL screenshot verified','No player collision or walking route certification','No guaranteed staircase connection, landing or headroom clearance','Door/furniture animations not verified inside original Black Hollow runtime','No complete quest, inventory, elevator or Floor 13 end-to-end game test']
 report={'schema':'black-hollow.production.v1','sourceFilename':source.name,'sourceSha256':source_hash,'generationMode':mode,'estateId':manifest.get('id'),'roomCount':len(rooms),'floorCount':len(data['floors']),'compiled':not errors,'certifiedPlayable':False,'releaseStatus':'BLOCKED' if errors else 'COMPILED_NOT_PLAYABLE_CERTIFIED','errors':errors,'warnings':warnings,'checks':checks,'gameplayBlockers':uncertified,'sourceHauntModified':False,'outputContract':{'manifest':'manifest.json','models':[f.get('model') for f in manifest.get('floors',[])],'nav':'navigation/collision.json','inspection':'production_report.json'}}
 (out/'production_report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
 (out/'PRODUCTION_STATUS.md').write_text('# Black Hollow Forge production result\n\n**'+report['releaseStatus']+'**\n\nSource SHA-256: `'+source_hash+'`\n\nCompiled successfully: '+str(report['compiled'])+'\n\nCertified playable: **NO**\n\nPending: '+'; '.join(uncertified)+'\n\nThe original source `.haunt` was copied byte-for-byte. Compile output does not edit the original.\n',encoding='utf8')
 return report

def main():
 a=argparse.ArgumentParser(description=__doc__)
 a.add_argument('source',help='Original student .haunt')
 a.add_argument('--out',default='builds/mansion',help='Directory for production output')
 a.add_argument('--reuse',help='Reuse compiled estate only if its source SHA matches; useful for existing estate extras')
 a.add_argument('--zip',dest='zip_path',help='Pack generated house for GitHub/game import')
 args=a.parse_args()
 try:
  report=run(args.source,args.out,args.reuse)
  if args.zip_path and report['compiled']:
   dest=package(Path(args.out).resolve(),args.zip_path);print('ZIP',dest)
  print(json.dumps({'status':report['releaseStatus'],'rooms':report['roomCount'],'floors':report['floorCount'],'errors':report['errors'],'warnings':len(report['warnings'])},indent=2))
  return 0 if report['compiled'] else 2
 except Exception as e:
  print('PRODUCTION FAILED:',e,file=sys.stderr);return 2
if __name__=='__main__':sys.exit(main())
