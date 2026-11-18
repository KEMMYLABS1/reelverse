
"use client";

import { useState, type FormEvent } from "react";
import { Save, X } from "lucide-react";

import { updateProject } from "@/lib/projects";
import type { Project, ProjectStatus, ProjectType } from "@/types/project";

interface ProjectEditFormProps {
  project: Project;
  onSaved: (project: Project) => void;
  onCancel: () => void;
}

export function ProjectEditForm({
  project,
  onSaved,
  onCancel,
}: ProjectEditFormProps) {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [type, setType] = useState<ProjectType>(project.type);
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanTitle = title.trim();

    if (!cleanTitle) {
      setError("Please enter a project title.");
      return;
    }

    try {
      const updatedProject = updateProject(project.id, {
        title: cleanTitle,
        description,
        type,
        status,
      });

      if (!updatedProject) {
        setError("This project could not be found.");
        return;
      }

      onSaved(updatedProject);
    } catch {
      setError("Unable to save your changes. Please try again.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-border bg-surface p-6"
    >
      <div>
        <h2 className="text-lg font-semibold">Edit project details</h2>
        <p className="mt-1 text-sm text-muted">
          Update the information for this production.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="edit-project-title" className="text-sm font-medium">
          Project title
        </label>
        <input
          id="edit-project-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={100}
          required
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="edit-project-description"
          className="text-sm font-medium"
        >
          Description
        </label>
        <textarea
          id="edit-project-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          maxLength={1000}
          className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="edit-project-type" className="text-sm font-medium">
            Production category
          </label>
          <select
            id="edit-project-type"
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

        <div className="space-y-2">
          <label htmlFor="edit-project-status" className="text-sm font-medium">
            Project status
          </label>
          <select
            id="edit-project-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as ProjectStatus)}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
          >
            <option value="draft">Draft</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm text-muted hover:bg-surface-hover"
        >
          <X size={16} />
          Cancel
        </button>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-3 text-sm font-semibold text-background transition-colors hover:bg-gold-light"
        >
          <Save size={16} />
          Save changes
        </button>
      </div>
    </form>
  );
}
