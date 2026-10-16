# Last Week of School

An original, single-encounter math-powered JRPG prototype. Four students face the Bell-Ringer in a school hallway. Built with **Phaser 4.2.1, Vite 8, and TypeScript**. No accounts, paid services, runtime AI, or external art/fonts.

## Play from your iPad — after reviewing the changes

1. Open this repository on GitHub in Safari. Review and merge the game changes into **main**. If using Codex's change review, create the pull request there first.
2. On GitHub, open **Settings → Pages → Build and deployment → Source**, and select **GitHub Actions**. You may need Safari's **Request Desktop Website** to see Settings. You must have repository administrator access.
3. Open **Actions → Deploy game to Pages → Run workflow**, select `main`, and run it. Later pushes to main deploy automatically. Wait for the green check. If the run says the `github-pages` environment needs approval, approve that deployment on GitHub.
4. Open **https://s-goodspeed3.github.io/Math-Game-/** in Safari. This address will work only after the workflow succeeds; this task does not claim it is already live.
5. Rotate to landscape. Tap **Math settings**, choose skills, and save. Tap **Start the showdown**.
6. To install, use Safari's **Share → Add to Home Screen → Add**. Open it once while online and allow the first load to finish; the cached game can then work offline. New versions require a connection. If the app doesn't update, close and reopen it online.

No terminal or local development tools are needed on your iPad. Safari and physical-device installation have not been tested in this cloud environment.

## How to play

- Tap an available student's card to choose who acts next. Each living student acts once per round, then the enemy acts. Highlighted cards show the active student; used cards are disabled until next round.
- **Attack:** reliable 24 base damage, no math or MP required. Enemy shields reduce damage.
- **Spell:** choose level 1 / 2 / 3, spending 3 / 6 / 9 MP. All levels draw only from enabled curriculum skills. The hero determines the spell; the skill mix determines the question. No timer.
- **Sunny (+):** heals every standing teammate. **Mina (−):** damages and weakens enemy attacks for three enemy turns. **Dex (×):** a high-damage combo. **Quinn (÷):** breaks shields, damages, and restores 2 MP to the team.
- **Defend:** reduces incoming damage by 55% until that student's next turn and restores 4 MP (maximum 24).
- A wrong answer reveals a worked solution and optional visual model. Retry the same question or cast with help. Either route still activates the spell at 65% power; an incorrect answer never cancels your turn. MP is spent only when casting.
- The enemy cycles paper-ball attacks, backpack shields, and a party-wide desk-rattle. Watch the intent label. At zero Confidence students sit out; defeat means everyone is out. Win by reducing enemy Swagger to zero. Both outcomes offer a fresh battle.
- Sound begins only after a player action. The top-right button mutes it. Practice attempts and curriculum choices stay locally on this device when storage is available. Clearing website data deletes them; the battle itself is not saved.

## Local development

Node.js 24 and npm are recommended. From the repository root:

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

The base path is `/Math-Game-/`. Open that path on Vite's printed server address. `dist/` contains the deployable static site. No environment variables, credentials, API keys, or backend are required to play.

Browser checks use Playwright and require a Chromium executable. Start the production preview first, then:

```sh
# On this cloud machine Chromium is already at /usr/bin/chromium.
node tests/browser.mjs
node tests/spells.mjs
node tests/offline.mjs
```

Set `CHROMIUM_PATH` if your system uses another executable path. These tests use port 4173. Tests are intentionally separate from CI's deterministic unit tests so Pages deployment does not depend on a downloaded browser.

## Code map

- `src/math.ts`: typed curriculum catalog, level variations, deterministic answer validation, procedural question generation, explanations, and practice record schema. No runtime AI.
- `src/combat.ts`: unit definitions and pure damage / spell calculations.
- `src/main.ts`: battle orchestration, menus, action gating, local settings and practice persistence, optional Web Audio effects.
- `src/scene.ts`: original procedural hallway and cartoon students, idle motion, attacks, impact particles, reaction feedback, victory motion.
- `src/style.css`: responsive DOM controls, safe-area padding, touch targets and focus states. Phaser draws the scene; HTML provides readable, accessible math and controls.
- `public/`: original SVG/PNG app icons, install manifest, same-origin offline worker.
- `.github/workflows/deploy.yml`: frozen dependency installation, tests, production build, GitHub Pages deployment.

Extend curriculum by adding a skill definition and generator, then testing all difficulty levels. Keep story progress separate from enabled math skills. Future typed/interactive answers can use the existing question/validation boundary; only the multiple-choice renderer currently exists.

## Curriculum scope and standards status

Implemented: addition, subtraction, multiplication, division, signed-number comparisons, and unit rates. Elementary foundations and sixth-grade skills can be mixed independently. Fractions, decimal arithmetic, percentages, geometry, algebra, statistics, and seventh/eighth-grade curricula are **future work**, not functioning toggles.

Reference: [Illinois mathematics standards (ISBE)](https://www.isbe.net/Documents/math-standards.pdf).
The structured catalog records proposed Common Core/Illinois identifiers `2.NBT.5`, `4.NBT.5`, `4.NBT.6`, `6.NS.7a`, and `6.RP.2`, grade levels, prerequisites, and difficulty descriptions. **Official Illinois reference verification is incomplete:** access to the requested ISBE PDF returned HTTP 403 in this environment. These identifiers must be checked against that PDF before calling this standards-aligned curriculum. The prototype is not a comprehensive standards assessment.

## Validation and limitations

Automated math tests sample 1,800 generated questions across six skills and three levels, independently calculate each numeric answer, check unique options and answer validation, and verify increasing spell cost/reward and defensive calculations. Browser tests exercise menus, skill selection, hero selection, wrong-answer explanation/retry, assisted casting, enemy turns, victory, defeat, and restart. An additional production test exercises a landscape-phone layout and offline reload/play. All of these checks passed in the cloud Chromium browser, including a full victory and a full defeat. Real Safari device testing remains outstanding.

This is one battle, not the full roguelike. There is no inventory, progression, campaign, adaptive practice, spaced review scheduling, battle save, or boss content. Practice records provide a foundation for those systems. Sound is synthesized; all artwork is created in code. Real iPad/iPhone Safari and Home Screen installation still need device testing. GitHub Pages deployment needs repository settings and a successful Actions run; it has not been published by this task.

## Assets

All character, hallway, icon and UI artwork was created for this repository. No third-party image, font, or audio asset pack is used. Dependencies retain their respective licenses (Phaser, Vite, TypeScript, tsx, Playwright).
