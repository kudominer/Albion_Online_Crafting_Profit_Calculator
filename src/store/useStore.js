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
  customPrices: {},
  isSettingsOpen: false,

  setMarketData: (data) => set((state) => ({
    marketData: { ...state.marketData, ...data }
  })),

  setSelectedRootId: (id) => set({ selectedRootId: id }),
  setSelectedItem: (item) => set({ selectedItem: item }),
  setIsFetching: (status) => set({ isFetching: status }),

  setGlobalRrr: (val) => set({ globalRrr: val }),
  setGlobalTax: (val) => set({ globalTax: val }),
  setGlobalCraftFee: (val) => set({ globalCraftFee: val }),
  setCustomPrice: (uniqueName, price) => set((state) => ({
    customPrices: { ...state.customPrices, [uniqueName]: price }
  })),
  setIsSettingsOpen: (status) => set({ isSettingsOpen: status })
}));
