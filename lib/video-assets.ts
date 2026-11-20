export interface VideoAsset {
  id: string;
  projectId: string;
  episodeId: string;
  sceneId: string;
  fileName: string;
  mimeType: string;
  size: number;
  duration: number;
  createdAt: string;
  blob: Blob;
}

const DB_NAME = "kemmylabs-video-assets";
const STORE_NAME = "videos";

function openVideoDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Browser video storage is unavailable."));
      return;
    }

    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Unable to open video storage."));
  });
}

export async function saveVideoAsset(
  asset: VideoAsset,
): Promise<void> {
  const database = await openVideoDatabase();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");

      transaction.objectStore(STORE_NAME).put(asset);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(transaction.error ?? new Error("Unable to save video."));
      transaction.onabort = () =>
        reject(transaction.error ?? new Error("Video save was cancelled."));
    });
  } finally {
    database.close();
  }
}

export async function getVideoAssets(
  projectId: string,
  episodeId: string,
): Promise<VideoAsset[]> {
  const database = await openVideoDatabase();

  try {
    const assets = await new Promise<VideoAsset[]>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).getAll();

      request.onsuccess = () => resolve(request.result as VideoAsset[]);
      request.onerror = () =>
        reject(request.error ?? new Error("Unable to load videos."));
    });

    return assets.filter(
      (asset) =>
        asset.projectId === projectId &&
        asset.episodeId === episodeId,
    );
  } finally {
    database.close();
  }
}

export async function deleteVideoAsset(id: string): Promise<void> {
  const database = await openVideoDatabase();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");

      transaction.objectStore(STORE_NAME).delete(id);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(transaction.error ?? new Error("Unable to delete video."));
    });
  } finally {
    database.close();
  }
}
