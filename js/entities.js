/**
 * Big Bad Chicken - Entities: Player Chicken, AI Chickens, Consumables & Particles
 */

import { GAME_CONFIG, ITEM_TIERS } from './constants.js';

export class PlayerChicken {
  constructor(x, y, skin) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.angle = 0;
    this.targetAngle = 0;
    
    this.size = GAME_CONFIG.INITIAL_PLAYER_SIZE;
    this.targetSize = this.size;
    this.hunger = GAME_CONFIG.INITIAL_HUNGER;
    
    this.skin = skin;
    this.speed = GAME_CONFIG.BASE_SPEED * (skin.speedBonus || 1.0);
    this.suctionRangeMult = skin.suctionBonus || 1.0;
    this.hungerDrainMult = skin.hungerBonus || 1.0;
    this.coinMult = skin.coinBonus || 1.0;
    
    // Animation timers
    this.walkCycle = 0;
    this.wingFlap = 0;
    this.beakOpen = 0; // 0 to 1
    this.blinkTimer = 2.0;
    this.isBlinking = false;
    this.dashTimer = 0;
    this.growPulse = 0;
  }

  update(dt, inputVector, isDashing) {
    // 1. Hunger Drain - accelerates as the chicken grows (larger size = higher metabolic burn!)
    const metabolismMult = Math.pow(this.size / GAME_CONFIG.INITIAL_PLAYER_SIZE, 0.35);
    let hungerDrainRate = GAME_CONFIG.BASE_HUNGER_DRAIN * this.hungerDrainMult * metabolismMult;
    if (isDashing) {
      hungerDrainRate *= GAME_CONFIG.DASH_HUNGER_DRAIN_RATE;
    }
    this.hunger = Math.max(0, this.hunger - hungerDrainRate * dt);

    // 2. Movement
    // Scale speed with size so on-screen movement speed feels constant and agile
    const sizeScale = this.size / GAME_CONFIG.INITIAL_PLAYER_SIZE;
    let currentSpeed = this.speed * sizeScale;
    if (isDashing && this.hunger > 5) {
      currentSpeed *= GAME_CONFIG.DASH_SPEED_MULTIPLIER;
      this.dashTimer += dt * 15;
    } else {
      this.dashTimer = 0;
    }

    if (inputVector.x !== 0 || inputVector.y !== 0) {
      this.vx = inputVector.x * currentSpeed;
      this.vy = inputVector.y * currentSpeed;
      this.targetAngle = Math.atan2(inputVector.y, inputVector.x);

      this.walkCycle += dt * (isDashing ? 18 : 10);
      this.wingFlap = Math.sin(this.walkCycle) * 0.45;
    } else {
      this.vx *= Math.pow(0.01, dt);
      this.vy *= Math.pow(0.01, dt);
      this.wingFlap *= Math.pow(0.05, dt);
    }

    // Smooth angle interpolation
    let diff = this.targetAngle - this.angle;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.angle += diff * Math.min(1, dt * 14);

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Boundary clamping
    const pad = this.size;
    this.x = Math.max(pad, Math.min(GAME_CONFIG.WORLD_WIDTH - pad, this.x));
    this.y = Math.max(pad, Math.min(GAME_CONFIG.WORLD_HEIGHT - pad, this.y));

    // Smooth size growth
    if (this.size < this.targetSize) {
      this.size += (this.targetSize - this.size) * Math.min(1, dt * 6);
    }

    // Pulse & Blinking
    if (this.growPulse > 0) {
      this.growPulse = Math.max(0, this.growPulse - dt * 3);
    }
    if (this.beakOpen > 0) {
      this.beakOpen = Math.max(0, this.beakOpen - dt * 5);
    }

    this.blinkTimer -= dt;
    if (this.blinkTimer <= 0) {
      this.isBlinking = true;
      if (this.blinkTimer <= -0.15) {
        this.isBlinking = false;
        this.blinkTimer = 1.8 + Math.random() * 2.5;
      }
    }
  }

  feed(calories, hungerRestored) {
    this.hunger = Math.min(GAME_CONFIG.MAX_HUNGER, this.hunger + hungerRestored);
    
    // Growth formula: paced, steady scaling chicken radius per snack
    // Only grows if calories are gained (outgrown items give 0 growth!)
    if (calories > 0) {
      const growthIncrement = Math.min(25, Math.pow(calories, 0.35) * 0.045);
      this.targetSize = Math.min(GAME_CONFIG.MAX_PLAYER_SIZE, this.targetSize + growthIncrement);
      this.growPulse = 1.0;
    }
    this.beakOpen = 1.0;
  }

  getSuctionRadius() {
    return this.size * GAME_CONFIG.SUCTION_RANGE_RATIO * this.suctionRangeMult;
  }

  canEat(objectSize) {
    return this.size >= objectSize * 0.95;
  }
}

export class AIChicken {
  constructor(x, y, tier = 1) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.angle = Math.random() * Math.PI * 2;
    this.targetAngle = this.angle;
    
