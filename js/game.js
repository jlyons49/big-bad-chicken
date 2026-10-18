/**
 * Big Bad Chicken - Main Game Engine & State Coordinator
 */

import { GAME_CONFIG, calculateLevelData, formatNumber, getItemLevelEfficiency } from './constants.js';
import { PlayerChicken, Particle, FloatingText } from './entities.js';
import { WorldMap } from './map.js';
import { GameRenderer } from './renderer.js';
import { InputController } from './controls.js';
import { sound } from './audio.js';
import { shop } from './shop.js';

export class BigBadChickenGame {
  constructor() {
    this.state = 'MENU'; // 'MENU', 'PLAYING', 'PAUSED', 'GAMEOVER'
    
    // Components
    this.canvas = document.getElementById('gameCanvas');
    this.renderer = new GameRenderer(this.canvas);
    this.controls = new InputController();
    this.worldMap = new WorldMap();
    this.player = null;
    
    // Game entities & effects
    this.particles = [];
    this.floatingTexts = [];
    
    // Game session metrics
    this.score = 0;
    this.totalCalories = 0;
    this.currentLevel = 1;
    this.itemsEaten = 0;
    this.sessionCoins = 0;
    
    // Combo system
    this.comboCount = 0;
    this.comboTimer = 0;
    this.comboMultiplier = 1.0;
    
    // Loop
    this.lastTime = performance.now();
    this.animationId = null;

    this.initDOM();
    this.initHUD();
  }

  initDOM() {
    // Bind controls
    const joystickBase = document.getElementById('joystickBase');
    const joystickThumb = document.getElementById('joystickThumb');
    const dashBtn = document.getElementById('dashBtn');
    this.controls.bindUIElements(this.canvas, joystickBase, joystickThumb, dashBtn);

    // Audio Buttons
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    const musicToggleBtn = document.getElementById('musicToggleBtn');
    if (soundToggleBtn) {
      soundToggleBtn.onclick = () => {
        const active = sound.toggleSound();
        soundToggleBtn.classList.toggle('muted', !active);
        soundToggleBtn.innerHTML = active ? '🔊' : '🔇';
      };
      soundToggleBtn.classList.toggle('muted', sound.soundMuted);
      soundToggleBtn.innerHTML = sound.soundMuted ? '🔇' : '🔊';
    }

    if (musicToggleBtn) {
      musicToggleBtn.onclick = () => {
        const active = sound.toggleMusic();
        musicToggleBtn.classList.toggle('muted', !active);
        musicToggleBtn.innerHTML = active ? '🎵' : '🔇';
      };
      musicToggleBtn.classList.toggle('muted', sound.musicMuted);
      musicToggleBtn.innerHTML = sound.musicMuted ? '🔇' : '🎵';
    }

    // Play button in menu
    const playBtn = document.getElementById('playBtn');
    if (playBtn) {
      playBtn.onclick = () => this.startGame();
    }

    // Shop button in menu
    const shopBtn = document.getElementById('shopBtn');
    const shopModal = document.getElementById('shopModal');
    const closeShopBtn = document.getElementById('closeShopBtn');
    if (shopBtn && shopModal) {
      shopBtn.onclick = () => {
        sound.peck();
        this.openShopModal();
      };
    }
    if (closeShopBtn && shopModal) {
      closeShopBtn.onclick = () => {
        sound.peck();
        shopModal.classList.remove('active');
        this.updateMenuHUD();
      };
    }

    // Pause & Resume buttons
    const pauseBtn = document.getElementById('pauseBtn');
    const pauseModal = document.getElementById('pauseModal');
    const resumeBtn = document.getElementById('resumeBtn');
    const restartBtn = document.getElementById('restartBtn');
    const quitBtn = document.getElementById('quitBtn');

    if (pauseBtn) {
      pauseBtn.onclick = () => this.togglePause();
    }
    if (resumeBtn) {
      resumeBtn.onclick = () => this.togglePause();
    }
    if (restartBtn) {
      restartBtn.onclick = () => {
        pauseModal.classList.remove('active');
        this.startGame();
      };
    }
    if (quitBtn) {
      quitBtn.onclick = () => {
        pauseModal.classList.remove('active');
        this.showMainMenu();
      };
    }

    // Game Over buttons
    const playAgainBtn = document.getElementById('playAgainBtn');
    const gameOverMenuBtn = document.getElementById('gameOverMenuBtn');
    if (playAgainBtn) {
      playAgainBtn.onclick = () => {
        document.getElementById('gameOverModal').classList.remove('active');
        this.startGame();
      };
    }
    if (gameOverMenuBtn) {
      gameOverMenuBtn.onclick = () => {
        document.getElementById('gameOverModal').classList.remove('active');
        this.showMainMenu();
      };
    }

    this.updateMenuHUD();
  }

