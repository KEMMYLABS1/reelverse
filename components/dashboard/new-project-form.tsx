
"use client";

import { useState, type FormEvent } from "react";
import { createProject } from "@/lib/projects";
import type { Project, ProjectType } from "@/types/project";
import { FolderPlus, LoaderCircle } from "lucide-react";

interface NewProjectFormProps {
  onCreated: (project: Project) => void;
  onCancel?: () => void;
}

export function NewProjectForm({
  onCreated,
  onCancel,
}: NewProjectFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ProjectType>("drama");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanTitle = title.trim();

    if (!cleanTitle) {
      setError("Please enter a project title.");
      return;
    }

    setIsSaving(true);

    try {
      const project = createProject({
        title: cleanTitle,
        description: description.trim(),
        type,
      });

      setTitle("");
      setDescription("");
      setType("drama");

      onCreated(project);
    } catch {
      setError("Unable to save your project. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-border bg-surface p-6"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
          <FolderPlus size={20} />
        </div>

        <div>
          <h2 className="font-semibold">Create a production</h2>
          <p className="text-xs text-muted">
            Start developing your next creative project.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="project-title" className="text-sm font-medium">
          Project title
        </label>

        <input
          id="project-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. The Untold Village"
          maxLength={100}
          required
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-gold"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="project-description"
          className="text-sm font-medium"
        >
          Description
        </label>

        <textarea
          id="project-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe the story or production you want to create..."
          rows={4}
          maxLength={1000}
          className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-gold"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="project-type" className="text-sm font-medium">
          Production category
        </label>

        <select
          id="project-type"
          value={type}
          onChange={(event) => setType(event.target.value as ProjectType)}
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
        >
          <option value="drama">Drama</option>
          <option value="documentary">Heritage & Documentary</option>
          <option value="cooking">Cooking</option>
          <option value="short_film">Short Film</option>
          <option value="other">Other</option>
        </select>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-5 py-3 text-sm text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-3 text-sm font-semibold text-background transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? (
            <>
              <LoaderCircle size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <FolderPlus size={16} />
              Create project
            </>
          )}
        </button>
      </div>
    </form>
  );
}
