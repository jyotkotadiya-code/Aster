"use client"

import * as React from "react"
import { useState, useEffect, useTransition } from "react"
import { useTheme } from "next-themes"
import { updateUserSettings } from "@/app/(dashboard)/settings/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { 
  User, 
  Moon, 
  Sun, 
  Monitor, 
  Bell, 
  Loader2, 
  Save
} from "lucide-react"

interface Profile {
  id: string
  email: string
  name: string | null
  dailyWaterGoalMl: number
  dailyFocusGoalSec: number
}

interface SettingsFormProps {
  profile: Profile
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const { theme, setTheme } = useTheme()
  const [isPending, startTransition] = useTransition()

  // Profile Form States
  const [name, setName] = useState(profile.name ?? "")
  const [focusMinutes, setFocusMinutes] = useState(Math.round(profile.dailyFocusGoalSec / 60))
  const [waterMl, setWaterMl] = useState(profile.dailyWaterGoalMl)

  // Notification Toggles (stored in localStorage)
  const [waterAlerts, setWaterAlerts] = useState(true)
  const [eyeAlerts, setEyeAlerts] = useState(true)
  const [breakAlerts, setBreakAlerts] = useState(true)

  // Load notification states from localStorage on mount
  useEffect(() => {
    const savedWater = localStorage.getItem("reminders_water")
    const savedEye = localStorage.getItem("reminders_eye")
    const savedBreak = localStorage.getItem("reminders_break")

    if (savedWater !== null) setWaterAlerts(savedWater === "true")
    if (savedEye !== null) setEyeAlerts(savedEye === "true")
    if (savedBreak !== null) setBreakAlerts(savedBreak === "true")
  }, [])

