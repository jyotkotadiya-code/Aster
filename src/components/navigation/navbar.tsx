"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { logout } from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Sun, 
  Moon, 
  LogOut, 
  User as UserIcon, 
  Settings, 
  Play
} from "lucide-react"
import Link from "next/link"

interface NavbarProps {
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
}

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/playlists": "My Playlists",
  "/study": "Study Session",
  "/analytics": "Study Analytics",
  "/friends": "Friends Collaboration",
  "/settings": "Settings",
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const title = pageTitles[pathname] ?? "Aster"

  const userInitials = user.name
    ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : user.email.slice(0, 2).toUpperCase()

  // 4-state smart toggle (keeps active palette: bloom or drift)
  const isDark = theme?.endsWith("-dark")
  const activePalette = theme?.split("-")[0] ?? "bloom"
  const toggleTheme = () => {
    setTheme(isDark ? `${activePalette}-light` : `${activePalette}-dark`)
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-outline-variant/30 bg-background/80 backdrop-blur-xl px-6 transition-all duration-300">
      {/* Title / Current Page Name */}
      <div>
        <h1 className="text-[16px] font-bold text-primary tracking-tight font-heading">
          {title}
        </h1>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-4">
        {/* Quick Start Study Button */}
        {pathname !== "/study" && (
          <Link href="/study">
            <Button size="sm" className="hidden sm:flex bg-primary text-primary-foreground hover:opacity-90 transition-all rounded-full font-semibold cursor-pointer h-9 px-4 shadow-sm active:scale-95">
              <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
              Start Focus
            </Button>
          </Link>
        )}

        {/* Theme Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-surface-container-high rounded-full cursor-pointer transition-all duration-200"
        >
          {isDark ? (
            <Sun className="h-[1.1rem] w-[1.1rem]" />
          ) : (
            <Moon className="h-[1.1rem] w-[1.1rem]" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* User Profile Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-9 w-9 rounded-full bg-secondary-container flex items-center justify-center cursor-pointer select-none hover:opacity-90 transition-opacity border border-outline-variant/30">
            <span className="text-[12px] font-bold text-on-secondary-container">
              {userInitials}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mt-2 border border-outline-variant/30 bg-card shadow-medium rounded-[16px]" align="end">
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold leading-none text-foreground">
                  {user.name ?? "Student"}
                </p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-outline-variant/20" />
            <DropdownMenuItem className="p-2.5 cursor-pointer focus:bg-surface-container-high rounded-lg font-semibold text-sm">
              <Link href="/settings" className="flex w-full items-center">
                <Settings className="mr-2.5 h-4 w-4 text-muted-foreground" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-outline-variant/20" />
            <DropdownMenuItem 
              onClick={async () => {
                await logout()
              }}
              className="p-2.5 text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive rounded-lg font-semibold text-sm"
            >
              <LogOut className="mr-2.5 h-4 w-4" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
