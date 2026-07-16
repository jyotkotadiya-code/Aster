"use client"

import * as React from "react"
import { useActionState, useEffect } from "react"
import { sendFriendRequest } from "@/app/(dashboard)/friends/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { UserPlus, Loader2 } from "lucide-react"

export function SendFriendRequestForm() {
  const [state, formAction, isPending] = useActionState(sendFriendRequest, null)

  useEffect(() => {
    if (state?.success) {
      toast.success("Friend request sent successfully! ✈️")
      // Clear input manually by resetting form
      const form = document.getElementById("friend-request-form") as HTMLFormElement
      if (form) form.reset()
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state])

  return (
    <form
      id="friend-request-form"
      action={formAction}
      className="flex flex-col sm:flex-row gap-3 max-w-md"
    >
      <Input
        name="emailOrUsername"
        placeholder="Enter friend's email or username"
        required
        disabled={isPending}
        className="h-11 border-outline-variant/30 bg-surface rounded-full focus-visible:ring-primary/20 focus-visible:border-primary text-xs font-semibold px-4 flex-1 shadow-inner"
      />
      <Button
        type="submit"
        disabled={isPending}
        className="h-11 bg-primary text-primary-foreground hover:opacity-90 transition-all rounded-full font-bold cursor-pointer shadow-sm px-6 text-xs active:scale-95"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
            Send Request
          </>
        )}
      </Button>
    </form>
  )
}
