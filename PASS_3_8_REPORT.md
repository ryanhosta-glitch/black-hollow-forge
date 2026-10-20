# Forge 3.8 — CASA Integrity and Street Registry

## Implemented
- Publisher synchronizes the displayed name in manifest, CASA identity, and mailbox metadata; the permanent house ID is unchanged on rename.
- Publisher recalculates SHA-256 hashes and byte counts of every non-metadata packaged file.
- Added `build_casa38.py`, an independent Python 3 CASA builder/verifier; it checks ZIP CRC, mandatory content, manifest/identity consistency, GLB headers, source JSON and recorded checksums.
- Drafted Haunted Street Catalog 1.0 and a development-only, one-house registry entry. This does not claim that the game can load CASA yet.

## Known limitations
- Publisher still packages the precompiled Ferre's Estate; Forge does not yet compile arbitrary uploaded `.haunt` files in this publisher.
- The browser exporter uses uncompressed ZIP entries; the Python builder uses Deflate.
- Stairs remain uncertified; game runtime integration and Haunted Street playable level not implemented.
- Catalog CASA URL is a deployment placeholder until a CASA is published to that exact path.
