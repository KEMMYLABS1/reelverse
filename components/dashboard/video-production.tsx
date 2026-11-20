"use client";

import { useEffect, useRef, useState } from "react";
import {
  Film,
  Upload,
  Trash2,
  RefreshCw,
  Clock3,
  HardDrive,
} from "lucide-react";

import {
  deleteVideoAsset,
  getVideoAssets,
  saveVideoAsset,
  type VideoAsset,
} from "@/lib/video-assets";

import type { Project, ScriptEpisode } from "@/types/project";

interface VideoProductionProps {
  project: Project;
  episode: ScriptEpisode;
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${(bytes / 1024).toFixed(0)} KB`;
}

function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");

    video.preload = "metadata";

    video.onloadedmetadata = () => {
      const duration = video.duration;
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(duration) ? duration : 0);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to read this video file."));
    };

    video.src = url;
  });
}

export function VideoProduction({
  project,
  episode,
}: VideoProductionProps) {
  const [assets, setAssets] = useState<VideoAsset[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [uploadingScene, setUploadingScene] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    let active = true;

    async function loadAssets() {
      try {
        const savedAssets = await getVideoAssets(project.id, episode.id);

        if (!active) return;

        setAssets(savedAssets);

        const urls: Record<string, string> = {};

        savedAssets.forEach((asset) => {
          urls[asset.id] = URL.createObjectURL(asset.blob);
        });

        setPreviewUrls(urls);
      } catch {
        if (active) setError("Unable to load saved video clips.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadAssets();

    return () => {
      active = false;
      Object.values(previewUrls).forEach((url) =>
        URL.revokeObjectURL(url),
      );
    };
    // Load once for this project and episode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id, episode.id]);

  async function handleUpload(
    sceneId: string,
    file: File | undefined,
  ) {
    if (!file) return;

    setError("");
    setSuccess("");

    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file.");
      return;
    }

    const maxSize = 500 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("Video files must be 500 MB or smaller.");
      return;
    }

    setUploadingScene(sceneId);

    try {
      const duration = await readVideoDuration(file);
      const previousAsset = assets.find(
        (asset) => asset.sceneId === sceneId,
      );

      const asset: VideoAsset = {
        id: crypto.randomUUID(),
        projectId: project.id,
        episodeId: episode.id,
        sceneId,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        duration,
        createdAt: new Date().toISOString(),
        blob: file,
      };

      await saveVideoAsset(asset);

      if (previousAsset) {
        await deleteVideoAsset(previousAsset.id);
      }

      setAssets((current) => [
        ...current.filter((item) => item.sceneId !== sceneId),
        asset,
      ]);

      setPreviewUrls((current) => {
        const updated = { ...current };

        if (previousAsset) {
          URL.revokeObjectURL(updated[previousAsset.id]);
          delete updated[previousAsset.id];
        }

        updated[asset.id] = URL.createObjectURL(file);
        return updated;
      });

      setSuccess(`Video saved for ${file.name}.`);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to save this video.",
      );
    } finally {
      setUploadingScene(null);

      const input = inputRefs.current[sceneId];
      if (input) input.value = "";
    }
  }

  async function handleDelete(asset: VideoAsset) {
    if (!window.confirm(`Remove ${asset.fileName} from this scene?`)) {
      return;
    }

    try {
      await deleteVideoAsset(asset.id);

      setAssets((current) =>
        current.filter((item) => item.id !== asset.id),
      );

      setPreviewUrls((current) => {
        const updated = { ...current };

        if (updated[asset.id]) {
          URL.revokeObjectURL(updated[asset.id]);
          delete updated[asset.id];
        }

        return updated;
      });

      setSuccess("Video clip removed.");
      setError("");
    } catch {
      setError("Unable to remove this video clip.");
    }
  }

  const totalDuration = assets.reduce(
    (total, asset) => total + asset.duration,
    0,
  );

  const totalSize = assets.reduce(
    (total, asset) => total + asset.size,
    0,
  );

  return (
    <section className="space-y-6 rounded-2xl border border-border bg-surface p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-gold">
            <Film size={16} />
            Video Production
          </div>

          <h2 className="mt-3 text-2xl font-semibold">
            Scene Video Assets
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Upload and manage the video footage for each scene.
            Your clips are saved in this browser.
          </p>
        </div>

        <span className="rounded-full border border-border px-3 py-1.5 text-xs text-gold">
          {assets.length} / {episode.scenes.length} clips
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-xs text-muted">Uploaded clips</p>
          <p className="mt-2 text-xl font-semibold">{assets.length}</p>
        </div>

        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-xs text-muted">Total footage</p>
          <p className="mt-2 flex items-center gap-2 text-xl font-semibold">
            <Clock3 size={17} className="text-gold" />
            {formatDuration(totalDuration)}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-xs text-muted">Storage used</p>
          <p className="mt-2 flex items-center gap-2 text-xl font-semibold">
            <HardDrive size={17} className="text-gold" />
            {formatSize(totalSize)}
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {success && (
        <p className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">
          {success}
        </p>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-muted">
          Loading video assets...
        </p>
      ) : episode.scenes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <Film size={28} className="mx-auto text-muted" />
          <p className="mt-3 text-sm text-muted">
            Generate or add scenes before uploading video footage.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {episode.scenes.map((scene) => {
            const asset = assets.find(
              (item) => item.sceneId === scene.id,
            );

            return (
              <article
                key={scene.id}
                className="grid gap-4 rounded-xl border border-border bg-background p-4 md:grid-cols-[1fr_1.2fr]"
              >
                <div className="space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gold">
                      Scene {scene.sceneNumber}
                    </p>
                    <h3 className="mt-1 font-semibold">
                      {scene.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted">
                      {scene.location || "Location not specified"}
                    </p>
                  </div>

                  {asset ? (
                    <div className="space-y-2">
                      <p className="break-all text-xs text-muted">
                        {asset.fileName}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted">
                        <span>{formatDuration(asset.duration)}</span>
                        <span>{formatSize(asset.size)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(asset)}
                        className="inline-flex items-center gap-2 text-xs text-red-400 transition hover:text-red-300"
                      >
                        <Trash2 size={14} />
                        Remove clip
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted">
                      No video uploaded for this scene.
                    </p>
                  )}

                  <input
                    ref={(element) => {
                      inputRefs.current[scene.id] = element;
                    }}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/*"
                    className="hidden"
                    onChange={(event) =>
                      void handleUpload(
                        scene.id,
                        event.target.files?.[0],
                      )
                    }
                  />

                  <button
                    type="button"
                    disabled={uploadingScene === scene.id}
                    onClick={() =>
                      inputRefs.current[scene.id]?.click()
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
                  >
                    {uploadingScene === scene.id ? (
                      <RefreshCw size={15} className="animate-spin" />
                    ) : asset ? (
                      <RefreshCw size={15} />
                    ) : (
                      <Upload size={15} />
                    )}
                    {uploadingScene === scene.id
                      ? "Saving..."
                      : asset
                        ? "Replace Video"
                        : "Upload Video"}
                  </button>
                </div>

                <div className="flex min-h-44 items-center justify-center overflow-hidden rounded-lg border border-border bg-black">
                  {asset && previewUrls[asset.id] ? (
                    <video
                      key={asset.id}
                      src={previewUrls[asset.id]}
                      controls
                      preload="metadata"
                      className="max-h-72 w-full object-contain"
                    >
                      Your browser does not support video playback.
                    </video>
                  ) : (
                    <div className="text-center text-muted">
                      <Film size={30} className="mx-auto opacity-50" />
                      <p className="mt-2 text-xs">
                        Video preview will appear here
                      </p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="text-xs leading-5 text-muted">
        Video files are stored locally in this browser. Keep a separate
        backup of important footage. Clearing browser site data may
        permanently remove locally stored clips.
      </p>
    </section>
  );
}
