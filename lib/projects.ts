
import type {
  CreateProjectInput,
  Project,
  StoryBrief,
} from "@/types/project";

const PROJECTS_STORAGE_KEY = "reelverse-studio-projects";

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

export function saveProjects(projects: Project[]): void {
  if (!isBrowser()) return;

  localStorage.setItem(
    PROJECTS_STORAGE_KEY,
    JSON.stringify(projects),
  );
}

export function deleteProject(projectId: string): void {
  const projects = getProjects();

  const updatedProjects = projects.filter(
    (project) => project.id !== projectId,
  );

  saveProjects(updatedProjects);
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

  if (projectIndex === -1) {
    return null;
  }

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

export function updateProjectStoryBrief(
  projectId: string,
  storyBrief: StoryBrief,
): Project | null {
  const projects = getProjects();

  const projectIndex = projects.findIndex(
    (project) => project.id === projectId,
  );

  if (projectIndex === -1) {
    return null;
  }

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
