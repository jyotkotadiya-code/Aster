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
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Section 1: Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary font-heading">
            Study Playlists
          </h2>
          <p className="text-[13px] text-muted-foreground font-semibold leading-relaxed">
            Manage your distraction-free study sources
          </p>
        </div>
        <CreatePlaylistDialog />
      </div>

      {/* Section 2: Personal Playlists */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-primary uppercase tracking-widest font-heading px-1">
          My Playlists ({playlists.length})
        </h3>
        
        {playlists.length === 0 ? (
          <div className="glass-card p-12 text-center max-w-xl mx-auto space-y-4 shadow-soft border border-outline-variant/30 rounded-2xl bg-surface-container-low">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container/30 text-primary mx-auto shadow-sm">
              <FolderOpen className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-primary font-heading">No playlists yet</h3>
              <p className="text-xs text-muted-foreground font-semibold max-w-sm mx-auto leading-relaxed">
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
                className="group block rounded-xl border border-outline-variant/15 bg-primary-fixed/20 p-5 shadow-soft hover-lift relative overflow-hidden transition-all duration-300"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-colors" />

                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container/40 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
                    <PlaySquare className="h-5 w-5" />
                  </div>
                  <DeletePlaylistButton id={playlist.id} title={playlist.title} />
                </div>

                <div className="mt-4 space-y-1">
                  <h3 className="font-bold text-[15px] text-primary tracking-tight group-hover:opacity-80 transition-opacity font-heading">
                    {playlist.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem] font-semibold leading-relaxed">
                    {playlist.description ?? "No description provided."}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-[11px] text-muted-foreground font-bold font-heading">
                  <span className="flex items-center">
                    <Video className="mr-1 h-3.5 w-3.5 text-primary" />
                    {playlist._count.videos} {playlist._count.videos === 1 ? "video" : "videos"}
                  </span>
                  <span className="group-hover:translate-x-0.5 transition-all text-primary">
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
        <div className="space-y-4 pt-6 border-t border-outline-variant/30">
          <h3 className="text-xs font-bold text-secondary uppercase tracking-widest font-heading px-1 flex items-center">
            <Users className="mr-1.5 h-3.5 w-3.5 text-secondary" />
            Shared with Me ({sharedPlaylists.length})
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sharedPlaylists.map((sp) => {
              const playlist = sp.playlist
              return (
                <Link
                  key={sp.id}
                  href={`/playlists/${playlist.id}`}
                  className="group block rounded-xl border border-outline-variant/15 bg-secondary-fixed/20 p-5 shadow-soft hover-lift relative overflow-hidden transition-all duration-300"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary/20 group-hover:bg-secondary transition-colors" />

                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-container/40 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground transition-all duration-300 shadow-sm">
                      <PlaySquare className="h-5 w-5" />
                    </div>
                    {/* Creators Tag */}
                    <span className="text-[9px] font-bold text-secondary bg-secondary-container/45 border border-outline-variant/20 px-2.5 py-0.5 rounded-full font-heading">
                      By {playlist.creator.name}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1">
                    <h3 className="font-bold text-[15px] text-secondary tracking-tight group-hover:opacity-80 transition-opacity font-heading">
                      {playlist.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem] font-semibold leading-relaxed">
                      {playlist.description ?? "No description provided."}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-[11px] text-muted-foreground font-bold font-heading">
                    <span className="flex items-center">
                      <Video className="mr-1 h-3.5 w-3.5 text-secondary" />
                      {playlist._count.videos} {playlist._count.videos === 1 ? "video" : "videos"}
                    </span>
                    <span className="group-hover:translate-x-0.5 transition-all text-secondary">
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
