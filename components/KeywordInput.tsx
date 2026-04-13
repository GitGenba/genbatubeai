"use client";

import { useState } from "react";
import { useResearchStore } from "@/store/useResearchStore";

export default function KeywordInput() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const keywords = useResearchStore((state) => state.keywords);
  const addKeyword = useResearchStore((state) => state.addKeyword);
  const setSuggestions = useResearchStore((state) => state.setSuggestions);

  const isDisabled = keywords.length >= 5;

  const validate = (input: string): string | null => {
    const trimmed = input.trim();
    if (trimmed.length === 0) {
      return "Enter a keyword";
    }
    if (trimmed.length > 50) {
      return "Maximum 50 characters";
    }
    const wordCount = trimmed.split(/\s+/).length;
    if (wordCount > 5) {
      return "Maximum 5 words";
    }
    return null;
  };

  const handleSubmit = async () => {
    const trimmed = value.trim();
    const validationError = validate(trimmed);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (keywords.includes(trimmed)) {
      setError("This keyword is already added");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      addKeyword(trimmed);

      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: trimmed,
          existingKeywords: [...keywords, trimmed],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch {
      // Silently fail - suggestions are optional
    } finally {
      setIsLoading(false);
      setValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Enter a keyword..."
          disabled={isDisabled || isLoading}
          className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        />
        <button
          onClick={handleSubmit}
          disabled={isDisabled || isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-all sm:w-auto w-full"
        >
          {isLoading ? "..." : "Add"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      {isDisabled && (
        <p className="mt-2 text-sm text-gray-500">
          Maximum 5 keywords reached
        </p>
      )}
    </div>
  );
}
