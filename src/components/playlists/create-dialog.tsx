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
      <DialogTrigger className="bg-primary text-primary-foreground hover:opacity-90 transition-all rounded-full font-bold cursor-pointer shadow-sm h-9 px-4 text-xs flex items-center justify-center active:scale-95">
        <Plus className="mr-1.5 h-4 w-4" />
        Create Playlist
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border border-outline-variant/30 bg-card shadow-large rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-primary font-heading">Create Playlist</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-semibold">
            Create a custom folder to organize your Youtube learning videos.
          </DialogDescription>
        </DialogHeader>
        
        <form action={formAction} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-bold text-primary tracking-widest font-heading pl-1">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Learn Next.js & React"
              required
              disabled={isPending}
              className="pl-4 h-11 border-outline-variant/30 bg-surface-container rounded-full focus-visible:ring-primary/20 focus-visible:border-primary text-xs font-semibold"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-bold text-primary tracking-widest font-heading pl-1">Description (Optional)</Label>
            <Input
              id="description"
              name="description"
              placeholder="e.g., Mindful study tutorials on frontend development"
              disabled={isPending}
              className="pl-4 h-11 border-outline-variant/30 bg-surface-container rounded-full focus-visible:ring-primary/20 focus-visible:border-primary text-xs font-semibold"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto h-11 bg-primary text-primary-foreground hover:opacity-90 transition-all rounded-full font-bold cursor-pointer text-xs active:scale-95 shadow-sm"
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
