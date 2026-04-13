"use client";

import { useResearchStore } from "@/store/useResearchStore";
import { useSavedResearchStore } from "@/store/useSavedResearchStore";

export default function ResearchButton() {
  const keywords = useResearchStore((state) => state.keywords);
  const regionCode = useResearchStore((state) => state.regionCode);
  const isLoading = useResearchStore((state) => state.isLoading);
  const setLoading = useResearchStore((state) => state.setLoading);
  const setError = useResearchStore((state) => state.setError);
  const setTable1 = useResearchStore((state) => state.setTable1);
  const setTable2 = useResearchStore((state) => state.setTable2);
  const saveResearch = useSavedResearchStore((state) => state.saveResearch);

  const isDisabled = keywords.length === 0 || isLoading;

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords, regionCode }),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      const table1 = data.table1 || [];
      const table2 = data.table2 || [];
      
      setTable1(table1);
      setTable2(table2);
      
      if (table1.length > 0 || table2.length > 0) {
        saveResearch(keywords, regionCode, table1, table2);
      }
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-3 ${
        isDisabled
          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
          : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-600/20"
      }`}
    >
      {isLoading && (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {isLoading ? "Searching..." : "Research"}
    </button>
  );
}
