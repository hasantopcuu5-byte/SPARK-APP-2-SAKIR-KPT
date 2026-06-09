import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, ShieldCheck } from "lucide-react"
import type { ChecklistItem } from "@/lib/inspection-data"

export function DeficiencyTable({ items }: { items: ChecklistItem[] }) {
  const deficiencies = items.filter((i) => i.status === "deficiency")

  if (deficiencies.length === 0) {
    return (
      <Card className="items-center gap-3 px-4 py-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-status-ok/10">
          <ShieldCheck className="size-7 text-status-ok" />
        </div>
        <h3 className="text-base font-semibold text-foreground">No Deficiencies Recorded</h3>
        <p className="max-w-xs text-pretty text-sm text-muted-foreground">
          Items marked as &quot;Deficiency&quot; will appear here for the deficiency report.
        </p>
      </Card>
    )
  }

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div className="flex items-center gap-2 border-b bg-status-deficiency/10 px-4 py-3">
        <AlertTriangle className="size-4 text-status-deficiency" />
        <h3 className="text-sm font-semibold text-foreground">
          {deficiencies.length} {deficiencies.length === 1 ? "Deficiency" : "Deficiencies"}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Finding</TableHead>
              <TableHead>Section</TableHead>
              <TableHead className="text-right">Regs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deficiencies.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-mono font-bold text-status-deficiency">{d.id}</TableCell>
                <TableCell className="max-w-[220px]">
                  <p className="font-medium text-foreground">{d.question}</p>
                  {d.remarks && <p className="mt-1 text-xs text-muted-foreground">{d.remarks}</p>}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{d.section}</TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-1">
                    {d.regulations.map((r) => (
                      <Badge key={r} variant="outline" className="font-mono text-[10px]">
                        {r}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
