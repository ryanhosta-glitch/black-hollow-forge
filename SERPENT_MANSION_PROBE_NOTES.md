# Serpent Spiral — Mansion Geometry Probe

This new page loads `floor_01.glb`, `floor_02.glb` and the aligned `connection_024_aligned_spiral.glb` together at their exported elevations. It evaluates raycast floor support and head-level interference at 151 locations along the candidate stair route.

**Not a certified physical stair:** point raycasting is not swept body collision, and the route is constrained. A pass does not authorize runtime activation. Upper slab openings and room doorway traversal must be verified against imported mesh geometry and the original game runtime. No source `.haunt` changes.

Open `serpent_mansion_probe.html` on GitHub Pages. On mobile, drag to orbit and use the slider.