  initHUD() {
    this.hungerFillEl = document.getElementById('hungerFill');
    this.hungerTextEl = document.getElementById('hungerText');
    this.hungerContainerEl = document.getElementById('hungerContainer');
    this.levelBadgeEl = document.getElementById('levelBadge');
    this.levelNumberEl = document.getElementById('levelNumber');
    this.levelTitleEl = document.getElementById('levelTitle');
    this.levelFillEl = document.getElementById('levelFill');
    this.hudCoinsEl = document.getElementById('hudCoins');
    this.hudCoinCardEl = document.getElementById('hudCoinCard');
    this.comboBadgeEl = document.getElementById('comboBadge');
    this.comboTextEl = document.getElementById('comboText');
    this.milestoneBannerEl = document.getElementById('milestoneBanner');
  }

  updateMenuHUD() {
    const menuCoinsEl = document.getElementById('menuCoins');
    const menuHighScoreEl = document.getElementById('menuHighScore');
    const menuMaxLevelEl = document.getElementById('menuMaxLevel');
    const equippedPreviewCanvas = document.getElementById('equippedPreviewCanvas');
    const equippedSkinName = document.getElementById('equippedSkinName');
    const equippedSkinPerk = document.getElementById('equippedSkinPerk');

    if (menuCoinsEl) menuCoinsEl.textContent = shop.coins.toLocaleString();
    if (menuHighScoreEl) menuHighScoreEl.textContent = shop.stats.highScore.toLocaleString();
    if (menuMaxLevelEl) menuMaxLevelEl.textContent = formatNumber(shop.stats.highestLevel);

    const skin = shop.getEquippedSkin();
    if (equippedSkinName) equippedSkinName.textContent = skin.name;
    if (equippedSkinPerk) equippedSkinPerk.textContent = skin.perk;
    if (equippedPreviewCanvas) {
      shop.drawSkinPreview(equippedPreviewCanvas, skin);
    }
  }

  openShopModal() {
    const shopModal = document.getElementById('shopModal');
    const shopItemsContainer = document.getElementById('shopItemsContainer');
    const shopCoinsEl = document.getElementById('shopCoins');

    if (shopCoinsEl) shopCoinsEl.textContent = shop.coins.toLocaleString();

    shop.renderShopUI(shopItemsContainer, (newCoins) => {
      if (shopCoinsEl) shopCoinsEl.textContent = newCoins.toLocaleString();
      this.updateMenuHUD();
    });

    shopModal.classList.add('active');
  }

  startGame() {
    sound.ensureContext();
    sound.startMusic();
    sound.cluck(true);

    const equippedSkin = shop.getEquippedSkin();
    this.player = new PlayerChicken(this.worldMap.centerX, this.worldMap.centerY, equippedSkin);
    this.worldMap.populateInitialWorld();

    this.renderer.camX = this.player.x;
    this.renderer.camY = this.player.y;
    const initialTargetRadius = this.renderer.getTargetScreenRadius();
    this.renderer.zoom = initialTargetRadius / this.player.size;
    this.renderer.targetZoom = this.renderer.zoom;

    this.particles = [];
    this.floatingTexts = [];
    this.score = 0;
    this.totalCalories = 0;
    this.currentLevel = 1;
    this.itemsEaten = 0;
    this.sessionCoins = 0;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.comboMultiplier = 1.0;

    // Reset UI
    document.getElementById('mainMenu').classList.remove('active');
    document.getElementById('gameHUD').classList.add('active');
    document.getElementById('dashBtn').classList.remove('hidden');

    this.state = 'PLAYING';
    this.lastTime = performance.now();
    this.updateHUD();

    if (!this.animationId) {
      this.loop(performance.now());
    }
  }

