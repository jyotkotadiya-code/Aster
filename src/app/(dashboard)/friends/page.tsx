import * as React from "react"
import { getOrCreateProfile } from "@/lib/auth"
import db from "@/lib/db"
import { SendFriendRequestForm } from "@/components/friends/request-form"
import { FriendActionButton } from "@/components/friends/friend-actions"
import { Users, Mail, Clock, ArrowRightLeft } from "lucide-react"

export default async function FriendsPage() {
  const profile = await getOrCreateProfile()

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  // 1. Fetch incoming requests (friendId is current user)
  const incomingRequests = await db.friendship.findMany({
    where: { friendId: profile.id, status: "PENDING" },
    include: {
      user: true, // sender
    },
    orderBy: { createdAt: "desc" },
  })

  // 2. Fetch sent requests (userId is current user)
  const sentRequests = await db.friendship.findMany({
    where: { userId: profile.id, status: "PENDING" },
    include: {
      friend: true, // receiver
    },
    orderBy: { createdAt: "desc" },
  })

  // 3. Fetch accepted friendships
  const friendships = await db.friendship.findMany({
    where: {
      OR: [
        { userId: profile.id },
        { friendId: profile.id },
      ],
      status: "ACCEPTED",
    },
    include: {
      user: true,
      friend: true,
    },
    orderBy: { createdAt: "desc" },
  })

  // Map friendships to retrieve friend details
  const activeFriends = friendships.map((f) => {
    const friend = f.userId === profile.id ? f.friend : f.user
    return {
      friendshipId: f.id,
      id: friend.id,
      name: friend.name,
      email: friend.email,
    }
  })

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="space-y-0.5">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary font-heading">
          Study Friends
        </h2>
        <p className="text-[13px] text-muted-foreground font-semibold leading-relaxed">
          Connect with collaborators and share study playlists
        </p>
      </div>

      {/* Add Friend Section */}
      <div className="rounded-2xl border border-outline-variant/30 bg-primary-fixed/20 p-5 sm:p-6 shadow-soft space-y-4">
        <div className="space-y-0.5">
          <h3 className="font-bold text-[14px] text-primary tracking-tight flex items-center font-heading">
            <Mail className="mr-1.5 h-4 w-4 text-primary" />
            Add Friend
          </h3>
          <p className="text-xs text-muted-foreground font-semibold">
            Search for another user by email or username to send a connection request
          </p>
        </div>
        <SendFriendRequestForm />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Active Friends List (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-2xl shadow-soft border border-outline-variant/15 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h3 className="font-bold text-base text-primary tracking-tight flex items-center font-heading">
                <Users className="mr-1.5 h-4 w-4 text-primary" />
                Active Friends ({activeFriends.length})
              </h3>
            </div>

            {activeFriends.length === 0 ? (
              <div className="text-center py-12 space-y-2 border border-dashed border-outline-variant/30 rounded-xl bg-surface-container-low">
                <Users className="h-8 w-8 text-muted-foreground/60 mx-auto" />
                <p className="text-xs text-muted-foreground font-semibold max-w-xs mx-auto">
                  You haven't added any study friends yet. Add a friend to start sharing custom learning playlists!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/15">
                {activeFriends.map((friend) => {
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
                      className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="h-10 w-10 rounded-full bg-primary-container/30 border border-outline-variant/20 flex items-center justify-center select-none shrink-0 shadow-sm">
                          <span className="text-xs font-bold text-primary">
                            {initials}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-foreground truncate font-heading">
                            {friend.name}
                          </h4>
                          <p className="text-[10px] text-muted-foreground font-semibold truncate leading-none mt-0.5">
                            {friend.email}
                          </p>
                        </div>
                      </div>
                      <FriendActionButton
                        id={friend.friendshipId}
                        actionType="REMOVE"
                        friendName={friend.name ?? undefined}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Requests Sidebars (1 col) */}
        <div className="space-y-6">
          {/* Incoming Requests */}
          <div className="glass-card p-5 rounded-2xl border border-outline-variant/15 shadow-soft space-y-4">
            <h3 className="font-bold text-[14px] text-primary tracking-tight flex items-center border-b border-outline-variant/20 pb-2.5 font-heading">
              <ArrowRightLeft className="mr-1.5 h-4 w-4 text-primary" />
              Incoming Requests ({incomingRequests.length})
            </h3>

            {incomingRequests.length === 0 ? (
              <p className="text-[11px] text-muted-foreground font-semibold text-center py-4">
                No pending incoming requests
              </p>
            ) : (
              <div className="space-y-3">
                {incomingRequests.map((req) => {
                  const initials = req.user.name
                    ? req.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    : "U"
                  return (
                    <div
                      key={req.id}
                      className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-outline-variant/15 bg-surface-container-low"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="h-8 w-8 rounded-full bg-primary-container/30 border border-outline-variant/20 flex items-center justify-center shrink-0 shadow-sm">
                          <span className="text-[10px] font-bold text-primary">
                            {initials}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-foreground truncate leading-tight font-heading">
                            {req.user.name}
                          </h4>
                          <p className="text-[9px] text-muted-foreground font-semibold truncate leading-none mt-0.5">
                            {req.user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <FriendActionButton id={req.id} actionType="ACCEPT" />
                        <FriendActionButton id={req.id} actionType="DECLINE" />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sent Requests */}
          <div className="glass-card p-5 rounded-2xl border border-outline-variant/15 shadow-soft space-y-4">
            <h3 className="font-bold text-[14px] text-primary tracking-tight flex items-center border-b border-outline-variant/20 pb-2.5 font-heading">
              <Clock className="mr-1.5 h-4 w-4 text-primary" />
              Sent Requests ({sentRequests.length})
            </h3>

            {sentRequests.length === 0 ? (
              <p className="text-[11px] text-muted-foreground font-semibold text-center py-4">
                No pending sent requests
              </p>
            ) : (
              <div className="space-y-3">
                {sentRequests.map((req) => {
                  const initials = req.friend.name
                    ? req.friend.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    : "U"
                  return (
                    <div
                      key={req.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-outline-variant/15 bg-surface-container/60"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-surface-container border border-outline-variant/20 flex items-center justify-center shrink-0 shadow-sm">
                          <span className="text-[10px] font-bold text-muted-foreground">
                            {initials}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-foreground truncate leading-tight font-heading">
                            {req.friend.name}
                          </h4>
                          <span className="text-[8px] font-bold text-primary uppercase tracking-wider block mt-0.5 font-heading">
                            Pending
                          </span>
                        </div>
                      </div>
                      {/* Decline acts as cancel for sent requests */}
                      <FriendActionButton id={req.id} actionType="DECLINE" />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
