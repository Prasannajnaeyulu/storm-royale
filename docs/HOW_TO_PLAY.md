# How to run and how to play

## Requirements

- **Node.js 18** or newer
- A Chromium or Firefox desktop browser
- A mouse (look uses pointer lock)

## Install and run (development)

```bash
cd storm-royale
npm install
npm run dev
```

Vite prints a local URL, usually **http://localhost:5173**. Open it, click **Play**, then click the 3D view so the mouse locks.

If 5173 is busy, Vite picks the next free port (5174, 5175, …). Use the URL it prints.

## Production build

```bash
npm run build
npm run preview
```

`build` writes static files to `dist/`. `preview` serves that folder. You can also host `dist/` on any static file host.

## Goal

You and 11 teal allies fight a giant **Stag** in the middle of the island. Friendly fire is off.

- The match does **not** end when the Stag dies.
- The match **does** end if **you** die (Stag, lava, or leaving the purple ring).
- After **12 seconds**, the **floor is lava**. Stand on colorful buildings, towers, or wood floors. Jump onto a wall to mantle onto a roof.
- Lava stays until **every NPC is dead** (all 11 allies **and** the Stag). Then the ground cools (**SAFE**).
- The purple ring **does not shrink**. One step outside it is instant death.

Maps rotate with wins: Grass Isle → Dune Outpost → Frost Ring → Neon Yard → Ember Peak, then back to Grass Isle every 5 wins.

## Drop flow

1. Click **Play**.
2. Loot gold chests (`R`) — beacons and yellow minimap dots.
3. Chop trees (`E`) for wood and skill points.
4. Guns have **infinite ammo**. Sword is melee (`4`).
5. Team up on the Stag. The HP bar is **THE STAG** at the top.
6. When lava starts, get off the grass. HUD shows **LAVA · X NPCS**.
7. After the last NPC falls, lava ends. Keep playing until you go down.

Open **T** for the skill tree (Combat, Harvest, Building, Survival, Mobility, up to level 100). Spend points; progress saves in the browser.

## Controls

| Input | Action |
| --- | --- |
| WASD or arrow keys | Move |
| Mouse | Look (pointer lock) |
| Space | Jump |
| Space again in the air | Double jump |
| Y in the air | Stomp (slam down; hurts the Stag if you land close) |
| 1 | Pistol |
| 2 | Tactical rifle |
| 3 | Pump shotgun |
| 4 | Sword |
| G or left click | Shoot or slash |
| E | Swing axe (trees) |
| R | Open chest / loot |
| Q | Wall |
| F | Floor |
| C | Ramp |
| Right click | Place the selected build |
| H | Pause / resume |
| T | Skill tree |

In **Settings**, change look sensitivity.

## Tips

- Double jump then **Y** to stomp the Stag from above.
- Walk into a building and jump to mantle onto the roof before lava.
- Allies are teal on the minimap; you are green; the Stag is tan.
- Leaving the purple circle kills you instantly, even after lava cools.
