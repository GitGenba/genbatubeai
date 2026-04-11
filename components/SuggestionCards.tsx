"use client";

import { useState } from "react";
import { useResearchStore } from "@/store/useResearchStore";

export default function SuggestionCards() {
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  const suggestions = useResearchStore((state) => state.suggestions);
  const keywords = useResearchStore((state) => state.keywords);
  const addKeyword = useResearchStore((state) => state.addKeyword);
  const setSuggestions = useResearchStore((state) => state.setSuggestions);

  const isDisabled = keywords.length >= 5;

  if (suggestions.length === 0) {
    return null;
  }

  const handleClick = async (suggestion: string, index: number) => {
    if (isDisabled || loadingIndex !== null) return;

    setLoadingIndex(index);

    try {
      addKeyword(suggestion);

      const newKeywords = [...keywords, suggestion];

      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: suggestion,
          existingKeywords: newKeywords,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } else {
        setSuggestions([]);
      }
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingIndex(null);
    }
  };

  return (
    <div className="mt-4">
      <p className="text-sm text-gray-400 mb-2">Предложения:</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={`${suggestion}-${index}`}
            onClick={() => handleClick(suggestion, index)}
            disabled={isDisabled || loadingIndex !== null}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              isDisabled
                ? "opacity-50 cursor-not-allowed bg-gray-800 border-gray-600 text-gray-400"
                : "bg-gray-800 border-gray-600 text-gray-100 hover:border-blue-500 hover:bg-gray-700 cursor-pointer"
            }`}
          >
            {loadingIndex === index ? "..." : `+ ${suggestion}`}
          </button>
        ))}
      </div>
    </div>
  );
}
