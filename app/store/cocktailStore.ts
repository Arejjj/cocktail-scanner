"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Ingredient = {
  name: string;
  measure: string;
};

export type Cocktail = {
  id: string;
  name: string;
  category: string;
  instructions: string;
  ingredients: Ingredient[];
  glass: string;
  garnish?: string;
  imageUrl?: string;
  tags?: string[];
  isFavorite?: boolean;
  edited?: boolean;
  source: "gemini" | "cocktaildb" | "scanned" | "api" | "manual";
  scannedMenuImageUrl?: string;
  createdAt: string;
};

export type ScanState = {
  detectedIngredients: Ingredient[];
  detectedName: string | null;
  menuImageDataUrl: string | null;
  isProcessing: boolean;
};

type CocktailStore = {
  // Collection
  collection: Cocktail[];
  addCocktail: (c: Cocktail) => void;
  updateCocktail: (id: string, updates: Partial<Cocktail>) => void;
  removeCocktail: (id: string) => void;
  toggleFavorite: (id: string) => void;

  // Active recipe (for detail view)
  activeCocktail: Cocktail | null;
  setActiveCocktail: (c: Cocktail | null) => void;

  // Scan flow
  scan: ScanState;
  setScanImage: (dataUrl: string) => void;
  setScanIngredients: (ingredients: Ingredient[]) => void;
  setScanName: (name: string | null) => void;
  setScanProcessing: (v: boolean) => void;
  clearScan: () => void;
};

const initialScan: ScanState = {
  detectedIngredients: [],
  detectedName: null,
  menuImageDataUrl: null,
  isProcessing: false,
};

export const useCocktailStore = create<CocktailStore>()(
  persist(
    (set) => ({
      collection: [],
      addCocktail: (c) =>
        set((s) => ({
          collection: s.collection.some((x) => x.id === c.id)
            ? s.collection
            : [c, ...s.collection],
        })),
      updateCocktail: (id, updates) =>
        set((s) => ({
          collection: s.collection.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      removeCocktail: (id) =>
        set((s) => ({ collection: s.collection.filter((c) => c.id !== id) })),
      toggleFavorite: (id) =>
        set((s) => ({
          collection: s.collection.map((c) =>
            c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
          ),
        })),

      activeCocktail: null,
      setActiveCocktail: (c) => set({ activeCocktail: c }),

      scan: initialScan,
      setScanImage: (dataUrl) =>
        set((s) => ({ scan: { ...s.scan, menuImageDataUrl: dataUrl } })),
      setScanIngredients: (ingredients) =>
        set((s) => ({ scan: { ...s.scan, detectedIngredients: ingredients } })),
      setScanName: (name) =>
        set((s) => ({ scan: { ...s.scan, detectedName: name } })),
      setScanProcessing: (v) =>
        set((s) => ({ scan: { ...s.scan, isProcessing: v } })),
      clearScan: () => set({ scan: initialScan }),
    }),
    { name: "mixology-collection" }
  )
);
