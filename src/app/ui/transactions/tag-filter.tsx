"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { TagBadge } from "./tag-badge";
import type { Tag } from "@/app/lib/definitions";

interface TagFilterProps {
  availableTags: Tag[];
  placeholder: string;
  clearLabel: string;
}

export function TagFilter({
  availableTags,
  placeholder,
  clearLabel,
}: TagFilterProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const currentTagIds =
    searchParams.get("tagIds")?.split(",").filter(Boolean) || [];
  const [isOpen, setIsOpen] = useState(false);

  const selectedTags = availableTags.filter((tag) =>
    currentTagIds.includes(tag.id),
  );

  const updateTagFilter = (tagIds: string[]) => {
    const params = new URLSearchParams(searchParams);
    if (tagIds.length > 0) {
      params.set("tagIds", tagIds.join(","));
    } else {
      params.delete("tagIds");
    }
    params.set("page", "1");
    replace(`${pathname}?${params.toString()}`);
  };

  const toggleTag = (tagId: string) => {
    const newIds = currentTagIds.includes(tagId)
      ? currentTagIds.filter((id) => id !== tagId)
      : [...currentTagIds, tagId];
    updateTagFilter(newIds);
  };

  const clearFilter = () => {
    updateTagFilter([]);
    setIsOpen(false);
  };

  if (availableTags.length === 0) return null;

  return (
    <div className="relative">
      <div
        className="flex min-h-[38px] cursor-pointer items-center gap-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1 text-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedTags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {selectedTags.map((tag) => (
              <TagBadge key={tag.id} name={tag.name} color={tag.color} />
            ))}
          </div>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
        )}
        <svg
          className={`ml-auto h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-48 w-full min-w-[200px] overflow-auto rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
          {availableTags.map((tag) => {
            const isSelected = currentTagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${isSelected ? "bg-gray-50 dark:bg-gray-800" : ""}`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded border ${isSelected ? "border-primary-600 bg-primary-600" : "border-gray-300 dark:border-gray-600"}`}
                >
                  {isSelected && (
                    <svg
                      className="h-3 w-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </span>
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
              </button>
            );
          })}
          {currentTagIds.length > 0 && (
            <>
              <div className="border-t border-gray-100 dark:border-gray-800" />
              <button
                type="button"
                onClick={clearFilter}
                className="flex w-full items-center justify-center px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {clearLabel}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
