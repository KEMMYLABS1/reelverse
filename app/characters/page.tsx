
"use client";

import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  UsersRound,
  UserRound,
  Mic2,
  Sparkles,
  Pencil,
  Trash2,
  X,
  ImagePlus,
} from "lucide-react";
import Image from "next/image";
import { StudioSidebar } from "@/components/layout/studio-sidebar";
import { StudioHeader } from "@/components/layout/studio-header";
import {
  createCharacter,
  getCharacters,
  updateCharacter,
  deleteCharacter,
  saveCharacterReferenceImage,
  getCharacterReferenceImages,
  deleteCharacterReferenceImage,
} from "@/lib/characters";
import type {
  CharacterProfile,
  CharacterRole,
  CharacterOrigin,
} from "@/types/project";

type CharacterFormProps = {
  character?: CharacterProfile;
  primaryExists: boolean;
  onSave: (data: {
    name: string;
    role: CharacterRole;
    origin: CharacterOrigin;
    description: string;
    appearance: string;
    personality: string;
    voiceDescription: string;
  }) => void;
  onCancel: () => void;
  error: string;
};

function CharacterForm({
  character,
  primaryExists,
  onSave,
  onCancel,
  error,
}: CharacterFormProps) {
  const [name, setName] = useState(character?.name ?? "");
  const [role, setRole] = useState<CharacterRole>(
    character?.role ?? "supporting",
  );
  const [origin, setOrigin] = useState<CharacterOrigin>(
    character?.origin ?? "ai_generated",
  );
  const [description, setDescription] = useState(
    character?.description ?? "",
  );
  const [appearance, setAppearance] = useState(
    character?.appearance ?? "",
  );
  const [personality, setPersonality] = useState(
    character?.personality ?? "",
  );
  const [voiceDescription, setVoiceDescription] = useState(
    character?.voiceDescription ?? "",
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSave({
      name: name.trim(),
      role,
      origin,
      description: description.trim(),
      appearance: appearance.trim(),
      personality: personality.trim(),
      voiceDescription: voiceDescription.trim(),
    });
  }

  return (
    <section className="rounded-xl border border-gold/30 bg-surface p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">
            {character ? "Edit character" : "Create a character profile"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Define the identity and creative details of this character.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          aria-label="Close character form"
          className="rounded-lg p-2 text-muted hover:bg-surface-elevated hover:text-foreground"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="character-name"
              className="mb-2 block text-sm font-medium"
            >
              Character name *
            </label>
            <input
              id="character-name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter character name"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
            />
          </div>

          <div>
            <label
              htmlFor="character-role"
              className="mb-2 block text-sm font-medium"
            >
              Character role *
            </label>
            <select
              id="character-role"
              value={role}
              disabled={Boolean(character?.isPrimary)}
              onChange={(event) =>
                setRole(event.target.value as CharacterRole)
              }
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
            >
              <option value="primary" disabled={primaryExists}>
                Primary Character
              </option>
              <option value="supporting">Supporting Character</option>
              <option value="background">Background Character</option>
              <option value="narrator">Narrator</option>
            </select>

            {character?.isPrimary && (
                <p className="mt-2 text-xs text-muted">
                    Your Primary Character role is protected and cannot be changed.
                </p>
                )}
            {primaryExists && (
              <p className="mt-2 text-xs text-muted">
                Another Primary Character already exists.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="character-origin"
              className="mb-2 block text-sm font-medium"
            >
              Character origin *
            </label>
            <select
              id="character-origin"
              value={origin}
              onChange={(event) =>
                setOrigin(event.target.value as CharacterOrigin)
              }
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
            >
              <option value="real_person">Real person</option>
              <option value="ai_generated">AI-generated</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="character-description"
            className="mb-2 block text-sm font-medium"
          >
            Character description
          </label>
          <textarea
            id="character-description"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Who is this character? Describe their background and story."
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
          />
        </div>

        <div>
          <label
            htmlFor="character-appearance"
            className="mb-2 block text-sm font-medium"
          >
            Physical appearance
          </label>
          <textarea
            id="character-appearance"
            rows={3}
            value={appearance}
            onChange={(event) => setAppearance(event.target.value)}
            placeholder="Describe facial features, build, age appearance and other visual details."
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="character-personality"
              className="mb-2 block text-sm font-medium"
            >
              Personality
            </label>
            <textarea
              id="character-personality"
              rows={3}
              value={personality}
              onChange={(event) => setPersonality(event.target.value)}
              placeholder="Describe their personality, behaviour and mannerisms."
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
            />
          </div>

          <div>
            <label
              htmlFor="character-voice"
              className="mb-2 block text-sm font-medium"
            >
              Voice description
            </label>
            <textarea
              id="character-voice"
              rows={3}
              value={voiceDescription}
              onChange={(event) =>
                setVoiceDescription(event.target.value)
              }
              placeholder="Describe accent, tone, pitch and speaking style."
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3 border-t border-border pt-5">
          <button
            type="submit"
            className="rounded-lg bg-gold px-5 py-3 text-sm font-semibold text-background transition-colors hover:bg-gold-light"
          >
            {character ? "Save changes" : "Save character"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-5 py-3 text-sm text-muted transition-colors hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

type CharacterReferencePhotosProps = {
  character: CharacterProfile;
  onUploaded: () => void;
};

function CharacterReferencePhotos({
  character,
  onUploaded,
}: CharacterReferencePhotosProps) {
  const [photos, setPhotos] = useState<
    { id: string; name: string; url: string }[]
  >([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    let active = true;
    const objectUrls: string[] = [];

    getCharacterReferenceImages(character.id)
      .then((images) => {
        if (!active) return;

        const loadedPhotos = images.map((image) => {
          const url = URL.createObjectURL(image.blob);
          objectUrls.push(url);

          return {
            id: image.id,
            name: image.name,
            url,
          };
        });

        setPhotos(loadedPhotos);
      })
      .catch(() => {
        if (active) {
          setUploadError("Unable to load reference photos.");
        }
      });

    return () => {
      active = false;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [character.id]);

  async function handleUpload(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) return;

    setUploading(true);
    setUploadError("");

    try {
      let referenceImages = [...character.referenceImages];

      for (const file of files) {
        const imageId = await saveCharacterReferenceImage(
          character.id,
          file,
        );

        referenceImages = [...referenceImages, imageId];

        const updated = updateCharacter(character.id, {
          referenceImages,
        });

        if (!updated) {
          throw new Error("Unable to update the character profile.");
        }
      }

      onUploaded();

      const images = await getCharacterReferenceImages(character.id);
      setPhotos((current) => {
        current.forEach((photo) => URL.revokeObjectURL(photo.url));

        return images.map((image) => ({
          id: image.id,
          name: image.name,
          url: URL.createObjectURL(image.blob),
        }));
      });
    } catch (err) {
      setUploadError(
        err instanceof Error
          ? err.message
          : "Unable to upload reference photos.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDeletePhoto(imageId: string) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this reference photo?",
  );

  if (!confirmed) return;

  try {
    await deleteCharacterReferenceImage(imageId);

    const referenceImages = character.referenceImages.filter(
      (id) => id !== imageId,
    );

    const updated = updateCharacter(character.id, {
      referenceImages,
    });

    if (!updated) {
      throw new Error("Unable to update character profile.");
    }

    setPhotos((current) => {
      const photoToDelete = current.find(
        (photo) => photo.id === imageId,
      );

      if (photoToDelete) {
        URL.revokeObjectURL(photoToDelete.url);
      }

      return current.filter((photo) => photo.id !== imageId);
    });

    onUploaded();
  } catch (error) {
    setUploadError(
      error instanceof Error
        ? error.message
        : "Unable to delete reference photo.",
    );
  }
}
  return (
    <div className="mt-5 border-t border-border pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold">Reference photos</h4>
          <p className="mt-1 text-xs text-muted">
            Upload clear photos to guide this character&apos;s visual identity.
          </p>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gold/30 px-3 py-2 text-xs font-medium text-gold transition-colors hover:bg-gold/10">
          <ImagePlus size={15} />
          {uploading ? "Uploading..." : "Add photos"}
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={handleUpload}
            className="sr-only"
          />
        </label>
      </div>

      <p className="mt-2 text-[11px] text-muted">
        Image files only. Maximum 10 MB per photo.
      </p>

      {uploadError && (
        <p role="alert" className="mt-3 text-xs text-red-400">
          {uploadError}
        </p>
      )}

      {photos.length > 0 ? (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo.id} className="min-w-0">
              <div className="group relative">
                <Image
                  src={photo.url}
                  alt={`Reference photo: ${photo.name}`}
                  width={160}
                  height={160}
                  unoptimized
                  className="aspect-square w-full rounded-lg border border-border object-cover"
                />

                <button
                  type="button"
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="absolute right-2 top-2 rounded-md bg-black/80 p-2 text-white opacity-100 transition hover:bg-red-600"
                  aria-label={`Delete ${photo.name}`}
                  title="Delete reference photo"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <p className="mt-1 truncate text-[10px] text-muted">
                {photo.name}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-xs text-muted">
          No reference photos uploaded yet.
        </p>
      )}
    </div>
  );
}

export default function CharacterLibraryPage() {
  const [characters, setCharacters] = useState<CharacterProfile[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [editingCharacter, setEditingCharacter] =
    useState<CharacterProfile | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setCharacters(getCharacters());
      setLoaded(true);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const primaryCharacter = characters.find(
    (character) => character.isPrimary,
  );

  const supportingCharacters = characters.filter(
    (character) => !character.isPrimary,
  );

  function handleCreateCharacter(data: {
    name: string;
    role: CharacterRole;
    origin: CharacterOrigin;
    description: string;
    appearance: string;
    personality: string;
    voiceDescription: string;
  }) {
    setError("");

    try {
      const character = createCharacter({
        ...data,
        referenceImages: [],
        looks: [],
        projectIds: [],
        isPrimary: data.role === "primary",
      });

      setCharacters((current) => [...current, character]);
      setShowForm(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create character.",
      );
    }
  }

  function handleUpdateCharacter(data: {
    name: string;
    role: CharacterRole;
    origin: CharacterOrigin;
    description: string;
    appearance: string;
    personality: string;
    voiceDescription: string;
  }) {
    if (!editingCharacter) return;

    setError("");

    try {
      const updated = updateCharacter(editingCharacter.id, {
        ...data,
        isPrimary: data.role === "primary",
      });

      if (!updated) {
        setError("Character could not be found.");
        return;
      }

      setCharacters(getCharacters());
      setEditingCharacter(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update character.",
      );
    }
  }

  function handleDeleteCharacter(character: CharacterProfile) {
    if (character.isPrimary) {
      setError("Your Primary Character cannot be deleted.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${character.name}? This cannot be undone.`,
    );

    if (!confirmed) return;

    const deleted = deleteCharacter(character.id);

    if (deleted) {
      setCharacters(getCharacters());
      setError("");
    } else {
      setError("Unable to delete this character.");
    }
  }

  function openCreateForm() {
    setEditingCharacter(null);
    setShowForm(true);
    setError("");
  }

  function openEditForm(character: CharacterProfile) {
    setShowForm(false);
    setEditingCharacter(character);
    setError("");
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <StudioSidebar />

      <main className="min-w-0 flex-1">
        <StudioHeader />

        <div className="mx-auto max-w-7xl space-y-8 px-5 py-9 sm:px-8 sm:py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-gold"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>

          <section>
            <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-gold">
              <UsersRound size={15} />
              Character management
            </div>

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Character Library
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted sm:text-base">
                  Build your cast, preserve character identities and reuse
                  your characters across different productions.
                </p>
              </div>

              <button
                type="button"
                onClick={openCreateForm}
                className="inline-flex w-fit items-center gap-2 rounded-lg bg-gold px-5 py-3 text-sm font-semibold text-background transition-colors hover:bg-gold-light"
              >
                <Plus size={17} />
                Create character
              </button>
            </div>
          </section>

          {(showForm || editingCharacter) && (
            <CharacterForm
              key={editingCharacter?.id ?? "new-character"}
              character={editingCharacter ?? undefined}
              primaryExists={Boolean(
                primaryCharacter &&
                  primaryCharacter.id !== editingCharacter?.id,
              )}
              onSave={
                editingCharacter
                  ? handleUpdateCharacter
                  : handleCreateCharacter
              }
              onCancel={() => {
                setShowForm(false);
                setEditingCharacter(null);
                setError("");
              }}
              error={error}
            />
          )}

          {error && !showForm && !editingCharacter && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <section className="grid gap-5 lg:grid-cols-2">
            <article className="rounded-xl border border-gold/30 bg-surface p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold/10 text-gold">
                  <UserRound size={21} />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gold">
                    Main character
                  </p>
                  <h2 className="mt-1 text-lg font-semibold">
                    Primary Character
                  </h2>
                </div>
              </div>

              {primaryCharacter ? (
                <div className="mt-5 border-t border-border pt-4">
                  <p className="font-semibold">{primaryCharacter.name}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {primaryCharacter.description || "No description added yet."}
                  </p>
                  <p className="mt-3 text-xs text-gold">
                    {primaryCharacter.origin === "real_person"
                      ? "Real person"
                      : "AI-generated"}
                  </p>
                  <button
                    type="button"
                    onClick={() => openEditForm(primaryCharacter)}
                    className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-gold hover:text-gold-light"
                  >
                    <Pencil size={14} />
                    Edit primary character
                  </button>
                </div>
              ) : (
                <p className="mt-5 border-t border-border pt-4 text-xs text-muted">
                  Your primary character profile has not been created yet.
                </p>
              )}
            </article>

            <article className="rounded-xl border border-border bg-surface p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface-elevated text-gold">
                <UsersRound size={21} />
              </div>

              <h2 className="mt-4 text-lg font-semibold">
                Supporting Characters
              </h2>

              <p className="mt-3 text-sm leading-6 text-muted">
                Organize AI-generated characters and other supporting
                personalities for your stories.
              </p>

              <p className="mt-5 border-t border-border pt-4 text-xs text-muted">
                {supportingCharacters.length} supporting character
                {supportingCharacters.length === 1 ? "" : "s"} created
              </p>
            </article>
          </section>

          <section className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold">All characters</h2>
              <p className="mt-1 text-sm text-muted">
                Your reusable cast of characters.
              </p>
            </div>

            {!loaded ? (
              <p className="text-sm text-muted">Loading characters...</p>
            ) : characters.length === 0 ? (
              <div className="rounded-xl border border-border bg-surface p-8 text-center">
                <Sparkles
                  size={32}
                  className="mx-auto text-muted"
                  strokeWidth={1.5}
                />

                <h3 className="mt-4 text-lg font-semibold">
                  Your cast starts here
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                  Create your Primary Character first, then add the supporting
                  cast for your productions.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {characters.map((character) => (
                  <article
                    key={character.id}
                    className="rounded-xl border border-border bg-surface p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                        <UserRound size={20} />
                      </div>

                      {character.isPrimary && (
                        <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold">
                          Primary
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 font-semibold">{character.name}</h3>

                    <p className="mt-1 text-xs capitalize text-muted">
                      {character.role.replace("_", " ")} ·{" "}
                      {character.origin === "real_person"
                        ? "Real person"
                        : "AI-generated"}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-muted">
                      {character.description || "No description added yet."}
                    </p>

                    {character.appearance && (
                      <p className="mt-3 text-xs leading-5 text-muted">
                        <span className="font-semibold text-foreground">
                          Appearance:
                        </span>{" "}
                        {character.appearance}
                      </p>
                    )}

                    {character.voiceDescription && (
                      <div className="mt-4 flex items-start gap-2 border-t border-border pt-4 text-xs text-muted">
                        <Mic2 size={15} className="shrink-0 text-gold" />
                        {character.voiceDescription}
                      </div>
                    )}
                    <CharacterReferencePhotos
                        character={character}
                        onUploaded={() => setCharacters(getCharacters())}
                        />

                    <div className="mt-5 flex items-center gap-4 border-t border-border pt-4">
                      <button
                        type="button"
                        onClick={() => openEditForm(character)}
                        className="inline-flex items-center gap-2 text-xs font-medium text-gold hover:text-gold-light"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>

                      {!character.isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCharacter(character)}
                          className="inline-flex items-center gap-2 text-xs font-medium text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
