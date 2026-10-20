import json,zipfile,hashlib,io,sys
from pathlib import Path
from compile_haunt_to_casa import compile_blueprint
source=json.loads((Path(__file__).parent/'houses/ferres-estate/source.haunt').read_text())
probes=[('ferres',source),('one_room',{'version':8.8,'name':'The Lonely Candle','floors':[{'name':'Ground','rooms':[{'id':'solo','name':'Lonely Room','x':0,'y':0,'l':9,'w':7,'h':4,'openings':[{'id':'front','type':'door','wall':'bottom','pos':.5}]}]}],'gameEntry':{'roomId':'solo','openingId':'front'}}),('student_multi',{'version':8.8,'name':'Midnight Orchid','floors':[{'name':'Ground','rooms':[{'id':'greenhouse','name':'Greenhouse','x':0,'y':0,'l':15,'w':8,'h':5,'openings':[{'id':'enter','type':'door','wall':'bottom','pos':.5},{'id':'glass','type':'window','wall':'top','pos':.5}]},{'id':'tower','name':'Tower','x':16,'y':0,'l':6,'w':6,'h':8,'openings':[]}]}],'gameEntry':{'roomId':'greenhouse','openingId':'enter'}})]
result={}
for key,src in probes:
    payload,manifest,issues=compile_blueprint(src,creator='Forge QA')
    with zipfile.ZipFile(io.BytesIO(payload)) as z:
        assert z.testzip() is None
        report=json.loads(z.read('casa_validation.json'))
        for path,meta in report['entries'].items():
            data=z.read(path);assert len(data)==meta['bytes'];assert hashlib.sha256(data).hexdigest()==meta['sha256']
        assert len([s for s in z.namelist() if s.startswith('geometry/floor_')])==len(src['floors'])
        assert json.loads(z.read('manifest.json'))['name']==src['name']
        assert z.read('exterior/street_preview.glb')[:4]==b'glTF'
        result[key]={'rooms':report['architecturalRooms'],'floors':report['floors'],'bytes':len(payload),'sha256':hashlib.sha256(payload).hexdigest(),'package_integrity':'PASS','gameplayCertified':False}
        (Path('/mnt/data')/('forge39_'+key+'.casa')).write_bytes(payload)
assert len({r['sha256'] for r in result.values()})==3
(Path(__file__).parent/'PASS_3_9_TEST_REPORT.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
