# Gothic Surface Fidelity pass

The main Forge estate viewer now uses `surface_fidelity.js`, a procedural texture layer with UV projection for GLB meshes missing texture coordinates. Includes slate tiles, stone blocks, wood grain, damask wallpaper, veined marble, and differentiated brass/iron roughness/metalness.

- Non-destructive: preserves original GLBs and original materials as fallback; `Victorian Textures` toggle swaps materials in the viewer.
- Mobile: procedural maps 256 px; desktop: 512 px.
- Original v8.5.19 bridge remains in the package. Some surfaces use new Forge-generated textures rather than identical original-game assets.
- Limitation: viewer-only material enhancement, **not baked into exported GLBs**. Generated UVs use simple planar projection, not hand-unwrapped seams; some curved/sculpted forms may stretch. Actual browser appearance and phone framerate need field testing.
