"use client";

import { useState } from "react";
import {
  Sparkles,
  Save,
  RefreshCw,
  Clapperboard,
} from "lucide-react";

import { createScene } from "@/lib/projects";
import { getCharacters } from "@/lib/characters";
import { generateEpisodeSceneDrafts } from "@/lib/scene-generator";

import type {
  Project,
  ScriptEpisode,
  ScriptScene,
  DialogueLine,
} from "@/types/project";

import type { GeneratedSceneDraft } from "@/lib/scene-generator";

interface AISceneGeneratorProps {
  project: Project;
  episode: ScriptEpisode;
  onUpdated: (project: Project) => void;
}

function formatDialogue(dialogue: DialogueLine[]) {
  return dialogue
    .map((line) => `${line.characterName}: ${line.dialogue}`)
    .join("\n");
}

function parseDialogue(value: string): DialogueLine[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf(":");

      return {
        id: crypto.randomUUID(),
        characterName:
          separator === -1
            ? "Narrator"
            : line.slice(0, separator).trim() || "Narrator",
        dialogue:
          separator === -1
            ? line
            : line.slice(separator + 1).trim(),
      };
    });
}

export function AISceneGenerator({
  project,
  episode,
  onUpdated,
}: AISceneGeneratorProps) {
  const [sceneCount, setSceneCount] = useState(6);
  const [drafts, setDrafts] = useState<GeneratedSceneDraft[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleGenerate() {
    setError("");
    setSuccess("");
    setIsGenerating(true);

    try {
      const characters = getCharacters();

      const generated = generateEpisodeSceneDrafts(
        project,
        episode,
        characters,
        sceneCount,
      );

      setDrafts(generated);
    } catch (generationError) {
      console.error(generationError);
      setError("Unable to generate scenes. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  function updateDraft(
    index: number,
    field: keyof GeneratedSceneDraft,
    value: string,
  ) {
    setDrafts((current) =>
      current.map((scene, sceneIndex) =>
        sceneIndex === index
          ? {
              ...scene,
              [field]:
                field === "dialogue"
                  ? parseDialogue(value)
                  : value,
            }
          : scene,
      ),
    );
  }

  function handleSave() {
    setError("");
    setSuccess("");

    if (drafts.length === 0) {
      setError("Generate scenes before saving.");
      return;
    }

    if (drafts.some((scene) => !scene.title.trim())) {
      setError("Every scene must have a title.");
      return;
    }

    const existingScenes = episode.scenes ?? [];

    if (existingScenes.length > 0) {
      const confirmed = window.confirm(
        `This episode already has ${existingScenes.length} scene(s). Add ${drafts.length} generated scenes after them? Existing scenes will not be replaced.`,
      );

      if (!confirmed) return;
    }

    setIsSaving(true);

    try {
      const savedScenes: ScriptScene[] = [];

      for (const draft of drafts) {
        const saved = createScene(project.id, episode.id, {
          ...draft,
          title: draft.title.trim(),
        });

        if (!saved) {
          throw new Error("A scene could not be saved.");
        }

        savedScenes.push(saved);
      }

      const updatedEpisode: ScriptEpisode = {
        ...episode,
        scenes: [...existingScenes, ...savedScenes],
        updatedAt: new Date().toISOString(),
      };

      const updatedProject: Project = {
        ...project,
        episodes: (project.episodes ?? []).map((item) =>
          item.id === episode.id ? updatedEpisode : item,
        ),
        updatedAt: new Date().toISOString(),
      };

      onUpdated(updatedProject);
      setDrafts([]);
      setSuccess(
        `${savedScenes.length} scenes saved successfully to ${episode.title}.`,
      );
    } catch (saveError) {
      console.error(saveError);
      setError(
        "Some scenes may have been saved. Refresh the episode before retrying to avoid duplicates.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="space-y-5 rounded-2xl border border-gold/30 bg-surface p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-gold">
            <Sparkles size={18} />
            <span className="text-xs font-semibold uppercase tracking-widest">
              Scene generation
            </span>
          </div>

          <h3 className="mt-2 text-lg font-semibold">
            Generate scenes for this episode
          </h3>

          <p className="mt-1 text-sm text-muted">
            Build a scene-by-scene script from the story and episode outline.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sceneCount}
            onChange={(event) =>
              setSceneCount(Number(event.target.value))
            }
            disabled={isGenerating || isSaving}
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            aria-label="Number of scenes"
          >
            {[4, 6, 8, 10].map((count) => (
              <option key={count} value={count}>
                {count} scenes
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-60"
          >
            {isGenerating ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            {isGenerating ? "Generating..." : "Generate Scenes"}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background p-3 text-xs leading-5 text-muted">
        Demo generation engine: this version creates structured scene drafts
        locally without a paid AI API. The generator is designed to be replaced
        by a live AI provider later.
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="text-sm text-green-500">
          {success}
        </p>
      )}

      {drafts.length > 0 && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="font-semibold">
                Review generated scenes
              </h4>
              <p className="mt-1 text-xs text-muted">
                Edit the drafts before saving them to the episode.
              </p>
            </div>

            <span className="text-xs text-muted">
              {drafts.length} draft scenes
            </span>
          </div>

          {drafts.map((scene, index) => (
            <article
              key={index}
              className="space-y-3 rounded-xl border border-border bg-background p-4"
            >
              <div className="flex items-center gap-2 text-gold">
                <Clapperboard size={15} />
                <span className="text-xs font-semibold uppercase">
                  Draft scene {index + 1}
                </span>
              </div>

              <input
                value={scene.title}
                onChange={(event) =>
                  updateDraft(index, "title", event.target.value)
                }
                placeholder="Scene title"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm font-semibold"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={scene.location}
                  onChange={(event) =>
                    updateDraft(index, "location", event.target.value)
                  }
                  placeholder="Location"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm"
                />

                <input
                  value={scene.timeOfDay}
                  onChange={(event) =>
                    updateDraft(index, "timeOfDay", event.target.value)
                  }
                  placeholder="Time of day"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm"
                />
              </div>

              <label className="block space-y-1">
                <span className="text-xs font-medium text-muted">
                  Visual description
                </span>
                <textarea
                  rows={4}
                  value={scene.visualDescription}
                  onChange={(event) =>
                    updateDraft(
                      index,
                      "visualDescription",
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm leading-6"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-medium text-muted">
                  Scene action
                </span>
                <textarea
                  rows={3}
                  value={scene.action}
                  onChange={(event) =>
                    updateDraft(index, "action", event.target.value)
                  }
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm leading-6"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-medium text-muted">
                  Dialogue
                </span>
                <textarea
                  rows={3}
                  value={formatDialogue(scene.dialogue)}
                  onChange={(event) =>
                    updateDraft(index, "dialogue", event.target.value)
                  }
                  placeholder="Character: Dialogue"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm leading-6"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-medium text-muted">
                  Production notes
                </span>
                <textarea
                  rows={2}
                  value={scene.notes}
                  onChange={(event) =>
                    updateDraft(index, "notes", event.target.value)
                  }
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm leading-6"
                />
              </label>

              <p className="text-xs text-muted">
                {scene.characterAssignments?.length ?? 0} character
                assignment suggestions
              </p>
            </article>
          ))}

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => setDrafts([])}
              disabled={isSaving}
              className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted"
            >
              Discard drafts
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-60"
            >
              <Save size={16} />
              {isSaving ? "Saving scenes..." : "Approve and Save Scenes"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
