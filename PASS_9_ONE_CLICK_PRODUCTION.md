# Pass 9 — One-Click Mansion Production

Run from the Forge root:

```bash
python forge_production.py houses/ferres-estate/source.haunt --reuse houses/ferres-estate --out builds/ferres --zip builds/ferres.zip
```

To compile a new student mansion:

```bash
python forge_production.py student.haunt --out builds/student --zip builds/student.zip
```

`--reuse` is allowed **only** when the source SHA-256 matches the existing compiled estate. It preserves previous supplemental exports but does not regenerate their source-dependent analyses. Fresh compilation emits geometry, navigation, integrity and door/window artifacts; optional reports absent for new estates are explicitly listed as missing.

The production report has separate `compiled` and `certifiedPlayable` fields. No compiler-only run is gameplay-certified. Models, stair routes, first-person collision, browser appearance and missions still require actual runtime checks. Original `.haunt` files are never rewritten.
