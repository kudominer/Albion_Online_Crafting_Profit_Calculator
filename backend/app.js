const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const NodeCache = require('node-cache');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// ============================================================
// CONSTANTS
// ============================================================
const ALBION_API_BASE = 'https://east.albion-online-data.com/api/v2/stats/prices';
const LOCATIONS = 'Caerleon,Martlock,Bridgewatch,Lymhurst,Fort Sterling,Thetford,Black Market';
const ALL_LOCATIONS = LOCATIONS.split(',').map(l => l.trim());

// Rate limit: 180 req/min → 1 req per ~333ms. We use 400ms to be safe.
const BATCH_SIZE = 100;
const BATCH_DELAY_MS = 400;

// ============================================================
// CACHE (In-Memory with node-cache)
// ============================================================
// TTL by item tier priority
const priceCache = new NodeCache({ checkperiod: 30 });
const profitCache = new NodeCache({ stdTTL: 120, checkperiod: 60 });

const TTL = { HIGH: 60, MEDIUM: 180, LOW: 600 };

// ============================================================
// DATA LOADING
// ============================================================
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

let RECIPES = [];
let REFINE_RECIPES = {};

function loadData() {
  try {
    const recipesPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'recipes.json');
    if (fs.existsSync(recipesPath)) {
      RECIPES = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));
      console.log(`[Data] Loaded ${RECIPES.length} craft recipes`);
    }
  } catch (e) {
    console.error('[Data] Error loading recipes.json:', e.message);
  }
  try {
    const refinePath = path.join(DATA_DIR, 'refine_recipes.json');
    if (fs.existsSync(refinePath)) {
      REFINE_RECIPES = JSON.parse(fs.readFileSync(refinePath, 'utf8'));
      console.log(`[Data] Loaded ${Object.keys(REFINE_RECIPES).length} refine recipes`);
    }
  } catch (e) {
    console.error('[Data] Error loading refine_recipes.json:', e.message);
  }
  try {
    const pricesPath = path.join(DATA_DIR, 'prices_east.json');
    if (fs.existsSync(pricesPath)) {
      const cachedData = JSON.parse(fs.readFileSync(pricesPath, 'utf8'));
      let count = 0;
      for (const itemId in cachedData) {
        const ttl = getItemTTL(itemId);
        priceCache.set(itemId, cachedData[itemId], ttl);
        count++;
      }
      console.log(`[Data] Loaded ${count} cached prices from disk`);
    }
  } catch (e) {
    console.error('[Data] Error loading prices_east.json from disk:', e.message);
  }
  try {
    const statePath = path.join(DATA_DIR, 'scanner_state.json');
    if (fs.existsSync(statePath)) {
      const savedState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
      if (savedState.currentIndex !== undefined) {
        scannerState.currentIndex = savedState.currentIndex;
        console.log(`[Scanner] Restored scan index: ${scannerState.currentIndex}`);
      }
    }
  } catch (e) {
    console.error('[Data] Error loading scanner_state.json from disk:', e.message);
  }
}

// ============================================================
// PRIORITY QUEUE SYSTEM
// ============================================================
// Raw resources = HIGH, popular gear T4-T6 = MEDIUM, rest = LOW
const RAW_RESOURCE_PATTERNS = [/_WOOD$/, /_ORE$/, /_FIBER$/, /_HIDE$/, /_ROCK$/];
const REFINED_PATTERNS = [/_PLANKS$/, /_METALBAR$/, /_CLOTH$/, /_LEATHER$/, /_STONEBLOCK$/];

const BASE_GEAR_PATTERNS = [
  /^T[4-7]_HEAD_/, /^T[4-7]_ARMOR_/, /^T[4-7]_SHOES_/,
  /^T[4-7]_CAPE$/, /^T[4-7]_BAG$/,
  /^T[4-7]_(MAIN|2H|OFF)_/
];

