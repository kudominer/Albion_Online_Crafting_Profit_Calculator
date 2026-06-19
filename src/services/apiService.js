import axios from 'axios';
import { useStore } from '../cache/marketStore'; // Notice the path change to cache/marketStore
import { API_SERVERS } from '../core/config';

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
        const url = `${serverConfig.url}/${chunk.join(',')}?locations=Caerleon,Bridgewatch,Martlock,Thetford,Fort Sterling,Lymhurst,Brecilien`;
        
        const response = await axios.get(url);
        const data = response.data;
        
        data.forEach(item => {
          // Chỉ lấy quality 1 (Normal) cho nguyên liệu và item cơ bản
          if (item.quality !== 1) return;

          const { item_id, city, sell_price_min, buy_price_max } = item;
          if (!formattedData[item_id]) {
            formattedData[item_id] = {};
          }
          formattedData[item_id][city] = {
            sellPriceMin: sell_price_min,
            buyPriceMax: buy_price_max,
          };
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
