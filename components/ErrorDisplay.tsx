"use client";

import { useResearchStore } from "@/store/useResearchStore";

export default function ErrorDisplay() {
  const error = useResearchStore((state) => state.error);
  const setError = useResearchStore((state) => state.setError);

  if (!error) {
    return null;
  }

  return (
    <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between">
      <p className="text-red-400">{error}</p>
      <button
        onClick={() => setError(null)}
        className="text-red-400 hover:text-red-300 text-xl leading-none ml-4 transition-colors"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}
