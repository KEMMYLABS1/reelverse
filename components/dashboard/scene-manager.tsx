
"use client";

import { useState, type FormEvent } from "react";
import {
  Clock3,
  MapPin,
  MessageSquare,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

import {
  createScene,
  updateScene,
  deleteScene,
} from "@/lib/projects";

import type {
  Project,
  ScriptEpisode,
  ScriptScene,
  DialogueLine,
} from "@/types/project";

interface SceneManagerProps {
  project: Project;
  episode: ScriptEpisode;
  onUpdated: (project: Project) => void;
}

interface SceneFormData {
  title: string;
  location: string;
  timeOfDay: string;
  visualDescription: string;
  action: string;
  dialogue: string;
  notes: string;
}

const emptyForm: SceneFormData = {
  title: "",
  location: "",
  timeOfDay: "",
  visualDescription: "",
  action: "",
  dialogue: "",
  notes: "",
};

function formatDialogue(dialogue: DialogueLine[]): string {
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

      if (separator === -1) {
        return {
          id: crypto.randomUUID(),
          characterName: "Narrator",
          dialogue: line,
        };
      }

      return {
        id: crypto.randomUUID(),
        characterName: line.slice(0, separator).trim() || "Narrator",
        dialogue: line.slice(separator + 1).trim(),
      };
    });
}

function getFormData(scene: ScriptScene): SceneFormData {
  return {
    title: scene.title,
    location: scene.location,
    timeOfDay: scene.timeOfDay,
    visualDescription: scene.visualDescription,
    action: scene.action,
    dialogue: formatDialogue(scene.dialogue),
    notes: scene.notes,
  };
}

