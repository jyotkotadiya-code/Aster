"use client"

import * as React from "react"
import { useState, useTransition } from "react"
import { sharePlaylistAction } from "@/app/(dashboard)/friends/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Share2, Users, Loader2, Check } from "lucide-react"
import { toast } from "sonner"

interface Friend {
  id: string
  name: string
  email: string
}

interface SharePlaylistDialogProps {
  playlistId: string
  friends: Friend[]
}

export function SharePlaylistDialog({
  playlistId,
  friends,
}: SharePlaylistDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [sharedFriendIds, setSharedFriendIds] = useState<string[]>([])

  const handleShare = (friendId: string, friendName: string) => {
    startTransition(async () => {
      const result = await sharePlaylistAction(playlistId, friendId)
      if (result.success) {
        toast.success(`Shared playlist with ${friendName}! 🤝`)
        setSharedFriendIds((prev) => [...prev, friendId])
      } else if (result.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="bg-secondary text-white hover:bg-secondary/95 transition-all rounded-md font-medium cursor-pointer shadow-soft h-9 px-4 text-xs flex items-center justify-center">
        <Share2 className="mr-1.5 h-3.5 w-3.5" />
        Share
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] border border-border bg-card shadow-large rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">Share Playlist</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Share this educational playlist with your study friends.
          </DialogDescription>
        </DialogHeader>

        {friends.length === 0 ? (
          <div className="text-center py-6 space-y-2">
            <Users className="h-8 w-8 text-muted-foreground/50 mx-auto" />
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              You don't have any active friends yet. Add friends in the Friends portal to share playlists with them.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50 py-2 max-h-[280px] overflow-y-auto pr-1">
            {friends.map((friend) => {
              const isShared = sharedFriendIds.includes(friend.id)
              const initials = friend.name
                ? friend.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()
                : "U"

              return (
                <div
                  key={friend.id}
                  className="py-3 flex items-center justify-between first:pt-0 last:pb-0"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-primary">
                        {initials}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-foreground truncate">
                        {friend.name}
                      </h4>
                      <p className="text-[9px] text-muted-foreground truncate">
                        {friend.email}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isShared ? "ghost" : "outline"}
                    onClick={() => handleShare(friend.id, friend.name)}
                    disabled={isPending || isShared}
                    className={`h-7 px-3 text-[10px] font-semibold rounded-lg cursor-pointer transition-colors ${
                      isShared 
                        ? "text-primary hover:bg-transparent" 
                        : "border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isShared ? (
                      <span className="flex items-center text-primary">
                        <Check className="mr-0.5 h-3.5 w-3.5" />
                        Shared
                      </span>
                    ) : isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Share"
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
