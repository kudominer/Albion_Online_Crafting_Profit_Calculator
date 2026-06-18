import axios from 'axios';
import { useStore } from '../store/useStore';

const ALBION_DATA_API_BASE = 'https://www.albion-online-data.com/api/v2/stats/prices';

export const fetchMarketPrices = async (uniqueNamesList) => {
  if (!uniqueNamesList || uniqueNamesList.length === 0) return;
  
  // Lọc bỏ những item đã có trong cache để tránh fetch lại dư thừa
  const currentCache = useStore.getState().marketData;
  const itemsToFetch = uniqueNamesList.filter(id => !currentCache[id]);
  
  if (itemsToFetch.length === 0) return;

  const namesStr = itemsToFetch.join(',');
  useStore.getState().setIsFetching(true);
  
  try {
    const response = await axios.get(`${ALBION_DATA_API_BASE}/${namesStr}`);
    const data = response.data;
    
    const formattedData = {};
    
    data.forEach(entry => {
      const { item_id, city, sell_price_min, buy_price_max } = entry;
      if (!formattedData[item_id]) {
        formattedData[item_id] = {};
      }
      formattedData[item_id][city] = {
        sellPriceMin: sell_price_min,
        buyPriceMax: buy_price_max,
      };
    });
    
    // Cập nhật lại những item không có ai bán (API không trả về) thành mảng rỗng để đánh dấu là đã fetch
    itemsToFetch.forEach(id => {
      if (!formattedData[id]) {
        formattedData[id] = {};
      }
    });

    useStore.getState().setMarketData(formattedData);
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu giá:', error);
  } finally {
    useStore.getState().setIsFetching(false);
  }
};
