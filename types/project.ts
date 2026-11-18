
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
  episodes?: ScriptEpisode[];
  createdAt: string;
  updatedAt: string;
}


export interface CreateProjectInput {
  title: string;
  description: string;
  type: ProjectType;
}

export type ScriptStatus =
  | "draft"
  | "in_progress"
  | "review"
  | "completed";

export interface DialogueLine {
  id: string;
  characterName: string;
  dialogue: string;
  delivery?: string;
}

export interface ScriptScene {
  id: string;
  sceneNumber: number;
  title: string;
  location: string;
  timeOfDay: string;
  visualDescription: string;
  action: string;
  dialogue: DialogueLine[];
  notes: string;
}

export interface ScriptEpisode {
  id: string;
  episodeNumber: number;
  title: string;
  summary: string;
  status: ScriptStatus;
  scenes: ScriptScene[];
  createdAt: string;
  updatedAt: string;
}
