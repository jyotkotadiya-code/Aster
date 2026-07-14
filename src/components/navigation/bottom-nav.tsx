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
  { name: "Playlists", href: "/playlists", icon: PlaySquare },
  { name: "Study", href: "/study", icon: Timer },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Friends", href: "/friends", icon: Users },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-border bg-card/95 backdrop-blur-md flex items-center justify-around px-2 pb-safe z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-all duration-200",
              isActive 
                ? "text-primary font-semibold" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "p-1.5 rounded-lg mb-0.5 transition-all duration-200",
              isActive ? "bg-primary/10" : ""
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
