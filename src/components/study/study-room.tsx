"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { YouTubePlayer } from "@/components/video/youtube-player"
import { StudyOverlay, ReminderType } from "@/components/study/study-overlay"
import { logStudySession } from "@/app/(dashboard)/study/actions"
import { 
  Sparkles, 
  Timer, 
  Tv, 
  Play, 
  Pause, 
  Square,
  BookOpen,
  ChevronRight,
  Droplet,
  Brain,
  Eye,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Video {
  id: string
  title: string
  youtubeId: string
  duration: number
  thumbnailUrl: string | null
}

interface Playlist {
  id: string
  title: string
  videos: {
    video: Video
  }[]
}

interface StudyRoomProps {
  playlists: Playlist[]
}

export function StudyRoom({ playlists }: StudyRoomProps) {
  // Navigation & Selector States
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null)
  const [activeVideoIndex, setActiveVideoIndex] = useState<number>(0)
  
  // Study Timer States
  const [sessionActive, setSessionActive] = useState(false)
  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [testMode, setTestMode] = useState(false)
  
  // Health reminders overlay state
  const [overlayType, setOverlayType] = useState<ReminderType | null>(null)

  const activePlaylist = playlists.find(p => p.id === selectedPlaylistId)
  const activeVideo = activePlaylist?.videos[activeVideoIndex]?.video ?? null

  // Ref to track elapsed time to avoid losing it during state updates or cleanup
  const secondsElapsedRef = useRef(0)

  useEffect(() => {
    secondsElapsedRef.current = secondsElapsed
  }, [secondsElapsed])

  // Core Timer Effect
  useEffect(() => {
    if (!sessionActive || !isTimerRunning || overlayType !== null) return

    const timer = setInterval(() => {
      setSecondsElapsed((prev) => {
        const nextSeconds = prev + 1
        
        // Check Health Reminder thresholds and user preferences
        const eyeInterval = testMode ? 20 : 1200     // 20s or 20m
        const breakInterval = testMode ? 45 : 1500   // 45s or 25m
        const waterInterval = testMode ? 60 : 2700   // 60s or 45m

        const isWaterEnabled = typeof window !== "undefined" ? localStorage.getItem("reminders_water") !== "false" : true
        const isEyeEnabled = typeof window !== "undefined" ? localStorage.getItem("reminders_eye") !== "false" : true
        const isBreakEnabled = typeof window !== "undefined" ? localStorage.getItem("reminders_break") !== "false" : true

        if (isWaterEnabled && nextSeconds % waterInterval === 0) {
          setOverlayType("WATER")
          setIsTimerRunning(false)
        } else if (isBreakEnabled && nextSeconds % breakInterval === 0) {
          setOverlayType("BREAK")
          setIsTimerRunning(false)
        } else if (isEyeEnabled && nextSeconds % eyeInterval === 0) {
          setOverlayType("EYE")
          setIsTimerRunning(false)
        }

        return nextSeconds
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [sessionActive, isTimerRunning, overlayType, testMode])

  // Stop and log session helper
  const handleStopSession = async () => {
    const timeSpent = secondsElapsedRef.current
    if (timeSpent > 0) {
      toast.info("Logging focus session...")
      const res = await logStudySession(activeVideo?.id ?? null, timeSpent)
      if (res.success) {
        toast.success(`Focus logged! Spent ${Math.round(timeSpent / 60)} minutes studying. 🧠`)
      } else {
        toast.error("Failed to log focus session to database.")
      }
    }
    
    // Reset states
    setSessionActive(false)
    setIsTimerRunning(false)
    setSecondsElapsed(0)
    setOverlayType(null)
  }

  // Handle player state changes from YouTube IFrame
  const handlePlayerStateChange = (state: number) => {
    if (state === 1) { // PLAYING
      setIsTimerRunning(true)
    } else if (state === 2 || state === 0) { // PAUSED or ENDED
      setIsTimerRunning(false)
    }
  }

  // Format seconds to HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Start study handler
  const handleStartStudy = (playlistId: string | null) => {
    setSelectedPlaylistId(playlistId)
    setActiveVideoIndex(0)
    setSecondsElapsed(0)
    setSessionActive(true)
    setIsTimerRunning(playlistId === null) // Autoplay timer in standalone, syncs to player in video mode
  }

  // Handle overlay closings (and optionally water increments)
  const handleOverlayClose = () => {
    setOverlayType(null)
    // Resume studying automatically
    setIsTimerRunning(true)
  }

  // 1. CHOOSE STUDY ROUTE STATE
  if (!sessionActive) {
    return (
      <div className="space-y-8 animate-fade-in pb-12">
        {/* Banner */}
        <div className="p-6 sm:p-8 rounded-2xl border border-outline-variant/30 bg-primary-fixed/20 shadow-soft space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-primary tracking-tight font-heading">
            Start a Peaceful Study Session
          </h2>
          <p className="text-[13px] text-muted-foreground font-semibold leading-relaxed max-w-xl">
            Choose to study with one of your custom playlists to experience split-screen theater mode with active health reminders, or run a standalone Pomodoro timer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Standalone timer card */}
          <div className="rounded-2xl border border-outline-variant/15 bg-primary-fixed/25 p-6 shadow-soft hover-lift flex flex-col justify-between h-full min-h-[220px]">
            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Timer className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[15px] text-foreground tracking-tight font-heading">
                Standalone Timer
              </h3>
              <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                Study with physical textbooks or open browser tabs. We will provide full screen hydration and eye exercises.
              </p>
            </div>
            <Button
              onClick={() => handleStartStudy(null)}
              className="w-full h-10 bg-primary text-primary-foreground hover:opacity-90 transition-all rounded-full font-bold cursor-pointer shadow-sm text-xs active:scale-95 mt-4"
            >
              Start Standalone Focus
            </Button>
          </div>

          {/* Playlists grid selection */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-bold text-xs text-primary uppercase tracking-widest font-heading px-1">
              Study with Playlist
            </h3>
            {playlists.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-outline-variant bg-card p-10 text-center space-y-3">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground font-semibold">
                  You don't have any playlists yet.{" "}
                  <Link href="/playlists" className="text-secondary hover:underline">
                    Create a playlist
                  </Link>{" "}
                  to learn from YouTube.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {playlists.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-outline-variant/15 bg-surface-container-high p-5 shadow-soft hover-lift flex flex-col justify-between min-h-[160px]"
                  >
                    <div className="space-y-1 mb-4">
                      <h4 className="font-bold text-[14px] text-foreground line-clamp-1 font-heading">
                        {p.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground font-semibold">
                        {p.videos.length} videos inside
                      </p>
                    </div>
                    <Button
                      onClick={() => handleStartStudy(p.id)}
                      disabled={p.videos.length === 0}
                      className="w-full h-9 bg-secondary text-white hover:opacity-90 transition-all rounded-full font-bold cursor-pointer text-xs shadow-sm shadow-secondary/15 active:scale-95"
                    >
                      Study with Playlist &rarr;
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 2. ACTIVE STUDY STATE
  return (
    <div className="space-y-6 animate-fade-in relative pb-12">
      {/* Dynamic Health Reminders Overlay Modal */}
      {overlayType !== null && (
        <StudyOverlay
          type={overlayType}
          testMode={testMode}
          onClose={handleOverlayClose}
        />
      )}

      {/* Control panel header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-outline-variant/30 bg-surface-container shadow-soft">
        <div className="flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container/30 text-primary">
            <Timer className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-primary tracking-widest uppercase block font-heading">
              Current Session
            </span>
            <div className="text-2xl font-mono font-bold tracking-tight text-primary">
              {formatTime(secondsElapsed)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Test mode toggle */}
          <div className="flex items-center space-x-2 mr-2 border border-outline-variant/30 bg-surface rounded-full px-3.5 py-1 text-xs select-none">
            <Label htmlFor="test-mode" className="text-muted-foreground cursor-pointer font-bold font-heading">Test Reminders</Label>
            <input
              type="checkbox"
              id="test-mode"
              checked={testMode}
              onChange={(e) => setTestMode(e.target.checked)}
              className="h-4 w-4 accent-primary cursor-pointer"
            />
          </div>

          {/* Standalone timer play pause control */}
          {selectedPlaylistId === null && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="h-10 w-10 border-outline-variant/30 text-foreground hover:bg-surface-container-high rounded-full cursor-pointer active:scale-90 transition-all duration-200"
            >
              {isTimerRunning ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
            </Button>
          )}

          <Button
            onClick={handleStopSession}
            className="bg-primary text-primary-foreground hover:opacity-90 transition-all rounded-full font-bold cursor-pointer shadow-sm h-10 px-5 text-xs active:scale-95"
          >
            <Square className="mr-1.5 h-3.5 w-3.5 fill-current" />
            Finish Focus
          </Button>
        </div>
      </div>

      {/* 2A. PLAYLIST THEATER WATCH ROOM */}
      {selectedPlaylistId !== null && activeVideo !== null && activePlaylist && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-4">
            {/* Embedded Player */}
            <YouTubePlayer
              youtubeId={activeVideo.youtubeId}
              onStateChange={handlePlayerStateChange}
            />

            {/* Video metadata */}
            <div className="glass-card p-6 rounded-xl border border-outline-variant/15 shadow-soft">
              <h3 className="font-bold text-[15px] text-primary tracking-tight leading-snug font-heading">
                {activeVideo.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5 font-semibold">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                Playlist: {activePlaylist.title} ({activeVideoIndex + 1} of {activePlaylist.videos.length})
              </p>
            </div>
          </div>

          {/* Watch room Sidebar */}
          <div className="glass-card p-5 rounded-xl border border-outline-variant/15 shadow-soft flex flex-col h-[480px] lg:h-[540px] overflow-hidden space-y-4">
            <div className="space-y-0.5">
              <h3 className="font-bold text-[14px] text-primary tracking-tight font-heading">
                Up Next
              </h3>
              <p className="text-xs text-muted-foreground font-semibold">
                Click any video to switch lessons
              </p>
            </div>

            <div className="flex-grow overflow-y-auto space-y-2 pr-1">
              {activePlaylist.videos.map((pv, idx) => {
                const isCurrent = idx === activeVideoIndex
                return (
                  <button
                    key={pv.video.id}
                    onClick={() => {
                      setIsTimerRunning(false)
                      setActiveVideoIndex(idx)
                    }}
                    className={`w-full text-left flex items-center gap-3.5 p-3 rounded-full border transition-all duration-200 group relative hover:translate-x-1 ${
                      isCurrent
                        ? "bg-primary-container border-outline-variant/30 text-primary-foreground font-bold shadow-sm"
                        : "border-transparent hover:bg-surface-container-high/60"
                    }`}
                  >
                    <span className={`text-[10px] font-bold w-4 text-center shrink-0 ${
                      isCurrent ? "text-primary-foreground" : "text-muted-foreground"
                    }`}>
                      {isCurrent ? <Play className="h-3 w-3 fill-current mx-auto" /> : idx + 1}
                    </span>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className={`text-xs font-semibold line-clamp-1 leading-snug ${
                        isCurrent ? "text-primary-foreground" : "text-foreground group-hover:text-primary transition-colors"
                      }`}>
                        {pv.video.title}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2B. STANDALONE TIMER VIEW */}
      {selectedPlaylistId === null && (
        <div className="max-w-xl mx-auto py-12">
          <div className="glass-card p-10 rounded-2xl shadow-soft text-center space-y-8 relative overflow-hidden flex flex-col items-center border border-outline-variant/15">
            {/* Pulsing breathing focus background */}
            <div className={`absolute -z-10 h-64 w-64 rounded-full bg-primary-container/20 blur-3xl transition-all duration-1000 ${
              isTimerRunning ? "scale-110 opacity-70" : "scale-90 opacity-40"
            }`} />

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold tracking-tight text-primary font-heading">
                Mindful Study Space
              </h3>
              <p className="text-xs text-muted-foreground font-semibold max-w-sm mx-auto leading-relaxed">
                Take this time to read, sketch, or focus offline. Reminders will prompt you automatically when it's time to stretch or blink.
              </p>
            </div>

            <div className="text-6xl sm:text-7xl font-mono font-bold tracking-tight text-primary select-none my-4">
              {formatTime(secondsElapsed)}
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="h-12 px-6 bg-primary text-primary-foreground hover:opacity-90 transition-all rounded-full font-bold cursor-pointer shadow-sm text-xs active:scale-95"
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="mr-1.5 h-3.5 w-3.5 fill-current" />
                    Pause Timer
                  </>
                ) : (
                  <>
                    <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
                    Resume Timer
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleStopSession}
                className="h-12 px-6 border-outline-variant/30 text-foreground hover:bg-surface-container-high rounded-full font-bold text-xs active:scale-95"
              >
                <Square className="mr-1.5 h-3.5 w-3.5 text-destructive fill-destructive/10" />
                Stop Focus
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
