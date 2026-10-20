# Stage: The Locked Study — 3D Interaction Lab

A contained Three.js experimental room using `forge_interaction_engine.mjs`: a Victorian hinged door requiring a brass key, a searchable desk drawer, and a sealed letter. The user collects the key then unlocks and opens the door, and can search the drawer and take the letter.

Controls: WASD / arrows to move; pointer drag to look; E or Interact to use; touch D-pad on phones. The player uses a 2D collision approximation for walls and the desk. Gameplay is not installed in compiled student mansion GLBs; no stair routes have been certified. Materials are procedurally generated demonstrations, not production meshes.

Test status: JavaScript syntax, deterministic interaction states and rules tested using Node. Browser end-to-end rendering/interaction has not been verified. The student `.haunt` source and original meshes remain unchanged.