function getItemPriority(itemId) {
  if (RAW_RESOURCE_PATTERNS.some(p => p.test(itemId))) return 'HIGH';
  if (REFINED_PATTERNS.some(p => p.test(itemId))) return 'HIGH';
  if (BASE_GEAR_PATTERNS.some(p => p.test(itemId))) return 'HIGH';
  const tier = parseInt(itemId.charAt(1)) || 0;
  if (tier >= 4 && tier <= 6) return 'MEDIUM';
  return 'LOW';
}

function getItemTTL(itemId) {
  return TTL[getItemPriority(itemId)];
}

// ============================================================
// CRAWLER WORKER
// ============================================================
let scannerState = {
  isRunning: false,
  currentIndex: 0,
  totalItems: 0,
  lastRunAt: null,
  itemsUpdated: 0,
  errors: 0,
  requestsThisMinute: 0,
  minuteStart: Date.now()
};

let uniqueItemIds = [];

function buildItemList() {
  const ids = new Set();

  // Add refine recipes items
  Object.keys(REFINE_RECIPES).forEach(id => {
    ids.add(id);
    REFINE_RECIPES[id].materials.forEach(m => ids.add(m.id));
  });

  // Add craft recipe items
  RECIPES.forEach(r => {
    if (r.id) ids.add(r.id);
    if (r.materials) r.materials.forEach(m => { if (m.id) ids.add(m.id); });
  });

  // Sort by priority: HIGH first, then MEDIUM, then LOW
  const sorted = Array.from(ids).sort((a, b) => {
    const pA = getItemPriority(a);
    const pB = getItemPriority(b);
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return order[pA] - order[pB];
  });

  uniqueItemIds = sorted;
  scannerState.totalItems = sorted.length;
  console.log(`[Scanner] Item list built: ${sorted.length} items (HIGH first)`);
}

