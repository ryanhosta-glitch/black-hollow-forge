# Serpent Spiral — Surface Walk Probe

New `serpent_walk_probe.html`: mobile/desktop interactive walk along the *candidate GLB* walking route. It queries actual wedge-tread and approach mesh surfaces using Three.js raycasting and stops on unsupported/obstructed route samples. Supports WASD, press-and-hold touch buttons, route inspection slider and first-person/chase camera.

**Not a gameplay certificate.** Movement remains path-constrained, not free-body triangle mesh collision; no mansion walls/doors/slabs are loaded into this test, and candidate room-to-room continuity is not proven. The inspector was browser-syntax-checked but has not been visually playtested on a device. Slider can deliberately seek past flagged positions for troubleshooting.

The authored student `.haunt` is unchanged; neither candidate spiral nor platforms replace the authored stairs. Three student-authored switchbacks remain unresolved.
