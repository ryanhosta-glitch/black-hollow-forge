# Forge elevator access: Moonveil acceptance pass

The Impossible Elevator is a pocket-space travel hub, not a physical shaft that
must line up through the submitted floor plan. Every house starts in the Grand
Main Hall. Its upper cabin can serve every normal floor.

## Import/repair rules

- Keep the supplied source intact. Export `source.haunt`, a separate `repaired.haunt`, and a change log.
- Honor valid `openPlanWith` links by removing the shared wall segment in BOTH rooms and exporting matching full-width apertures. The walking controller crosses these openings without inventing hinged doors.
- Prefer an authored exterior entry or a named front entrance on the main floor. Generate a measured entry if missing.
- Join disconnected touching rooms with a door only where there is sufficient shared wall and jamb clearance. Align paired authored doors. Compact spaces get elevator access instead of dubious tiny hinged routes.
- Build connected components on each floor. Allocate **one elevator entrance per component**. A connected floor gets one; an isolated room/area gets its additional stop. Replanning replaces generated elevator entrances rather than accumulating them.
- Add measured wall cuts, brass jambs and sliding-door metadata. Elevator boarding and arrivals are inside the host room, not inside a wall.
- Export a cabin GLB and `navigation/access_plan.json`; load that contract through the game adapter. A full game still has to bind travel animation, quests and saved state.
- Uncertified stair routes are recorded and bypassed with the elevator. Their floor/ceiling openings remain sealed and unverified treads are not generated. This does not certify arbitrary stairs.
- Repair very low positive ceiling heights to 2.1 metres in the derived blueprint and log the change. Tiny but passable spaces use a first-person camera proposal. Invalid/duplicate room data, impossible clearances and empty submissions remain blockers.

## Boarding rules

The menu is unavailable before boarding. Boarding validates the stop, room,
pocket scene, floor height and distance from its approach point. The walking
preview moves into a separate cabin before presenting destinations. Floor 13 and
any explicitly named secret floor are filtered out until the runtime receives its
unlock flag. Invalid destination requests leave the passenger inside the cabin.

## Test workflow

After publishing: **Forge → Tools → Import a house · Elevator Access Test**.
Click **Try Moonveil Manor** or **Try a one-room house**, then **Start in Grand
Hall**. Climb either Hall stair flight, cross the landing and enter the central
cabin. Use **Enter elevator cabin**, choose a destination, then **Travel**.

Walk through each house's physical door/open-plan routes. Return to its marked
elevator opening to board. An imported room's unverified staircase is not an
active way between floors. File input reads a `.haunt` locally; it does not upload
student blueprints to a server.

`examples/moonveil_access_test.haunt` is the supplied Moonveil record extracted
from Markdown. A Markdown-only `\.` escape in `window.gothic` was removed to make
valid JSON. No authored room coordinates/dimensions were changed in that fixture.
The generated repaired copy is separate. Other student source records are not
included; only their acceptance summary is checked in.

## Automated verification

`node forge_access_plan_test.mjs` runs the Moonveil fixture and synthetic tests.
An optional collection JSON argument reruns the supplied student batch. Tests
cover entry choice, full exports, source preservation, actual open wall geometry,
one-room/low-ceiling/compact examples, door repair, component stop counts,
replanning, wrong-room/scene/height/distance boarding, and Floor 13 locks.

Existing controller door/walking tests, signature stair/GLTFLoader tests and
interaction engine assertions continue to pass. Architectural access readiness is
reported separately from full gameplay certification. Work browser cannot render
WebGL; rendered playthrough, visual clearance and FPS remain pending. Neither
`gameReady` nor `gameplayCertified` is promoted to true by graph reachability.