export function SceneManager({
  project,
  episode,
  onUpdated,
}: SceneManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [form, setForm] = useState<SceneFormData>(emptyForm);
  const [error, setError] = useState("");

  const scenes = episode.scenes ?? [];

  function publishUpdatedEpisode(updatedEpisode: ScriptEpisode) {
    const updatedProject: Project = {
      ...project,
      episodes: (project.episodes ?? []).map((item) =>
        item.id === episode.id ? updatedEpisode : item,
      ),
      updatedAt: new Date().toISOString(),
    };

    onUpdated(updatedProject);
  }

  function handleCreate() {
    setForm(emptyForm);
    setError("");
    setEditingSceneId(null);
    setIsCreating(true);
  }

  function handleEdit(scene: ScriptScene) {
    setForm(getFormData(scene));
    setError("");
    setIsCreating(false);
    setEditingSceneId(scene.id);
  }

  function handleCancel() {
    setIsCreating(false);
    setEditingSceneId(null);
    setForm(emptyForm);
    setError("");
  }

  function handleChange(
    field: keyof SceneFormData,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Please enter a scene title.");
      return;
    }

    const sceneData = {
      title: form.title.trim(),
      location: form.location.trim(),
      timeOfDay: form.timeOfDay.trim(),
      visualDescription: form.visualDescription.trim(),
      action: form.action.trim(),
      dialogue: parseDialogue(form.dialogue),
      notes: form.notes.trim(),
    };

    if (editingSceneId) {
      const updatedScene = updateScene(
        project.id,
        episode.id,
        editingSceneId,
        sceneData,
      );

      if (!updatedScene) {
        setError("Unable to update this scene. Please try again.");
        return;
      }

      const updatedEpisode: ScriptEpisode = {
        ...episode,
        scenes: scenes.map((scene) =>
          scene.id === updatedScene.id ? updatedScene : scene,
        ),
        updatedAt: new Date().toISOString(),
      };

      publishUpdatedEpisode(updatedEpisode);
    } else {
      const newScene = createScene(
        project.id,
        episode.id,
        sceneData,
      );

      if (!newScene) {
        setError("Unable to create this scene. Please try again.");
        return;
      }

      const updatedEpisode: ScriptEpisode = {
        ...episode,
        scenes: [...scenes, newScene],
        updatedAt: new Date().toISOString(),
      };

      publishUpdatedEpisode(updatedEpisode);
    }

    handleCancel();
  }

  function handleDelete(sceneId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this scene?",
    );

    if (!confirmed) return;

    const deleted = deleteScene(
      project.id,
      episode.id,
      sceneId,
    );

    if (!deleted) {
      setError("Unable to delete this scene.");
      return;
    }

    const remainingScenes = scenes
      .filter((scene) => scene.id !== sceneId)
      .map((scene, index) => ({
        ...scene,
        sceneNumber: index + 1,
      }));

    const updatedEpisode: ScriptEpisode = {
      ...episode,
      scenes: remainingScenes,
      updatedAt: new Date().toISOString(),
    };

    publishUpdatedEpisode(updatedEpisode);

    if (editingSceneId === sceneId) {
      handleCancel();
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Scene Breakdown
          </h2>
          <p className="mt-1 text-sm text-muted">
            Build your episode one scene at a time.
          </p>
        </div>

        {!isCreating && !editingSceneId && (
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-black transition hover:opacity-90"
          >
            <Plus size={16} />
            Add Scene
          </button>
        )}
      </div>

      {(isCreating || editingSceneId) && (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-border bg-surface p-5"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">
              {editingSceneId ? "Edit Scene" : "Create New Scene"}
            </h3>

            <button
              type="button"
              onClick={handleCancel}
              className="text-muted transition hover:text-foreground"
              aria-label="Close scene form"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm text-muted">
                Scene Title *
              </label>
              <input
                required
                value={form.title}
                onChange={(event) =>
                  handleChange("title", event.target.value)
                }
                placeholder="e.g. The Unexpected Visitor"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-muted">
                Location
              </label>
              <input
                value={form.location}
                onChange={(event) =>
                  handleChange("location", event.target.value)
                }
                placeholder="e.g. Family kitchen"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-muted">
                Time of Day
              </label>
              <input
                value={form.timeOfDay}
                onChange={(event) =>
                  handleChange("timeOfDay", event.target.value)
                }
                placeholder="e.g. Early morning"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-gold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm text-muted">
                Visual Description
              </label>
              <textarea
                rows={3}
                value={form.visualDescription}
                onChange={(event) =>
                  handleChange("visualDescription", event.target.value)
                }
                placeholder="Describe what the audience should see..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-gold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm text-muted">
                Scene Action
              </label>
              <textarea
                rows={3}
                value={form.action}
                onChange={(event) =>
                  handleChange("action", event.target.value)
                }
                placeholder="Describe what happens in this scene..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-gold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm text-muted">
                Dialogue
              </label>
              <textarea
                rows={4}
                value={form.dialogue}
                onChange={(event) =>
                  handleChange("dialogue", event.target.value)
                }
                placeholder={"Character name: Dialogue goes here.\nAnother character: Their response."}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-gold"
              />
              <p className="mt-1 text-xs text-muted">
                Enter one dialogue line per row using Character: Dialogue.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm text-muted">
                Production Notes
              </label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(event) =>
                  handleChange("notes", event.target.value)
                }
                placeholder="Camera angles, props, continuity or other notes..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-gold"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-black transition hover:opacity-90"
            >
              <Save size={16} />
              {editingSceneId ? "Save Changes" : "Create Scene"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted transition hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {scenes.length === 0 && !isCreating ? (
        <div className="rounded-xl border border-dashed border-border bg-surface/50 px-6 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background text-gold">
            <Plus size={22} />
          </div>
          <h3 className="mt-4 font-medium text-foreground">
            No scenes yet
          </h3>
          <p className="mt-2 text-sm text-muted">
            Start building this episode by adding its first scene.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {scenes.map((scene) => (
            <article
              key={scene.id}
              className="rounded-xl border border-border bg-surface p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gold">
                    Scene {scene.sceneNumber}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-foreground">
                    {scene.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(scene)}
                    className="rounded-lg border border-border p-2 text-muted transition hover:text-gold"
                    aria-label={`Edit ${scene.title}`}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(scene.id)}
                    className="rounded-lg border border-border p-2 text-muted transition hover:text-red-400"
                    aria-label={`Delete ${scene.title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
                {scene.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    {scene.location}
                  </span>
                )}

                {scene.timeOfDay && (
                  <span className="flex items-center gap-1.5">
                    <Clock3 size={14} />
                    {scene.timeOfDay}
                  </span>
                )}

                <span className="flex items-center gap-1.5">
                  <MessageSquare size={14} />
                  {scene.dialogue.length} dialogue lines
                </span>
              </div>

              {scene.visualDescription && (
                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Visual Description
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/80">
                    {scene.visualDescription}
                  </p>
                </div>
              )}

              {scene.action && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Action
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/80">
                    {scene.action}
                  </p>
                </div>
              )}

              {scene.dialogue.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Dialogue
                  </p>

                  {scene.dialogue.map((line) => (
                    <div
                      key={line.id}
                      className="rounded-lg bg-background px-3 py-2"
                    >
                      <p className="text-xs font-semibold text-gold">
                        {line.characterName}
                      </p>
                      <p className="mt-1 text-sm text-foreground/80">
                        {line.dialogue}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {scene.notes && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Production Notes
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/70">
                    {scene.notes}
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
