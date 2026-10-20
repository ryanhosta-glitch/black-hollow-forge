# Forge architectural five-pass upgrade

## Pass 1 — Openings
Auto-selected Forge windows now become actual cutouts in per-room wall geometry, with glass and Victorian trim. This is compiled for EVERY compatible .haunt, not specific to Ferre’s Estate. The source.haunt is preserved byte-for-byte.

## Pass 2 — Façade
Exterior-only cornices, pilasters, quoins, opening trim and masonry accents continue to use the room-union perimeter. Extra window units are visibly integrated into those façades.

## Pass 3 — Roof
The existing blueprint-outline roof compiler, perimeter cornices and material colors are preserved. **Not** a new watertight mansard roof solver; complex roof intersections remain an open limitation.

## Pass 4 — Room-aware interiors
Authored stone, marble, damask, darkwood and wainscot treatments are preserved. Window frames can now be seen from inside the room as well as outside. No new furnishing system or full PBR textures have been implemented.

## Pass 5 — Audit and packaging
`navigation/forge_window_enhancements.json` contains an auditable per-floor list of enhancements, the authored-source hash is retained, and the GLB exports use the same window coordinates as the report. Any reported openings are geometric voids in rendered room-wall meshes, not yet validated with directional lighting or complete collision.

## Known limitations
Floor slabs, stairs, gameplay collision, showcase sculpture and full material/texturing require separate visual/browser validation and additional implementation. Window glass is a static transparent color; no physical window opening/closing animation is implemented. Existing staircase safety reports remain in the package.
