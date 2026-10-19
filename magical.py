"""Non-destructive supernatural accessibility pass for Black Hollow Forge.
Creates a traversal graph and explicit virtual repairs. Does NOT alter .haunt.
Virtual doors/elevators are navigation declarations for a future game runtime.
"""
from collections import defaultdict, deque
import math

def compile_magic(data):
    floors=data.get('floors',[])
    nodes={str(r['id']):(fi,r) for fi,f in enumerate(floors) for r in f.get('rooms',[]) if r.get('id')}
    adjacency={rid:set() for rid in nodes}; connections=[]; issues=[]; repairs=[]
    def connect(a,b,kind, **extra):
        if a==b or a not in nodes or b not in nodes or b in adjacency[a]:return False
        adjacency[a].add(b);adjacency[b].add(a)
        connections.append(dict(a=a,b=b,type=kind,**extra));return True
    shared=defaultdict(list)
    for rid,(fi,r) in nodes.items():
        for op in r.get('openings') or []:
            if op.get('type') in ('door','arch','archway','open','passage') and op.get('shared'):
                shared[(fi,str(op['shared']))].append(rid)
    for (fi,s),pairs in shared.items():
        for i in range(len(pairs)):
            for j in range(i+1,len(pairs)):
                connect(pairs[i],pairs[j],'architect-door',shared=s)
        if len(pairs)==1:issues.append({'type':'unmatched-door','roomId':pairs[0],'openingShared':s,'severity':'warning'})
    # Linked staircase or elevator positions, only when real matching volumes exist.
    shafts=defaultdict(list)
    for rid,(fi,r) in nodes.items():
        if r.get('type')=='elevator' and r.get('elevatorShaftId'):shafts[str(r['elevatorShaftId'])].append((fi,rid))
    for sid,pairs in shafts.items():
        pairs.sort()
        for (fa,a),(fb,b) in zip(pairs,pairs[1:]):connect(a,b,'architect-elevator',shaftId=sid)
    def overlap(a,b):
        return max(0,min(a['x']+a['l'],b['x']+b['l'])-max(a['x'],b['x']))*max(0,min(a['y']+a['w'],b['y']+b['w'])-max(a['y'],b['y']))
    for fa in range(len(floors)-1):
        ra=[(id,r) for id,(fi,r) in nodes.items() if fi==fa and (r.get('type')=='stairs' or r.get('embeddedStair'))]
        rb=[(id,r) for id,(fi,r) in nodes.items() if fi==fa+1 and (r.get('type')=='stairs' or r.get('embeddedStair'))]
        for a,ar in ra:
            for b,br in rb:
                arbox=ar if ar.get('type')=='stairs' else {**ar,**{k: ar[k]+ar['embeddedStair'].get(k,0) for k in ('x','y')},'l':ar['embeddedStair'].get('l',0),'w':ar['embeddedStair'].get('w',0)}
                brbox=br if br.get('type')=='stairs' else {**br,**{k: br[k]+br['embeddedStair'].get(k,0) for k in ('x','y')},'l':br['embeddedStair'].get('l',0),'w':br['embeddedStair'].get('w',0)}
                if min(arbox.get('l',0),brbox.get('l',0),arbox.get('w',0),brbox.get('w',0))>0 and overlap(arbox,brbox)>=.75*min(arbox['l']*arbox['w'],brbox['l']*brbox['w']):connect(a,b,'architect-stairs')
    entry=(data.get('gameEntry') or {}).get('roomId')
    if entry not in nodes:
        priority=[rid for rid,(fi,r) in nodes.items() if str(r.get('type','room'))=='room']
        entry=priority[0] if priority else next(iter(nodes),None)
        if entry:repairs.append({'type':'generated-entry','roomId':entry,'reason':'Missing or invalid game entry'})
    # An unreachable island on a floor receives its own elevator destination, rather than a fabricated physical door.
    def reachable():
        seen=set();q=deque([entry] if entry else [])
        while q:
            a=q.popleft()
            if a in seen:continue
            seen.add(a);q.extend(adjacency[a]-seen)
        return seen
    # Group disconnected rooms into components (islands), then connect each component to an entry-point hub.
    visited=set();components=[]
    for rid in nodes:
        if rid in visited:continue
        stack=[rid];comp=[]
        while stack:
            x=stack.pop()
            if x in visited:continue
            visited.add(x);comp.append(x);stack.extend(adjacency[x]-visited)
        components.append(comp)
    for comp in components:
        if entry in comp:continue
        # Prefer representative ordinary room. Virtual elevator can travel across floors or to sealed rooms.
        options=sorted(comp,key=lambda rid:(nodes[rid][1].get('type')!='room',nodes[rid][0],rid))
        dest=options[0]
        fi,r=nodes[dest]
        typ='missing-floor-access' if not any(nodes[x][0]==fi for x in reachable()) else 'sealed-room-island'
        repairs.append({'type':'spectral-elevator-stop','fromRoom':entry,'toRoom':dest,'floor':fi,'reason':typ,'onDemand':True,'blueprintMutated':False})
        connect(entry,dest,'magical-elevator',generated=True,repairReason=typ)
    # One connection per disconnected component; all connected rooms reachable after repairs.
    roof=data.get('roof')
    if not roof or roof in ('none',False):
        repairs.append({'type':'generated-roof','style':'victorian-hipped','targetFloor':max((fi for fi,f in enumerate(floors) if f.get('rooms')),default=0),'reason':'No usable roof specified','blueprintMutated':False})
    return {'entryRoomId':entry,'connections':connections,'repairs':repairs,'issues':issues,'allRoomsReachable':bool(entry) and len(reachable())==len(nodes),'rooms':len(nodes),'architectConnections':sum(c['type'].startswith('architect') for c in connections),'magicalConnections':sum(c['type']=='magical-elevator' for c in connections)}
