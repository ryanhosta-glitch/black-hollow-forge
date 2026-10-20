#!/usr/bin/env python3
"""Run after forge.py; checks exported contracts without claiming runtime gameplay."""
import json,hashlib,sys
from pathlib import Path

def check(root):
 root=Path(root);m=json.loads((root/'manifest.json').read_text());n=json.loads((root/m['navigation']).read_text());v=json.loads((root/'validation.json').read_text());ids={r['id'] for r in n['rooms']};fails=[];warn=[]
 if len(ids)!=len(n['rooms']):fails.append('Duplicate room IDs')
 if m['entry']['roomId'] not in ids:fails.append('Missing entry room')
 if hashlib.sha256((root/'source.haunt').read_bytes()).hexdigest()!=m['sourceSha256']:fails.append('Source bytes do not match manifest SHA')
 for f in m['floors']:
  if not (root/f['model']).is_file():fails.append('Missing floor GLB '+f['model'])
  for rid in f['roomIds']:
   if rid not in ids:fails.append('Unknown floor room '+rid)
 for field in ('roof','navigation','magic','integrity'):
  if not (root/m[field]).is_file():fails.append('Missing '+field)
 for x in ('runtime_bridge.json','stair_final_safety_gate.json'):
  if not (root/'navigation'/x).exists():warn.append('Missing enhanced navigation contract '+x)
 gate=root/'navigation'/'stair_final_safety_gate.json'
 if gate.exists():
  obj=json.loads(gate.read_text());warn.append('Stair gate exists, but geometrical and physical certification must be verified in live game')
 report={'status':'passed-with-warnings' if not fails else 'failed','checks':{'rooms':len(ids),'floors':len(m['floors']),'originalBlueprintHashMatches':hashlib.sha256((root/'source.haunt').read_bytes()).hexdigest()==m['sourceSha256'],'geometryFilesPresent':not any('GLB' in x for x in fails)},'gameplayCertified':False,'failures':fails,'warnings':warn+['True staircase collision and end-to-end Black Hollow game integration NOT certified']}
 (root/'INTEGRATION_GATE_QA.json').write_text(json.dumps(report,indent=2));return report
if __name__=='__main__':
 report=check(sys.argv[1]);print(json.dumps(report,indent=2));sys.exit(1 if report['failures'] else 0)
