"use client";

import { useState } from "react";
import { TagBadge } from "./tag-badge";
import type { Tag } from "@/app/lib/definitions";
import { useTranslations } from "next-intl";

interface TagSelectorProps {
  availableTags: Tag[];
  selectedTagIds: string[];
  label: string;
  placeholder: string;
}

export function TagSelector({
  availableTags,
  selectedTagIds: initialSelectedIds,
  label,
  placeholder,
}: TagSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [isOpen, setIsOpen] = useState(false);

  const translations = useTranslations("TransactionsPage");

  const selectedTags = availableTags.filter((tag) =>
    selectedIds.includes(tag.id),
  );
  const unselectedTags = availableTags.filter(
    (tag) => !selectedIds.includes(tag.id),
  );

  const toggleTag = (tagId: string) => {
    setSelectedIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const removeTag = (tagId: string) => {
    setSelectedIds((prev) => prev.filter((id) => id !== tagId));
  };

  if (availableTags.length === 0) return null;

  return (
    <div className="mb-4">
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <div className="relative">
        {/* Hidden inputs for form submission */}
        {selectedIds.map((id) => (
          <input key={id} type="hidden" name="tags" value={id} />
        ))}

        {/* Selected tags display + dropdown trigger */}
        <div
          className="flex min-h-[42px] cursor-pointer flex-wrap items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedTags.length > 0 ? (
            selectedTags.map((tag) => (
              <TagBadge
                key={tag.id}
                name={tag.name}
                color={tag.color}
                onRemove={() => removeTag(tag.id)}
              />
            ))
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
          <svg
            className={`ml-auto h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
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

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
            {unselectedTags.length === 0 &&
            selectedTags.length === availableTags.length ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                {translations("create.allTagsSelected")}
              </div>
            ) : (
              unselectedTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                >
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </button>
              ))
            )}
            {selectedTags.length > 0 && (
              <>
                <div className="border-t border-gray-100" />
                {selectedTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    <svg
                      className="h-3 w-3 text-primary-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
