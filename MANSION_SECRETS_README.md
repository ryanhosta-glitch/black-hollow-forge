# Mansion Secrets Generator — design and implementation checkpoint

**Status: deterministic proposal compiler.** This is not a secret-door geometry builder or gameplay integration.

## Design contract
- The student's original `.haunt` is never edited.
- Forge proposes optional, non-critical secrets in an overlay, rather than inventing inaccessible rooms or doors.
- Secret doors or physically connected chambers require verified architectural adjacency and a separate explicit construction pass.
- No secret is placed in staircases, elevators or corridors; rooms can opt out using `noForgeSecrets` or `noSecrets`.
- The default selection rate is 40% of eligible rooms (adjustable); selection and wall placement are stable for a given blueprint.
- Author-authored doors/windows reserve the central wall slot and are never altered.
- A real collision/interior furnishing pass must check each proposed position before activating it.
- Black Hollow—not Forge—manages discovery, events, animation, reward, ghosts and mission state.

## Run locally
`python mansion_secrets.py houses/ferres-estate/source.haunt houses/ferres-estate/navigation/forge_secrets.json`

## Next implementation passes
1. Validate semantic placement against imported room furniture and accurate wall meshes.
2. Generate optimized Gothic meshes for each prop and connect them as non-destructive floor overlays.
3. Make Black Hollow consume IDs/interaction labels through its existing game event system.
4. Only after physical checks add secret passages to rooms with verified neighboring spaces.

See `mansion_secrets.html` for a mobile-friendly catalogue of *proposed* secrets.
