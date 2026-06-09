import { Button } from "@/components/ui/button"
import { FileWarning, Save, FileText } from "lucide-react"

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
          variant="ghost"
          onClick={onReport}
          className="h-12 flex-1 flex-col gap-0.5 rounded-xl text-navy-foreground hover:bg-white/10 hover:text-navy-foreground"
        >
          <FileWarning className="size-5 text-status-deficiency" />
          <span className="text-[11px] font-medium">Deficiency</span>
        </Button>
        <Button
          onClick={onSave}
          className="h-12 flex-1 flex-col gap-0.5 rounded-xl border border-white/25 bg-white/10 text-navy-foreground hover:bg-white/20"
        >
          <Save className="size-5" />
          <span className="text-[11px] font-medium">Save Draft</span>
        </Button>
        <Button
          onClick={onPdf}
          className="h-12 flex-[1.3] flex-col gap-0.5 rounded-xl bg-gold font-semibold text-gold-foreground shadow-lg shadow-gold/20 hover:bg-gold/90"
        >
          <FileText className="size-5" />
          <span className="text-[11px] font-semibold">Full PDF</span>
        </Button>
      </div>
    </nav>
  )
}
