"use server"

import db from "@/lib/db"
import { getOrCreateProfile } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function sendFriendRequest(prevState: any, formData: FormData) {
  const emailOrUsername = formData.get("emailOrUsername") as string

  if (!emailOrUsername) {
    return { error: "Please enter an email or username" }
  }

  const profile = await getOrCreateProfile()
  if (!profile) {
    return { error: "Unauthorized" }
  }

  const normalizedInput = emailOrUsername.trim().toLowerCase()

  try {
    // Find target user
    const targetUser = await db.user.findFirst({
      where: {
        OR: [
          { email: normalizedInput },
          { name: { equals: emailOrUsername.trim(), mode: "insensitive" } },
        ],
      },
    })

    if (!targetUser) {
      return { error: "User not found" }
    }

    if (targetUser.id === profile.id) {
      return { error: "You cannot add yourself as a friend" }
    }

    // Check existing friendship
    const existing = await db.friendship.findFirst({
      where: {
        OR: [
          { userId: profile.id, friendId: targetUser.id },
          { userId: targetUser.id, friendId: profile.id },
        ],
      },
    })

    if (existing) {
      if (existing.status === "ACCEPTED") {
        return { error: "You are already friends with this user" }
      }
      if (existing.status === "PENDING") {
        return { error: "A friend request is already pending between you" }
      }
      // If DECLINED, reset to PENDING and update sender
      if (existing.status === "DECLINED") {
        await db.friendship.update({
          where: { id: existing.id },
          data: {
            userId: profile.id,
            friendId: targetUser.id,
            status: "PENDING",
          },
        })
        revalidatePath("/friends")
        return { success: true }
      }
    }

    // Create pending request
    await db.friendship.create({
      data: {
        userId: profile.id,
        friendId: targetUser.id,
        status: "PENDING",
      },
    })

    revalidatePath("/friends")
    return { success: true }
  } catch (err) {
    console.error("Failed to send friend request:", err)
    return { error: "Failed to send friend request" }
  }
}

export async function acceptFriendRequest(requestId: string) {
  const profile = await getOrCreateProfile()
  if (!profile) {
    return { error: "Unauthorized" }
  }

  try {
    const friendship = await db.friendship.findUnique({
      where: { id: requestId },
    })

    if (!friendship || friendship.friendId !== profile.id) {
      return { error: "Permission denied" }
    }

    await db.friendship.update({
      where: { id: requestId },
      data: { status: "ACCEPTED" },
    })

    revalidatePath("/friends")
    return { success: true }
  } catch (err) {
    console.error("Failed to accept friend request:", err)
    return { error: "Failed to accept request" }
  }
}

export async function declineFriendRequest(requestId: string) {
  const profile = await getOrCreateProfile()
  if (!profile) {
    return { error: "Unauthorized" }
  }

  try {
    const friendship = await db.friendship.findUnique({
      where: { id: requestId },
    })

    if (!friendship || friendship.friendId !== profile.id) {
      return { error: "Permission denied" }
    }

    // Delete the request entirely so they can invite again later
    await db.friendship.delete({
      where: { id: requestId },
    })

    revalidatePath("/friends")
    return { success: true }
  } catch (err) {
    console.error("Failed to decline friend request:", err)
    return { error: "Failed to decline request" }
  }
}

export async function removeFriend(friendshipId: string) {
  const profile = await getOrCreateProfile()
  if (!profile) {
    return { error: "Unauthorized" }
  }

  try {
    const friendship = await db.friendship.findUnique({
      where: { id: friendshipId },
    })

    if (!friendship || (friendship.userId !== profile.id && friendship.friendId !== profile.id)) {
      return { error: "Permission denied" }
    }

    await db.friendship.delete({
      where: { id: friendshipId },
    })

    revalidatePath("/friends")
    return { success: true }
  } catch (err) {
    console.error("Failed to remove friend:", err)
    return { error: "Failed to remove friend" }
  }
}

export async function sharePlaylistAction(playlistId: string, friendUserId: string) {
  const profile = await getOrCreateProfile()
  if (!profile) {
    return { error: "Unauthorized" }
  }

  try {
    // 1. Verify user is the creator of the playlist
    const playlist = await db.playlist.findUnique({
      where: { id: playlistId },
    })

    if (!playlist || playlist.creatorId !== profile.id) {
      return { error: "Permission denied" }
    }

    // 2. Share the playlist (upsert to handle duplicates cleanly)
    await db.sharedPlaylist.upsert({
      where: {
        playlistId_userId: {
          playlistId,
          userId: friendUserId,
        },
      },
      update: {},
      create: {
        playlistId,
        userId: friendUserId,
      },
    })

    revalidatePath(`/playlists/${playlistId}`)
    return { success: true }
  } catch (err) {
    console.error("Failed to share playlist:", err)
    return { error: "Failed to share playlist" }
  }
}
