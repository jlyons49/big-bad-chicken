/**
 * Big Bad Chicken - Map, Biomes, Spatial Hash Grid & World Population
 */

import { GAME_CONFIG, ITEM_TIERS } from './constants.js';
import { ConsumableItem, AIChicken } from './entities.js';

export class WorldMap {
  constructor() {
    this.width = GAME_CONFIG.WORLD_WIDTH;
    this.height = GAME_CONFIG.WORLD_HEIGHT;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    
    // Spatial hash grid
    this.cellSize = 250;
    this.cols = Math.ceil(this.width / this.cellSize);
    this.rows = Math.ceil(this.height / this.cellSize);
    this.grid = new Map();

    this.items = [];
    this.aiChickens = [];
    
    // Road paths and environmental landmarks
    this.roads = [];
    this.zones = [
      { id: 'farm', name: 'Sunny Coop & Farmyard', minR: 0, maxR: 1100, color: '#4ade80' },
      { id: 'pasture', name: 'Pastures & Barns', minR: 900, maxR: 2100, color: '#22c55e' },
      { id: 'suburb', name: 'Suburbs & Highway', minR: 1800, maxR: 3200, color: '#16a34a' },
      { id: 'city', name: 'Metropolis Downtown', minR: 2800, maxR: 4400, color: '#15803d' },
      { id: 'cosmic', name: 'Continental Horizon', minR: 4000, maxR: 5000, color: '#0f172a' },
    ];

    this.initRoads();
    this.populateInitialWorld();
  }

  initRoads() {
    // Generate concentric and radial roads
    this.roads = [
      // Ring roads
      { type: 'ring', r: 1600, width: 44, color: '#475569', line: '#facc15' },
      { type: 'ring', r: 2600, width: 68, color: '#334155', line: '#facc15' },
      { type: 'ring', r: 3600, width: 90, color: '#1e293b', line: '#facc15' },
      // Radial avenues
      { type: 'line', x1: this.centerX - 2400, y1: this.centerY, x2: this.centerX + 2400, y2: this.centerY, width: 55 },
      { type: 'line', x1: this.centerX, y1: this.centerY - 2400, x2: this.centerX, y2: this.centerY + 2400, width: 55 },
      { type: 'line', x1: this.centerX - 1800, y1: this.centerY - 1800, x2: this.centerX + 1800, y2: this.centerY + 1800, width: 48 },
    ];
  }

  hash(col, row) {
    return `${col},${row}`;
  }

  clearGrid() {
    this.grid.clear();
  }

  addToGrid(item) {
    const col = Math.floor(item.x / this.cellSize);
    const row = Math.floor(item.y / this.cellSize);
    const key = this.hash(col, row);
    let cell = this.grid.get(key);
    if (!cell) {
      cell = [];
      this.grid.set(key, cell);
    }
    cell.push(item);
  }

  rebuildGrid() {
    this.clearGrid();
    for (let i = 0; i < this.items.length; i++) {
      this.addToGrid(this.items[i]);
    }
  }

  getItemsInRadius(x, y, radius) {
    const minCol = Math.max(0, Math.floor((x - radius) / this.cellSize));
    const maxCol = Math.min(this.cols - 1, Math.floor((x + radius) / this.cellSize));
    const minRow = Math.max(0, Math.floor((y - radius) / this.cellSize));
    const maxRow = Math.min(this.rows - 1, Math.floor((y + radius) / this.cellSize));

    const result = [];
    const radSq = radius * radius;

    for (let c = minCol; c <= maxCol; c++) {
      for (let r = minRow; r <= maxRow; r++) {
        const cell = this.grid.get(this.hash(c, r));
        if (!cell) continue;
        for (let i = 0; i < cell.length; i++) {
          const item = cell[i];
          const dx = item.x - x;
          const dy = item.y - y;
          if (dx * dx + dy * dy <= radSq) {
            result.push(item);
          }
        }
      }
    }
    return result;
  }

