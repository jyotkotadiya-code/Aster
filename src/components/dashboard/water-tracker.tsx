"use client"

import * as React from "react"
import { useState, useTransition, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Droplet, Plus, RefreshCw, Loader2 } from "lucide-react"
import { logWaterIntakeAction } from "@/app/(dashboard)/study/actions"
import { toast } from "sonner"

interface WaterTrackerProps {
  initialWaterMl?: number
  dailyGoalMl?: number
}

export function WaterTracker({
  initialWaterMl = 0,
  dailyGoalMl = 2000,
}: WaterTrackerProps) {
  const [water, setWater] = useState(initialWaterMl)
  const [isPending, startTransition] = useTransition()

  // Update local state if the initialWaterMl prop changes (e.g. on server revalidation)
  useEffect(() => {
    setWater(initialWaterMl)
  }, [initialWaterMl])

  const handleAddWater = () => {
    const newWater = Math.min(water + 250, 5000) // cap at 5L
    setWater(newWater)

    startTransition(async () => {
      const res = await logWaterIntakeAction(250)
      if (!res.success) {
        toast.error("Failed to sync water intake with database.")
        // Rollback local state on failure
        setWater(water)
      } else {
        if (newWater >= dailyGoalMl && water < dailyGoalMl) {
          toast.success("Congratulations! You've reached your daily hydration goal! 🎉")
        } else {
          toast.info("Logged +250ml water. Keep going! 💧")
        }
      }
    })
  }

  const handleReset = () => {
    if (water === 0) return
    
    if (window.confirm("Reset today's water intake?")) {
      const originalWater = water
      setWater(0)

      startTransition(async () => {
        // We log negative water to reset to 0 in UserProgress
        // But since logWaterIntakeAction increments, we can pass negative of current water
        const res = await logWaterIntakeAction(-originalWater)
        if (!res.success) {
          toast.error("Failed to reset water intake in database.")
          setWater(originalWater)
        } else {
          toast.info("Hydration tracker reset.")
        }
      })
    }
  }

  const percentage = Math.min((water / dailyGoalMl) * 100, 100)

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft hover:shadow-medium transition-all duration-200 flex flex-col justify-between h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
            Hydration Tracker
          </span>
          <p className="text-sm font-medium text-foreground">
            Stay focused, drink water
          </p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary bg-secondary/10">
          <Droplet className="h-4 w-4 fill-current animate-pulse" />
        </div>
      </div>

      {/* Progress display */}
      <div className="space-y-2">
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-semibold tracking-tight">
              {water}
            </p>
            <span className="text-sm font-normal text-muted-foreground">/ {dailyGoalMl} ml</span>
          </div>
          <span className="text-xs font-semibold text-secondary">
            {Math.round(percentage)}%
          </span>
        </div>
        
        {/* Progress Bar with Secondary Accent color (Sky Blue) */}
        <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-secondary transition-all duration-500 ease-out" 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <Button
          size="sm"
          onClick={handleAddWater}
          disabled={isPending}
          className="flex-1 bg-secondary text-white hover:bg-secondary/90 transition-all rounded-md font-medium cursor-pointer h-9 px-3 text-xs"
        >
          {isPending ? (
            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="mr-1 h-3.5 w-3.5" />
          )}
          Add Glass (+250ml)
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
          disabled={isPending}
          className="h-9 w-9 border-border text-muted-foreground hover:text-foreground cursor-pointer"
          title="Reset"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  )
}
