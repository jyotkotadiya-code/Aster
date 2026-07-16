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
    <aside className="hidden md:flex flex-col w-64 border-r border-outline-variant/30 bg-surface h-screen fixed left-0 top-0 p-6 z-20 transition-colors duration-300">
      {/* Brand Header */}
      <div className="flex items-center space-x-3 mb-8 px-2 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-heading text-lg font-bold text-primary leading-none">Aster</h2>
          <p className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase mt-0.5">Mindful Focus</p>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-grow space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3.5 px-4 py-3 rounded-full text-[14px] font-semibold transition-all duration-200 group relative hover:translate-x-1",
                isActive
                  ? "bg-primary-container text-primary-foreground font-bold shadow-sm"
                  : "text-muted-foreground hover:bg-surface-container-high hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-transform duration-200 group-hover:scale-105",
                isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
              )} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer Text */}
      <div className="pt-4 border-t border-outline-variant/30 px-2 mt-auto">
        <p className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">
          Aster v1.0.0 — Mindful Learning
        </p>
      </div>
    </aside>
  )
}
