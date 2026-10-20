# Black Hollow Forge — Candle Smoke + Reversible Surface Wear

The actual procedural flame tip meshes in `gothic_fixtures.js` are tagged when constructed. `flamePositions(roomId)` returns their world-space coordinates for the selected room only, and only when fixtures are visible. The existing `forge_atmosphere.js` smoke particle system is now supplied with those points whenever a room is selected or fixture visibility changes. There is no invented flame location. A mobile budget is maintained. Smoke is a stylized particle approximation, not computational fluid simulation.

`forge_material_wear.js` adds restrained, deterministic roughness variance to selected visually named trim, stone, brass, wallpaper, and plaster meshes. Clones are kept and a viewer toggle restores original material references. It does **not** paint chips, cracks, grime masks or water stains into the model, and it does not modify any `.haunt`, GLB or collision file. It is an intentionally safe foundation for later spatially-aware damage decals.

## Validation boundaries
Static source and Node syntax can be verified, but no browser screenshot, lighting appearance, GPU load, or in-game smoke behavior has been certified. Fixture positions are generated decor from Forge, not authored physical candles from students. Full cinematic realism and staircase navigation remain separate unfinished work.
