"use client";

import { useState } from "react";
import { useResearchStore } from "@/store/useResearchStore";
import { formatViewCount, formatDate } from "@/lib/utils";

export default function FinalList() {
  const [copied, setCopied] = useState(false);

  const finalList = useResearchStore((state) => state.finalList);
  const removeFromFinalList = useResearchStore(
    (state) => state.removeFromFinalList
  );

  if (finalList.length === 0) {
    return null;
  }

  const handleCopy = async () => {
    const text = finalList
      .map((video, index) => `${index + 1}. ${video.title} — ${video.videoUrl}`)
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Название", "Канал", "Просмотры", "Дата", "Ссылка"];
    const rows = finalList.map((video) => [
      `"${video.title.replace(/"/g, '""')}"`,
      `"${video.channelTitle.replace(/"/g, '""')}"`,
      video.viewCount.toString(),
      formatDate(video.publishedAt),
      video.videoUrl,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
      "\n"
    );

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    link.href = url;
    link.download = `research_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-8 p-6 bg-gray-50 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">
        Финальный список ({finalList.length})
      </h2>

      <div className="space-y-3 mb-6">
        {finalList.map((video) => (
          <div
            key={video.id}
            className="flex items-center gap-4 p-3 bg-white rounded-lg shadow-sm"
          >
            <a
              href={video.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-[60px] h-[34px] object-cover rounded"
              />
            </a>

            <div className="flex-1 min-w-0">
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium line-clamp-1"
              >
                {video.title}
              </a>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <a
                  href={video.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {video.channelTitle}
                </a>
                <span>•</span>
                <span>{formatViewCount(video.viewCount)} просмотров</span>
              </div>
            </div>

            <button
              onClick={() => removeFromFinalList(video.id)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
              aria-label="Удалить из списка"
            >
              −
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {copied ? "Скопировано!" : "Скопировать список"}
        </button>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Экспорт CSV
        </button>
      </div>
    </div>
  );
}
