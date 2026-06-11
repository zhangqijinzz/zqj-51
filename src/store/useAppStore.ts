import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, StallItem, Product, DiscountRule, Scene, SimulationResult, ActiveTab } from '@/types';
import { defaultProducts } from '@/data/products';
import { defaultDiscountRules, defaultStallItems } from '@/data/materials';
import { scenes } from '@/data/scenes';

const STORAGE_KEY = 'stall-simulator-state';

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeTab: 'setup',
      stallItems: defaultStallItems,
      products: defaultProducts,
      discountRules: defaultDiscountRules,
      selectedScene: scenes[0],
      simulationResults: [],
      isSimulating: false,
      simulationHours: 4,
      selectedItemId: null,

      setActiveTab: (tab: ActiveTab) => set({ activeTab: tab }),
      setSelectedItemId: (id: string | null) => set({ selectedItemId: id }),

      addStallItem: (item: StallItem) =>
        set((state) => ({
          stallItems: [...state.stallItems, item],
          selectedItemId: item.id,
        })),

      updateStallItem: (id: string, updates: Partial<StallItem>) =>
        set((state) => ({
          stallItems: state.stallItems.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),

      removeStallItem: (id: string) =>
        set((state) => ({
          stallItems: state.stallItems.filter((item) => item.id !== id),
          selectedItemId: state.selectedItemId === id ? null : state.selectedItemId,
        })),

      clearStallItems: () => set({ stallItems: [], selectedItemId: null }),

      updateProduct: (id: string, updates: Partial<Product>) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      addDiscountRule: (rule: DiscountRule) =>
        set((state) => ({
          discountRules: [...state.discountRules, rule],
        })),

      updateDiscountRule: (id: string, updates: Partial<DiscountRule>) =>
        set((state) => ({
          discountRules: state.discountRules.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      removeDiscountRule: (id: string) =>
        set((state) => ({
          discountRules: state.discountRules.filter((r) => r.id !== id),
        })),

      setSelectedScene: (scene: Scene | null) => set({ selectedScene: scene }),
      setSimulating: (val: boolean) => set({ isSimulating: val }),

      addSimulationResult: (result: SimulationResult) =>
        set((state) => ({
          simulationResults: [...state.simulationResults, result],
        })),

      clearSimulationResults: () => set({ simulationResults: [] }),

      resetAll: () =>
        set({
          stallItems: defaultStallItems,
          products: defaultProducts,
          discountRules: defaultDiscountRules,
          selectedScene: scenes[0],
          simulationResults: [],
          isSimulating: false,
          simulationHours: 4,
          selectedItemId: null,
          activeTab: 'setup',
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      },

      loadFromLocalStorage: () => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          try {
            const data = JSON.parse(raw);
            const scene = scenes.find((s) => s.id === data.selectedSceneId) || scenes[0];
            set({
              stallItems: data.stallItems || defaultStallItems,
              products: data.products || defaultProducts,
              discountRules: data.discountRules || defaultDiscountRules,
              selectedScene: scene,
              simulationHours: data.simulationHours || 4,
            });
          } catch (e) {
            console.error('Failed to load from localStorage', e);
          }
        }
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        stallItems: state.stallItems,
        products: state.products,
        discountRules: state.discountRules,
        selectedSceneId: state.selectedScene?.id,
        simulationHours: state.simulationHours,
      }),
    }
  )
);
