"use client";

import { useState, useEffect } from "react";
import type { ChannelProfile } from "@/db/schema";

const emptyForm = {
  name: "",
  is_personal_brand: true,
  description: "",
};

export default function ProfilesPage() {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [profiles, setProfiles] = useState<ChannelProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/db/profiles");
      if (res.ok) {
        const data = await res.json();
        setProfiles(data);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) return;
    setIsSaving(true);
    try {
      const url = editingId
        ? `/api/db/profiles/${editingId}`
        : "/api/db/profiles";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm(emptyForm);
        setEditingId(null);
        await fetchProfiles();
      }
    } finally {
      setIsSaving(false);
    }
  }

  function handleEdit(profile: ChannelProfile) {
    setForm({
      name: profile.name,
      is_personal_brand: profile.isPersonalBrand,
      description: profile.description,
    });
    setEditingId(profile.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/db/profiles/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProfiles((prev) => prev.filter((p) => p.id !== id));
        if (editingId === id) {
          setForm(emptyForm);
          setEditingId(null);
        }
      }
    } catch {
      // silently fail
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-1">Профиль канала</h1>
      <p className="text-gray-500 text-sm mb-8">
        Профиль используется при генерации сценариев
      </p>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 mb-8"
      >
        <h2 className="text-base font-semibold text-white mb-5">
          {editingId ? "Редактировать профиль" : "Новый профиль"}
        </h2>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1.5">Название</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Имя автора или название бренда"
            required
            className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 text-sm"
          />
        </div>

        {/* Toggle */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Тип</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, is_personal_brand: true }))}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                form.is_personal_brand
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-[#0f0f0f] border-[#2a2a2a] text-gray-400 hover:text-white"
              }`}
            >
              Личный бренд
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, is_personal_brand: false }))}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                !form.is_personal_brand
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-[#0f0f0f] border-[#2a2a2a] text-gray-400 hover:text-white"
              }`}
            >
              Бренд канала
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-1.5">
            {form.is_personal_brand
              ? "Автор представляется по имени"
              : "Упоминается название канала"}
          </p>
        </div>

        {/* Description */}
        <div className="mb-5">
          <label className="block text-sm text-gray-400 mb-1.5">Описание</label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Чем занимается автор и о чём канал"
            required
            rows={4}
            className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 text-sm resize-none"
          />
        </div>

        <div className="flex gap-3">
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-5 py-2.5 bg-[#2a2a2a] text-gray-300 rounded-xl text-sm hover:bg-[#333] transition-colors"
            >
              Отмена
            </button>
          )}
          <button
            type="submit"
            disabled={isSaving || !form.name.trim() || !form.description.trim()}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </form>

      {/* Profiles list */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4">
          Профили {profiles.length > 0 && `(${profiles.length})`}
        </h2>

        {isLoading ? (
          <p className="text-gray-600 text-sm">Загрузка...</p>
        ) : profiles.length === 0 ? (
          <p className="text-gray-600 text-sm">Профилей пока нет</p>
        ) : (
          <div className="space-y-3">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <p className="text-white font-medium">{profile.name}</p>
                    <span className="text-xs text-gray-600 mt-0.5 inline-block">
                      {profile.isPersonalBrand ? "Личный бренд" : "Бренд канала"}
                    </span>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleEdit(profile)}
                      className="px-3 py-1.5 text-xs text-gray-400 bg-[#2a2a2a] rounded-lg hover:text-white hover:bg-[#333] transition-colors"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDelete(profile.id)}
                      className="px-3 py-1.5 text-xs text-red-400 bg-red-600/10 rounded-lg hover:bg-red-600/20 transition-colors"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {profile.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
