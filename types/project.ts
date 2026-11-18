
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

export type ProjectGenre =
  | "drama"
  | "romance"
  | "comedy"
  | "thriller"
  | "historical"
  | "documentary"
  | "educational"
  | "lifestyle"
  | "other";

export interface StoryBrief {
  concept: string;
  genre: ProjectGenre | "";
  logline: string;
  synopsis: string;
  setting: string;
  creativeDirection: string;
  targetAudience: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  storyBrief?: StoryBrief;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  title: string;
  description: string;
  type: ProjectType;
}
