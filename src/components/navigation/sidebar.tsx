"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Sparkles, 
  Home, 
  PlaySquare, 
  Timer, 
  BarChart3, 
  Users, 
  Settings 
} from "lucide-react"

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Playlists", href: "/playlists", icon: PlaySquare },
  { name: "Study Session", href: "/study", icon: Timer },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Friends", href: "/friends", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card h-screen fixed left-0 top-0 p-6 z-20">
      {/* Brand Header */}
      <div className="flex items-center space-x-2.5 mb-8 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <span className="font-semibold text-lg tracking-tight text-foreground">
          Aster
        </span>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-md bg-primary" />
              )}
              <Icon className={cn(
                "h-5 w-5 transition-transform duration-200 group-hover:scale-105",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer Text */}
      <div className="pt-4 border-t border-border px-2">
        <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
          Aster v1.0.0
        </p>
      </div>
    </aside>
  )
}
