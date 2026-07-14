"use client"

import * as React from "react"
import { useState, useTransition } from "react"
import { addVideoToPlaylist } from "@/app/(dashboard)/playlists/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Plus, Loader2 } from "lucide-react"

interface AddVideoDialogProps {
  playlistId: string
}

export function AddVideoDialog({ playlistId }: AddVideoDialogProps) {
  const [open, setOpen] = useState(false)
  const [videoUrl, setVideoUrl] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!videoUrl) {
      toast.error("Please enter a YouTube video URL")
      return
    }

    startTransition(async () => {
      const result = await addVideoToPlaylist(playlistId, videoUrl)
      if (result.success) {
        toast.success("Video added to playlist successfully! 🎥")
        setVideoUrl("")
        setOpen(false)
      } else if (result.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="bg-primary text-primary-foreground hover:bg-primary/95 transition-all rounded-md font-medium cursor-pointer shadow-soft h-9 px-4 text-sm flex items-center justify-center">
        <Plus className="mr-1.5 h-4 w-4" />
        Add Video
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border border-border bg-card shadow-large rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">Add Video</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Paste a YouTube video link to add it to your calm study playlist.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="videoUrl">YouTube URL</Label>
            <Input
              id="videoUrl"
              placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              disabled={isPending}
              required
              className="h-10 border-border bg-background focus-visible:ring-primary focus-visible:border-primary"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto h-10 bg-primary text-primary-foreground hover:bg-primary/95 transition-all rounded-md font-medium cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add to Playlist"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
