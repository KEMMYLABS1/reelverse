import type { ProjectGenre, StoryBrief } from "@/types/project";

export interface GeneratedEpisodeOutline {
  title: string;
  summary: string;
}

export interface GeneratedStoryPackage {
  brief: StoryBrief;
  episodes: GeneratedEpisodeOutline[];
}

const storyBeats = [
  {
    title: "The Beginning",
    focus: "Introduce the world, the main characters and the situation that changes their lives.",
  },
  {
    title: "The First Challenge",
    focus: "The central characters face their first serious obstacle and discover that the situation is more complicated than expected.",
  },
  {
    title: "Hidden Truths",
    focus: "New information emerges, relationships are tested and an important secret begins to surface.",
  },
  {
    title: "Rising Tension",
    focus: "The consequences of earlier decisions grow. Conflicts deepen and the characters are forced to make difficult choices.",
  },
  {
    title: "A Turning Point",
    focus: "An unexpected event changes the direction of the story and forces the characters to reconsider their plans.",
  },
  {
    title: "The Cost of Choices",
    focus: "Earlier decisions catch up with the characters. Trust is challenged and the stakes become personal.",
  },
  {
    title: "The Breaking Point",
    focus: "The central conflict reaches its most difficult stage. The characters must confront what they have been avoiding.",
  },
  {
    title: "The Final Decision",
    focus: "The characters take decisive action, bringing the central conflict towards its conclusion.",
  },
  {
    title: "The Resolution",
    focus: "The consequences of the final confrontation become clear and the characters begin to face a new reality.",
  },
  {
    title: "A New Beginning",
    focus: "The story closes with the characters changed by their experiences, while leaving room for a possible continuation.",
  },
];

export function generateStoryPackage(
  idea: string,
  genre: ProjectGenre,
  episodeCount: number,
): GeneratedStoryPackage {
  const concept = idea.trim().replace(/\s+/g, " ");
  const safeCount = Math.min(10, Math.max(3, episodeCount));

  const selectedBeats = Array.from(
    { length: safeCount },
    (_, index) => {
      const beatIndex = Math.round(
        (index * (storyBeats.length - 1)) / (safeCount - 1),
      );

      return storyBeats[beatIndex];
    },
  );

  const genreLabel = genre.replace("_", " ");

  const brief: StoryBrief = {
    concept,
    genre,
    logline: `A ${genreLabel} production exploring ${concept}. As events unfold, the characters must confront difficult choices, unexpected consequences and the forces shaping their lives.`,
    synopsis: `The story begins with ${concept}.\n\nAs the events unfold, the characters encounter challenges that test their relationships, beliefs and determination. Each decision creates new consequences, gradually building towards a defining confrontation.\n\nThe production explores the human experiences behind the central idea and follows the characters towards a meaningful resolution.`,
    setting:
      "The location, historical period and cultural environment should be refined during creative review to suit the story concept.",
    creativeDirection:
      "Use cinematic storytelling with expressive performances, believable environments and carefully composed shots. Build atmosphere through lighting, camera movement, sound and visual contrast. Allow the tone and pacing to develop with the story.",
    targetAudience:
      "Viewers interested in character-driven storytelling and the selected genre.",
  };

  const episodes = selectedBeats.map((beat, index) => ({
    title: `Episode ${index + 1}: ${beat.title}`,
    summary: `${beat.focus} The events develop from the central idea: ${concept}. This episode should move the overall story forward while giving the characters meaningful moments and decisions.`,
  }));

  return { brief, episodes };
}
