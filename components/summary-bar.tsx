import { CheckCircle2, ListChecks, AlertTriangle, Eye, Camera, ClipboardCheck } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Stat {
  label: string
  value: number
  icon: LucideIcon
  tone: "navy" | "ok" | "deficiency" | "observation" | "gold"
}

const toneClasses: Record<Stat["tone"], string> = {
  navy: "text-foreground",
  ok: "text-status-ok",
  deficiency: "text-status-deficiency",
  observation: "text-status-observation",
  gold: "text-gold",
}

export function SummaryBar({
  total,
  checked,
  ok,
  deficiency,
  observation,
  photos,
}: {
  total: number
  checked: number
  ok: number
  deficiency: number
  observation: number
  photos: number
}) {
  const stats: Stat[] = [
    { label: "Checked", value: checked, icon: ClipboardCheck, tone: "gold" },
    { label: "OK", value: ok, icon: CheckCircle2, tone: "ok" },
    { label: "Deficiency", value: deficiency, icon: AlertTriangle, tone: "deficiency" },
    { label: "Observation", value: observation, icon: Eye, tone: "observation" },
    { label: "Photos", value: photos, icon: Camera, tone: "navy" },
  ]

  return (
    <div className="w-full min-w-0 overflow-hidden">
      <div className="flex w-full snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="flex min-w-[104px] shrink-0 snap-start flex-col gap-1.5 rounded-2xl border bg-card px-3.5 py-3 shadow-sm"
            >
              <Icon className={`size-4 ${toneClasses[s.tone]}`} />
              <span className={`font-mono text-2xl font-bold leading-none ${toneClasses[s.tone]}`}>{s.value}</span>
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{s.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
