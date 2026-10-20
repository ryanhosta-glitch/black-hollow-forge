# First Fully Forged Mansion — integration milestone

Actual floor/roof GLBs are loaded through a reusable module (`game_import/forge_house_adapter.mjs`) rather than copied into another preview engine.

Visit `game_integration_gate.html` on GitHub Pages: mouse and touchscreen orbit around the generated mansion, hide roof, review geometry import and contract.

`game_import/acceptance_gate.py` verifies original `.haunt` SHA-256, room IDs, referenced exports, and presence of navigation data. Run `python game_import/acceptance_gate.py houses/ferres-estate`.

**NOT done:** full v8.5.19 story/quest integration, mesh-level collision and stair/headroom certification, original material texture parity, elevator system bindings. **Do not mistake GLB import for a completed playable game.**
