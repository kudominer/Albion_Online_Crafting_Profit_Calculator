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
        // Gọi lên Backend nội bộ
        const url = `${serverConfig.url}?items=${chunk.join(',')}&locations=Black Market&server=${serverConfig.id}`;
        
        const response = await axios.get(url);
        
        // Backend đã xử lý lọc rác, cache và format sẵn
        Object.assign(formattedData, response.data);
      }

      store.setMarketData(formattedData);
    } catch (error) {
      console.error('Error fetching market prices:', error);
    } finally {
      store.setIsFetching(false);
    }
  }
}
