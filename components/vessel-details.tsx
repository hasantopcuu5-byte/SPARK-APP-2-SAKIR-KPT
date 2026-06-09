"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Ship, UserCheck, Calendar } from "lucide-react"
import { VESSEL_NAMES } from "@/lib/auth"

interface VesselDetailsProps {
  vesselName: string
  onVesselChange: (name: string) => void
  captainName: string
  onCaptainChange: (name: string) => void
  inspectionDate: string
  onDateChange: (date: string) => void
}

export function VesselDetails({
  vesselName,
  onVesselChange,
  captainName,
  onCaptainChange,
  inspectionDate,
  onDateChange,
}: VesselDetailsProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b bg-muted/50 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Gemi Bilgileri</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
        {/* Vessel Name Select */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="vessel" className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Ship className="size-3.5 text-gold" />
            Gemi Adı
          </Label>
          <Select value={vesselName} onValueChange={onVesselChange}>
            <SelectTrigger className="!h-11 rounded-xl bg-secondary/40">
              <SelectValue placeholder="Gemi Seçin" />
            </SelectTrigger>
            <SelectContent>
              {VESSEL_NAMES.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Captain Name Input */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="captain" className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <UserCheck className="size-3.5 text-gold" />
            Kaptan Adı
          </Label>
          <Input
            id="captain"
            type="text"
            value={captainName}
            onChange={(e) => onCaptainChange(e.target.value)}
            placeholder="Kaptan adını girin"
            className="h-11 rounded-xl bg-secondary/40 text-base"
          />
        </div>

        {/* Inspection Date */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date" className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="size-3.5 text-gold" />
            Denetim Tarihi
          </Label>
          <Input
            id="date"
            type="date"
            value={inspectionDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="h-11 rounded-xl bg-secondary/40 text-base"
          />
        </div>
      </div>
    </Card>
  )
}
