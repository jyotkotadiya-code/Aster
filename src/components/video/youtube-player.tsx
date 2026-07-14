"use client"

import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"

interface YouTubePlayerProps {
  youtubeId: string
  onStateChange?: (state: number) => void
  onDuration?: (duration: number) => void
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: (() => void) | undefined
  }
}

export function YouTubePlayer({
  youtubeId,
  onStateChange,
  onDuration,
}: YouTubePlayerProps) {
  const playerRef = useRef<any>(null)
  const containerId = useRef(`yt-player-${Math.random().toString(36).substring(2, 9)}`)
  const [isReady, setIsReady] = useState(false)

  // Track the duration and state change functions in refs to avoid restarting player on every render
  const onDurationRef = useRef(onDuration)
  const onStateChangeRef = useRef(onStateChange)
  
  useEffect(() => {
    onDurationRef.current = onDuration
    onStateChangeRef.current = onStateChange
  }, [onDuration, onStateChange])

  useEffect(() => {
    let player: any
    let isDestroyed = false

    const createPlayer = () => {
      if (isDestroyed) return
      
      try {
        player = new window.YT.Player(containerId.current, {
          videoId: youtubeId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            showinfo: 0,
            mute: 0,
            modestbranding: 1,
            fs: 1, // Allow fullscreen
          },
          events: {
            onReady: (event: any) => {
              if (isDestroyed) return
              playerRef.current = event.target
              setIsReady(true)
              
              // Get duration and report back
              if (onDurationRef.current) {
                const dur = event.target.getDuration()
                if (dur > 0) onDurationRef.current(dur)
              }
            },
            onStateChange: (event: any) => {
              if (isDestroyed) return
              if (onStateChangeRef.current) {
                onStateChangeRef.current(event.data)
              }
              // If playing, double check duration
              if (onDurationRef.current && event.data === 1) {
                const dur = event.target.getDuration()
                if (dur > 0) onDurationRef.current(dur)
              }
            },
          },
        })
      } catch (err) {
        console.error("Failed to initialize YT Player:", err)
      }
    }

    const loadAPI = () => {
      if (window.YT && window.YT.Player) {
        createPlayer()
        return
      }

      // Check if tag is already present in document
      const scripts = Array.from(document.getElementsByTagName("script"))
      const hasScript = scripts.some((s) => s.src.includes("youtube.com/iframe_api"))

      if (!hasScript) {
        const tag = document.createElement("script")
        tag.src = "https://www.youtube.com/iframe_api"
        const firstScriptTag = document.getElementsByTagName("script")[0]
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag)
      }

      // Hook into global API Ready callback
      const previousCallback = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        if (previousCallback) {
          try {
            previousCallback()
          } catch (e) {
            console.error("Previous YT API ready callback failed:", e)
          }
        }
        createPlayer()
      }
    }

    loadAPI()

    return () => {
      isDestroyed = true
      setIsReady(false)
      if (player && typeof player.destroy === "function") {
        try {
          player.destroy()
        } catch (err) {
          console.error("Error destroying YT player:", err)
        }
      }
      playerRef.current = null
    }
  }, [youtubeId])

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-medium border border-border">
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/90 text-white z-10">
          <div className="text-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-xs text-zinc-400">Loading YouTube Player...</p>
          </div>
        </div>
      )}
      <div id={containerId.current} className="w-full h-full" />
    </div>
  )
}
