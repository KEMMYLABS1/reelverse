
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Clapperboard,
  Clock3,
  Pencil,
} from "lucide-react";

import { getProjects } from "@/lib/projects";
import type { Project } from "@/types/project";
import { ProjectEditForm } from "@/components/dashboard/project-edit-form";
import { StoryBriefEditor } from "@/components/dashboard/story-brief-editor";
import { EpisodeManager } from "@/components/dashboard/episode-manager";

interface ProjectPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadProject() {
      const { projectId } = await params;

      const savedProject = getProjects().find(
        (item) => item.id === projectId,
      );

      if (isActive) {
        setProject(savedProject ?? null);
        setIsLoaded(true);
      }
    }

    void loadProject();

    return () => {
      isActive = false;
    };
  }, [params]);

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-background p-8 text-muted">
        Loading project...
      </main>
    );
  }

  if (!project) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <h1 className="text-2xl font-semibold">Project not found</h1>

        <p className="mt-2 text-sm text-muted">
          This project may have been deleted or is unavailable in this browser.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 text-sm text-gold hover:text-gold-light"
        >
          <ArrowLeft size={16} />
          Return to dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-gold"
        >
          <ArrowLeft size={16} />
          Back to projects
        </Link>

        {isEditing ? (
          <div className="mt-8">
            <ProjectEditForm
              project={project}
              onSaved={(updatedProject) => {
                setProject(updatedProject);
                setIsEditing(false);
              }}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        ) : (
          <>
            <section className="mt-8 rounded-2xl border border-border bg-surface p-8">
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
                <div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gold/10 text-gold">
                    <Clapperboard size={26} />
                  </div>

                  <p className="mt-6 text-xs font-medium uppercase tracking-widest text-gold">
                    {project.type.replace("_", " ")}
                  </p>

                  <h1 className="mt-3 text-3xl font-semibold">
                    {project.title}
                  </h1>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
                    {project.description || "No project description provided."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex w-fit items-center gap-2 rounded-lg border border-gold/40 px-4 py-3 text-sm font-medium text-gold transition-colors hover:bg-gold/10"
                >
                  <Pencil size={16} />
                  Edit project
                </button>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-5 border-t border-border pt-6">
                <span className="rounded-full border border-border px-3 py-1 text-xs capitalize text-muted">
                  {project.status.replace("_", " ")}
                </span>

                <span className="flex items-center gap-2 text-xs text-muted">
                  <Clock3 size={14} />
                  Created{" "}
                  {new Intl.DateTimeFormat("en", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(project.createdAt))}
                </span>
              </div>
            </section>

            <section className="mt-10 space-y-6">
                <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-gold">
                    Production workspace
                    </p>

                    <h2 className="mt-2 text-xl font-semibold">
                    Develop your production
                    </h2>

                    <p className="mt-2 text-sm text-muted">
                    Build your creative foundation before moving into scripts,
                    characters and scenes.
                    </p>
                </div>

                <StoryBriefEditor
                    key={project.id}
                    project={project}
                    onSaved={(updatedProject) => setProject(updatedProject)}
                />
                </section>

                <section className="mt-8">
                    <EpisodeManager
                        project={project}
                        onUpdated={setProject}
                    />
                    </section>
          </>
        )}
      </div>
    </main>
  );
}
