"use server"

import db from "@/lib/db"
import { getOrCreateProfile } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// Normalizes a Date to date-only (00:00:00.000) for consistent tracking
function getNormalizedToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export async function logStudySession(videoId: string | null, durationSeconds: number) {
  if (durationSeconds <= 0) return { error: "Invalid duration" }

  const profile = await getOrCreateProfile()
  if (!profile) {
    return { error: "Unauthorized" }
  }

  const today = getNormalizedToday()

  try {
    // 1. Log the study session
    await db.studySession.create({
      data: {
        userId: profile.id,
        videoId: videoId || null,
        duration: durationSeconds,
        completed: true,
      },
    })

    // 2. Upsert the daily progress log
    await db.userProgress.upsert({
      where: {
        userId_date: {
          userId: profile.id,
          date: today,
        },
      },
      update: {
        focusTimeSec: { increment: durationSeconds },
      },
      create: {
        userId: profile.id,
        date: today,
        focusTimeSec: durationSeconds,
        waterIntakeMl: 0,
      },
    })

    revalidatePath("/")
    return { success: true }
  } catch (err) {
    console.error("Failed to log study session:", err)
    return { error: "Failed to log study session" }
  }
}

export async function logWaterIntakeAction(amountMl: number) {
  if (amountMl <= 0) return { error: "Invalid water amount" }

  const profile = await getOrCreateProfile()
  if (!profile) {
    return { error: "Unauthorized" }
  }

  const today = getNormalizedToday()

  try {
    await db.userProgress.upsert({
      where: {
        userId_date: {
          userId: profile.id,
          date: today,
        },
      },
      update: {
        waterIntakeMl: { increment: amountMl },
      },
      create: {
        userId: profile.id,
        date: today,
        waterIntakeMl: amountMl,
        focusTimeSec: 0,
      },
    })

    revalidatePath("/")
    return { success: true }
  } catch (err) {
    console.error("Failed to log water intake:", err)
    return { error: "Failed to log water intake" }
  }
}

export async function logReminderAction(type: string) {
  const profile = await getOrCreateProfile()
  if (!profile) {
    return { error: "Unauthorized" }
  }

  try {
    await db.reminderLog.create({
      data: {
        userId: profile.id,
        type,
      },
    })
    return { success: true }
  } catch (err) {
    console.error("Failed to log reminder event:", err)
    return { error: "Failed to log reminder" }
  }
}
