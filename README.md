# Black Hollow Forge 0.7 — Victorian Visual Pass

**Static GLB inspection build for screenshot review, not the production game.**

## New visual changes from 0.6
- Main Hall: coffered ceiling details, layered gilded panels, expanded balustrades, more elaborate lion mane and globe engraving, raven eyes, ornate estate map, triple-tier chandeliers.
- Floor 13 Conservatory: tile seams, additional greenhouse mullions, planted fern fronds, fountain rim, specimen cabinet, catwalk railing details, flytrap teeth, spectral orchid sculptures.
- Mansion roof: slate shingle courses, Victorian dormer proxies, finials and decorative cornices on a mansard model; retains the authored mansard roof choice.
- Existing 0.6 floor geometry, architectural finishes, entry logic, and navigation metadata preserved.

## To deploy
Extract this ZIP and upload its **contents**, preserving the directory hierarchy, to the same `black-hollow-forge` GitHub repository. Replace the existing files, commit, and wait for Pages deployment.

## Photo checklist
Capture Whole House + roof, Dollhouse Cutaway, Main Hall from stair foot, Main Hall top landing, and Floor 13 conservatory. Show strange geometry and clipping as well as successful views.

## Limitations and honesty
- These are **static procedural proxy meshes**; not photorealistic sculptures, foliage, layered textured wallpaper, or final haunted animations.
- Existing 8.5.19 procedural textures have not yet been baked/reused into these GLBs.
- Source `.haunt` is never modified; roof bounding envelope still covers recessed sections and courtyards.
- No first-person movement, gameplay, player collision, elevator transport, or dynamic map in this viewer.
- GitHub Pages serves files; the Python compiler must run separately.
