"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Droplet, Eye, Sparkles, X, Brain, Check } from "lucide-react"
import { logWaterIntakeAction, logReminderAction } from "@/app/(dashboard)/study/actions"
import { toast } from "sonner"

export type ReminderType = "WATER" | "EYE" | "BREAK"

interface StudyOverlayProps {
  type: ReminderType
  testMode?: boolean
  onClose: (waterLoggedAmount?: number) => void
}

export function StudyOverlay({
  type,
  testMode = false,
  onClose,
}: StudyOverlayProps) {
  // Determine duration depending on Test Mode
  const getInitialSeconds = () => {
    if (type === "EYE") return testMode ? 5 : 20
    if (type === "BREAK") return testMode ? 10 : 300 // 5 minutes
    return 0
  }

  const [secondsLeft, setSecondsLeft] = useState(getInitialSeconds())
  const [completed, setCompleted] = useState(false)
  const [isLogging, setIsLogging] = useState(false)
  const [breathPhase, setBreathPhase] = useState<"inhale" | "exhale">("inhale")

  // Log reminder trigger once on mount for statistics
  useEffect(() => {
    logReminderAction(type)
  }, [type])

  // Timer countdown logic
  useEffect(() => {
    if (type === "WATER") return

    if (secondsLeft <= 0) {
      setCompleted(true)
      return
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [secondsLeft, type])

  // Breathing animation cycles for Break reminders
  useEffect(() => {
    if (type !== "BREAK" || completed) return

    const breathing = setInterval(() => {
      setBreathPhase((prev) => (prev === "inhale" ? "exhale" : "inhale"))
    }, 4000) // 4s inhale, 4s exhale

    return () => clearInterval(breathing)
  }, [type, completed])

  // Log water intake server action helper
  const handleLogWater = async () => {
    setIsLogging(true)
    const result = await logWaterIntakeAction(250)
    setIsLogging(false)
    if (result.success) {
      toast.success("Glass of water logged successfully! 💧")
      onClose(250)
    } else {
      toast.error("Failed to log water intake.")
      onClose()
    }
  }

  // Formatting seconds left to MM:SS format
  const formatTimeLeft = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xl p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-md border border-border bg-card p-6 sm:p-8 rounded-2xl shadow-large text-center space-y-6 overflow-hidden">
        {/* Dynamic Wave background decoration for Water */}
        {type === "WATER" && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary animate-pulse" />
        )}

        {/* 1. WATER REMINDER OVERLAY */}
        {type === "WATER" && (
          <div className="space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10 text-secondary mx-auto">
              <Droplet className="h-8 w-8 fill-current animate-bounce" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Time to Hydrate
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                Studying consumes energy. Drink a glass of water to refresh your body, improve brain function, and keep your focus sharp.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={handleLogWater}
                disabled={isLogging}
                className="w-full h-11 bg-secondary text-white hover:bg-secondary/95 transition-all rounded-md font-medium cursor-pointer shadow-soft"
              >
                Drink a Glass (+250ml)
              </Button>
              <Button
                variant="ghost"
                onClick={() => onClose()}
                disabled={isLogging}
                className="w-full h-10 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* 2. EYE CARE EXERCISE OVERLAY */}
        {type === "EYE" && (
          <div className="space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
              <Eye className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Relax Your Eyes
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                20-20-20 Rule: Look away from the screen, focus on an object at least 20 feet away, and blink naturally.
              </p>
            </div>

            {/* Timer circle or numeric bar */}
            <div className="flex flex-col items-center justify-center">
              {!completed ? (
                <div className="space-y-1">
                  <div className="text-5xl font-mono font-bold tracking-tight text-primary">
                    {secondsLeft}s
                  </div>
                  <p className="text-xs font-semibold text-primary/70 animate-pulse">
                    Look away from the screen...
                  </p>
                </div>
              ) : (
                <div className="space-y-1 flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary mb-1">
                    <Check className="h-6 w-6 stroke-[3]" />
                  </div>
                  <p className="text-sm font-semibold text-primary">
                    Exercise complete!
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button
                onClick={() => onClose()}
                disabled={!completed && !testMode}
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/95 transition-all rounded-md font-medium cursor-pointer shadow-soft"
              >
                {completed ? "Resume Study" : "Skip Exercise"}
              </Button>
            </div>
          </div>
        )}

        {/* 3. BREATHING BREAK OVERLAY */}
        {type === "BREAK" && (
          <div className="space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
              <Brain className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Mindful Break Time
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                Step away from the screen, stretch your body, and take a deep breath.
              </p>
            </div>

            {/* Breathing animation and timer */}
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              {!completed ? (
                <>
                  <div className="text-4xl font-mono font-bold tracking-tight text-primary">
                    {formatTimeLeft(secondsLeft)}
                  </div>
                  <div className="flex items-center justify-center">
                    {/* Pulsing breathing indicator */}
                    <div className={`h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center transition-all duration-[4000ms] ease-in-out ${
                      breathPhase === "inhale" ? "scale-[1.6] bg-primary/20" : "scale-[0.9]"
                    }`}>
                      <span className="text-[9px] font-semibold text-primary uppercase select-none">
                        {breathPhase}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-1 flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary mb-1">
                    <Check className="h-6 w-6 stroke-[3]" />
                  </div>
                  <p className="text-sm font-semibold text-primary">
                    Break completed! Ready to learn?
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button
                onClick={() => onClose()}
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/95 transition-all rounded-md font-medium cursor-pointer shadow-soft"
              >
                {completed ? "Resume Study" : "Skip Break"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