  // Handle saving profile changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const result = await updateUserSettings(name, focusMinutes, waterMl)
      if (result.success) {
        toast.success("Settings saved successfully! 💾")
      } else if (result.error) {
        toast.error(result.error)
      }
    })
  }

  // Handle toggling alert preferences
  const handleToggleAlert = (type: "water" | "eye" | "break", value: boolean) => {
    if (type === "water") {
      setWaterAlerts(value)
      localStorage.setItem("reminders_water", String(value))
    } else if (type === "eye") {
      setEyeAlerts(value)
      localStorage.setItem("reminders_eye", String(value))
    } else if (type === "break") {
      setBreakAlerts(value)
      localStorage.setItem("reminders_break", String(value))
    }
    toast.success("Reminder preferences updated locally.")
  }

  // Smart Theme Switch helper
  const handleThemeChange = (target: "light" | "dark" | "system") => {
    if (target === "system") {
      setTheme("system")
      return
    }
    const currentTheme = theme || "bloom-light"
    const isDrift = currentTheme.includes("drift")
    if (target === "light") {
      setTheme(isDrift ? "drift-light" : "bloom-light")
    } else {
      setTheme(isDrift ? "drift-dark" : "bloom-dark")
    }
  }

  const isLightTheme = theme?.includes("light")
  const isDarkTheme = theme?.includes("dark")
  const isSystemTheme = theme === "system"

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left/Middle Column: Profile & Goals Form */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSaveProfile} className="glass-card p-6 rounded-2xl border border-outline-variant/15 shadow-soft space-y-5 bg-surface-container-low">
            <h3 className="font-bold text-base text-primary tracking-tight flex items-center border-b border-outline-variant/20 pb-3 font-heading">
              <User className="mr-1.5 h-4.5 w-4.5 text-primary" />
              Profile & Goals Settings
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-primary tracking-widest font-heading pl-1">Email (Read Only)</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="h-11 border-outline-variant/10 bg-surface-container text-muted-foreground/60 rounded-full px-4 text-xs font-semibold select-none cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-bold text-primary tracking-widest font-heading pl-1">Display Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isPending}
                className="h-11 border-outline-variant/30 bg-surface rounded-full focus-visible:ring-primary/20 focus-visible:border-primary text-xs font-semibold px-4 shadow-inner"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="focus-minutes" className="text-xs font-bold text-primary tracking-widest font-heading pl-1">Daily Focus Goal (Minutes)</Label>
                <Input
                  id="focus-minutes"
                  type="number"
                  min="5"
                  max="480"
                  value={focusMinutes}
                  onChange={(e) => setFocusMinutes(parseInt(e.target.value) || 0)}
                  required
                  disabled={isPending}
                  className="h-11 border-outline-variant/30 bg-surface rounded-full focus-visible:ring-primary/20 focus-visible:border-primary text-xs font-semibold px-4 shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="water-goal" className="text-xs font-bold text-primary tracking-widest font-heading pl-1">Daily Hydration Goal (ml)</Label>
                <Input
                  id="water-goal"
                  type="number"
                  min="250"
                  max="10000"
                  value={waterMl}
                  onChange={(e) => setWaterMl(parseInt(e.target.value) || 0)}
                  required
                  disabled={isPending}
                  className="h-11 border-outline-variant/30 bg-surface rounded-full focus-visible:ring-primary/20 focus-visible:border-primary text-xs font-semibold px-4 shadow-inner"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/20 flex justify-end">
              <Button
                type="submit"
                disabled={isPending}
                className="bg-primary text-primary-foreground hover:opacity-90 transition-all rounded-full font-bold cursor-pointer shadow-sm h-11 px-6 text-xs active:scale-95"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-1.5 h-3.5 w-3.5 fill-current" />
                    Save Goals
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Theme & Notifications settings */}
        <div className="space-y-6">
          {/* Theme Selector Widget */}
          <div className="glass-card p-5 rounded-2xl border border-outline-variant/15 shadow-soft space-y-4">
            <h3 className="font-bold text-[14px] text-primary tracking-tight flex items-center border-b border-outline-variant/20 pb-2.5 font-heading">
              <Sun className="mr-1.5 h-4 w-4 text-primary" />
              Theme Appearance
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {/* Light Card */}
              <button
                type="button"
                onClick={() => handleThemeChange("light")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                  isLightTheme 
                    ? "bg-primary-container border-outline-variant/30 text-primary font-bold shadow-sm" 
                    : "border-outline-variant/15 hover:bg-surface-container-high text-muted-foreground font-semibold"
                }`}
              >
                <Sun className="h-4 w-4" />
                <span className="text-[10px] font-heading font-bold">Light</span>
              </button>

              {/* Dark Card */}
              <button
                type="button"
                onClick={() => handleThemeChange("dark")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                  isDarkTheme 
                    ? "bg-primary-container border-outline-variant/30 text-primary font-bold shadow-sm" 
                    : "border-outline-variant/15 hover:bg-surface-container-high text-muted-foreground font-semibold"
                }`}
              >
                <Moon className="h-4 w-4" />
                <span className="text-[10px] font-heading font-bold">Dark</span>
              </button>

              {/* System Card */}
              <button
                type="button"
                onClick={() => handleThemeChange("system")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                  isSystemTheme 
                    ? "bg-primary-container border-outline-variant/30 text-primary font-bold shadow-sm" 
                    : "border-outline-variant/15 hover:bg-surface-container-high text-muted-foreground font-semibold"
                }`}
              >
                <Monitor className="h-4 w-4" />
                <span className="text-[10px] font-heading font-bold">System</span>
              </button>
            </div>
          </div>

          {/* Health Reminders Toggles */}
          <div className="glass-card p-5 rounded-2xl border border-outline-variant/15 shadow-soft space-y-4">
            <h3 className="font-bold text-[14px] text-primary tracking-tight flex items-center border-b border-outline-variant/20 pb-2.5 font-heading">
              <Bell className="mr-1.5 h-4 w-4 text-primary animate-pulse" />
              Mindful Alerts
            </h3>

            <div className="space-y-3.5">
              {/* Eye exercise toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="toggle-eye" className="text-xs font-bold text-foreground cursor-pointer select-none font-heading">
                    Eye Relief Reminders
                  </Label>
                  <p className="text-[9px] text-muted-foreground font-semibold leading-relaxed">Prompt 20-20-20 rule every 20m</p>
                </div>
                <input
                  type="checkbox"
                  id="toggle-eye"
                  checked={eyeAlerts}
                  onChange={(e) => handleToggleAlert("eye", e.target.checked)}
                  className="h-4 w-4 accent-primary cursor-pointer rounded-full"
                />
              </div>

              {/* Water reminder toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="toggle-water" className="text-xs font-bold text-foreground cursor-pointer select-none font-heading">
                    Hydration Reminders
                  </Label>
                  <p className="text-[9px] text-muted-foreground font-semibold leading-relaxed">Prompt water sip alerts every 45m</p>
                </div>
                <input
                  type="checkbox"
                  id="toggle-water"
                  checked={waterAlerts}
                  onChange={(e) => handleToggleAlert("water", e.target.checked)}
                  className="h-4 w-4 accent-primary cursor-pointer rounded-full"
                />
              </div>

              {/* Break reminder toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="toggle-break" className="text-xs font-bold text-foreground cursor-pointer select-none font-heading">
                    Stretch Breaks Reminders
                  </Label>
                  <p className="text-[9px] text-muted-foreground font-semibold leading-relaxed">Prompt relaxation breaks every 25m</p>
                </div>
                <input
                  type="checkbox"
                  id="toggle-break"
                  checked={breakAlerts}
                  onChange={(e) => handleToggleAlert("break", e.target.checked)}
                  className="h-4 w-4 accent-primary cursor-pointer rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
