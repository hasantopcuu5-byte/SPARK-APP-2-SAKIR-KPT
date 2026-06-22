"use client"
export const runtime = 'edge'; // <-- BU SATIRI EKLE
import { useEffect, useMemo, useState, useRef } from "react"
import { AppBar } from "@/components/app-bar"
import { VesselDetails } from "@/components/vessel-details"
import { Filters } from "@/components/filters"
import { PdfReport } from "@/components/pdf-report"
import { ChecklistItemCard } from "@/components/checklist-item-card"
import { BottomNav } from "@/components/bottom-nav"
import { AuthScreen } from "@/components/auth-screen"
import { HistoryScreen } from "@/components/history-screen"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { initialItems, type ChecklistItem, type Status } from "@/lib/inspection-data"
import { getCurrentUser, initializeUsers, saveInspectionRecord, syncOfflineRecords, type User } from "@/lib/auth"
import { SearchX, Wifi, WifiOff } from "lucide-react"

export default function Page() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [items, setItems] = useState<ChecklistItem[]>(initialItems)
  const [photoMap, setPhotoMap] = useState<Record<number, string[]>>({})
  const [uploadingMap, setUploadingMap] = useState<Record<number, boolean>>({})
  const [search, setSearch] = useState("")
  const [section, setSection] = useState("all")
  const [status, setStatus] = useState("all")
  const [tab, setTab] = useState("checklist")
  const [vesselName, setVesselName] = useState("")
  const [captainName, setCaptainName] = useState("")
  const [inspectionDate, setInspectionDate] = useState("")
  const [screen, setScreen] = useState<"auth" | "inspection" | "history">("auth")
  const [isInitializing, setIsInitializing] = useState(true)
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null)
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const pdfRef = useRef<HTMLDivElement>(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  // 1. ANLIK BAĞLANTI DURUM TAKİBİ
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine)

      const goOnline = () => {
        setIsOnline(true)
        syncOfflineRecords() // İnternet geldiği an bekleyenleri otomatik eşitle
      }
      const goOffline = () => setIsOnline(false)

      window.addEventListener("online", goOnline)
      window.addEventListener("offline", goOffline)

      // --- PWA SERVICE WORKER KAYDI ---
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("PWA Altyapısı Başarıyla Aktif Edildi. Kapsam:", reg.scope))
          .catch((err) => console.error("PWA Altyapı Kaydı Başarısız:", err))
      }

      return () => {
        window.removeEventListener("online", goOnline)
        window.removeEventListener("offline", goOffline)
      }
    }
  }, [])

  // 2. OTURUM VE ILK YÜKLEME BAŞLATICISI (IndexedDB Uyumlu)
  useEffect(() => {
    async function loadAuth() {
      await initializeUsers()
      const user = await getCurrentUser()
      if (user) {
        setCurrentUser(user)
        setScreen("inspection")
        syncOfflineRecords() // Bekleyen yerel veri varsa eşitlemeyi başlat
      } else {
        setScreen("auth")
      }
      setIsInitializing(false)
    }
    loadAuth()
  }, [])

  const totalCount = items.length

  const counts = useMemo(() => {
    const ok = items.filter((i) => i.status === "ok").length
    const deficiency = items.filter((i) => i.status === "deficiency").length
    const observation = items.filter((i) => i.status === "observation").length
    const checked = items.filter((i) => i.status !== "select").length
    const photos = Object.values(photoMap).reduce((sum, arr) => sum + arr.length, 0)
    return { ok, deficiency, observation, checked, photos }
  }, [items, photoMap])

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const matchSearch =
        search.trim() === "" || i.question.toLowerCase().includes(search.toLowerCase())
      const matchSection = section === "all" || i.section === section
      const matchStatus = status === "all" || i.status === status
      return matchSearch && matchSection && matchStatus
    })
  }, [items, search, section, status])

  function updateStatus(id: number, s: Status) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: s } : i)))
  }

  function updateRemarks(id: number, remarks: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, remarks } : i)))
  }

  function updatePhotos(id: number, photos: string[] | ((prev: string[]) => string[])) {
    setPhotoMap((prev) => {
      const current = prev[id] ?? []
      const next = typeof photos === "function" ? photos(current) : photos
      return { ...prev, [id]: next }
    })
  }

  function setUploading(id: number, uploading: boolean) {
    setUploadingMap((prev) => ({ ...prev, [id]: uploading }))
  }

  function resetFilters() {
    setSearch("")
    setSection("all")
    setStatus("all")
  }

  function handleExportPdf() {
    window.print()
  }

  function handleSaveInspection() {
    if (!currentUser) {
      alert("Lütfen önce giriş yapınız")
      return
    }

    if (!vesselName || !captainName || !inspectionDate) {
      alert("Lütfen tüm gemi bilgilerini doldurunuz")
      return
    }

    setIsSaveModalOpen(true)
  }

  async function confirmSaveInspection(status: "completed" | "in_progress") {
    setIsSaveModalOpen(false)

    const itemsWithPhotos = items.map((item) => ({
      ...item,
      photos: photoMap[item.id] ?? [],
    }))

    await saveInspectionRecord(
      currentUser!.id,
      currentUser!.username,
      vesselName,
      captainName,
      inspectionDate,
      itemsWithPhotos,
      status,
      activeRecordId || undefined
    )

    alert(status === "completed" ? "✅ Denetim başarıyla tamamlandı!" : "✅ Denetim taslak olarak kaydedildi!")

    setItems(initialItems)
    setPhotoMap({})
    setUploadingMap({})
    setSearch("")
    setSection("all")
    setStatus("all")
    setVesselName("")
    setCaptainName("")
    setInspectionDate("")
    setTab("checklist")
    setActiveRecordId(null)
  }

  function handleResumeRecord(record: any) {
    setVesselName(record.vesselName)
    setCaptainName(record.captainName)
    setInspectionDate(record.inspectionDate)

    setItems(record.items.map((i: any) => ({
      ...i,
      photos: undefined
    })))

    const newPhotoMap: Record<number, string[]> = {}
    record.items.forEach((item: any) => {
      if (item.photos && item.photos.length > 0) {
        newPhotoMap[item.id] = item.photos
      }
    })
    setPhotoMap(newPhotoMap)

    setActiveRecordId(record.id)
    setScreen("inspection")
  }

  if (isInitializing) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-navy border-t-transparent" />
      </div>
    )
  }

  if (screen === "auth") {
    return (
      <AuthScreen
        onAuthSuccess={(user) => {
          setCurrentUser(user)
          setScreen("inspection")
        }}
      />
    )
  }

  if (screen === "history" && currentUser) {
    return (
      <HistoryScreen
        user={currentUser}
        onBack={() => {
          setScreen("inspection")
        }}
        onResume={handleResumeRecord}
      />
    )
  }

  return (
    <div className="min-h-dvh bg-background pb-28">
      {/* Main App Layout (Hidden during print) */}
      <div className="print:hidden">
        <AppBar onHistoryClick={() => setScreen("history")} onLogout={() => setScreen("auth")} />

        {/* ANLIK BAĞLANTI UYARI BARLARI */}
        {!isOnline ? (
          <div className="bg-status-observation text-white text-center py-2 px-4 text-xs font-semibold flex items-center justify-center gap-2 animate-pulse sticky top-0 z-50 shadow-md">
            <WifiOff className="size-4" />
            İnternet Bağlantısı Yok. Denetim Güvenle Telefona Kaydediliyor (Offline Mod).
          </div>
        ) : (
          <div className="bg-status-ok text-white text-center py-1.5 px-4 text-xs font-medium flex items-center justify-center gap-2 sticky top-0 z-50 shadow-sm transition-all duration-500">
            <Wifi className="size-3.5" />
            Cihaz Çevrimiçi. Veriler Bulutla Eşitleniyor...
          </div>
        )}

        <main className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-5">
          <VesselDetails
            vesselName={vesselName}
            onVesselChange={setVesselName}
            captainName={captainName}
            onCaptainChange={setCaptainName}
            inspectionDate={inspectionDate}
            onDateChange={setInspectionDate}
          />

          <Tabs value={tab} onValueChange={setTab} className="gap-5">
            <TabsList className="grid h-11 w-full grid-cols-1 rounded-xl bg-secondary/60 p-1">
              <TabsTrigger value="checklist" className="rounded-lg text-sm font-medium">
                Checklist
              </TabsTrigger>
            </TabsList>

            <TabsContent value="checklist" className="flex flex-col gap-5">
              <Filters
                search={search}
                onSearch={setSearch}
                section={section}
                onSection={setSection}
                status={status}
                onStatus={setStatus}
                onReset={resetFilters}
              />

              <div className="flex flex-col gap-4">
                {filtered.length > 0 ? (
                  filtered.map((item) => (
                    <ChecklistItemCard
                      key={item.id}
                      item={item}
                      photos={photoMap[item.id] ?? []}
                      isUploading={uploadingMap[item.id] ?? false}
                      onStatus={updateStatus}
                      onRemarks={updateRemarks}
                      onPhotosChange={updatePhotos}
                      onUploadingChange={setUploading}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-12 text-center">
                    <SearchX className="size-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Aradığınız kriterlere uygun madde bulunamadı.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>

        <BottomNav
          onReport={() => { }}
          onSave={handleSaveInspection}
          onPdf={handleExportPdf}
        />
      </div>

      {/* Native PDF Print Template */}
      <div className="hidden print:block w-full">
        <PdfReport
          ref={pdfRef}
          items={items}
          photoMap={photoMap}
          vesselName={vesselName}
          captainName={captainName}
          inspectionDate={inspectionDate}
          inspectorName={currentUser?.username || "Unknown"}
        />
      </div>

      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background rounded-2xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-6">
            <h3 className="text-xl font-bold text-center text-foreground">Denetimi Kaydet</h3>
            <p className="text-sm text-center text-muted-foreground">
              Denetimi tamamlamak mı istiyorsunuz, yoksa daha sonra devam etmek üzere mi kaydetmek istiyorsunuz?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => confirmSaveInspection("completed")}
                className="w-full py-3 rounded-xl bg-status-deficiency text-white font-semibold shadow-md hover:opacity-90 transition-opacity"
              >
                Inspection'u tamamla
              </button>
              <button
                onClick={() => confirmSaveInspection("in_progress")}
                className="w-full py-3 rounded-xl bg-status-observation text-white font-semibold shadow-md hover:opacity-90 transition-opacity"
              >
                Daha sonra devam etmek üzere kaydet
              </button>
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="w-full py-2 mt-2 rounded-xl bg-transparent border border-muted text-muted-foreground font-medium hover:bg-secondary/30 transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}