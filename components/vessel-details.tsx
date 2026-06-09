import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Ship, Hash, Calendar, MapPin, UserCheck, Anchor } from "lucide-react"

const fields = [
  { id: "vessel", label: "Vessel Name", placeholder: "MV Northern Star", icon: Ship },
  { id: "imo", label: "IMO Number", placeholder: "9123456", icon: Hash },
  { id: "date", label: "Date", placeholder: "", icon: Calendar, type: "date" },
  { id: "port", label: "Port", placeholder: "Rotterdam", icon: MapPin },
  { id: "inspector", label: "Inspector", placeholder: "J. Hansen", icon: UserCheck },
  { id: "master", label: "Master", placeholder: "A. Romano", icon: Anchor },
]

export function VesselDetails() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b bg-muted/50 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Vessel Details</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
        {fields.map((f) => {
          const Icon = f.icon
          return (
            <div key={f.id} className="flex flex-col gap-1.5">
              <Label htmlFor={f.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className="size-3.5 text-gold" />
                {f.label}
              </Label>
              <Input
                id={f.id}
                type={f.type ?? "text"}
                placeholder={f.placeholder}
                className="h-11 rounded-xl bg-secondary/40 text-base"
              />
            </div>
          )
        })}
      </div>
    </Card>
  )
}
