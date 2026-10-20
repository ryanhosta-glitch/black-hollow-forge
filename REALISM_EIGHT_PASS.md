# Black Hollow Forge 1.3 — Eight Realism Upgrades

Five reusable material treatments: wood, damask, marble, brass, upholstery. The new `forge_realism_eight.js` provides separate physically based material families. Existing embedded `BlackHollow_` PBR assets take priority, so this does not overwrite the 1.2 source reconstruction. Material upgrades are selectively applied to available furnishing and door-detail meshes with existing UVs.

Candles: wax cylinders, dark wick and more refined flames are added to Forge viewer fixtures. A bounded 2–5 light pool uses the currently selected room's flame positions with gentle flicker.

Reflection: an aged metal-like reflecting plate and frame is placed **as a preview** in the selected library. This is a roughness-aware environmental material, **not** a real reflection of the scene and not student-authored architecture. A true planar reflection would require a second camera render and performance testing.

All generated enhancements are viewer-only. Student `.haunt`, staircase certification state, collision meshes, and original house dimensions are unchanged. Automated JavaScript validation is required. Browser visuals and frame rate still need user review.
