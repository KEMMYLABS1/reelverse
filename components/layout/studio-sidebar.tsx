
import {
  CalendarDays,
  Clapperboard,
  FolderOpen,
  LayoutDashboard,
  Library,
  Settings2,
  Sparkles,
} from "lucide-react";

const navigation = [
  { label: "Overview", href: "#overview", icon: LayoutDashboard },
  { label: "Creative Studios", href: "#studios", icon: Clapperboard },
  { label: "My Projects", href: "#projects", icon: FolderOpen },
  { label: "Asset Library", href: "#assets", icon: Library },
  { label: "Publishing Planner", href: "#publishing", icon: CalendarDays },
];

export function StudioSidebar() {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex">
      <div className="flex h-20 items-center gap-3 border-b border-border px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-lg font-bold text-background">
          K
        </div>
        <div>
          <p className="font-semibold tracking-wide">KemmyLabs</p>
          <p className="text-xs text-muted">STUDIO</p>
        </div>
      </div>

      <div className="px-4 py-7">
        <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
          Workspace
        </p>

        <nav aria-label="Main navigation" className="space-y-1">
          {navigation.map(({ label, href, icon: Icon }, index) => (
            <a
              key={label}
              href={href}
              aria-current={index === 0 ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors ${
                index === 0
                  ? "bg-surface-hover text-gold"
                  : "text-muted hover:bg-surface-hover hover:text-foreground"
              }`}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </a>
          ))}
        </nav>
      </div>

      <div className="mt-auto border-t border-border p-5">
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="mb-3 flex items-center gap-2 text-gold">
            <Sparkles size={16} />
            <span className="text-xs font-semibold">Creative workspace</span>
          </div>
          <p className="text-xs leading-5 text-muted">
            Your private space for developing stories and producing original content.
          </p>
        </div>

        <a
          href="#assets"
          className="mt-5 flex items-center gap-3 px-2 text-sm text-muted hover:text-foreground"
        >
          <Settings2 size={17} />
          Workspace settings
        </a>
      </div>
    </aside>
  );
}
