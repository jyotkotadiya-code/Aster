"use client"

import * as React from "react"
import { useState } from "react"
import { BarChart3 } from "lucide-react"

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
    <div className="glass-card p-6 rounded-2xl shadow-soft border border-outline-variant/15 space-y-6 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="font-bold text-primary tracking-tight flex items-center font-heading">
            <BarChart3 className="mr-1.5 h-4 w-4 text-primary" />
            Weekly Study Focus
          </h3>
          <p className="text-xs text-muted-foreground font-semibold">
            Focus minutes logged over the last 7 days
          </p>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-bold text-primary bg-primary-container/30 border border-outline-variant/20 px-2.5 py-0.5 rounded-full select-none font-heading">
          <span className="inline-block h-2 w-2 rounded-full bg-primary" />
          <span>Minutes Studied</span>
        </div>
      </div>

      {/* Chart container */}
      <div className="relative pt-6">
        {/* Y Axis Grid Guidelines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] text-muted-foreground/50 font-bold font-heading">
          <div className="w-full border-t border-outline-variant/15 pt-0.5">{Math.round(maxMinutes)}m</div>
          <div className="w-full border-t border-outline-variant/15 pt-0.5">{Math.round(maxMinutes / 2)}m</div>
          <div className="w-full border-t border-outline-variant/15 pt-0.5">0m</div>
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
                  <div className="absolute -top-10 bg-card border border-outline-variant/30 text-foreground text-[10px] px-3 py-1 rounded-full shadow-medium z-20 select-none font-bold animate-in fade-in zoom-in-95 duration-100 flex flex-row items-center gap-1.5">
                    <span className="text-primary">{d.minutes}m focus</span>
                    <span className="text-muted-foreground/30 font-normal">|</span>
                    <span className="text-secondary">{d.water}ml water</span>
                  </div>
                )}

                {/* Vertical Bar */}
                <div
                  style={{ height: `${pct}%` }}
                  className={`w-8 sm:w-11 rounded-t-xl transition-all duration-300 relative flex items-end justify-center ${
                    isHovered
                      ? "bg-primary/95 border-t border-x border-primary shadow-soft"
                      : "bg-primary-container/40 border-t border-x border-outline-variant/15"
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
