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
  Sparkles,
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

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/85 backdrop-blur-md px-6">
      {/* Title / Current Page Name */}
      <div>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-4">
        {/* Quick Start Study Button */}
        {pathname !== "/study" && (
          <Link href="/study">
            <Button size="sm" className="hidden sm:flex bg-primary text-primary-foreground hover:bg-primary/95 transition-all rounded-md font-medium cursor-pointer h-9 px-4">
              <Play className="mr-1.5 h-4 w-4 fill-current" />
              Start Study
            </Button>
          </Link>
        )}

        {/* Theme Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* User Profile Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center cursor-pointer select-none hover:bg-primary/20 transition-colors">
            <span className="text-xs font-semibold text-primary">
              {userInitials}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mt-1 border border-border bg-card shadow-medium rounded-lg" align="end">
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-foreground">
                  {user.name ?? "Student"}
                </p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="p-2 cursor-pointer focus:bg-muted/50 rounded-md">
              <Link href="/settings" className="flex w-full items-center">
                <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem 
              onClick={async () => {
                await logout()
              }}
              className="p-2 text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive rounded-md"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
