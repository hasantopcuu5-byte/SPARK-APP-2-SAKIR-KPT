import { Button } from "@/components/ui/button"
import { Save, History, LogOut } from "lucide-react"

export function AppBar({ onHistoryClick, onLogout }: { onHistoryClick?: () => void; onLogout?: () => void }) {
  return (
    <header className="border-b border-white/10 bg-navy/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
        <div className="flex flex-col items-center">
          <img src="/spark_logo2.jpg" alt="Company Logo" className="h-12 object-contain mb-1" />
          <p className="text-xs font-medium text-navy-foreground/80">Inspection System</p>
        </div>
        <div className="flex items-center gap-2">
          {onHistoryClick && (
            <Button
              onClick={onHistoryClick}
              variant="ghost"
              size="sm"
              className="gap-1.5 text-navy-foreground hover:bg-white/10"
              title="Geçmiş Kayıtlar"
            >
              <History className="size-4" />
              <span className="hidden sm:inline text-xs">Kayıtlar</span>
            </Button>
          )}
          {onLogout && (
            <Button
              onClick={onLogout}
              variant="ghost"
              size="sm"
              className="gap-1.5 text-status-deficiency hover:bg-status-deficiency/10"
              title="Çıkış Yap"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline text-xs">Çıkış</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
