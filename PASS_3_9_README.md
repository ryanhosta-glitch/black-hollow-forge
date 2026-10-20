# Black Hollow Forge 3.9 — Universal Blueprint-to-CASA QA Compiler

## What genuinely changed

- Added `compile_haunt_to_casa.py`: imports arbitrary valid `.haunt` JSON and builds distinct, ZIP-compatible `.casa` archives with floor GLBs, an exterior GLB, room metadata, authored openings, entry, collision metadata, source blueprint, permanent generated house identity, SHA-256 integrity report.
- Added `test_casa39.py` and `PASS_3_9_TEST_REPORT.json`: three independent packages were produced and verified.
- Existing Forge 3.8 visual tools and CASA Publisher remain unchanged. The Ferre's Estate detailed CASA export remains in the published house folder.

## Important limitations

This CLI is a **new QA foundation**, NOT the full Forge visual renderer. It builds simplified architectural meshes; it does not yet reproduce the rich PBR materials, roof sculpting, furnishings, staircase geometry, dynamic doors, or certified collision of the original Forge. Stair features are flagged rather than silently treated as playable. The existing in-browser Publisher still packages the detailed precompiled Ferre's Estate only. GitHub Pages cannot execute Python, so run this compiler locally with Python; an in-browser universal compiler is a future development task. Black Hollow does not yet load CASA models as its primary world.

## Run locally

Install Python 3 and `pip install numpy trimesh`.

```bash
python compile_haunt_to_casa.py my_students_house.haunt --architect "Student Architect" --description "A sinister old manor" --output my_students_house.casa
python test_casa39.py
```

## Release criteria for next pass

1. Move the universal compiler into the browser (or a deployed build service) and integrate with the Forge renderer, not a second simplified mesh generator.
2. Compile authored stair geometry and physically validate traversal before issuing GAME READY.
3. Connect a CASA loader in the Black Hollow runtime and exercise missions, elevators and Floor 13.
