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
      return "Введите запрос";
    }
    if (trimmed.length > 50) {
      return "Максимум 50 символов";
    }
    const wordCount = trimmed.split(/\s+/).length;
    if (wordCount > 5) {
      return "Максимум 5 слов";
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
      setError("Такой запрос уже добавлен");
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
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Введите ключевой запрос..."
          disabled={isDisabled || isLoading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSubmit}
          disabled={isDisabled || isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "..." : "Добавить"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {isDisabled && (
        <p className="mt-2 text-sm text-gray-500">
          Достигнут лимит в 5 запросов
        </p>
      )}
    </div>
  );
}
