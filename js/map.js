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
    
    // Multi-biome environmental zones across the massive 75,000 x 75,000 map
    this.zones = [
      { id: 'farm', name: 'Sunny Coop & Farmyard', minR: 0, maxR: 4500, color: '#4ade80' },
      { id: 'garden', name: 'Garden & Orchards', minR: 4000, maxR: 10000, color: '#22c55e' },
      { id: 'pasture', name: 'Pastures & Barns', minR: 9500, maxR: 18000, color: '#16a34a' },
      { id: 'machinery', name: 'Farmlands & Machinery', minR: 17000, maxR: 26000, color: '#15803d' },
      { id: 'suburb', name: 'Suburbs & Highways', minR: 25000, maxR: 33000, color: '#1e293b' },
      { id: 'city', name: 'Metropolis Downtown', minR: 32000, maxR: 36000, color: '#0f172a' },
      { id: 'cosmic', name: 'Cosmic Edge & Orbit', minR: 35500, maxR: 37500, color: '#030712' },
    ];

    this.initRoads();
    this.populateInitialWorld();
  }

  initRoads() {
    this.roads = [
      // Ring highways
      { type: 'ring', r: 4500, width: 60, color: '#475569', line: '#facc15' },
      { type: 'ring', r: 10000, width: 75, color: '#334155', line: '#facc15' },
      { type: 'ring', r: 18000, width: 95, color: '#1e293b', line: '#facc15' },
      { type: 'ring', r: 26000, width: 110, color: '#1e293b', line: '#facc15' },
      { type: 'ring', r: 33000, width: 130, color: '#0f172a', line: '#facc15' },
      // Continental Cross Highways
      { type: 'line', x1: 1500, y1: this.centerY, x2: this.width - 1500, y2: this.centerY, width: 85 },
      { type: 'line', x1: this.centerX, y1: 1500, x2: this.centerX, y2: this.height - 1500, width: 85 },
      { type: 'line', x1: 5000, y1: 5000, x2: this.width - 5000, y2: this.height - 5000, width: 75 },
      { type: 'line', x1: 5000, y1: this.height - 5000, x2: this.width - 5000, y2: 5000, width: 75 },
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
    for (let i = 0; i < 2500; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.pow(Math.random(), 0.72) * 4400;
      const x = this.centerX + Math.cos(angle) * dist;
      const y = this.centerY + Math.sin(angle) * dist;
      const template = t1.items[Math.floor(Math.random() * t1.items.length)];
      this.items.push(new ConsumableItem(x, y, template, 1));
    }

    // 2. Tier 2: Garden Critters & Produce (eggs, mice, frogs, tomatoes, gnomes, pumpkins, golden eggs)
    const t2 = ITEM_TIERS[1];
    for (let i = 0; i < 1800; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 3800 + Math.random() * 6000;
      const x = this.centerX + Math.cos(angle) * dist;
      const y = this.centerY + Math.sin(angle) * dist;
      const template = t2.items[Math.floor(Math.random() * t2.items.length)];
      this.items.push(new ConsumableItem(x, y, template, 2));
    }

    // 3. Tier 3: Barnyard Animals & Obstacles (rabbits, cats, terriers, fences, hay, pigs, piggy banks)
    const t3 = ITEM_TIERS[2];
    for (let i = 0; i < 1400; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 9000 + Math.random() * 8800;
      const x = this.centerX + Math.cos(angle) * dist;
      const y = this.centerY + Math.sin(angle) * dist;
      const template = t3.items[Math.floor(Math.random() * t3.items.length)];
      this.items.push(new ConsumableItem(x, y, template, 3));
    }

    // 4. Tier 4: Livestock & Farm Machinery (sheep, cows, horses, tractors, silos, barns)
    const t4 = ITEM_TIERS[3];
    for (let i = 0; i < 900; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 16500 + Math.random() * 9200;
      const x = this.centerX + Math.cos(angle) * dist;
      const y = this.centerY + Math.sin(angle) * dist;
      const template = t4.items[Math.floor(Math.random() * t4.items.length)];
      this.items.push(new ConsumableItem(x, y, template, 4));
    }

    // 5. Tier 5: Suburbs & Town (sedans, police cruisers, school buses, houses, water towers, marts)
    const t5 = ITEM_TIERS[4];
    for (let i = 0; i < 650; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 24500 + Math.random() * 8300;
      const x = this.centerX + Math.cos(angle) * dist;
      const y = this.centerY + Math.sin(angle) * dist;
      const template = t5.items[Math.floor(Math.random() * t5.items.length)];
      this.items.push(new ConsumableItem(x, y, template, 5));
    }

    // 6. Tier 6: Metropolis & Mega Structures (semi-trucks, office blocks, stadium, skyscrapers, ships)
    const t6 = ITEM_TIERS[5];
    for (let i = 0; i < 400; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 31500 + Math.random() * 4500;
      const x = this.centerX + Math.cos(angle) * dist;
      const y = this.centerY + Math.sin(angle) * dist;
      const template = t6.items[Math.floor(Math.random() * t6.items.length)];
      this.items.push(new ConsumableItem(x, y, template, 6));
    }

    // 7. Tier 7: Cosmic & Planetary Wonders (mountains, volcanoes, rocket launch pads, moon)
    const t7 = ITEM_TIERS[6];
    for (let i = 0; i < 150; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 35000 + Math.random() * 2200;
      const x = this.centerX + Math.cos(angle) * dist;
      const y = this.centerY + Math.sin(angle) * dist;
      const template = t7.items[Math.floor(Math.random() * t7.items.length)];
      this.items.push(new ConsumableItem(x, y, template, 7));
    }

    // 8. Roaming AI Chickens (placed at game start only)
    for (let i = 0; i < 75; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 400 + Math.random() * 12000;
      const x = this.centerX + Math.cos(angle) * dist;
      const y = this.centerY + Math.sin(angle) * dist;
      const tier = i < 40 ? 1 : i < 60 ? 2 : 3;
      this.aiChickens.push(new AIChicken(x, y, tier));
    }
  }

  /**
   * ZERO pop-in: The entire world is 100% statically populated upfront.
   * No new items or chickens ever appear after game start.
   */
  maintainPopulation(player, dt) {
    // Intentionally empty: no respawning or pop-in
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
