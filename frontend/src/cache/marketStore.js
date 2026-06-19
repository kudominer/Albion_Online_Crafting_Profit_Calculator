import { create } from 'zustand';

export const useStore = create((set) => ({
  marketData: {},
  selectedRootId: null,
  selectedItem: null,
  isFetching: false,

  // Global Settings
  globalRrr: '15.2',
  globalTax: '6.5',
  globalCraftFee: '',
  globalCity: '', // Empty means 'All Cities'
  globalServer: 'europe',
  customPrices: {},
  
  // UI State
  isSettingsOpen: false,
  activeTab: 'destiny', // 'destiny', 'watchlist'
  searchQuery: '',
  
  // Watchlist (Array of uniqueNames)
  watchlist: [],

  // Marketplace State
  marketCategory: null,
  marketSubcategory: null,
  marketItemFamily: null,
  marketTier: 'All',
  marketEnchantment: 'All',

  setMarketData: (data) => set((state) => ({
    marketData: { ...state.marketData, ...data }
  })),

  setMarketCategory: (cat) => set({ marketCategory: cat, marketSubcategory: null, marketItemFamily: null }),
  setMarketSubcategory: (subcat) => set({ marketSubcategory: subcat, marketItemFamily: null }),
  setMarketItemFamily: (family) => set({ marketItemFamily: family }),
  setMarketTier: (tier) => set({ marketTier: tier }),
  setMarketEnchantment: (ench) => set({ marketEnchantment: ench }),

  setSelectedRootId: (id) => set({ selectedRootId: id }),
  setSelectedItem: (item) => set({ selectedItem: item }),
  setIsFetching: (status) => set({ isFetching: status }),

  setGlobalRrr: (val) => set({ globalRrr: val }),
  setGlobalTax: (val) => set({ globalTax: val }),
  setGlobalCraftFee: (val) => set({ globalCraftFee: val }),
  setGlobalCity: (val) => set({ globalCity: val }),
  setGlobalServer: (val) => set({ globalServer: val }),
  setCustomPrice: (uniqueName, price) => set((state) => ({
    customPrices: { ...state.customPrices, [uniqueName]: price }
  })),
  setIsSettingsOpen: (status) => set({ isSettingsOpen: status }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  toggleWatchlist: (uniqueName) => set((state) => ({
    watchlist: state.watchlist.includes(uniqueName) 
      ? state.watchlist.filter(name => name !== uniqueName)
      : [...state.watchlist, uniqueName]
  }))
}));
