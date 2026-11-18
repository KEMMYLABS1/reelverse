
"use client";

import { useState, type FormEvent } from "react";
import { BookOpen, Save } from "lucide-react";

import { updateProjectStoryBrief } from "@/lib/projects";
import type {
  Project,
  ProjectGenre,
  StoryBrief,
} from "@/types/project";

interface StoryBriefEditorProps {
  project: Project;
  onSaved: (project: Project) => void;
}

const genreOptions: { value: ProjectGenre; label: string }[] = [
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

const emptyBrief: StoryBrief = {
  concept: "",
  genre: "",
  logline: "",
  synopsis: "",
  setting: "",
  creativeDirection: "",
  targetAudience: "",
};

export function StoryBriefEditor({
  project,
  onSaved,
}: StoryBriefEditorProps) {
  const [brief, setBrief] = useState<StoryBrief>(
    project.storyBrief ?? emptyBrief,
  );
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  function updateField<K extends keyof StoryBrief>(
    field: K,
    value: StoryBrief[K],
  ) {
    setBrief((current) => ({
      ...current,
      [field]: value,
    }));
    setSuccessMessage("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    setIsSaving(true);

    try {
      const updatedProject = updateProjectStoryBrief(
        project.id,
        brief,
      );

      if (!updatedProject) {
        setError("Unable to find this project. Please refresh and try again.");
        return;
      }

      onSaved(updatedProject);
      setSuccessMessage("Story brief saved successfully.");
    } catch {
      setError("Unable to save your story brief. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-7 rounded-2xl border border-border bg-surface p-6 sm:p-8"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold">
          <BookOpen size={23} />
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-gold">
            Creative development
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            Story Development
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Establish the creative direction and foundation of your production.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="story-concept" className="text-sm font-medium">
          Story concept
        </label>
        <textarea
          id="story-concept"
          value={brief.concept}
          onChange={(event) => updateField("concept", event.target.value)}
          placeholder="What is the central idea behind this production?"
          rows={3}
          maxLength={2000}
          className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none placeholder:text-muted focus:border-gold"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="story-genre" className="text-sm font-medium">
          Genre
        </label>
        <select
          id="story-genre"
          value={brief.genre}
          onChange={(event) =>
            updateField("genre", event.target.value as ProjectGenre | "")
          }
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
        >
          <option value="">Select a genre</option>
          {genreOptions.map((genre) => (
            <option key={genre.value} value={genre.value}>
              {genre.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="story-logline" className="text-sm font-medium">
          Logline
        </label>
        <textarea
          id="story-logline"
          value={brief.logline}
          onChange={(event) => updateField("logline", event.target.value)}
          placeholder="Summarise the production in one or two compelling sentences."
          rows={2}
          maxLength={500}
          className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none placeholder:text-muted focus:border-gold"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="story-synopsis" className="text-sm font-medium">
          Synopsis
        </label>
        <textarea
          id="story-synopsis"
          value={brief.synopsis}
          onChange={(event) => updateField("synopsis", event.target.value)}
          placeholder="Describe the story, its main events and what the audience should experience."
          rows={6}
          maxLength={10000}
          className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none placeholder:text-muted focus:border-gold"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="story-setting" className="text-sm font-medium">
          Setting and time period
        </label>
        <textarea
          id="story-setting"
          value={brief.setting}
          onChange={(event) => updateField("setting", event.target.value)}
          placeholder="Where and when does the production take place?"
          rows={2}
          maxLength={2000}
          className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none placeholder:text-muted focus:border-gold"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="creative-direction" className="text-sm font-medium">
          Creative direction
        </label>
        <textarea
          id="creative-direction"
          value={brief.creativeDirection}
          onChange={(event) =>
            updateField("creativeDirection", event.target.value)
          }
          placeholder="Describe the visual style, mood, tone, atmosphere and storytelling approach."
          rows={4}
          maxLength={4000}
          className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none placeholder:text-muted focus:border-gold"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="target-audience" className="text-sm font-medium">
          Target audience
        </label>
        <textarea
          id="target-audience"
          value={brief.targetAudience}
          onChange={(event) =>
            updateField("targetAudience", event.target.value)
          }
          placeholder="Who is this production intended for?"
          rows={2}
          maxLength={1000}
          className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none placeholder:text-muted focus:border-gold"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      {successMessage && (
        <p role="status" className="text-sm text-green-400">
          {successMessage}
        </p>
      )}

      <div className="flex justify-end border-t border-border pt-5">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-3 text-sm font-semibold text-background transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={16} />
          {isSaving ? "Saving..." : "Save story brief"}
        </button>
      </div>
    </form>
  );
}
