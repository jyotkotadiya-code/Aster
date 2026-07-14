import * as React from "react"
import { redirect } from "next/navigation"
import { getOrCreateProfile } from "@/lib/auth"
import { Sidebar } from "@/components/navigation/sidebar"
import { Navbar } from "@/components/navigation/navbar"
import { BottomNav } from "@/components/navigation/bottom-nav"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const profile = await getOrCreateProfile()

  if (!profile) {
    redirect("/login")
  }

  // Map Prisma user type to serializable format for Client Component Navbar
  const serializedUser = {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatarUrl: profile.avatarUrl,
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Desktop Sidebar (fixed left) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 md:pl-64 min-h-screen">
        {/* Top Navbar */}
        <Navbar user={serializedUser} />

        {/* Dynamic Page Views */}
        <div className="flex-1 p-6 pb-24 md:pb-6 overflow-y-auto max-w-[1280px] w-full mx-auto">
          {children}
        </div>
      </div>

      {/* Mobile Bottom Navigation (fixed bottom) */}
      <BottomNav />
    </div>
  )
}
