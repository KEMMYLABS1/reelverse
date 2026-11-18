
export type ProjectType =
  | "drama"
  | "documentary"
  | "cooking"
  | "short_film"
  | "other";

export type ProjectStatus =
  | "draft"
  | "in_progress"
  | "completed"
  | "archived";

export interface Project {
  id: string;
  title: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  title: string;
  description: string;
  type: ProjectType;
}
