# Black Hollow Forge — Estate Viewer Integration Pass

This patch focuses on the **inspection viewer** rather than gameplay.

## Applied fixes
- Loads optional per-floor `furnishings_floor_XX.glb` overlays into the estate scene.
- Loads optional per-floor `door_window_floor_XX.glb` overlays into the estate scene.
- Reorders lighting setup so room-aware lighting uses the computed vertical floor stack, not a pre-initialization empty array.
- Adds a selected-room fill light for clearer single-room viewing in dark inspection modes.
- Expands estate visibility management so overlay models follow single-floor / whole-house / exploded / dollhouse modes.
- Expands cutaway and wireframe toggles to include the new overlay layers.
- Updates the lower-left benchmark label so it reflects the actual estate room/scene context.
- Adds viewer diagnostics for furnishing and detail overlay counts.

## Scope
This is a **viewer integration and readability pass**. It does not certify gameplay collision, replace the v8.5 game runtime, or fully rebuild the Floor 13 conservatory geometry.
