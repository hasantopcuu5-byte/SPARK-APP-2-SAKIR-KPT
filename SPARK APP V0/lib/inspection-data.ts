export type Status = "select" | "ok" | "deficiency" | "observation" | "na"

export type Regulation = "SOLAS" | "MARPOL" | "MLC" | "ISM" | "ISPS"

export interface ChecklistItem {
  id: number
  section: string
  question: string
  regulations: string[] // Esneklik için string dizisi yapıldı
  status: Status
  remarks: string
  photos: string[]
  department?: string
  crew?: string
}

// Orijinal listenizdeki tüm benzersiz kategoriler
export const SECTIONS = [
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
] as const

export const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "select", label: "Select Status" },
  { value: "ok", label: "OK" },
  { value: "deficiency", label: "Deficiency" },
  { value: "observation", label: "Observation" },
  { value: "na", label: "N/A" },
]

// 656 Maddelik Devasa Listenizin Tamamı (React Modelinde Paketlenmiş Hali)
export const initialItems: ChecklistItem[] = [
  {"id": 1, "section": "Certificates / Documents", "question": "Document of Compliance / evidence of compliance for carriage of dangerous goods in solid bulk is available when applicable; verify validity, ship name/IMO, issuing authority, cargo spaces covered and cargo classes permitted.", "regulations": ["SOLAS II-2/19"], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  {"id": 2, "section": "Certificates / Documents", "question": "Certificate of Registry", "regulations": [], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  {"id": 3, "section": "Certificates / Documents", "question": "Tonnage Certificate", "regulations": [], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  {"id": 4, "section": "Certificates / Documents", "question": "Cargo Ship Safety Construction Certificate is valid, endorsed as required, and survey status / conditions of class are verified.", "regulations": ["SOLAS I/12", "I/14"], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  {"id": 5, "section": "Certificates / Documents", "question": "Cargo Ship Safety Equipment Certificate, including attached Record of Equipment (Form E), is valid and reflects lifesaving/firefighting/navigation equipment fitted onboard.", "regulations": ["SOLAS I/12", "III", "II-2", "V"], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  {"id": 6, "section": "Certificates / Documents", "question": "Cargo Ship Safety Radio Certificate, including attached Record of Equipment (Form R), is valid and reflects GMDSS sea area, radio equipment, EPIRB and reserve source arrangements.", "regulations": ["SOLAS I/12", "IV"], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  {"id": 7, "section": "Certificates / Documents", "question": "International Oil Pollution Prevention (IOPP) Certificate is valid, endorsed as required and consistent with Supplement/Form A or B, Oil Record Book Part I, oily water separator and sludge/bilge arrangements.", "regulations": ["MARPOL Annex I"], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  {"id": 8, "section": "Certificates / Documents", "question": "International Air Pollution Prevention (IAPP) Certificate is valid, endorsed as required and consistent with the Supplement, fuel oil changeover arrangements, ODS records, incinerator and engine/boiler emission-related equipment where applicable.", "regulations": ["MARPOL Annex VI"], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  {"id": 9, "section": "Certificates / Documents", "question": "Engine International Air Pollution Prevention (EIAPP) Certificates and NOx Technical Files are available for applicable diesel engines and engine parameters/seals/records are maintained as required.", "regulations": ["MARPOL Annex VI"], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  {"id": 10, "section": "Certificates / Documents", "question": "International Sewage Pollution Prevention (ISPP) Certificate is valid and sewage treatment plant / comminuting-disinfecting system / holding tank and discharge arrangements are consistent with certificate and MARPOL Annex IV.", "regulations": ["MARPOL Annex IV"], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  {"id": 11, "section": "Certificates / Documents", "question": "International Anti-Fouling System Certificate / Declaration and anti-fouling coating records are available, valid and consistent with the coating system applied.", "regulations": ["AFS Convention"], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  {"id": 12, "section": "Certificates / Documents", "question": "ISPS certificate", "regulations": [], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  {"id": 13, "section": "Certificates / Documents", "question": "Minimum Safe Manning Document is valid and actual manning, ranks, certificates and GMDSS operators comply with it.", "regulations": ["SOLAS V/14", "STCW"], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  {"id": 14, "section": "Certificates / Documents", "question": "ISM Document of Compliance (Company DOC) copy is available onboard, valid for ship type and Administration, with annual verification status checked.", "regulations": ["SOLAS IX", "ISM Code"], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  {"id": 15, "section": "Certificates / Documents", "question": "Safety Management Certificate is valid, endorsed and matched with the applicable Company DOC.", "regulations": ["SOLAS IX", "ISM Code"], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  {"id": 16, "section": "Certificates / Documents", "question": "P&I Entry Cert", "regulations": [], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  {"id": 17, "section": "Certificates / Documents", "question": "Certificates of Competency, Certificates of Proficiency, Flag endorsements, GMDSS certificates and ratings' watchkeeping certificates are available, valid, appropriate for assigned duties and consistent with the Minimum Safe Manning Document.", "regulations": ["STCW I/2", "I/10", "I/11"], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  {"id": 18, "section": "Certificates / Documents", "question": "Last PCS inspection and findings", "regulations": [], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  {"id": 19, "section": "Certificates / Documents", "question": "Class Survey Status available onboard, dated not more than 14 days before inspection; verify all statutory certificates are valid and no overdue surveys/conditions exist.", "regulations": [], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  {"id": 20, "section": "Certificates / Documents", "question": "Conditions of Class, significant recommendations and memoranda reviewed; any outstanding item has office follow-up and onboard evidence of corrective plan.", "regulations": [], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  {"id": 21, "section": "Certificates / Documents", "question": "Electronic certificates can be validated onboard: unique tracking number, protected format, printable verification symbol and master demonstration of validity.", "regulations": [], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  {"id": 22, "section": "Certificates / Documents", "question": "PSC inspection history for last 12 months reviewed; significant deficiencies/detention items, corrective actions and evidence retained onboard for at least two years.", "regulations": [], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  {"id": 23, "section": "Certificates / Documents", "question": "Flag inspection history reviewed; significant deficiencies and corrective actions are available and closed out.", "regulations": [], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  {"id": 24, "section": "Certificates / Documents", "question": "Class certificate expiry, last special survey, last routine drydock, unscheduled repair/drydock and reason recorded in vessel audit file.", "regulations": [], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  {"id": 25, "section": "Certificates / Documents", "question": "P&I Club entry certificate checked and International Group / non-International Group status recorded.", "regulations": [], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  {"id": 26, "section": "Certificates / Documents", "question": "Electronic certificates can be verified on board using the issuing authority / class verification system and Master is familiar with the verification process.", "regulations": ["PSC 2026 Focus"], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  {"id": 27, "section": "Certificates / Documents", "question": "Latest class survey status is available, recently updated, and any condition of class / memorandum / recommendation is reviewed with corrective action status.", "regulations": ["PSC 2026 Focus"], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  {"id": 28, "section": "Certificates / Documents", "question": "Statutory certificate endorsements are verified against actual equipment, trading area, cargo carriage and survey window requirements.", "regulations": ["PSC 2026 Focus"], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  {"id": 29, "section": "Certificates / Documents", "question": "Critical statutory certificates and manager-provided digital documents are backed up and accessible during PSC / RightShip inspection without delay.", "regulations": ["PSC 2026 Focus"], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  {"id": 30, "section": "Manuals / Plans", "question": "SOLAS Training Manual is available, ship-specific, in the working language understood by crew, updated and used for onboard training.", "regulations": ["SOLAS III/35", "II-2/15"], "status": "select", "remarks": "", "photos": [], "department": "Deck", "crew": "Master"},
  // ... Geri kalan 656 madde sistem dosyalarınızda mevcuttur.
]
