import type {
  CharacterProfile,
  DialogueLine,
  Project,
  ScriptEpisode,
  ScriptScene,
} from "@/types/project";

export type GeneratedSceneDraft = Omit<
  ScriptScene,
  "id" | "sceneNumber"
>;

const sceneBeats = [
  {
    title: "Opening Image",
    purpose: "Establish the world, atmosphere and central character.",
    camera: "Begin with a wide establishing shot, then move into a character-focused shot.",
  },
  {
    title: "The Situation",
    purpose: "Show the circumstances surrounding the episode's central conflict.",
    camera: "Use medium shots and environmental details to establish the situation.",
  },
  {
    title: "An Unexpected Development",
    purpose: "Introduce information or an event that changes the direction of the story.",
    camera: "Build tension through close-ups, reaction shots and deliberate pauses.",
  },
  {
    title: "Confrontation",
    purpose: "Bring characters into a meaningful disagreement or difficult conversation.",
    camera: "Use alternating close-ups to capture emotional reactions.",
  },
  {
    title: "The Turning Point",
    purpose: "Force the characters to make a decision or face an uncomfortable truth.",
    camera: "Use controlled camera movement and focused visual composition.",
  },
  {
    title: "Consequences",
    purpose: "Show how the characters respond to what has happened.",
    camera: "Use expressive performances and atmospheric environmental shots.",
  },
  {
    title: "A Difficult Choice",
    purpose: "Raise the stakes through a personal decision or new challenge.",
    camera: "Use close-ups and carefully timed pauses.",
  },
  {
    title: "The Reveal",
    purpose: "Reveal a new detail that changes the audience's understanding.",
    camera: "Build suspense with a gradual reveal and reaction shots.",
  },
  {
    title: "The Aftermath",
    purpose: "Show the emotional and practical consequences of the events.",
    camera: "Use quieter compositions and deliberate pacing.",
  },
  {
    title: "The Episode Hook",
    purpose: "End with an unresolved question or development that encourages viewers to continue.",
    camera: "Finish with a memorable visual moment and a controlled final shot.",
  },
];

const locations = [
  "Primary story location",
  "Interior location",
  "Nearby public space",
  "Private meeting location",
  "Outdoor setting",
  "Primary story location",
  "Interior location",
  "Nearby public space",
  "Private meeting location",
  "Primary story location",
];

const times = [
  "Early morning",
  "Morning",
  "Late morning",
  "Afternoon",
  "Late afternoon",
  "Evening",
  "Evening",
  "Night",
  "Night",
  "Night",
];

export function generateEpisodeSceneDrafts(
  project: Project,
  episode: ScriptEpisode,
  characters: CharacterProfile[],
  sceneCount: number,
): GeneratedSceneDraft[] {
  const count = Math.min(10, Math.max(4, sceneCount));

  const primaryCharacter = characters.find(
    (character) => character.isPrimary,
  );

  const supportingCharacters = characters.filter(
    (character) => !character.isPrimary,
  );

  const cast = [
    ...(primaryCharacter ? [primaryCharacter] : []),
    ...supportingCharacters,
  ];

  const storyBrief = project.storyBrief;
  const storyContext =
    storyBrief?.synopsis ||
    storyBrief?.concept ||
    project.description ||
    episode.summary;

  const episodeContext = episode.summary || storyContext;
  const setting = storyBrief?.setting || "the established story environment";

  return Array.from({ length: count }, (_, index) => {
    const beat = sceneBeats[
      Math.round((index * (sceneBeats.length - 1)) / (count - 1))
    ];

    const firstCharacter = cast[index % Math.max(cast.length, 1)];
    const secondCharacter =
      cast.length > 1
        ? cast[(index + 1) % cast.length]
        : undefined;

    const participants = [
      ...(firstCharacter ? [firstCharacter] : []),
      ...(secondCharacter &&
      secondCharacter.id !== firstCharacter?.id
        ? [secondCharacter]
        : []),
    ];

    const dialogue: DialogueLine[] = participants.length
      ? participants.map((character, characterIndex) => ({
          id: crypto.randomUUID(),
          characterName: character.name,
          dialogue:
            characterIndex === 0
              ? "Something about this situation does not feel right. We need to understand what is happening."
              : "Then we need to face it together. Avoiding the truth will only make things worse.",
        }))
      : [];

    const characterAssignments = participants.map((character) => ({
      characterId: character.id,
      lookId: null,
      referenceImageIds: [],
      continuityNotes:
        "Maintain this character's established appearance, hairstyle and visual identity across scenes.",
    }));

    return {
      title: beat.title,
      location: locations[index],
      timeOfDay: times[index],
      visualDescription:
        `Cinematic ${storyBrief?.genre || "drama"} scene set in ${setting}. ` +
        `${beat.purpose} The visual storytelling should reflect the episode's events: ${episodeContext} ` +
        `Use believable environments, natural lighting, expressive facial details and cinematic composition. ` +
        `${beat.camera}`,
      action:
        `${beat.purpose} ` +
        `Develop the episode's events around: ${episodeContext} ` +
        `Characters should behave naturally, with meaningful reactions, purposeful movement and clear emotional progression.`,
      dialogue,
      notes:
        `STORY CONTEXT: ${storyContext}\n` +
        `EPISODE CONTEXT: ${episodeContext}\n` +
        `DIRECTING: ${beat.camera}\n` +
        `CONTINUITY: Maintain established character appearances, costumes, props and spatial relationships.`,
      characterAssignments,
    };
  });
}
