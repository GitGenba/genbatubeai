"use client";

import { useSavedResearchStore } from "@/store/useSavedResearchStore";
import { useResearchStore } from "@/store/useResearchStore";

const REGION_NAMES: Record<string, string> = {
  "": "Auto",
  RU: "Russia",
  US: "United States",
  IN: "India",
  BR: "Brazil",
  ID: "Indonesia",
  MX: "Mexico",
  JP: "Japan",
  DE: "Germany",
  GB: "United Kingdom",
  FR: "France",
};

export default function SavedResearches() {
  const savedResearches = useSavedResearchStore((state) => state.savedResearches);
  const deleteResearch = useSavedResearchStore((state) => state.deleteResearch);

  const setKeywords = useResearchStore((state) => {
    return (keywords: string[]) => {
      useResearchStore.setState({ keywords });
    };
  });
  const setRegionCode = useResearchStore((state) => state.setRegionCode);
  const setTable1 = useResearchStore((state) => state.setTable1);
  const setTable2 = useResearchStore((state) => state.setTable2);
  const setSuggestions = useResearchStore((state) => state.setSuggestions);

  if (savedResearches.length === 0) {
    return null;
  }

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleLoad = (research: (typeof savedResearches)[0]) => {
    useResearchStore.setState({
      keywords: research.keywords,
      regionCode: research.regionCode,
      table1: research.table1,
      table2: research.table2,
      suggestions: [],
      finalList: [],
      error: null,
    });
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-white mb-3">
        My Researches ({savedResearches.length})
      </h2>
      <div className="space-y-2">
        {savedResearches.map((research) => (
          <div
            key={research.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl"
          >
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {research.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-xs px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded"
                  >
                    {kw}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{formatDate(research.date)}</span>
                <span>•</span>
                <span>{REGION_NAMES[research.regionCode] || "Auto"}</span>
                <span>•</span>
                <span>
                  {research.table1.length + research.table2.length} videos
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleLoad(research)}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-all"
              >
                Load
              </button>
              <button
                onClick={() => deleteResearch(research.id)}
                className="px-4 py-2 bg-red-600/20 text-red-400 text-sm rounded-lg hover:bg-red-600/30 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
