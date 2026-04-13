import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SavedResearch, VideoResult } from "@/types/index";

interface SavedResearchState {
  savedResearches: SavedResearch[];
}

interface SavedResearchActions {
  saveResearch: (
    keywords: string[],
    regionCode: string,
    table1: VideoResult[],
    table2: VideoResult[]
  ) => void;
  deleteResearch: (id: string) => void;
  clearAll: () => void;
}

const MAX_SAVED_RESEARCHES = 5;

export const useSavedResearchStore = create<
  SavedResearchState & SavedResearchActions
>()(
  persist(
    (set) => ({
      savedResearches: [],

      saveResearch: (keywords, regionCode, table1, table2) =>
        set((state) => {
          const newResearch: SavedResearch = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            keywords,
            regionCode,
            table1,
            table2,
          };

          const updated = [newResearch, ...state.savedResearches].slice(
            0,
            MAX_SAVED_RESEARCHES
          );

          return { savedResearches: updated };
        }),

      deleteResearch: (id) =>
        set((state) => ({
          savedResearches: state.savedResearches.filter((r) => r.id !== id),
        })),

      clearAll: () => set({ savedResearches: [] }),
    }),
    {
      name: "youtube-research-saved",
    }
  )
);
