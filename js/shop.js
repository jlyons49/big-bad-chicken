/**
 * Big Bad Chicken - Shop & Economy Manager
 * Handles coin balance, skin catalog, unlocks, perks, and local persistence.
 */

import { CHICKEN_SKINS } from './constants.js';
import { sound } from './audio.js';

export class ShopManager {
  constructor() {
    this.coins = 0;
    this.unlockedSkins = new Set(['classic']);
    this.equippedSkinId = 'classic';
    this.stats = {
      highScore: 0,
      highestLevel: 1,
      totalEaten: 0,
      totalCoinsEarned: 0,
      gamesPlayed: 0,
    };

    this.load();
  }

  load() {
    try {
      const savedCoins = localStorage.getItem('bbc_coins');
      if (savedCoins !== null) {
        this.coins = parseInt(savedCoins, 10) || 0;
      }

      const savedSkins = localStorage.getItem('bbc_unlocked_skins');
      if (savedSkins) {
        const arr = JSON.parse(savedSkins);
        this.unlockedSkins = new Set(arr);
      }
      this.unlockedSkins.add('classic');

      const savedEquipped = localStorage.getItem('bbc_equipped_skin');
      if (savedEquipped && this.unlockedSkins.has(savedEquipped)) {
        this.equippedSkinId = savedEquipped;
      }

      const savedStats = localStorage.getItem('bbc_stats');
      if (savedStats) {
        this.stats = { ...this.stats, ...JSON.parse(savedStats) };
      }

      // Economy migration: Reset legacy coins so coins are earned purely through milestone speed thresholds!
      if (localStorage.getItem('bbc_econ_v3') !== 'true') {
        this.coins = 0;
        localStorage.setItem('bbc_econ_v3', 'true');
        this.save();
      }
    } catch (e) {
      console.warn('Error loading shop state:', e);
    }
  }

  save() {
    try {
      localStorage.setItem('bbc_coins', this.coins.toString());
      localStorage.setItem('bbc_unlocked_skins', JSON.stringify([...this.unlockedSkins]));
      localStorage.setItem('bbc_equipped_skin', this.equippedSkinId);
      localStorage.setItem('bbc_stats', JSON.stringify(this.stats));
    } catch (e) {
      console.warn('Error saving shop state:', e);
    }
  }

  addCoins(amount) {
    if (amount <= 0) return;
    this.coins += Math.round(amount);
    this.stats.totalCoinsEarned += Math.round(amount);
    this.save();
  }

  getEquippedSkin() {
    return CHICKEN_SKINS.find((s) => s.id === this.equippedSkinId) || CHICKEN_SKINS[0];
  }

  isUnlocked(skinId) {
    return this.unlockedSkins.has(skinId);
  }

  isEquipped(skinId) {
    return this.equippedSkinId === skinId;
  }

  canAfford(skinId) {
    const skin = CHICKEN_SKINS.find((s) => s.id === skinId);
    return skin && this.coins >= skin.cost;
  }

  buySkin(skinId) {
    const skin = CHICKEN_SKINS.find((s) => s.id === skinId);
    if (!skin || this.isUnlocked(skinId)) return false;

    if (this.coins >= skin.cost) {
      this.coins -= skin.cost;
      this.unlockedSkins.add(skinId);
      this.equippedSkinId = skinId;
      this.save();
      sound.purchase();
      return true;
    }
    return false;
  }

  equipSkin(skinId) {
    if (this.unlockedSkins.has(skinId)) {
      this.equippedSkinId = skinId;
      this.save();
      sound.peck();
      return true;
    }
    return false;
  }

  recordGameStats(score, level, itemsEaten, coinsGained) {
    this.stats.gamesPlayed++;
    this.stats.totalEaten += itemsEaten;
    if (score > this.stats.highScore) {
      this.stats.highScore = score;
    }
    if (level > this.stats.highestLevel) {
      this.stats.highestLevel = level;
    }
    this.addCoins(coinsGained);
    this.save();
  }

