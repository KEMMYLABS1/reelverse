
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock3,
  Clapperboard,
  Plus,
  Trash2,
  ChevronRight,
} from "lucide-react";

import {
  createEpisode,
  deleteEpisode,
} from "@/lib/projects";

import type {
  Project,
  ScriptEpisode,
} from "@/types/project";

interface EpisodeManagerProps {
  project: Project;
  onUpdated: (project: Project) => void;
}

export function EpisodeManager({
  project,
  onUpdated,
}: EpisodeManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const episodes = project.episodes ?? [];

  function handleCreateEpisode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter an episode title.");
      return;
    }

    setIsSaving(true);

    try {
      const episode = createEpisode(
        project.id,
        title,
        summary,
      );

      if (!episode) {
        setError("Unable to create this episode. Please try again.");
        return;
      }

      const updatedProject: Project = {
        ...project,
        episodes: [...episodes, episode],
        updatedAt: new Date().toISOString(),
      };

      onUpdated(updatedProject);
      setTitle("");
      setSummary("");
      setIsCreating(false);
    } catch {
      setError("Something went wrong while creating the episode.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleDeleteEpisode(episode: ScriptEpisode) {
    const confirmed = window.confirm(
      `Delete "${episode.title}"? This will also delete all its scenes.`,
    );

    if (!confirmed) return;

    const deleted = deleteEpisode(project.id, episode.id);

    if (!deleted) {
      setError("Unable to delete this episode.");
      return;
    }

    const updatedProject: Project = {
      ...project,
      episodes: episodes
        .filter((item) => item.id !== episode.id)
        .map((item, index) => ({
          ...item,
          episodeNumber: index + 1,
        })),
      updatedAt: new Date().toISOString(),
    };

    onUpdated(updatedProject);
  }

  return (
    <section className="space-y-6 rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-gold">
            <BookOpen size={18} />
            <p className="text-xs font-medium uppercase tracking-widest">
              Script development
            </p>
          </div>

          <h2 className="mt-2 text-xl font-semibold">
            Episode Manager
          </h2>

          <p className="mt-2 text-sm text-muted">
            Organise your production into episodes and develop each
            episode scene by scene.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating((current) => !current)}
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-gold px-4 py-3 text-sm font-semibold text-background transition-colors hover:bg-gold-light"
        >
          <Plus size={16} />
          New episode
        </button>
      </div>

      {isCreating && (
        <form
          onSubmit={handleCreateEpisode}
          className="space-y-4 rounded-xl border border-border bg-background p-5"
        >
          <h3 className="font-semibold">Create an episode</h3>

          <div className="space-y-2">
            <label
              htmlFor="episode-title"
              className="text-sm font-medium"
            >
              Episode title
            </label>

            <input
              id="episode-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter episode title"
              maxLength={150}
              required
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-gold"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="episode-summary"
              className="text-sm font-medium"
            >
              Episode summary
            </label>

            <textarea
              id="episode-summary"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="What happens in this episode?"
              rows={3}
              maxLength={3000}
              className="w-full resize-y rounded-lg border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-gold"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setError("");
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-foreground"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-gold px-5 py-2 text-sm font-semibold text-background disabled:opacity-60"
            >
              {isSaving ? "Creating..." : "Create episode"}
            </button>
          </div>
        </form>
      )}

      {error && !isCreating && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      {episodes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold">
            <Clapperboard size={22} />
          </div>

          <h3 className="mt-4 font-semibold">
            No episodes yet
          </h3>

          <p className="mt-2 text-sm text-muted">
            Create your first episode to begin developing your script.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {episodes.map((episode) => (
            <div
              key={episode.id}
              className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-background p-5 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-sm font-semibold text-gold">
                  {String(episode.episodeNumber).padStart(2, "0")}
                </div>

                <div className="min-w-0">
                  <h3 className="truncate font-semibold">
                    {episode.title}
                  </h3>

                  <p className="mt-1 line-clamp-2 text-sm text-muted">
                    {episode.summary || "No summary added yet."}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Clock3 size={13} />
                      {episode.status.replace("_", " ")}
                    </span>

                    <span>
                      {episode.scenes.length}{" "}
                      {episode.scenes.length === 1 ? "scene" : "scenes"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteEpisode(episode)}
                  aria-label={`Delete ${episode.title}`}
                  className="rounded-lg border border-border p-2 text-muted transition-colors hover:border-red-400/50 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>

                <Link
                  href={`/projects/${project.id}/episodes/${episode.id}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-gold/40 px-4 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold/10"
                >
                  Open episode
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
