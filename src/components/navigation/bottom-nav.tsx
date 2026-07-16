"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Home, 
  PlaySquare, 
  Timer, 
  BarChart3, 
  Users 
} from "lucide-react"

const mobileNavItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Library", href: "/playlists", icon: PlaySquare },
  { name: "Focus", href: "/study", icon: Timer },
  { name: "Stats", href: "/analytics", icon: BarChart3 },
  { name: "Friends", href: "/friends", icon: Users },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-outline-variant/30 bg-surface/80 backdrop-blur-xl flex items-center justify-around px-3 pb-safe z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] transition-colors duration-300">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold transition-all duration-200 active:scale-90",
              isActive 
                ? "text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "px-4 py-1 rounded-full mb-0.5 transition-all duration-200 flex items-center justify-center",
              isActive ? "bg-primary-container" : "hover:bg-surface-container-high/50"
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <span>{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
