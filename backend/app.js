const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const ALBION_SERVERS = {
  west: 'https://west.albion-online-data.com/api/v2/stats/prices',
  east: 'https://east.albion-online-data.com/api/v2/stats/prices',
  europe: 'https://europe.albion-online-data.com/api/v2/stats/prices'
};

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Đọc tất cả mã vật phẩm duy nhất từ recipes.json ở frontend (bao gồm cả thành phẩm và nguyên liệu)
 */
function loadUniqueItemIds() {
  try {
    const recipesPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'recipes.json');
    if (!fs.existsSync(recipesPath)) {
      console.error(`[Scanner] Không tìm thấy recipes.json tại ${recipesPath}`);
      return [];
    }
    const recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));
    const uniqueIds = new Set();
    recipes.forEach(r => {
      if (r.id) uniqueIds.add(r.id);
      if (r.materials && Array.isArray(r.materials)) {
        r.materials.forEach(m => {
          if (m.id) uniqueIds.add(m.id);
        });
      }
    });
    return Array.from(uniqueIds);
  } catch (error) {
    console.error('[Scanner] Lỗi đọc danh sách vật phẩm từ recipes.json:', error);
    return [];
  }
}

const STATE_PATH = path.join(DATA_DIR, 'scanner_state.json');

/**
 * Đọc trạng thái quét hiện tại
 */
function loadScannerState() {
  try {
    if (fs.existsSync(STATE_PATH)) {
      return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
    }
  } catch (error) {
    console.error('[Scanner] Lỗi đọc scanner_state.json:', error);
  }
  return { currentServer: 'east', currentIndex: 0, lastRunTimestamp: 0 };
}

/**
 * Ghi lại trạng thái quét hiện tại
 */
function saveScannerState(state) {
  try {
    fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
  } catch (error) {
    console.error('[Scanner] Lỗi ghi scanner_state.json:', error);
  }
}

function getPricesPath(server) {
  return path.join(DATA_DIR, `prices_${server}.json`);
}

/**
 * Đọc giá lưu trong file offline của một server
 */
function loadPrices(server) {
  const filePath = getPricesPath(server);
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (error) {
    console.error(`[Scanner] Lỗi đọc file giá server ${server}:`, error);
  }
  return {};
}

/**
 * Ghi giá lưu vào file offline của một server
 */
function savePrices(server, prices) {
  const filePath = getPricesPath(server);
  try {
    fs.writeFileSync(filePath, JSON.stringify(prices, null, 2), 'utf8');
  } catch (error) {
    console.error(`[Scanner] Lỗi ghi file giá server ${server}:`, error);
  }
}

/**
 * Hàm extractValidPrice xử lý luật lọc giá
 */
function extractValidPrice(rawData) {
  const tempPrices = {};

  rawData.forEach(item => {
    const { item_id, city, quality, sell_price_min, buy_price_max } = item;
    if (sell_price_min <= 0 && buy_price_max <= 0) return;

    if (!tempPrices[item_id]) tempPrices[item_id] = {};
    if (!tempPrices[item_id][city]) {
      tempPrices[item_id][city] = { 
        q1_sell: 0, first_valid_sell: 0,
        q1_buy: 0, first_valid_buy: 0
      };
    }

    const p = tempPrices[item_id][city];

    if (sell_price_min > 0) {
      if (quality === 1) p.q1_sell = sell_price_min;
      else if (p.first_valid_sell === 0) p.first_valid_sell = sell_price_min;
    }
    if (buy_price_max > 0) {
      if (quality === 1) p.q1_buy = buy_price_max;
      else if (p.first_valid_buy === 0) p.first_valid_buy = buy_price_max;
    }
  });

  const formattedData = {};
  for (const itemId in tempPrices) {
    formattedData[itemId] = {};
    for (const city in tempPrices[itemId]) {
      const p = tempPrices[itemId][city];
      const finalSell = p.q1_sell > 0 ? p.q1_sell : p.first_valid_sell;
      const finalBuy = p.q1_buy > 0 ? p.q1_buy : p.first_valid_buy;

      formattedData[itemId][city] = {
        item_id: itemId,
        city: city,
        sellPriceMin: finalSell,
        buyPriceMax: finalBuy
      };
    }
  }

  return formattedData;
}

/**
 * Trích xuất giá offline từ tệp JSON tương ứng
 */
function getPricesOffline(items, locations, server = 'east') {
  const offlinePrices = loadPrices(server);
  const result = {};
  const locationList = locations.split(',').map(l => l.trim());

  items.forEach(item => {
    const itemPrices = offlinePrices[item] || {};
    result[item] = {};
    locationList.forEach(loc => {
      if (itemPrices[loc]) {
        const data = itemPrices[loc];
        // Ánh xạ sang camelCase để tương thích với Frontend
        result[item][loc] = {
          item_id: data.item_id,
          city: data.city,
          sellPriceMin: data.sellPriceMin !== undefined ? data.sellPriceMin : (data.sell_price_min || 0),
          buyPriceMax: data.buyPriceMax !== undefined ? data.buyPriceMax : (data.buy_price_max || 0),
          updatedAt: data.updatedAt
        };
      } else {
        result[item][loc] = {
          item_id: item,
          city: loc,
          sellPriceMin: 0,
          buyPriceMax: 0
        };
      }
    });
  });

  return result;
}

