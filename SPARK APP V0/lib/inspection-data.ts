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

// Üst adımda hazırladığımız 656 maddelik dev veriyi güvenlice çekiyoruz
// @ts-ignore
import { CHECKLIST_ITEMS } from "./data"

// Kategorileri elinizdeki veriden otomatik olarak ayıklar (Sıfır hata koruması)
export const SECTIONS = CHECKLIST_ITEMS && CHECKLIST_ITEMS.length > 0
  ? Array.from(new Set(CHECKLIST_ITEMS.map((item: any) => item.section || "General")))
  : [
      "Certificates / Documents",
      "Manuals / Plans",
      "Publications",
      "Certification of Personnel",
      "Management and Crew",
      "Navigation and Bridge organization",
      "Mooring",
      "Cargo Operation",
      "Operational Safety",
      "Firefighting Equipments",
      "Lifesaving Equipments",
      "Health, Safety And Personel Protectıon",
      "Environmental Protection",
      "Hull And Superstructual",
      "Accommodation Space-MLC",
      "Cargo Holds, Ballast Tanks, Other Spaces",
      "Engine Room Operation",
      "Security"
    ];

export const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "select", label: "Select Status" },
  { value: "ok", label: "OK" },
  { value: "deficiency", label: "Deficiency" },
  { value: "observation", label: "Observation" },
  { value: "na", label: "N/A" },
]

// PROFESYONEL COKME KORUMALI OTOMATIK DONUSTURUCU (MAPPING)
// 656 maddelik ham listenizi v0'ın arayüz modeline tıkır tıkır çevirir.
export const initialItems: ChecklistItem[] = (CHECKLIST_ITEMS || []).map((item: any, index: number) => {
  // SOLAS, MARPOL, STCW, MLC regülasyon kodlarını birleştirip diziye alıyoruz
  const regs = [item.solas, item.marpol, item.stcw, item.mlc].filter(
    (r) => r && r.trim() !== ""
  )
  
  return {
    id: index + 1,
    section: item.section || "General",
    question: item.item || "", // Orijinal 'item' alanını v0'ın beklediği 'question' alanına eşitler
    regulations: regs,
    status: "select",
    remarks: item.remarks || "",
    photos: [],
    department: item.department || "",
    crew: item.crew || ""
  }
})
