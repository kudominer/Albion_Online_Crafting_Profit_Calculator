import axios from 'axios';

// ==========================================
// CONFIGURATION & RESOURCE NAMES
// ==========================================
export const RESOURCE_NAMES = {
  // Raw materials
  WOOD: { vi: 'Gỗ nguyên liệu', en: 'Wood' },
  STONE: { vi: 'Đá nguyên liệu', en: 'Stone' },
  ORE: { vi: 'Quặng', en: 'Ore' },
  FIBER: { vi: 'Sợi', en: 'Fiber' },
  HIDE: { vi: 'Da thú', en: 'Hide' },
  
  // Refined materials
  PLANKS: { vi: 'Ván gỗ', en: 'Planks' },
  STONEBLOCK: { vi: 'Khối đá', en: 'Stone Block' },
  METALBAR: { vi: 'Thỏi kim loại', en: 'Metal Bar' },
  CLOTH: { vi: 'Vải', en: 'Cloth' },
  LEATHER: { vi: 'Da thuộc', en: 'Leather' }
};

const RAW_RESOURCES = ['WOOD', 'STONE', 'ORE', 'FIBER', 'HIDE'];
const REFINED_RESOURCES = ['PLANKS', 'STONEBLOCK', 'METALBAR', 'CLOTH', 'LEATHER'];

const TIERS = [2, 3, 4, 5, 6, 7, 8];

// ==========================================
// HELPER: GET ITEM ID
// Lấy item ID chuẩn xác dựa theo công thức Albion
// ==========================================
export function getItemId(resource, tier, enchant = 0) {
  if (tier < 2 || tier > 8) throw new Error("Tier phải từ 2 đến 8");
  if (enchant < 0 || enchant > 4) throw new Error("Enchant phải từ 0 đến 4"); // .4 mới được cập nhật trong game
  
  const base = `T${tier}_${resource}`;
  if (enchant === 0) return base;
  return `${base}_LEVEL${enchant}`;
}

// ==========================================
// GENERATE ITEM MAPPING SYSTEM
// Tạo object itemMapping có cấu trúc như yêu cầu
// ==========================================
export const itemMapping = {};

[...RAW_RESOURCES, ...REFINED_RESOURCES].forEach(res => {
  itemMapping[res] = {
    name: RESOURCE_NAMES[res],
    tiers: {}
  };
  
  TIERS.forEach(tier => {
    itemMapping[res].tiers[`T${tier}`] = {};
    
    // Tier 2, 3 trong game thường không có enchant (trừ một số ngoại lệ nhưng rất hiếm).
    // Tuy nhiên để dễ mở rộng, ta vẫn gen theo đúng luật. Max enchant hiện tại của game là 4 (T4.4).
    const maxEnchant = (tier >= 4) ? 4 : 0; 
    
    for (let e = 0; e <= maxEnchant; e++) {
      itemMapping[res].tiers[`T${tier}`][e] = getItemId(res, tier, e);
    }
  });
});

// ==========================================
// HELPER: Lấy Display Name
// Trả về tên hiển thị (Ví dụ: Gỗ nguyên liệu T4.2)
// ==========================================
export function getDisplayName(resource, tier, enchant = 0, lang = 'vi') {
  const resConfig = RESOURCE_NAMES[resource];
  const resName = resConfig ? resConfig[lang] : resource;
  
  if (enchant === 0) return `${resName} T${tier}`;
  return `${resName} T${tier}.${enchant}`;
}

// ==========================================
// HELPER: Lấy tất cả item ID của một resource
// Trả về array: ["T4_WOOD", "T4_WOOD_LEVEL1", ...]
// ==========================================
export function getAllItemsByResource(resource) {
  const items = [];
  const resData = itemMapping[resource];
  if (!resData) return items;
  
  Object.values(resData.tiers).forEach(tierObj => {
    Object.values(tierObj).forEach(itemId => {
      items.push(itemId);
    });
  });
  
  return items;
}

// ==========================================
// API INTEGRATION: getPricesByResource
// Kéo giá tự động cho 1 tier của resource
// ==========================================
export async function getPricesByResource(resource, tier, location) {
  // Lấy toàn bộ enchant của tier được chỉ định
  const items = [];
  const resData = itemMapping[resource];
  
  if (resData && resData.tiers[`T${tier}`]) {
    Object.values(resData.tiers[`T${tier}`]).forEach(id => items.push(id));
  } else {
    throw new Error(`Resource ${resource} không hỗ trợ Tier ${tier}`);
  }
  
  if (items.length === 0) return {};

  const itemsString = items.join(',');
  const url = `https://www.albion-online-data.com/api/v2/stats/prices/${itemsString}?locations=${location}`;
  
  try {
    const response = await axios.get(url);
    const data = response.data;
    
    // Sử dụng logic fix bug quality
    // Tạm lưu giá để lọc
    const tempPrices = {};

    data.forEach(item => {
      const { item_id, city, quality, sell_price_min } = item;
      
      // Bỏ giá = 0
      if (sell_price_min <= 0) return;

      if (!tempPrices[item_id]) tempPrices[item_id] = {};
      if (!tempPrices[item_id][city]) {
        tempPrices[item_id][city] = { q1_price: 0, first_valid_price: 0 };
      }

      // Ưu tiên quality 1, nếu không có lấy giá hợp lệ đầu tiên
      if (quality === 1) {
        tempPrices[item_id][city].q1_price = sell_price_min;
      } else if (tempPrices[item_id][city].first_valid_price === 0) {
        tempPrices[item_id][city].first_valid_price = sell_price_min;
      }
    });

    // Lọc lại output cuối cùng
    const finalResult = {};
    for (const itemId in tempPrices) {
      finalResult[itemId] = {};
      for (const city in tempPrices[itemId]) {
        const prices = tempPrices[itemId][city];
        // Nếu có q1_price thì dùng, không thì lấy giá đầu tiên > 0
        finalResult[itemId][city] = prices.q1_price > 0 ? prices.q1_price : prices.first_valid_price;
      }
    }

    return finalResult;
  } catch (error) {
    console.error(`[API Lỗi] Không thể kéo giá cho ${resource} T${tier}:`, error.message);
    throw error;
  }
}
