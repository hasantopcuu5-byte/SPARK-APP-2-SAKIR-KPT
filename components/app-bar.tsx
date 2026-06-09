import { Anchor } from "lucide-react"

export function AppBar() {
  return (
    <header className="sticky top-0 z-40 bg-navy text-navy-foreground shadow-lg shadow-navy/20">
      <div
        className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3.5"
        style={{ paddingTop: "max(0.875rem, env(safe-area-inset-top))" }}
      >
        <div className="flex size-9 items-center justify-center rounded-lg bg-gold/15 ring-1 ring-gold/30">
          <Anchor className="size-5 text-gold" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-mono text-lg font-bold tracking-[0.2em] text-gold">SPARK</span>
          <span className="mt-1 text-[11px] font-medium uppercase tracking-wider text-navy-foreground/60">
            Vessel Inspection
          </span>
        </div>
        <div className="ml-auto flex flex-col items-end leading-none">
          <span className="text-[11px] uppercase tracking-wider text-navy-foreground/50">Status</span>
          <span className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-gold">
            <span className="size-1.5 animate-pulse rounded-full bg-gold" />
            In Progress
          </span>
        </div>
      </div>
    </header>
  )
}
