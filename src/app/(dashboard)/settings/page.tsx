import * as React from "react"
import { getOrCreateProfile } from "@/lib/auth"
import { SettingsForm } from "@/components/settings/settings-form"

export default async function SettingsPage() {
  const profile = await getOrCreateProfile()

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="space-y-0.5">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary font-heading">
          Settings & Goals
        </h2>
        <p className="text-[13px] text-muted-foreground font-semibold leading-relaxed">
          Customize your study targets, reminders, and theme settings
        </p>
      </div>

      <SettingsForm profile={profile} />
    </div>
  )
}
