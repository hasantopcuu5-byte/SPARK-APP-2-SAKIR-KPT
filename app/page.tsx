"use client"

import { useEffect, useMemo, useState } from "react"
import { AppBar } from "@/components/app-bar"
import { VesselDetails } from "@/components/vessel-details"
import { SummaryBar } from "@/components/summary-bar"
import { Filters } from "@/components/filters"
import { ChecklistItemCard } from "@/components/checklist-item-card"
import { BottomNav } from "@/components/bottom-nav"
import { AuthScreen } from "@/components/auth-screen"
import { HistoryScreen } from "@/components/history-screen"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { initialItems, type ChecklistItem, type Status } from "@/lib/inspection-data"
import { getCurrentUser, initializeUsers, saveInspectionRecord, type User } from "@/lib/auth"
import { SearchX } from "lucide-react"

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

  // Initialize auth and load current user on mount
  useEffect(() => {
    initializeUsers()
    const user = getCurrentUser()
    if (user) {
      setCurrentUser(user)
      setScreen("inspection")
    } else {
      setScreen("auth")
    }
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

  function handleSaveInspection() {
    if (!currentUser) {
      alert("Lütfen önce giriş yapınız")
      return
    }

    if (!vesselName || !captainName || !inspectionDate) {
      alert("Lütfen tüm gemi bilgilerini doldurunuz")
      return
    }

    const itemsWithPhotos = items.map((item) => ({
      ...item,
      photos: photoMap[item.id] ?? [],
    }))

    saveInspectionRecord(
      currentUser.id,
      currentUser.username,
      vesselName,
      captainName,
      inspectionDate,
      itemsWithPhotos,
    )

    alert("✅ Denetim başarıyla kaydedildi!")

    // Reset form
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
  }

  // Auth Screen
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

  // History Screen
  if (screen === "history" && currentUser) {
    return (
      <HistoryScreen
        user={currentUser}
        onBack={() => {
          setScreen("inspection")
        }}
      />
    )
  }

  // Inspection Screen
  return (
    <div className="min-h-dvh bg-background pb-28">
      <AppBar onHistoryClick={() => setScreen("history")} onLogout={() => setScreen("auth")} />

      <main className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-5">
        <VesselDetails
          vesselName={vesselName}
          onVesselChange={setVesselName}
          captainName={captainName}
          onCaptainChange={setCaptainName}
          inspectionDate={inspectionDate}
          onDateChange={setInspectionDate}
        />

        <SummaryBar
          total={totalCount}
          checked={counts.checked}
          ok={counts.ok}
          deficiency={counts.deficiency}
          observation={counts.observation}
          photos={counts.photos}
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
        onReport={() => {}}
        onSave={handleSaveInspection}
        onPdf={() => {}}
      />
    </div>
  )
}