function parseAndCache(rawData) {
  let updated = 0;
  const grouped = {};

  rawData.forEach(entry => {
    const { item_id, city, quality, sell_price_min, buy_price_max } = entry;
    if (quality !== 1) return;
    if (sell_price_min <= 0 && buy_price_max <= 0) return;

    if (!grouped[item_id]) grouped[item_id] = {};
    if (!grouped[item_id][city]) {
      grouped[item_id][city] = { sellPriceMin: 0, buyPriceMax: 0 };
    }
    const existing = grouped[item_id][city];
    if (sell_price_min > 0 && (existing.sellPriceMin === 0 || sell_price_min < existing.sellPriceMin)) {
      existing.sellPriceMin = sell_price_min;
    }
    if (buy_price_max > existing.buyPriceMax) {
      existing.buyPriceMax = buy_price_max;
    }
  });

  for (const itemId in grouped) {
    const existing = priceCache.get(itemId) || {};
    const merged = { ...existing };
    for (const city in grouped[itemId]) {
      merged[city] = { ...grouped[itemId][city], updatedAt: Date.now() };
    }
    const ttl = getItemTTL(itemId);
    priceCache.set(itemId, merged, ttl);
    updated++;
  }

  return updated;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchBatch(itemIds) {
  // Rate limit check
  const now = Date.now();
  if (now - scannerState.minuteStart > 60000) {
    scannerState.requestsThisMinute = 0;
    scannerState.minuteStart = now;
  }
  if (scannerState.requestsThisMinute >= 175) {
    const wait = 60000 - (now - scannerState.minuteStart);
    console.log(`[Scanner] Rate limit approaching, waiting ${wait}ms`);
    await sleep(wait + 1000);
    scannerState.requestsThisMinute = 0;
    scannerState.minuteStart = Date.now();
  }

  const url = `${ALBION_API_BASE}/${itemIds.join(',')}?locations=${LOCATIONS}&qualities=1`;
  const response = await axios.get(url, { timeout: 15000 });
  scannerState.requestsThisMinute++;
  return response.data;
}

function saveData() {
  try {
    const allPrices = {};
    for (const itemId of priceCache.keys()) {
      const data = priceCache.get(itemId);
      if (data) {
        allPrices[itemId] = data;
      }
    }
    const pricesPath = path.join(DATA_DIR, 'prices_east.json');
    fs.writeFileSync(pricesPath, JSON.stringify(allPrices, null, 2), 'utf8');

    const statePath = path.join(DATA_DIR, 'scanner_state.json');
    const savedState = {
      currentServer: 'east',
      currentIndex: scannerState.currentIndex,
      lastRunTimestamp: Date.now()
    };
    fs.writeFileSync(statePath, JSON.stringify(savedState, null, 2), 'utf8');
    console.log(`[Data] Saved ${Object.keys(allPrices).length} prices and scanner state to disk`);
  } catch (e) {
    console.error('[Data] Error saving data to disk:', e.message);
  }
}

async function runScannerTick() {
  if (scannerState.isRunning) return;
  if (uniqueItemIds.length === 0) return;

  scannerState.isRunning = true;
  scannerState.lastRunAt = new Date().toISOString();

  try {
    // Only scan items whose cache has expired or is missing
    const toScan = [];
    for (let i = 0; i < uniqueItemIds.length && toScan.length < BATCH_SIZE; i++) {
      const id = uniqueItemIds[(scannerState.currentIndex + i) % uniqueItemIds.length];
      if (!priceCache.has(id)) {
        toScan.push(id);
      }
    }

    // Move index forward
    scannerState.currentIndex = (scannerState.currentIndex + BATCH_SIZE) % uniqueItemIds.length;

    if (toScan.length === 0) {
      scannerState.isRunning = false;
      return;
    }

    console.log(`[Scanner] Fetching ${toScan.length} expired items...`);
    const data = await fetchBatch(toScan);
    const updated = parseAndCache(data);
    scannerState.itemsUpdated += updated;
    console.log(`[Scanner] Updated ${updated} items. Cache has ~${priceCache.keys().length} entries.`);

  } catch (err) {
    scannerState.errors++;
    console.error('[Scanner] Error:', err.response ? `HTTP ${err.response.status}` : err.message);
  } finally {
    scannerState.isRunning = false;
  }
}

// ============================================================
// PRICE HELPERS
// ============================================================
function getPriceFromCache(itemId, city) {
  const data = priceCache.get(itemId);
  if (!data) return null;
  if (city) return data[city] || null;
  return data; // Return all cities
}

function getBestPrice(itemId, preferredCity, type = 'sell') {
  const data = priceCache.get(itemId);
  if (!data) return 0;

  if (preferredCity && data[preferredCity]) {
    const p = type === 'sell' ? data[preferredCity].sellPriceMin : data[preferredCity].buyPriceMax;
    if (p > 0) return p;
  }

  // Fallback to best price across all cities
  const prices = Object.values(data)
    .map(d => type === 'sell' ? d.sellPriceMin : d.buyPriceMax)
    .filter(p => p > 0);

  if (prices.length === 0) return 0;
  return type === 'sell' ? Math.min(...prices) : Math.max(...prices);
}

// ============================================================
// REFINE CHAIN ENGINE (Recursive)
// ============================================================
function calculateRefineCost(itemId, city, rrr = 0.152, depth = 0) {
  if (depth > 10) return { cost: 0, breakdown: [], error: 'Max depth exceeded' };

  const recipe = REFINE_RECIPES[itemId];

  // Base case: raw resource → return market price
  if (!recipe) {
    const price = getBestPrice(itemId, city, 'sell');
    return {
      itemId,
      isRaw: true,
      marketPrice: price,
      cost: price,
      breakdown: []
    };
  }

  // Recursive case: calculate cost of all materials
  let totalRawCost = 0;
  const materialBreakdown = recipe.materials.map(mat => {
    const matResult = calculateRefineCost(mat.id, city, rrr, depth + 1);
    const matCost = matResult.cost * mat.count;
    totalRawCost += matCost;
    return {
      itemId: mat.id,
      count: mat.count,
      unitCost: matResult.cost,
      totalCost: matCost,
      detail: matResult
    };
  });

  // Apply RRR: effective cost = raw / (1 + rrr) — accounting for return
  const effectiveCost = totalRawCost * (1 - rrr);

  return {
    itemId,
    isRaw: false,
    rawCost: totalRawCost,
    cost: effectiveCost,
    breakdown: materialBreakdown
  };
}

function buildRefineChainTree(itemId, city, rrr = 0.152) {
  const recipe = REFINE_RECIPES[itemId];
  if (!recipe) return null;

  const costResult = calculateRefineCost(itemId, city, rrr);
  if (costResult.cost <= 0) return null; // Missing material prices

  const sellPrice = getBestPrice(itemId, city, 'sell');
  const buyPrice = getBestPrice(itemId, city, 'buy');
  const profit = sellPrice > 0 ? sellPrice - costResult.cost : null;

  return {
    itemId,
    sellPrice,
    buyPrice,
    refineCost: Math.round(costResult.cost),
    rawCost: Math.round(costResult.rawCost || costResult.cost),
    profit: profit !== null ? Math.round(profit) : null,
    profitPercent: profit !== null && costResult.cost > 0 ? ((profit / costResult.cost) * 100).toFixed(1) : null,
    recipe: recipe.materials,
    breakdown: costResult.breakdown,
    tier: recipe.tier,
    resource: recipe.resource
  };
}

// ============================================================
// CRAFT PROFIT ENGINE
// ============================================================
function calculateCraftProfit(recipe, city, rrr = 0.152, tax = 0.065) {
  let totalMatCost = 0;
  const materialDetails = [];
  let missingMaterial = false;

  for (const mat of recipe.materials) {
    const unitPrice = getBestPrice(mat.id, city, 'sell');
    if (unitPrice <= 0) missingMaterial = true;
    const total = unitPrice * mat.count;
    totalMatCost += total;
    materialDetails.push({ id: mat.id, count: mat.count, unitPrice, total });
  }

  if (missingMaterial) {
    return { effectiveCost: 0, profit: -999999999, profitPercent: 0 };
  }

  const effectiveCost = totalMatCost * (1 - rrr);
  const sellPrice = getBestPrice(recipe.id, city, 'sell');
  const buyPrice = getBestPrice(recipe.id, city, 'buy');
  const revenue = sellPrice * (1 - tax);
  const profit = revenue - effectiveCost;
  const profitPercent = effectiveCost > 0 ? (profit / effectiveCost) * 100 : 0;

  return {
    itemId: recipe.id,
    city,
    sellPrice,
    buyPrice,
    effectiveCost: Math.round(effectiveCost),
    rawCost: Math.round(totalMatCost),
    revenue: Math.round(revenue),
    profit: Math.round(profit),
    profitPercent: parseFloat(profitPercent.toFixed(2)),
    materials: materialDetails
  };
}

// ============================================================
// TOP PROFIT ENGINE (precomputed)
// ============================================================
function computeTopCraftProfit(city, rrr, tax, limit = 50) {
  const results = [];
  const seen = new Set();

  for (const recipe of RECIPES) {
    if (!recipe.id || !recipe.materials || seen.has(recipe.id)) continue;
    seen.add(recipe.id);

    // Skip items with no sell price
    const sell = getBestPrice(recipe.id, city, 'sell');
    if (sell <= 0) continue;

    const calc = calculateCraftProfit(recipe, city, rrr, tax);
    if (calc.effectiveCost <= 0) continue;

    results.push(calc);
  }

  return results
    .sort((a, b) => b.profit - a.profit)
    .slice(0, limit);
}

function computeTopRefineProfit(city, rrr, limit = 50) {
  const results = [];

  for (const itemId of Object.keys(REFINE_RECIPES)) {
    const tree = buildRefineChainTree(itemId, city, rrr);
    if (!tree || tree.profit === null || tree.profit <= 0) continue;
    results.push(tree);
  }

  return results
    .sort((a, b) => b.profit - a.profit)
    .slice(0, limit);
}

function computeTopFlipProfit(limit = 50) {
  const results = [];

  for (const itemId of priceCache.keys()) {
    const data = priceCache.get(itemId);
    if (!data) continue;

    for (const city of ALL_LOCATIONS) {
      if (!data[city]) continue;
      const { sellPriceMin, buyPriceMax } = data[city];
      if (sellPriceMin > 0 && buyPriceMax > 0) {
        const spread = sellPriceMin - buyPriceMax;
        if (spread > 0) {
          const spreadPercent = (spread / buyPriceMax) * 100;
          results.push({ itemId, city, sellPriceMin, buyPriceMax, spread, spreadPercent: parseFloat(spreadPercent.toFixed(2)) });
        }
      }
    }
  }

  return results.sort((a, b) => b.spreadPercent - a.spreadPercent).slice(0, limit);
}

// ============================================================
// API ROUTES
// ============================================================

// GET /api/prices?items=T4_WOOD,T5_PLANKS&locations=Caerleon,Martlock&server=east
app.get('/api/prices', (req, res) => {
  const { items, locations } = req.query;
  if (!items) return res.status(400).json({ error: 'Missing items parameter' });

  const itemList = items.split(',').map(i => i.trim()).filter(Boolean);
  const locationFilter = locations ? locations.split(',').map(l => l.trim()) : ALL_LOCATIONS;

  const result = {};
  for (const itemId of itemList) {
    const cached = priceCache.get(itemId);
    result[itemId] = {};
    for (const city of locationFilter) {
      if (cached && cached[city]) {
        result[itemId][city] = cached[city];
      } else {
        result[itemId][city] = { sellPriceMin: 0, buyPriceMax: 0 };
      }
    }
  }

  res.json(result);
});

// GET /api/craft-profit?item=T4_BAG&city=Caerleon&rrr=15.2&tax=6.5
app.get('/api/craft-profit', (req, res) => {
  const { item, city, rrr = '15.2', tax = '6.5' } = req.query;
  if (!item) return res.status(400).json({ error: 'Missing item parameter' });

  const recipe = RECIPES.find(r => r.id === item);
  if (!recipe) return res.status(404).json({ error: `Recipe not found for ${item}` });

  const result = calculateCraftProfit(recipe, city, parseFloat(rrr) / 100, parseFloat(tax) / 100);
  res.json(result);
});

// GET /api/refine-chain?item=T5_PLANKS&city=Caerleon&rrr=15.2
app.get('/api/refine-chain', (req, res) => {
  const { item, city, rrr = '15.2' } = req.query;
  if (!item) return res.status(400).json({ error: 'Missing item parameter' });

  const tree = buildRefineChainTree(item, city, parseFloat(rrr) / 100);
  if (!tree) return res.status(404).json({ error: `No refine recipe found for ${item}` });

  res.json(tree);
});

// GET /api/transport?item=T4_BAG&from=Caerleon&to=Martlock
app.get('/api/transport', (req, res) => {
  const { item, from, to } = req.query;
  if (!item || !from || !to) return res.status(400).json({ error: 'Missing item, from, or to' });

  const itemList = item.split(',').map(i => i.trim());
  const results = [];

  for (const itemId of itemList) {
    const fromData = priceCache.get(itemId)?.[from];
    const toData = priceCache.get(itemId)?.[to];

    const buyPrice = fromData?.sellPriceMin || 0;
    const sellPrice = toData?.sellPriceMin || 0;
    const profit = sellPrice - buyPrice;
    const profitPercent = buyPrice > 0 ? (profit / buyPrice) * 100 : 0;

    results.push({
      itemId,
      from,
      to,
      buyPrice,
      sellPrice,
      profit,
      profitPercent: parseFloat(profitPercent.toFixed(2))
    });
  }

  res.json(results.length === 1 ? results[0] : results);
});

// GET /api/flip?items=T4_BAG,T5_BOW&city=Caerleon
app.get('/api/flip', (req, res) => {
  const { items, city } = req.query;
  if (!items) return res.status(400).json({ error: 'Missing items parameter' });

  const itemList = items.split(',').map(i => i.trim());
  const results = [];

  for (const itemId of itemList) {
    const data = priceCache.get(itemId);
    if (!data) { results.push({ itemId, error: 'No price data' }); continue; }

    const cityData = city ? { [city]: data[city] } : data;

    for (const [loc, prices] of Object.entries(cityData)) {
      if (!prices) continue;
      const { sellPriceMin = 0, buyPriceMax = 0 } = prices;
      if (sellPriceMin > 0 && buyPriceMax > 0) {
        const spread = sellPriceMin - buyPriceMax;
        const spreadPercent = (spread / buyPriceMax) * 100;
        results.push({ itemId, city: loc, sellPriceMin, buyPriceMax, spread, spreadPercent: parseFloat(spreadPercent.toFixed(2)) });
      }
    }
  }

  res.json(results);
});

// GET /api/market/top-profit?type=craft|refine|flip&city=Caerleon&limit=20&rrr=15.2&tax=6.5
app.get('/api/market/top-profit', (req, res) => {
  const { type = 'craft', city, limit = '20', rrr = '15.2', tax = '6.5' } = req.query;
  const limitN = Math.min(parseInt(limit) || 20, 100);
  const rrrVal = parseFloat(rrr) / 100;
  const taxVal = parseFloat(tax) / 100;

  const cacheKey = `top-profit:${type}:${city || 'all'}:${rrr}:${tax}`;
  const cached = profitCache.get(cacheKey);
  if (cached) return res.json(cached);

  let results;
  try {
    if (type === 'craft') {
      results = computeTopCraftProfit(city, rrrVal, taxVal, limitN);
    } else if (type === 'refine') {
      results = computeTopRefineProfit(city, rrrVal, limitN);
    } else if (type === 'flip') {
      results = computeTopFlipProfit(limitN);
    } else {
      return res.status(400).json({ error: 'type must be craft|refine|flip' });
    }
    profitCache.set(cacheKey, results);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/scanner/status
app.get('/api/scanner/status', (req, res) => {
  res.json({
    isRunning: scannerState.isRunning,
    currentIndex: scannerState.currentIndex,
    totalItems: scannerState.totalItems,
    lastRunAt: scannerState.lastRunAt,
    itemsUpdated: scannerState.itemsUpdated,
    errors: scannerState.errors,
    cachedItems: priceCache.keys().length,
    requestsThisMinute: scannerState.requestsThisMinute
  });
});

// GET /api/market/all-prices?city=Caerleon (for Market tab)
app.get('/api/market/all-prices', (req, res) => {
  const { city, limit = '200' } = req.query;
  const limitN = parseInt(limit) || 200;
  const result = [];
  const keys = priceCache.keys().slice(0, limitN);

  for (const itemId of keys) {
    const data = priceCache.get(itemId);
    if (!data) continue;

    if (city) {
      if (data[city]) {
        result.push({ itemId, city, ...data[city] });
      }
    } else {
      for (const [loc, prices] of Object.entries(data)) {
        result.push({ itemId, city: loc, ...prices });
      }
    }
  }

  res.json(result);
});

// Legacy endpoint for backward compat with old frontend
app.get('/api/prices/legacy', (req, res) => {
  return res.redirect(302, `/api/prices?${new URLSearchParams(req.query).toString()}`);
});

// ============================================================
// SERVER BOOTSTRAP
// ============================================================
app.listen(PORT, async () => {
  console.log(`\n🚀 Albion Trading API running at http://localhost:${PORT}`);
  console.log(`📦 Endpoints: /api/prices | /api/craft-profit | /api/refine-chain | /api/transport | /api/flip | /api/market/top-profit | /api/scanner/status\n`);

  loadData();
  buildItemList();

  // Initial scan after 1s
  setTimeout(runScannerTick, 1000);

  // Continuous scan every 5s (crawler will skip items still in TTL)
  setInterval(runScannerTick, 5000);

  // Auto-save every 5 minutes
  setInterval(saveData, 300000);
});

// Graceful shutdown hooks
process.on('SIGINT', () => {
  console.log('\n[Server] SIGINT received. Saving data before exit...');
  saveData();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[Server] SIGTERM received. Saving data before exit...');
  saveData();
  process.exit(0);
});
