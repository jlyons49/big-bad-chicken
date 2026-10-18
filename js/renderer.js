/**
 * Big Bad Chicken - 2.5D Canvas Renderer & Katamari Dynamic Zoom Engine
 */

export class GameRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    
    // Camera state
    this.camX = 2500;
    this.camY = 2500;
    this.zoom = 1.7;
    this.targetZoom = 1.7;
    
    // Screen shake
    this.shakeIntensity = 0;
    this.shakeDuration = 0;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
  }

  addScreenShake(intensity = 6, duration = 0.2) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeDuration = Math.max(this.shakeDuration, duration);
  }

  updateCamera(player, dt) {
    // Smooth camera position tracking
    this.camX += (player.x - this.camX) * Math.min(1, dt * 9);
    this.camY += (player.y - this.camY) * Math.min(1, dt * 9);

    // Dynamic Katamari Zoom Formula:
    // Starts at 1.75 when player.size is 24
    // Smoothly pulls back as chicken grows to house (size ~350), skyscraper (size ~1000), planet (size ~2000)
    const baseRatio = player.size / 24;
    this.targetZoom = Math.max(0.08, 1.75 / Math.pow(baseRatio, 0.44));
    this.zoom += (this.targetZoom - this.zoom) * Math.min(1, dt * 5);

    // Screen shake update
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
      if (this.shakeDuration <= 0) {
        this.shakeIntensity = 0;
      }
    }
  }

  render(worldMap, player, particles, floatingTexts, dt) {
    const ctx = this.ctx;
    ctx.save();
    ctx.scale(this.dpr, this.dpr);

    // Apply Screen Shake if active
    let shakeX = 0;
    let shakeY = 0;
    if (this.shakeIntensity > 0) {
      shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
    }

    // Clear background
    ctx.fillStyle = '#166534';
    ctx.fillRect(0, 0, this.width, this.height);

    // Camera Transformation Matrix
    ctx.save();
    ctx.translate(this.width / 2 + shakeX, this.height / 2 + shakeY);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.camX, -this.camY);

    // Calculate visible bounding box in world space
    const halfViewW = (this.width / 2) / this.zoom + 100;
    const halfViewH = (this.height / 2) / this.zoom + 100;
    const viewLeft = this.camX - halfViewW;
    const viewRight = this.camX + halfViewW;
    const viewTop = this.camY - halfViewH;
    const viewBottom = this.camY + halfViewH;

    // 1. Draw Environment Terrain & Roads
    this.drawTerrain(ctx, worldMap, viewLeft, viewRight, viewTop, viewBottom);

    // 2. Draw Consumables Shadows & Bodies
    this.drawConsumables(ctx, worldMap, player, viewLeft, viewRight, viewTop, viewBottom, dt);

    // 3. Draw AI Chickens
    this.drawAIChickens(ctx, worldMap.aiChickens, player, viewLeft, viewRight, viewTop, viewBottom);

    // 4. Draw Player Chicken
    this.drawPlayerChicken(ctx, player);

    // 5. Draw Particles in World Space
    this.drawParticles(ctx, particles);

    // 6. Draw Floating Texts in World Space
    this.drawFloatingTexts(ctx, floatingTexts);

    ctx.restore(); // Restore camera translation

    // 7. Screen Overlays (Hunger Warning Vignette)
    this.drawScreenVignette(ctx, player);

    ctx.restore();
  }

  drawTerrain(ctx, worldMap, vL, vR, vT, vB) {
    // Outer cosmic void
    ctx.fillStyle = '#090d16';
    ctx.fillRect(vL - 200, vT - 200, (vR - vL) + 400, (vB - vT) + 400);

    // World Map Biome circles
    for (let i = worldMap.zones.length - 1; i >= 0; i--) {
      const z = worldMap.zones[i];
      ctx.beginPath();
      ctx.arc(worldMap.centerX, worldMap.centerY, z.maxR, 0, Math.PI * 2);
      ctx.fillStyle = z.color;
      ctx.fill();
    }

    // Grid grass texture accents
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;
    const step = 200;
    const startX = Math.floor(Math.max(0, vL) / step) * step;
    const endX = Math.min(worldMap.width, vR);
    const startY = Math.floor(Math.max(0, vT) / step) * step;
    const endY = Math.min(worldMap.height, vB);

    ctx.beginPath();
    for (let x = startX; x <= endX; x += step) {
      ctx.moveTo(x, Math.max(0, vT));
      ctx.lineTo(x, Math.min(worldMap.height, vB));
    }
    for (let y = startY; y <= endY; y += step) {
      ctx.moveTo(Math.max(0, vL), y);
      ctx.lineTo(Math.min(worldMap.width, vR), y);
    }
    ctx.stroke();

    // Roads
    for (let i = 0; i < worldMap.roads.length; i++) {
      const rd = worldMap.roads[i];
      if (rd.type === 'ring') {
        ctx.beginPath();
        ctx.arc(worldMap.centerX, worldMap.centerY, rd.r, 0, Math.PI * 2);
        ctx.strokeStyle = rd.color;
        ctx.lineWidth = rd.width;
        ctx.stroke();

        // Center line
        ctx.strokeStyle = rd.line || '#facc15';
        ctx.lineWidth = 3;
        ctx.setLineDash([16, 16]);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (rd.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(rd.x1, rd.y1);
        ctx.lineTo(rd.x2, rd.y2);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = rd.width;
        ctx.stroke();

        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.setLineDash([14, 14]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // World Boundary Barrier
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#ef4444';
    ctx.strokeRect(0, 0, worldMap.width, worldMap.height);
  }

  drawConsumables(ctx, worldMap, player, vL, vR, vT, vB, dt) {
    const items = worldMap.items;
    const suctionRad = player.getSuctionRadius();
    const suctionSq = suctionRad * suctionRad;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.isEaten) continue;

      // Quick viewport culling
      if (item.x + item.size < vL || item.x - item.size > vR ||
          item.y + item.size < vT || item.y - item.size > vB) {
        continue;
      }

      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.rotation);
      ctx.scale(item.scale, item.scale);

      // Shadow
      ctx.beginPath();
      ctx.ellipse(0, item.size * 0.45, item.size * 0.85, item.size * 0.35, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.fill();

      // Suction trail line if being sucked into mouth
      if (item.isSucked) {
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, item.size * 1.3, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Render shape
      this.drawItemShape(ctx, item);

      ctx.restore();
    }
  }

  drawItemShape(ctx, item) {
    const s = item.size;
    ctx.fillStyle = item.color;

    switch (item.shape) {
      case 'grain':
      case 'kernel':
      case 'crumb':
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.9, s * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'worm':
        ctx.strokeStyle = item.color;
        ctx.lineWidth = s * 0.55;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-s * 0.9, 0);
        ctx.quadraticCurveTo(-s * 0.2, -s * 0.6, 0, 0);
        ctx.quadraticCurveTo(s * 0.4, s * 0.6, s * 0.9, 0);
        ctx.stroke();
        break;

      case 'bug':
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.8, s * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        // Legs
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-s * 0.4, -s * 0.7); ctx.lineTo(-s * 0.4, s * 0.7);
        ctx.moveTo(0, -s * 0.7); ctx.lineTo(0, s * 0.7);
        ctx.moveTo(s * 0.4, -s * 0.7); ctx.lineTo(s * 0.4, s * 0.7);
        ctx.stroke();
        break;

      case 'berry':
      case 'egg':
      case 'tomato':
      case 'pumpkin':
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.85, 0, Math.PI * 2);
        ctx.fill();
        // Little green stem / cap
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(0, -s * 0.8, s * 0.25, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'mouse':
      case 'rabbit':
      case 'cat':
      case 'dog':
      case 'pig':
      case 'sheep':
      case 'cow':
      case 'horse':
        // Animal body
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.85, s * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        // Head
        ctx.beginPath();
        ctx.arc(s * 0.65, 0, s * 0.4, 0, Math.PI * 2);
        ctx.fill();
        // Tiny ears
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(s * 0.7, -s * 0.35, s * 0.15, 0, Math.PI * 2);
        ctx.arc(s * 0.7, s * 0.35, s * 0.15, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'tractor':
      case 'car':
      case 'police':
      case 'bus':
      case 'truck':
        // Vehicle chassis
        ctx.fillRect(-s * 0.85, -s * 0.5, s * 1.7, s);
        // Roof
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-s * 0.4, -s * 0.35, s * 0.8, s * 0.7);
        // Headlights
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(s * 0.75, -s * 0.45, s * 0.15, s * 0.25);
        ctx.fillRect(s * 0.75, s * 0.2, s * 0.15, s * 0.25);
        break;

      case 'house':
      case 'mart':
      case 'barn':
        // Building base
        ctx.fillRect(-s * 0.8, -s * 0.7, s * 1.6, s * 1.4);
        // Roof peak
        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.moveTo(-s * 0.9, -s * 0.7);
        ctx.lineTo(0, -s * 1.15);
        ctx.lineTo(s * 0.9, -s * 0.7);
        ctx.closePath();
        ctx.fill();
        break;

      case 'skyscraper':
      case 'office':
        // High rise glass facade
        ctx.fillRect(-s * 0.7, -s * 0.7, s * 1.4, s * 1.4);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(-s * 0.5, -s * 0.5, s * 1.0, s * 0.2);
        ctx.fillRect(-s * 0.5, -s * 0.1, s * 1.0, s * 0.2);
        ctx.fillRect(-s * 0.5, s * 0.3, s * 1.0, s * 0.2);
        break;

      case 'mountain':
      case 'volcano':
        ctx.beginPath();
        ctx.moveTo(-s, s * 0.8);
        ctx.lineTo(0, -s * 0.9);
        ctx.lineTo(s, s * 0.8);
        ctx.closePath();
        ctx.fill();
        // Lava or snow cap
        ctx.fillStyle = item.shape === 'volcano' ? '#ea580c' : '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-s * 0.35, -s * 0.3);
        ctx.lineTo(0, -s * 0.9);
        ctx.lineTo(s * 0.35, -s * 0.3);
        ctx.closePath();
        ctx.fill();
        break;

      case 'moon':
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.9, 0, Math.PI * 2);
        ctx.fill();
        // Craters
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(-s * 0.3, -s * 0.2, s * 0.2, 0, Math.PI * 2);
        ctx.arc(s * 0.3, s * 0.3, s * 0.25, 0, Math.PI * 2);
        ctx.arc(-s * 0.1, s * 0.4, s * 0.15, 0, Math.PI * 2);
        ctx.fill();
        break;

      default:
        // Generic circle
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.8, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  }

  drawAIChickens(ctx, aiChickens, player, vL, vR, vT, vB) {
    for (let i = 0; i < aiChickens.length; i++) {
      const ai = aiChickens[i];
      if (ai.x + ai.size < vL || ai.x - ai.size > vR ||
          ai.y + ai.size < vT || ai.y - ai.size > vB) {
        continue;
      }

      ctx.save();
      ctx.translate(ai.x, ai.y);
      ctx.rotate(ai.angle);

      // Shadow
      ctx.beginPath();
      ctx.ellipse(0, ai.size * 0.4, ai.size * 0.85, ai.size * 0.35, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fill();

      // Comb
      ctx.beginPath();
      ctx.arc(ai.size * 0.1, -ai.size * 0.65, ai.size * 0.28, 0, Math.PI * 2);
      ctx.arc(ai.size * 0.35, -ai.size * 0.68, ai.size * 0.32, 0, Math.PI * 2);
      ctx.fillStyle = '#dc2626';
      ctx.fill();

      // Body
      ctx.beginPath();
      ctx.arc(0, 0, ai.size * 0.85, 0, Math.PI * 2);
      ctx.fillStyle = ai.bodyColor;
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Wings with flapping animation
      ctx.save();
      ctx.rotate(ai.wingFlap);
      ctx.beginPath();
      ctx.ellipse(-ai.size * 0.1, -ai.size * 0.5, ai.size * 0.5, ai.size * 0.25, -0.2, 0, Math.PI * 2);
      ctx.ellipse(-ai.size * 0.1, ai.size * 0.5, ai.size * 0.5, ai.size * 0.25, 0.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.fill();
      ctx.restore();

      // Eyes
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(ai.size * 0.45, -ai.size * 0.25, ai.size * 0.12, 0, Math.PI * 2);
      ctx.arc(ai.size * 0.45, ai.size * 0.25, ai.size * 0.12, 0, Math.PI * 2);
      ctx.fill();

      // Beak
      ctx.beginPath();
      ctx.moveTo(ai.size * 0.7, -ai.size * 0.2);
      ctx.lineTo(ai.size * (1.1 + ai.beakOpen * 0.15), 0);
      ctx.lineTo(ai.size * 0.7, ai.size * 0.2);
      ctx.closePath();
      ctx.fillStyle = '#f59e0b';
      ctx.fill();

      // Panic sweat drop if fleeing
      if (ai.isPanicking) {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(-ai.size * 0.5, -ai.size * 0.8, ai.size * 0.18, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  drawPlayerChicken(ctx, player) {
    const s = player.size;
    const skin = player.skin;

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    // Dynamic scale pulse on feeding
    const pulseScale = 1.0 + player.growPulse * 0.18;
    ctx.scale(pulseScale, pulseScale);

    // Suction range aura indicator (soft subtle glow)
    const suctionR = player.getSuctionRadius();
    ctx.beginPath();
    ctx.arc(0, 0, suctionR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(254, 240, 138, 0.04)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.14)';
    ctx.lineWidth = Math.max(1.5, 3 / this.zoom);
    ctx.stroke();

    // Skin Aura effect
    if (skin.colors.aura) {
      ctx.beginPath();
      ctx.arc(0, 0, s * 1.25, 0, Math.PI * 2);
      ctx.fillStyle = skin.colors.aura;
      ctx.globalAlpha = 0.35;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    // Shadow
    ctx.beginPath();
    ctx.ellipse(0, s * 0.35, s * 0.95, s * 0.42, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.fill();

    // Feet / Legs (bobbing with walk cycle)
    const legOffset = Math.sin(player.walkCycle) * s * 0.25;
    ctx.strokeStyle = skin.colors.legs;
    ctx.lineWidth = Math.max(2, s * 0.12);
    ctx.lineCap = 'round';
    // Left Foot
    ctx.beginPath();
    ctx.moveTo(-s * 0.25, -s * 0.4);
    ctx.lineTo(-s * 0.25 + legOffset, -s * 0.7);
    ctx.stroke();
    // Right Foot
    ctx.beginPath();
    ctx.moveTo(-s * 0.25, s * 0.4);
    ctx.lineTo(-s * 0.25 - legOffset, s * 0.7);
    ctx.stroke();

    // Tail Feathers
    ctx.fillStyle = skin.colors.comb;
    ctx.beginPath();
    ctx.moveTo(-s * 0.75, 0);
    ctx.quadraticCurveTo(-s * 1.35, -s * 0.45, -s * 1.25, -s * 0.6);
    ctx.quadraticCurveTo(-s * 0.95, -s * 0.15, -s * 0.75, 0);
    ctx.fill();

    // Large Red Comb atop head
    ctx.fillStyle = skin.colors.comb;
    ctx.beginPath();
    ctx.arc(s * 0.1, -s * 0.75, s * 0.32, 0, Math.PI * 2);
    ctx.arc(s * 0.4, -s * 0.8, s * 0.36, 0, Math.PI * 2);
    ctx.arc(s * 0.7, -s * 0.75, s * 0.28, 0, Math.PI * 2);
    ctx.fill();

    // Main Body
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.92, 0, Math.PI * 2);
    ctx.fillStyle = skin.colors.body;
    ctx.fill();
    ctx.lineWidth = Math.max(2, s * 0.05);
    ctx.strokeStyle = skin.colors.wing;
    ctx.stroke();

    // Wings (animated flapping with walk/dash)
    ctx.save();
    ctx.rotate(player.wingFlap);
    ctx.beginPath();
    ctx.ellipse(-s * 0.12, -s * 0.55, s * 0.58, s * 0.28, -0.22, 0, Math.PI * 2);
    ctx.ellipse(-s * 0.12, s * 0.55, s * 0.58, s * 0.28, 0.22, 0, Math.PI * 2);
    ctx.fillStyle = skin.colors.wing;
    ctx.fill();
    ctx.restore();

    // Wattle under beak
    ctx.fillStyle = skin.colors.comb;
    ctx.beginPath();
    ctx.arc(s * 0.8, s * 0.25, s * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Eyes with fierce eyebrows
    if (!player.isBlinking) {
      // Sclera
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s * 0.5, -s * 0.3, s * 0.2, 0, Math.PI * 2);
      ctx.arc(s * 0.5, s * 0.3, s * 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = skin.colors.eyes;
      ctx.beginPath();
      ctx.arc(s * 0.55, -s * 0.3, s * 0.11, 0, Math.PI * 2);
      ctx.arc(s * 0.55, s * 0.3, s * 0.11, 0, Math.PI * 2);
      ctx.fill();

      // Fierce Brow
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = Math.max(2, s * 0.06);
      ctx.beginPath();
      ctx.moveTo(s * 0.35, -s * 0.45); ctx.lineTo(s * 0.65, -s * 0.25);
      ctx.moveTo(s * 0.35, s * 0.45); ctx.lineTo(s * 0.65, s * 0.25);
      ctx.stroke();
    } else {
      // Blinking slit
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = Math.max(2, s * 0.08);
      ctx.beginPath();
      ctx.moveTo(s * 0.4, -s * 0.3); ctx.lineTo(s * 0.65, -s * 0.3);
      ctx.moveTo(s * 0.4, s * 0.3); ctx.lineTo(s * 0.65, s * 0.3);
      ctx.stroke();
    }

    // Beak (snaps open wide when feeding/sucking)
    const mouthGap = player.beakOpen * s * 0.22;
    ctx.fillStyle = skin.colors.beak;
    // Upper beak
    ctx.beginPath();
    ctx.moveTo(s * 0.75, -s * 0.22);
    ctx.lineTo(s * 1.35, 0);
    ctx.lineTo(s * 0.75, -mouthGap);
    ctx.closePath();
    ctx.fill();
    // Lower beak
    ctx.beginPath();
    ctx.moveTo(s * 0.75, mouthGap);
    ctx.lineTo(s * 1.25, 0);
    ctx.lineTo(s * 0.75, s * 0.22);
    ctx.closePath();
    ctx.fill();

    // Custom Skin Visual Additions
    if (skin.id === 'cyber') {
      // Glowing Cyan Visor Line
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = Math.max(3, s * 0.09);
      ctx.beginPath();
      ctx.moveTo(s * 0.4, -s * 0.4);
      ctx.lineTo(s * 0.65, 0);
      ctx.lineTo(s * 0.4, s * 0.4);
      ctx.stroke();
    } else if (skin.id === 'golden') {
      // Gold crown
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(s * 0.2, -s * 0.9);
      ctx.lineTo(s * 0.4, -s * 1.25);
      ctx.lineTo(s * 0.6, -s * 0.9);
      ctx.lineTo(s * 0.8, -s * 1.25);
      ctx.lineTo(s * 1.0, -s * 0.9);
      ctx.closePath();
      ctx.fill();
    } else if (skin.id === 'cosmic') {
      // Cosmic event horizon swirl
      ctx.strokeStyle = 'rgba(129, 140, 248, 0.7)';
      ctx.lineWidth = Math.max(3, s * 0.08);
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 1.4, s * 0.5, 0.4, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawParticles(ctx, particles) {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  drawFloatingTexts(ctx, floatingTexts) {
    for (let i = 0; i < floatingTexts.length; i++) {
      const ft = floatingTexts[i];
      const alpha = Math.max(0, ft.life / ft.maxLife);
      ctx.save();
      ctx.translate(ft.x, ft.y);
      ctx.globalAlpha = alpha;

      ctx.font = `900 ${ft.fontSize}px 'Outfit', -apple-system, sans-serif`;
      ctx.textAlign = 'center';

      // Outline
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#0f172a';
      ctx.strokeText(ft.text, 0, 0);

      // Fill
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, 0, 0);

      ctx.restore();
    }
  }

  drawScreenVignette(ctx, player) {
    // If hunger is low (< 25%), pulse red alert vignette
    if (player.hunger <= 25) {
      const pulse = Math.abs(Math.sin(Date.now() * 0.007));
      const urgency = 1 - (player.hunger / 25);
      const alpha = pulse * (0.2 + urgency * 0.4);

      const grad = ctx.createRadialGradient(
        this.width / 2, this.height / 2, Math.min(this.width, this.height) * 0.35,
        this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.7
      );
      grad.addColorStop(0, 'rgba(239, 68, 68, 0)');
      grad.addColorStop(1, `rgba(220, 38, 38, ${alpha})`);

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.width, this.height);
    }
  }
}
