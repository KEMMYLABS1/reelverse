
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Clapperboard,
  Clock3,
  Film,
  MapPin,
} from "lucide-react";

import { getProjects } from "@/lib/projects";
import type { Project, ScriptEpisode } from "@/types/project";
import { SceneManager } from "@/components/dashboard/scene-manager";
import { VideoProduction } from "@/components/dashboard/video-production";

interface EpisodePageProps {
  params: Promise<{
    projectId: string;
    episodeId: string;
  }>;
}

export default function EpisodePage({ params }: EpisodePageProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [episode, setEpisode] = useState<ScriptEpisode | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadEpisode() {
      const { projectId, episodeId } = await params;

      const savedProject = getProjects().find(
        (item) => item.id === projectId,
      );

      const savedEpisode = savedProject?.episodes?.find(
        (item) => item.id === episodeId,
      );

      if (isActive) {
        setProject(savedProject ?? null);
        setEpisode(savedEpisode ?? null);
        setIsLoaded(true);
      }
    }

    void loadEpisode();

    return () => {
      isActive = false;
    };
  }, [params]);

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-background p-8 text-muted">
        Loading episode...
      </main>
    );
  }

  if (!project || !episode) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <h1 className="text-2xl font-semibold">Episode not found</h1>
        <p className="mt-2 max-w-md text-sm text-muted">
          This episode may have been deleted or is unavailable in this browser.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-lg bg-gold px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
        >
          Return to dashboard
        </Link>
      </main>
    );
  }

  const statusLabels: Record<string, string> = {
    draft: "Draft",
    in_progress: "In Progress",
    review: "In Review",
    completed: "Completed",
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href={`/projects/${project.id}`}
          className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-gold"
        >
          <ArrowLeft size={16} />
          Back to {project.title}
        </Link>

        <section className="mt-8 rounded-2xl border border-border bg-surface p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-gold">
                <Clapperboard size={15} />
                Script Development
              </div>

              <p className="mt-5 text-sm text-muted">
                Episode {episode.episodeNumber}
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                {episode.title}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                {episode.summary || "No episode summary has been added yet."}
              </p>
            </div>

            <span className="w-fit rounded-full border border-border px-4 py-2 text-xs font-medium text-gold">
              {statusLabels[episode.status] ?? episode.status}
            </span>
          </div>

          <div className="mt-8 grid gap-4 border-t border-border pt-6 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-background p-3 text-gold">
                <Film size={18} />
              </div>
              <div>
                <p className="text-xs text-muted">Scenes</p>
                <p className="mt-1 text-sm font-medium">
                  {episode.scenes.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-background p-3 text-gold">
                <Clock3 size={18} />
              </div>
              <div>
                <p className="text-xs text-muted">Last updated</p>
                <p className="mt-1 text-sm font-medium">
                  {new Date(episode.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-background p-3 text-gold">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-xs text-muted">Production</p>
                <p className="mt-1 text-sm font-medium">{project.title}</p>
              </div>
            </div>
          </div>
        </section>
        <section className="mt-8 space-y-8">
          <VideoProduction
            project={project}
            episode={episode}
          />

          <SceneManager
            project={project}
            episode={episode}
            onUpdated={(updatedProject) => {
              setProject(updatedProject);

              const updatedEpisode = updatedProject.episodes?.find(
                (item) => item.id === episode.id,
              );

              if (updatedEpisode) {
                setEpisode(updatedEpisode);
              }
            }}
          />
        </section>
      </div>
    </main>
  );
}
