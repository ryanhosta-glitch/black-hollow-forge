# Cinematic Illumination Pass — Grand Entrance Hall

Adds **actual viewer-side Three.js lighting** localized to Ferre’s Estate room `fe-f1-room1`, positioned from the authored room bounds: one candle-colored chandelier point light, two sconce point lights, and a cool spotlight for moonlit window wash. The existing adaptive room lights and cinematic moonlight remain.

The hall rig follows the selected lighting mood and is visible only with the Estate scene and relevant floor. Optional mobile, desktop, and cinematic profiles adjust light counts/intensities; exposure trim is separate from the base lighting presets. The default renderer uses ACES filmic tone mapping, already present in the viewer.

**Limitations:** This is forward-rendered direct lighting, not ray tracing, baked GI, volumetric shafts, or physically accurate candle shadows. The cool spotlight is a directional artistic window wash; it is **not yet aligned to a specific authored window mesh**. The decorative chandelier/sconce geometry is not yet used to derive light fixture positions. Browser appearance and FPS remain to be tested. This pass does not claim game runtime integration.

The original blueprint, GLB geometry, PBR textures, collision data, missions and navigation systems are unchanged.
