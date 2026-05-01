"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { Outline, ChannelProfile, Script } from "@/db/schema";

function formatDate(iso: string | Date) {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ScriptsPage() {
  const [outlines, setOutlines] = useState<Outline[]>([]);
  const [profiles, setProfiles] = useState<ChannelProfile[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);

  const [selectedOutlineId, setSelectedOutlineId] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [callToAction, setCallToAction] = useState("");
  const [generating, setGenerating] = useState(false);

  const scriptsTopRef = useRef<HTMLDivElement>(null);

  const fetchScripts = useCallback(async () => {
    const res = await fetch("/api/db/scripts");
    if (res.ok) setScripts(await res.json());
  }, []);

  useEffect(() => {
    // Load outlines, profiles, scripts in parallel
    Promise.all([
      fetch("/api/db/outlines").then((r) => r.json()),
      fetch("/api/db/profiles").then((r) => r.json()),
      fetch("/api/db/scripts").then((r) => r.json()),
    ]).then(([outlineData, profileData, scriptData]) => {
      if (Array.isArray(outlineData)) setOutlines(outlineData);
      if (Array.isArray(profileData)) setProfiles(profileData);
      if (Array.isArray(scriptData)) setScripts(scriptData);
    }).catch(() => {});

    // Check localStorage for pre-selected outline
    const stored = localStorage.getItem("selectedOutlineId");
    if (stored) {
      setSelectedOutlineId(stored);
      localStorage.removeItem("selectedOutlineId");
    }
  }, []);

  const selectedOutline = outlines.find((o) => o.id === selectedOutlineId);

  async function handleGenerate() {
    if (!selectedOutlineId || !selectedProfileId || !callToAction.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outline_id: selectedOutlineId,
          channel_profile_id: selectedProfileId,
          call_to_action: callToAction.trim(),
        }),
      });

      if (res.ok) {
        await fetchScripts();
        // Scroll to scripts list
        setTimeout(() => {
          scriptsTopRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch {
      // silently fail
    } finally {
      setGenerating(false);
    }
  }

  async function handleDeleteScript(id: string) {
    const res = await fetch(`/api/db/scripts/${id}`, { method: "DELETE" });
    if (res.ok) setScripts((prev) => prev.filter((s) => s.id !== id));
  }

  const canGenerate =
    !!selectedOutlineId && !!selectedProfileId && !!callToAction.trim() && !generating;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-1">Сценарии</h1>
      <p className="text-gray-500 text-sm mb-8">
        Выберите фабулу и профиль канала — AI напишет готовый сценарий
      </p>

      {/* ── Outline selector ── */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Фабула
        </h2>

        <div className="mb-4">
          <select
            value={selectedOutlineId}
            onChange={(e) => setSelectedOutlineId(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white focus:outline-none focus:border-blue-600 text-sm"
          >
            <option value="">— Выберите фабулу —</option>
            {outlines.map((o) => (
              <option key={o.id} value={o.id}>
                {o.title}
              </option>
            ))}
          </select>
        </div>

        {selectedOutline && (
          <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-3 max-h-48 overflow-y-auto">
            <p className="text-gray-400 text-xs leading-relaxed whitespace-pre-wrap">
              {selectedOutline.content}
            </p>
          </div>
        )}

        {outlines.length === 0 && (
          <p className="text-gray-600 text-sm">
            Нет фабул.{" "}
            <Link href="/scriptwriter" className="text-blue-500 hover:text-blue-400">
              Создайте фабулу
            </Link>
          </p>
        )}
      </div>

      {/* ── Settings ── */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Настройки сценария
        </h2>

        {/* Profile selector */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1.5">Профиль канала</label>
          {profiles.length === 0 ? (
            <p className="text-gray-600 text-sm">
              Сначала{" "}
              <Link
                href="/scriptwriter/profiles"
                className="text-blue-500 hover:text-blue-400"
              >
                создайте профиль канала
              </Link>
            </p>
          ) : (
            <select
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white focus:outline-none focus:border-blue-600 text-sm"
            >
              <option value="">— Выберите профиль —</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.isPersonalBrand ? "личный бренд" : "бренд канала"})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Call to action */}
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">
            Куда ведём аудиторию
          </label>
          <textarea
            value={callToAction}
            onChange={(e) => setCallToAction(e.target.value)}
            placeholder="Например: подписаться на Telegram-канал, перейти на сайт..."
            rows={3}
            className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 text-sm resize-none"
          />
        </div>
      </div>

      {/* ── Generate button ── */}
      <button
        onClick={handleGenerate}
        disabled={!canGenerate}
        className="w-full py-4 rounded-xl font-semibold text-white transition-all mb-12 flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:opacity-50 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:from-gray-700 disabled:to-gray-700"
      >
        {generating && (
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {generating ? "Пишем сценарий..." : "Написать сценарий"}
      </button>

      {/* ── Scripts list ── */}
      <div ref={scriptsTopRef}>
        <h2 className="text-base font-semibold text-white mb-4">
          Готовые сценарии {scripts.length > 0 && `(${scripts.length})`}
        </h2>

        {scripts.length === 0 ? (
          <p className="text-gray-600 text-sm">Сценариев пока нет</p>
        ) : (
          <div className="space-y-6">
            {scripts.map((script) => (
              <ScriptCard
                key={script.id}
                script={script}
                onDelete={handleDeleteScript}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Script Card ─────────────────────────────────────────────────────────────

function ScriptCard({
  script,
  onDelete,
}: {
  script: Script;
  onDelete: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(script.content);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = script.content;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-white font-semibold">{script.title}</p>
          <p className="text-xs text-gray-600 mt-0.5">{formatDate(script.createdAt)}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="px-4 py-2 text-sm bg-[#2a2a2a] text-gray-300 rounded-xl hover:bg-[#333] transition-colors"
          >
            {copied ? "Скопировано!" : "Копировать текст"}
          </button>
          <button
            onClick={() => onDelete(script.id)}
            className="px-4 py-2 text-sm text-red-400 bg-red-600/10 rounded-xl hover:bg-red-600/20 transition-colors"
          >
            Удалить
          </button>
        </div>
      </div>

      <textarea
        readOnly
        value={script.content}
        rows={12}
        className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-gray-300 text-sm leading-relaxed resize-none focus:outline-none"
      />
    </div>
  );
}
