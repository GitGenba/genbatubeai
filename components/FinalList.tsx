"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useResearchStore } from "@/store/useResearchStore";
import { formatViewCount, formatDate } from "@/lib/utils";

export default function FinalList() {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [listName, setListName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const { isSignedIn } = useAuth();
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
    const headers = ["Title", "Channel", "Views", "Date", "URL"];
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

  const handleSaveList = async () => {
    if (!listName.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/db/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: listName.trim(), videos: finalList }),
      });
      if (!res.ok) throw new Error("Save failed");
      setShowModal(false);
      setListName("");
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
    } catch {
      // silently fail
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-10 p-6 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl">
      <h2 className="text-xl font-semibold text-white mb-4">
        Final List ({finalList.length})
      </h2>

      <div className="space-y-3 mb-6">
        {finalList.map((video) => (
          <div
            key={video.id}
            className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl"
          >
            <a
              href={video.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0"
            >
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full sm:w-24 h-auto aspect-video object-cover rounded-lg"
              />
            </a>

            <div className="flex-1 min-w-0">
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 font-medium line-clamp-1 transition-colors"
              >
                {video.title}
              </a>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-1">
                <a
                  href={video.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-400 transition-colors"
                >
                  {video.channelTitle}
                </a>
                <span>•</span>
                <span>{formatViewCount(video.viewCount)} views</span>
              </div>
            </div>

            <button
              onClick={() => removeFromFinalList(video.id)}
              className="w-full sm:w-auto px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-all text-sm font-medium"
              aria-label="Remove from list"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleCopy}
          className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
        >
          {copied ? "Copied!" : "Copy List"}
        </button>
        <button
          onClick={handleExportCSV}
          className="flex-1 sm:flex-none px-6 py-3 bg-[#2a2a2a] text-gray-300 rounded-xl font-medium hover:bg-[#333] transition-all"
        >
          Export CSV
        </button>
        <button
          onClick={() => isSignedIn && setShowModal(true)}
          disabled={!isSignedIn}
          title={!isSignedIn ? "Войдите чтобы сохранить список" : undefined}
          className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-medium transition-all ${
            isSignedIn
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-[#2a2a2a] text-gray-600 cursor-not-allowed"
          }`}
        >
          Сохранить список
        </button>
      </div>

      {saveToast && (
        <div className="mt-3 text-sm text-emerald-400">
          Список сохранён
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-white font-semibold text-lg mb-4">
              Название списка
            </h3>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveList()}
              placeholder="Например: Конкуренты по нише"
              autoFocus
              className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-emerald-600 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowModal(false); setListName(""); }}
                className="flex-1 px-4 py-2.5 bg-[#2a2a2a] text-gray-300 rounded-xl hover:bg-[#333] transition-all"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveList}
                disabled={isSaving || !listName.trim()}
                className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Сохранение..." : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
