# 🐔 Big Bad Chicken

> **Eat seeds. Eat chickens. Eat cows. Eat skyscrapers. Climb to Level 1,000,000!**

A fast-paced, addictive Katamari / Hole.io style web arcade game. Take control of a delightfully ferocious chicken with an insatiable appetite. Start out as a tiny backyard hatchling pecking at wheat seeds, corn kernels, and earthworms. As your size expands and your hunger ticks down, graduate to swallowing rival chickens, sheep, cows, barns, speeding sedans, glass skyscrapers, and planetary wonders!

Built for the **[Hefty Raccoon Arcade Portal](https://game.heftyracoon.com)**.

---

## 🎮 Gameplay Features

- **Hole.io / Katamari Damacy Devouring Physics**:
  - Anything smaller than your hungry beak gets pulled into your gravitational suction vortex!
  - Watch seeds, critters, tractors, and skyscrapers wobble, shrink, spin, and get swallowed whole.
  - Dynamic 2.5D camera automatically pulls back smoothly as you grow from mouse-size to continental titan.

- **Exponential Level System (Up to Level 1,000,000)**:
  - Progression accelerates rapidly with each tier of object consumed.
  - Climb through 12 milestones:
    - 🐣 **Level 1**: *Hatchling*
    - 🐥 **Level 10**: *Yard Pecking Order*
    - 🌱 **Level 50**: *Garden Menace*
    - 🐔 **Level 100**: *Barnyard Terror*
    - 🐓 **Level 500**: *Apex Rooster* (Goal < 3m 30s &bull; +65 🪙)
    - 🏘️ **Level 1,000**: *Township Devourer* (Goal < 5m 20s &bull; +100 🪙)
    - 🚗 **Level 5,000**: *Suburban Leviathan* (Goal < 7m 30s &bull; +150 🪙)
    - 🦖 **Level 10,000**: *Kaiju Clucker* (Goal < 10m &bull; +220 🪙)
    - 🏙️ **Level 50,000**: *Skyscraper Crusher* (Goal < 13m &bull; +350 🪙)
    - 🌆 **Level 100,000**: *Metropolis Feaster* (Goal < 16m &bull; +500 🪙)
    - 🌋 **Level 500,000**: *Titan of the Coop* (Goal < 20m &bull; +800 🪙)
    - 🌌 **Level 1,000,000**: *COSMIC APOCALYPSE CHICKEN* (Goal < 25m &bull; +2,000 🪙)

- **The Hunger Bar & Aggressive Falloff**:
  - Your chicken has a lightning-fast metabolism that accelerates as you grow larger!
  - **Steep Hunger Falloff**: The amount of hunger replenished by objects smaller than you drops off aggressively:
    - Items within your tier and size give full nourishment.
    - As you outgrow snacks, their hunger replenishment plunges according to $(\text{optimalSize} / \text{playerSize})^{2.5}$.
    - Items from outgrown tiers give 0% to 1% hunger. Giant chickens cannot survive on backyard seeds; you must continually hunt massive prey to stay alive!
  - If your hunger reaches zero, you starve and lose.
  - Tension heartbeat audio pulse and screen vignette warn you when hunger falls below 25%.

- **Speedrun Milestone Coin Economy**:
  - **Zero Coins from Food**: Devouring everyday items, seeds, animals, or structures awards score, calories, and growth, but **0 coins**.
  - **Coins Are Earned ONLY via Speedrun Milestones**: Beat the clock by reaching exponential level-up tiers within strict target time thresholds!
    - Level 10 within 25s: **+15 Coins**
    - Level 50 within 60s: **+25 Coins**
    - Level 100 within 120s: **+40 Coins**
    - Scaling all the way to Level 1,000,000 within 25 minutes for **+2,000 Coins**!
  - The live HUD displays your survival time and target threshold pace in real time.

- **Silly Chicken Shop & Tradeoffs**:
  - Save up hard-earned speedrun coins to unlock 9 unique chicken skins in the Main Menu shop. Every chicken features distinct strengths alongside a **negative curse/tradeoff**:
    1. **Classic Clucker** (Free):
       - ✨ **Pro**: Balanced all-rounder (zero curses or debuffs).
       - ⚠️ **Con**: No special abilities or vacuum boosts.
    2. **Speedy Pecker** (200 Coins):
       - ✨ **Pro**: +35% Sprint & movement speed.
       - ⚠️ **Con**: *Hyper Metabolism* — Hunger drains +50% faster.
    3. **Shadow Chicken** (480 Coins):
       - ✨ **Pro**: +50% Katamari suction vortex range.
       - ⚠️ **Con**: *Void Sluggishness* — -20% movement speed.
    4. **Lava Chicken** (1,120 Coins):
       - ✨ **Pro**: *Molten Core* — -35% slower hunger drain rate.
       - ⚠️ **Con**: *Scorched Food* — Incinerates food, yielding -30% XP & calories.
    5. **Disco Chicken** (2,240 Coins):
       - ✨ **Pro**: +100% longer combo window & funky trails.
       - ⚠️ **Con**: *Distracted Grooving* — -35% smaller suction radius.
    6. **Cyber Cluck 2077** (4,400 Coins):
       - ✨ **Pro**: +35% Turbo speed & instant jet dash.
       - ⚠️ **Con**: *Battery Overheat* — Jet dashing burns 3x hunger & -20% suction radius.
    7. **Golden Nugget** (8,800 Coins):
       - ✨ **Pro**: *Midas Touch* — +100% extra coins (2x payout!) on milestone speed clears.
       - ⚠️ **Con**: *Solid Gold Density* — -22% movement speed & +30% higher metabolic hunger drain.
    8. **T-Rex Chicken** (17,600 Coins):
       - ✨ **Pro**: *Apex Predator* — Spawns +40% larger & +50% suction vortex range.
       - ⚠️ **Con**: *Gluttonous Carnivore* — +65% brutal hunger drain rate.
    9. **Cosmic Overlord** (32,000 Coins):
       - ✨ **Pro**: *Cosmic Singularity* — +80% suction, +30% speed, 2.5x milestone coins.
       - ⚠️ **Con**: *Event Horizon Decay* — +85% catastrophic hunger drain rate.

- **Mobile-First & Desktop Friendly Controls**:
  - **Mobile**: Dynamic virtual joystick (touch anywhere on left/screen to steer) + tactile **⚡ DASH** button.
  - **Desktop**: **WASD / Arrow Keys** or **Mouse cursor follow** to steer + **Spacebar** to dash.
  - **Pause**: `Esc` or `P` key, or tap the on-screen pause button.

- **Procedural Web Audio Engine**:
  - 100% zero-dependency audio synthesized directly with the Web Audio API.
  - Upbeat retro chiptune background music with dynamic tempo ramping on combos.
  - Satisfying pecks, suction pops, crunches, squawks, fanfare trumpets, and coin chimes.

---

## 🛠️ Architecture

```
big-bad-chicken/
├── index.html                 # Mobile-first canvas layout, HUD, menus & shop
├── assets/
│   └── favicon.svg            # Animated rooster SVG icon
├── css/
│   └── style.css              # Neon arcade aesthetic & responsive controls
├── js/
│   ├── constants.js           # 7 Object tiers, skin catalog, exponential math
│   ├── audio.js               # Web Audio synthesizer, sfx & dynamic BGM
│   ├── controls.js            # Virtual joystick, touch, keyboard & mouse
│   ├── entities.js            # Player, AI chickens, consumables, particles
│   ├── map.js                 # 5000x5000 multi-biome world & spatial hash
│   ├── renderer.js            # 2.5D Katamari camera, shaders & particle effects
│   ├── shop.js                # Economy, skin unlocks & localStorage persistence
│   └── game.js                # Game state loop, hunger & exponential leveling
└── .github/workflows/
    └── deploy.yml             # SSH automated deployment to production server
```

---

## 🚀 Deployment

This game deploys automatically to the **Hefty Raccoon Arcade Portal** at `/var/www/html/games/big-bad-chicken` upon pushing to `main` via `.github/workflows/deploy.yml`.