    this.tier = tier;
    this.size = 20 + Math.random() * 18 + (tier - 1) * 22;
    this.points = Math.round(this.size * 55);
    this.hunger = 25;
    this.coins = tier === 1 ? 1 : tier === 2 ? 2 : 3;
    
    this.speed = 140 + Math.random() * 40;
    this.state = 'wander'; // 'wander', 'peck', 'flee', 'sucked'
    this.stateTimer = 1 + Math.random() * 2;
    this.walkCycle = 0;
    this.wingFlap = 0;
    this.beakOpen = 0;
    this.isPanicking = false;
    
    // Palette variation
    const hues = ['#ffffff', '#fef08a', '#fed7aa', '#cbd5e1', '#b45309', '#e2e8f0'];
    this.bodyColor = hues[Math.floor(Math.random() * hues.length)];
  }

  update(dt, player) {
    if (this.state === 'sucked') return;

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distToPlayer = Math.hypot(dx, dy);

    // If player is bigger and within danger range -> FLEE!
    if (player.canEat(this.size) && distToPlayer < player.size * 4.5) {
      this.state = 'flee';
      this.isPanicking = true;
      this.targetAngle = Math.atan2(-dy, -dx) + (Math.random() - 0.5) * 0.4;
      this.speed = 280;
    } else {
      this.isPanicking = false;
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        if (Math.random() < 0.6) {
          this.state = 'wander';
          this.targetAngle = Math.random() * Math.PI * 2;
          this.stateTimer = 1.5 + Math.random() * 2.5;
          this.speed = 90 + Math.random() * 60;
        } else {
          this.state = 'peck';
          this.stateTimer = 0.8 + Math.random() * 1.2;
          this.speed = 0;
        }
      }
    }

    if (this.speed > 0) {
      this.vx = Math.cos(this.angle) * this.speed;
      this.vy = Math.sin(this.angle) * this.speed;
      this.walkCycle += dt * (this.isPanicking ? 24 : 10);
      this.wingFlap = Math.sin(this.walkCycle) * (this.isPanicking ? 0.7 : 0.3);
    } else {
      this.vx = 0;
      this.vy = 0;
      this.wingFlap = 0;
      this.beakOpen = Math.abs(Math.sin(Date.now() * 0.012));
    }

    // Angle rotation
    let diff = this.targetAngle - this.angle;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.angle += diff * Math.min(1, dt * 8);

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Boundaries
    const pad = this.size;
    this.x = Math.max(pad, Math.min(GAME_CONFIG.WORLD_WIDTH - pad, this.x));
    this.y = Math.max(pad, Math.min(GAME_CONFIG.WORLD_HEIGHT - pad, this.y));
  }
}

export class ConsumableItem {
  constructor(x, y, template, tier) {
    this.x = x;
    this.y = y;
    this.template = template;
    this.tier = tier;
    
    this.id = template.id;
    this.name = template.name;
    this.size = template.size;
    this.points = template.points;
    this.hunger = template.hunger;
    this.coins = template.coins;
    this.color = template.color;
    this.shape = template.shape;
    
    // Katamari/Hole.io suction physics
    this.isSucked = false;
    this.isEaten = false;
    this.scale = 1.0;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 1.5;
    this.wobblePhase = Math.random() * Math.PI * 2;
  }

  updateSuction(dt, player) {
    if (!this.isSucked || this.isEaten) return false;

    // Aim for the front of the player (the beak)
    const mouthDist = player.size * 0.85;
    const mouthX = player.x + Math.cos(player.angle) * mouthDist;
    const mouthY = player.y + Math.sin(player.angle) * mouthDist;

    const dx = mouthX - this.x;
    const dy = mouthY - this.y;
    const dist = Math.hypot(dx, dy);

    // Accelerate into the mouth
    const pullSpeed = Math.max(380, GAME_CONFIG.SUCTION_SPEED * (player.size / 24));
    const step = pullSpeed * dt;

    if (dist <= Math.max(12, step * 1.5)) {
      // Swallowed!
      this.isEaten = true;
      this.isSucked = false;
      return true;
    }

    this.x += (dx / dist) * step;
    this.y += (dy / dist) * step;

    // Shrink and spin into the vortex
    this.scale = Math.max(0.15, dist / (player.size * 1.8));
    this.rotation += dt * 18;

    return false;
  }
}

export class Particle {
  constructor(x, y, vx, vy, color, size, life, shape = 'circle') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.maxLife = life;
    this.life = life;
    this.shape = shape;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 8;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vx *= Math.pow(0.1, dt);
    this.vy *= Math.pow(0.1, dt);
    this.rotation += this.rotationSpeed * dt;
    this.life -= dt;
    return this.life <= 0;
  }
}

export class FloatingText {
  constructor(x, y, text, color = '#fef08a', fontSize = 18, life = 1.0, scale = 1.0) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.fontSize = fontSize;
    this.life = life;
    this.maxLife = life;
    this.vy = -55 * Math.max(1, scale);
  }

  update(dt) {
    this.y += this.vy * dt;
    this.life -= dt;
    return this.life <= 0;
  }
}
