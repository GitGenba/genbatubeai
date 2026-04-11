"use client";

import { useResearchStore } from "@/store/useResearchStore";

export default function ErrorDisplay() {
  const error = useResearchStore((state) => state.error);
  const setError = useResearchStore((state) => state.setError);

  if (!error) {
    return null;
  }

  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
      <p className="text-red-700">{error}</p>
      <button
        onClick={() => setError(null)}
        className="text-red-500 hover:text-red-700 text-xl leading-none"
        aria-label="Закрыть"
      >
        ×
      </button>
    </div>
  );
}
