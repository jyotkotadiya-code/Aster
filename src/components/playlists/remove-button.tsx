"use client"

import * as React from "react"
import { useTransition } from "react"
import { removeVideoFromPlaylist } from "@/app/(dashboard)/playlists/actions"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface RemoveVideoButtonProps {
  playlistId: string
  videoId: string
  title: string
}

export function RemoveVideoButton({
  playlistId,
  videoId,
  title,
}: RemoveVideoButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (window.confirm(`Remove "${title}" from this playlist?`)) {
      startTransition(async () => {
        const result = await removeVideoFromPlaylist(playlistId, videoId)
        if (result.success) {
          toast.success("Video removed from playlist")
        } else if (result.error) {
          toast.error(result.error)
        }
      })
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleRemove}
      disabled={isPending}
      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer transition-colors"
      title="Remove Video"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  )
}
