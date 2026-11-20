
import type {
  CreateProjectInput,
  Project,
  StoryBrief,
  ScriptEpisode,
  ScriptScene,
} from "@/types/project";

const PROJECTS_STORAGE_KEY = "reelverse-studio-projects";

// ==========================================
// Storage
// ==========================================

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getProjects(): Project[] {
  if (!isBrowser()) return [];

  try {
    const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);

    if (!storedProjects) return [];

    const parsed: unknown = JSON.parse(storedProjects);

    if (!Array.isArray(parsed)) return [];

    return parsed as Project[];
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]): void {
  if (!isBrowser()) return;

  localStorage.setItem(
    PROJECTS_STORAGE_KEY,
    JSON.stringify(projects),
  );
}

// ==========================================
// Project Management
// ==========================================

export function createProject(input: CreateProjectInput): Project {
  const now = new Date().toISOString();

  const project: Project = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    description: input.description.trim(),
    type: input.type,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };

  const projects = getProjects();

  saveProjects([project, ...projects]);

  return project;
}

export function updateProject(
  projectId: string,
  updates: Partial<
    Pick<Project, "title" | "description" | "type" | "status">
  >,
): Project | null {
  const projects = getProjects();

  const projectIndex = projects.findIndex(
    (project) => project.id === projectId,
  );

  if (projectIndex === -1) return null;

  const currentProject = projects[projectIndex];

  const updatedProject: Project = {
    ...currentProject,
    ...updates,
    title: updates.title?.trim() ?? currentProject.title,
    description:
      updates.description?.trim() ?? currentProject.description,
    updatedAt: new Date().toISOString(),
  };

  const updatedProjects = [...projects];
  updatedProjects[projectIndex] = updatedProject;

  saveProjects(updatedProjects);

  return updatedProject;
}

export function deleteProject(projectId: string): void {
  const projects = getProjects();

  const updatedProjects = projects.filter(
    (project) => project.id !== projectId,
  );

  saveProjects(updatedProjects);
}

// ==========================================
// Story Brief Management
// ==========================================

export function updateProjectStoryBrief(
  projectId: string,
  storyBrief: StoryBrief,
): Project | null {
  const projects = getProjects();

  const projectIndex = projects.findIndex(
    (project) => project.id === projectId,
  );

  if (projectIndex === -1) return null;

  const updatedProject: Project = {
    ...projects[projectIndex],
    storyBrief,
    updatedAt: new Date().toISOString(),
  };

  const updatedProjects = [...projects];
  updatedProjects[projectIndex] = updatedProject;

  saveProjects(updatedProjects);

  return updatedProject;
}

// ==========================================
// Episode Management
// ==========================================

export function createEpisode(
  projectId: string,
  title: string,
  summary: string,
): ScriptEpisode | null {
  const projects = getProjects();

  const projectIndex = projects.findIndex(
    (project) => project.id === projectId,
  );

  if (projectIndex === -1) return null;

  const project = projects[projectIndex];
  const now = new Date().toISOString();

  const episode: ScriptEpisode = {
    id: crypto.randomUUID(),
    episodeNumber: (project.episodes?.length ?? 0) + 1,
    title: title.trim(),
    summary: summary.trim(),
    status: "draft",
    scenes: [],
    createdAt: now,
    updatedAt: now,
  };

  const updatedProject: Project = {
    ...project,
    episodes: [...(project.episodes ?? []), episode],
    updatedAt: now,
  };

  const updatedProjects = [...projects];
  updatedProjects[projectIndex] = updatedProject;

  saveProjects(updatedProjects);

  return episode;
}

export function updateEpisode(
  projectId: string,
  episodeId: string,
  updates: Partial<
    Pick<ScriptEpisode, "title" | "summary" | "status">
  >,
): ScriptEpisode | null {
  const projects = getProjects();

  const projectIndex = projects.findIndex(
    (project) => project.id === projectId,
  );

  if (projectIndex === -1) return null;

  const project = projects[projectIndex];
  const episodes = [...(project.episodes ?? [])];

  const episodeIndex = episodes.findIndex(
    (episode) => episode.id === episodeId,
  );

  if (episodeIndex === -1) return null;

  const currentEpisode = episodes[episodeIndex];
  const now = new Date().toISOString();

  const updatedEpisode: ScriptEpisode = {
    ...currentEpisode,
    ...updates,
    title: updates.title?.trim() ?? currentEpisode.title,
    summary: updates.summary?.trim() ?? currentEpisode.summary,
    updatedAt: now,
  };

  episodes[episodeIndex] = updatedEpisode;

  const updatedProjects = [...projects];
  updatedProjects[projectIndex] = {
    ...project,
    episodes,
    updatedAt: now,
  };

  saveProjects(updatedProjects);

  return updatedEpisode;
}

export function deleteEpisode(
  projectId: string,
  episodeId: string,
): boolean {
  const projects = getProjects();

  const projectIndex = projects.findIndex(
    (project) => project.id === projectId,
  );

  if (projectIndex === -1) return false;

  const project = projects[projectIndex];

  const episodes = (project.episodes ?? []).filter(
    (episode) => episode.id !== episodeId,
  );

  if (episodes.length === (project.episodes ?? []).length) {
    return false;
  }

  const now = new Date().toISOString();

  const updatedEpisodes = episodes.map((episode, index) => ({
    ...episode,
    episodeNumber: index + 1,
  }));

  const updatedProjects = [...projects];

  updatedProjects[projectIndex] = {
    ...project,
    episodes: updatedEpisodes,
    updatedAt: now,
  };

  saveProjects(updatedProjects);

  return true;
}

