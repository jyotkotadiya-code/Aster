import * as React from "react"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColorClass?: string
  subtext?: string
  bgClass?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColorClass = "text-primary bg-primary-fixed/40",
  subtext,
  bgClass = "bg-surface-container-high",
}: StatCardProps) {
  return (
    <div className={`rounded-xl p-5 shadow-soft border border-outline-variant/15 hover-lift transition-all duration-300 ${bgClass}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-primary uppercase tracking-widest font-heading">
          {title}
        </span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconColorClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      
      <div className="mt-3 space-y-1">
        <p className="text-2xl font-bold text-foreground tracking-tight font-display">
          {value}
        </p>
        {subtext && (
          <p className="text-[11px] text-muted-foreground font-semibold leading-relaxed">
            {subtext}
          </p>
        )}
      </div>
    </div>
  )
}
