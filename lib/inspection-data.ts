import { CHECKLIST_ITEMS } from "./data"

export type Status = "select" | "ok" | "deficiency" | "observation" | "na"

export const MAX_PHOTOS_PER_ITEM = 2

export interface ChecklistItem {
  id: number
  section: string
  question: string
  regulations: string[]
  status: Status
  remarks: string
  photos: string[]
  department?: string
  crew?: string
  tip?: string
}

export const SECTIONS = Array.from(
  new Set(CHECKLIST_ITEMS.map((item) => item.section || "General")),
)

export const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "select", label: "Select Status" },
  { value: "ok", label: "OK" },
  { value: "deficiency", label: "Deficiency" },
  { value: "observation", label: "Observation" },
  { value: "na", label: "N/A" },
]

export const initialItems: ChecklistItem[] = CHECKLIST_ITEMS.map((item, index) => {
  const regulations = [item.solas, item.marpol, item.stcw, item.mlc].filter(
    (r): r is string => Boolean(r?.trim()),
  )

  return {
    id: index + 1,
    section: item.section || "General",
    question: item.item || "",
    regulations,
    status: "select",
    remarks: item.remarks || "",
    photos: [],
    department: item.department || "",
    crew: item.crew || "",
    tip: (item as any).tip || "",
  }
})