  /**
   * Renders the Shop items inside a container element
   */
  renderShopUI(containerEl, onCoinUpdate) {
    if (!containerEl) return;
    containerEl.innerHTML = '';

    CHICKEN_SKINS.forEach((skin) => {
      const card = document.createElement('div');
      card.className = `shop-card ${skin.rarity.toLowerCase()}`;
      if (this.isEquipped(skin.id)) {
        card.classList.add('equipped');
      }

      const unlocked = this.isUnlocked(skin.id);
      const equipped = this.isEquipped(skin.id);

      card.innerHTML = `
        <div class="shop-card-badge">${skin.rarity}</div>
        <div class="skin-preview-wrap">
          <canvas class="skin-canvas" width="90" height="90" data-skin="${skin.id}"></canvas>
        </div>
        <div class="shop-card-info">
          <h3 class="skin-title">${skin.name}</h3>
          <p class="skin-subtitle">${skin.subtitle}</p>
          <div class="skin-perk">⚡ ${skin.perk}</div>
        </div>
        <div class="shop-card-action">
          ${
            equipped
              ? `<button class="btn btn-equipped" disabled>EQUIPPED</button>`
              : unlocked
              ? `<button class="btn btn-equip" data-action="equip" data-id="${skin.id}">EQUIP</button>`
              : `<button class="btn btn-buy ${this.canAfford(skin.id) ? '' : 'disabled'}" data-action="buy" data-id="${skin.id}">
                  <span class="coin-icon">🪙</span> ${skin.cost.toLocaleString()}
                </button>`
          }
        </div>
      `;

      containerEl.appendChild(card);
    });

    // Render Canvas previews for each skin card
    containerEl.querySelectorAll('.skin-canvas').forEach((cvs) => {
      const skinId = cvs.getAttribute('data-skin');
      const skin = CHICKEN_SKINS.find((s) => s.id === skinId);
      if (skin) {
        this.drawSkinPreview(cvs, skin);
      }
    });

    // Button event delegations
    containerEl.onclick = (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      const id = btn.getAttribute('data-id');

      if (action === 'buy') {
        if (this.buySkin(id)) {
          this.renderShopUI(containerEl, onCoinUpdate);
          if (onCoinUpdate) onCoinUpdate(this.coins);
        }
      } else if (action === 'equip') {
        if (this.equipSkin(id)) {
          this.renderShopUI(containerEl, onCoinUpdate);
          if (onCoinUpdate) onCoinUpdate(this.coins);
        }
      }
    };
  }

  drawSkinPreview(canvas, skin) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2 + 6;
    const r = 26;

    ctx.save();

    // Aura
    if (skin.colors.aura) {
      ctx.beginPath();
      ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
      ctx.fillStyle = skin.colors.aura;
      ctx.globalAlpha = 0.35;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    // Shadow
    ctx.beginPath();
    ctx.ellipse(cx, cy + r - 3, r * 0.9, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fill();

    // Comb
    ctx.beginPath();
    ctx.arc(cx - 7, cy - r + 3, 7, 0, Math.PI * 2);
    ctx.arc(cx, cy - r - 2, 8, 0, Math.PI * 2);
    ctx.arc(cx + 7, cy - r + 4, 6, 0, Math.PI * 2);
    ctx.fillStyle = skin.colors.comb;
    ctx.fill();

    // Body
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = skin.colors.body;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = skin.colors.wing;
    ctx.stroke();

    // Wings
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.65, cy + 3, 8, 14, -0.2, 0, Math.PI * 2);
    ctx.ellipse(cx + r * 0.65, cy + 3, 8, 14, 0.2, 0, Math.PI * 2);
    ctx.fillStyle = skin.colors.wing;
    ctx.fill();

    // Eyes
    ctx.beginPath();
    ctx.arc(cx - 7, cy - 4, 4.5, 0, Math.PI * 2);
    ctx.arc(cx + 7, cy - 4, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = skin.colors.eyes;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx - 6, cy - 5, 1.5, 0, Math.PI * 2);
    ctx.arc(cx + 8, cy - 5, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Beak
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy + 2);
    ctx.lineTo(cx + 6, cy + 2);
    ctx.lineTo(cx, cy + 13);
    ctx.closePath();
    ctx.fillStyle = skin.colors.beak;
    ctx.fill();

    // Special skin visual flairs
    if (skin.id === 'cyber') {
      // Neon visor line
      ctx.beginPath();
      ctx.moveTo(cx - 13, cy - 4);
      ctx.lineTo(cx + 13, cy - 4);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (skin.id === 'golden') {
      // Star glint
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx - 10, cy - 12, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (skin.id === 'disco') {
      // Rainbow highlight
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 12, cy - 10, 24, 6);
    }

    ctx.restore();
  }
}

export const shop = new ShopManager();
