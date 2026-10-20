#!/usr/bin/env python3
"""Conservative, reusable, non-destructive stair footprint candidate search.
NOT a building-code or collision/headroom certificate. Units: meters.
"""
import json,math,hashlib,sys
from pathlib import Path
FT=.3048

def candidate(kind, width, depth, rise, clear=.84, tread=.255, landing=.95, bottom=.70):
    risers=max(2,round(rise/.171)); rh=rise/risers
    if kind=='straight':
        geom=(clear, (risers-1)*tread+landing+bottom)
        notes=['Single continuous flight; landing zones assumed inside footprint']
    elif kind=='l_shaped':
        n1=risers//2;n2=risers-n1
        geom=((n1-1)*tread+landing+bottom,(n2-1)*tread+landing+bottom)
        notes=['Right-angle level landing; access directions must be checked']
    elif kind=='u_shaped':
        n1=risers//2;n2=risers-n1
        geom=(2*clear+.16, max(n1-1,n2-1)*tread+landing+bottom)
        notes=['Two parallel runs and a level turn; end access and headroom not verified']
    elif kind=='three_flight':
        a=risers//3;b=(risers-a)//2;c=risers-a-b
        geom=(max(a-1,c-1)*tread+landing+clear, (b-1)*tread+landing+clear)
        notes=['Three runs with two level landings; path topology/headroom not verified']
    elif kind=='spiral':
        diameter=max(2.10,clear*2.5)
        geom=(diameter,diameter)
        notes=['Spiral envelope only; inner tread width/turning headroom not verified']
    else:raise ValueError(kind)
    dims=[round(float(x),3) for x in geom]
    orientations=[]
    for rot,req in [('standard',geom),('rotated',(geom[1],geom[0]))]:
        if req[0]<=width+1e-9 and req[1]<=depth+1e-9:
            orientations.append({'orientation':rot,'widthMarginM':round(width-req[0],3),'depthMarginM':round(depth-req[1],3)})
    # screening fit is NOT a physically certified stair
    return {'kind':kind,'footprintRequiredM':dims,'riserCount':risers,'riserHeightM':round(rh,4),
            'treadDepthM':tread,'flightClearWidthM':clear,'turnLandingDepthM':landing,
            'entryBufferM':bottom,'fitsBoundingRectangle':bool(orientations),'fittingOrientations':orientations,
            'stage':'FOOTPRINT_PLAUSIBLE_UNCERTIFIED' if orientations else 'REJECTED_FOOTPRINT',
            'limitations':notes+['Doors, walkable collision, overhead slabs, railings and both floor connections untested']}

def evaluate_link(link):
    w,d=map(float,link['roomFootprintMeters']);rise=float(link['floorRiseMeters'])
    configs=[candidate(k,w,d,rise) for k in ('straight','l_shaped','u_shaped','three_flight','spiral')]
    # Prefer matching authored type, then a conventional, simply connected arrangement.
    authored=link.get('type','').lower();fit=[c for c in configs if c['fitsBoundingRectangle']]
    aliases={'switchback':'u_shaped','regular':'straight','spiral':'spiral','l':'l_shaped'}
    pref=aliases.get(authored,authored)
    score=lambda c:(c['kind']!=pref,{'straight':0,'l_shaped':1,'u_shaped':2,'three_flight':3,'spiral':4}[c['kind']],c['footprintRequiredM'][0]*c['footprintRequiredM'][1])
    fit.sort(key=score)
    suggestion=fit[0]['kind'] if fit else None
    return {'linkId':link['linkId'],'authoredType':link['type'],'lowerRoomId':link['lower'],
       'upperRoomId':link['upper'],'floorIndices':link['floorIndices'],
       'availableFootprintM':[w,d],'riseM':rise,'candidates':configs,
       'fittingCandidateCount':len(fit),'preferredFootprintCandidate':suggestion,
       'assessment':'CANDIDATE_REQUIRES_GEOMETRY_AND_COLLISION_VALIDATION' if fit else 'NO_FOOTPRINT_CANDIDATE',
       'physicalTraversalCertified':False,'sourceBlueprintModified':False}

def solve(source, prior):
    raw=Path(source).read_bytes(); links=json.loads(Path(prior).read_text())['links']
    results=[evaluate_link(x) for x in links]
    return {'schema':'black-hollow-multi-layout-solver-1.0','sourceSha256':hashlib.sha256(raw).hexdigest(),
      'originalBlueprintModified':False,'method':'Conservative parametric rectangle screen over authored stairwell bounds. No geometry modification.',
      'physicalTraversalCertified':False,'limits':['Blueprint stair connection records are inherited from previous link discovery',
       'No actual stair meshes are generated in this pass','No collision, headroom, floor-opening or building-code certification'],
      'summary':{'links':len(results),'withFootprintCandidates':sum(x['fittingCandidateCount']>0 for x in results),
      'withoutFootprintCandidates':sum(x['fittingCandidateCount']==0 for x in results),'physicallyCertified':0},'links':results}

def main():
    if len(sys.argv)!=4:sys.exit('Usage: python multi_stair_solver.py <source.haunt> <prior_stair_layout_solver.json> <output.json>')
    Path(sys.argv[3]).write_text(json.dumps(solve(sys.argv[1],sys.argv[2]),indent=2))
if __name__=='__main__':main()
