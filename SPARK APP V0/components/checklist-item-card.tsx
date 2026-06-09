"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Camera, X, ImagePlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { STATUS_OPTIONS, type ChecklistItem, type Status } from "@/lib/inspection-data"

const statusStyles: Record<Status, string> = {
  select: "border-border bg-secondary/50",
  ok: "border-status-ok/40 bg-status-ok/10",
  deficiency: "border-status-deficiency/40 bg-status-deficiency/10",
  observation: "border-status-observation/40 bg-status-observation/10",
  na: "border-border bg-muted",
}

const statusDot: Record<Status, string> = {
  select: "bg-muted-foreground",
  ok: "bg-status-ok",
  deficiency: "bg-status-deficiency",
  observation: "bg-status-observation",
  na: "bg-muted-foreground",
}

export function ChecklistItemCard({
  item,
  onStatus,
  onRemarks,
  onAddPhoto,
  onRemovePhoto,
}: {
  item: ChecklistItem
  onStatus: (id: number, status: Status) => void
  onRemarks: (id: number, remarks: string) => void
  onAddPhoto: (id: number) => void
  onRemovePhoto: (id: number, index: number) => void
}) {
  return (
    <Card className="gap-4 p-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-gold">{`Item ${item.id}`}</span>
          <Badge variant="secondary" className="rounded-full bg-navy/8 text-[11px] font-medium text-navy">
            {item.section}
          </Badge>
        </div>
        <span className={cn("mt-1 size-2.5 shrink-0 rounded-full", statusDot[item.status])} aria-hidden />
      </div>

      {/* Question */}
      <p className="text-pretty text-[15px] font-medium leading-relaxed text-foreground">{item.question}</p>

      {/* Regulation tags */}
      <div className="flex flex-wrap gap-1.5">
        {item.regulations.map((r) => (
          <span
            key={r}
            className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wide text-gold-foreground"
          >
            {r}
          </span>
        ))}
      </div>

      {/* Status select */}
      <Select value={item.status} onValueChange={(v) => onStatus(item.id, v as Status)}>
        <SelectTrigger className={cn("!h-12 rounded-xl text-base font-medium transition-colors", statusStyles[item.status])}>
          <SelectValue>
            {(value: Status) => STATUS_OPTIONS.find((o) => o.value === value)?.label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Remarks */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Remarks / Findings</label>
        <Textarea
          value={item.remarks}
          onChange={(e) => onRemarks(item.id, e.target.value)}
          placeholder="Record observations, findings, or corrective actions..."
          className="min-h-[88px] resize-none rounded-xl bg-secondary/40 text-base"
        />
      </div>

      {/* Photos */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Photos</label>
        <div className="flex flex-wrap gap-2">
          {item.photos.map((src, i) => (
            <div key={i} className="group relative size-16 overflow-hidden rounded-xl border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src || "/placeholder.svg"} alt={`Evidence ${i + 1}`} className="size-full object-cover" />
              <button
                type="button"
                onClick={() => onRemovePhoto(item.id, i)}
                className="absolute right-0.5 top-0.5 flex size-5 items-center justify-center rounded-full bg-navy/80 text-navy-foreground"
                aria-label="Remove photo"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onAddPhoto(item.id)}
            className="flex size-16 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gold/40 bg-gold/5 text-gold transition-colors active:bg-gold/15"
            aria-label="Upload photo"
          >
            {item.photos.length === 0 ? <Camera className="size-5" /> : <ImagePlus className="size-5" />}
            <span className="text-[10px] font-medium">Add</span>
          </button>
        </div>
      </div>
    </Card>
  )
}
