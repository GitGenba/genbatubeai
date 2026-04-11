import { create } from "zustand";
import { VideoResult, ResearchState } from "@/types/index";

interface ResearchActions {
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  setSuggestions: (suggestions: string[]) => void;
  setTable1: (videos: VideoResult[]) => void;
  setTable2: (videos: VideoResult[]) => void;
  addToFinalList: (video: VideoResult) => void;
  removeFromFinalList: (videoId: string) => void;
  setLoading: (v: boolean) => void;
  setLoadingTable2: (v: boolean) => void;
  setError: (msg: string | null) => void;
  reset: () => void;
}

const initialState: ResearchState = {
  keywords: [],
  suggestions: [],
  table1: [],
  table2: [],
  finalList: [],
  isLoading: false,
  isLoadingTable2: false,
  error: null,
};

export const useResearchStore = create<ResearchState & ResearchActions>(
  (set) => ({
    ...initialState,

    addKeyword: (keyword: string) =>
      set((state) => {
        if (state.keywords.length >= 5) return state;
        if (state.keywords.includes(keyword)) return state;
        return { keywords: [...state.keywords, keyword] };
      }),

    removeKeyword: (keyword: string) =>
      set((state) => ({
        keywords: state.keywords.filter((k) => k !== keyword),
      })),

    setSuggestions: (suggestions: string[]) => set({ suggestions }),

    setTable1: (videos: VideoResult[]) => set({ table1: videos }),

    setTable2: (videos: VideoResult[]) => set({ table2: videos }),

    addToFinalList: (video: VideoResult) =>
      set((state) => {
        if (state.finalList.some((v) => v.id === video.id)) return state;
        return { finalList: [...state.finalList, video] };
      }),

    removeFromFinalList: (videoId: string) =>
      set((state) => ({
        finalList: state.finalList.filter((v) => v.id !== videoId),
      })),

    setLoading: (v: boolean) => set({ isLoading: v }),

    setLoadingTable2: (v: boolean) => set({ isLoadingTable2: v }),

    setError: (msg: string | null) => set({ error: msg }),

    reset: () => set(initialState),
  })
);
