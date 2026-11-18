
import { Sparkles } from "lucide-react";

export function StudioHeader() {
  return (
    <header className="flex min-h-20 items-center justify-between border-b border-border px-5 sm:px-8">
      <div>
        <p className="text-xs text-muted">KemmyLabs Studio</p>
        <h2 className="mt-1 text-sm font-medium">Creative workspace</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-border px-3 py-2 sm:flex">
          <Sparkles size={14} className="text-gold" />
          <span className="text-xs text-muted">Personal workspace</span>
        </div>

        <div
          aria-label="Workspace profile"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-sm font-semibold text-gold"
        >
          K
        </div>
      </div>
    </header>
  );
}
