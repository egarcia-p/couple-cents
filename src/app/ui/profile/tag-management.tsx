"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createTag, updateTag, deleteTag } from "@/app/lib/actions";
import { Button } from "@/app/ui/button";
import { TagBadge } from "@/app/ui/transactions/tag-badge";
import type { Tag } from "@/app/lib/definitions";
import type { State } from "@/app/lib/actions";

const DEFAULT_COLORS = [
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#14B8A6",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#6B7280",
  "#0EA5E9",
];

export default function TagManagement({
  userId,
  tags,
}: {
  userId: string;
  tags: Tag[];
}) {
  const t = useTranslations("Profile");
  const initialState: State = { message: "", errors: {} };
  const [createState, createDispatch] = useActionState(createTag, initialState);
  const [newColor, setNewColor] = useState(DEFAULT_COLORS[0]);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const startEditing = (tag: Tag) => {
    setEditingTagId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const cancelEditing = () => {
    setEditingTagId(null);
    setEditName("");
    setEditColor("");
  };

  const handleDelete = async (tagId: string) => {
    if (window.confirm(t("tags.deleteConfirmation"))) {
      await deleteTag(tagId);
    }
  };

  return (
    <div className="rounded-lg bg-gray-50 p-2">
      <div className="ml-4 m-4 flex flex-col gap-4">
        <h1 className="text-xl font-bold">{t("tags.title")}</h1>

        {/* Create new tag form */}
        <form action={createDispatch} className="flex flex-col gap-3">
          <input type="hidden" name="userId" value={userId} />
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="tag-name"
                className="text-sm font-medium text-gray-700"
              >
                {t("tags.nameLabel")}
              </label>
              <input
                id="tag-name"
                name="name"
                type="text"
                maxLength={40}
                placeholder={t("tags.namePlaceholder")}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                aria-describedby="tag-name-error"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="tag-color"
                className="text-sm font-medium text-gray-700"
              >
                {t("tags.colorLabel")}
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="tag-color"
                  name="color"
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value.toUpperCase())}
                  className="h-9 w-9 cursor-pointer rounded border border-gray-300 p-0.5"
                />
                <div className="flex gap-1">
                  {DEFAULT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewColor(color)}
                      className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
                        newColor === color
                          ? "border-gray-800 scale-110"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <Button type="submit">{t("tags.addButton")}</Button>
          </div>
          <div id="tag-name-error" aria-live="polite" aria-atomic="true">
            {createState.errors?.name &&
              createState.errors.name.map((error: string) => (
                <p className="text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
            {createState.errors?.color &&
              createState.errors.color.map((error: string) => (
                <p className="text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
            {createState.message &&
              !createState.errors?.name &&
              !createState.errors?.color && (
                <p className="text-sm text-red-500">{createState.message}</p>
              )}
          </div>
        </form>

        {/* Existing tags list */}
        {tags.length === 0 ? (
          <p className="text-sm text-gray-500">{t("tags.noTags")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-3 rounded-md border border-gray-200 bg-white px-3 py-2"
              >
                {editingTagId === tag.id ? (
                  <EditTagForm
                    tag={tag}
                    userId={userId}
                    editName={editName}
                    editColor={editColor}
                    onEditNameChange={setEditName}
                    onEditColorChange={setEditColor}
                    onCancel={cancelEditing}
                    t={t}
                  />
                ) : (
                  <>
                    <TagBadge name={tag.name} color={tag.color} size="md" />
                    <span className="text-xs text-gray-400">{tag.color}</span>
                    <div className="ml-auto flex gap-2">
                      <Button
                        type="button"
                        onClick={() => startEditing(tag)}
                        className="h-auto rounded bg-gray-100 px-2 py-1 text-gray-600 hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                          />
                        </svg>
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleDelete(tag.id)}
                        className="h-auto rounded bg-red-600 px-2 py-1 text-white hover:bg-red-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EditTagForm({
  tag,
  userId,
  editName,
  editColor,
  onEditNameChange,
  onEditColorChange,
  onCancel,
  t,
}: {
  tag: Tag;
  userId: string;
  editName: string;
  editColor: string;
  onEditNameChange: (name: string) => void;
  onEditColorChange: (color: string) => void;
  onCancel: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const updateTagWithId = updateTag.bind(null, tag.id);
  const initialState: State = { message: "", errors: {} };
  const [state, dispatch] = useActionState(updateTagWithId, initialState);

  return (
    <form action={dispatch} className="flex w-full items-center gap-3">
      <input type="hidden" name="userId" value={userId} />
      <input
        name="name"
        type="text"
        maxLength={40}
        value={editName}
        onChange={(e) => onEditNameChange(e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-1 text-sm"
      />
      <input
        name="color"
        type="color"
        value={editColor}
        onChange={(e) => onEditColorChange(e.target.value.toUpperCase())}
        className="h-8 w-8 cursor-pointer rounded border border-gray-300 p-0.5"
      />
      <TagBadge
        name={editName || tag.name}
        color={editColor || tag.color}
        size="md"
      />
      <div className="ml-auto flex gap-2">
        <Button type="submit">{t("tags.saveButton")}</Button>
        <Button
          type="button"
          onClick={onCancel}
          className="bg-gray-100 text-gray-600 hover:bg-gray-200"
        >
          {t("tags.cancelButton")}
        </Button>
      </div>
      {state.message && <p className="text-sm text-red-500">{state.message}</p>}
    </form>
  );
}
