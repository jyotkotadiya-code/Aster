"use client"

import * as React from "react"
import { useTransition } from "react"
import { deletePlaylist } from "@/app/(dashboard)/playlists/actions"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface DeletePlaylistButtonProps {
  id: string
  title: string
}

export function DeletePlaylistButton({ id, title }: DeletePlaylistButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation to playlist page
    e.stopPropagation()

    if (window.confirm(`Are you sure you want to delete the playlist "${title}"?`)) {
      startTransition(async () => {
        const result = await deletePlaylist(id)
        if (result.success) {
          toast.success("Playlist deleted successfully!")
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
      onClick={handleDelete}
      disabled={isPending}
      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer transition-colors"
      title="Delete Playlist"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  )
}
