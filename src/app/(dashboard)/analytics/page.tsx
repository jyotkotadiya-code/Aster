import * as React from "react"
import { getOrCreateProfile } from "@/lib/auth"
import db from "@/lib/db"
import { WeeklyChart } from "@/components/analytics/weekly-chart"
import { StatCard } from "@/components/dashboard/stat-card"
import { 
  Hourglass, 
  Calendar, 
  Droplet, 
  Brain, 
  Eye, 
  Smile, 
  Zap, 
  Heart,
  Video
} from "lucide-react"

function formatMinutes(mins: number) {
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  const remainingMins = mins % 60
  return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`
}

export default async function AnalyticsPage() {
  const profile = await getOrCreateProfile()

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  // 1. Fetch sessions for totals
  const sessions = await db.studySession.findMany({
    where: { userId: profile.id },
    include: {
      video: true,
    },
    orderBy: { startedAt: "desc" },
  })

  const totalFocusSeconds = sessions.reduce((acc, s) => acc + s.duration, 0)
  const totalFocusMinutes = Math.round(totalFocusSeconds / 60)
  const sessionCount = sessions.length

  // Calculate unique days with entries in progress logs to get average focus
  const uniqueProgressDays = await db.userProgress.count({
    where: { userId: profile.id },
  })
  const daysCount = uniqueProgressDays > 0 ? uniqueProgressDays : 1
  const dailyAverageMinutes = Math.round(totalFocusMinutes / daysCount)

  // 2. Fetch last 7 days of focus and hydration progress
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const last7DaysData = []
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(today.getDate() - i)
    date.setHours(0, 0, 0, 0)

    const progress = await db.userProgress.findUnique({
      where: {
        userId_date: {
          userId: profile.id,
          date,
        },
      },
    })

    const label = date.toLocaleDateString("en-US", { weekday: "short" })
    const minutes = progress ? Math.round(progress.focusTimeSec / 60) : 0
    const water = progress ? progress.waterIntakeMl : 0

    last7DaysData.push({ label, minutes, water })
  }

  // 3. Fetch reminder trigger statistics from database
  const reminders = await db.reminderLog.groupBy({
    by: ["type"],
    where: { userId: profile.id },
    _count: {
      id: true,
    },
  })

  const eyeExercisesCount = reminders.find((r) => r.type === "EYE")?._count.id ?? 0
  const breaksCount = reminders.find((r) => r.type === "BREAK")?._count.id ?? 0
  const waterRemindersCount = reminders.find((r) => r.type === "WATER")?._count.id ?? 0

  const recentSessions = sessions.slice(0, 5)

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="space-y-0.5">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary font-heading">
          Analytics & Progress
        </h2>
        <p className="text-[13px] text-muted-foreground font-semibold leading-relaxed">
          Understand your mindful study habits and focus logs
        </p>
      </div>

      {/* Metric Totals Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Study Time"
          value={formatMinutes(totalFocusMinutes)}
          icon={Hourglass}
          subtext="Cumulative learning focus"
          bgClass="bg-primary-fixed/25"
          iconColorClass="text-primary bg-primary-fixed-dim/40"
        />
        <StatCard
          title="Daily Average"
          value={`${dailyAverageMinutes}m`}
          icon={Calendar}
          subtext="Focus minutes per study day"
          bgClass="bg-secondary-fixed/25"
          iconColorClass="text-secondary bg-secondary-fixed-dim/40"
        />
        <StatCard
          title="Focus Sessions"
          value={sessionCount}
          icon={Brain}
          subtext="Mindful timers completed"
          bgClass="bg-tertiary-fixed/25"
          iconColorClass="text-tertiary bg-tertiary-fixed-dim/40"
        />
        <StatCard
          title="Hydration Logs"
          value={`${waterRemindersCount} logs`}
          icon={Droplet}
          subtext="Today's water checkpoints"
          bgClass="bg-surface-container-high"
          iconColorClass="text-muted-foreground bg-surface-container-highest"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Weekly SVG Bar Graph */}
        <div className="lg:col-span-2">
          <WeeklyChart data={last7DaysData} />
        </div>

        {/* Health Reminders Summary Widget */}
        <div className="glass-card p-6 rounded-2xl shadow-soft border border-outline-variant/15 space-y-6">
          <div className="space-y-0.5">
            <h3 className="font-bold text-[14px] text-primary tracking-tight flex items-center font-heading">
              <Heart className="mr-1.5 h-4 w-4 text-primary animate-pulse" />
              Mindful Habits Log
            </h3>
            <p className="text-[11px] text-muted-foreground font-semibold">
              Total actions completed during study sessions
            </p>
          </div>

          <div className="space-y-4">
            {/* Eye Exercise card */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-outline-variant/15 bg-surface-container-low">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-primary-container/30 text-primary flex items-center justify-center shadow-sm">
                  <Eye className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground font-heading">Eye Exercises</h4>
                  <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">20-20-20 screen relief</p>
                </div>
              </div>
              <span className="text-xs font-bold text-primary bg-primary-container/40 border border-outline-variant/20 px-2.5 py-0.5 rounded-full font-heading">
                {eyeExercisesCount}
              </span>
            </div>

            {/* Breaks Taken card */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-outline-variant/15 bg-surface-container-low">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-primary-container/30 text-primary flex items-center justify-center shadow-sm">
                  <Smile className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground font-heading">Mindful Breaks</h4>
                  <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">Breathing & stretching</p>
                </div>
              </div>
              <span className="text-xs font-bold text-primary bg-primary-container/40 border border-outline-variant/20 px-2.5 py-0.5 rounded-full font-heading">
                {breaksCount}
              </span>
            </div>

            {/* Water intakes card */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-outline-variant/15 bg-surface-container-low">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-secondary-container/30 text-secondary flex items-center justify-center shadow-sm">
                  <Droplet className="h-4.5 w-4.5 fill-current" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground font-heading">Water Glasses</h4>
                  <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">+250ml hydration logs</p>
                </div>
              </div>
              <span className="text-xs font-bold text-secondary bg-secondary-container/45 border border-outline-variant/20 px-2.5 py-0.5 rounded-full font-heading">
                {waterRemindersCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sessions Table */}
      <div className="glass-card p-6 rounded-2xl shadow-soft border border-outline-variant/15 space-y-4">
        <div className="space-y-0.5">
          <h3 className="font-bold text-[14px] text-primary tracking-tight flex items-center font-heading">
            <Zap className="mr-1.5 h-4 w-4 text-primary" />
            Recent Sessions
          </h3>
          <p className="text-[11px] text-muted-foreground font-semibold">
            Your latest 5 study session durations
          </p>
        </div>

        {recentSessions.length === 0 ? (
          <div className="text-center py-10 text-xs font-semibold text-muted-foreground border border-dashed border-outline-variant/30 rounded-xl bg-surface-container-low">
            No study sessions logged yet. Head to the Study Room to start!
          </div>
        ) : (
          <div className="overflow-hidden border border-outline-variant/15 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container/60 border-b border-outline-variant/20 text-xs font-bold text-primary">
                  <th className="p-3.5">Started At</th>
                  <th className="p-3.5">Study Focus</th>
                  <th className="p-3.5 text-center">Duration</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15 font-semibold">
                {recentSessions.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-container-high/30 transition-colors">
                    <td className="p-3.5 text-muted-foreground">
                      {s.startedAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-3.5 font-bold text-foreground font-heading">
                      {s.video ? (
                        <span className="flex items-center gap-1.5 line-clamp-1">
                          <Video className="h-3.5 w-3.5 text-primary shrink-0" />
                          {s.video.title}
                        </span>
                      ) : (
                        "Standalone Pomodoro Study"
                      )}
                    </td>
                    <td className="p-3.5 text-center text-muted-foreground">
                      {Math.round(s.duration / 60)} mins
                    </td>
                    <td className="p-3.5 text-right">
                      <span className="inline-flex items-center rounded-full bg-primary-container/40 border border-outline-variant/20 px-2.5 py-0.5 text-[10px] font-bold text-primary font-heading">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
