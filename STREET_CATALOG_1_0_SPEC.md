# Haunted Street Catalog 1.0 (draft)

This is a registry of published homes, not a replacement for the CASA package.

- `catalogVersion`: `1.0`
- `houses`: array of records `{houseId, name, creator, description, address, preview, casa, gameReady}`
- `houseId` is stable across rename; `address` is the mailbox number and must be unique.
- `preview` is a separately hosted optimized exterior model for quick street streaming.
- `casa` points to the compiled mansion archive. Neither path should be constructed from the displayed name.
- `gameReady=false` houses can appear only in developer/test street mode until traversal and runtime integration pass.

Security and correctness: host only approved packages and reject duplicate IDs/addresses; escape all names when displayed; validate all referenced paths and resulting archive before marking `gameReady`.
