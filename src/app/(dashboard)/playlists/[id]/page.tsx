import * as React from "react"
import { getOrCreateProfile } from "@/lib/auth"
import db from "@/lib/db"
import { AddVideoDialog } from "@/components/playlists/add-video-dialog"
import { RemoveVideoButton } from "@/components/playlists/remove-button"
import { SharePlaylistDialog } from "@/components/playlists/share-dialog"
import { WatchTheater } from "@/components/playlists/watch-theater"
import { PlaySquare, ChevronLeft, Play, ArrowLeft, Video, Clock, Share2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"

interface PlaylistDetailsPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ v?: string }>
}

function formatDuration(seconds: number) {
  if (seconds === 0) return "Not watched"
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export default async function PlaylistDetailsPage({
  params,
  searchParams,
}: PlaylistDetailsPageProps) {
  const profile = await getOrCreateProfile()
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  const { id } = await params
  const { v: activeVideoId } = await searchParams

  // Fetch playlist with all associated videos
  const playlist = await db.playlist.findUnique({
    where: { id },
    include: {
      creator: true,
      videos: {
        include: {
          video: true,
        },
        orderBy: { position: "asc" },
      },
    },
  })

  if (!playlist) {
    notFound()
  }

  const isOwner = playlist.creatorId === profile.id

  // If not owner, verify if playlist is shared with this user
  let isSharedReader = false
  if (!isOwner) {
    const sharedCount = await db.sharedPlaylist.count({
      where: {
        playlistId: id,
        userId: profile.id,
      },
    })
    if (sharedCount === 0) {
      notFound()
    }
    isSharedReader = true
  }

  // Find the active video if "v" query param is set
  const activePlaylistVideo = activeVideoId
    ? playlist.videos.find((pv) => pv.video.id === activeVideoId || pv.video.youtubeId === activeVideoId)
    : null

  const activeVideo = activePlaylistVideo?.video ?? null

  // Fetch active friends to pass to the share dialog if user is the owner
  let activeFriends: { id: string; name: string; email: string }[] = []
  if (isOwner) {
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
    })

    activeFriends = friendships.map((f) => {
      const friend = f.userId === profile.id ? f.friend : f.user
      return {
        id: friend.id,
        name: friend.name ?? "Unknown User",
        email: friend.email,
      }
    })
  }

  // 1. WATCH ROOM THEATER MODE
  if (activeVideo) {
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Navigation / Header */}
        <div className="flex items-center space-x-2">
          <Link
            href={`/playlists/${id}`}
            className="flex items-center text-xs font-bold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ChevronLeft className="mr-1 h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Playlist Details
          </Link>
          <span className="text-muted-foreground/30 text-xs">/</span>
          <span className="text-xs font-bold text-foreground truncate max-w-xs sm:max-w-md">
            Watching: {activeVideo.title}
          </span>
        </div>

        {/* Watch Theater Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Video Player */}
          <div className="lg:col-span-2">
            <WatchTheater
              videoId={activeVideo.id}
              videoTitle={activeVideo.title}
              youtubeId={activeVideo.youtubeId}
              currentDuration={activeVideo.duration}
            />
          </div>

          {/* Right Playlist Watch Sidebar */}
          <div className="glass-card p-5 rounded-xl border border-outline-variant/15 shadow-soft flex flex-col h-[500px] lg:h-[580px] overflow-hidden space-y-4">
            <div className="space-y-0.5">
              <h3 className="font-bold text-[14px] text-primary tracking-tight line-clamp-1 font-heading">
                {playlist.title}
              </h3>
              <p className="text-xs text-muted-foreground font-semibold flex items-center">
                <Video className="mr-1 h-3.5 w-3.5 text-primary" />
                {playlist.videos.length} educational videos
              </p>
            </div>

            {/* Scrollable list */}
            <div className="flex-grow overflow-y-auto space-y-2.5 pr-1">
              {playlist.videos.map((pv, idx) => {
                const isCurrent = pv.video.id === activeVideo.id
                return (
                  <Link
                    key={pv.id}
                    href={`/playlists/${id}?v=${pv.video.id}`}
                    className={`flex items-center gap-3 p-2 rounded-full border transition-all duration-200 group relative hover:translate-x-1 ${
                      isCurrent
                        ? "bg-primary-container border-outline-variant/30 text-primary-foreground font-bold shadow-sm"
                        : "border-transparent hover:bg-surface-container-high/60"
                    }`}
                  >
                    {/* Index */}
                    <span className={`text-[10px] font-bold w-4 text-center shrink-0 ${
                      isCurrent ? "text-primary-foreground" : "text-muted-foreground"
                    }`}>
                      {isCurrent ? <Play className="h-3 w-3 fill-current mx-auto" /> : idx + 1}
                    </span>

                    {/* Thumbnail */}
                    <div className="relative h-10 w-16 rounded-xl overflow-hidden bg-black shrink-0 border border-outline-variant/20 shadow-inner">
                      {pv.video.thumbnailUrl ? (
                        <Image
                          src={pv.video.thumbnailUrl}
                          alt={pv.video.title}
                          fill
                          sizes="64px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                          <PlaySquare className="h-4 w-4 text-zinc-500" />
                        </div>
                      )}
                    </div>

                    {/* Title & Metadata */}
                    <div className="flex-grow min-w-0 space-y-0.5 pr-1">
                      <p className={`text-xs font-semibold line-clamp-1 leading-snug ${
                        isCurrent ? "text-primary-foreground font-bold" : "text-foreground group-hover:text-primary transition-colors"
                      }`}>
                        {pv.video.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground font-semibold flex items-center">
                        <Clock className="mr-0.5 h-2.5 w-2.5" />
                        {formatDuration(pv.video.duration)}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 2. STANDARD DETAIL MODE
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/playlists"
            className="flex items-center text-xs font-bold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform text-primary" />
            Back to Library
          </Link>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary flex items-center gap-2 font-heading">
            {playlist.title}
            {isSharedReader && (
              <span className="text-[9px] font-bold text-secondary bg-secondary-container/40 border border-outline-variant/20 px-2 py-0.5 rounded-full select-none font-heading">
                Shared by {playlist.creator.name}
              </span>
            )}
          </h2>
          <p className="text-[13px] text-muted-foreground font-semibold max-w-xl leading-relaxed">
            {playlist.description ?? "No description provided."}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Owner-only Dialogs */}
          {isOwner && (
            <>
              <SharePlaylistDialog playlistId={id} friends={activeFriends} />
              <AddVideoDialog playlistId={id} />
            </>
          )}

          {playlist.videos.length > 0 && (
            <Link href={`/playlists/${id}?v=${playlist.videos[0].video.id}`}>
              <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90 transition-all rounded-full font-bold cursor-pointer shadow-sm h-9 px-4 text-xs active:scale-95">
                <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
                Play All
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Videos List */}
      {playlist.videos.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-xl mx-auto space-y-4 shadow-soft border border-outline-variant/30 rounded-2xl bg-surface-container-low">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container/30 text-primary mx-auto shadow-sm">
            <PlaySquare className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-primary font-heading">No videos in this playlist</h3>
            <p className="text-xs text-muted-foreground font-semibold max-w-sm mx-auto leading-relaxed">
              {isOwner 
                ? "Add custom YouTube study videos to this playlist by pasting a video URL above."
                : "The creator hasn't added any videos to this playlist yet."}
            </p>
          </div>
          {isOwner && (
            <div className="pt-2">
              <AddVideoDialog playlistId={id} />
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-outline-variant/15 shadow-soft overflow-hidden">
          <div className="p-4 border-b border-outline-variant/20 bg-surface-container/60 text-xs font-bold text-primary grid grid-cols-12 gap-4">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-8 sm:col-span-9">Title</div>
            <div className="col-span-2 text-center flex items-center justify-center">
              <Clock className="mr-1 h-3.5 w-3.5" />
              Duration
            </div>
            {isOwner && <div className="col-span-1 text-center">Actions</div>}
          </div>

          <div className="divide-y divide-outline-variant/15">
            {playlist.videos.map((pv, idx) => (
              <div
                key={pv.id}
                className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-surface-container-high/40 transition-colors group"
              >
                {/* 1. Index Position */}
                <div className="col-span-1 text-center text-xs font-bold text-muted-foreground group-hover:text-primary">
                  {idx + 1}
                </div>

                {/* 2. Video Thumbnail & Title Link */}
                <div className="col-span-8 sm:col-span-9 flex items-center gap-4">
                  <Link 
                    href={`/playlists/${id}?v=${pv.video.id}`}
                    className="relative h-12 w-20 rounded-xl overflow-hidden bg-black shrink-0 border border-outline-variant/20 block shadow-inner"
                  >
                    {pv.video.thumbnailUrl ? (
                      <Image
                        src={pv.video.thumbnailUrl}
                        alt={pv.video.title}
                        fill
                        sizes="96px"
                        className="object-cover group-hover:scale-105 transition-all duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                        <PlaySquare className="h-4 w-4 text-zinc-500" />
                      </div>
                    )}
                    {/* Play Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                      <Play className="h-5 w-5 text-white fill-white" />
                    </div>
                  </Link>
                  
                  <div className="min-w-0 pr-2">
                    <Link
                      href={`/playlists/${id}?v=${pv.video.id}`}
                      className="font-bold text-sm text-foreground hover:text-primary transition-colors block line-clamp-2 leading-snug font-heading"
                    >
                      {pv.video.title}
                    </Link>
                    {pv.video.description && (
                      <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5 font-semibold">
                        {pv.video.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* 3. Duration */}
                <div className="col-span-2 text-center text-xs font-bold text-muted-foreground">
                  {formatDuration(pv.video.duration)}
                </div>

                {/* 4. Remove Action (Owner only) */}
                {isOwner && (
                  <div className="col-span-1 text-center flex justify-center">
                    <RemoveVideoButton
                      playlistId={id}
                      videoId={pv.video.id}
                      title={pv.video.title}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
