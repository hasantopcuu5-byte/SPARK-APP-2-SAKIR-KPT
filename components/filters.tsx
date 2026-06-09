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
import { Search, RotateCcw, Filter, ChevronUp, ChevronDown } from "lucide-react"
import { SECTIONS } from "@/lib/inspection-data"
import { useRef, useState } from "react"

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
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showScrollButtons, setShowScrollButtons] = useState(false)

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollHeight, clientHeight } = scrollContainerRef.current
      setShowScrollButtons(scrollHeight > clientHeight)
    }
  }

  const scroll = (direction: "up" | "down") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 120
      scrollContainerRef.current.scrollBy({
        top: direction === "down" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      })
    }
  }

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

      {/* Filter Option Card */}
      <Card className="gap-3 border border-secondary/40 bg-secondary/20 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Filter Options</h3>
          {showScrollButtons && (
            <div className="flex gap-1">
              <button
                onClick={() => scroll("up")}
                className="flex size-8 items-center justify-center rounded-lg bg-secondary/60 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground active:bg-secondary"
                aria-label="Scroll up"
                title="Scroll up"
              >
                <ChevronUp className="size-4" />
              </button>
              <button
                onClick={() => scroll("down")}
                className="flex size-8 items-center justify-center rounded-lg bg-secondary/60 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground active:bg-secondary"
                aria-label="Scroll down"
                title="Scroll down"
              >
                <ChevronDown className="size-4" />
              </button>
            </div>
          )}
        </div>

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onLoad={handleScroll}
          className="flex max-h-56 flex-col gap-4 overflow-y-auto pr-1"
        >
          {/* Madde Sectionları */}
          <div className="flex-shrink-0">
            <label className="mb-2.5 block text-xs font-semibold uppercase tracking-wide text-foreground">
              Madde Sectionları
            </label>
            <Select value={section} onValueChange={onSection}>
              <SelectTrigger className="!h-11 rounded-xl bg-secondary/40 text-sm">
                <SelectValue placeholder="Select Section" />
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
          </div>

          {/* Status */}
          <div className="flex-shrink-0">
            <label className="mb-2.5 block text-xs font-semibold uppercase tracking-wide text-foreground">
              Status
            </label>
            <Select value={status} onValueChange={onStatus}>
              <SelectTrigger className="!h-11 rounded-xl bg-secondary/40 text-sm">
                <SelectValue placeholder="Select Status" />
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
        </div>
      </Card>

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
