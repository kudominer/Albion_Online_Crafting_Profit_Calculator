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
}
