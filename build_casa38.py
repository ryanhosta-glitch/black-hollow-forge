#!/usr/bin/env python3
"""Generate / check CASA archives from an existing Forge compiled house; standard library only."""
import argparse, hashlib, json, pathlib, re, sys, zipfile
ROOT=pathlib.Path(__file__).resolve().parent
REQUIRED=['manifest.json','casa_identity.json','casa_validation.json','source.haunt','exterior/street_preview.glb','navigation/collision.json','navigation/runtime_bridge.json']
def slugify(s):
 import unicodedata
 s=unicodedata.normalize('NFKD',s.lower());s=''.join(c for c in s if not unicodedata.combining(c));return re.sub(r'^-+|-+$','',re.sub('[^a-z0-9]+','-',s)) or 'unnamed-house'
def jbytes(o):return (json.dumps(o,indent=2,ensure_ascii=False)+'\n').encode()
def glbcheck(data):return len(data)>=20 and data[:4]==b'glTF' and int.from_bytes(data[4:8],'little')==2 and int.from_bytes(data[8:12],'little')==len(data)
def verify(entries):
 issues=[]
 for r in REQUIRED:
  if r not in entries:issues.append('MISSING '+r)
 if issues:return issues
 try:
  m=json.loads(entries['manifest.json']);ident=json.loads(entries['casa_identity.json']);v=json.loads(entries['casa_validation.json']);src=json.loads(entries['source.haunt'])
 except Exception as e:return ['JSON_PARSE '+str(e)]
 c=m.get('casa',{})
 if c.get('spec')!='black-hollow-casa' or c.get('specVersion')!='1.0':issues.append('BAD_SPEC')
 if not ident.get('name','').strip() or m.get('name')!=ident.get('name') or ident.get('street',{}).get('mailboxName')!=ident.get('name'):issues.append('NAME_MISMATCH')
 if c.get('houseId')!=ident.get('houseId') or not ident.get('houseId'):issues.append('ID_MISMATCH')
 if c.get('slug')!=ident.get('slug'):issues.append('SLUG_MISMATCH')
 if c.get('creator')!=ident.get('architect') or c.get('description')!=ident.get('description'):issues.append('METADATA_MISMATCH')
 if not m.get('entry',{}).get('roomId') or not m.get('entry',{}).get('openingId'):issues.append('MISSING_ENTRY')
 if not m.get('floors'):issues.append('NO_FLOORS')
 if v.get('gameReady') is True and c.get('gameplayCertified') is not True:issues.append('CERTIFICATION_MISMATCH')
 for path,d in entries.items():
  if path.endswith('.glb') and not glbcheck(d):issues.append('BAD_GLB '+path)
 for path,meta in v.get('entries',{}).items():
  if path in ('manifest.json','casa_identity.json','casa_validation.json'):continue
  if path not in entries:issues.append('HASH_FILE_MISSING '+path);continue
  if hashlib.sha256(entries[path]).hexdigest()!=meta.get('sha256') or len(entries[path])!=meta.get('bytes'):issues.append('HASH_MISMATCH '+path)
 return issues
def build(directory,name=None,architect=None,description=None,output=None):
 d=pathlib.Path(directory);lst=json.loads((d/'casa_files.json').read_text());entries={p:(d/p).read_bytes() for p in lst}
 m=json.loads(entries['manifest.json']);i=json.loads(entries['casa_identity.json']);v=json.loads(entries['casa_validation.json'])
 i['name']=(name or i['name']).strip();i['architect']=i['architect'] if architect is None else architect;i['description']=i['description'] if description is None else description;i['slug']=slugify(i['name']);i.setdefault('street',{})['mailboxName']=i['name'];i['street']['preview']='exterior/street_preview.glb'
 m['name']=i['name'];m['casa'].update({'houseId':i['houseId'],'slug':i['slug'],'creator':i['architect'],'description':i['description'],'gameplayCertified':False})
 entries['manifest.json']=jbytes(m);entries['casa_identity.json']=jbytes(i)
 v['packagingStatus']='QA_PACKAGE';v['gameReady']=False
 v['entries']={p:{'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()} for p,data in sorted(entries.items()) if p not in ('manifest.json','casa_identity.json','casa_validation.json')}
 v['files']=len(entries);entries['casa_validation.json']=jbytes(v)
 errors=verify(entries)
 if errors:raise ValueError('CASA verification failed: '+', '.join(errors))
 dest=pathlib.Path(output) if output else ROOT/(i['slug']+'_QA.casa')
 with zipfile.ZipFile(dest,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
  for p,data in sorted(entries.items()):z.writestr(p,data)
 return dest,entries

def check(path):
 with zipfile.ZipFile(path) as z:
  files=z.namelist();bad=z.testzip();errors=verify({p:z.read(p) for p in files if not p.endswith('/')});
  if bad:errors.append('ZIP_CRC '+bad)
  if len(files)!=len(set(files)):errors.append('DUPLICATE_ZIP_ENTRIES')
  return errors
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--verify');p.add_argument('--house',default=str(ROOT/'houses/ferres-estate'));p.add_argument('--name');p.add_argument('--architect');p.add_argument('--description');p.add_argument('--output');a=p.parse_args()
 if a.verify:err=check(a.verify);print('PASS' if not err else 'FAIL: '+'; '.join(err));sys.exit(bool(err))
 path,entries=build(a.house,a.name,a.architect,a.description,a.output);print('CREATED',path, 'files:',len(entries),'validation:',check(path))
