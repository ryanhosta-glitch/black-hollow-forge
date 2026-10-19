# Black Hollow Forge 0.3 — house viewer and navigation bridge

This is a **separate playable navigation/GLB viewer**, not the final Black Hollow v8.5.19 gameplay integration. It loads compiled floor GLBs, roof, special rooms, and the architect/magical connection graph. Select doors/stairs/spectral connections using the explicit destination controls. There is no avatar physics or mission engine in this prototype.

## Start
Extract the ZIP. Serve the folder with `python -m http.server 8000` and open `http://localhost:8000/` in Chrome/Edge. Internet is needed for Three.js modules. **Do not double-click index.html**, since browsers restrict local JSON/GLB loading.

## Tested source
`houses/ferres-estate/source.haunt`; all 26 rooms preserved. Five rendered estate meshes: four floors + roof. Two additional special-room structural GLBs.

## Architecture
- `manifest.json`: single game-load contract.
- `navigation/collision.json`: room bounds / metadata, not a finished physics mesh.
- `navigation/magic.json`: explicit architect door/stair/elevator links and magical repair links.
- `geometry/*.glb`: baked display meshes; room visuals loaded per selected floor.
- Original `.haunt` never mutated.

## Remaining for 1.0
Connect the verified bridge to game v8.5.19 while retaining story, real first-person motion, audio, triggers, and Floor 13. Build production roof shapes and fully styled custom rooms. Conduct browser testing on target devices. This prototype must not be described as having completed those tasks.
