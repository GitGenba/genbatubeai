"use client";

import { useResearchStore } from "@/store/useResearchStore";

export default function KeywordChips() {
  const keywords = useResearchStore((state) => state.keywords);
  const removeKeyword = useResearchStore((state) => state.removeKeyword);

  if (keywords.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {keywords.map((keyword) => (
        <div
          key={keyword}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm"
        >
          <span>{keyword}</span>
          <button
            onClick={() => removeKeyword(keyword)}
            className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-blue-200 transition-colors"
            aria-label={`Удалить ${keyword}`}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
