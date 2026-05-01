"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Outline, SavedList } from "@/db/schema";
import type { VideoResult } from "@/types/index";

type Tab = "manual" | "video" | "topic";
type VideoState = "idle" | "loading" | "no-subtitles";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string | Date) {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OutlinesPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("manual");

  // Outlines list (right column)
  const [outlines, setOutlines] = useState<Outline[]>([]);
  const [outlinesLoading, setOutlinesLoading] = useState(true);

  const fetchOutlines = useCallback(async () => {
    try {
      const res = await fetch("/api/db/outlines");
      if (res.ok) setOutlines(await res.json());
    } finally {
      setOutlinesLoading(false);
    }
  }, []);

  useEffect(() => { fetchOutlines(); }, [fetchOutlines]);

  async function saveOutline(payload: {
    title: string;
    content: string;
    source_type: "manual" | "video" | "topic";
    source_video_id?: string;
  }): Promise<boolean> {
    const res = await fetch("/api/db/outlines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) { await fetchOutlines(); return true; }
    return false;
  }

  async function deleteOutline(id: string) {
    const res = await fetch(`/api/db/outlines/${id}`, { method: "DELETE" });
    if (res.ok) setOutlines((prev) => prev.filter((o) => o.id !== id));
  }

  function goToScripts(outlineId: string) {
    localStorage.setItem("selectedOutlineId", outlineId);
    router.push("/scriptwriter/scripts");
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "manual", label: "Вручную" },
    { id: "video", label: "Из видео" },
    { id: "topic", label: "По теме" },
  ];

  return (
    <div className="flex gap-8 min-h-full">
      {/* LEFT — create */}
      <div className="w-full max-w-xl shrink-0">
        <h1 className="text-2xl font-bold text-white mb-1">Фабулы</h1>
        <p className="text-gray-500 text-sm mb-6">Создайте структуру для вашего ролика</p>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#141414] rounded-xl p-1 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                tab === t.id
                  ? "bg-[#1e1e1e] text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "manual" && <ManualTab onSave={saveOutline} />}
        {tab === "video" && <VideoTab onSave={saveOutline} />}
        {tab === "topic" && <TopicTab onSave={saveOutline} />}
      </div>

      {/* RIGHT — list */}
      <div className="flex-1 min-w-0">
        <h2 className="text-base font-semibold text-white mb-4">
          Сохранённые фабулы {outlines.length > 0 && `(${outlines.length})`}
        </h2>
        {outlinesLoading ? (
          <p className="text-gray-600 text-sm">Загрузка...</p>
        ) : outlines.length === 0 ? (
          <p className="text-gray-600 text-sm">Фабул пока нет</p>
        ) : (
          <div className="space-y-3">
            {outlines.map((o) => (
              <div key={o.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm truncate">{o.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{formatDate(o.createdAt)}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => goToScripts(o.id)}
                      className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      Написать сценарий
                    </button>
                    <button
                      onClick={() => deleteOutline(o.id)}
                      className="px-3 py-1.5 text-xs text-red-400 bg-red-600/10 rounded-lg hover:bg-red-600/20 transition-colors"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
                  {o.content.slice(0, 100)}{o.content.length > 100 ? "..." : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Manual ─────────────────────────────────────────────────────────────

function ManualTab({ onSave }: { onSave: SaveFn }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    const ok = await onSave({ title: title.trim(), content: content.trim(), source_type: "manual" });
    if (ok) { setTitle(""); setContent(""); }
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Название фабулы</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Тема или рабочее название"
          className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Текст фабулы</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Опишите структуру вашего ролика..."
          rows={10}
          className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 text-sm resize-none"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={saving || !title.trim() || !content.trim()}
        className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "Сохранение..." : "Сохранить фабулу"}
      </button>
    </div>
  );
}

// ─── Tab: From Video ─────────────────────────────────────────────────────────

type SaveFn = (p: {
  title: string;
  content: string;
  source_type: "manual" | "video" | "topic";
  source_video_id?: string;
}) => Promise<boolean>;

function VideoTab({ onSave }: { onSave: SaveFn }) {
  const [lists, setLists] = useState<SavedList[]>([]);
  const [selectedListId, setSelectedListId] = useState("");
  const [videoStates, setVideoStates] = useState<Record<string, VideoState>>({});
  const [generatedContent, setGeneratedContent] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<VideoResult | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/db/lists")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setLists(data); })
      .catch(() => {});
  }, []);

  const selectedList = lists.find((l) => l.id === selectedListId);
  const videos = (selectedList?.videos ?? []) as VideoResult[];

  async function handleSelectVideo(video: VideoResult) {
    const state = videoStates[video.id];
    if (state === "loading" || state === "no-subtitles") return;

    setVideoStates((s) => ({ ...s, [video.id]: "loading" }));
    setSelectedVideo(video);
    setGeneratedContent("");

    try {
      const res = await fetch("/api/ai/outline-from-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: video.id }),
      });

      if (res.status === 404) {
        setVideoStates((s) => ({ ...s, [video.id]: "no-subtitles" }));
        setSelectedVideo(null);
        return;
      }

      const data = await res.json();
      setGeneratedContent(data.outline ?? "");
      setVideoStates((s) => ({ ...s, [video.id]: "idle" }));
    } catch {
      setVideoStates((s) => ({ ...s, [video.id]: "idle" }));
    }
  }

  async function handleSave() {
    if (!selectedVideo || !generatedContent.trim()) return;
    setSaving(true);
    const ok = await onSave({
      title: selectedVideo.title,
      content: generatedContent.trim(),
      source_type: "video",
      source_video_id: selectedVideo.id,
    });
    if (ok) {
      setGeneratedContent("");
      setSelectedVideo(null);
    }
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      {/* List selector */}
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Список роликов</label>
        <select
          value={selectedListId}
          onChange={(e) => { setSelectedListId(e.target.value); setSelectedVideo(null); setGeneratedContent(""); }}
          className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white focus:outline-none focus:border-blue-600 text-sm"
        >
          <option value="">— Выберите список —</option>
          {lists.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>

      {/* Videos in selected list */}
      {selectedList && videos.length > 0 && (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {videos.map((video) => {
            const state = videoStates[video.id] ?? "idle";
            return (
              <div key={video.id} className="flex items-center gap-3 p-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-20 h-auto aspect-video object-cover rounded-lg shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs line-clamp-2 leading-snug">{video.title}</p>
                  {state === "no-subtitles" && (
                    <p className="text-gray-600 text-xs mt-1">Нет субтитров</p>
                  )}
                </div>
                <button
                  onClick={() => handleSelectVideo(video)}
                  disabled={state === "loading" || state === "no-subtitles"}
                  className="shrink-0 px-3 py-1.5 text-xs bg-[#2a2a2a] text-gray-300 rounded-lg hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {state === "loading" ? "Создаём..." : "Выбрать"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Generated outline textarea */}
      {selectedVideo && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Фабула</label>
            <textarea
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              rows={8}
              className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white focus:outline-none focus:border-blue-600 text-sm resize-none"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !generatedContent.trim()}
            className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Сохранение..." : "Сохранить фабулу"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Tab: By Topic ────────────────────────────────────────────────────────────

function TopicTab({ onSave }: { onSave: SaveFn }) {
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleGenerate() {
    if (!topic.trim()) return;
    setGenerating(true);
    setContent("");
    try {
      const res = await fetch("/api/ai/outline-from-topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      const data = await res.json();
      if (data.outline) {
        setContent(data.outline);
        if (!title) setTitle(topic.trim());
      }
    } catch {
      // silently fail
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    const ok = await onSave({ title: title.trim(), content: content.trim(), source_type: "topic" });
    if (ok) { setTopic(""); setTitle(""); setContent(""); }
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Тема ролика</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder="Например: как монтировать видео в DaVinci"
            maxLength={200}
            className="flex-1 px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 text-sm"
          />
          <button
            onClick={handleGenerate}
            disabled={generating || !topic.trim()}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {generating ? "Генерируем..." : "Сгенерировать"}
          </button>
        </div>
      </div>

      {content && (
        <>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Фабула</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white focus:outline-none focus:border-blue-600 text-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Название фабулы</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Рабочее название"
              className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 text-sm"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim() || !content.trim()}
            className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Сохранение..." : "Сохранить фабулу"}
          </button>
        </>
      )}
    </div>
  );
}
