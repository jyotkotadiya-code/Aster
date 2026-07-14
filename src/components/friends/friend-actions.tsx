"use client"

import * as React from "react"
import { useTransition } from "react"
import { acceptFriendRequest, declineFriendRequest, removeFriend } from "@/app/(dashboard)/friends/actions"
import { Button } from "@/components/ui/button"
import { Check, X, UserMinus, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface FriendActionButtonProps {
  id: string // can be requestId or friendshipId
  actionType: "ACCEPT" | "DECLINE" | "REMOVE"
  friendName?: string
}

export function FriendActionButton({
  id,
  actionType,
  friendName,
}: FriendActionButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleAction = () => {
    if (actionType === "REMOVE") {
      if (!window.confirm(`Are you sure you want to remove "${friendName}" from your friends?`)) {
        return
      }
    }

    startTransition(async () => {
      let res
      if (actionType === "ACCEPT") {
        res = await acceptFriendRequest(id)
        if (res.success) toast.success("Friend request accepted! 🤝")
      } else if (actionType === "DECLINE") {
        res = await declineFriendRequest(id)
        if (res.success) toast.info("Friend request declined.")
      } else {
        res = await removeFriend(id)
        if (res.success) toast.info("Friend removed.")
      }

      if (res.error) {
        toast.error(res.error)
      }
    })
  }

  if (actionType === "ACCEPT") {
    return (
      <Button
        size="sm"
        onClick={handleAction}
        disabled={isPending}
        className="bg-primary text-primary-foreground hover:bg-primary/95 transition-all rounded-lg font-medium cursor-pointer h-8 px-3 text-xs flex items-center"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <>
            <Check className="mr-1 h-3.5 w-3.5" />
            Accept
          </>
        )}
      </Button>
    )
  }

  if (actionType === "DECLINE") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleAction}
        disabled={isPending}
        className="border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg cursor-pointer h-8 px-3 text-xs flex items-center"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <>
            <X className="mr-1 h-3.5 w-3.5" />
            Decline
          </>
        )}
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleAction}
      disabled={isPending}
      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer transition-colors"
      title="Remove Friend"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <UserMinus className="h-4 w-4" />
      )}
    </Button>
  )
}
