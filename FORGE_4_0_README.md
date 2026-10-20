# Forge 4.0 Browser Universal CASA QA Compiler

This pass adds `universal_casa_compiler.html` for loading arbitrary student `.haunt` blueprints in GitHub Pages and compiling a `.casa` without Python. It preserves Forge 3.8/3.9 and the detailed Ferre’s Estate publisher.

## Verified features
- Required stable room IDs and finite positive room dimensions; reject duplicates/malformed plans.
- Game entry validated with fallback warning.
- Distinct per-floor GLB models with floors, ceilings, segmented walls around doors and windows.
- Lightweight QA exterior preview GLB.
- ZIP-compatible CASA archive with manifest, identity, blueprint, navigation, and SHA-256 inventory.
- Explicit uncertified collision, stairs, gameplay-loader warning.

## Limits
The browser QA compiler is a *separate simplified geometry renderer*; it is NOT wired to high-detail Forge engine. Stair physical geometry, accurate roofs, PBR, furnishing and runtime collisions are NOT exported. Client-side browser functional walktest is not yet completed. Files must be hosted on GitHub Pages or a local HTTP server; browser crypto.subtle requires secure origin except localhost.

## Next pass
Wire shared high-detail Forge GLB generation for arbitrary input, certify stairs and player physics, and implement the CASA-first game runtime loader.
