"""Conservative compiled-graph route gate. NEVER equate data connectivity with physical traversal."""
import json,sys,hashlib,collections
from pathlib import Path

def audit(house):
    house=Path(house); nav=house/'navigation'
    bridge=json.loads((nav/'runtime_bridge.json').read_text()); manifest=json.loads((house/'manifest.json').read_text())
    stairs=json.loads((nav/'stair_final_safety_gate.json').read_text()); collision=json.loads((nav/'collision.json').read_text())
    rooms={r['id']:r for r in bridge['rooms']}; edges=bridge['links']; known=set(rooms)
    failures=[]; adjacency=collections.defaultdict(list); links={}
    for e in edges:
        eid=e.get('id'); a=e.get('from');b=e.get('to')
        if not eid or eid in links: failures.append({'type':'duplicate-or-missing-link','link':eid})
        links[eid]=e
        if a not in known or b not in known: failures.append({'type':'missing-room-reference','link':eid});continue
        adjacency[a].append((b,e));
        if e.get('bidirectional',False):adjacency[b].append((a,e))
    stair_by_id={r['id']:r for r in stairs['results']}; start=bridge['entryRoomId']; reached={start}; queue=collections.deque([start]);previous={}
    if start not in known:failures.append({'type':'missing-entry','entry':start}); queue.clear()
    while queue:
        a=queue.popleft()
        for b,e in adjacency[a]:
            if b not in reached:reached.add(b);previous[b]=(a,e);queue.append(b)
    routes=[]
    for room in bridge['rooms']:
        target=room['id'];steps=[];cur=target
        while cur in previous:
            parent,link=previous[cur];steps.append({'connection':link['id'],'from':parent,'to':cur,'kind':link.get('kind')});cur=parent
        steps.reverse();stair_ids=[s['connection'] for s in steps if s['connection'] in stair_by_id or 'stair' in str(s['kind']).lower()]
        routes.append({'target':target,'floor':room['floor'],'graphConnected':target in reached,'linkCount':len(steps) if target in reached else None,'connections':steps,'stairConnections':stair_ids,'traversalStatus':'NOT_GAMEPLAY_CERTIFIED' if target in reached else 'UNREACHABLE_IN_COMPILED_GRAPH'})
    # Connection metadata sanity: important but not swept capsule physics.
    opening_ids={o.get('shared') for r in collision['rooms'] for o in r.get('openings',[]) if o.get('shared')}
    for link in edges:
        if link.get('shared') and link['shared'] not in opening_ids:failures.append({'type':'link-without-matching-authored-opening','link':link['id'],'shared':link['shared']})
    source=house/'source.haunt'
    digest=hashlib.sha256(source.read_bytes()).hexdigest() if source.exists() else None
    if digest!=manifest.get('sourceSha256'):failures.append({'type':'blueprint-hash-mismatch'})
    missing=[]
    for f in manifest['floors']:
        if not (house/f['model']).is_file():missing.append(f['model'])
    if not (house/manifest['roof']).is_file():missing.append(manifest['roof'])
    report={'schema':'black-hollow-playability-route-gate-1','estate':manifest['name'],'sourceSha256':digest,'sourceMatchesManifest':digest==manifest['sourceSha256'],'roomCount':len(rooms),'compiledLinks':len(edges),'graphReachableRooms':len(reached),'unreachableRooms':sorted(known-reached),'stairRoutesInPriorSafetyGate':len(stair_by_id),'certifiedStairRoutesInPriorGate':sum(r.get('status')=='GAMEPLAY_CERTIFIED' for r in stair_by_id.values()),'fileReferencesMissing':missing,'diagnostics':failures,'routes':routes,'compileGraphGate':'PASS' if not missing and not failures and len(reached)==len(known) else 'FAIL','gameplayCertification':'NOT_CERTIFIED','certificationBlockers':['No in-game swept-capsule continuous free walking test','No full headroom verification on stairs and threshold geometry','No door-swing and furniture-clearance physics test','No confirmed integration of identical collision solids in Black Hollow runtime'],'scope':'Compiler route-graph integrity only, not player physics or gameplay certification'}
    return report

def main():
    house=Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).parent/'houses/ferres-estate'
    report=audit(house);out=Path(sys.argv[2]) if len(sys.argv)>2 else house/'navigation/playability_route_gate.json'
    out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(report,indent=2)+'\n'); print(json.dumps({k:v for k,v in report.items() if k not in ('routes','diagnostics')},indent=2))
    if report['compileGraphGate']!='PASS':sys.exit(2)
if __name__=='__main__':main()
