"use server"

import db from "@/lib/db"
import { getOrCreateProfile } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// Helper to extract YouTube video ID from URL
function extractYoutubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

export async function createPlaylist(prevState: any, formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string

  if (!title) {
    return { error: "Playlist title is required" }
  }

  const profile = await getOrCreateProfile()
  if (!profile) {
    return { error: "Unauthorized" }
  }

  try {
    await db.playlist.create({
      data: {
        title,
        description: description || null,
        creatorId: profile.id,
      },
    })
  } catch (err) {
    console.error("Failed to create playlist:", err)
    return { error: "Failed to create playlist" }
  }

  revalidatePath("/playlists")
  return { success: true }
}

export async function deletePlaylist(id: string) {
  const profile = await getOrCreateProfile()
  if (!profile) {
    return { error: "Unauthorized" }
  }

  try {
    // Verify owner
    const playlist = await db.playlist.findUnique({
      where: { id },
    })

    if (!playlist || playlist.creatorId !== profile.id) {
      return { error: "Permission denied" }
    }

    await db.playlist.delete({
      where: { id },
    })

    revalidatePath("/playlists")
    return { success: true }
  } catch (err) {
    console.error("Failed to delete playlist:", err)
    return { error: "Failed to delete playlist" }
  }
}

export async function addVideoToPlaylist(playlistId: string, videoUrl: string) {
  const profile = await getOrCreateProfile()
  if (!profile) {
    return { error: "Unauthorized" }
  }

  const youtubeId = extractYoutubeVideoId(videoUrl)
  if (!youtubeId) {
    return { error: "Invalid YouTube URL" }
  }

  try {
    // Verify playlist owner
    const playlist = await db.playlist.findUnique({
      where: { id: playlistId },
    })

    if (!playlist || playlist.creatorId !== profile.id) {
      return { error: "Permission denied" }
    }

    // Check if video exists in global Video registry
    let video = await db.video.findUnique({
      where: { youtubeId },
    })

    // If video is new, fetch metadata via OEmbed API
    if (!video) {
      try {
        const oembedRes = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`
        )
        if (!oembedRes.ok) {
          throw new Error("OEmbed fetch failed")
        }
        const data = await oembedRes.json()
        
        video = await db.video.create({
          data: {
            title: data.title || `YouTube Video ${youtubeId}`,
            youtubeId,
            thumbnailUrl: data.thumbnail_url || `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`,
            duration: 0, // Duration is set dynamically to 0, to be updated during watch
            description: data.author_name ? `By ${data.author_name}` : null,
          },
        })
      } catch (err) {
        console.error("OEmbed metadata fetch failed, using fallback:", err)
        video = await db.video.create({
          data: {
            title: `Video ${youtubeId}`,
            youtubeId,
            thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`,
            duration: 0,
          },
        })
      }
    }

    // Check if video is already in this playlist
    const existingConnection = await db.playlistVideo.findUnique({
      where: {
        playlistId_videoId: {
          playlistId,
          videoId: video.id,
        },
      },
    })

    if (existingConnection) {
      return { error: "Video is already in this playlist" }
    }

    // Get position to append
    const position = await db.playlistVideo.count({
      where: { playlistId },
    })

    await db.playlistVideo.create({
      data: {
        playlistId,
        videoId: video.id,
        position,
      },
    })

    revalidatePath(`/playlists/${playlistId}`)
    return { success: true }
  } catch (err) {
    console.error("Failed to add video:", err)
    return { error: "Failed to add video to playlist" }
  }
}

export async function removeVideoFromPlaylist(playlistId: string, videoId: string) {
  const profile = await getOrCreateProfile()
  if (!profile) {
    return { error: "Unauthorized" }
  }

  try {
    // Verify owner
    const playlist = await db.playlist.findUnique({
      where: { id: playlistId },
    })

    if (!playlist || playlist.creatorId !== profile.id) {
      return { error: "Permission denied" }
    }

    // Remove video connection
    await db.playlistVideo.delete({
      where: {
        playlistId_videoId: {
          playlistId,
          videoId,
        },
      },
    })

    // Re-index remaining playlist videos to maintain continuous positions
    const remaining = await db.playlistVideo.findMany({
      where: { playlistId },
      orderBy: { position: "asc" },
    })

    for (let i = 0; i < remaining.length; i++) {
      await db.playlistVideo.update({
        where: { id: remaining[i].id },
        data: { position: i },
      })
    }

    revalidatePath(`/playlists/${playlistId}`)
    return { success: true }
  } catch (err) {
    console.error("Failed to remove video:", err)
    return { error: "Failed to remove video" }
  }
}

export async function updateVideoDuration(videoId: string, duration: number) {
  try {
    await db.video.update({
      where: { id: videoId },
      data: { duration },
    })
    return { success: true }
  } catch (err) {
    console.error("Failed to update video duration:", err)
    return { error: "Failed to update duration" }
  }
}
