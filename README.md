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
    - 🐓 **Level 500**: *Apex Rooster*
    - 🏘️ **Level 1,000**: *Township Devourer*
    - 🚗 **Level 5,000**: *Suburban Leviathan*
    - 🦖 **Level 10,000**: *Kaiju Clucker*
    - 🏙️ **Level 50,000**: *Skyscraper Crusher*
    - 🌆 **Level 100,000**: *Metropolis Feaster*
    - 🌋 **Level 500,000**: *Titan of the Coop*
    - 🌌 **Level 1,000,000**: *COSMIC APOCALYPSE CHICKEN*

- **The Hunger Bar**:
  - Your chicken has a lightning-fast metabolism. The hunger bar constantly drains!
  - If your hunger reaches zero, you starve and lose.
  - Feast continuously to maintain stamina and trigger feasting combo streaks.
  - Tension heartbeat audio pulse and screen vignette warn you when hunger falls below 25%.

- **Roaming AI Chickens**:
  - Other chickens wander the farmyard, pecking seeds and strutting.
  - When you grow larger than them, they panic, squawk, and flee—chase them down for massive feasts!

- **Silly Chicken Shop & Economy**:
  - Earn gold coins from everything you consume and combos.
  - Unlock and equip 9 unique, hilarious chicken skins in the Main Menu shop:
    1. **Classic Clucker** (Default red & white barnyard rooster)
    2. **Speedy Pecker** (+22% Base Sprint & Walking Speed)
    3. **Shadow Chicken** (+35% Katamari Suction Vortex Range)
    4. **Lava Chicken** (-25% Slower Hunger Drain)
    5. **Disco Chicken** (+50% Longer Combo Window & Funky Trails)
    6. **Cyber Cluck 2077** (+30% Speed & Instant Sonic Dash recharge)
    7. **Golden Nugget** (+75% Extra Coins on everything eaten)
    8. **T-Rex Chicken** (+50% Suction & Fearsome Roar Cluck)
    9. **Cosmic Overlord** (Galaxy Singularity: +75% Suction, +50% Speed, 2.5x Coins)

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
