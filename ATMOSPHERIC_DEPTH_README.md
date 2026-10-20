# Forge Atmospheric Depth — October 2026

This pass adds a deterministic, low-cost **3D dust particle field** to the main Estate single-floor view using Three.js Points. Particle density scales down on mobile. It does not change authored geometry, navigation, GLBs or the collision model. `forge_atmosphere.js` includes fixture-anchored smoke support but deliberately leaves smoke inactive until genuine flame anchor positions are provided; no invented sconces or fires.

## Stained glass constraint
`authoredWindows(rooms)` only counts author-provided opening types `window` / `stained-glass`. Ferre's Estate's navigation blueprint currently has no such authored windows. **No colored floor projections were inserted**. Adding projection to a real window is a separate integration milestone, not a claim in this release.

## Weathering
`roomWearProfile(room)` returns material-age/dust/moisture metadata suitable for a later non-destructive surface shader. Profiles are not yet baked onto models or claimed to represent physical stains. This avoids arbitrary modifications to student-provided finishes.

## QA scope
Static checks ensure the module imports, preserved source blueprint hash, preserves page wiring, and ZIP integrity. Browser FPS / particle placement / rendering remain to be tested on a device. Room positions are taken from the blueprint's feet coordinates.
