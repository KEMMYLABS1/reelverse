
import type { CharacterProfile } from "@/types/project";

const CHARACTERS_STORAGE_KEY = "kemmylabs-studio-characters";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getCharacters(): CharacterProfile[] {
  if (!isBrowser()) return [];

  try {
    const storedCharacters = localStorage.getItem(
      CHARACTERS_STORAGE_KEY,
    );

    if (!storedCharacters) return [];

    const parsed: unknown = JSON.parse(storedCharacters);

    if (!Array.isArray(parsed)) return [];

    return parsed as CharacterProfile[];
  } catch {
    return [];
  }
}

function saveCharacters(characters: CharacterProfile[]): void {
  if (!isBrowser()) return;

  localStorage.setItem(
    CHARACTERS_STORAGE_KEY,
    JSON.stringify(characters),
  );
}

export function getCharacterById(
  characterId: string,
): CharacterProfile | null {
  return (
    getCharacters().find(
      (character) => character.id === characterId,
    ) ?? null
  );
}

export function createCharacter(
  input: Omit<
    CharacterProfile,
    "id" | "createdAt" | "updatedAt"
  >,
): CharacterProfile {
  const characters = getCharacters();

  if (input.isPrimary && characters.some((item) => item.isPrimary)) {
    throw new Error("A primary character already exists.");
  }

  const now = new Date().toISOString();

  const character: CharacterProfile = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  saveCharacters([...characters, character]);

  return character;
}

export function updateCharacter(
  characterId: string,
  updates: Partial<
    Omit<
      CharacterProfile,
      "id" | "createdAt" | "updatedAt"
    >
  >,
): CharacterProfile | null {
  const characters = getCharacters();

  const characterIndex = characters.findIndex(
    (character) => character.id === characterId,
  );

  if (characterIndex === -1) return null;

  const currentCharacter = characters[characterIndex];
if (
  updates.isPrimary === true &&
  characters.some(
    (character) =>
      character.id !== characterId && character.isPrimary,
  )
) {
  throw new Error("A primary character already exists.");
}

if (
  updates.role === "primary" &&
  updates.isPrimary === false
) {
  throw new Error(
    "A character with the primary role must be designated as primary.",
  );
}

if (
  updates.isPrimary === true &&
  updates.role !== undefined &&
  updates.role !== "primary"
) {
  throw new Error(
    "A primary character must have the primary role.",
  );
}

  const updatedCharacter: CharacterProfile = {
    ...currentCharacter,
    ...updates,
    id: currentCharacter.id,
    createdAt: currentCharacter.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const updatedCharacters = [...characters];
  updatedCharacters[characterIndex] = updatedCharacter;

  saveCharacters(updatedCharacters);

  return updatedCharacter;
}

export function deleteCharacter(characterId: string): boolean {
  const characters = getCharacters();

  const character = characters.find(
    (item) => item.id === characterId,
  );

  if (!character || character.isPrimary) return false;

  const updatedCharacters = characters.filter(
    (item) => item.id !== characterId,
  );

  saveCharacters(updatedCharacters);

  return true;
}

export function assignCharacterToProject(
  characterId: string,
  projectId: string,
): CharacterProfile | null {
  const character = getCharacterById(characterId);

  if (!character) return null;

  if (character.projectIds.includes(projectId)) {
    return character;
  }

  return updateCharacter(characterId, {
    projectIds: [...character.projectIds, projectId],
  });
}

export function removeCharacterFromProject(
  characterId: string,
  projectId: string,
): CharacterProfile | null {
  const character = getCharacterById(characterId);

  if (!character) return null;

  return updateCharacter(characterId, {
    projectIds: character.projectIds.filter(
      (id) => id !== projectId,
    ),
  });
}
