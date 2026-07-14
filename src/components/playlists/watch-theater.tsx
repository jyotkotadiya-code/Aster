"use client"

import * as React from "react"
import { useState } from "react"
import { YouTubePlayer } from "@/components/video/youtube-player"
import { updateVideoDuration } from "@/app/(dashboard)/playlists/actions"
import { Sparkles, Tv, HelpCircle } from "lucide-react"

interface WatchTheaterProps {
  videoId: string
  videoTitle: string
  youtubeId: string
  currentDuration: number
}

export function WatchTheater({
  videoId,
  videoTitle,
  youtubeId,
  currentDuration,
}: WatchTheaterProps) {
  const [playerState, setPlayerState] = useState<number>(-1) // -1 unstarted, 1 playing, 2 paused, etc.

  const handleDuration = async (duration: number) => {
    // If the video duration is currently listed as 0, update it in the database
    if (currentDuration === 0 && duration > 0) {
      console.log(`Updating database video duration for ${videoId} to ${duration}s`)
      await updateVideoDuration(videoId, duration)
    }
  }

  const handleStateChange = (state: number) => {
    setPlayerState(state)
    // Global Event notifications / logs for study timer integration in Phase 5
    if (state === 1) {
      console.log("Study Session: User is actively learning (video playing)")
    } else if (state === 2) {
      console.log("Study Session: User paused learning (video paused)")
    }
  }

  // Format state to readable status string
  const getStatusString = () => {
    switch (playerState) {
      case 1:
        return "Learning active"
      case 2:
        return "Learning paused"
      case 0:
        return "Completed video"
      default:
        return "Ready to study"
    }
  }

  return (
    <div className="space-y-4">
      {/* Dynamic Player Wrapper */}
      <YouTubePlayer 
        youtubeId={youtubeId} 
        onDuration={handleDuration} 
        onStateChange={handleStateChange} 
      />

      {/* Video metadata & interactive helper */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-foreground tracking-tight leading-snug">
              {videoTitle}
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Tv className="h-3.5 w-3.5" />
              YouTube Video ID: <code className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">{youtubeId}</code>
            </p>
          </div>
          
          <div className={`px-2.5 py-1 rounded-full text-xs font-semibold select-none border transition-colors ${
            playerState === 1 
              ? "bg-primary/10 text-primary border-primary/20" 
              : "bg-muted text-muted-foreground border-border"
          }`}>
            {getStatusString()}
          </div>
        </div>

        {/* Dynamic Tip banner depending on player actions */}
        <div className="flex items-start space-x-2 text-xs text-muted-foreground bg-muted/30 border border-border/50 rounded-xl p-3">
          <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {playerState === 1 
              ? "Your study session is currently running. Keep focusing! Hydration and break reminders will prompt automatically."
              : "Ready to focus? Hit play on the player. The session study timer will automatically start tracking your focus time."}
          </p>
        </div>
      </div>
    </div>
  )
}
