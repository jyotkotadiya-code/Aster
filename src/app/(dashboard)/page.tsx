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
    <div className="space-y-8 animate-fade-in">
      {/* 1. Header Greeting & Quote */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 sm:p-8 rounded-2xl border border-primary/10 bg-primary/5 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 h-48 w-48 rounded-full bg-primary/5 blur-2xl -z-10" />
        <div className="space-y-1.5 flex-1">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            {greeting}, {profile.name}! <Sparkles className="h-5 w-5 text-primary fill-primary/10 animate-pulse" />
          </h2>
          <p className="text-sm text-muted-foreground font-medium italic max-w-xl">
            &ldquo;{randomQuote}&rdquo;
          </p>
        </div>
        <div className="flex items-center">
          <Link href="/study">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/95 transition-all rounded-md font-medium cursor-pointer shadow-soft">
              <Play className="mr-1.5 h-4 w-4 fill-current" />
              Study Now
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
        />
        <StatCard
          title="Total Sessions"
          value={sessionCount}
          icon={Timer}
          subtext="Completed focus sessions"
          iconColorClass="text-primary bg-primary/10"
        />
        <StatCard
          title="Focus Today"
          value={`${todayFocusMinutes}m`}
          icon={Calendar}
          subtext={`Goal: ${dailyFocusGoalMinutes}m`}
          iconColorClass="text-primary bg-primary/10"
        />
        <StatCard
          title="Friends"
          value={friendCount}
          icon={Users}
          subtext="Collaborators connected"
          iconColorClass="text-secondary bg-secondary/10"
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

        {/* Eye Strain Reminder Widget (Mockup for Phase 3) */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft hover:shadow-medium transition-all duration-200 flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                Eye Exercise
              </span>
              <p className="text-sm font-medium text-foreground">
                Screen fatigue relief
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-primary bg-primary/10">
              <Eye className="h-4 w-4" />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Studying from screens for long periods causes strain. Relax your eyes with our guided 20-20-20 rule eye exercise widget.
            </p>
            <div className="rounded-lg bg-muted p-2.5 text-center text-xs font-medium text-foreground border border-border">
              Next exercise due in: <span className="font-semibold text-primary">15m</span>
            </div>
          </div>

          <div>
            <Link href="/study">
              <Button
                variant="outline"
                className="w-full border-border text-foreground hover:bg-muted/50 rounded-md font-medium cursor-pointer h-9 text-xs"
              >
                Start Eye Care
                <ArrowRight className="ml-1.5 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
