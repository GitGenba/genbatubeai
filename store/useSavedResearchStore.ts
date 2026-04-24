import { create } from "zustand";
import { SavedResearch, VideoResult } from "@/types/index";

interface SavedResearchState {
  savedResearches: SavedResearch[];
  isLoading: boolean;
}

interface SavedResearchActions {
  fetchResearches: () => Promise<void>;
  saveResearch: (
    keywords: string[],
    regionCode: string,
    table1: VideoResult[],
    table2: VideoResult[]
  ) => Promise<void>;
  deleteResearch: (id: string) => Promise<void>;
  clearAll: () => void;
}

export const useSavedResearchStore = create<
  SavedResearchState & SavedResearchActions
>()((set, get) => ({
  savedResearches: [],
  isLoading: false,

  fetchResearches: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/researches");
      if (!res.ok) return;
      const data: SavedResearch[] = await res.json();
      set({ savedResearches: data });
    } catch {
      // silently fail
    } finally {
      set({ isLoading: false });
    }
  },

  saveResearch: async (keywords, regionCode, table1, table2) => {
    const newResearch: SavedResearch = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      keywords,
      regionCode,
      table1,
      table2,
    };

    try {
      const res = await fetch("/api/researches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newResearch),
      });
      if (!res.ok) return;
      const saved: SavedResearch = await res.json();
      set((state) => ({
        savedResearches: [saved, ...state.savedResearches].slice(0, 20),
      }));
    } catch {
      // silently fail
    }
  },

  deleteResearch: async (id) => {
    set((state) => ({
      savedResearches: state.savedResearches.filter((r) => r.id !== id),
    }));
    try {
      await fetch(`/api/researches/${id}`, { method: "DELETE" });
    } catch {
      await get().fetchResearches();
    }
  },

  clearAll: () => set({ savedResearches: [] }),
}));
