"use client"

import * as React from "react"
import { useActionState, useEffect, useState } from "react"
import { createPlaylist } from "@/app/(dashboard)/playlists/actions"
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

export function CreatePlaylistDialog() {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(createPlaylist, null)

  useEffect(() => {
    if (state?.success) {
      toast.success("Playlist created successfully! 🎉")
      setOpen(false)
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="bg-primary text-primary-foreground hover:bg-primary/95 transition-all rounded-md font-medium cursor-pointer shadow-soft h-9 px-4 text-sm flex items-center justify-center">
        <Plus className="mr-1.5 h-4 w-4" />
        Create Playlist
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border border-border bg-card shadow-large rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">Create Playlist</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Create a custom folder to organize your Youtube learning videos.
          </DialogDescription>
        </DialogHeader>
        
        <form action={formAction} className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Learn Next.js & React"
              required
              disabled={isPending}
              className="h-10 border-border bg-background focus-visible:ring-primary focus-visible:border-primary"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              name="description"
              placeholder="e.g., Mindful study tutorials on frontend development"
              disabled={isPending}
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
                  Creating...
                </>
              ) : (
                "Create Playlist"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
