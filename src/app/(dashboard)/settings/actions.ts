"use server"

import db from "@/lib/db"
import { getOrCreateProfile } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updateUserSettings(
  name: string,
  focusGoalMinutes: number,
  waterGoalMl: number
) {
  const profile = await getOrCreateProfile()
  if (!profile) {
    return { error: "Unauthorized" }
  }

  if (!name.trim()) {
    return { error: "Name cannot be empty" }
  }

  if (focusGoalMinutes < 5 || focusGoalMinutes > 480) {
    return { error: "Focus goal must be between 5 and 480 minutes" }
  }

  if (waterGoalMl < 250 || waterGoalMl > 10000) {
    return { error: "Hydration goal must be between 250ml and 10000ml" }
  }

  try {
    await db.user.update({
      where: { id: profile.id },
      data: {
        name: name.trim(),
        dailyFocusGoalSec: focusGoalMinutes * 60,
        dailyWaterGoalMl: waterGoalMl,
      },
    })

    revalidatePath("/")
    revalidatePath("/settings")
    return { success: true }
  } catch (err) {
    console.error("Failed to update user settings:", err)
    return { error: "Failed to save settings changes" }
  }
}
