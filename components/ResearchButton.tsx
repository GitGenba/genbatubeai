"use client";

import { useResearchStore } from "@/store/useResearchStore";

export default function ResearchButton() {
  const keywords = useResearchStore((state) => state.keywords);
  const isLoading = useResearchStore((state) => state.isLoading);
  const setLoading = useResearchStore((state) => state.setLoading);
  const setError = useResearchStore((state) => state.setError);
  const setTable1 = useResearchStore((state) => state.setTable1);
  const setTable2 = useResearchStore((state) => state.setTable2);

  const isDisabled = keywords.length === 0 || isLoading;

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords }),
      });

      if (!response.ok) {
        throw new Error("Ошибка при поиске");
      }

      const data = await response.json();
      setTable1(data.table1 || []);
      setTable2(data.table2 || []);
    } catch {
      setError("Ошибка при поиске. Попробуй снова.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-2 ${
        isDisabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700"
      }`}
    >
      {isLoading && (
        <svg
          className="animate-spin h-5 w-5 text-white"
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
      {isLoading ? "Ищем..." : "Ресерч"}
    </button>
  );
}
