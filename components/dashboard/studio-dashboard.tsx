
import {
  ArrowRight,
  CalendarDays,
  Clapperboard,
  CookingPot,
  Film,
  Landmark,
  Library,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { StudioSidebar } from "../layout/studio-sidebar";
import { StudioHeader } from "../layout/studio-header";
import { ProjectWorkspace } from "./project-workspace";

const studios = [
  {
    name: "Drama Studio",
    description:
      "Develop stories, write scripts, build episodes and create cinematic scenes.",
    icon: Clapperboard,
    category: "STORYTELLING",
  },
  {
    name: "Character Library",
    description:
      "Develop and organize your real and AI-generated characters, appearances and voices.",
    icon: UsersRound,
    category: "CHARACTERS",
  },
  {
    name: "Heritage & Documentary",
    description:
      "Create cultural stories, historical narratives and documentary productions.",
    icon: Landmark,
    category: "DOCUMENTARY",
  },
  {
    name: "Cooking Studio",
    description:
      "Plan recipes, cooking demonstrations and food-focused video productions.",
    icon: CookingPot,
    category: "FOOD CONTENT",
  },
  {
    name: "Video Production",
    description:
      "Bring scenes together with narration, subtitles, audio and video editing.",
    icon: Film,
    category: "PRODUCTION",
  },
  {
    name: "Publishing Planner",
    description:
      "Prepare and organize content for your social media publishing schedule.",
    icon: CalendarDays,
    category: "DISTRIBUTION",
  },
];

export function StudioDashboard() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <StudioSidebar />

      <main className="min-w-0 flex-1">
        <StudioHeader />

        <div className="mx-auto max-w-7xl space-y-12 px-5 py-9 sm:px-8 sm:py-12">
          <section id="overview">
            <div className="mb-5 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-gold">
              <Sparkles size={15} />
              Your creative space
            </div>

            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                  Every great story
                  <span className="block text-gold">starts somewhere.</span>
                </h1>

                <p className="mt-5 max-w-xl text-sm leading-7 text-muted sm:text-base">
                  Welcome to your creative production workspace. Develop
                  characters, shape stories and bring your ideas to life.
                </p>
              </div>

              <a
                href="#projects"
                className="inline-flex w-fit items-center gap-3 rounded-lg bg-gold px-5 py-3 text-sm font-semibold text-background transition-colors hover:bg-gold-light"
              >
                Explore your workspace
                <ArrowRight size={17} />
              </a>
            </div>
          </section>

          <section id="studios">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                  Production tools
                </p>
                <h2 className="mt-2 text-xl font-semibold sm:text-2xl">
                  Your creative studios
                </h2>
              </div>

              <span className="hidden text-xs text-muted sm:block">
                06 creative modules
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {studios.map((studio, index) => {
                const Icon = studio.icon;

                return (
                  <article
                    key={studio.name}
                    className="group rounded-xl border border-border bg-surface p-5 transition-all duration-200 hover:border-gold/40 hover:bg-surface-elevated"
                  >
                    <div className="mb-6 flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-gold/20 bg-gold/10 text-gold">
                        <Icon size={21} strokeWidth={1.7} />
                      </div>

                      <span className="text-[10px] font-medium tracking-[0.14em] text-muted">
                        0{index + 1}
                      </span>
                    </div>

                    <p className="text-[10px] font-semibold tracking-[0.16em] text-gold">
                      {studio.category}
                    </p>

                    <h3 className="mt-2 text-base font-semibold">
                      {studio.name}
                    </h3>

                    <p className="mt-3 min-h-[60px] text-sm leading-6 text-muted">
                      {studio.description}
                    </p>

                    <div className="mt-5 border-t border-border pt-4">
                      <span className="text-xs text-muted">
                        Module planned
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <ProjectWorkspace />

          <section id="assets" className="border-t border-border pt-8">
            <div className="flex items-center gap-3">
              <Library size={19} className="text-gold" />
              <div>
                <h2 className="text-sm font-semibold">Production assets</h2>
                <p className="mt-1 text-xs text-muted">
                  Your private media and creative asset library will be
                  established in a future milestone.
                </p>
              </div>
            </div>
          </section>

          <section id="publishing" className="sr-only">
            Publishing planner
          </section>

          <footer className="border-t border-border pt-6 text-xs text-muted">
            KemmyLabs Studio · Creative production workspace
          </footer>
        </div>
      </main>
    </div>
  );
}
