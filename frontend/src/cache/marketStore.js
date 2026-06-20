import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // ── Price Data ──────────────────────────────────────
  marketData: {},     // { [itemId]: { [city]: { sellPriceMin, buyPriceMax, updatedAt } } }
  isFetching: false,

  // ── Item Selection ───────────────────────────────────
  selectedItem: null,

  // ── Global Settings ──────────────────────────────────
  globalRrr: '15.2',
  globalTax: '6.5',
  globalCraftFee: '',
  globalCity: 'Caerleon',
  globalServer: 'east',
  globalLanguage: typeof window !== 'undefined' ? (localStorage.getItem('globalLanguage') || 'vi') : 'vi',
  globalFocus: false,        // Focus bonus simulation
  customPrices: {},

  // ── Navigation ───────────────────────────────────────
  activeMainTab: 'dashboard',  // 'dashboard' | 'craft' | 'refine' | 'transport' | 'market' | 'flip'
  isSettingsOpen: false,
  searchQuery: '',

  // ── Craft Tab State ───────────────────────────────────
  marketCategory: null,
  marketSubcategory: null,
  marketItemFamily: null,
  marketTier: 'All',
  marketEnchantment: 'All',

  // ── Transport Tab ─────────────────────────────────────
  transportFrom: 'Caerleon',
  transportTo: 'Martlock',
  transportResults: [],
  transportLoading: false,

  // ── Top Profit / Dashboard ───────────────────────────
  topProfitCraft: [],
  topProfitRefine: [],
  topProfitFlip: [],
  topProfitLoading: false,
  topProfitType: 'craft',   // 'craft' | 'refine' | 'flip'

  // ── Scanner Status ────────────────────────────────────
  scannerStatus: null,

  // ── Watchlist ─────────────────────────────────────────
  watchlist: [],

  // ── Actions ───────────────────────────────────────────
  setMarketData: (data) => set((state) => ({
    marketData: { ...state.marketData, ...data }
  })),

  setMarketCategory: (cat) => set({ marketCategory: cat, marketSubcategory: null, marketItemFamily: null }),
  setMarketSubcategory: (subcat) => set({ marketSubcategory: subcat, marketItemFamily: null }),
  setMarketItemFamily: (family) => set({ marketItemFamily: family }),
  setMarketTier: (tier) => set({ marketTier: tier }),
  setMarketEnchantment: (ench) => set({ marketEnchantment: ench }),

  setSelectedItem: (item) => set({ selectedItem: item }),
  setIsFetching: (status) => set({ isFetching: status }),

  setGlobalRrr: (val) => set({ globalRrr: val }),
  setGlobalTax: (val) => set({ globalTax: val }),
  setGlobalCraftFee: (val) => set({ globalCraftFee: val }),
  setGlobalCity: (val) => set({ globalCity: val }),
  setGlobalServer: (val) => set({ globalServer: val }),
  setGlobalFocus: (val) => set({ globalFocus: val }),
  setGlobalLanguage: (val) => set(() => {
    if (typeof window !== 'undefined') localStorage.setItem('globalLanguage', val);
    return { globalLanguage: val };
  }),
  setCustomPrice: (uniqueName, price) => set((state) => ({
    customPrices: { ...state.customPrices, [uniqueName]: price }
  })),

  setActiveMainTab: (tab) => set({ activeMainTab: tab, selectedItem: null }),
  setIsSettingsOpen: (status) => set({ isSettingsOpen: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  setTransportFrom: (city) => set({ transportFrom: city }),
  setTransportTo: (city) => set({ transportTo: city }),
  setTransportResults: (results) => set({ transportResults: results }),
  setTransportLoading: (v) => set({ transportLoading: v }),

  setTopProfitCraft: (data) => set({ topProfitCraft: data }),
  setTopProfitRefine: (data) => set({ topProfitRefine: data }),
  setTopProfitFlip: (data) => set({ topProfitFlip: data }),
  setTopProfitLoading: (v) => set({ topProfitLoading: v }),
  setTopProfitType: (type) => set({ topProfitType: type }),
  setScannerStatus: (status) => set({ scannerStatus: status }),

  toggleWatchlist: (uniqueName) => set((state) => ({
    watchlist: state.watchlist.includes(uniqueName)
      ? state.watchlist.filter(n => n !== uniqueName)
      : [...state.watchlist, uniqueName]
  })),

  // ── Selectors ─────────────────────────────────────────
  getBestSellPrice: (itemId, preferCity) => {
    const { marketData, globalCity } = get();
    const city = preferCity || globalCity;
    const data = marketData[itemId];
    if (!data) return 0;
    if (city && data[city]?.sellPriceMin > 0) return data[city].sellPriceMin;
    const prices = Object.values(data).map(d => d.sellPriceMin).filter(p => p > 0);
    return prices.length > 0 ? Math.min(...prices) : 0;
  },

  getBestBuyPrice: (itemId, preferCity) => {
    const { marketData, globalCity } = get();
    const city = preferCity || globalCity;
    const data = marketData[itemId];
    if (!data) return 0;
    if (city && data[city]?.buyPriceMax > 0) return data[city].buyPriceMax;
    const prices = Object.values(data).map(d => d.buyPriceMax).filter(p => p > 0);
    return prices.length > 0 ? Math.max(...prices) : 0;
  }
}));