// ==========================================
// 1. API lấy giá item (Lấy trực tiếp từ file giá offline đã quét)
// GET /api/prices?items=T4_BAG,T5_BAG&locations=Martlock,Caerleon&server=east
// ==========================================
app.get('/api/prices', async (req, res) => {
  try {
    const itemsQuery = req.query.items;
    const locations = req.query.locations || req.query.location;
    const server = req.query.server || 'east';

    if (!itemsQuery || !locations) {
      return res.status(400).json({ error: 'Thiếu tham số items hoặc locations' });
    }

    const items = itemsQuery.split(',').map(i => i.trim());
    const prices = getPricesOffline(items, locations, server);

    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. API tính profit (Sử dụng giá offline từ file để tính toán)
// POST /api/profit
// ==========================================
app.post('/api/profit', async (req, res) => {
  try {
    const { item_id, location, materials, server = 'east' } = req.body;

    if (!item_id || !location || !materials || !Array.isArray(materials)) {
      return res.status(400).json({ error: 'Body không hợp lệ. Yêu cầu item_id, location và materials (array)' });
    }

    const materialIds = materials.map(m => m.item_id);
    const allItems = [item_id, ...materialIds];

    const prices = getPricesOffline(allItems, location, server);

    let totalCost = 0;
    const materialDetails = materials.map(mat => {
      const matCities = prices[mat.item_id] || {};
      const matPriceInfo = matCities[location];
      const matPrice = matPriceInfo ? matPriceInfo.sell_price_min : 0; 
      const matTotalCost = matPrice * mat.quantity;
      
      totalCost += matTotalCost;
      
      return {
        item_id: mat.item_id,
        quantity: mat.quantity,
        unit_price: matPrice,
        total_cost: matTotalCost
      };
    });

    const mainItemCities = prices[item_id] || {};
    const mainItemPriceInfo = mainItemCities[location];
    const sellPrice = mainItemPriceInfo ? mainItemPriceInfo.sell_price_min : 0;

    const profit = sellPrice - totalCost;

    res.json({
      item_id,
      location,
      sell_price: sellPrice,
      cost: totalCost,
      profit: profit,
      materials_breakdown: materialDetails
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. Tiến trình quét ngầm tự động (Scanner Background Loop)
// ==========================================
let isScanning = false;

async function runScannerTick() {
  if (isScanning) {
    console.log('[Scanner] Một tiến trình quét đang chạy, bỏ qua lần này...');
    return;
  }

  isScanning = true;
  console.log(`\n--- [Scanner] Khởi động đợt quét giá tự động: ${new Date().toLocaleString()} ---`);

  try {
    const uniqueIds = loadUniqueItemIds();
    if (uniqueIds.length === 0) {
      console.error('[Scanner] Không tìm thấy vật phẩm nào trong recipes.json để quét.');
      isScanning = false;
      return;
    }

    const state = loadScannerState();
    const server = 'east'; // Cố định chỉ quét server Asia (East)
    let index = state.currentIndex || 0;

    // Reset lại chỉ số nếu vượt quá số lượng vật phẩm
    if (index >= uniqueIds.length) {
      console.log(`[Scanner] Đã quét hết toàn bộ danh sách. Quay trở lại đầu danh sách.`);
      index = 0;
    }

    const chunk = uniqueIds.slice(index, index + 50);
    console.log(`[Scanner] Máy chủ: EAST | Đang quét index ${index} -> ${Math.min(index + 50, uniqueIds.length)} / ${uniqueIds.length} vật phẩm...`);

    if (chunk.length > 0) {
      const locations = 'Caerleon,Martlock,Bridgewatch,Lymhurst,Fort Sterling,Thetford,Black Market';
      const baseUrl = ALBION_SERVERS[server] || ALBION_SERVERS['east'];
      const itemsString = chunk.join(',');
      const url = `${baseUrl}/${itemsString}?locations=${locations}&qualities=1`;

      console.log(`[Scanner] Đang gửi yêu cầu lấy giá cho ${chunk.length} vật phẩm tại các chợ lớn...`);
      const response = await axios.get(url, { timeout: 15000 });
      const formattedData = extractValidPrice(response.data);

      // Đọc dữ liệu giá hiện tại để cập nhật đè
      const prices = loadPrices(server);
      let updatedCount = 0;

      for (const itemId in formattedData) {
        if (!prices[itemId]) {
          prices[itemId] = {};
        }
        for (const city in formattedData[itemId]) {
          prices[itemId][city] = {
            ...formattedData[itemId][city],
            updatedAt: Date.now()
          };
        }
        updatedCount++;
      }

      savePrices(server, prices);
      console.log(`[Scanner] Cập nhật thành công giá cho ${updatedCount} vật phẩm vào prices_${server}.json.`);
    }

    // Tính toán index cho đợt kế tiếp
    let nextIndex = index + 50;
    if (nextIndex >= uniqueIds.length) {
      console.log(`[Scanner] Đã hoàn thành 1 vòng quét đầy đủ cho ${uniqueIds.length} vật phẩm của server Asia (East). Quay trở lại đầu danh sách.`);
      nextIndex = 0;
    }

    state.currentIndex = nextIndex;
    state.currentServer = 'east';
    state.lastRunTimestamp = Date.now();
    saveScannerState(state);

    console.log(`[Scanner] Hoàn tất đợt quét. Chỉ số tiếp theo: ${nextIndex} trên máy chủ EAST.\n`);
  } catch (error) {
    console.error('[Scanner] Lỗi trong quá trình quét giá:', error.response ? `API Status ${error.response.status}` : error.message);
  } finally {
    isScanning = false;
  }
}

// Chạy server & Kích hoạt vòng lặp quét ngầm
app.listen(PORT, () => {
  console.log(`🚀 API Server đang chạy tại http://localhost:${PORT}`);
  
  // Khởi động chạy đợt quét đầu tiên sau 2 giây khi khởi động server
  setTimeout(runScannerTick, 2000);
  
  // Thiết lập vòng lặp quét mỗi 60 giây (1 phút)
  setInterval(runScannerTick, 60000);
});

