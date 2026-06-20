export class PriceService {
  /**
   * Lấy giá Min Sell và Max Buy của một item từ marketData theo thành phố
   * @param {Object} marketData - Dữ liệu lấy từ Store
   * @param {string} uniqueName - ID của vật phẩm
   * @param {string} city - Tên thành phố (bỏ trống = tất cả)
   * @returns {Object} { sellPrice, buyPrice }
   */
  static getPrices(marketData, uniqueName, city = '') {
    let sellPrice = 0;
    let buyPrice = 0;

    if (!marketData[uniqueName]) return { sellPrice, buyPrice };

    const cityData = marketData[uniqueName];
    let targetCityData = cityData;
    
    if (city && cityData[city]) {
      targetCityData = { [city]: cityData[city] };
    } else if (city) {
      targetCityData = {}; // Không có dữ liệu cho thành phố này
    }

    const sells = Object.values(targetCityData).map(d => d.sellPriceMin).filter(p => p > 0);
    sellPrice = sells.length > 0 ? Math.min(...sells) : 0;
    
    const buys = Object.values(targetCityData).map(d => d.buyPriceMax).filter(p => p > 0);
    buyPrice = buys.length > 0 ? Math.max(...buys) : 0;

    return { sellPrice, buyPrice };
  }

  /**
   * Lấy giá nguyên liệu (Ưu tiên Custom Price, nếu không lấy API)
   */
  static getMaterialPrice(marketData, customPrices, uniqueName, city = '') {
    if (customPrices[uniqueName]) {
      return Number(customPrices[uniqueName]);
    }
    
    const prices = this.getPrices(marketData, uniqueName, city);
    return prices.sellPrice;
  }
  /**
   * Chuyển đổi dữ liệu thô từ API Albion thành cấu trúc lưu vào Store.
   * Áp dụng luật ưu tiên Quality 1 hoặc giá trị > 0 đầu tiên.
   * @param {Array} rawData - Mảng dữ liệu từ API
   * @returns {Object} formattedData
   */
  static extractValidPrice(rawData) {
    const tempPrices = {};

    rawData.forEach(item => {
      const { item_id, city, quality, sell_price_min, buy_price_max } = item;
      
      // Bỏ qua nếu hoàn toàn không có dữ liệu bán và mua
      if (sell_price_min <= 0 && buy_price_max <= 0) {
        // Có thể log debug ở đây nếu cần thiết
        return;
      }

      if (!tempPrices[item_id]) tempPrices[item_id] = {};
      if (!tempPrices[item_id][city]) {
        tempPrices[item_id][city] = { 
          q1_sell: 0, first_valid_sell: 0,
          q1_buy: 0, first_valid_buy: 0
        };
      }

      const p = tempPrices[item_id][city];

      // Logic cho Sell Price
      if (sell_price_min > 0) {
        if (quality === 1) {
          p.q1_sell = sell_price_min;
        } else if (p.first_valid_sell === 0) {
          p.first_valid_sell = sell_price_min;
        }
      }

      // Logic cho Buy Price
      if (buy_price_max > 0) {
        if (quality === 1) {
          p.q1_buy = buy_price_max;
        } else if (p.first_valid_buy === 0) {
          p.first_valid_buy = buy_price_max;
        }
      }
    });

    const formattedData = {};
    for (const itemId in tempPrices) {
      formattedData[itemId] = {};
      for (const city in tempPrices[itemId]) {
        const p = tempPrices[itemId][city];
        
        // Cảnh báo nếu giá bằng 0 (Debug Mode)
        const finalSell = p.q1_sell > 0 ? p.q1_sell : p.first_valid_sell;
        const finalBuy = p.q1_buy > 0 ? p.q1_buy : p.first_valid_buy;
        
        if (finalSell === 0 && finalBuy === 0) {
           console.log(`[DEBUG] Item ${itemId} ở ${city} có giá = 0`);
        }

        formattedData[itemId][city] = {
          sellPriceMin: finalSell,
          buyPriceMax: finalBuy
        };
      }
    }

    return formattedData;
  }
}