// ==========================================
// Scene Management
// ==========================================

export function createScene(
  projectId: string,
  episodeId: string,
  input: Omit<ScriptScene, "id" | "sceneNumber">,
): ScriptScene | null {
  const projects = getProjects();

  const projectIndex = projects.findIndex(
    (project) => project.id === projectId,
  );

  if (projectIndex === -1) return null;

  const project = projects[projectIndex];
  const episodes = [...(project.episodes ?? [])];

  const episodeIndex = episodes.findIndex(
    (episode) => episode.id === episodeId,
  );

  if (episodeIndex === -1) return null;

  const episode = episodes[episodeIndex];
  const now = new Date().toISOString();

  const scene: ScriptScene = {
    ...input,
    id: crypto.randomUUID(),
    sceneNumber: episode.scenes.length + 1,
  };

  episodes[episodeIndex] = {
    ...episode,
    scenes: [...episode.scenes, scene],
    updatedAt: now,
  };

  const updatedProjects = [...projects];

  updatedProjects[projectIndex] = {
    ...project,
    episodes,
    updatedAt: now,
  };

  saveProjects(updatedProjects);

  return scene;
}

export function updateScene(
  projectId: string,
  episodeId: string,
  sceneId: string,
  updates: Partial<Omit<ScriptScene, "id" | "sceneNumber">>,
): ScriptScene | null {
  const projects = getProjects();

  const projectIndex = projects.findIndex(
    (project) => project.id === projectId,
  );

  if (projectIndex === -1) return null;

  const project = projects[projectIndex];
  const episodes = [...(project.episodes ?? [])];

  const episodeIndex = episodes.findIndex(
    (episode) => episode.id === episodeId,
  );

  if (episodeIndex === -1) return null;

  const episode = episodes[episodeIndex];
  const scenes = [...episode.scenes];

  const sceneIndex = scenes.findIndex(
    (scene) => scene.id === sceneId,
  );

  if (sceneIndex === -1) return null;

  const currentScene = scenes[sceneIndex];

  scenes[sceneIndex] = {
    ...currentScene,
    ...updates,
    id: currentScene.id,
    sceneNumber: currentScene.sceneNumber,
  };

  const now = new Date().toISOString();

  episodes[episodeIndex] = {
    ...episode,
    scenes,
    updatedAt: now,
  };

  const updatedProjects = [...projects];

  updatedProjects[projectIndex] = {
    ...project,
    episodes,
    updatedAt: now,
  };

  saveProjects(updatedProjects);

  return scenes[sceneIndex];
}

export function deleteScene(
  projectId: string,
  episodeId: string,
  sceneId: string,
): boolean {
  const projects = getProjects();

  const projectIndex = projects.findIndex(
    (project) => project.id === projectId,
  );

  if (projectIndex === -1) return false;

  const project = projects[projectIndex];
  const episodes = [...(project.episodes ?? [])];

  const episodeIndex = episodes.findIndex(
    (episode) => episode.id === episodeId,
  );

  if (episodeIndex === -1) return false;

  const episode = episodes[episodeIndex];

  const scenes = episode.scenes.filter(
    (scene) => scene.id !== sceneId,
  );

  if (scenes.length === episode.scenes.length) return false;

  const now = new Date().toISOString();

  const updatedScenes = scenes.map((scene, index) => ({
    ...scene,
    sceneNumber: index + 1,
  }));

  episodes[episodeIndex] = {
    ...episode,
    scenes: updatedScenes,
    updatedAt: now,
  };

  const updatedProjects = [...projects];

  updatedProjects[projectIndex] = {
    ...project,
    episodes,
    updatedAt: now,
  };

  saveProjects(updatedProjects);

  return true;
}

// ==========================================
// Generated Story Package Approval
// ==========================================

export function approveStoryPackage(
  projectId: string,
  storyBrief: StoryBrief,
  episodeOutlines: Array<{ title: string; summary: string }>,
): Project | null {
  const projects = getProjects();

  const projectIndex = projects.findIndex(
    (project) => project.id === projectId,
  );

  if (projectIndex === -1) return null;
  if (episodeOutlines.length === 0) return null;

  const project = projects[projectIndex];
  const now = new Date().toISOString();

  const existingEpisodes = project.episodes ?? [];

  const newEpisodes: ScriptEpisode[] = episodeOutlines.map(
    (outline, index) => ({
      id: crypto.randomUUID(),
      episodeNumber: existingEpisodes.length + index + 1,
      title: outline.title.trim(),
      summary: outline.summary.trim(),
      status: "draft",
      scenes: [],
      createdAt: now,
      updatedAt: now,
    }),
  );

  const updatedProject: Project = {
    ...project,
    storyBrief,
    episodes: [...existingEpisodes, ...newEpisodes],
    updatedAt: now,
  };

  const updatedProjects = [...projects];
  updatedProjects[projectIndex] = updatedProject;

  saveProjects(updatedProjects);

  return updatedProject;
}
