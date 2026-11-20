"use client";

import { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import { approveStoryPackage } from "@/lib/projects";
import { generateStoryPackage } from "@/lib/story-generator";

import type { Project, ProjectGenre } from "@/types/project";
import type { GeneratedStoryPackage } from "@/lib/story-generator";

interface AIStoryCreatorProps {
  project: Project;
  onUpdated: (project: Project) => void;
}

const genres: { value: ProjectGenre; label: string }[] = [
  { value: "drama", label: "Drama" },
  { value: "romance", label: "Romance" },
  { value: "comedy", label: "Comedy" },
  { value: "thriller", label: "Thriller" },
  { value: "historical", label: "Historical" },
  { value: "documentary", label: "Documentary" },
  { value: "educational", label: "Educational" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "other", label: "Other" },
];

export function AIStoryCreator({
  project,
  onUpdated,
}: AIStoryCreatorProps) {
  const [idea, setIdea] = useState(
    project.storyBrief?.concept || project.description || "",
  );

  const [genre, setGenre] = useState<ProjectGenre>(
    project.storyBrief?.genre || "drama",
  );

  const [episodeCount, setEpisodeCount] = useState("6");
  const [storyPackage, setStoryPackage] =
    useState<GeneratedStoryPackage | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleGenerate() {
    setError("");
    setSuccess("");

    if (!idea.trim()) {
      setError("Enter a story idea before generating.");
      return;
    }

    const generated = generateStoryPackage(
      idea,
      genre,
      Number(episodeCount),
    );

    setStoryPackage(generated);
  }

  function updateEpisode(
    index: number,
    field: "title" | "summary",
    value: string,
  ) {
    setStoryPackage((current) => {
      if (!current) return current;

      return {
        ...current,
        episodes: current.episodes.map((episode, episodeIndex) =>
          episodeIndex === index
            ? { ...episode, [field]: value }
            : episode,
        ),
      };
    });

    setSuccess("");
  }

  function handleApprove() {
    if (!storyPackage) return;

    if (
      project.storyBrief &&
      !window.confirm(
        "This will replace the existing story brief. Existing episodes and scenes will be preserved, and the new episodes will be added. Continue?",
      )
    ) {
      return;
    }

    const updatedProject = approveStoryPackage(
      project.id,
      storyPackage.brief,
      storyPackage.episodes,
    );

    if (!updatedProject) {
      setError("Unable to save the story package. Please try again.");
      return;
    }

    onUpdated(updatedProject);
    setStoryPackage(null);
    setSuccess("Story brief and episode outlines saved successfully.");
    setError("");
  }

  return (
    <section className="space-y-6 rounded-2xl border border-gold/30 bg-surface p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold">
            <Sparkles size={23} />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-gold">
              Creative assistant
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              AI Story Creator
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted">
              Start with a simple idea. Develop a story foundation and
              episode outlines before moving into scene creation.
            </p>
          </div>
        </div>

        <span className="w-fit rounded-full border border-amber-500/40 px-3 py-1 text-xs text-amber-500">
          Demo mode
        </span>
      </div>

      <div className="rounded-lg border border-border bg-background p-4">
        <p className="text-sm font-medium">Demo generator notice</p>
        <p className="mt-1 text-xs leading-5 text-muted">
          This version uses a local demonstration engine. It does not
          connect to a live AI provider. A real AI provider can be
          integrated later.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="story-idea" className="text-sm font-medium">
          What is your story about?
        </label>

        <textarea
          id="story-idea"
          value={idea}
          onChange={(event) => setIdea(event.target.value)}
          placeholder="Example: A young woman returns to her village after many years and discovers that her family has been hiding a secret..."
          rows={4}
          maxLength={2000}
          className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none placeholder:text-muted focus:border-gold"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="creator-genre" className="text-sm font-medium">
            Genre
          </label>

          <select
            id="creator-genre"
            value={genre}
            onChange={(event) =>
              setGenre(event.target.value as ProjectGenre)
            }
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
          >
            {genres.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="creator-episodes" className="text-sm font-medium">
            Number of episodes
          </label>

          <select
            id="creator-episodes"
            value={episodeCount}
            onChange={(event) => setEpisodeCount(event.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
          >
            {[3, 4, 6, 8, 10].map((count) => (
              <option key={count} value={count}>
                {count} episodes
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-3 text-sm font-semibold text-background transition-colors hover:bg-gold-light"
      >
        <Sparkles size={16} />
        Generate story outline
      </button>

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="text-sm text-green-400">
          {success}
        </p>
      )}

      {storyPackage && (
        <div className="space-y-6 border-t border-border pt-6">
          <div>
            <div className="flex items-center gap-2 text-gold">
              <BookOpen size={18} />
              <p className="text-xs font-medium uppercase tracking-widest">
                Review your proposal
              </p>
            </div>

            <h3 className="mt-2 text-lg font-semibold">
              Story foundation
            </h3>
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-background p-5">
            <div>
              <p className="text-xs text-muted">Concept</p>
              <p className="mt-1 text-sm">{storyPackage.brief.concept}</p>
            </div>

            <div>
              <p className="text-xs text-muted">Logline</p>
              <p className="mt-1 text-sm leading-6">
                {storyPackage.brief.logline}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted">Synopsis</p>
              <p className="mt-1 whitespace-pre-line text-sm leading-6">
                {storyPackage.brief.synopsis}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted">Setting</p>
              <p className="mt-1 text-sm">
                {storyPackage.brief.setting}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted">Creative direction</p>
              <p className="mt-1 text-sm leading-6">
                {storyPackage.brief.creativeDirection}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted">Target audience</p>
              <p className="mt-1 text-sm">
                {storyPackage.brief.targetAudience}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Episode outlines</h3>
            <p className="mt-1 text-sm text-muted">
              Edit the titles and summaries before approving the series.
            </p>
          </div>

          <div className="space-y-4">
            {storyPackage.episodes.map((episode, index) => (
              <div
                key={index}
                className="space-y-3 rounded-xl border border-border bg-background p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-sm font-semibold text-gold">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <p className="text-sm font-medium">
                    Episode {index + 1}
                  </p>
                </div>

                <input
                  aria-label={`Episode ${index + 1} title`}
                  value={episode.title}
                  onChange={(event) =>
                    updateEpisode(index, "title", event.target.value)
                  }
                  maxLength={150}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-gold"
                />

                <textarea
                  aria-label={`Episode ${index + 1} summary`}
                  value={episode.summary}
                  onChange={(event) =>
                    updateEpisode(index, "summary", event.target.value)
                  }
                  rows={3}
                  maxLength={3000}
                  className="w-full resize-y rounded-lg border border-border bg-surface px-4 py-3 text-sm leading-6 outline-none focus:border-gold"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-muted">
              Approval saves the story brief and adds these episodes
              to your project. Existing episodes and scenes are preserved.
            </p>

            <button
              type="button"
              onClick={handleApprove}
              disabled={storyPackage.episodes.some(
                (episode) =>
                  !episode.title.trim() || !episode.summary.trim(),
              )}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-gold px-5 py-3 text-sm font-semibold text-background transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              Approve and save
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
