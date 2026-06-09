export type Status = "select" | "ok" | "deficiency" | "observation" | "na"

export type Regulation = "SOLAS" | "MARPOL" | "MLC" | "ISM" | "ISPS"

export interface ChecklistItem {
  id: number
  section: string
  question: string
  regulations: Regulation[]
  status: Status
  remarks: string
  photos: string[]
}

export const SECTIONS = [
  "Bridge & Navigation",
  "Engine Room",
  "Safety Equipment",
  "Pollution Prevention",
  "Crew & Accommodation",
  "Cargo Operations",
  "Documentation",
] as const

export const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "select", label: "Select Status" },
  { value: "ok", label: "OK" },
  { value: "deficiency", label: "Deficiency" },
  { value: "observation", label: "Observation" },
  { value: "na", label: "N/A" },
]

export const initialItems: ChecklistItem[] = [
  {
    id: 1,
    section: "Bridge & Navigation",
    question:
      "Are all navigation lights, shapes and sound signaling appliances operational and compliant with current regulations?",
    regulations: ["SOLAS"],
    status: "select",
    remarks: "",
    photos: [],
  },
  {
    id: 2,
    section: "Pollution Prevention",
    question:
      "Is the Oil Record Book correctly maintained, up to date, and are all entries signed by the officer in charge?",
    regulations: ["MARPOL", "ISM"],
    status: "select",
    remarks: "",
    photos: [],
  },
]
