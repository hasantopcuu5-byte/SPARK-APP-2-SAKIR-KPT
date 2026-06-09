"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, LogOut } from "lucide-react"
import type { User, InspectionRecord } from "@/lib/auth"
import { getInspectionRecordsByUser, logout, setCurrentUser } from "@/lib/auth"
import { useState, useEffect } from "react"
import { SummaryBar } from "@/components/summary-bar"

export function HistoryScreen({ user, onBack }: { user: User; onBack: () => void }) {
  const [records, setRecords] = useState<InspectionRecord[]>([])

  useEffect(() => {
    const userRecords = getInspectionRecordsByUser(user.id)
    setRecords(userRecords)
  }, [user.id])

  const handleLogout = () => {
    logout()
    setCurrentUser(null)
    onBack()
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
          variant="ghost"
          className="w-fit gap-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Geri Dön
        </Button>

        {records.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-12 text-center">
            <p className="text-sm text-muted-foreground">Henüz denetim kaydı bulunmamaktadır.</p>
            <p className="text-xs text-muted-foreground">Yeni bir denetim tamamlayarak kayıt ekleyin.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-6">
            {records.map((record) => {
              // Bu kısımlar her bir geçmiş kayıt için sayıları hesaplar
              const totalCount = record.items.length
              const okCount = record.items.filter((i) => i.status === "ok").length
              const defCount = record.items.filter((i) => i.status === "deficiency").length
              const obsCount = record.items.filter((i) => i.status === "observation").length
              const checkedCount = record.items.filter((i) => i.status !== "select").length
              const photosCount = record.items.reduce((sum, i) => sum + (i.photos?.length || 0), 0)

              return (
                <Card
                  key={record.id}
                  className="overflow-hidden p-0 transition-all hover:shadow-md"
                >
                  <div className="p-4 pb-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground text-lg">{record.vesselName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Kaptan: <span className="font-medium text-foreground">{record.captainName}</span>
                        </p>
                      </div>
                      <Badge className="bg-status-ok/20 text-status-ok">{record.status}</Badge>
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

                  {/* Şık İstatistik Kartları (Summary Bar) Burada Çıkacak */}
                  <div className="bg-secondary/10 py-3 border-t overflow-hidden">
                    <SummaryBar
                      total={totalCount}
                      checked={checkedCount}
                      ok={okCount}
                      deficiency={defCount}
                      observation={obsCount}
                      photos={photosCount}
                    />
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
