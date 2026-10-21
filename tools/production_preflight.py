"""Report reproducibility blockers without importing optional geometry dependencies."""
import ast,importlib.util,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
LOCAL={'magical','integrity','embellish','victorian_architecture','special_scenes','grand_interior','historic_interior_pass','door_window_workshop'}
def inspect(root=ROOT):
    missing=[name+'.py' for name in sorted(LOCAL) if not (root/(name+'.py')).is_file()]
    dependencies=[name for name in ('numpy','trimesh') if importlib.util.find_spec(name) is None]
    return {'canFreshCompile':not missing and not dependencies,'missingSourceModules':missing,'missingEnvironmentDependencies':dependencies,'gameplayCertified':False}
if __name__=='__main__':print(json.dumps(inspect(),indent=2))
