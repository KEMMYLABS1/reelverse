
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  UsersRound,
  UserRound,
  Mic2,
  Sparkles,
} from "lucide-react";

import { StudioSidebar } from "@/components/layout/studio-sidebar";
import { StudioHeader } from "@/components/layout/studio-header";
import {
  createCharacter,
  getCharacters,
} from "@/lib/characters";
import type {
  CharacterProfile,
  CharacterRole,
  CharacterOrigin,
} from "@/types/project";

export default function CharacterLibraryPage() {
  const [characters, setCharacters] = useState<CharacterProfile[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [role, setRole] = useState<CharacterRole>("supporting");
  const [origin, setOrigin] = useState<CharacterOrigin>("ai_generated");
  const [description, setDescription] = useState("");
  const [appearance, setAppearance] = useState("");
  const [personality, setPersonality] = useState("");
  const [voiceDescription, setVoiceDescription] = useState("");

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

  function handleCreateCharacter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      const character = createCharacter({
        name: name.trim(),
        role,
        origin,
        description: description.trim(),
        appearance: appearance.trim(),
        personality: personality.trim(),
        voiceDescription: voiceDescription.trim(),
        referenceImages: [],
        looks: [],
        projectIds: [],
        isPrimary: role === "primary",
      });

      setCharacters((current) => [...current, character]);

      setName("");
      setRole("supporting");
      setOrigin("ai_generated");
      setDescription("");
      setAppearance("");
      setPersonality("");
      setVoiceDescription("");
      setShowForm(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create character. Please try again.",
      );
    }
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
                onClick={() => {
                  setShowForm((current) => !current);
                  setError("");
                }}
                className="inline-flex w-fit items-center gap-2 rounded-lg bg-gold px-5 py-3 text-sm font-semibold text-background transition-colors hover:bg-gold-light"
              >
                <Plus size={17} />
                Create character
              </button>
            </div>
          </section>

          {showForm && (
            <section className="rounded-xl border border-gold/30 bg-surface p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold">
                  Create a character profile
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Define the identity and creative details of this character.
                </p>
              </div>

              <form onSubmit={handleCreateCharacter} className="space-y-5">
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
                      onChange={(event) =>
                        setRole(event.target.value as CharacterRole)
                      }
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
                    >
                      <option value="primary" disabled={Boolean(primaryCharacter)}>
                        Primary Character
                      </option>
                      <option value="supporting">Supporting Character</option>
                      <option value="background">Background Character</option>
                      <option value="narrator">Narrator</option>
                    </select>
                    {primaryCharacter && (
                      <p className="mt-2 text-xs text-muted">
                        A Primary Character already exists.
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
                    Save character
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-lg border border-border px-5 py-3 text-sm text-muted transition-colors hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>
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

                    <p className="mt-1 text-xs text-muted">
                      {character.role.replace("_", " ")} ·{" "}
                      {character.origin === "real_person"
                        ? "Real person"
                        : "AI-generated"}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-muted">
                      {character.description || "No description added yet."}
                    </p>

                    {character.voiceDescription && (
                      <div className="mt-4 flex items-start gap-2 border-t border-border pt-4 text-xs text-muted">
                        <Mic2 size={15} className="shrink-0 text-gold" />
                        {character.voiceDescription}
                      </div>
                    )}
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
