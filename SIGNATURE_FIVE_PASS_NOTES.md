# Signature rooms: five-pass inspection release

1. **Import/readiness:** source audit for entry, IDs, dimensions, opening pairs, unverified open-plan and embedded-stair features, and elevator shaft stops/alignment. Browser compilation now derives elevations from authored room heights; camera zones, geometry, stair rise and roof cap use the same levels. Door heights/windows use consistent feet-to-metre conversion. Exported world-space models are no longer translated a second time by the importer. More spacious door swing host is recorded in the doorway contract; runtime consumption is still required.
2. **Connections:** an explicit entrance-room portal enters the Hall. Both Hall flights lead to the upper landing and boardable cabin; the cabin enables the Conservatory inspection destination. Its return cabin returns to the upper Hall. Door/elevator action ranges include height checks. These are inspection transitions, not the game's story, quest lock or elevator animation.
3. **Hall:** rebuilt marble inlay floor, jewel-toned wall panels, limestone columns, gilded vault ribs/coffers, three chandeliers, velvet settees, twin stairs/railings, upper cross-landing and brass elevator cabin. Dimensions remain 24 × 31 × 15 metres within the existing separate pocket scene.
4. **Conservatory:** rebuilt 28 × 34 × 16 metre glasshouse with barrel canopy, iron ribs, raised planting beds, multi-height foliage, pitcher plants, moon orchids, botanical research tables, chandeliers and obsidian fountain. Simple bed/fountain/table collision keeps routes clear. This does not recreate every previous quest prop or its interaction script.
5. **Performance/export:** static GPU-instanced ornament, shared finishes, three pooled signature lights without extra shadow maps, and simple camera obstruction proxies instead of ray-testing all plant leaves. Both signature assets and route contract are included in CASA exports. GLBs require `EXT_mesh_gpu_instancing` (supported by tested Three.js 0.170 GLTFLoader). Preserve the original `.haunt` unchanged.

## Validation

- `node signature_scenes_test.mjs /path/to/three.module.mjs /path/to/GLTFLoader.mjs`: actual GLTFLoader parsing, source audit, authored heights/door units, both Hall flights up/down, landing support, cabin range/height, obstacles and source immutability.
- `node navigation2_viewer_test.mjs /path/to/three.module.mjs`: existing movement/physical door regression harness.
- `node locked_study_3d_test.mjs`: existing 11 interaction assertions.
- `python build_casa38.py --house houses/ferres-estate --output /tmp/signature_QA.casa`, then `--verify`: archive references, SHA inventory, GLB headers and CRC.
- Source hash / asset-presence integration gate: passes with existing warnings.
- CPU geometry previews were inspected for composition. They are not screenshots of the browser renderer. Work browser WebGL was unavailable; no rendered gameplay/FPS claim.

## Remaining game-readiness blockers

- General estate stair collision and full game loader/quest integration are not certified.
- Estate furniture collision and mesh-level camera clearance require game-side testing; the new signature scenes use conservative proxy footprints.
- Story-controlled elevator locks, animation and saved destinations remain game-owned.
- Browser Universal compiler remains a QA architecture generator. Open-plan wall removal and embedded stairs are explicitly flagged, not silently certified or destructively resized.
- Fresh Python geometry compilation still lacks repository source modules `magical.py`, `integrity.py`, and `embellish.py`; `trimesh` is also missing from this execution environment. Added a preflight with explicit diagnostics. Packaged signature templates and existing-estate CASA export work independently.

## User visual test

After publishing, choose the entrance room and **Enter Grand Main Hall**. Walk up either staircase, cross to the central cabin, then use **Elevator → Conservatory**. Walk inside the south return cabin to enable **Elevator → Grand Hall**. Walk to the Hall's south doorway to enable **Return to house**. Existing scene tabs remain inspection shortcuts.

Check floor contact, open rail edges, camera visibility at columns, elevator proximity, foliage/path clearance, glass appearance and frame rate. Keep gameplay certification false until these checks and game integration pass.
