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
 * Hàm hỗ trợ lấy giá của 1 hoặc nhiều items từ Albion API (có sử dụng cache)
 * @param {string[]} items Array các item_id (VD: ['T4_BAG', 'T4_CLOTH'])
 * @param {string} location Thành phố (VD: 'Martlock')
 * @returns {Promise<Object>} Map các item_id và giá của chúng
 */
async function getPricesWithCache(items, location) {
  const result = {};
  const itemsToFetch = [];

  // Kiểm tra cache
  const now = Date.now();
  items.forEach(item => {
    const cacheKey = `price:${item}:${location}`;
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
      const url = `${ALBION_API_BASE}/${itemsString}?locations=${location}`;
      const response = await axios.get(url);
      
      const fetchedData = response.data;
      
      // Lưu vào cache và result
      fetchedData.forEach(data => {
        const itemId = data.item_id;
        const priceInfo = {
          item_id: data.item_id,
          city: data.city,
          sell_price_min: data.sell_price_min,
          buy_price_max: data.buy_price_max
        };
        
        // Lưu vào kết quả trả về
        result[itemId] = priceInfo;
        
        // Lưu vào cache
        const cacheKey = `price:${itemId}:${location}`;
        cache[cacheKey] = {
          data: priceInfo,
          expireAt: Date.now() + CACHE_TTL_MS
        };
      });
      
    } catch (error) {
      console.error('Lỗi khi gọi Albion API:', error.message);
      throw new Error('Không thể lấy dữ liệu từ Albion API');
    }
  }

  return result;
}

// ==========================================
// 1. API lấy giá item
// GET /api/prices?items=T4_BAG,T5_BAG&location=Martlock
// ==========================================
app.get('/api/prices', async (req, res) => {
  try {
    const itemsQuery = req.query.items;
    const location = req.query.location;

    if (!itemsQuery || !location) {
      return res.status(400).json({ error: 'Thiếu tham số items hoặc location' });
    }

    const items = itemsQuery.split(',').map(i => i.trim());
    const prices = await getPricesWithCache(items, location);

    // Chuyển kết quả từ Object sang Array để trả về giống format mong muốn
    const responseArray = Object.values(prices);
    
    res.json(responseArray);
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
      const matPriceInfo = prices[mat.item_id];
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
    const mainItemPriceInfo = prices[item_id];
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
