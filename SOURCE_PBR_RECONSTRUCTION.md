# Black Hollow Forge 1.2 — Source PBR reconstruction

- Replaced five source texture families in `houses/ferres-estate/geometry/floor_01.glb` (and the root geometry mirror), **not only viewer overrides**.
- Material assignment: 271 mapped mesh names, preserving original material family selection, source mesh names, geometry, and student-authored `source.haunt`.
- Albedo, normal, metallic-roughness textures are 512x512. Marble uses warped multiscale, nonuniform mineral features; mahogany uses warped grain; damask uses drawn symmetric floral motifs; plaster and brass have fine imperfections.
- Embedded textures have no dependency on external CDN. The Material Atelier previews identical images.
- The runtime surface-fidelity bridge now preserves the imported BlackHollow_ PBR materials when Victorian Textures is ON; other meshes continue using the runtime procedural layer.
- This is procedural art, not calibrated scanned photography; UV tiling, browser lighting and physical correctness need visual review.
- No runtime/browser or gameplay certification.
