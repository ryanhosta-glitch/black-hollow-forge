# Progressive Haunting Engine — Forge proposal export v2

This checkpoint upgrades the existing Mansion Secrets proposals, rather than fabricating game effects.

- Default distribution: 50% concealed history, 35% supernatural disturbances, 15% impossible architecture. For small houses, integer quotas use largest remainder; some tiers may be absent.
- Escalation stages use deterministic room ID ordering, progressing from history to spectral disturbance to impossible architecture.
- Floor 13 is preferentially eligible for special handling **only if authored**. This generator does not build a new floor.
- Impossible spaces are **pocket-scene proposals**, never unvalidated holes/portals or secret graph edges. Every such scene must have a tested exit returning to its authored room.
- Every proposal remains optional, reversible, and outside the critical mission path.
- All original .haunt room geometries and openings stay unchanged.
- Actual engine reactions, collision safe placement, and game integration remain future work.

Open `mansion_secrets.html` on GitHub Pages to review tier assignments. Run `python mansion_secrets.py path/to/source.haunt path/to/forge_secrets.json` to generate v2 output for another student mansion.
