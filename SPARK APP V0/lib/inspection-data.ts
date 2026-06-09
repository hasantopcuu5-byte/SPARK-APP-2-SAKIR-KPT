// SPARK APP V0/lib/inspection-data.ts
// @ts-ignore
import { CHECKLIST_ITEMS } from "./data"; 

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
}

export const SECTIONS = [
  ...new Set(CHECKLIST_ITEMS.map((item: any) => item.section))
] as const

export const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "select", label: "Select Status" },
  { value: "ok", label: "OK" },
  { value: "deficiency", label: "Deficiency" },
  { value: "observation", label: "Observation" },
  { value: "na", label: "N/A" },
]

export const initialItems: ChecklistItem[] = CHECKLIST_ITEMS.map((item: any, index: number) => {
  const regs = [item.solas, item.marpol, item.stcw, item.mlc].filter((r) => r && r.trim() !== "");
  return {
    id: index + 1,
    section: item.section || "General",
    question: item.item, 
    regulations: regs,
    status: "select",
    remarks: item.remarks || "",
    photos: []
  };
});
```[cite: 2]

---

### 5. Adım: Doğru Sunucuyu Ateşleyin!
Şimdi Adım 2'de açtığımız o yepyeni ve doğru terminal satırına gelin, şirket engelini de bypass edecek şekilde şu komutu yazıp **Enter**'a basın:

```bash
npx next dev
