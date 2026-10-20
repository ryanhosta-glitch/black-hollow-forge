"""Black Hollow Forge Pass 7: non-mutating blueprint repair analysis."""
import json, math, collections, hashlib
from pathlib import Path

def inspect(plan):
    rooms=[(fi,r) for fi,f in enumerate(plan.get('floors',[])) for r in f.get('rooms',[])]
    issues=[];groups=collections.defaultdict(list); ids=collections.defaultdict(list);roombyid={}
    def issue(code,severity,title,details,rooms,proposals):
        key=f'{code}:{"|".join(sorted(map(str,rooms)))}'
        issues.append(dict(id=hashlib.sha256(key.encode()).hexdigest()[:12],code=code,severity=severity,title=title,details=details,roomIds=rooms,proposals=proposals,autoApplied=False))
    for fi,r in rooms:
        rid=str(r.get('id') or f'floor{fi}-unnamed')
        ids[rid].append(fi);roombyid[rid]=r
        try:
            x,y,l,w,h=(float(r.get(k,0)) for k in ('x','y','l','w','h'))
            if not all(map(math.isfinite,(x,y,l,w,h))) or min(l,w,h)<=0:raise ValueError()
        except (TypeError,ValueError):
            issue('INVALID_ROOM_DIMENSIONS','blocker','Invalid room geometry',f'{r.get("name",rid)} has missing, nonfinite, or nonpositive dimensions.',[rid],[dict(rank=1,action='Review and correct the authored room dimensions in Architect',requiresApproval=True)])
            continue
        if min(l,w)<3:
            issue('VERY_NARROW_ROOM','warning','Narrow room',f'{r.get("name",rid)} has a {min(l,w):g} unit minor dimension; walkable clearance needs review.',[rid],[dict(rank=1,action='Review passage and furniture clearance; preserve authored dimensions',requiresApproval=True)])
        for op in r.get('openings',[]):
            typ=str(op.get('type',''))
            if op.get('shared'):groups[(fi,str(op['shared']))].append((rid,op))
            pos=op.get('pos')
            if pos is not None and (not isinstance(pos,(float,int)) or not math.isfinite(pos) or not 0<=pos<=1):
                issue('INVALID_OPENING_POSITION','blocker','Opening position out of range',f'{rid}: {op.get("id","unnamed")} pos={pos!r}.',[rid],[dict(rank=1,action='Set opening position to a reviewed fraction between 0 and 1',requiresApproval=True)])
            if typ in ('door','arch','opening') and op.get('wall') not in ('left','right','top','bottom'):
                issue('UNKNOWN_OPENING_WALL','warning','Unrecognized opening wall',f'{rid}: {op.get("id","unnamed")} wall={op.get("wall")!r}.',[rid],[dict(rank=1,action='Map opening wall to one of left/right/top/bottom after review',requiresApproval=True)])
    for rid, floors in ids.items():
        if len(floors)>1:issue('DUPLICATE_ROOM_ID','blocker','Duplicate room ID',f'{rid} appears {len(floors)} times.',[rid],[dict(rank=1,action='Assign unique stable identifiers to each room',requiresApproval=True)])
    edges=collections.defaultdict(set)
    for (fi,key),members in sorted(groups.items()):
        if len(members)!=2:
            issue('UNPAIRED_SHARED_OPENING','warning','Unpaired shared opening',f'Floor {fi}: {key} has {len(members)} endpoint(s), expected exactly two.',[rid for rid,_ in members],[dict(rank=1,action='Inspect adjoining rooms and identify the missing or extra endpoint',requiresApproval=True),dict(rank=2,action='Keep the opening as an intentional one-sided portal only if approved',requiresApproval=True)])
        elif members[0][0]!=members[1][0]:
            a,b=members[0][0],members[1][0];edges[a].add(b);edges[b].add(a)
    for fi,f in enumerate(plan.get('floors',[])):
        nodes=[str(r.get('id')) for r in f.get('rooms',[])];seen=set();components=[]
        for n in nodes:
            if n in seen:continue
            stack=[n]; comp=[]
            while stack:
                v=stack.pop()
                if v in seen:continue
                seen.add(v);comp.append(v);stack.extend(edges[v]-seen)
            components.append(comp)
        if len(components)>1:
            issue('DISCONNECTED_FLOOR_GRAPH','warning','Floor has disconnected door graph',f'Floor {fi} ({f.get("name","unnamed")}) has {len(components)} door-connected components. Vertical stair links and intentionally secret passages are not accounted for.',nodes,[dict(rank=1,action='Review missing doors or authored open-plan connections before suggesting any change',requiresApproval=True),dict(rank=2,action='Flag intentionally disconnected spaces and identify special traversal rules',requiresApproval=True)])
    stairrooms=[str(r.get('id')) for fi,r in rooms if 'stair' in (str(r.get('name',''))+' '+str(r.get('roomType',''))).lower()]
    if stairrooms:
        issue('STAIR_PLAYABILITY_UNCERTIFIED','advisory','Stair routes require physical certification',f'{len(stairrooms)} stair-related room(s) found. The room/door graph cannot certify tread collision, safe landings or vertical transitions.',stairrooms,[dict(rank=1,action='Run the stair-route safety and free-walk tests on exported geometry; leave original stairs untouched',requiresApproval=True)])
    entry=plan.get('gameEntry') or {}
    if entry.get('roomId') and entry['roomId'] not in roombyid:
        issue('MISSING_GAME_ENTRY','blocker','Game entry references missing room',str(entry['roomId']),[str(entry['roomId'])],[dict(rank=1,action='Choose an existing entry room and review the external entrance opening',requiresApproval=True)])
    priority={'blocker':0,'warning':1,'advisory':2}
    issues.sort(key=lambda i:(priority[i['severity']],i['code'],i['id']))
    return dict(schemaVersion=1,analysis='non-mutating-static',roomCount=len(rooms),floorCount=len(plan.get('floors',[])),issueCount=len(issues),issues=issues,limitations=['Door graph ignores freeform removed-wall/openPlanWith paths','No collision mesh or headroom certification','No automatic repair is applied','No cross-floor staircase certification'],sourceSHA256=None)

def analyze_file(path):
    p=Path(path); raw=p.read_bytes();result=inspect(json.loads(raw));result['sourceSHA256']=hashlib.sha256(raw).hexdigest();return result

if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser();p.add_argument('source');p.add_argument('--output');args=p.parse_args();report=analyze_file(args.source);output=json.dumps(report,indent=2,ensure_ascii=False);Path(args.output).write_text(output+'\n') if args.output else print(output)
