
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


export type CharacterRole =
  | "primary"
  | "supporting"
  | "background"
  | "narrator";

export type CharacterOrigin =
  | "real_person"
  | "ai_generated";

export interface CharacterLook {
  id: string;
  name: string;
  outfit: string;
  hairstyle: string;
  description: string;
  notes: string;
}

export interface CharacterProfile {
  id: string;
  name: string;
  role: CharacterRole;
  origin: CharacterOrigin;
  description: string;
  appearance: string;
  personality: string;
  voiceDescription: string;
  referenceImages: string[];
  looks: CharacterLook[];
  projectIds: string[];
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
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
