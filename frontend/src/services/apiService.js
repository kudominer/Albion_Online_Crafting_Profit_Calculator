import axios from 'axios';
import { useStore } from '../cache/marketStore';

const BACKEND_URL = 'http://localhost:3001';
const ALL_LOCATIONS = 'Caerleon,Martlock,Bridgewatch,Lymhurst,Fort Sterling,Thetford,Black Market';

export class ApiService {
  // ── Fetch market prices (batch) ─────────────────────────
  static async fetchMarketPrices(itemIds, locations = ALL_LOCATIONS) {
    if (!itemIds || itemIds.length === 0) return;
    const store = useStore.getState();
    store.setIsFetching(true);

    try {
      const chunkSize = 200;
      const formattedData = {};
      for (let i = 0; i < itemIds.length; i += chunkSize) {
        const chunk = itemIds.slice(i, i + chunkSize);
        const url = `${BACKEND_URL}/api/prices?items=${chunk.join(',')}&locations=${locations}&server=${store.globalServer}`;
        const response = await axios.get(url);
        Object.assign(formattedData, response.data);
      }
      store.setMarketData(formattedData);
      return formattedData;
    } catch (error) {
      console.error('[ApiService] fetchMarketPrices error:', error.message);
    } finally {
      store.setIsFetching(false);
    }
  }

  // ── Craft profit for a single item ─────────────────────
  static async fetchCraftProfit(itemId, city, rrr, tax) {
    try {
      const params = new URLSearchParams({ item: itemId, city, rrr, tax });
      const res = await axios.get(`${BACKEND_URL}/api/craft-profit?${params}`);
      return res.data;
    } catch (error) {
      console.error('[ApiService] fetchCraftProfit error:', error.message);
      return null;
    }
  }

  // ── Refine chain tree for a refined resource ────────────
  static async fetchRefineChain(itemId, city, rrr) {
    try {
      const params = new URLSearchParams({ item: itemId, city, rrr });
      const res = await axios.get(`${BACKEND_URL}/api/refine-chain?${params}`);
      return res.data;
    } catch (error) {
      console.error('[ApiService] fetchRefineChain error:', error.message);
      return null;
    }
  }

  // ── Transport profit between 2 cities ──────────────────
  static async fetchTransportProfit(itemIds, from, to) {
    try {
      const items = Array.isArray(itemIds) ? itemIds.join(',') : itemIds;
      const params = new URLSearchParams({ item: items, from, to });
      const res = await axios.get(`${BACKEND_URL}/api/transport?${params}`);
      return Array.isArray(res.data) ? res.data : [res.data];
    } catch (error) {
      console.error('[ApiService] fetchTransportProfit error:', error.message);
      return [];
    }
  }

  // ── Flip arbitrage for items ────────────────────────────
  static async fetchFlipData(itemIds, city) {
    try {
      const items = Array.isArray(itemIds) ? itemIds.join(',') : itemIds;
      const params = new URLSearchParams({ items });
      if (city) params.append('city', city);
      const res = await axios.get(`${BACKEND_URL}/api/flip?${params}`);
      return res.data;
    } catch (error) {
      console.error('[ApiService] fetchFlipData error:', error.message);
      return [];
    }
  }

  // ── Top profit ranking ──────────────────────────────────
  static async fetchTopProfit(type = 'craft', city, limit = 30, rrr = '15.2', tax = '6.5') {
    const store = useStore.getState();
    store.setTopProfitLoading(true);
    try {
      const params = new URLSearchParams({ type, limit, rrr, tax });
      if (city) params.append('city', city);
      const res = await axios.get(`${BACKEND_URL}/api/market/top-profit?${params}`);
      if (type === 'craft') store.setTopProfitCraft(res.data);
      else if (type === 'refine') store.setTopProfitRefine(res.data);
      else if (type === 'flip') store.setTopProfitFlip(res.data);
      return res.data;
    } catch (error) {
      console.error('[ApiService] fetchTopProfit error:', error.message);
      return [];
    } finally {
      store.setTopProfitLoading(false);
    }
  }

  // ── Scanner status ──────────────────────────────────────
  static async fetchScannerStatus() {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/scanner/status`);
      useStore.getState().setScannerStatus(res.data);
      return res.data;
    } catch (error) {
      return null;
    }
  }
}
