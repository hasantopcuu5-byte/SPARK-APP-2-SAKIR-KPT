"use client"

import { useRef } from "react"
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
import { Camera, Loader2, X, ImagePlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { resizeImageToDataUrl } from "@/lib/image-resize"
import {
  MAX_PHOTOS_PER_ITEM,
  STATUS_OPTIONS,
  type ChecklistItem,
  type Status,
} from "@/lib/inspection-data"

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
  photos,
  isUploading,
  onStatus,
  onRemarks,
  onPhotosChange,
  onUploadingChange,
}: {
  item: ChecklistItem
  photos: string[]
  isUploading: boolean
  onStatus: (id: number, status: Status) => void
  onRemarks: (id: number, remarks: string) => void
  onPhotosChange: (id: number, photos: string[] | ((prev: string[]) => string[])) => void
  onUploadingChange: (id: number, uploading: boolean) => void
}) {
  const blobUrlsRef = useRef<string[]>([])
  const canAddMore = photos.length < MAX_PHOTOS_PER_ITEM

  async function handleFileChange(files: FileList) {
    const slotsLeft = MAX_PHOTOS_PER_ITEM - photos.length
    if (slotsLeft <= 0) return

    const selected = Array.from(files).slice(0, slotsLeft)
    if (selected.length === 0) return

    const previews = selected.map((file) => URL.createObjectURL(file))
    blobUrlsRef.current = previews
    onPhotosChange(item.id, [...photos, ...previews].slice(0, MAX_PHOTOS_PER_ITEM))
    onUploadingChange(item.id, true)

    try {
      const resized = await Promise.all(selected.map((file) => resizeImageToDataUrl(file)))
      previews.forEach((url) => URL.revokeObjectURL(url))
      blobUrlsRef.current = []

      onPhotosChange(item.id, (current) => {
        const base = current.filter((src) => !src.startsWith("blob:"))
        return [...base, ...resized].slice(0, MAX_PHOTOS_PER_ITEM)
      })
    } catch (err) {
      console.error("Photo upload failed:", err)
      previews.forEach((url) => URL.revokeObjectURL(url))
      blobUrlsRef.current = []
      onPhotosChange(item.id, (current) => current.filter((src) => !src.startsWith("blob:")))
    } finally {
      onUploadingChange(item.id, false)
    }
  }

  function removePhoto(index: number) {
    const removed = photos[index]
    if (removed?.startsWith("blob:")) URL.revokeObjectURL(removed)
    onPhotosChange(
      item.id,
      photos.filter((_, i) => i !== index),
    )
  }

  return (
    <Card className="gap-4 overflow-visible p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-gold">{`Item ${item.id}`}</span>
          <Badge variant="secondary" className="rounded-full bg-navy/8 text-[11px] font-medium text-navy">
            {item.section}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-1">
          {item.tip && (
            <button
              type="button"
              onClick={() => alert(item.tip)}
              className="flex size-4 items-center justify-center rounded-full bg-yellow-400 text-[11px] font-bold text-yellow-950 transition-colors hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1"
              title="View Tip"
            >
              !
            </button>
          )}
          <span className={cn("size-2.5 shrink-0 rounded-full", statusDot[item.status])} aria-hidden />
        </div>
      </div>

      <p className="text-pretty text-[15px] font-medium leading-relaxed text-foreground">{item.question}</p>

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

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Remarks / Findings</label>
        <Textarea
          value={item.remarks}
          onChange={(e) => onRemarks(item.id, e.target.value)}
          placeholder="Record observations, findings, or corrective actions..."
          className="min-h-[88px] resize-none rounded-xl bg-secondary/40 text-base"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Photos</label>
          <span className="text-[11px] text-muted-foreground">
            {photos.length}/{MAX_PHOTOS_PER_ITEM}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {photos.map((src, i) => (
            <div
              key={`${item.id}-photo-${i}-${src.slice(0, 24)}`}
              className="relative size-16 shrink-0 overflow-hidden rounded-xl border bg-secondary/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Evidence ${i + 1}`} className="size-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute right-0.5 top-0.5 z-10 flex size-5 items-center justify-center rounded-full bg-navy/80 text-navy-foreground"
                aria-label="Remove photo"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          {canAddMore && (
            <label
              className={cn(
                "relative flex size-16 shrink-0 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gold/40 bg-gold/5 text-gold transition-colors active:bg-gold/15",
                photos.length === 0 && "flex-col gap-1",
                isUploading && "pointer-events-none opacity-60",
              )}
              aria-label={photos.length === 0 ? "Upload photo" : "Add another photo"}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/*"
                multiple={photos.length === 0}
                disabled={isUploading}
                className="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
                onChange={(e) => {
                  const files = e.target.files
                  if (files?.length) void handleFileChange(files)
                  e.target.value = ""
                }}
              />
              {isUploading ? (
                <Loader2 className="pointer-events-none size-5 animate-spin" />
              ) : photos.length === 0 ? (
                <>
                  <Camera className="pointer-events-none size-5" />
                  <span className="pointer-events-none text-[10px] font-medium">Add</span>
                </>
              ) : (
                <ImagePlus className="pointer-events-none size-6" />
              )}
            </label>
          )}
        </div>
      </div>
    </Card>
  )
}
