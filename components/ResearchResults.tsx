"use client";

import { useResearchStore } from "@/store/useResearchStore";
import ResultsTable from "@/components/ResultsTable";

export default function ResearchResults() {
  const table1 = useResearchStore((state) => state.table1);
  const table2 = useResearchStore((state) => state.table2);
  const isLoading = useResearchStore((state) => state.isLoading);
  const isLoadingTable2 = useResearchStore((state) => state.isLoadingTable2);

  if (table1.length === 0 && !isLoading) {
    return null;
  }

  return (
    <>
      <ResultsTable
        data={table1}
        title="Таблица 1 — результаты поиска"
        showKeywordColumn={true}
        isLoading={isLoading}
      />

      {(table1.length > 0 || isLoading) && (
        <ResultsTable
          data={table2}
          title="Таблица 2 — топ роликов каналов"
          showKeywordColumn={false}
          isLoading={isLoadingTable2 || isLoading}
        />
      )}
    </>
  );
}
