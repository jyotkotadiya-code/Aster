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
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft hover:shadow-medium transition-all duration-200 flex flex-col justify-between h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
            Focus Progress
          </span>
          <p className="text-sm font-medium text-foreground">
            Goal-oriented studying
          </p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg text-primary bg-primary/10">
          <Brain className="h-4 w-4 fill-current" />
        </div>
      </div>

      {/* Progress display */}
      <div className="space-y-2">
        <div className="flex items-end justify-between">
          <p className="text-2xl font-semibold tracking-tight">
            {formatTime(todayFocusMinutes)}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              / {formatTime(dailyGoalMinutes)}
            </span>
          </p>
          <span className="text-xs font-semibold text-primary">
            {Math.round(percentage)}%
          </span>
        </div>
        
        {/* Progress Bar with Primary Accent color (Sage Green) */}
        <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out" 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Subtext */}
      <div className="flex items-center space-x-1.5 text-xs text-muted-foreground pt-1 border-t border-border/50">
        <Timer className="h-3.5 w-3.5" />
        <span>
          {percentage === 100 
            ? "Daily study goal accomplished! Excellent!" 
            : `${formatTime(Math.max(dailyGoalMinutes - todayFocusMinutes, 0))} remaining to complete your goal.`}
        </span>
      </div>
    </div>
  )
}