  populateInitialWorld() {
    this.items = [];
    this.aiChickens = [];

    // 1. Spawning Tier 1 (Backyard seeds, worms, insects) dense in center
    const t1 = ITEM_TIERS[0];
    for (let i = 0; i < 650; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.pow(Math.random(), 0.7) * 1100;
      const x = this.centerX + Math.cos(angle) * dist;
      const y = this.centerY + Math.sin(angle) * dist;
      const template = t1.items[Math.floor(Math.random() * t1.items.length)];
      this.items.push(new ConsumableItem(x, y, template, 1));
    }

    // 2. Spawning Tier 2 (Garden produce, mice, frogs, gnomes)
    const t2 = ITEM_TIERS[1];
    for (let i = 0; i < 400; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 300 + Math.random() * 1500;
      const x = this.centerX + Math.cos(angle) * dist;
      const y = this.centerY + Math.sin(angle) * dist;
      const template = t2.items[Math.floor(Math.random() * t2.items.length)];
      this.items.push(new ConsumableItem(x, y, template, 2));
    }

    // 3. Spawning Tier 3 (Rabbits, cats, fences, dogs, hay)
    const t3 = ITEM_TIERS[2];
    for (let i = 0; i < 280; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 700 + Math.random() * 1800;
      const x = this.centerX + Math.cos(angle) * dist;
      const y = this.centerY + Math.sin(angle) * dist;
      const template = t3.items[Math.floor(Math.random() * t3.items.length)];
      this.items.push(new ConsumableItem(x, y, template, 3));
    }

    // 4. Spawning Tier 4 (Sheep, cows, horses, tractors, silos, barns)
    const t4 = ITEM_TIERS[3];
    for (let i = 0; i < 180; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 1100 + Math.random() * 2100;
      const x = this.centerX + Math.cos(angle) * dist;
      const y = this.centerY + Math.sin(angle) * dist;
      const template = t4.items[Math.floor(Math.random() * t4.items.length)];
      this.items.push(new ConsumableItem(x, y, template, 4));
    }

    // 5. Spawning Tier 5 (Cars, buses, houses, water towers)
    const t5 = ITEM_TIERS[4];
    for (let i = 0; i < 130; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 1800 + Math.random() * 2200;
      const x = this.centerX + Math.cos(angle) * dist;
      const y = this.centerY + Math.sin(angle) * dist;
      const template = t5.items[Math.floor(Math.random() * t5.items.length)];
      this.items.push(new ConsumableItem(x, y, template, 5));
    }

    // 6. Spawning Tier 6 (Skyscrapers, office blocks, stadium, trucks)
    const t6 = ITEM_TIERS[5];
    for (let i = 0; i < 75; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 2400 + Math.random() * 2000;
      const x = this.centerX + Math.cos(angle) * dist;
      const y = this.centerY + Math.sin(angle) * dist;
      const template = t6.items[Math.floor(Math.random() * t6.items.length)];
      this.items.push(new ConsumableItem(x, y, template, 6));
    }

    // 7. Spawning Tier 7 (Mountains, volcanoes, rocket launch pads, moon)
    const t7 = ITEM_TIERS[6];
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 3200 + Math.random() * 1400;
      const x = this.centerX + Math.cos(angle) * dist;
      const y = this.centerY + Math.sin(angle) * dist;
      const template = t7.items[Math.floor(Math.random() * t7.items.length)];
      this.items.push(new ConsumableItem(x, y, template, 7));
    }

    // 8. Spawn AI Chickens
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 200 + Math.random() * 1600;
      const x = this.centerX + Math.cos(angle) * dist;
      const y = this.centerY + Math.sin(angle) * dist;
      const tier = i < 16 ? 1 : i < 24 ? 2 : 3;
      this.aiChickens.push(new AIChicken(x, y, tier));
    }

    this.rebuildGrid();
  }

  maintainPopulation(player) {
    // If total items drop low, or player has grown, spawn fresh snacks near player!
    if (this.items.length < 900) {
      // Determine what tiers player needs right now
      let activeTierIdx = 0;
      if (player.size >= 1200) activeTierIdx = 6;
      else if (player.size >= 500) activeTierIdx = 5;
      else if (player.size >= 240) activeTierIdx = 4;
      else if (player.size >= 100) activeTierIdx = 3;
      else if (player.size >= 50) activeTierIdx = 2;
      else if (player.size >= 28) activeTierIdx = 1;
      else activeTierIdx = 0;

      const tierObj = ITEM_TIERS[activeTierIdx];
      const countToSpawn = 45;

      for (let i = 0; i < countToSpawn; i++) {
        const angle = Math.random() * Math.PI * 2;
        // Spawn around the player's current view horizon
        const spawnDist = player.size * 2.5 + Math.random() * (player.size * 5 + 400);
        let x = player.x + Math.cos(angle) * spawnDist;
        let y = player.y + Math.sin(angle) * spawnDist;

        x = Math.max(80, Math.min(this.width - 80, x));
        y = Math.max(80, Math.min(this.height - 80, y));

        const template = tierObj.items[Math.floor(Math.random() * tierObj.items.length)];
        const newItem = new ConsumableItem(x, y, template, tierObj.tier);
        this.items.push(newItem);
        this.addToGrid(newItem);
      }
    }

    // Maintain AI Chickens
    if (this.aiChickens.length < 18) {
      const angle = Math.random() * Math.PI * 2;
      const dist = player.size * 2.0 + 350 + Math.random() * 600;
      const x = Math.max(100, Math.min(this.width - 100, player.x + Math.cos(angle) * dist));
      const y = Math.max(100, Math.min(this.height - 100, player.y + Math.sin(angle) * dist));
      this.aiChickens.push(new AIChicken(x, y, Math.min(3, Math.floor(player.size / 60) + 1)));
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
