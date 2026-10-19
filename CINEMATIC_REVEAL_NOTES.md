# Black Hollow Forge — Cinematic Estate Reveal

This release builds directly on the Beautiful but Abandoned release and preserves the .haunt, existing GLBs, stair safety diagnostics, window compiler, and room intelligence artifacts.

## New in the inspector (`index.html`)
- A **Cinematic Reveal** button moves the orbit camera through a seven-and-a-half-second sweeping establishing shot and then returns camera control.
- Procedural preview-only grounds: a dark earth plane, a ring of dead trees, gravestones, and sparse spectral lights. These assets are generated in Three.js at runtime, **not authored rooms or baked GLBs**.
- Independently selectable grounds, atmospheric mist, and nighttime lightning flashes (no new audio interruptions).
- Estate-only atmosphere; the special Grand Hall and Floor 13 inspection scenes remain isolated.
- Gothic estate visual direction preserved from the previous package.

## Known limitations
- These landscape models are stylized, generated from simple primitives; they are not photo-real 3D assets.
- Screenshot and JavaScript syntax verification are not browser visual QA. Please inspect the reveal on GitHub Pages.
- No runtime gameplay collision for graves or trees; these are viewer preview effects.
- No claims of full GLB material baking, full game integration or certified stair traversal.

## GitHub upload
Extract ZIP. Copy its **contents** to the root of your cloned `black-hollow-forge` repository, leaving the hidden `.git` directory untouched. Commit and Push origin using GitHub Desktop. Force-refresh the Pages site. Click **Cinematic Reveal** at top-right of the main `index.html`.
