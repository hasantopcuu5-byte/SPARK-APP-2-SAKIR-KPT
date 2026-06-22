"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, LogOut } from "lucide-react"
import type { User, InspectionRecord } from "@/lib/auth"
import { fetchGlobalInspectionRecords, logout, setCurrentUser } from "@/lib/auth"
import { useState, useEffect } from "react"
import { SummaryBar } from "@/components/summary-bar"

import { cn } from "@/lib/utils"
import { Download, X, History, Trash2, Edit } from "lucide-react"
import { PdfReport } from "@/components/pdf-report"
import { deleteInspectionRecord } from "@/lib/auth"

export function HistoryScreen({ user, onBack, onResume }: { user: User; onBack: () => void; onResume?: (record: any) => void }) {
  const [records, setRecords] = useState<InspectionRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<InspectionRecord | null>(null)
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(true)

  const handleDeleteRecord = async (recordId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm("Bu kaydı kalıcı olarak silmek istediğinize emin misiniz?")) return

    setIsLoading(true)
    await deleteInspectionRecord(recordId)
    setRecords(records.filter((r) => r.id !== recordId))
    if (selectedRecord?.id === recordId) {
      setSelectedRecord(null)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    const loadRecords = async () => {
      setIsLoading(true)
      const allRecords = await fetchGlobalInspectionRecords()

      // 1. ADIM: Aynı ID'ye sahip mükerrer (duplicate) kayıtları filtreleyip teke düşürüyoruz
      const uniqueRecords = allRecords.filter((record, index, self) =>
        self.findIndex(r => r.id === record.id) === index
      )

      // 2. ADIM: Ayıklanmış temiz listeyi sıralıyoruz
      uniqueRecords.sort((a, b) => {
        if (a.status === "in_progress" && b.status !== "in_progress") return -1;
        if (a.status !== "in_progress" && b.status === "in_progress") return 1;

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setRecords(uniqueRecords)
      setIsLoading(false)
    }
    loadRecords()
  }, [])

  const handleLogout = async () => {
    await logout()
    await setCurrentUser(null)
    onBack()
  }

  const handleDownloadPhoto = (photoUrl: string) => {
    const link = document.createElement("a")
    link.href = photoUrl
    link.download = `photo-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (selectedRecord) {
    const filledItems = (selectedRecord.items || []).filter((i: any) => i.status !== "select")

    const photoMap: Record<number, string[]> = {}
    selectedRecord.items?.forEach((item: any) => {
      if (item.photos && item.photos.length > 0) {
        photoMap[item.id] = item.photos
      }
    })

    return (
      <>
        <div className="min-h-dvh bg-background pb-28 print:hidden">
          <div className="border-b bg-secondary/30">
            <div className="mx-auto flex max-w-2xl items-center gap-4 px-4 py-4">
              <Button
                onClick={() => setSelectedRecord(null)}
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground shrink-0"
              >
                <ChevronLeft className="size-5" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold text-foreground truncate">{selectedRecord.vesselName} Denetimi</h1>
                <p className="text-sm text-muted-foreground truncate">Tarih: {new Date(selectedRecord.inspectionDate).toLocaleDateString("tr-TR")}</p>
              </div>
            </div>
          </div>
          <main className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-5">
            {filledItems.length === 0 ? (
              <Card className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-12 text-center">
                <p className="text-sm text-muted-foreground">Bu denetimde doldurulmuş madde bulunmamaktadır.</p>
              </Card>
            ) : (
              <div className="flex flex-col gap-4">
                <h2 className="font-semibold text-lg text-foreground px-1">Doldurulan Maddeler ({filledItems.length})</h2>
                {filledItems.map((item: any) => (
                  <Card key={item.id} className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-gold">Madde {item.id}</span>
                        <Badge variant="secondary" className="rounded-full bg-navy/8 text-[11px] font-medium text-navy">
                          {item.section}
                        </Badge>
                      </div>
                      <Badge variant="outline" className={cn("text-xs font-semibold capitalize",
                        item.status === "ok" ? "text-status-ok border-status-ok/30 bg-status-ok/10" :
                          item.status === "deficiency" ? "text-status-deficiency border-status-deficiency/30 bg-status-deficiency/10" :
                            item.status === "observation" ? "text-status-observation border-status-observation/30 bg-status-observation/10" :
                              "text-muted-foreground border-border bg-muted"
                      )}>
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-[15px] font-medium text-foreground">{item.question}</p>

                    {item.remarks && (
                      <div className="rounded-xl bg-secondary/30 p-3 text-sm text-muted-foreground mt-1">
                        <span className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-foreground/70">Açıklama / Bulgu</span>
                        {item.remarks}
                      </div>
                    )}

                    {item.photos && item.photos.length > 0 && (
                      <div className="mt-1">
                        <span className="block text-xs font-bold uppercase tracking-wider mb-2 text-foreground/70">Fotoğraflar</span>
                        <div className="flex gap-2 overflow-x-auto pb-2 touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                          {item.photos.map((photo: string, idx: number) => (
                            <div
                              key={idx}
                              className="relative size-20 shrink-0 overflow-hidden rounded-xl border bg-secondary/40 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setPreviewPhoto(photo)}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={photo} alt={`Fotoğraf ${idx + 1}`} className="size-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </main>

          <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/20 bg-navy/80 backdrop-blur-xl backdrop-saturate-150">
            <div
              className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-3"
              style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
            >
              <Button
                onClick={() => window.print()}
                className="h-12 w-full flex-col gap-0.5 rounded-xl bg-gold font-semibold text-gold-foreground shadow-lg shadow-gold/20 hover:bg-gold/90"
              >
                <History className="size-5" />
                <span className="text-[11px] font-semibold">PDF Rapor</span>
              </Button>
            </div>
          </nav>

          {/* Photo Preview Modal */}
          {previewPhoto && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 backdrop-blur-sm print:hidden">
              <div className="absolute top-4 right-4 flex gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDownloadPhoto(previewPhoto)}
                  className="rounded-full bg-background/50 hover:bg-background"
                  title="İndir"
                >
                  <Download className="size-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPreviewPhoto(null)}
                  className="rounded-full bg-background/50 hover:bg-background"
                  title="Kapat"
                >
                  <X className="size-5" />
                </Button>
              </div>
              <div className="relative max-h-full max-w-full rounded-lg overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewPhoto}
                  alt="Büyük Önizleme"
                  className="max-h-[85vh] max-w-[95vw] object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* Native PDF Print Template */}
        <div className="hidden print:block w-full">
          <PdfReport
            items={selectedRecord.items || []}
            photoMap={photoMap}
            vesselName={selectedRecord.vesselName}
            captainName={selectedRecord.captainName}
            inspectionDate={selectedRecord.inspectionDate}
            inspectorName={(selectedRecord as any).inspectorName || user.username}
          />
        </div>
      </>
    )
  }

  return (
    <div className="min-h-dvh bg-background pb-28">
      <div className="border-b bg-secondary/30">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Geçmiş Kayıtlar</h1>
            <p className="text-sm text-muted-foreground">Kullanıcı: {user.username}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-4" />
            Çıkış
          </Button>
        </div>
      </div>

      <main className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-5">
        <Button
          onClick={onBack}
          variant="outline"
          className="w-fit gap-2 rounded-full px-5 shadow-sm hover:bg-secondary/50 text-foreground"
        >
          <ChevronLeft className="size-4" />
          Geri Dön
        </Button>

        {isLoading ? (
          <Card className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-12 text-center">
            <div className="size-8 animate-spin rounded-full border-4 border-navy border-t-transparent" />
            <p className="text-sm text-muted-foreground">Kayıtlar yükleniyor...</p>
          </Card>
        ) : records.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-12 text-center">
            <p className="text-sm text-muted-foreground">Henüz denetim kaydı bulunmamaktadır.</p>
            <p className="text-xs text-muted-foreground">Yeni bir denetim tamamlayarak kayıt ekleyin.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-6">
            {records.map((record) => {
              // Kayıtlı öğeleri sayıyoruz
              const items = record.items || []
              const totalCount = items.length
              const okCount = items.filter((i: any) => i.status === "ok").length
              const defCount = items.filter((i: any) => i.status === "deficiency").length
              const obsCount = items.filter((i: any) => i.status === "observation").length
              const checkedCount = items.filter((i: any) => i.status !== "select").length
              const photosCount = items.reduce((sum: number, i: any) => sum + (i.photos?.length || 0), 0)

              return (
                <Card
                  key={record.id}
                  className="overflow-hidden p-0 transition-all hover:shadow-md mb-4 cursor-pointer hover:border-gold/50"
                  onClick={() => {
                    if (record.status === "in_progress" && onResume) {
                      onResume(record)
                    } else {
                      setSelectedRecord(record)
                    }
                  }}
                >
                  {/* Üst Kısım: Orijinal Gemi, Kaptan ve Tarih Bilgileri */}
                  <div className="p-4 pb-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground text-lg transition-colors">{record.vesselName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Kaptan: <span className="font-medium text-foreground">{record.captainName}</span>
                        </p>
                      </div>
                      <Badge className={record.status === "in_progress" ? "bg-status-observation/90 text-white" : "bg-status-ok/20 text-status-ok"}>
                        {record.status === "in_progress" ? "In Progress" : "Completed"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-3 border-t border-secondary/50 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Denetim Tarihi</p>
                        <p className="font-medium text-foreground">
                          {new Date(record.inspectionDate).toLocaleDateString("tr-TR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Kaydedilme Tarihi</p>
                        <p className="font-medium text-foreground">
                          {new Date(record.createdAt).toLocaleDateString("tr-TR")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Alt Kısım: İstatistik Kartları (SummaryBar) */}
                  <div className="bg-secondary/10 py-3 border-t mt-3 min-w-0" onClick={(e) => e.stopPropagation()}>
                    <SummaryBar
                      total={totalCount}
                      checked={checkedCount}
                      ok={okCount}
                      deficiency={defCount}
                      observation={obsCount}
                      photos={photosCount}
                    />
                  </div>

                  {/* Admin Actions */}
                  {user.role === "admin" && (
                    <div className="flex gap-3 justify-end px-4 py-3 bg-secondary/20 border-t" onClick={(e) => e.stopPropagation()}>
                      {record.status === "completed" && onResume && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 text-navy border-navy/20 hover:bg-navy/10"
                          onClick={() => onResume(record)}
                        >
                          <Edit className="size-4" />
                          Düzenle
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                        onClick={(e) => handleDeleteRecord(record.id, e)}
                      >
                        <Trash2 className="size-4" />
                        Sil
                      </Button>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
