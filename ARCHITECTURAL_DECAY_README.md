# Architectural Decay — Visual Pass

The main estate viewer now renders **reversible, non-colliding, room-aligned decay decals**. They overlay damp staining, small peeling-wallpaper fragments, ceiling-adjacent leak discoloration and fine floor dust. They use actual authored room bounds, a pre-existing `century_of_decay.json` intensity/profile, and deterministic IDs. Inferred environmental type influences damp-versus-peeling selection.

**Scope and limitations:** Visual overlays, not baked physically-based material masks. They do not change student-authored geometry, openings, collision, navigation, or material textures in exported GLBs. Decals are anchored to bounding-box walls, not raycast to triangles, so some placements may float, overlap doors, or face wall thickness. The main viewer shows them only for a selected room in single-floor estate mode. No real roof-leak tracing or furniture top-surface dust in this pass. Do not treat these as solved without browser inspection. Turn off via `Visible Decay` button.

Test checklist: switch between rooms including crypt and entrance; use toggle twice; switch to special Hall/Floor 13 and back; try all view modes; verify decals do not appear over incorrect walls.
