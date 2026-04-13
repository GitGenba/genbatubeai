"use client";

import { useResearchStore } from "@/store/useResearchStore";
import { RegionOption } from "@/types/index";

const REGIONS: RegionOption[] = [
  { code: "", name: "Auto (by IP)" },
  { code: "RU", name: "Russia" },
  { code: "US", name: "United States" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "ID", name: "Indonesia" },
  { code: "MX", name: "Mexico" },
  { code: "JP", name: "Japan" },
  { code: "DE", name: "Germany" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
];

export default function RegionSelector() {
  const regionCode = useResearchStore((state) => state.regionCode);
  const setRegionCode = useResearchStore((state) => state.setRegionCode);

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="region" className="text-sm text-gray-400">
        Region:
      </label>
      <select
        id="region"
        value={regionCode}
        onChange={(e) => setRegionCode(e.target.value)}
        className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
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
