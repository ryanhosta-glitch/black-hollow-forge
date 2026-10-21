"""Reusable signature scenes baked by tools/build_signature_assets.mjs.
Copies packaged templates without altering authored blueprint dimensions.
"""
from pathlib import Path
import json,shutil
ROOT=Path(__file__).resolve().parent

def build(kind,outfile):
    key='hall' if kind=='main-hall' else 'floor13' if kind=='floor13-conservatory' else None
    if key is None:raise ValueError('Unknown signature scene '+kind)
    name='special_main_hall.glb' if key=='hall' else 'special_floor13_conservatory.glb'
    src=ROOT/'houses/ferres-estate/geometry'/name;dst=Path(outfile)
    data=src.read_bytes()
    if data[:4]!=b'glTF' or int.from_bytes(data[8:12],'little')!=len(data):raise ValueError('Invalid signature GLB')
    dst.parent.mkdir(parents=True,exist_ok=True)
    if dst.resolve()!=src.resolve():shutil.copyfile(src,dst)
    report=json.loads((ROOT/'houses/ferres-estate/navigation/signature_visual_report.json').read_text())['scenes'][key]
    return {'kind':kind,'version':6,'model':name,'units':'meters',**report,'gameplayCertified':False,'status':'signature inspection geometry; game quest/elevator binding pending'}
