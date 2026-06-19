import axios from 'axios';
import { useStore } from '../cache/marketStore'; // Notice the path change to cache/marketStore
import { API_SERVERS } from '../core/config';
import { PriceService } from './priceService';

export class ApiService {
  /**
   * Gọi API Albion Data để lấy giá thị trường theo batch
   */
  static async fetchMarketPrices(itemIds) {
    if (!itemIds || itemIds.length === 0) return;

    const store = useStore.getState();
    store.setIsFetching(true);
    
    const serverConfig = API_SERVERS.find(s => s.id === store.globalServer) || API_SERVERS[0];

    try {
      const formattedData = {};
      
      const chunkSize = 200;
      for (let i = 0; i < itemIds.length; i += chunkSize) {
        const chunk = itemIds.slice(i, i + chunkSize);
        // Gọi trực tiếp lên Albion Data Project API (Serverless)
        const url = `${serverConfig.url}/${chunk.join(',')}?locations=Caerleon,Bridgewatch,Martlock,Thetford,Fort Sterling,Lymhurst,Brecilien`;
        
        const response = await axios.get(url);
        
        // Albion API trả về mảng phẳng. Ta cần map lại thành object cho Store.
        // { "T4_BAG": { "Caerleon": { sell_price_min: 1500, buy_price_max: 1400 } } }
        response.data.forEach(item => {
          const { item_id, city, sell_price_min, buy_price_max } = item;
          if (sell_price_min === 0 && buy_price_max === 0) return;
          
          if (!formattedData[item_id]) formattedData[item_id] = {};
          
          if (!formattedData[item_id][city]) {
            formattedData[item_id][city] = {
              item_id, city, 
              sell_price_min: sell_price_min, 
              buy_price_max: buy_price_max
            };
          } else {
            const current = formattedData[item_id][city];
            if (sell_price_min > 0) {
              if (current.sell_price_min === 0 || sell_price_min < current.sell_price_min) {
                current.sell_price_min = sell_price_min;
              }
            }
            if (buy_price_max > 0) {
              if (current.buy_price_max === 0 || buy_price_max > current.buy_price_max) {
                current.buy_price_max = buy_price_max;
              }
            }
          }
        });
      }

      store.setMarketData(formattedData);
    } catch (error) {
      console.error('Error fetching market prices:', error);
    } finally {
      store.setIsFetching(false);
    }
  }
}
