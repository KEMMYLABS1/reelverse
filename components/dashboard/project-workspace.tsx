
"use client";

import { useEffect, useState } from "react";
import {
  FolderPlus,
  Trash2,
  Clapperboard,
  Clock3,
} from "lucide-react";

import { NewProjectForm } from "./new-project-form";
import { deleteProject, getProjects } from "@/lib/projects";
import type { Project, ProjectType } from "@/types/project";

const projectTypeLabels: Record<ProjectType, string> = {
  drama: "Drama",
  documentary: "Heritage & Documentary",
  cooking: "Cooking",
  short_film: "Short Film",
  other: "Other",
};

export function ProjectWorkspace() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
  const frame = window.requestAnimationFrame(() => {
    setProjects(getProjects());
    setIsLoaded(true);
  });

  return () => {
    window.cancelAnimationFrame(frame);
  };
}, []);

  function handleProjectCreated(project: Project) {
    setProjects((currentProjects) => [project, ...currentProjects]);
    setShowForm(false);
  }

  function handleProjectDelete(projectId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project? This action cannot be undone.",
    );

    if (!confirmed) return;

    deleteProject(projectId);

    setProjects((currentProjects) =>
      currentProjects.filter((project) => project.id !== projectId),
    );
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("en", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  }

  return (
    <section id="projects">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
            Your workspace
          </p>

          <h2 className="mt-2 text-xl font-semibold sm:text-2xl">
            Recent projects
          </h2>

          <p className="mt-2 text-sm text-muted">
            {projects.length} {projects.length === 1 ? "production" : "productions"} in your workspace
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-gold px-4 py-3 text-sm font-semibold text-background transition-colors hover:bg-gold-light"
          >
            <FolderPlus size={17} />
            New Production
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-8">
          <NewProjectForm
            onCreated={handleProjectCreated}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {!isLoaded ? (
        <div className="rounded-xl border border-border bg-surface p-10 text-center">
          <p className="text-sm text-muted">Loading your projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-surface/50 px-6 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-gold">
            <FolderPlus size={25} strokeWidth={1.6} />
          </div>

          <h3 className="mt-5 font-semibold">
            Your next production starts here
          </h3>

          <p className="mt-2 max-w-md text-sm leading-6 text-muted">
            Create your first project and start developing your story,
            documentary, cooking production or short film.
          </p>

          {!showForm && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-gold/40 px-5 py-3 text-sm font-medium text-gold transition-colors hover:bg-gold/10"
            >
              <FolderPlus size={16} />
              Create your first project
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.id}
              className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-gold/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                  <Clapperboard size={20} />
                </div>

                <button
                  type="button"
                  onClick={() => handleProjectDelete(project.id)}
                  aria-label={`Delete ${project.title}`}
                  title="Delete project"
                  className="rounded-lg p-2 text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="mt-5">
                <p className="text-xs font-medium text-gold">
                  {projectTypeLabels[project.type]}
                </p>

                <h3 className="mt-2 truncate font-semibold">
                  {project.title}
                </h3>

                <p className="mt-2 min-h-12 text-sm leading-6 text-muted">
                  {project.description || "No project description provided."}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <span className="rounded-full border border-border px-3 py-1 text-xs capitalize text-muted">
                  {project.status.replace("_", " ")}
                </span>

                <span className="flex items-center gap-1.5 text-xs text-muted">
                  <Clock3 size={13} />
                  {formatDate(project.createdAt)}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
