export type Status = "select" | "ok" | "deficiency" | "observation" | "na"
export type Regulation = "SOLAS" | "MARPOL" | "MLC" | "ISM" | "ISPS"

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
}

// 656 maddelik verinizi içeri aktarıyoruz
// @ts-ignore
import { CHECKLIST_ITEMS } from "./data"

export const SECTIONS = CHECKLIST_ITEMS && CHECKLIST_ITEMS.length > 0
  ? Array.from(new Set(CHECKLIST_ITEMS.map((item: any) => item.section || "General")))
  : ["General"];

export const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "select", label: "Select Status" },
  { value: "ok", label: "OK" },
  { value: "deficiency", label: "Deficiency" },
  { value: "observation", label: "Observation" },
  { value: "na", label: "N/A" },
]

// BURASI KRİTİK: Listeyi kesmeden tüm veriyi dönüştürür.
export const initialItems: ChecklistItem[] = (CHECKLIST_ITEMS || []).map((item: any, index: number) => {
  const regs = [item.solas, item.marpol, item.stcw, item.mlc].filter(
    (r) => r && r.trim() !== ""
  )
  
  return {
    id: index + 1,
    section: item.section || "General",
    question: item.item || "", 
    regulations: regs,
    status: "select",
    remarks: item.remarks || "",
    photos: [],
    department: item.department || "",
    crew: item.crew || ""
  }
})
