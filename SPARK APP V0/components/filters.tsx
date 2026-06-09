"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, RotateCcw, Filter } from "lucide-react"
import { SECTIONS } from "@/lib/inspection-data"

export function Filters({
  search,
  onSearch,
  section,
  onSection,
  status,
  onStatus,
  onReset,
}: {
  search: string
  onSearch: (v: string) => void
  section: string
  onSection: (v: string) => void
  status: string
  onStatus: (v: string) => void
  onReset: () => void
}) {
  return (
    <Card className="gap-3 p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search checklist items..."
          className="h-11 rounded-xl bg-secondary/40 pl-9 text-base"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select value={section} onValueChange={onSection}>
          <SelectTrigger className="!h-11 rounded-xl bg-secondary/40">
            <SelectValue placeholder="Section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sections</SelectItem>
            {SECTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={onStatus}>
          <SelectTrigger className="!h-11 rounded-xl bg-secondary/40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ok">OK</SelectItem>
            <SelectItem value="deficiency">Deficiency</SelectItem>
            <SelectItem value="observation">Observation</SelectItem>
            <SelectItem value="na">N/A</SelectItem>
            <SelectItem value="select">Unchecked</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        variant="ghost"
        onClick={onReset}
        className="h-10 justify-start gap-2 px-2 text-muted-foreground hover:text-foreground"
      >
        <RotateCcw className="size-4" />
        Reset Filters
        <Filter className="ml-auto size-4 opacity-50" />
      </Button>
    </Card>
  )
}
