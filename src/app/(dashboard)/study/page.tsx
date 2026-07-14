import * as React from "react"
import { getOrCreateProfile } from "@/lib/auth"
import db from "@/lib/db"
import { StudyRoom } from "@/components/study/study-room"

export default async function StudyPage() {
  const profile = await getOrCreateProfile()

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  // Fetch all user's playlists containing their nested videos
  const playlists = await db.playlist.findMany({
    where: { creatorId: profile.id },
    include: {
      videos: {
        include: {
          video: true,
        },
        orderBy: { position: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return <StudyRoom playlists={playlists} />
}
