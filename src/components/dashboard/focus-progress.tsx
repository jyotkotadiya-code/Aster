"use client"

import * as React from "react"
import { Timer, Brain } from "lucide-react"

interface FocusProgressProps {
  todayFocusMinutes?: number
  dailyGoalMinutes?: number
}

export function FocusProgress({
  todayFocusMinutes = 0,
  dailyGoalMinutes = 120, // default 2 hours
}: FocusProgressProps) {
  const percentage = Math.min((todayFocusMinutes / dailyGoalMinutes) * 100, 100)

  // Format minutes into readable hours + minutes
  const formatTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (hours === 0) return `${minutes}m`
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="glass-card p-6 rounded-2xl shadow-soft hover:shadow-medium hover-lift transition-all duration-300 flex flex-col justify-between h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-xs font-bold text-primary uppercase tracking-widest block font-heading">
            Focus Progress
          </span>
          <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
            Goal-oriented studying
          </p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg text-primary bg-primary-container/30">
          <Brain className="h-4 w-4 fill-current" />
        </div>
      </div>

      {/* Progress display */}
      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-0.5">
            <p className="text-2xl font-bold tracking-tight font-display text-primary">
              {formatTime(todayFocusMinutes)}{" "}
            </p>
            <span className="text-[12px] font-bold text-muted-foreground font-heading">
              / {formatTime(dailyGoalMinutes)}
            </span>
          </div>
          <span className="text-[12px] font-bold text-primary font-heading">
            {Math.round(percentage)}%
          </span>
        </div>
        
        {/* Progress Bar with Primary Accent color (Sage Green) */}
        <div className="relative w-full h-3 bg-surface-container rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out rounded-full shadow-inner" 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Subtext */}
      <div className="flex items-center space-x-2 text-[11px] text-muted-foreground pt-3 border-t border-outline-variant/30 font-semibold leading-relaxed">
        <Timer className="h-3.5 w-3.5 text-primary" />
        <span>
          {percentage === 100 
            ? "Daily study goal accomplished! Excellent!" 
            : `${formatTime(Math.max(dailyGoalMinutes - todayFocusMinutes, 0))} remaining to complete your goal.`}
        </span>
      </div>
    </div>
  )
}
