# Back to the Roster

Mobile-first Lei Wulong fan minigame for **#WeNeedLeiWulongBack**.

## Play

https://bendozafpv.github.io/lei-back-to-the-roster/

Choose a difficulty and a 1-, 2-, or 3-minute mission, then press **START CASE**. The Case video starts when Lei is inside the office. Mission time begins after the intro; **INTRO ÜBERSPRINGEN** skips it.

- Touch: **SPRINGEN** (blue), **AUSWEICHEN** (green), **ANGRIFF** (red). Keyboard: Space / W / Arrow Up to jump; Shift / C / Arrow Down to dodge; X / Enter to attack.
- Ground attacks use the punch animation; attacks activated while airborne use the existing jumping-kick poses with a lower, extended hitbox and impact trail.
- Jump over yellow barriers; attack crates, training dummies and drones.
- **Training:** direct attacks, two-hit enemies, one heart per five files.
- **Arcade (default):** enemies guard attacks. Dodge just before a strike when **AUSWEICHEN** appears, then counter during the **ANGRIFF** opening. Jumping also avoids strikes. Three-hit enemies gain another hit point in the last district. One heart per eight files; speed rises 38% during the mission.
- **Hardcore:** faster pace, shorter warnings, stronger enemies and one heart per ten files. Speed rises 50% during the mission.
- Arcade and Hardcore shuffle obstacle types with safe spacing between hazards.
- The Roster Gate counters attacks in Arcade and Hardcore. Use the green dodge button and red attack button to break its six/eight locks. Training keeps four direct hits.
- Dodge provides a 0.36-second evasion window against enemy and Gate strikes, with a 1.25-second cooldown (1.35 seconds in Hardcore) from activation. It works on the ground, cancels queued attacks/jumps and does not protect against obstacle collisions. The green button shows cooldown and readiness.
- Scores are stored separately for each difficulty and duration. Pausing stops mission time.

## Files

- `index.html`: office intro and game launcher.
- `assets/case-intro.mp4`: supplied Case campaign clip, trimmed from source 2.0 seconds (office scene), with audio preserved.
- `assets/case-poster.jpg`: video poster frame.
- `game.html`: complete V9 game with embedded artwork; can also be played independently offline.
- `test-difficulty.cjs`, `test-launcher.cjs`: gameplay and intro integration checks using Node's standard library.

Serve the repository root for the full intro experience. GitHub Pages uses **main / (root)**.

## Validation

Run `node test-difficulty.cjs` and `node test-launcher.cjs`. Gameplay checks simulate four viewport sizes, all three difficulties, and both 30 and 60 FPS. They verify that ground attack spam loses while timed dodges and counters can win without damage; healing, progression, pause and separate score storage are also covered. Launcher checks verify difficulty and duration forwarding, game pause during the office intro, and a single resume when skipping.

## About

Unofficial fan project; not affiliated with Bandai Namco. Lei Wulong and Tekken belong to their respective rights holders.
