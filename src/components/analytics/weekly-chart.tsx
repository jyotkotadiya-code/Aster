"use client"

import * as React from "react"
import { useState } from "react"
import { BarChart3, Activity } from "lucide-react"

interface ChartDataPoint {
  label: string
  minutes: number
  water: number
}

interface WeeklyChartProps {
  data: ChartDataPoint[]
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Find max minutes to scale chart height, default minimum of 30 minutes scale
  const maxMinutes = Math.max(...data.map((d) => d.minutes), 30)

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold text-base text-foreground tracking-tight flex items-center">
            <BarChart3 className="mr-1.5 h-4 w-4 text-primary" />
            Weekly Study Focus
          </h3>
          <p className="text-xs text-muted-foreground">
            Focus minutes logged over the last 7 days
          </p>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-semibold text-muted-foreground select-none">
          <span className="inline-block h-2 w-2 rounded bg-primary/20 border border-primary/20" />
          <span>Minutes Studied</span>
        </div>
      </div>

      {/* Chart container */}
      <div className="relative pt-6">
        {/* Y Axis Grid Guidelines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] text-muted-foreground/40 font-mono">
          <div className="w-full border-t border-border/30 pt-0.5">{Math.round(maxMinutes)}m</div>
          <div className="w-full border-t border-border/30 pt-0.5">{Math.round(maxMinutes / 2)}m</div>
          <div className="w-full border-t border-border/30 pt-0.5">0m</div>
        </div>

        {/* Bars Grid */}
        <div className="flex items-end justify-between h-48 pt-4 pb-2 px-1 relative z-10">
          {data.map((d, idx) => {
            const pct = (d.minutes / maxMinutes) * 100
            const isHovered = hoveredIndex === idx

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center group cursor-pointer relative"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Custom Tooltip */}
                {isHovered && (
                  <div className="absolute -top-10 bg-zinc-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-medium z-20 select-none font-bold animate-in fade-in zoom-in-95 duration-100 flex flex-col items-center">
                    <span>{d.minutes} mins focus</span>
                    <span className="text-[9px] text-zinc-400 font-normal">{(d.water)}ml water</span>
                    {/* Tooltip arrow */}
                    <div className="w-1.5 h-1.5 bg-zinc-900 rotate-45 translate-y-1" />
                  </div>
                )}

                {/* Vertical Bar */}
                <div
                  style={{ height: `${pct}%` }}
                  className={`w-8 sm:w-11 rounded-t-lg transition-all duration-300 relative flex items-end justify-center ${
                    isHovered
                      ? "bg-primary border-t border-x border-primary shadow-soft"
                      : "bg-primary/20 border-t border-x border-primary/25"
                  }`}
                >
                  {d.minutes > 10 && (
                    <span className={`text-[9px] font-bold mb-1.5 select-none transition-opacity duration-200 ${
                      isHovered ? "text-primary-foreground opacity-100" : "text-primary opacity-0"
                    }`}>
                      {d.minutes}
                    </span>
                  )}
                </div>

                {/* Day label */}
                <span className={`text-[10px] font-bold mt-3 transition-colors ${
                  isHovered ? "text-primary" : "text-muted-foreground"
                }`}>
                  {d.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
