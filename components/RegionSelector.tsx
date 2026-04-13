"use client";

import { useResearchStore } from "@/store/useResearchStore";
import { RegionOption } from "@/types/index";

const REGIONS: RegionOption[] = [
  { code: "", name: "Авто (по IP)" },
  { code: "RU", name: "Россия" },
  { code: "US", name: "США" },
  { code: "IN", name: "Индия" },
  { code: "BR", name: "Бразилия" },
  { code: "ID", name: "Индонезия" },
  { code: "MX", name: "Мексика" },
  { code: "JP", name: "Япония" },
  { code: "DE", name: "Германия" },
  { code: "GB", name: "Великобритания" },
  { code: "FR", name: "Франция" },
];

export default function RegionSelector() {
  const regionCode = useResearchStore((state) => state.regionCode);
  const setRegionCode = useResearchStore((state) => state.setRegionCode);

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="region" className="text-sm text-gray-400">
        Регион:
      </label>
      <select
        id="region"
        value={regionCode}
        onChange={(e) => setRegionCode(e.target.value)}
        className="px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {REGIONS.map((region) => (
          <option key={region.code} value={region.code}>
            {region.name}
          </option>
        ))}
      </select>
    </div>
  );
}
