"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
  ColumnDef,
} from "@tanstack/react-table";
import { VideoResult } from "@/types/index";
import { useResearchStore } from "@/store/useResearchStore";
import { formatViewCount, formatDate } from "@/lib/utils";

interface ResultsTableProps {
  data: VideoResult[];
  title: string;
  showKeywordColumn: boolean;
  isLoading: boolean;
}

export default function ResultsTable({
  data,
  title,
  showKeywordColumn,
  isLoading,
}: ResultsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const finalList = useResearchStore((state) => state.finalList);
  const addToFinalList = useResearchStore((state) => state.addToFinalList);

  const columns = useMemo(() => {
    const baseColumns: ColumnDef<VideoResult>[] = [
      {
        id: "action",
        header: "",
        cell: ({ row }) => {
          const video = row.original;
          const isInFinalList = finalList.some((v) => v.id === video.id);

          return (
            <button
              onClick={() => addToFinalList(video)}
              disabled={isInFinalList}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isInFinalList
                  ? "bg-green-100 text-green-600 cursor-default"
                  : "bg-blue-100 text-blue-600 hover:bg-blue-200"
              }`}
            >
              {isInFinalList ? "✓" : "+"}
            </button>
          );
        },
      },
      {
        id: "thumbnail",
        header: "Превью",
        cell: ({ row }) => (
          <a
            href={row.original.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={row.original.thumbnailUrl}
              alt={row.original.title}
              className="w-20 h-[45px] object-cover rounded"
            />
          </a>
        ),
      },
      {
        accessorKey: "title",
        header: "Название",
        cell: ({ row }) => (
          <a
            href={row.original.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline line-clamp-2"
          >
            {row.original.title}
          </a>
        ),
      },
      {
        accessorKey: "channelTitle",
        header: "Канал",
        cell: ({ row }) => (
          <a
            href={row.original.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:underline"
          >
            {row.original.channelTitle}
          </a>
        ),
      },
      {
        accessorKey: "viewCount",
        header: "Просмотры",
        cell: ({ row }) => formatViewCount(row.original.viewCount),
        enableSorting: true,
      },
      {
        accessorKey: "publishedAt",
        header: "Дата",
        cell: ({ row }) => formatDate(row.original.publishedAt),
        enableSorting: true,
      },
    ];

    if (showKeywordColumn) {
      baseColumns.push({
        accessorKey: "keyword",
        header: "Запрос",
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">
            {row.original.keyword || "—"}
          </span>
        ),
      });
    }

    return baseColumns;
  }, [showKeywordColumn, finalList, addToFinalList]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="text-gray-500">Ничего не найдено</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-200">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-4 py-3 text-left text-sm font-medium text-gray-700 ${
                      header.column.getCanSort()
                        ? "cursor-pointer select-none hover:bg-gray-50"
                        : ""
                    }`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() === "asc" && " ↑"}
                      {header.column.getIsSorted() === "desc" && " ↓"}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
