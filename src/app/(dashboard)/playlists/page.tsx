import * as React from "react"
import { getOrCreateProfile } from "@/lib/auth"
import db from "@/lib/db"
import { CreatePlaylistDialog } from "@/components/playlists/create-dialog"
import { DeletePlaylistButton } from "@/components/playlists/delete-button"
import { PlaySquare, FolderOpen, Video, Users } from "lucide-react"
import Link from "next/link"

export default async function PlaylistsPage() {
  const profile = await getOrCreateProfile()

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  // Fetch user's own playlists
  const playlists = await db.playlist.findMany({
    where: { creatorId: profile.id },
    include: {
      _count: {
        select: { videos: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Fetch playlists shared with the user by friends
  const sharedPlaylists = await db.sharedPlaylist.findMany({
    where: { userId: profile.id },
    include: {
      playlist: {
        include: {
          creator: true,
          _count: {
            select: { videos: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Section 1: Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Study Playlists
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your distraction-free study sources
          </p>
        </div>
        <CreatePlaylistDialog />
      </div>

      {/* Section 2: Personal Playlists */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          My Playlists ({playlists.length})
        </h3>
        
        {playlists.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center max-w-xl mx-auto space-y-4 shadow-soft">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto">
              <FolderOpen className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-medium text-foreground">No playlists yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Create a custom playlist to start adding and playing YouTube educational videos.
              </p>
            </div>
            <div className="pt-2">
              <CreatePlaylistDialog />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist) => (
              <Link
                key={playlist.id}
                href={`/playlists/${playlist.id}`}
                className="group block rounded-2xl border border-border bg-card p-5 shadow-soft hover:shadow-medium hover:scale-[1.01] transition-all duration-200 relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/30 group-hover:bg-primary transition-colors" />

                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <PlaySquare className="h-5 w-5" />
                  </div>
                  <DeletePlaylistButton id={playlist.id} title={playlist.title} />
                </div>

                <div className="mt-4 space-y-1">
                  <h3 className="font-semibold text-base text-foreground tracking-tight group-hover:text-primary transition-colors">
                    {playlist.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                    {playlist.description ?? "No description provided."}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground font-medium">
                  <span className="flex items-center">
                    <Video className="mr-1 h-3.5 w-3.5" />
                    {playlist._count.videos} {playlist._count.videos === 1 ? "video" : "videos"}
                  </span>
                  <span className="group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                    Open playlist &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Playlists Shared with Me */}
      {sharedPlaylists.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border/60">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center">
            <Users className="mr-1.5 h-3.5 w-3.5 text-primary" />
            Shared with Me ({sharedPlaylists.length})
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sharedPlaylists.map((sp) => {
              const playlist = sp.playlist
              return (
                <Link
                  key={sp.id}
                  href={`/playlists/${playlist.id}`}
                  className="group block rounded-2xl border border-border bg-card p-5 shadow-soft hover:shadow-medium hover:scale-[1.01] transition-all duration-200 relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary/30 group-hover:bg-secondary transition-colors" />

                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                      <PlaySquare className="h-5 w-5" />
                    </div>
                    {/* Creators Tag */}
                    <span className="text-[10px] font-bold text-secondary bg-secondary/10 border border-secondary/20 px-2 py-0.5 rounded-full">
                      By {playlist.creator.name}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1">
                    <h3 className="font-semibold text-base text-foreground tracking-tight group-hover:text-secondary transition-colors">
                      {playlist.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                      {playlist.description ?? "No description provided."}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span className="flex items-center">
                      <Video className="mr-1 h-3.5 w-3.5" />
                      {playlist._count.videos} {playlist._count.videos === 1 ? "video" : "videos"}
                    </span>
                    <span className="group-hover:text-secondary group-hover:translate-x-0.5 transition-all">
                      Watch playlist &rarr;
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
