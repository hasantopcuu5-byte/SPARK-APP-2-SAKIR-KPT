import { Button } from "@/components/ui/button"
import { Save, History, LogOut } from "lucide-react"

export function BottomNav({
  onReport,
  onSave,
  onPdf,
}: {
  onReport: () => void
  onSave: () => void
  onPdf: () => void
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/20 bg-navy/80 backdrop-blur-xl backdrop-saturate-150">
      <div
        className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-3"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <Button
          onClick={onSave}
          className="h-12 flex-1 flex-col gap-0.5 rounded-xl border border-white/25 bg-status-ok text-white hover:bg-status-ok/90 font-semibold"
        >
          <Save className="size-5" />
          <span className="text-[11px] font-medium">Kaydet</span>
        </Button>
        <Button
          onClick={onPdf}
          className="h-12 flex-[1.3] flex-col gap-0.5 rounded-xl bg-gold font-semibold text-gold-foreground shadow-lg shadow-gold/20 hover:bg-gold/90"
        >
          <History className="size-5" />
          <span className="text-[11px] font-semibold">PDF Rapor</span>
        </Button>
      </div>
    </nav>
  )
}
