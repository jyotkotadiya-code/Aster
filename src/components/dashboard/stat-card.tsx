import * as React from "react"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColorClass?: string
  subtext?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColorClass = "text-primary bg-primary/10",
  subtext,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft hover:shadow-medium hover:scale-[1.01] transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconColorClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      
      <div className="mt-3 space-y-1">
        <p className="text-2xl font-semibold text-foreground tracking-tight">
          {value}
        </p>
        {subtext && (
          <p className="text-xs text-muted-foreground">
            {subtext}
          </p>
        )}
      </div>
    </div>
  )
}
