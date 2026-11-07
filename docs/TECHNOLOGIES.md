# Tools and technologies

Storm Royale is a static front-end game. There is no custom game server.

## Runtime and language

| Piece | Choice |
| --- | --- |
| Language | JavaScript (ES modules) |
| Host | Web browser (WebGL) |
| Module bundler / dev server | [Vite](https://vite.dev/) 6 |
| Package manager | npm |

## Rendering and audio

| Piece | Choice |
| --- | --- |
| 3D engine | [Three.js](https://threejs.org/) 0.170 (WebGL) |
| Scene | Lambert lighting, shadows, fog, follow camera |
| Audio | Web Audio API (`AudioContext`) for short beeps |

No physics engine. Movement, gravity, rooftops, lava, and hits are custom code in `src/main.js`.

## UI

| Piece | Choice |
| --- | --- |
| Markup | `index.html` (HUD, menus, skill tree, minimap canvas) |
| Style | `src/style.css` |
| App logic | `src/main.js` |

Menus, pause, results, how-to, and settings are HTML overlays. The 3D canvas is the match view.

## Persistence

Career data (wins, XP, skill points, unlocks) is stored in **`localStorage`** under `storm-royale-progress`. Clearing site data resets the skill tree.

## Project scripts

From `package.json`:

```bash
npm run dev      # Vite dev server with hot reload
npm run build    # Production bundle in dist/
npm run preview  # Serve the production build locally
```

## Layout

```
storm-royale/
  index.html
  package.json
  src/main.js      # game loop, combat, AI, maps, skills
  src/style.css
  docs/
    TECHNOLOGIES.md
    HOW_TO_PLAY.md
```

## What we did not use

- No React / Vue / other UI framework
- No backend, database, or multiplayer netcode
- Allies and the Stag are local AI, not other human players
- Original art and systems — not Epic / Fortnite IP
