# Forge interactive furniture library

Built from the existing estate's 30 furnishing placements and source room names.

Files: `houses/ferres-estate/navigation/furniture_library.json` (typed, stable object records), `furniture_library_runtime.mjs` (action state and dispatch), `furniture_library.html` (mobile inspector), and the existing `interactive_furniture_atelier.html` (3D prototype).

**Not yet completed:** binding state transitions to meshes in every mansion room, collision clearance, physically animated sit poses, 3D furniture artistry, game-runtime connection, regeneration of records from *arbitrary* `.haunt` imports. The furniture catalog currently covers the bundled sample estate. Source `.haunt` is unchanged.

Use the Forge Pages menu → Interactive Furniture Library to test each object action. The site must be served over HTTP(S), such as GitHub Pages, for JSON modules to load.
