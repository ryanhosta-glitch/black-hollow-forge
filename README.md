# Black Hollow Forge — Pass Five: Integration Laboratory

This checkpoint keeps Forge and student `.haunt` intact. The playable **`playtest.html`** is a separate runtime proving navigation **via room-graph links**, with loading of all compiled models, Main Hall/Floor 13 scene transitions, Seer gating, botanical clue interactions, discovery counter and unlockable Estate Atlas.

**Important:** This is **not** the completed v8.5.19 game integration. It does **not** implement collision-based WASD traversal, animated architectural doors, physical elevator transport, staircase navmesh or final quest scenes. The playground is explicitly a prototype and provides a concrete reusable `navigation/runtime_bridge.json` contract for those tasks.

To inspect: upload contents to GitHub Pages and open `/playtest.html`, or serve locally via `python -m http.server 8000`. Existing `/index.html` architecture viewer is retained.

`INTEGRATION_QA.json` records graph traversal and the packaged GLB sizes and SHA-256 hashes. `source.haunt` has not been edited. Three.js CDN requires network access.


## Additional push — Walkable architectural inspection

New `/walktest.html` offers **first-person WASD/mouse architectural navigation**, room-rectangle collision, authored doorway apertures from `navigation/integrity.json`, `E` to traverse nearby doors and change floors using validated graph links, daylight/night selection, and a QA floor/room picker. The architectural `index.html` and original room-graph `playtest.html` remain intact. This is a Forge QA tool and not a replacement for the original game.

Crucial limits: collision is based on simplified room rectangles and authored door apertures, not mesh triangles. Stairs/elevators switch validated rooms rather than physically climbing steps. Some misaligned or unpaired authored doors may lack physical portals, while the existing room graph still validates their topology. No full v8.5.19 integration is claimed.

See `WALKTEST_QA.json` for automated integrity and reachability checks. Host with HTTPS GitHub Pages or `python -m http.server`.
