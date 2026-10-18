/**
 * Big Bad Chicken - Map, Biomes, World Generation & Layout
 * Massive 15,000 x 15,000 open-world sandbox with organic static placement (NO pop-in clutter!)
 */

import { GAME_CONFIG, ITEM_TIERS } from './constants.js';
import { ConsumableItem, AIChicken } from './entities.js';

export class WorldMap {
  constructor() {
    this.width = GAME_CONFIG.WORLD_WIDTH;
    this.height = GAME_CONFIG.WORLD_HEIGHT;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    
    this.items = [];
    this.aiChickens = [];
    
    // Multi-biome environmental zones
    this.zones = [
      { id: 'farm', name: 'Sunny Coop & Farmyard', minR: 0, maxR: 2800, color: '#4ade80' },
      { id: 'pasture', name: 'Pastures & Barns', minR: 2400, maxR: 5800, color: '#22c55e' },
      { id: 'suburb', name: 'Suburbs & Town', minR: 5400, maxR: 9500, color: '#16a34a' },
      { id: 'city', name: 'Metropolis Downtown', minR: 9000, maxR: 13500, color: '#15803d' },
      { id: 'cosmic', name: 'Continental Horizon & Cosmic Rim', minR: 13000, maxR: 16000, color: '#0f172a' },
    ];

    this.initRoads();
    this.populateInitialWorld();
  }

  initRoads() {
    this.roads = [
      // Ring highways
      { type: 'ring', r: 4200, width: 60, color: '#475569', line: '#facc15' },
      { type: 'ring', r: 7600, width: 85, color: '#334155', line: '#facc15' },
      { type: 'ring', r: 11200, width: 110, color: '#1e293b', line: '#facc15' },
      // Continental Expressways
      { type: 'line', x1: 600, y1: this.centerY, x2: this.width - 600, y2: this.centerY, width: 75 },
      { type: 'line', x1: this.centerX, y1: 600, x2: this.centerX, y2: this.height - 600, width: 75 },
      { type: 'line', x1: 1800, y1: 1800, x2: this.width - 1800, y2: this.height - 1800, width: 65 },
      { type: 'line', x1: 1800, y1: this.height - 1800, x2: this.width - 1800, y2: 1800, width: 65 },
    ];
  }

  getItemsInRadius(x, y, radius) {
    const result = [];
    const radSq = radius * radius;
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (item.isEaten) continue;
      const dx = item.x - x;
      const dy = item.y - y;
      if (dx * dx + dy * dy <= radSq) {
        result.push(item);
      }
    }
    return result;
  }

  populateInitialWorld() {
    this.items = [];
    this.aiChickens = [];

    // 1. Tier 1: Backyard Coop & Garden (dense seeds, worms, insects, corn, crumbs, golden corn)
    const t1 = ITEM_TIERS[0];
    for (let i = 0; i < 1400; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.pow(Math.random(), 0.72) * 2600;
      const x = this.centerX + Math.cos(angle) * dist;
      const y = this.centerY + Math.sin(angle) * dist;
      const template = t1.items[Math.floor(Math.random() * t1.items.length)];
      this.items.push(new ConsumableItem(x, y, template, 1));
    }

    // 2. Tier 2: Garden Critters & Produce (eggs, mice, frogs, tomatoes, gnomes, pumpkins, golden eggs)
    const t2 = ITEM_TIERS[1];
    for (let i = 0; i < 850; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 800 + Math.random() * 3200;
      const x = this.centerX + Math.cos(angle) * dist;
      const y = this.centerY + Math.sin(angle) * dist;
      const template = t2.items[Math.floor(Math.random() * t2.items.length)];
      this.items.push(new ConsumableItem(x, y, template, 2));
    }

    // 3. Tier 3: Barnyard Animals & Obstacles (rabbits, cats, terriers, fences, hay, pigs, piggy banks)
    const t3 = ITEM_TIERS[2];
    for (let i = 0; i < 600; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 2200 + Math.random() * 4000;
      const x = this.centerX + Math.cos(angle) * dist;
      const y = this.centerY + Math.sin(angle) * dist;
      const template = t3.items[Math.floor(Math.random() * t3.items.length)];
      this.items.push(new ConsumableItem(x, y, template, 3));
    }

    // 4. Tier 4: Livestock & Farm Machinery (sheep, cows, horses, tractors, silos, barns)
    const t4 = ITEM_TIERS[3];
    for (let i = 0; i < 450; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 3600 + Math.random() * 4500;
      const x = this.centerX + Math.cos(angle) * dist;
      const y = this.centerY + Math.sin(angle) * dist;
      const template = t4.items[Math.floor(Math.random() * t4.items.length)];
      this.items.push(new ConsumableItem(x, y, template, 4));
    }

    // 5. Tier 5: Suburbs & Town (sedans, police cruisers, school buses, houses, water towers, marts)
    const t5 = ITEM_TIERS[4];
    for (let i = 0; i < 350; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 5800 + Math.random() * 4800;
      const x = this.centerX + Math.cos(angle) * dist;
      const y = this.centerY + Math.sin(angle) * dist;
      const template = t5.items[Math.floor(Math.random() * t5.items.length)];
      this.items.push(new ConsumableItem(x, y, template, 5));
    }

    // 6. Tier 6: Metropolis & Mega Structures (semi-trucks, office blocks, stadium, skyscrapers, ships)
    const t6 = ITEM_TIERS[5];
    for (let i = 0; i < 220; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 8500 + Math.random() * 4800;
      const x = this.centerX + Math.cos(angle) * dist;
      const y = this.centerY + Math.sin(angle) * dist;
      const template = t6.items[Math.floor(Math.random() * t6.items.length)];
      this.items.push(new ConsumableItem(x, y, template, 6));
    }

    // 7. Tier 7: Cosmic & Planetary Wonders (mountains, volcanoes, rocket launch pads, moon)
    const t7 = ITEM_TIERS[6];
    for (let i = 0; i < 70; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 11500 + Math.random() * 3200;
      const x = this.centerX + Math.cos(angle) * dist;
      const y = this.centerY + Math.sin(angle) * dist;
      const template = t7.items[Math.floor(Math.random() * t7.items.length)];
      this.items.push(new ConsumableItem(x, y, template, 7));
    }

    // 8. Roaming AI Chickens (wander the farmyard and pastures)
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 300 + Math.random() * 3500;
      const x = this.centerX + Math.cos(angle) * dist;
      const y = this.centerY + Math.sin(angle) * dist;
      const tier = i < 25 ? 1 : i < 38 ? 2 : 3;
      this.aiChickens.push(new AIChicken(x, y, tier));
    }
  }

  /**
   * NO pop-in of items! The world is static and organically placed.
   * Only maintains a baseline of roaming chickens if population drops very low.
   */
  maintainPopulation(player, dt) {
    // Only maintain AI chickens if almost all are eaten
    if (this.aiChickens.length < 8) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 600 + Math.random() * 2500;
      const x = Math.max(200, Math.min(this.width - 200, this.centerX + Math.cos(angle) * dist));
      const y = Math.max(200, Math.min(this.height - 200, this.centerY + Math.sin(angle) * dist));
      this.aiChickens.push(new AIChicken(x, y, 1));
    }
  }

  getCurrentZone(x, y) {
    const dist = Math.hypot(x - this.centerX, y - this.centerY);
    for (let i = 0; i < this.zones.length; i++) {
      if (dist <= this.zones[i].maxR) {
        return this.zones[i];
      }
    }
    return this.zones[this.zones.length - 1];
  }
}