  showMainMenu() {
    this.state = 'MENU';
    sound.stopMusic();
    sound.stopHeartbeat();

    document.getElementById('gameHUD').classList.remove('active');
    document.getElementById('dashBtn').classList.add('hidden');
    document.getElementById('mainMenu').classList.add('active');
    this.updateMenuHUD();
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      sound.stopHeartbeat();
      document.getElementById('pauseModal').classList.add('active');
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      document.getElementById('pauseModal').classList.remove('active');
      this.lastTime = performance.now();
    }
  }

  triggerGameOver() {
    this.state = 'GAMEOVER';
    sound.gameOver();
    this.controls.haptic(100);

    // Save stats & award session coins
    shop.recordGameStats(this.score, this.currentLevel, this.itemsEaten, this.sessionCoins);

    // Populate Game Over modal
    document.getElementById('gameOverLevel').textContent = formatNumber(this.currentLevel);
    document.getElementById('gameOverScore').textContent = this.score.toLocaleString();
    document.getElementById('gameOverEaten').textContent = this.itemsEaten.toLocaleString();
    document.getElementById('gameOverCoins').textContent = `+${this.sessionCoins.toLocaleString()}`;

    const levelData = calculateLevelData(this.totalCalories);
    document.getElementById('gameOverTitle').textContent = `${levelData.badge} ${levelData.currentTierTitle}`;

    document.getElementById('gameOverModal').classList.add('active');
  }

  loop(currentTime) {
    this.animationId = requestAnimationFrame((t) => this.loop(t));

    const dt = Math.min(0.08, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    // Check pause key from controls
    if (this.controls.consumePause()) {
      if (this.state === 'PLAYING' || this.state === 'PAUSED') {
        this.togglePause();
      }
    }

    if (this.state === 'PLAYING') {
      this.update(dt);
    }

    // Render world
    if (this.player) {
      this.renderer.updateCamera(this.player, dt);
      this.renderer.render(this.worldMap, this.player, this.particles, this.floatingTexts, dt);
    }
  }

  update(dt) {
    const player = this.player;

    // 1. Update Controls
    this.controls.update(this.renderer.width / 2, this.renderer.height / 2);

    // 2. Update Player
    player.update(dt, this.controls.moveVector, this.controls.isDashing);

    // 3. Hunger Management
    if (player.hunger <= 0) {
      this.triggerGameOver();
      return;
    }

    if (player.hunger <= GAME_CONFIG.HUNGER_LOW_THRESHOLD) {
      sound.startHeartbeat();
      if (this.hungerContainerEl) {
        this.hungerContainerEl.classList.add('danger-pulse');
      }
    } else {
      sound.stopHeartbeat();
      if (this.hungerContainerEl) {
        this.hungerContainerEl.classList.remove('danger-pulse');
      }
    }

    // 4. Update Combos
    if (this.comboCount > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
        this.comboMultiplier = 1.0;
        sound.setTempoMultiplier(1.0);
        this.updateComboUI();
      }
    }

    // 5. Update World Population & Respawning (throttled)
    this.worldMap.maintainPopulation(player, dt);

    const suctionRad = player.getSuctionRadius();
    const suctionSq = suctionRad * suctionRad;

    // 6. Update AI Chickens
    for (let i = this.worldMap.aiChickens.length - 1; i >= 0; i--) {
      const ai = this.worldMap.aiChickens[i];
      ai.update(dt, player);

      // Check if player can eat AI Chicken
      if (player.canEat(ai.size)) {
        const dx = player.x - ai.x;
        const dy = player.y - ai.y;
        const distSq = dx * dx + dy * dy;

        if (distSq <= suctionSq) {
          ai.state = 'sucked';
          const dist = Math.sqrt(distSq);
          if (dist > 0.001) {
            const step = Math.max(380, GAME_CONFIG.SUCTION_SPEED * (player.size / 24)) * dt;
            ai.x += (dx / dist) * step;
            ai.y += (dy / dist) * step;
          }
          ai.size = Math.max(4, ai.size - dt * 25);

          if (dist <= Math.max(16, player.size * 0.4)) {
            // Eaten AI chicken - remove before consumeItem
            this.worldMap.aiChickens.splice(i, 1);
            this.consumeItem({
              name: 'Rival Chicken',
              points: ai.points,
              hunger: ai.hunger,
              coins: ai.coins,
              tier: 3,
            }, ai.x, ai.y, true);
          }
        }
      }
    }

    // 7. Update Consumables & Suction
    for (let i = this.worldMap.items.length - 1; i >= 0; i--) {
      const item = this.worldMap.items[i];
      if (item.isEaten) {
        this.worldMap.items.splice(i, 1);
        continue;
      }

      const dx = player.x - item.x;
      const dy = player.y - item.y;
      const distSq = dx * dx + dy * dy;

      // Only trigger suction if player is bigger and item is within suction radius
      if (!item.isSucked && player.canEat(item.size) && distSq <= suctionSq) {
        item.isSucked = true;
      }

      // If being sucked into mouth
      if (item.isSucked) {
        const swallowed = item.updateSuction(dt, player);
        if (swallowed) {
          // Remove from world map items before calling consumeItem
          this.worldMap.items.splice(i, 1);
          this.consumeItem(item, item.x, item.y, false);
        }
      }
    }

    // 8. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      if (this.particles[i].update(dt)) {
        this.particles.splice(i, 1);
      }
    }

    // 9. Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      if (this.floatingTexts[i].update(dt)) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // 10. Update HUD
    this.updateHUD();
  }

  consumeItem(item, x, y, isChicken = false) {
    this.itemsEaten++;
    this.controls.haptic(20);

    // Calculate Combo
    this.comboCount++;
    this.comboTimer = GAME_CONFIG.COMBO_TIMEOUT * (this.player.skin.id === 'disco' ? 1.5 : 1.0);
    if (this.comboCount >= 20) this.comboMultiplier = 3.5;
    else if (this.comboCount >= 10) this.comboMultiplier = 2.5;
    else if (this.comboCount >= 5) this.comboMultiplier = 1.8;
    else if (this.comboCount >= 2) this.comboMultiplier = 1.3;
    else this.comboMultiplier = 1.0;

    // Upbeat music tempo ramping with combo
    sound.setTempoMultiplier(1.0 + Math.min(0.35, this.comboCount * 0.015));

    // Level Efficiency: early level items become basically useless once you size past them!
    const efficiency = getItemLevelEfficiency(this.player.size, item.tier || 1);

    // Points & Leveling (XP/calories drives exponential level progression)
    const gainedPoints = Math.round(item.points * this.comboMultiplier * efficiency);
    this.score += gainedPoints;
    this.totalCalories += gainedPoints;

    // Coins - Scarce & Challenging Economy
    // Common everyday foods give 0 coins. Combos do NOT multiply coins (only XP/score).
    const rawCoins = item.coins || 0;
    let gainedCoins = 0;
    if (rawCoins > 0) {
      gainedCoins = Math.max(1, Math.round(rawCoins * playerCoinMult(this.player.skin)));
      this.sessionCoins += gainedCoins;
    }

    // Feed player: growth increment is 0 if gainedPoints is 0
    // Hunger is restored, though diminished for outgrown crumbs
    const hungerRestored = efficiency > 0 ? item.hunger : Math.min(0.3, item.hunger * 0.05);
    this.player.feed(gainedPoints, hungerRestored);

    // Audio SFX
    sound.eat(item.tier);
    if (isChicken) {
      sound.cluck(true);
      this.renderer.addScreenShake(8, 0.25);
    } else if (item.tier >= 4 && efficiency > 0) {
      this.renderer.addScreenShake(Math.min(14, item.tier * 2.5), 0.2);
    }

    // Particles & Floating Text
    this.spawnCrumbs(x, y, item.color || '#fef08a', item.tier);
    const sizeScale = this.player.size / 24;
    const isGolden = item.template && item.template.isGolden;

    // Floating Coin text (ONLY when actual coins are earned!)
    if (gainedCoins > 0) {
      this.floatingTexts.push(
        new FloatingText(
          x,
          y - this.player.size * 0.75,
          `+${gainedCoins} 🪙`,
          isGolden ? '#fef08a' : '#facc15',
          Math.max(16, 14 + Math.min(10, Math.round(gainedCoins * 0.3))),
          0.85,
          sizeScale
        )
      );

      // Bump the HUD coin counter with visual bounce animation
      if (this.hudCoinCardEl) {
        this.hudCoinCardEl.classList.remove('bump');
        void this.hudCoinCardEl.offsetWidth;
        this.hudCoinCardEl.classList.add('bump');
      }
    }

    if (isGolden) {
      sound.coin();
    }

    // Check Exponential Level Progression
    const prevLevel = this.currentLevel;
    const levelData = calculateLevelData(this.totalCalories);
    this.currentLevel = levelData.level;

    if (this.currentLevel > prevLevel) {
      const levelDiff = this.currentLevel - prevLevel;
      if (levelDiff >= 10 || Math.random() < 0.3) {
        this.floatingTexts.push(new FloatingText(this.player.x, this.player.y - this.player.size * 1.2, `+${formatNumber(levelDiff)} LVL!`, '#38bdf8', 22, 1.1, sizeScale));
      }

      // Check Milestone crossing
      if (Math.floor(this.currentLevel / 100) > Math.floor(prevLevel / 100) ||
          this.currentLevel >= 10 && prevLevel < 10 ||
          this.currentLevel >= 1000 && prevLevel < 1000 ||
          this.currentLevel >= 10000 && prevLevel < 10000 ||
          this.currentLevel >= 100000 && prevLevel < 100000 ||
          this.currentLevel >= 1000000 && prevLevel < 1000000) {
        this.triggerMilestone(levelData);
      } else {
        sound.levelUp();
      }
    }

    this.updateComboUI();
  }

  triggerMilestone(levelData) {
    sound.milestone();
    this.renderer.addScreenShake(12, 0.4);
    this.controls.haptic(60);

    // Fireworks particles
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 260;
      const colors = ['#facc15', '#f43f5e', '#38bdf8', '#4ade80', '#c084fc'];
      this.particles.push(
        new Particle(
          this.player.x, this.player.y,
          Math.cos(angle) * speed, Math.sin(angle) * speed,
          colors[Math.floor(Math.random() * colors.length)],
          6 + Math.random() * 6,
          1.2,
          'circle'
        )
      );
    }

    if (this.milestoneBannerEl) {
      this.milestoneBannerEl.innerHTML = `
        <div class="milestone-badge">${levelData.badge}</div>
        <div class="milestone-text">
          <div class="milestone-sub">NEW EXPONENTIAL TIER REACHED!</div>
          <div class="milestone-title">${levelData.currentTierTitle}</div>
          <div class="milestone-lvl">LEVEL ${levelData.formattedLevel}</div>
        </div>
      `;
      this.milestoneBannerEl.classList.add('show');
      setTimeout(() => {
        this.milestoneBannerEl.classList.remove('show');
      }, 2600);
    }
  }

  spawnCrumbs(x, y, color, tier = 1) {
    const count = 5 + tier * 2;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 120;
      this.particles.push(
        new Particle(
          x, y,
          Math.cos(angle) * speed, Math.sin(angle) * speed,
          color,
          3 + Math.random() * 4,
          0.45 + Math.random() * 0.35,
          'circle'
        )
      );
    }
  }

  updateHUD() {
    if (!this.player) return;

    // Hunger Bar
    const hungerPct = Math.max(0, Math.min(100, this.player.hunger));
    if (this.hungerFillEl) {
      this.hungerFillEl.style.width = `${hungerPct}%`;
      if (hungerPct <= 25) {
        this.hungerFillEl.style.background = 'linear-gradient(90deg, #dc2626, #ef4444)';
      } else {
        this.hungerFillEl.style.background = 'linear-gradient(90deg, #f97316, #eab308)';
      }
    }
    if (this.hungerTextEl) {
      this.hungerTextEl.textContent = `${Math.ceil(hungerPct)}%`;
    }

    // Exponential Level
    const levelData = calculateLevelData(this.totalCalories);
    if (this.levelNumberEl) {
      this.levelNumberEl.textContent = levelData.formattedLevel;
    }
    if (this.levelBadgeEl) {
      this.levelBadgeEl.textContent = levelData.badge;
    }
    if (this.levelTitleEl) {
      this.levelTitleEl.textContent = levelData.currentTierTitle;
    }
    if (this.levelFillEl) {
      this.levelFillEl.style.width = `${Math.round(levelData.progress * 100)}%`;
    }

    // Coins
    if (this.hudCoinsEl) {
      this.hudCoinsEl.textContent = (shop.coins + this.sessionCoins).toLocaleString();
    }
  }

  updateComboUI() {
    if (!this.comboBadgeEl || !this.comboTextEl) return;
    if (this.comboCount >= 2) {
      this.comboBadgeEl.classList.add('active');
      this.comboTextEl.textContent = `${this.comboCount}x COMBO (${this.comboMultiplier.toFixed(1)}x XP & SCORE!)`;
    } else {
      this.comboBadgeEl.classList.remove('active');
    }
  }
}

function playerCoinMult(skin) {
  return skin.coinBonus || 1.0;
}

// Auto instantiate on load
window.addEventListener('DOMContentLoaded', () => {
  window.bigBadChickenGame = new BigBadChickenGame();
});
