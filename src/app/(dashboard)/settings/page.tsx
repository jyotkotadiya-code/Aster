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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Settings & Goals
        </h2>
        <p className="text-sm text-muted-foreground">
          Customize your study targets, reminders, and theme settings
        </p>
      </div>

      <SettingsForm profile={profile} />
    </div>
  )
}
