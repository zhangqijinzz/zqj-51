import { create } from 'zustand';
import type { AppState, StallItem, Product, DiscountRule, Scene, SimulationResult, ActiveTab } from '@/types';
import { defaultProducts } from '@/data/products';
import { defaultDiscountRules, defaultStallItems } from '@/data/materials';
import { scenes } from '@/data/scenes';

const STORAGE_KEY = 'stall-simulator-state';

function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const state = data.state || data;
    const scene = scenes.find((s) => s.id === state.selectedSceneId) || scenes[0];
    return {
      stallItems: state.stallItems || defaultStallItems,
      products: state.products || defaultProducts,
      discountRules: state.discountRules || defaultDiscountRules,
      selectedScene: scene,
      simulationHours: state.simulationHours ?? 4,
    };
  } catch (e) {
    console.error('Failed to load persisted state', e);
    return null;
  }
}

const persisted = loadPersistedState();

export const useAppStore = create<AppState>()((set, get) => ({
  activeTab: 'setup',
  stallItems: persisted?.stallItems || defaultStallItems,
  products: persisted?.products || defaultProducts,
  discountRules: persisted?.discountRules || defaultDiscountRules,
  selectedScene: persisted?.selectedScene || scenes[0],
  simulationResults: [],
  isSimulating: false,
  simulationHours: persisted?.simulationHours ?? 4,
  selectedItemId: null,

  setActiveTab: (tab: ActiveTab) => set({ activeTab: tab }),
  setSelectedItemId: (id: string | null) => set({ selectedItemId: id }),

  addStallItem: (item: StallItem) =>
    set((state) => {
      const newState = {
        stallItems: [...state.stallItems, item],
        selectedItemId: item.id,
      };
      get().saveToLocalStorage();
      return newState;
    }),

  updateStallItem: (id: string, updates: Partial<StallItem>) =>
    set((state) => {
      const newState = {
        stallItems: state.stallItems.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      };
      get().saveToLocalStorage();
      return newState;
    }),

  removeStallItem: (id: string) =>
    set((state) => {
      const newState = {
        stallItems: state.stallItems.filter((item) => item.id !== id),
        selectedItemId: state.selectedItemId === id ? null : state.selectedItemId,
      };
      get().saveToLocalStorage();
      return newState;
    }),

  clearStallItems: () =>
    set(() => {
      const newState = { stallItems: [], selectedItemId: null };
      get().saveToLocalStorage();
      return newState;
    }),

  updateProduct: (id: string, updates: Partial<Product>) =>
    set((state) => {
      const newState = {
        products: state.products.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
      };
      get().saveToLocalStorage();
      return newState;
    }),

  addDiscountRule: (rule: DiscountRule) =>
    set((state) => {
      const newState = {
        discountRules: [...state.discountRules, rule],
      };
      get().saveToLocalStorage();
      return newState;
    }),

  updateDiscountRule: (id: string, updates: Partial<DiscountRule>) =>
    set((state) => {
      const newState = {
        discountRules: state.discountRules.map((r) =>
          r.id === id ? { ...r, ...updates } : r
        ),
      };
      get().saveToLocalStorage();
      return newState;
    }),

  removeDiscountRule: (id: string) =>
    set((state) => {
      const newState = {
        discountRules: state.discountRules.filter((r) => r.id !== id),
      };
      get().saveToLocalStorage();
      return newState;
    }),

  setSelectedScene: (scene: Scene | null) =>
    set(() => {
      const newState = { selectedScene: scene };
      get().saveToLocalStorage();
      return newState;
    }),

  setSimulating: (val: boolean) => set({ isSimulating: val }),

  addSimulationResult: (result: SimulationResult) =>
    set((state) => ({
      simulationResults: [...state.simulationResults, result],
    })),

  clearSimulationResults: () => set({ simulationResults: [] }),

  resetAll: () =>
    set(() => {
      localStorage.removeItem(STORAGE_KEY);
      return {
        stallItems: defaultStallItems,
        products: defaultProducts,
        discountRules: defaultDiscountRules,
        selectedScene: scenes[0],
        simulationResults: [],
        isSimulating: false,
        simulationHours: 4,
        selectedItemId: null,
        activeTab: 'setup',
      };
    }),

  saveToLocalStorage: () => {
    const state = get();
    const data = {
      stallItems: state.stallItems,
      products: state.products,
      discountRules: state.discountRules,
      selectedSceneId: state.selectedScene?.id,
      simulationHours: state.simulationHours,
    };
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: data,
        timestamp: Date.now(),
        version: 1,
      })
    );
  },

  loadFromLocalStorage: () => {
    const loaded = loadPersistedState();
    if (loaded) {
      set(loaded);
    }
  },
}));
