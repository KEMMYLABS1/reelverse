
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


// Character reference image storage

const CHARACTER_IMAGES_DB = "kemmylabs-character-images";
const CHARACTER_IMAGES_STORE = "reference-images";

const MAX_REFERENCE_IMAGE_SIZE = 10 * 1024 * 1024;

export interface StoredCharacterImage {
  id: string;
  characterId: string;
  blob: Blob;
  name: string;
  type: string;
  createdAt: string;
}

function openCharacterImagesDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isBrowser() || !window.indexedDB) {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }

    const request = window.indexedDB.open(
      CHARACTER_IMAGES_DB,
      1,
    );

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(CHARACTER_IMAGES_STORE)) {
        const store = database.createObjectStore(
          CHARACTER_IMAGES_STORE,
          { keyPath: "id" },
        );

        store.createIndex("characterId", "characterId", {
          unique: false,
        });
      }
    };

    request.onsuccess = () => resolve(request.result);

    request.onerror = () => {
      reject(
        request.error ?? new Error("Unable to open image storage."),
      );
    };
  });
}

export async function saveCharacterReferenceImage(
  characterId: string,
  file: File,
): Promise<string> {
  const character = getCharacterById(characterId);

  if (!character) {
    throw new Error("Character could not be found.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Please select a valid image file.");
  }

  if (file.size > MAX_REFERENCE_IMAGE_SIZE) {
    throw new Error("Image must not exceed 10 MB.");
  }

  const database = await openCharacterImagesDatabase();

  const image: StoredCharacterImage = {
    id: crypto.randomUUID(),
    characterId,
    blob: file,
    name: file.name,
    type: file.type,
    createdAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      CHARACTER_IMAGES_STORE,
      "readwrite",
    );

    transaction.objectStore(CHARACTER_IMAGES_STORE).add(image);

    transaction.oncomplete = () => {
      database.close();
      resolve(image.id);
    };

    transaction.onerror = () => {
      database.close();
      reject(
        transaction.error ?? new Error("Unable to save reference image."),
      );
    };

    transaction.onabort = () => {
      database.close();
      reject(
        transaction.error ?? new Error("Image storage transaction aborted."),
      );
    };
  });
}

export async function getCharacterReferenceImages(
  characterId: string,
): Promise<StoredCharacterImage[]> {
  const database = await openCharacterImagesDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      CHARACTER_IMAGES_STORE,
      "readonly",
    );

    const index = transaction
      .objectStore(CHARACTER_IMAGES_STORE)
      .index("characterId");

    const request = index.getAll(characterId);

    request.onsuccess = () => {
      resolve(request.result as StoredCharacterImage[]);
    };

    request.onerror = () => {
      reject(
        request.error ?? new Error("Unable to load reference images."),
      );
    };

    transaction.oncomplete = () => database.close();

    transaction.onerror = () => {
      database.close();
      reject(
        transaction.error ?? new Error("Unable to read reference images."),
      );
    };
  });
}

export async function deleteCharacterReferenceImage(
  imageId: string,
): Promise<void> {
  const database = await openCharacterImagesDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      CHARACTER_IMAGES_STORE,
      "readwrite",
    );

    transaction.objectStore(CHARACTER_IMAGES_STORE).delete(imageId);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };

    transaction.onerror = () => {
      database.close();
      reject(
        transaction.error ?? new Error("Unable to delete reference image."),
      );
    };

    transaction.onabort = () => {
      database.close();
      reject(
        transaction.error ?? new Error("Image deletion was aborted."),
      );
    };
  });
}

