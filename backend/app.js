const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const ALBION_API_BASE = 'https://www.albion-online-data.com/api/v2/stats/prices';

// In-memory cache
// Cấu trúc: { "price:T4_BAG:Martlock": { data: { sell_price_min, buy_price_max, ... }, expireAt: 1234567890 } }
const cache = {};
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

/**
 * Hàm extractValidPrice xử lý luật giá
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
      
      if (finalSell === 0 && finalBuy === 0) {
        console.log(`[DEBUG] Backend: Item ${itemId} ở ${city} có giá = 0`);
      }

      formattedData[itemId][city] = {
        item_id: itemId,
        city: city,
        sell_price_min: finalSell,
        buy_price_max: finalBuy
      };
    }
  }

  return formattedData;
}

/**
 * Hàm hỗ trợ lấy giá của 1 hoặc nhiều items từ Albion API (có sử dụng cache)
 * @param {string[]} items Array các item_id (VD: ['T4_BAG', 'T4_CLOTH'])
 * @param {string} locations Danh sách các thành phố (VD: 'Martlock,Caerleon')
 * @returns {Promise<Object>} Map các item_id và giá của chúng
 */
async function getPricesWithCache(items, locations) {
  const result = {};
  const itemsToFetch = [];

  // Kiểm tra cache. Vì cache là { "price:T4_BAG:Caerleon,Martlock": ... },
  // Tốt nhất là dùng hash của locations để làm key.
  const cacheKeySuffix = locations;
  
  const now = Date.now();
  items.forEach(item => {
    const cacheKey = `price:${item}:${cacheKeySuffix}`;
    const cachedItem = cache[cacheKey];
    
    if (cachedItem && cachedItem.expireAt > now) {
      result[item] = cachedItem.data;
    } else {
      itemsToFetch.push(item);
    }
  });

  // Nếu có item chưa có trong cache hoặc đã hết hạn, gọi API
  if (itemsToFetch.length > 0) {
    try {
      const itemsString = itemsToFetch.join(',');
      const url = `${ALBION_API_BASE}/${itemsString}?locations=${locations}`;
      const response = await axios.get(url);
      
      const fetchedData = response.data;
      
      // Chạy qua hàm chuẩn hóa giá (Lọc Quality = 1)
      const formattedData = extractValidPrice(fetchedData);
      
      // Lưu vào kết quả trả về và cache
      for (const itemId in formattedData) {
        result[itemId] = formattedData[itemId];
        
        const cacheKey = `price:${itemId}:${cacheKeySuffix}`;
        cache[cacheKey] = {
          data: formattedData[itemId],
          expireAt: Date.now() + CACHE_TTL_MS
        };
      }
      
    } catch (error) {
      console.error('Lỗi khi gọi Albion API:', error.message);
      throw new Error('Không thể lấy dữ liệu từ Albion API');
    }
  }

  return result;
}

// ==========================================
// 1. API lấy giá item
// GET /api/prices?items=T4_BAG,T5_BAG&locations=Martlock,Caerleon
// ==========================================
app.get('/api/prices', async (req, res) => {
  try {
    const itemsQuery = req.query.items;
    const locations = req.query.locations || req.query.location;

    if (!itemsQuery || !locations) {
      return res.status(400).json({ error: 'Thiếu tham số items hoặc locations' });
    }

    const items = itemsQuery.split(',').map(i => i.trim());
    const prices = await getPricesWithCache(items, locations);

    // Chú ý: Vì `prices` là Map: { "T4_BAG": { Caerleon: {...}, Martlock: {...} } }
    // Frontend của mình (apiService) đang mong đợi Object dạng `formattedData` để Object.assign.
    // Nên ta trả về thẳng object prices.
    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. API tính profit
// POST /api/profit
// ==========================================
app.post('/api/profit', async (req, res) => {
  try {
    const { item_id, location, materials } = req.body;

    if (!item_id || !location || !materials || !Array.isArray(materials)) {
      return res.status(400).json({ error: 'Body không hợp lệ. Yêu cầu item_id, location và materials (array)' });
    }

    // Lấy danh sách tất cả các item cần tra giá (bao gồm item chính và nguyên liệu)
    const materialIds = materials.map(m => m.item_id);
    const allItems = [item_id, ...materialIds];

    // Lấy giá qua hàm cache
    const prices = await getPricesWithCache(allItems, location);

    // Tính toán chi phí
    let totalCost = 0;
    const materialDetails = materials.map(mat => {
      const matCities = prices[mat.item_id] || {};
      const matPriceInfo = matCities[location];
      // Ưu tiên dùng sell_price_min, nếu không có thì lấy 0
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

    // Lấy giá bán dự kiến của item chính
    const mainItemCities = prices[item_id] || {};
    const mainItemPriceInfo = mainItemCities[location];
    const sellPrice = mainItemPriceInfo ? mainItemPriceInfo.sell_price_min : 0;

    // Tính lợi nhuận (Chưa trừ RRR/Tax, có thể thêm sau nếu cần)
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

// Chạy server
app.listen(PORT, () => {
  console.log(`🚀 API Server đang chạy tại http://localhost:${PORT}`);
});
