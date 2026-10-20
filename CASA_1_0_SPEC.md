# Black Hollow CASA 1.0 — QA format

A `.casa` is a ZIP-compatible archive containing the relative paths referenced by its `manifest.json`.

## Required
- `manifest.json` with `casa.spec = "black-hollow-casa"`, version `1.0`, `name`, stable `casa.houseId`, `entry`, and `floors`.
- `casa_identity.json` with mailbox name, creator, description, permanent house ID and slug.
- `source.haunt`: unmodified source blueprint.
- `exterior/street_preview.glb`: lightweight visual-only house preview (no physics guarantee).
- `navigation/collision.json` and `navigation/runtime_bridge.json`.
- all referenced floor GLBs, roof and accompanying assets.
- `casa_validation.json`: QA findings.

## Ownership
Forge owns fixed architecture, furnishings, static collision contracts, entry/navigation and safe anchors. Black Hollow owns missions, ghost behavior, supernatural elevators, Floor 13 story, UI and saves.

## Gates
`packagingStatus = QA_PACKAGE` indicates required file integrity, NOT gameplay readiness. `gameReady=false` until Black Hollow has a CASA loader and all staircase routes are certified in-game. Never claim GAME READY based only on successful archive extraction.

## Shipping
`casa_publisher.html` allows naming an existing compiled mansion and exporting a ZIP-compatible `.casa` in a browser with no third-party ZIP scripts. Exports currently use ZIP stored compression for portability; the included sample CASA is Deflate-compressed. The runtime game loader is still an independent future pass.
