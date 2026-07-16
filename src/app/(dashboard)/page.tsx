import * as React from "react"
import { getOrCreateProfile } from "@/lib/auth"
import db from "@/lib/db"
import { StatCard } from "@/components/dashboard/stat-card"
import { WaterTracker } from "@/components/dashboard/water-tracker"
import { FocusProgress } from "@/components/dashboard/focus-progress"
import { 
  PlaySquare, 
  Timer, 
  Users, 
  Eye, 
  Calendar,
  Sparkles,
  ArrowRight,
  Play
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const profile = await getOrCreateProfile()

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0)

  // Fetch real-time metrics from the database
  const [playlistCount, sessionCount, friendCount, todaySessionSum, todayProgress] = await Promise.all([
    db.playlist.count({
      where: { creatorId: profile.id },
    }),
    db.studySession.count({
      where: { userId: profile.id },
    }),
    db.friendship.count({
      where: {
        OR: [
          { userId: profile.id },
          { friendId: profile.id },
        ],
        status: "ACCEPTED",
      },
    }),
    db.studySession.aggregate({
      _sum: {
        duration: true,
      },
      where: {
        userId: profile.id,
        startedAt: {
          gte: todayDate,
        },
      },
    }),
    db.userProgress.findUnique({
      where: {
        userId_date: {
          userId: profile.id,
          date: todayDate,
        },
      },
    }),
  ])

  const todayWaterMl = todayProgress?.waterIntakeMl ?? 0
  const todayFocusMinutes = todayProgress 
    ? Math.round(todayProgress.focusTimeSec / 60)
    : Math.round((todaySessionSum._sum.duration ?? 0) / 60)
  const dailyFocusGoalMinutes = Math.round(profile.dailyFocusGoalSec / 60)

  // Peaceful quotes for students
  const quotes = [
    "Focus is a muscle, and you are building it right now.",
    "Quiet progress is still progress. Enjoy the silence.",
    "Your mind is like water. When it's calm, everything becomes clear.",
    "One video at a time, one breath at a time. Study mindfully.",
    "Learning is a journey. Take breaks, drink water, stay healthy.",
  ]
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]

  // Get current hour for custom greeting
  const hour = new Date().getHours()
  let greeting = "Good morning"
  if (hour >= 12 && hour < 17) greeting = "Good afternoon"
  if (hour >= 17) greeting = "Good evening"

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Header Greeting & Quote */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 sm:p-8 rounded-2xl border border-outline-variant/30 bg-primary-fixed/20 relative overflow-hidden shadow-soft">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 h-48 w-48 rounded-full bg-primary-fixed/10 blur-2xl -z-10 animate-pulse" />
        <div className="space-y-1.5 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary flex items-center gap-2 font-heading">
            {greeting}, {profile.name}! <Sparkles className="h-5 w-5 text-primary fill-primary/10 animate-pulse" />
          </h2>
          <p className="text-[13px] text-muted-foreground font-semibold italic max-w-xl leading-relaxed">
            &ldquo;{randomQuote}&rdquo;
          </p>
        </div>
        <div className="flex items-center">
          <Link href="/study">
            <Button className="bg-primary text-primary-foreground hover:opacity-90 transition-all rounded-full font-bold cursor-pointer shadow-sm px-6 h-10 active:scale-95 text-xs">
              <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
              Focus Now
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Playlists"
          value={playlistCount}
          icon={PlaySquare}
          subtext="Saved YouTube playlists"
          bgClass="bg-primary-fixed/25"
          iconColorClass="text-primary bg-primary-fixed-dim/40"
        />
        <StatCard
          title="Total Sessions"
          value={sessionCount}
          icon={Timer}
          subtext="Completed focus sessions"
          bgClass="bg-secondary-fixed/25"
          iconColorClass="text-secondary bg-secondary-fixed-dim/40"
        />
        <StatCard
          title="Focus Today"
          value={`${todayFocusMinutes}m`}
          icon={Calendar}
          subtext={`Goal: ${dailyFocusGoalMinutes}m`}
          bgClass="bg-tertiary-fixed/25"
          iconColorClass="text-tertiary bg-tertiary-fixed-dim/40"
        />
        <StatCard
          title="Collaborators"
          value={friendCount}
          icon={Users}
          subtext="Connected friends"
          bgClass="bg-surface-container-high"
          iconColorClass="text-muted-foreground bg-surface-container-highest"
        />
      </div>

      {/* 3. Interactive Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Focus Goal Card */}
        <div className="h-full">
          <FocusProgress 
            todayFocusMinutes={todayFocusMinutes} 
            dailyGoalMinutes={dailyFocusGoalMinutes} 
          />
        </div>

        {/* Water Tracker Card */}
        <div className="h-full">
          <WaterTracker 
            initialWaterMl={todayWaterMl}
            dailyGoalMl={profile.dailyWaterGoalMl} 
          />
        </div>

        {/* Eye Strain Reminder Widget */}
        <div className="glass-card p-6 rounded-2xl shadow-soft hover:shadow-medium hover-lift transition-all duration-300 flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-primary uppercase tracking-widest block font-heading">
                Eye Care
              </span>
              <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                Screen fatigue relief
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-primary bg-primary-container/30">
              <Eye className="h-4 w-4" />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
              Studying from screens for long periods causes strain. Relax your eyes with our guided 20-20-20 rule eye exercise widget.
            </p>
            <div className="rounded-xl bg-surface-container p-2.5 text-center text-xs font-bold text-foreground border border-outline-variant/20">
              Next exercise due in: <span className="font-bold text-primary font-heading">15m</span>
            </div>
          </div>

          <div>
            <Link href="/study">
              <Button
                variant="outline"
                className="w-full border-outline-variant/30 text-foreground hover:bg-surface-container-high rounded-full font-bold cursor-pointer h-9 text-xs active:scale-95"
              >
                Start Eye Care
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
