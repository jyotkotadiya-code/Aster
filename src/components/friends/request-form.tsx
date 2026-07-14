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
      className="flex flex-col sm:flex-row gap-2 max-w-md"
    >
      <Input
        name="emailOrUsername"
        placeholder="Enter friend's email or username"
        required
        disabled={isPending}
        className="h-10 border-border bg-card focus-visible:ring-primary focus-visible:border-primary flex-1"
      />
      <Button
        type="submit"
        disabled={isPending}
        className="h-10 bg-primary text-primary-foreground hover:bg-primary/95 transition-all rounded-md font-medium cursor-pointer shadow-soft px-4"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <UserPlus className="mr-1.5 h-4 w-4" />
            Send Request
          </>
        )}
      </Button>
    </form>
  )
}
