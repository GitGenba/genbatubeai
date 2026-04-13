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
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                isInFinalList
                  ? "bg-green-600/20 text-green-400 cursor-default"
                  : "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
              }`}
            >
              {isInFinalList ? "✓" : "+"}
            </button>
          );
        },
      },
      {
        id: "thumbnail",
        header: "Preview",
        cell: ({ row }) => (
          <a
            href={row.original.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <img
              src={row.original.thumbnailUrl}
              alt={row.original.title}
              className="w-24 sm:w-28 h-auto aspect-video object-cover rounded-lg hover:opacity-80 transition-opacity"
            />
          </a>
        ),
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <a
            href={row.original.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 line-clamp-2 transition-colors"
          >
            {row.original.title}
          </a>
        ),
      },
      {
        accessorKey: "channelTitle",
        header: "Channel",
        cell: ({ row }) => (
          <a
            href={row.original.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            {row.original.channelTitle}
          </a>
        ),
      },
      {
        accessorKey: "viewCount",
        header: "Views",
        cell: ({ row }) => (
          <span className="text-gray-300 whitespace-nowrap">
            {formatViewCount(row.original.viewCount)}
          </span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "publishedAt",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-gray-400 whitespace-nowrap">
            {formatDate(row.original.publishedAt)}
          </span>
        ),
        enableSorting: true,
      },
    ];

    if (showKeywordColumn) {
      baseColumns.push({
        accessorKey: "keyword",
        header: "Keyword",
        cell: ({ row }) => (
          <span className="text-sm text-gray-500 bg-[#2a2a2a] px-2 py-1 rounded">
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
        <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-[#1a1a1a] rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
        <p className="text-gray-500">No results found</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
      
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto rounded-xl border border-[#2a2a2a]">
        <table className="w-full">
          <thead className="bg-[#1a1a1a]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-4 py-3 text-left text-sm font-medium text-gray-400 ${
                      header.column.getCanSort()
                        ? "cursor-pointer select-none hover:text-white transition-colors"
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
                className="border-t border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors"
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

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {data.map((video) => {
          const isInFinalList = finalList.some((v) => v.id === video.id);
          return (
            <div
              key={video.id}
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4"
            >
              <div className="flex gap-4">
                <a
                  href={video.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0"
                >
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-32 h-auto aspect-video object-cover rounded-lg"
                  />
                </a>
                <div className="flex-1 min-w-0">
                  <a
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 font-medium line-clamp-2 text-sm"
                  >
                    {video.title}
                  </a>
                  <a
                    href={video.channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 text-sm mt-1 block hover:text-gray-400"
                  >
                    {video.channelTitle}
                  </a>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>{formatViewCount(video.viewCount)} views</span>
                    <span>{formatDate(video.publishedAt)}</span>
                  </div>
                  {showKeywordColumn && video.keyword && (
                    <span className="inline-block mt-2 text-xs text-gray-500 bg-[#2a2a2a] px-2 py-1 rounded">
                      {video.keyword}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => addToFinalList(video)}
                  disabled={isInFinalList}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isInFinalList
                      ? "bg-green-600/20 text-green-400 cursor-default"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isInFinalList ? "Added ✓" : "Add to List"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
