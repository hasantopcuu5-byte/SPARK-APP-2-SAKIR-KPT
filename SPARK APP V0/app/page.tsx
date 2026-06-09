"use client"

import { useMemo, useState, useEffect } from "react"
import { AppBar } from "@/components/app-bar"
import { VesselDetails } from "@/components/vessel-details"
import { SummaryBar } from "@/components/summary-bar"
import { Filters } from "@/components/filters"
import { ChecklistItemCard } from "@/components/checklist-item-card"
import { DeficiencyTable } from "@/components/deficiency-table"
import { BottomNav } from "@/components/bottom-nav"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { initialItems, type ChecklistItem, type Status } from "@/lib/inspection-data"
import { SearchX } from "lucide-react"

// localforage kütüphanesini dinamik yükleme (Next.js SSR uyumluluğu için)
import localforage from "localforage"

export default function Page() {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems)
  const [search, setSearch] = useState("")
  const [section, setSection] = useState("all")
  const [status, setStatus] = useState("all")
  const [tab, setTab] = useState("checklist")

  const totalCount = 656

  // Uygulama ilk açıldığında IndexedDB'de kayıtlı taslak var mı kontrol et (Auto-Load)
  useEffect(() => {
    localforage.getItem<ChecklistItem[]>("spark_indexeddb_inspection").then((savedItems) => {
      if (savedItems && savedItems.length === items.length) {
        setItems(savedItems)
      }
    }).catch(err => console.error("IndexedDB load error:", err))
  }, [])

  // Gerçek zamanlı istatistik hesaplayıcı (RAM ve CPU dostu useMemo)
  const counts = useMemo(() => {
    const ok = items.filter((i) => i.status === "ok").length
    const deficiency = items.filter((i) => i.status === "deficiency").length
    const observation = items.filter((i) => i.status === "observation").length
    const checked = items.filter((i) => i.status !== "select").length
    const photos = items.reduce((sum, i) => sum + (i.photos?.length || 0), 0)
    return { ok, deficiency, observation, checked, photos }
  }, [items])

  // Arama ve filtreleme filtresi
  const filtered = useMemo(() => {
    return items.filter((i) => {
      const matchSearch =
        search.trim() === "" || 
        i.question.toLowerCase().includes(search.toLowerCase()) ||
        i.remarks.toLowerCase().includes(search.toLowerCase()) ||
        String(i.id).includes(search)
      
      const matchSection = section === "all" || i.section === section
      const matchStatus = status === "all" || i.status === status
      return matchSearch && matchSection && matchStatus
    })
  }, [items, search, section, status])

  // Durum Değişiklik Yönetimi
  function updateStatus(id: number, s: Status) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: s } : i)))
  }

  // Bulgular/Remarks Yönetimi
  function updateRemarks(id: number, remarks: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, remarks } : i)))
  }

  // Profesyonel Fotoğraf Dosya Yönetimi (IndexedDB Çökme Korumalı Base64 Altyapısı)
  function addPhoto(id: number) {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.multiple = true
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement
      if (!target.files) return
      
      Array.from(target.files).forEach(file => {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            const base64Data = event.target.result as string
            setItems((prev) =>
              prev.map((i) => (i.id === id ? { ...i, photos: [...(i.photos || []), base64Data] } : i))
            )
          }
        }
        reader.readAsDataURL(file)
      })
    }
    input.click()
  }

  function removePhoto(id: number, index: number) {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, photos: i.photos.filter((_, idx) => idx !== index) } : i,
      ),
    )
  }

  function resetFilters() {
    setSearch("")
    setSection("all")
    setStatus("all")
  }

  // Taslağı Kalıcı Olarak Telefona/Tablete Kaydet (IndexedDB - Sınırsız Hafıza Modu)
  async function handleSaveDraft() {
    try {
      await localforage.setItem("spark_indexeddb_inspection", items)
      alert("Denetim taslağı cihazın güvenli hafızasına (IndexedDB) kaydedildi! İnternet olmasa bile verileriniz sapağlam duruyor.")
    } catch (err) {
      console.error(err)
      alert("Taslak kaydedilirken bir hata oluştu.")
    }
  }

  // PDF Çıktı Alma (Rapor Modu)
  function handleExportPdf() {
    window.print()
  }

  return (
    <div className="min-h-dvh bg-background pb-28">
      <AppBar />

      <main className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-5">
        <VesselDetails />

        <SummaryBar
          total={totalCount}
          checked={counts.checked}
          ok={counts.ok}
          deficiency={counts.deficiency}
          observation={counts.observation}
          photos={counts.photos}
        />

        <Tabs value={tab} onValueChange={setTab} className="gap-5">
          <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl bg-secondary/60 p-1 no-print">
            <TabsTrigger value="checklist" className="rounded-lg text-sm font-medium">
              Checklist
            </TabsTrigger>
            <TabsTrigger value="deficiency" className="rounded-lg text-sm font-medium">
              Deficiencies
              {counts.deficiency > 0 && (
                <span className="ml-1.5 flex size-5 items-center justify-center rounded-full bg-status-deficiency text-[10px] font-bold text-white">
                  {counts.deficiency}
                </span>
              )}
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
                    onStatus={updateStatus}
                    onRemarks={updateRemarks}
                    onAddPhoto={addPhoto}
                    onRemovePhoto={removePhoto}
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

          <TabsContent value="deficiency">
            <DeficiencyTable items={items} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Profesyonel Buton Bağlantıları Tamamlanmış Alt Menü */}
      <BottomNav 
        onReport={() => setTab("deficiency")} 
        onSave={handleSaveDraft} 
        onPdf={handleExportPdf} 
      />
    </div>
  )
}
