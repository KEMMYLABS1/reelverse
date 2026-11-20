"use client";

import { useEffect, useRef, useState } from "react";
import {
  Film,
  Upload,
  Trash2,
  RefreshCw,
  Clock3,
  HardDrive,
  Play,
  ChevronUp,
  ChevronDown,
  Download,
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
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [timelineOrder, setTimelineOrder] = useState<string[]>([]);
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [timelinePlaying, setTimelinePlaying] = useState(false);
  const timelineVideoRef = useRef<HTMLVideoElement | null>(null);
  const [draggedClipId, setDraggedClipId] = useState<string | null>(null);
  const [dragOverClipId, setDragOverClipId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAssets() {
      try {
        const savedAssets = await getVideoAssets(project.id, episode.id);

          if (!active) return;
     
          setAssets(savedAssets);

        const orderKey = `kemmylabs-timeline-${project.id}-${episode.id}`;
        const savedOrder = localStorage.getItem(orderKey);

        let parsedOrder: string[] = [];

        try {
          parsedOrder = savedOrder ? JSON.parse(savedOrder) : [];
        } catch {
          parsedOrder = [];
        }

        const validSavedOrder = parsedOrder.filter((id) =>
          savedAssets.some((asset) => asset.id === id),
        );

        const missingAssets = savedAssets
          .filter((asset) => !validSavedOrder.includes(asset.id))
          .map((asset) => asset.id);

        setTimelineOrder([...validSavedOrder, ...missingAssets]);

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
      const orderedAssets = timelineOrder
      .map((id) => assets.find((asset) => asset.id === id))
      .filter((asset): asset is VideoAsset => Boolean(asset));

    function moveTimelineClip(index: number, direction: -1 | 1) {
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= orderedAssets.length) return;

      const updatedOrder = orderedAssets.map((asset) => asset.id);

      [updatedOrder[index], updatedOrder[targetIndex]] = [
        updatedOrder[targetIndex],
        updatedOrder[index],
      ]; 

      setTimelineOrder(updatedOrder);

      localStorage.setItem(
        `kemmylabs-timeline-${project.id}-${episode.id}`,
        JSON.stringify(updatedOrder),
      );

      setTimelineIndex(0);
      setTimelinePlaying(false);
    }
    function handleTimelineDrop(targetClipId: string) {
    if (!draggedClipId || draggedClipId === targetClipId) {
      setDraggedClipId(null);
      setDragOverClipId(null);
      return;
    }

    const updatedOrder = orderedAssets.map((asset) => asset.id);

    const draggedIndex = updatedOrder.indexOf(draggedClipId);
    const targetIndex = updatedOrder.indexOf(targetClipId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    updatedOrder.splice(draggedIndex, 1);
    updatedOrder.splice(targetIndex, 0, draggedClipId);

    setTimelineOrder(updatedOrder);

    localStorage.setItem(
      `kemmylabs-timeline-${project.id}-${episode.id}`,
      JSON.stringify(updatedOrder),
    );

    setTimelineIndex(0);
    setTimelinePlaying(false);
    setDraggedClipId(null);
    setDragOverClipId(null);
  }

  function playTimeline() {
    if (orderedAssets.length === 0) return;

    setTimelineIndex(0);
    setTimelinePlaying(true);
  }
    async function exportMovie() {
    if (orderedAssets.length === 0 || exporting) return;

    setError("");
    setSuccess("");
    setExporting(true);
    setExportProgress(0);

    let recorder: MediaRecorder | null = null;
    let video: HTMLVideoElement | null = null;
    let audioContext: AudioContext | null = null;
    let animationFrame = 0;
    let stream: MediaStream | null = null;
    const clipUrls: string[] = [];

    try {
      if (
        typeof MediaRecorder === "undefined" ||
        !HTMLCanvasElement.prototype.captureStream
      ) {
        throw new Error(
          "Movie export is not supported by this browser. Try the latest Chrome or Edge.",
        );
      }

      const mimeType = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
      ].find((type) => MediaRecorder.isTypeSupported(type));

      if (!mimeType) {
        throw new Error("This browser does not support WebM movie recording.");
      }

      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 720;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Unable to prepare the movie export canvas.");
      }

      context.fillStyle = "#000000";
      context.fillRect(0, 0, canvas.width, canvas.height);

      video = document.createElement("video");
      video.playsInline = true;
      video.preload = "auto";
      video.muted = false;

      stream = canvas.captureStream(30);

      // Include clip audio when Web Audio is available.
      try {
        audioContext = new AudioContext();
        const audioSource =
          audioContext.createMediaElementSource(video);
        const audioDestination =
          audioContext.createMediaStreamDestination();

        audioSource.connect(audioDestination);

        audioDestination.stream.getAudioTracks().forEach((track) => {
          stream?.addTrack(track);
        });

        await audioContext.resume();
      } catch {
        audioContext = null;
      }

      const drawFrame = () => {
        if (video && video.readyState >= 2) {
          context.fillStyle = "#000000";
          context.fillRect(0, 0, canvas.width, canvas.height);

          const scale = Math.min(
            canvas.width / video.videoWidth,
            canvas.height / video.videoHeight,
          );

          const width = video.videoWidth * scale;
          const height = video.videoHeight * scale;
          const x = (canvas.width - width) / 2;
          const y = (canvas.height - height) / 2;

          context.drawImage(video, x, y, width, height);
        }

        animationFrame = requestAnimationFrame(drawFrame);
      };

      animationFrame = requestAnimationFrame(drawFrame);

      const chunks: BlobPart[] = [];

      recorder = new MediaRecorder(stream, { mimeType });

      const recording = new Promise<Blob>((resolve, reject) => {
        recorder!.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        };

        recorder!.onerror = () => {
          reject(new Error("The browser encountered an error recording the movie."));
        };

        recorder!.onstop = () => {
          resolve(new Blob(chunks, { type: mimeType }));
        };
      });

      recorder.start(1000);

      for (let index = 0; index < orderedAssets.length; index += 1) {
        const asset = orderedAssets[index];
        const clipUrl = URL.createObjectURL(asset.blob);
        clipUrls.push(clipUrl);

        await new Promise<void>((resolve, reject) => {
          if (!video) {
            reject(new Error("Movie video player is unavailable."));
            return;
          }

          video.onended = () => resolve();
          video.onerror = () => {
            reject(new Error(`Unable to read clip: ${asset.fileName}`));
          };

          video.onloadeddata = () => {
            void video?.play().catch(() => {
              reject(new Error(`Unable to play clip: ${asset.fileName}`));
            });
          };

          video.src = clipUrl;
          video.load();
        });

        setExportProgress(
          Math.round(((index + 1) / orderedAssets.length) * 100),
        );
      }

      recorder.stop();

      const movieBlob = await recording;

      if (movieBlob.size === 0) {
        throw new Error("The exported movie is empty. Please try again.");
      }

      const downloadUrl = URL.createObjectURL(movieBlob);
      const link = document.createElement("a");
      const safeName = `${project.title}-${episode.title}`
        .replace(/[^a-z0-9-_]+/gi, "-")
        .replace(/^-|-$/g, "");

      link.href = downloadUrl;
      link.download = `${safeName || "movie"}.webm`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(downloadUrl);

      setSuccess("Your movie has been exported and downloaded.");
    } catch (exportError) {
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      }

      setError(
        exportError instanceof Error
          ? exportError.message
          : "Unable to export the movie.",
      );
    } finally {
      cancelAnimationFrame(animationFrame);

      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }

      clipUrls.forEach((url) => URL.revokeObjectURL(url));

      stream?.getTracks().forEach((track) => track.stop());

      if (audioContext && audioContext.state !== "closed") {
        await audioContext.close();
      }

      setExporting(false);
    }
  }
  useEffect(() => {
  if (!timelinePlaying) return;

  const video = timelineVideoRef.current;

  if (video) {
    void video.play().catch(() => {
      setTimelinePlaying(false);
      setError("Unable to play the next timeline clip.");
    });
  }
}, [timelinePlaying, timelineIndex]);

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

          <div className="space-y-4 rounded-xl border border-border bg-background p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">Movie Timeline</h3>
                <p className="text-xs text-muted">
                  Arrange your scene clips in movie playback order.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={playTimeline}
                  disabled={orderedAssets.length === 0 || exporting}
                  className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-black disabled:opacity-40"
                >
                  <Play size={16} />
                  Play Movie
                </button>

                <button
                  type="button"
                  onClick={() => void exportMovie()}
                  disabled={orderedAssets.length === 0 || exporting}
                  className="inline-flex items-center gap-2 rounded-lg border border-gold px-4 py-2 text-sm font-semibold text-gold disabled:opacity-40"
                >
                  {exporting ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  {exporting ? `Exporting ${exportProgress}%` : "Export Movie"}
                </button>
              </div>
            </div>

            {exporting && (
              <div className="space-y-2">
                <div className="h-2 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-gold transition-all"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted">
                  Keep this tab open while your movie is being exported.
                </p>
              </div>
            )}

            {orderedAssets.length === 0 ? (
              <p className="py-5 text-center text-sm text-muted">
                Upload scene videos to build your movie timeline.
              </p>
            ) : (
              <div className="space-y-2">
                {orderedAssets.map((asset, index) => {
                  return (
                    <div
                      key={asset.id}
                      draggable
                      onDragStart={(event) => {
                        setDraggedClipId(asset.id);
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", asset.id);
                      }}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragOverClipId(asset.id);
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        handleTimelineDrop(asset.id);
                      }}
                      onDragEnd={() => {
                        setDraggedClipId(null);
                        setDragOverClipId(null);
                      }}
                      className={`flex cursor-grab items-center gap-3 rounded-lg border p-3 ${
                        dragOverClipId === asset.id
                          ? "border-gold bg-gold/10"
                          : "border-border"
                      } ${draggedClipId === asset.id ? "opacity-40" : ""}`}
                    >
                      <button
                        type="button"
                        onClick={() => moveTimelineClip(index, -1)}
                        disabled={index === 0}
                        className="rounded-md p-2 text-muted hover:text-gold disabled:opacity-30"
                        aria-label="Move clip up"
                      >
                        <ChevronUp size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => moveTimelineClip(index, 1)}
                        disabled={index === orderedAssets.length - 1}
                        className="rounded-md p-2 text-muted hover:text-gold disabled:opacity-30"
                        aria-label="Move clip down"
                      >
                        <ChevronDown size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
                {orderedAssets.length > 0 && (
            <div className="space-y-3 rounded-xl border border-border bg-black p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-white">Movie Preview</h3>

                <span className="text-xs text-gray-400">
                  Clip {timelineIndex + 1} of {orderedAssets.length}
                </span>
              </div>

              <video
                ref={timelineVideoRef}
                key={orderedAssets[timelineIndex]?.id}
                src={previewUrls[orderedAssets[timelineIndex]?.id]}
                controls
                playsInline
                preload="metadata"
                className="max-h-[480px] w-full rounded-lg object-contain"
                onEnded={() => {
                  if (timelineIndex < orderedAssets.length - 1) {
                    setTimelineIndex((current) => current + 1);
                  } else {
                    setTimelinePlaying(false);
                    setTimelineIndex(0);
                  }
                }}
                onPause={() => setTimelinePlaying(false)}
              />
            </div>
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
        </div>      ) : (
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
                  <p className="flex flex-wrap gap-3 text-xs text-muted">                    Scene {scene.sceneNumber}
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
